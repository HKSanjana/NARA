import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for admin authentication and user profiles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: varchar("email").unique(),
  password: text("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").default("user"), // user, admin, researcher
  division: varchar("division"),
  position: varchar("position"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Research divisions
export const divisions = pgTable("divisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  head: varchar("head"),
  email: varchar("email"),
  phone: varchar("phone"),
  services: jsonb("services"), // array of services
  products: jsonb("products"), // array of products
  staff: jsonb("staff"), // array of staff members
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar events for research activities
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  eventType: varchar("event_type"), // research, monitoring, training, meeting
  divisionId: varchar("division_id").references(() => divisions.id),
  location: text("location"),
  participants: jsonb("participants"),
  status: varchar("status").default("scheduled"), // scheduled, ongoing, completed, cancelled
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents and downloads
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  category: varchar("category"), // report, publication, guideline, form
  divisionId: varchar("division_id").references(() => divisions.id),
  downloadCount: integer("download_count").default(0),
  isPublic: boolean("is_public").default(true),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RTI (Right to Information) requests
export const rtiRequests = pgTable("rti_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id),
  requesterName: text("requester_name").notNull(),
  requesterEmail: varchar("requester_email").notNull(),
  requesterPhone: varchar("requester_phone"),
  requesterAddress: text("requester_address"),
  informationRequested: text("information_requested").notNull(),
  purpose: text("purpose"),
  preferredFormat: varchar("preferred_format"), // email, post, pickup
  status: varchar("status").default("pending"), // pending, processing, approved, rejected, completed
  assignedTo: varchar("assigned_to").references(() => users.id),
  responseText: text("response_text"),
  responseDocuments: jsonb("response_documents"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  responseDate: timestamp("response_date"),
  completedAt: timestamp("completed_at"),
});

// Sea level monitoring data
export const seaLevelData = pgTable("sea_level_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stationId: varchar("station_id").notNull(),
  stationName: text("station_name").notNull(),
  location: text("location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timestamp: timestamp("timestamp").notNull(),
  seaLevel: text("sea_level"), // in meters
  temperature: text("temperature"), // in celsius
  salinity: text("salinity"),
  waveHeight: text("wave_height"),
  windSpeed: text("wind_speed"),
  windDirection: text("wind_direction"),
  dataQuality: varchar("data_quality").default("good"), // good, fair, poor
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact messages
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: varchar("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  division: varchar("division"),
  status: varchar("status").default("unread"), // unread, read, replied
  assignedTo: varchar("assigned_to").references(() => users.id),
  replyText: text("reply_text"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  repliedAt: timestamp("replied_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  calendarEvents: many(calendarEvents),
  documents: many(documents),
  rtiRequests: many(rtiRequests),
  assignedRtiRequests: many(rtiRequests),
  contactMessages: many(contactMessages),
}));

export const divisionsRelations = relations(divisions, ({ many }) => ({
  calendarEvents: many(calendarEvents),
  documents: many(documents),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  division: one(divisions, {
    fields: [calendarEvents.divisionId],
    references: [divisions.id],
  }),
  creator: one(users, {
    fields: [calendarEvents.createdBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  division: one(divisions, {
    fields: [documents.divisionId],
    references: [divisions.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const rtiRequestsRelations = relations(rtiRequests, ({ one }) => ({
  requester: one(users, {
    fields: [rtiRequests.requesterId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [rtiRequests.assignedTo],
    references: [users.id],
  }),
}));

export const contactMessagesRelations = relations(contactMessages, ({ one }) => ({
  assignee: one(users, {
    fields: [contactMessages.assignedTo],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDivisionSchema = createInsertSchema(divisions).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRtiRequestSchema = createInsertSchema(rtiRequests).omit({
  id: true,
  submittedAt: true,
  responseDate: true,
  completedAt: true,
});

export const insertSeaLevelDataSchema = createInsertSchema(seaLevelData).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  submittedAt: true,
  repliedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type RtiRequest = typeof rtiRequests.$inferSelect;
export type InsertRtiRequest = z.infer<typeof insertRtiRequestSchema>;
export type SeaLevelData = typeof seaLevelData.$inferSelect;
export type InsertSeaLevelData = z.infer<typeof insertSeaLevelDataSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
