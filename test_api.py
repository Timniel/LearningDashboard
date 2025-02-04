import requests
import json

BASE_URL = 'http://localhost:5000'
session = requests.Session()

def print_response(msg, response):
    print(f"\n=== {msg} ===")
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

# Test 1: Register instructor
instructor_data = {
    "username": "instructor2",
    "password": "test123",
    "name": "John Doe",
    "role": "instructor"
}
resp = session.post(f"{BASE_URL}/api/register", json=instructor_data)
print_response("Register Instructor", resp)
instructor_id = resp.json()['id']

# Test 2: Create course
course_data = {
    "title": "Web Development 101",
    "description": "Learn the basics of web development",
    "instructorId": instructor_id
}
resp = session.post(f"{BASE_URL}/api/courses", json=course_data)
print_response("Create Course", resp)
course_id = resp.json()['id'] if resp.status_code == 201 else None

# Test 3: Create assessment
if course_id:
    assessment_data = {
        "title": "Final Project",
        "description": "Build a simple website",
        "maxScore": 100,
        "courseId": course_id
    }
    resp = session.post(f"{BASE_URL}/api/courses/{course_id}/assessments", json=assessment_data)
    print_response("Create Assessment", resp)
    assessment_id = resp.json()['id'] if resp.status_code == 201 else None

# Clear session for new user
session = requests.Session()

# Test 4: Register student
student_data = {
    "username": "student2",
    "password": "test123",
    "name": "Jane Smith",
    "role": "student"
}
resp = session.post(f"{BASE_URL}/api/register", json=student_data)
print_response("Register Student", resp)
student_id = resp.json()['id']

# Test 5: Student enrollment
if course_id:
    enrollment_data = {
        "studentId": student_id,
        "courseId": course_id
    }
    resp = session.post(f"{BASE_URL}/api/enrollments", json=enrollment_data)
    print_response("Create Enrollment", resp)

# Test 6: Submit assessment
if assessment_id:
    submission_data = {
        "assessmentId": assessment_id,
        "studentId": student_id,
        "score": 85
    }
    resp = session.post(f"{BASE_URL}/api/assessments/{assessment_id}/submissions", json=submission_data)
    print_response("Submit Assessment", resp)

# Test 7: Get all courses
resp = session.get(f"{BASE_URL}/api/courses")
print_response("List All Courses", resp)

# Test 8: Get student enrollments
resp = session.get(f"{BASE_URL}/api/enrollments")
print_response("List Student Enrollments", resp)

# Test 9: Get course assessments
if course_id:
    resp = session.get(f"{BASE_URL}/api/courses/{course_id}/assessments")
    print_response("List Course Assessments", resp)

# Test 10: Get student submissions
resp = session.get(f"{BASE_URL}/api/submissions")
print_response("List Student Submissions", resp)
