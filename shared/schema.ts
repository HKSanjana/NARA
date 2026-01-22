import { z } from "zod";

// This file is kept for backward compatibility with existing imports
// The MSSQL database schema is managed separately in the database

// Zod schemas for form validation
export const insertUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email().optional(),
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional(),
  division: z.string().optional(),
  position: z.string().optional(),
  profileImageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const insertCalendarEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  eventType: z.string().optional(),
  divisionId: z.string().optional(),
  location: z.string().optional(),
  participants: z.any().optional(),
  status: z.string().optional(),
  createdBy: z.string().optional(),
});

export const insertDocumentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  category: z.string().optional(),
  divisionId: z.string().optional(),
  downloadCount: z.number().optional(),
  isPublic: z.boolean().optional(),
  uploadedBy: z.string().optional(),
});

export const insertRtiRequestSchema = z.object({
  requesterId: z.string().optional(),
  requesterName: z.string().optional(),
  requesterEmail: z.string().optional(),
  requesterPhone: z.string().optional(),
  requesterAddress: z.string().optional(),
  informationRequested: z.string().optional(),
  purpose: z.string().optional(),
  preferredFormat: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  responseText: z.string().optional(),
  responseDocuments: z.any().optional(),
});

export const insertContactMessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  division: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  replyText: z.string().optional(),
});

// Note: For MSSQL integration, see:
// - Database configuration: server/db.ts
// - Type definitions: shared/types/index.ts
// - API routes: server/routes.ts
