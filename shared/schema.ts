import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["student", "instructor"] }).notNull(),
  email: text("email"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  lastActive: timestamp("last_active").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructorId: integer("instructor_id").notNull(),
  content: text("content"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  maxScore: integer("max_score").notNull(),
  dueDate: timestamp("due_date"),
  type: text("type", { enum: ["quiz", "assignment", "project"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessmentSubmissions = pgTable("assessment_submissions", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull(),
  studentId: integer("student_id").notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  status: text("status", { enum: ["pending", "graded", "late"] }).notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  content: text("content").notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  email: true,
  bio: true,
  profilePicture: true,
});

export const insertCourseSchema = createInsertSchema(courses);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertAssessmentSchema = createInsertSchema(assessments);
export const insertSubmissionSchema = createInsertSchema(assessmentSubmissions);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Submission = typeof assessmentSubmissions.$inferSelect;