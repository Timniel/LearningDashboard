import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { requireAuth, requireRole, requireCourseInstructor } from "./middleware";
import { 
  insertCourseSchema, insertEnrollmentSchema, insertAssessmentSchema, 
  insertSubmissionSchema, insertUserSchema 
} from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // User Profile routes
  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    if (req.user!.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Can only update own profile" });
    }

    const result = insertUserSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const user = await storage.updateUser(parseInt(req.params.id), result.data);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

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

  app.get("/api/instructor/courses", requireAuth, requireRole("instructor"), async (req, res) => {
    const courses = await storage.listInstructorCourses(req.user!.id);
    res.json(courses);
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

  app.patch("/api/enrollments/:id/progress", requireAuth, requireRole("student"), async (req, res) => {
    const progress = parseInt(req.body.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Invalid progress value" });
    }
    const enrollment = await storage.updateEnrollmentProgress(parseInt(req.params.id), progress);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    res.json(enrollment);
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

  app.get("/api/assessments/:id", requireAuth, async (req, res) => {
    const assessment = await storage.getAssessment(parseInt(req.params.id));
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  });

  app.patch("/api/assessments/:id", requireAuth, requireRole("instructor"), async (req, res) => {
    const result = insertAssessmentSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid assessment data" });
    }
    const assessment = await storage.updateAssessment(parseInt(req.params.id), result.data);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  });

  app.get("/api/student/assessments", requireAuth, requireRole("student"), async (req, res) => {
    const assessments = await storage.listStudentAssessments(req.user!.id);
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

  app.get("/api/assessments/:assessmentId/submissions", requireAuth, requireRole("instructor"), async (req, res) => {
    const submissions = await storage.listAssessmentSubmissions(parseInt(req.params.assessmentId));
    res.json(submissions);
  });

  app.patch("/api/submissions/:id", requireAuth, requireRole("instructor"), async (req, res) => {
    const result = insertSubmissionSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid submission data" });
    }
    const submission = await storage.updateSubmission(parseInt(req.params.id), result.data);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.json(submission);
  });

  const httpServer = createServer(app);
  return httpServer;
}