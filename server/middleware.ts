import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function requireRole(role: "instructor" | "student") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

export async function requireCourseInstructor(req: Request, res: Response, next: NextFunction) {
  const courseId = parseInt(req.params.courseId);
  const course = await storage.getCourse(courseId);

  if (!course || course.instructorId !== req.user?.id) {
    return res.status(403).json({ message: "Forbidden - Not course instructor" });
  }
  next();
}