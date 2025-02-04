fetch('/api/courses', {
  credentials: 'include'  // Important!
})
```

2. Session cookie is automatically managed by the browser

## API Endpoints

### 1. Authentication & User Management

#### Register New User
```
POST /api/register
Body: {
  "username": string,
  "password": string,
  "name": string,
  "role": "student" | "instructor"
}
Response: {
  "id": number,
  "username": string,
  "name": string,
  "role": string
}
```

#### Login
```
POST /api/login
Body: {
  "username": string,
  "password": string
}
Response: {
  "id": number,
  "username": string,
  "name": string,
  "role": string
}
```

#### Logout
```
POST /api/logout
Response: 200 OK
```

#### Get Current User
```
GET /api/user
Response: {
  "id": number,
  "username": string,
  "name": string,
  "role": string
} | 401 Unauthorized
```

### 2. Course Management (Instructor Only)

#### Create Course
```
POST /api/courses
Requires: Instructor role
Body: {
  "title": string,
  "description": string,
  "instructorId": number
}
Response: {
  "id": number,
  "title": string,
  "description": string,
  "instructorId": number
}
```

#### Update Course
```
PATCH /api/courses/:id
Requires: Course instructor only
Body: {
  "title"?: string,
  "description"?: string
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

### 3. Assessment Management (Instructor Only)

#### Create Assessment
```
POST /api/courses/:courseId/assessments
Requires: Course instructor only
Body: {
  "title": string,
  "description": string,
  "maxScore": number
}
Response: {
  "id": number,
  "courseId": number,
  "title": string,
  "description": string,
  "maxScore": number
}
```

#### List Course Assessments
```
GET /api/courses/:courseId/assessments
Requires: Authentication
Response: Array of assessment objects
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
Response: {
  "id": number,
  "studentId": number,
  "courseId": number,
  "progress": number,
  "completed": boolean,
  "enrolledAt": string
}
```

#### List Enrollments
```
GET /api/enrollments
Requires: Student role
Response: Array of enrollment objects
```

#### Submit Assessment
```
POST /api/assessments/:assessmentId/submissions
Requires: Student role
Body: {
  "studentId": number,
  "score": number
}
Response: {
  "id": number,
  "assessmentId": number,
  "studentId": number,
  "score": number,
  "submittedAt": string
}
```

#### List Submissions
```
GET /api/submissions
Requires: Student role
Response: Array of submission objects
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
```

## Example Usage

### Authentication Flow Example

```javascript
// Register a new instructor
const registerResponse = await fetch('/api/register', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'instructor1',
    password: 'secure123',
    name: 'John Doe',
    role: 'instructor'
  })
});

// Login
const loginResponse = await fetch('/api/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'instructor1',
    password: 'secure123'
  })
});

const user = await loginResponse.json();
```

### Course Management Example (as Instructor)

```javascript
// Create a new course
const createCourseResponse = await fetch('/api/courses', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Web Development 101',
    description: 'Learn the basics of web development',
    instructorId: user.id
  })
});

// Add an assessment to the course
const courseId = 1;
const createAssessmentResponse = await fetch(`/api/courses/${courseId}/assessments`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Final Project',
    description: 'Build a simple website',
    maxScore: 100
  })
});
```

### Student Actions Example

```javascript
// Enroll in a course
const enrollResponse = await fetch('/api/enrollments', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    studentId: user.id,
    courseId: 1
  })
});

// Submit an assessment
const assessmentId = 1;
const submitResponse = await fetch(`/api/assessments/${assessmentId}/submissions`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    studentId: user.id,
    score: 85
  })
});
```

## Testing

All endpoints have been tested and verified using automated test scripts. You can find example test cases in `test_api.py`.

## Data Models

### User
```typescript
{
  id: number;
  username: string;
  name: string;
  role: "student" | "instructor";
}
```

### Course
```typescript
{
  id: number;
  title: string;
  description: string;
  instructorId: number;
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
}
```

### Submission
```typescript
{
  id: number;
  assessmentId: number;
  studentId: number;
  score: number;
  submittedAt: string;
}