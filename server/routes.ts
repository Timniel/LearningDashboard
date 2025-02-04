import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { requireAuth, requireRole, requireCourseInstructor } from "./middleware";
import { insertCourseSchema, insertEnrollmentSchema, insertAssessmentSchema, insertSubmissionSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Course routes
  app.post("/api/courses", requireAuth, requireRole("instructor"), async (req, res) => {
    const result = insertCourseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid course data" });
    }
    const course = await storage.createCourse(result.data);
    res.status(201).json(course);
  });

  app.get("/api/courses", requireAuth, async (req, res) => {
    const courses = await storage.listCourses();
    res.json(courses);
  });

  app.get("/api/courses/:id", requireAuth, async (req, res) => {
    const course = await storage.getCourse(parseInt(req.params.id));
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  });

  app.patch("/api/courses/:id", requireAuth, requireRole("instructor"), requireCourseInstructor, async (req, res) => {
    const result = insertCourseSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid course data" });
    }
    const course = await storage.updateCourse(parseInt(req.params.id), result.data);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  });

  // Enrollment routes
  app.post("/api/enrollments", requireAuth, requireRole("student"), async (req, res) => {
    const result = insertEnrollmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid enrollment data" });
    }
    const enrollment = await storage.createEnrollment(result.data);
    res.status(201).json(enrollment);
  });

  app.get("/api/enrollments", requireAuth, requireRole("student"), async (req, res) => {
    const enrollments = await storage.listEnrollments(req.user!.id);
    res.json(enrollments);
  });

  // Assessment routes
  app.post("/api/courses/:courseId/assessments", requireAuth, requireRole("instructor"), requireCourseInstructor, async (req, res) => {
    const result = insertAssessmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid assessment data" });
    }
    const assessment = await storage.createAssessment(result.data);
    res.status(201).json(assessment);
  });

  app.get("/api/courses/:courseId/assessments", requireAuth, async (req, res) => {
    const assessments = await storage.listCourseAssessments(parseInt(req.params.courseId));
    res.json(assessments);
  });

  // Submission routes
  app.post("/api/assessments/:assessmentId/submissions", requireAuth, requireRole("student"), async (req, res) => {
    const result = insertSubmissionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid submission data" });
    }
    const submission = await storage.createSubmission(result.data);
    res.status(201).json(submission);
  });

  app.get("/api/submissions", requireAuth, requireRole("student"), async (req, res) => {
    const submissions = await storage.listStudentSubmissions(req.user!.id);
    res.json(submissions);
  });

  const httpServer = createServer(app);
  return httpServer;
}
