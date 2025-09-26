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

// Define data directory path
export const DATA_DIR = path.join(process.cwd(), "client/src/data");

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
