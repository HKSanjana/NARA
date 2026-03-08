import { z } from "zod";

// User schemas and types
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  role: z.string().default("user"),
  division: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = Omit<User, "id" | "createdAt" | "updatedAt">;

// Division schemas and types
export const divisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  headOfDivision: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export type Division = z.infer<typeof divisionSchema>;
export type InsertDivision = Division;

// Calendar event schemas and types
export const calendarEventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional().nullable(),
  date: z.date(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  eventType: z.string().optional().nullable(),
  divisionId: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  participants: z.string().optional().nullable(),
  status: z.string().default("scheduled"),
  createdBy: z.string().optional().nullable(),
  createdAt: z.date(),
});

export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type InsertCalendarEvent = Omit<CalendarEvent, "id" | "createdAt">;

// Document schemas and types
export const documentSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional().nullable(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().optional().nullable(),
  mimeType: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  divisionId: z.string().optional().nullable(),
  downloadCount: z.number().default(0),
  isPublic: z.boolean().default(true),
  uploadedBy: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = Omit<Document, "id" | "createdAt" | "updatedAt">;

// RTI Request schemas and types
export const rtiRequestSchema = z.object({
  id: z.number(),
  requesterId: z.string().optional().nullable(),
  requesterName: z.string().optional().nullable(),
  requesterEmail: z.string().email().optional().nullable(),
  requesterPhone: z.string().optional().nullable(),
  requesterAddress: z.string().optional().nullable(),
  informationRequested: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  preferredFormat: z.string().optional().nullable(),
  status: z.string().default("pending"),
  assignedTo: z.string().optional().nullable(),
  responseText: z.string().optional().nullable(),
  responseDocuments: z.string().optional().nullable(),
  submittedAt: z.date(),
  updatedAt: z.date(),
});

export type RtiRequest = z.infer<typeof rtiRequestSchema>;
export type InsertRtiRequest = Omit<RtiRequest, "id" | "submittedAt" | "updatedAt">;

// Contact Message schemas and types
export const contactMessageSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  division: z.string().optional().nullable(),
  status: z.string().default("new"),
  assignedTo: z.string().optional().nullable(),
  replyText: z.string().optional().nullable(),
  submittedAt: z.date(),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;
export type InsertContactMessage = Omit<ContactMessage, "id" | "submittedAt">;

// Station schemas and types
export const stationSchema = z.object({
  stationId: z.string(),
  name: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  locationDescription: z.string().optional().nullable(),
});

export type Station = z.infer<typeof stationSchema>;
export type InsertStation = Station;

// Measurement Type schemas and types
export const measurementTypeSchema = z.object({
  measurementTypeId: z.number(),
  code: z.string(),
  description: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
});

export type MeasurementType = z.infer<typeof measurementTypeSchema>;
export type InsertMeasurementType = Omit<MeasurementType, "measurementTypeId">;

// Measurement schemas and types
export const measurementSchema = z.object({
  measurementId: z.number(),
  stationId: z.string(),
  measurementTs: z.date(),
  measurementTypeId: z.number(),
  value: z.number().optional().nullable(),
  qualityFlag: z.string().optional().nullable(),
});

export type Measurement = z.infer<typeof measurementSchema>;
export type InsertMeasurement = Omit<Measurement, "measurementId">;

// Backward compatibility or legacy names
export type SeaLevelData = Measurement;
export type InsertSeaLevelData = InsertMeasurement;

// Insert schemas for components that might still use them
export const insertUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertCalendarEventSchema = calendarEventSchema.omit({ id: true, createdAt: true });
export const insertDocumentSchema = documentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertRtiRequestSchema = rtiRequestSchema.omit({ id: true, submittedAt: true, updatedAt: true });
export const insertContactMessageSchema = contactMessageSchema.omit({ id: true, submittedAt: true });
export const insertStationSchema = stationSchema;
export const insertMeasurementTypeSchema = measurementTypeSchema.omit({ measurementTypeId: true });
export const insertMeasurementSchema = measurementSchema.omit({ measurementId: true });
