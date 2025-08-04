import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { insertUserSchema, insertCalendarEventSchema, insertDocumentSchema, insertRtiRequestSchema, insertContactMessageSchema } from "@shared/schema";

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
  
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password!, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // User management routes (admin only)
  app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to get users' });
    }
  });

  app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const user = await storage.updateUser(id, userData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUser(id);
      if (success) {
        res.json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Division routes
  app.get('/api/divisions', async (req, res) => {
    try {
      const divisions = await storage.getAllDivisions();
      res.json(divisions);
    } catch (error) {
      console.error('Get divisions error:', error);
      res.status(500).json({ message: 'Failed to get divisions' });
    }
  });

  app.get('/api/divisions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const division = await storage.getDivision(id);
      if (!division) {
        return res.status(404).json({ message: 'Division not found' });
      }
      res.json(division);
    } catch (error) {
      console.error('Get division error:', error);
      res.status(500).json({ message: 'Failed to get division' });
    }
  });

  // Calendar routes
  app.get('/api/calendar/events', async (req, res) => {
    try {
      const { startDate, endDate, divisionId } = req.query;
      
      let events;
      if (divisionId) {
        events = await storage.getCalendarEventsByDivision(divisionId as string);
      } else {
        events = await storage.getCalendarEvents(
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        );
      }
      
      res.json(events);
    } catch (error) {
      console.error('Get calendar events error:', error);
      res.status(500).json({ message: 'Failed to get calendar events' });
    }
  });

  app.post('/api/calendar/events', authenticateToken, async (req: any, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent({
        ...eventData,
        createdBy: req.user.id,
      });
      res.status(201).json(event);
    } catch (error) {
      console.error('Create calendar event error:', error);
      res.status(500).json({ message: 'Failed to create calendar event' });
    }
  });

  app.put('/api/calendar/events/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const eventData = req.body;
      const event = await storage.updateCalendarEvent(id, eventData);
      res.json(event);
    } catch (error) {
      console.error('Update calendar event error:', error);
      res.status(500).json({ message: 'Failed to update calendar event' });
    }
  });

  app.delete('/api/calendar/events/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCalendarEvent(id);
      if (success) {
        res.json({ message: 'Calendar event deleted successfully' });
      } else {
        res.status(404).json({ message: 'Calendar event not found' });
      }
    } catch (error) {
      console.error('Delete calendar event error:', error);
      res.status(500).json({ message: 'Failed to delete calendar event' });
    }
  });

  // Document routes
  app.get('/api/documents', async (req, res) => {
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
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ message: 'Failed to get documents' });
    }
  });

  app.post('/api/documents', authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'File is required' });
      }

      const documentData = insertDocumentSchema.parse({
        ...req.body,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.id,
      });

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({ message: 'Failed to upload document' });
    }
  });

  app.get('/api/documents/:id/download', async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Increment download count
      await storage.incrementDownloadCount(id);

      res.download(document.filePath, document.fileName);
    } catch (error) {
      console.error('Download document error:', error);
      res.status(500).json({ message: 'Failed to download document' });
    }
  });

  // RTI routes
  app.get('/api/rti/requests', authenticateToken, async (req, res) => {
    try {
      const { status } = req.query;
      
      let requests;
      if (status) {
        requests = await storage.getRtiRequestsByStatus(status as string);
      } else {
        requests = await storage.getAllRtiRequests();
      }
      
      res.json(requests);
    } catch (error) {
      console.error('Get RTI requests error:', error);
      res.status(500).json({ message: 'Failed to get RTI requests' });
    }
  });

  app.post('/api/rti/requests', async (req, res) => {
    try {
      const requestData = insertRtiRequestSchema.parse(req.body);
      const request = await storage.createRtiRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error('Create RTI request error:', error);
      res.status(500).json({ message: 'Failed to create RTI request' });
    }
  });

  app.put('/api/rti/requests/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const requestData = req.body;
      const request = await storage.updateRtiRequest(id, requestData);
      res.json(request);
    } catch (error) {
      console.error('Update RTI request error:', error);
      res.status(500).json({ message: 'Failed to update RTI request' });
    }
  });

  // Sea level data routes
  app.get('/api/sea-level', async (req, res) => {
    try {
      const { stationId, startDate, endDate } = req.query;
      
      const data = await storage.getSeaLevelData(
        stationId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json(data);
    } catch (error) {
      console.error('Get sea level data error:', error);
      res.status(500).json({ message: 'Failed to get sea level data' });
    }
  });

  app.get('/api/sea-level/latest/:stationId', async (req, res) => {
    try {
      const { stationId } = req.params;
      const data = await storage.getLatestSeaLevelData(stationId);
      res.json(data);
    } catch (error) {
      console.error('Get latest sea level data error:', error);
      res.status(500).json({ message: 'Failed to get latest sea level data' });
    }
  });

  // Contact routes
  app.post('/api/contact', async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Create contact message error:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  app.get('/api/contact/messages', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      
      let messages;
      if (status) {
        messages = await storage.getContactMessagesByStatus(status as string);
      } else {
        messages = await storage.getAllContactMessages();
      }
      
      res.json(messages);
    } catch (error) {
      console.error('Get contact messages error:', error);
      res.status(500).json({ message: 'Failed to get contact messages' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
