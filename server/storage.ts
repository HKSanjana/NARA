import {
  users,
  divisions,
  calendarEvents,
  documents,
  rtiRequests,
  seaLevelData,
  contactMessages,
  type User,
  type InsertUser,
  type Division,
  type InsertDivision,
  type CalendarEvent,
  type InsertCalendarEvent,
  type Document,
  type InsertDocument,
  type RtiRequest,
  type InsertRtiRequest,
  type SeaLevelData,
  type InsertSeaLevelData,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;

  // Division operations
  getDivision(id: string): Promise<Division | undefined>;
  getAllDivisions(): Promise<Division[]>;
  createDivision(division: InsertDivision): Promise<Division>;
  updateDivision(id: string, division: Partial<InsertDivision>): Promise<Division>;
  deleteDivision(id: string): Promise<boolean>;

  // Calendar operations
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  getCalendarEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  getCalendarEventsByDivision(divisionId: string): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<boolean>;

  // Document operations
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentsByCategory(category: string): Promise<Document[]>;
  getDocumentsByDivision(divisionId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
  incrementDownloadCount(id: string): Promise<boolean>;

  // RTI operations
  getRtiRequest(id: string): Promise<RtiRequest | undefined>;
  getAllRtiRequests(): Promise<RtiRequest[]>;
  getRtiRequestsByStatus(status: string): Promise<RtiRequest[]>;
  createRtiRequest(request: InsertRtiRequest): Promise<RtiRequest>;
  updateRtiRequest(id: string, request: Partial<RtiRequest>): Promise<RtiRequest>;
  deleteRtiRequest(id: string): Promise<boolean>;

  // Sea level data operations
  getSeaLevelData(stationId?: string, startDate?: Date, endDate?: Date): Promise<SeaLevelData[]>;
  getLatestSeaLevelData(stationId: string): Promise<SeaLevelData | undefined>;
  createSeaLevelData(data: InsertSeaLevelData): Promise<SeaLevelData>;
  deleteSeaLevelData(id: string): Promise<boolean>;

  // Contact message operations
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessagesByStatus(status: string): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: string, message: Partial<ContactMessage>): Promise<ContactMessage>;
  deleteContactMessage(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Division operations
  async getDivision(id: string): Promise<Division | undefined> {
    const [division] = await db.select().from(divisions).where(eq(divisions.id, id));
    return division;
  }

  async getAllDivisions(): Promise<Division[]> {
    return await db.select().from(divisions).orderBy(divisions.name);
  }

  async createDivision(division: InsertDivision): Promise<Division> {
    const [newDivision] = await db.insert(divisions).values(division).returning();
    return newDivision;
  }

  async updateDivision(id: string, division: Partial<InsertDivision>): Promise<Division> {
    const [updatedDivision] = await db
      .update(divisions)
      .set(division)
      .where(eq(divisions.id, id))
      .returning();
    return updatedDivision;
  }

  async deleteDivision(id: string): Promise<boolean> {
    const result = await db.delete(divisions).where(eq(divisions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Calendar operations
  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event;
  }

  async getCalendarEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(calendarEvents)
        .where(and(
          gte(calendarEvents.date, startDate),
          lte(calendarEvents.date, endDate)
        ))
        .orderBy(calendarEvents.date);
    }
    
    return await db.select().from(calendarEvents).orderBy(calendarEvents.date);
  }

  async getCalendarEventsByDivision(divisionId: string): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.divisionId, divisionId))
      .orderBy(calendarEvents.date);
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents).values(event).returning();
    return newEvent;
  }

  async updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(event)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    const result = await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Document operations
  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByCategory(category: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.category, category))
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentsByDivision(divisionId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.divisionId, divisionId))
      .orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementDownloadCount(id: string): Promise<boolean> {
    const result = await db
      .update(documents)
      .set({ downloadCount: sql`download_count + 1` })
      .where(eq(documents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // RTI operations
  async getRtiRequest(id: string): Promise<RtiRequest | undefined> {
    const [request] = await db.select().from(rtiRequests).where(eq(rtiRequests.id, id));
    return request;
  }

  async getAllRtiRequests(): Promise<RtiRequest[]> {
    return await db.select().from(rtiRequests).orderBy(desc(rtiRequests.submittedAt));
  }

  async getRtiRequestsByStatus(status: string): Promise<RtiRequest[]> {
    return await db
      .select()
      .from(rtiRequests)
      .where(eq(rtiRequests.status, status))
      .orderBy(desc(rtiRequests.submittedAt));
  }

  async createRtiRequest(request: InsertRtiRequest): Promise<RtiRequest> {
    const [newRequest] = await db.insert(rtiRequests).values(request).returning();
    return newRequest;
  }

  async updateRtiRequest(id: string, request: Partial<RtiRequest>): Promise<RtiRequest> {
    const [updatedRequest] = await db
      .update(rtiRequests)
      .set(request)
      .where(eq(rtiRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteRtiRequest(id: string): Promise<boolean> {
    const result = await db.delete(rtiRequests).where(eq(rtiRequests.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Sea level data operations
  async getSeaLevelData(stationId?: string, startDate?: Date, endDate?: Date): Promise<SeaLevelData[]> {
    const conditions = [];
    if (stationId) {
      conditions.push(eq(seaLevelData.stationId, stationId));
    }
    if (startDate) {
      conditions.push(gte(seaLevelData.timestamp, startDate));
    }
    if (endDate) {
      conditions.push(lte(seaLevelData.timestamp, endDate));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(seaLevelData)
        .where(and(...conditions))
        .orderBy(desc(seaLevelData.timestamp));
    }
    
    return await db.select().from(seaLevelData).orderBy(desc(seaLevelData.timestamp));
  }

  async getLatestSeaLevelData(stationId: string): Promise<SeaLevelData | undefined> {
    const [data] = await db
      .select()
      .from(seaLevelData)
      .where(eq(seaLevelData.stationId, stationId))
      .orderBy(desc(seaLevelData.timestamp))
      .limit(1);
    return data;
  }

  async createSeaLevelData(data: InsertSeaLevelData): Promise<SeaLevelData> {
    const [newData] = await db.insert(seaLevelData).values(data).returning();
    return newData;
  }

  async deleteSeaLevelData(id: string): Promise<boolean> {
    const result = await db.delete(seaLevelData).where(eq(seaLevelData.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Contact message operations
  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.submittedAt));
  }

  async getContactMessagesByStatus(status: string): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.status, status))
      .orderBy(desc(contactMessages.submittedAt));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async updateContactMessage(id: string, message: Partial<ContactMessage>): Promise<ContactMessage> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set(message)
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteContactMessage(id: string): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
