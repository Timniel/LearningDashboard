import { 
  users, courses, enrollments, assessments, assessmentSubmissions,
  type User, type InsertUser, type Course, type InsertCourse,
  type Enrollment, type InsertEnrollment, type Assessment,
  type InsertAssessment, type Submission, type InsertSubmission 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateLastActive(id: number): Promise<void>;

  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  listCourses(): Promise<Course[]>;
  listInstructorCourses(instructorId: number): Promise<Course[]>;

  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollment(studentId: number, courseId: number): Promise<Enrollment | undefined>;
  updateEnrollment(id: number, data: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;
  listEnrollments(studentId: number): Promise<Enrollment[]>;
  updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment | undefined>;

  // Assessment operations
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  updateAssessment(id: number, data: Partial<InsertAssessment>): Promise<Assessment | undefined>;
  listCourseAssessments(courseId: number): Promise<Assessment[]>;
  listStudentAssessments(studentId: number): Promise<Assessment[]>;

  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: number): Promise<Submission | undefined>;
  updateSubmission(id: number, data: Partial<InsertSubmission>): Promise<Submission | undefined>;
  listStudentSubmissions(studentId: number): Promise<Submission[]>;
  listAssessmentSubmissions(assessmentId: number): Promise<Submission[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...data, lastActive: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateLastActive(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, id));
  }

  // Course operations
  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async updateCourse(id: number, data: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const [deletedCourse] = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();
    return !!deletedCourse;
  }

  async listCourses(): Promise<Course[]> {
    return db.select().from(courses);
  }

  async listInstructorCourses(instructorId: number): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.instructorId, instructorId));
  }

  // Enrollment operations
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getEnrollment(studentId: number, courseId: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.courseId, courseId)
        )
      );
    return enrollment;
  }

  async updateEnrollment(id: number, data: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set({ ...data, lastAccessed: new Date() })
      .where(eq(enrollments.id, id))
      .returning();
    return updatedEnrollment;
  }

  async updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment | undefined> {
    return this.updateEnrollment(id, { 
      progress, 
      completed: progress === 100,
      lastAccessed: new Date()
    });
  }

  async listEnrollments(studentId: number): Promise<Enrollment[]> {
    return db
      .select()
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId));
  }

  // Assessment operations
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db.insert(assessments).values(assessment).returning();
    return newAssessment;
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment;
  }

  async updateAssessment(id: number, data: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set(data)
      .where(eq(assessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async listCourseAssessments(courseId: number): Promise<Assessment[]> {
    return db
      .select()
      .from(assessments)
      .where(eq(assessments.courseId, courseId));
  }

  async listStudentAssessments(studentId: number): Promise<Assessment[]> {
    const studentEnrollments = await this.listEnrollments(studentId);
    const courseIds = studentEnrollments.map(e => e.courseId);

    return db
      .select()
      .from(assessments)
      .where(assessments.courseId.in(courseIds));
  }

  // Submission operations
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db
      .insert(assessmentSubmissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(assessmentSubmissions)
      .where(eq(assessmentSubmissions.id, id));
    return submission;
  }

  async updateSubmission(id: number, data: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const [updatedSubmission] = await db
      .update(assessmentSubmissions)
      .set(data)
      .where(eq(assessmentSubmissions.id, id))
      .returning();
    return updatedSubmission;
  }

  async listStudentSubmissions(studentId: number): Promise<Submission[]> {
    return db
      .select()
      .from(assessmentSubmissions)
      .where(eq(assessmentSubmissions.studentId, studentId));
  }

  async listAssessmentSubmissions(assessmentId: number): Promise<Submission[]> {
    return db
      .select()
      .from(assessmentSubmissions)
      .where(eq(assessmentSubmissions.assessmentId, assessmentId));
  }
}

export const storage = new DatabaseStorage();