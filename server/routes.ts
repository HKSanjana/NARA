import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { stations, measurementTypes, measurements } from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import type { StationSummary, Measurement, MeasurementType, Station } from "@shared/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
// Added for data processing API
import fsSync from "fs";
// Proxy functionality now uses native fetch (Vercel serverless compatible)

// Define data directory path
export const DATA_DIR = path.join(process.cwd(), "client/src/data");


// Rate limiting storage for proxy
interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimit>();
const RATE_LIMIT = 100; // requests per period
const RATE_PERIOD = 60 * 60 * 1000; // 1 hour in milliseconds

// Blacklist/Whitelist for security
const BLOCKED_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0"];

const isBlockedDomain = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return BLOCKED_DOMAINS.some((blocked) =>
      parsedUrl.hostname.includes(blocked),
    );
  } catch {
    return true;
  }
};

// Rate limiting middleware for proxy
const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin || req.ip || "unknown";
  const now = Date.now();

  let rateData = rateLimitMap.get(origin);

  if (!rateData || now > rateData.resetTime) {
    rateData = { count: 0, resetTime: now + RATE_PERIOD };
    rateLimitMap.set(origin, rateData);
  }

  rateData.count++;

  if (rateData.count > RATE_LIMIT) {
    res.status(429).json({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Max ${RATE_LIMIT} requests per hour.`,
      retryAfter: Math.ceil((rateData.resetTime - now) / 1000),
    });
    return;
  }

  next();
};

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, RATE_PERIOD);

// JWT middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// File upload configuration
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Create data directory if it doesn't exist (only if not on Vercel)
  if (!process.env.VERCEL) {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn("Could not create DATA_DIR, skipping filesystem features:", e);
    }
  }


  // Proxy health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Integrated Server with Proxy"
    });
  });

  // Proxy endpoint with query parameter (fetch-based, Vercel serverless compatible)
  app.get("/proxy", rateLimiter, async (req: Request, res: Response) => {
    const targetUrl = req.query.url as string;

    if (!targetUrl) {
      return res.status(400).json({
        error: "Bad Request",
        message: 'Missing "url" query parameter. Usage: /proxy?url=<target-url>',
      });
    }

    let parsedUrl: URL;
    // Validate URL
    try {
      parsedUrl = new URL(targetUrl);

      // Security: Block internal/private URLs
      if (isBlockedDomain(targetUrl)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Cannot proxy requests to internal/private URLs",
        });
      }

      // Only allow http and https protocols
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Only HTTP and HTTPS protocols are supported",
        });
      }
    } catch (error) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid URL provided",
      });
    }

    try {
      // Use native fetch to proxy the request (serverless compatible)
      const proxyResponse = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Integrated-Server-Proxy/1.0",
        },
      });

      // Set response headers
      res.set("x-proxied-by", "integrated-server-proxy");
      res.set("x-request-url", targetUrl);
      res.set("access-control-allow-origin", "*");
      res.set("access-control-expose-headers", "*");

      // Forward content type
      const contentType = proxyResponse.headers.get("content-type");
      if (contentType) {
        res.set("content-type", contentType);
      }

      // Forward status and body
      const body = await proxyResponse.text();
      res.status(proxyResponse.status).send(body);
    } catch (err: any) {
      console.error("Proxy error:", err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: "Bad Gateway",
          message: "Failed to proxy request",
          details: err.message,
        });
      }
    }
  });

  app.post("/api/data", async (req, res) => {
    try {
      const data = req.body;
      let logMessage = `Data received at ${new Date().toISOString()}:\n`;

      if (Array.isArray(data)) {
        data.forEach((entry) => {
          logMessage += `  - Location: ${entry.location ?? "N/A"}, Parameter Type: ${entry.parameter_type ?? "N/A"}, Status: ${entry.status ?? "N/A"}\n`;
          logMessage += `    Raw Data: ${JSON.stringify(entry)}\n`;
        });
      } else {
        logMessage += `  - Raw JSON: ${JSON.stringify(data)}\n`;
      }

      // Write log (skip or catch on Vercel)
      if (!process.env.VERCEL) {
        try {
          await fs.appendFile(path.join(DATA_DIR, "data_log.txt"), logMessage);
          await fs.writeFile(path.join(DATA_DIR, "received_data.json"), JSON.stringify(data, null, 2));
        } catch (e) {
          console.warn("Filesystem write failed:", e);
        }
      }

      // New processing logic: Create Cartesian product of parameter types and locations
      interface DataEntry {
        parameter_type?: string;
        location?: string;
        status?: string;
        [key: string]: any;
      }

      const parameterTypes: string[] = Array.from(new Set(data.map((entry: DataEntry) => entry.parameter_type).filter(Boolean)));
      interface DataItem {
        parameter_type?: string;
        location?: string;
        status?: string;
        [key: string]: any;
      }

      const locations: string[] = Array.from(new Set(data.map((entry: DataItem) => entry.location).filter(Boolean)));

      const generatedFiles = [];
      let totalProcessedEntries = 0;

      for (const paramType of parameterTypes) {
        for (const location of locations) {
          interface DataEntry {
            parameter_type?: string;
            location?: string;
            status?: string;
            [key: string]: any;
          }

          const filteredData: DataEntry[] = data.filter((entry: DataEntry) =>
            entry.parameter_type === paramType && entry.location === location
          );
          if (filteredData.length > 0) {
            const filename = `${paramType}_${location}.json`;

            // File write (skip or catch on Vercel)
            if (!process.env.VERCEL) {
              try {
                await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(filteredData, null, 2));
                generatedFiles.push(filename);
              } catch (e) {
                console.warn(`Could not write ${filename}:`, e);
              }
            } else {
              generatedFiles.push(`${filename} (simulated)`);
            }
            totalProcessedEntries += filteredData.length;
          }
        }
      }

      res.status(200).json({
        success: true,
        message: "Data received and processed successfully",
        timestamp: new Date().toISOString(),
        data_count: Array.isArray(data) ? data.length : 1,
        generated_files: generatedFiles,
        total_processed_entries: totalProcessedEntries,
      });
    } catch (error: any) {
      console.error('Process data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process data',
        error: error.message
      });
    }
  });

  // ==================== PostgreSQL API Endpoints ====================

  // Dashboard endpoint - Get latest readings for all stations (Optimized)
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      // Step 1: Get all stations
      const allStations = await storage.getAllStations();
      const mTypes = await storage.getAllMeasurementTypes();

      // Step 2: Use a single query to get the latest measurement for EVERY station and type
      // Using DISTINCT ON is the most efficient way in PostgreSQL to get the "latest" row per group
      const latestMeasurements = await db.execute(sql`
        SELECT DISTINCT ON (station_id, measurement_type_id)
          station_id, measurement_type_id, value, measurement_ts
        FROM ${measurements}
        ORDER BY station_id, measurement_type_id, measurement_ts DESC
      `);

      const measurementsByStation: Record<string, any[]> = {};
      (latestMeasurements.rows as any[]).forEach(m => {
        if (!measurementsByStation[m.station_id]) {
          measurementsByStation[m.station_id] = [];
        }
        measurementsByStation[m.station_id].push(m);
      });

      const dashboardData = allStations.map(station => {
        const stationMeasurements = measurementsByStation[station.stationId] || [];
        const summary: any = {
          station_id: station.stationId,
          name: station.name,
          latitude: station.latitude ? parseFloat(station.latitude.toString()) : null,
          longitude: station.longitude ? parseFloat(station.longitude.toString()) : null,
          latest_ts: stationMeasurements.length > 0 ?
            new Date(Math.max(...stationMeasurements.map(m => new Date(m.measurement_ts).getTime()))).toISOString() : null,
        };

        // Map parameter codes to values
        mTypes.forEach(mt => {
          const match = stationMeasurements.find(m => m.measurement_type_id === mt.measurementTypeId);
          if (match) {
            summary[mt.code] = match.value;
          }
        });

        return summary;
      });

      res.json(dashboardData);
    } catch (error: any) {
      console.error('Dashboard API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Divisions endpoint
  app.get("/api/divisions", async (req: Request, res: Response) => {
    try {
      const allDivisions = await storage.getAllDivisions();
      res.json(allDivisions);
    } catch (error: any) {
      console.error('Divisions API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Calendar events endpoint
  app.get("/api/calendar/events/:year/:month", async (req: Request, res: Response) => {
    try {
      const { year, month } = req.params;
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      const events = await storage.getCalendarEvents(startDate, endDate);
      res.json(events);
    } catch (error: any) {
      console.error('Calendar API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Documents endpoint
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const { category, divisionId } = req.query;
      let documents;

      if (category) {
        documents = await storage.getDocumentsByCategory(category as string);
      } else if (divisionId) {
        documents = await storage.getDocumentsByDivision(divisionId as string);
      } else {
        documents = await storage.getAllDocuments();
      }

      res.json(documents);
    } catch (error: any) {
      console.error('Documents API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // RTI Requests endpoint (Public POST, Admin GET)
  app.get("/api/rti/requests", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      const requests = await storage.getAllRtiRequests();
      res.json(requests);
    } catch (error: any) {
      console.error('RTI Requests API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  app.post("/api/rti/requests", async (req: Request, res: Response) => {
    try {
      const newRequest = await storage.createRtiRequest(req.body);
      res.status(201).json(newRequest);
    } catch (error: any) {
      console.error('Create RTI Request error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Stations endpoint - Get all stations
  app.get("/api/stations", async (req: Request, res: Response) => {
    try {
      const allStations = await storage.getAllStations();
      res.json(allStations);
    } catch (error: any) {
      console.error('Stations API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Measurement types endpoint
  app.get("/api/measurement-types", async (req: Request, res: Response) => {
    try {
      const types = await storage.getAllMeasurementTypes();
      res.json(types);
    } catch (error: any) {
      console.error('Measurement types API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Measurements by station endpoint
  app.get("/api/measurements/:stationId", async (req: Request, res: Response) => {
    try {
      const { stationId } = req.params;

      if (!stationId) {
        return res.status(400).json({ error: 'Station ID required' });
      }

      const results = await db.select({
        measurement_ts: measurements.measurementTs,
        value: measurements.value,
        code: measurementTypes.code,
        unit: measurementTypes.unit
      })
        .from(measurements)
        .innerJoin(measurementTypes, eq(measurements.measurementTypeId, measurementTypes.measurementTypeId))
        .where(eq(measurements.stationId, stationId))
        .orderBy(desc(measurements.measurementTs))
        .limit(500);

      res.json(results);
    } catch (error: any) {
      console.error('Measurements API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Time-series data endpoint
  app.get("/api/measurements/series", async (req: Request, res: Response) => {
    try {
      const { stationId, measurementTypeCode, startDate, endDate } = req.query;

      if (!stationId || !measurementTypeCode || !startDate || !endDate) {
        return res.status(400).json({
          error: 'Missing required parameters: stationId, measurementTypeCode, startDate, endDate'
        });
      }

      const results = await db.select({
        measurement_ts: measurements.measurementTs,
        value: measurements.value,
        quality_flag: measurements.qualityFlag
      })
        .from(measurements)
        .innerJoin(measurementTypes, eq(measurements.measurementTypeId, measurementTypes.measurementTypeId))
        .where(and(
          eq(measurements.stationId, stationId as string),
          eq(measurementTypes.code, measurementTypeCode as string),
          gte(measurements.measurementTs, new Date(startDate as string)),
          lte(measurements.measurementTs, new Date(endDate as string))
        ))
        .orderBy(measurements.measurementTs);

      res.json(results);
    } catch (error: any) {
      console.error('Time-series API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Daily average endpoint
  app.get("/api/measurements/daily-average", async (req: Request, res: Response) => {
    try {
      const { stationId, measurementTypeCode, date } = req.query;

      if (!stationId || !measurementTypeCode || !date) {
        return res.status(400).json({
          error: 'Missing required parameters: stationId, measurementTypeCode, date'
        });
      }

      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      const [result] = await db.select({
        dailyAverage: sql`AVG(${measurements.value})`.mapWith(Number)
      })
        .from(measurements)
        .innerJoin(measurementTypes, eq(measurements.measurementTypeId, measurementTypes.measurementTypeId))
        .where(and(
          eq(measurements.stationId, stationId as string),
          eq(measurementTypes.code, measurementTypeCode as string),
          gte(measurements.measurementTs, targetDate),
          lte(measurements.measurementTs, nextDay)
        ));

      res.json(result || { dailyAverage: null });
    } catch (error: any) {
      console.error('Daily average API error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // ==================== End PostgreSQL API Endpoints ====================


  const httpServer = createServer(app);
  return httpServer;
}