import { pgTable, text, serial, integer, timestamp, boolean, decimal, doublePrecision, varchar, primaryKey, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user"),
  division: text("division"),
  position: text("position"),
  profileImageUrl: text("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Divisions table
export const divisions = pgTable("divisions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  headOfDivision: text("head_of_division"),
  email: text("email"),
  phone: text("phone"),
});

// Calendar events table
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  eventType: text("event_type"),
  divisionId: text("division_id").references(() => divisions.id),
  location: text("location"),
  participants: text("participants"), // JSON or comma-separated
  status: text("status").default("scheduled"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  category: text("category"),
  divisionId: text("division_id").references(() => divisions.id),
  downloadCount: integer("download_count").default(0),
  isPublic: boolean("is_public").default(true),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// RTI Requests table
export const rtiRequests = pgTable("rti_requests", {
  id: serial("id").primaryKey(),
  requesterId: text("requester_id"),
  requesterName: text("requester_name"),
  requesterEmail: text("requester_email"),
  requesterPhone: text("requester_phone"),
  requesterAddress: text("requester_address"),
  informationRequested: text("information_requested"),
  purpose: text("purpose"),
  preferredFormat: text("preferred_format"),
  status: text("status").default("pending"),
  assignedTo: text("assigned_to"),
  responseText: text("response_text"),
  responseDocuments: text("response_documents"), // JSON or comma-separated paths
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact Messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  division: text("division"),
  status: text("status").default("new"),
  assignedTo: text("assigned_to"),
  replyText: text("reply_text"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Monitoring Stations table (from NARADB.sql)
export const stations = pgTable("stations", {
  stationId: varchar("station_id", { length: 32 }).primaryKey(),
  name: text("name"),
  latitude: decimal("latitude", { precision: 9, scale: 6 }),
  longitude: decimal("longitude", { precision: 9, scale: 6 }),
  locationDescription: text("location_description"),
});

// Measurement Types table (from NARADB.sql)
export const measurementTypes = pgTable("measurement_types", {
  measurementTypeId: serial("measurement_type_id").primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  description: text("description"),
  unit: varchar("unit", { length: 32 }),
});

// Measurements table (from NARADB.sql)
export const measurements = pgTable("measurements", {
  measurementId: serial("measurement_id").primaryKey(),
  stationId: varchar("station_id", { length: 32 }).references(() => stations.stationId).notNull(),
  measurementTs: timestamp("measurement_ts").notNull(),
  measurementTypeId: integer("measurement_type_id").references(() => measurementTypes.measurementTypeId).notNull(),
  value: doublePrecision("value"),
  qualityFlag: varchar("quality_flag", { length: 16 }),
}, (table) => ({
  unq: unique("uq_measurement").on(table.stationId, table.measurementTypeId, table.measurementTs),
}));

// Backward compatibility or legacy names if needed
export const seaLevelData = measurements;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertCalendarEventSchema = createInsertSchema(calendarEvents, {
  date: z.coerce.date(),
});
export const insertDocumentSchema = createInsertSchema(documents);
export const insertRtiRequestSchema = createInsertSchema(rtiRequests);
export const insertContactMessageSchema = createInsertSchema(contactMessages);
export const insertStationSchema = createInsertSchema(stations);
export const insertMeasurementTypeSchema = createInsertSchema(measurementTypes);
export const insertMeasurementSchema = createInsertSchema(measurements);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Division = typeof divisions.$inferSelect;
export type InsertDivision = typeof divisions.$inferInsert;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type RtiRequest = typeof rtiRequests.$inferSelect;
export type InsertRtiRequest = typeof rtiRequests.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;
export type Station = typeof stations.$inferSelect;
export type InsertStation = typeof stations.$inferInsert;
export type MeasurementType = typeof measurementTypes.$inferSelect;
export type InsertMeasurementType = typeof measurementTypes.$inferInsert;
export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;
export type SeaLevelData = Measurement;
export type InsertSeaLevelData = InsertMeasurement;
