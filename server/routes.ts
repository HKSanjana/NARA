import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { insertUserSchema, insertCalendarEventSchema, insertDocumentSchema, insertRtiRequestSchema, insertContactMessageSchema } from "@shared/schema";
// Added for data processing API
import fsSync from "fs";
// Added for proxy functionality
import { createProxyMiddleware, Options } from "http-proxy-middleware";

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

  // Create data directory if it doesn't exist
  await fs.mkdir(DATA_DIR, { recursive: true });
  

  // Proxy health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "Integrated Server with Proxy"
    });
  });

  // Proxy endpoint with query parameter
  app.use(
    "/proxy",
    rateLimiter,
    (req: Request, res: Response, next: NextFunction) => {
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

      // Create proxy options
      const proxyOptions: Options = {
        // 👇 **CHANGE 1**: Target is now just the origin of the parsed URL.
        target: parsedUrl.origin,
        changeOrigin: true,
        // 👇 **CHANGE 2**: PathRewrite now replaces the request path with the path and query from the target URL.
        pathRewrite: (path: string, req: any) => {
          return parsedUrl.pathname + parsedUrl.search;
        },
        onProxyReq: (proxyReq: any, req: any) => {
          // Remove sensitive headers
          proxyReq.removeHeader("cookie");
          proxyReq.removeHeader("cookie2");
          proxyReq.removeHeader("authorization");

          // Set custom user agent
          proxyReq.setHeader("User-Agent", "Integrated-Server-Proxy/1.0");
        },
        onProxyRes: (proxyRes: any) => {
          // Add custom headers
          proxyRes.headers["x-proxied-by"] = "integrated-server-proxy";
          proxyRes.headers["x-request-url"] = targetUrl;
          proxyRes.headers["access-control-allow-origin"] = "*";
          proxyRes.headers["access-control-expose-headers"] = "*";

          // Remove set-cookie headers for security
          delete proxyRes.headers["set-cookie"];
          delete proxyRes.headers["set-cookie2"];
        },
        onError: (err: any, req: any, res: any) => {
          console.error("Proxy error:", err.message);
          const response = res as Response;
          if (!response.headersSent) {
            response.status(502).json({
              error: "Bad Gateway",
              message: "Failed to proxy request",
              details: err.message,
            });
          }
        },
        logLevel: "warn",
      } as any;

      createProxyMiddleware(proxyOptions)(req, res, next);
    },
  );
  
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

      // Write log
      await fs.appendFile(path.join(DATA_DIR, "data_log.txt"), logMessage);
      // Save received data
      await fs.writeFile(path.join(DATA_DIR, "received_data.json"), JSON.stringify(data, null, 2));

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
            await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(filteredData, null, 2));
            generatedFiles.push(filename);
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

  const httpServer = createServer(app);
  return httpServer;
}