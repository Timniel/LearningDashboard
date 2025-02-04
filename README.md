fetch('/api/courses', {
  credentials: 'include'  // Important!
})
```

Session cookie is automatically managed by the browser.

## API Endpoints

### 1. Authentication & User Management

#### Register New User
```
POST /api/register
Body: {
  "username": string,
  "password": string,
  "name": string,
  "role": "student" | "instructor",
  "email": string?,
  "bio": string?,
  "profilePicture": string?
}
Response: User object
```

#### Login
```
POST /api/login
Body: {
  "username": string,
  "password": string
}
Response: User object
```

#### Logout
```
POST /api/logout
Response: 200 OK
```

#### Get Current User
```
GET /api/user
Response: User object | 401 Unauthorized
```

#### Update User Profile
```
PATCH /api/users/:id
Body: {
  "name"?: string,
  "email"?: string,
  "bio"?: string,
  "profilePicture"?: string
}
Response: Updated user object
```

### 2. Course Management (Instructor)

#### Create Course
```
POST /api/courses
Requires: Instructor role
Body: {
  "title": string,
  "description": string,
  "instructorId": number,
  "content"?: string,
  "isPublished"?: boolean
}
Response: Course object
```

#### Update Course
```
PATCH /api/courses/:id
Requires: Course instructor only
Body: {
  "title"?: string,
  "description"?: string,
  "content"?: string,
  "isPublished"?: boolean
}
Response: Updated course object
```

#### List All Courses
```
GET /api/courses
Requires: Authentication
Response: Array of course objects
```

#### Get Single Course
```
GET /api/courses/:id
Requires: Authentication
Response: Course object
```

#### List Instructor's Courses
```
GET /api/instructor/courses
Requires: Instructor role
Response: Array of course objects
```

### 3. Assessment Management (Instructor)

#### Create Assessment
```
POST /api/courses/:courseId/assessments
Requires: Course instructor only
Body: {
  "title": string,
  "description": string,
  "maxScore": number,
  "type": "quiz" | "assignment" | "project",
  "content": string,
  "dueDate"?: string (ISO date)
}
Response: Assessment object
```

#### Update Assessment
```
PATCH /api/assessments/:id
Requires: Course instructor
Body: {
  "title"?: string,
  "description"?: string,
  "maxScore"?: number,
  "content"?: string,
  "dueDate"?: string
}
Response: Updated assessment object
```

#### List Course Assessments
```
GET /api/courses/:courseId/assessments
Requires: Authentication
Response: Array of assessment objects
```

#### Get Assessment
```
GET /api/assessments/:id
Requires: Authentication
Response: Assessment object
```

### 4. Student Features

#### Enroll in Course
```
POST /api/enrollments
Requires: Student role
Body: {
  "studentId": number,
  "courseId": number
}
Response: Enrollment object
```

#### List Student Enrollments
```
GET /api/enrollments
Requires: Student role
Response: Array of enrollment objects
```

#### Update Enrollment Progress
```
PATCH /api/enrollments/:id/progress
Requires: Student role
Body: {
  "progress": number (0-100)
}
Response: Updated enrollment object
```

#### List Student's Assessments
```
GET /api/student/assessments
Requires: Student role
Response: Array of assessment objects
```

#### Submit Assessment
```
POST /api/assessments/:assessmentId/submissions
Requires: Student role
Body: {
  "studentId": number,
  "score": number,
  "content": string
}
Response: Submission object
```

#### List Student's Submissions
```
GET /api/submissions
Requires: Student role
Response: Array of submission objects
```

### 5. Assessment Grading (Instructor)

#### List Assessment Submissions
```
GET /api/assessments/:assessmentId/submissions
Requires: Instructor role
Response: Array of submission objects
```

#### Grade Submission
```
PATCH /api/submissions/:id
Requires: Instructor role
Body: {
  "score": number,
  "feedback": string,
  "status": "pending" | "graded" | "late"
}
Response: Updated submission object
```

## Data Models

### User
```typescript
{
  id: number;
  username: string;
  name: string;
  role: "student" | "instructor";
  email?: string;
  bio?: string;
  profilePicture?: string;
  lastActive: string;
}
```

### Course
```typescript
{
  id: number;
  title: string;
  description: string;
  instructorId: number;
  content?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Assessment
```typescript
{
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxScore: number;
  type: "quiz" | "assignment" | "project";
  content: string;
  dueDate?: string;
  createdAt: string;
}
```

### Enrollment
```typescript
{
  id: number;
  studentId: number;
  courseId: number;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  lastAccessed: string;
}
```

### Submission
```typescript
{
  id: number;
  assessmentId: number;
  studentId: number;
  score: number;
  content: string;
  feedback?: string;
  status: "pending" | "graded" | "late";
  submittedAt: string;
}
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (invalid input)
- 401: Unauthorized (not logged in)
- 403: Forbidden (not enough permissions)
- 404: Not Found

Error responses include a message:
```json
{
  "message": "Error description"
}