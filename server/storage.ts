import { 
  User, InsertUser, Course, InsertCourse,
  Enrollment, InsertEnrollment, Assessment,
  InsertAssessment, Submission, InsertSubmission 
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session, { Store } from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  listCourses(): Promise<Course[]>;

  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollment(studentId: number, courseId: number): Promise<Enrollment | undefined>;
  updateEnrollment(id: number, data: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;
  listEnrollments(studentId: number): Promise<Enrollment[]>;

  // Assessment operations
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  listCourseAssessments(courseId: number): Promise<Assessment[]>;

  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: number): Promise<Submission | undefined>;
  listStudentSubmissions(studentId: number): Promise<Submission[]>;

  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;
  private assessments: Map<number, Assessment>;
  private submissions: Map<number, Submission>;
  sessionStore: Store;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.assessments = new Map();
    this.submissions = new Map();
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.currentIds = {
      users: 1,
      courses: 1,
      enrollments: 1,
      assessments: 1,
      submissions: 1
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentIds.courses++;
    const course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async updateCourse(id: number, data: Partial<InsertCourse>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;

    const updated = { ...course, ...data };
    this.courses.set(id, updated);
    return updated;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  async listCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.currentIds.enrollments++;
    const enrollment = { 
      ...insertEnrollment,
      id,
      enrolledAt: new Date(),
      progress: 0,
      completed: false
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async getEnrollment(studentId: number, courseId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      e => e.studentId === studentId && e.courseId === courseId
    );
  }

  async updateEnrollment(id: number, data: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) return undefined;

    const updated = { ...enrollment, ...data };
    this.enrollments.set(id, updated);
    return updated;
  }

  async listEnrollments(studentId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      e => e.studentId === studentId
    );
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentIds.assessments++;
    const assessment = { ...insertAssessment, id };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async listCourseAssessments(courseId: number): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(
      a => a.courseId === courseId
    );
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.currentIds.submissions++;
    const submission = { 
      ...insertSubmission,
      id,
      submittedAt: new Date()
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async listStudentSubmissions(studentId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      s => s.studentId === studentId
    );
  }
}

export const storage = new MemStorage();