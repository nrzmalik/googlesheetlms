// Google Apps Script Backend for Learning Management System (LMS)
// This script manages all backend operations for the LMS

// Configuration - Update these with your actual Google Sheet ID
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your actual Google Sheet ID

// Sheet names (must match your Google Sheet)
const SHEETS = {
  STUDENTS: 'Students',
  COURSES: 'Courses', 
  ENROLLMENTS: 'Enrollments',
  ASSIGNMENTS: 'Assignmetns', // Note: keeping original spelling from user's request
  SUBMISSIONS: 'Submissions'
};

// Column mappings for each sheet
const COLUMNS = {
  STUDENTS: {
    ID: 0,
    NAME: 1,
    USERNAME: 2, 
    PASSWORD: 3,
    DEPARTMENT: 4
  },
  COURSES: {
    ID: 0,
    NAME: 1,
    DESCRIPTION: 2
  },
  ENROLLMENTS: {
    STUDENT_ID: 0,
    COURSE_ID: 1,
    STATUS: 2
  },
  ASSIGNMENTS: {
    ASSIGNMENT_ID: 0,
    COURSE_ID: 1,
    TITLE: 2,
    DESCRIPTION: 3,
    DUE_DATE: 4
  },
  SUBMISSIONS: {
    SUBMISSION_ID: 0,
    ASSIGNMENT_ID: 1,
    STUDENT_ID: 2,
    SUBMISSION_DATE: 3,
    GRADE: 4,
    SUBMISSION_TEXT: 5 // Additional column for submission content
  }
};

/**
 * Serves the HTML page
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Include external files in HTML
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==================== AUTHENTICATION FUNCTIONS ====================

/**
 * Authenticate user login
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @return {Object} Authentication result with user data
 */
function authenticateUser(username, password) {
  try {
    const studentsSheet = getSheet(SHEETS.STUDENTS);
    const data = studentsSheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[COLUMNS.STUDENTS.USERNAME] === username && row[COLUMNS.STUDENTS.PASSWORD] === password) {
        return {
          success: true,
          user: {
            id: row[COLUMNS.STUDENTS.ID],
            name: row[COLUMNS.STUDENTS.NAME],
            username: row[COLUMNS.STUDENTS.USERNAME],
            department: row[COLUMNS.STUDENTS.DEPARTMENT],
            role: username === 'admin' ? 'admin' : 'student' // Simple admin check
          }
        };
      }
    }
    
    // Check for default admin credentials
    if (username === 'admin' && password === 'admin') {
      return {
        success: true,
        user: {
          id: 0,
          name: 'Administrator',
          username: 'admin',
          department: 'Administration',
          role: 'admin'
        }
      };
    }
    
    return {
      success: false,
      message: 'Invalid username or password'
    };
  } catch (error) {
    Logger.log('Authentication error: ' + error.toString());
    return {
      success: false,
      message: 'Authentication failed: ' + error.toString()
    };
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get a specific sheet by name
 * @param {string} sheetName - Name of the sheet
 * @return {Sheet} Google Sheets object
 */
function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }
  
  return sheet;
}

/**
 * Initialize a new sheet with headers
 * @param {Sheet} sheet - The sheet to initialize
 * @param {string} sheetName - Name of the sheet
 */
function initializeSheet(sheet, sheetName) {
  let headers = [];
  
  switch (sheetName) {
    case SHEETS.STUDENTS:
      headers = ['ID', 'Name', 'Username', 'Password', 'Department'];
      break;
    case SHEETS.COURSES:
      headers = ['ID', 'Name', 'Description'];
      break;
    case SHEETS.ENROLLMENTS:
      headers = ['Student ID', 'Course ID', 'Status'];
      break;
    case SHEETS.ASSIGNMENTS:
      headers = ['Assignment ID', 'Course ID', 'Title', 'Description', 'Due Date'];
      break;
    case SHEETS.SUBMISSIONS:
      headers = ['Submission ID', 'Assignment ID', 'Student ID', 'Submission Date', 'Grade', 'Submission Text'];
      break;
  }
  
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

/**
 * Get next available ID for a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {number} idColumn - Column index for ID
 * @return {number} Next available ID
 */
function getNextId(sheetName, idColumn) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return 1; // First record
  
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    const id = parseInt(data[i][idColumn]) || 0;
    if (id > maxId) maxId = id;
  }
  
  return maxId + 1;
}

// ==================== DASHBOARD FUNCTIONS ====================

/**
 * Get dashboard statistics
 * @return {Object} Dashboard stats
 */
function getDashboardStats() {
  try {
    const stats = {
      students: getDataCount(SHEETS.STUDENTS),
      courses: getDataCount(SHEETS.COURSES),
      enrollments: getDataCount(SHEETS.ENROLLMENTS),
      assignments: getDataCount(SHEETS.ASSIGNMENTS)
    };
    
    return stats;
  } catch (error) {
    Logger.log('Dashboard stats error: ' + error.toString());
    return { students: 0, courses: 0, enrollments: 0, assignments: 0 };
  }
}

/**
 * Get count of data rows in a sheet
 * @param {string} sheetName - Name of the sheet
 * @return {number} Count of data rows
 */
function getDataCount(sheetName) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  return Math.max(0, lastRow - 1); // Subtract header row
}

// ==================== STUDENT MANAGEMENT FUNCTIONS ====================

/**
 * Get all students
 * @return {Array} Array of student objects
 */
function getAllStudents() {
  try {
    const sheet = getSheet(SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    const students = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[COLUMNS.STUDENTS.ID]) { // Check if row has data
        students.push({
          id: row[COLUMNS.STUDENTS.ID],
          name: row[COLUMNS.STUDENTS.NAME],
          username: row[COLUMNS.STUDENTS.USERNAME],
          department: row[COLUMNS.STUDENTS.DEPARTMENT]
        });
      }
    }
    
    return students;
  } catch (error) {
    Logger.log('Get students error: ' + error.toString());
    return [];
  }
}

/**
 * Add a new student
 * @param {Object} studentData - Student information
 * @return {Object} Operation result
 */
function addStudent(studentData) {
  try {
    const sheet = getSheet(SHEETS.STUDENTS);
    const id = getNextId(SHEETS.STUDENTS, COLUMNS.STUDENTS.ID);
    
    // Check if username already exists
    const existingStudents = getAllStudents();
    if (existingStudents.some(student => student.username === studentData.username)) {
      return {
        success: false,
        message: 'Username already exists'
      };
    }
    
    const rowData = [
      id,
      studentData.name,
      studentData.username,
      studentData.password,
      studentData.department
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Student added successfully',
      id: id
    };
  } catch (error) {
    Logger.log('Add student error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to add student: ' + error.toString()
    };
  }
}

/**
 * Delete a student
 * @param {number} studentId - ID of student to delete
 * @return {Object} Operation result
 */
function deleteStudent(studentId) {
  try {
    const sheet = getSheet(SHEETS.STUDENTS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.STUDENTS.ID] == studentId) {
        sheet.deleteRow(i + 1);
        return {
          success: true,
          message: 'Student deleted successfully'
        };
      }
    }
    
    return {
      success: false,
      message: 'Student not found'
    };
  } catch (error) {
    Logger.log('Delete student error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to delete student: ' + error.toString()
    };
  }
}

// ==================== COURSE MANAGEMENT FUNCTIONS ====================

/**
 * Get all courses
 * @return {Array} Array of course objects
 */
function getAllCourses() {
  try {
    const sheet = getSheet(SHEETS.COURSES);
    const data = sheet.getDataRange().getValues();
    const courses = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[COLUMNS.COURSES.ID]) { // Check if row has data
        courses.push({
          id: row[COLUMNS.COURSES.ID],
          name: row[COLUMNS.COURSES.NAME],
          description: row[COLUMNS.COURSES.DESCRIPTION]
        });
      }
    }
    
    return courses;
  } catch (error) {
    Logger.log('Get courses error: ' + error.toString());
    return [];
  }
}

/**
 * Add a new course
 * @param {Object} courseData - Course information
 * @return {Object} Operation result
 */
function addCourse(courseData) {
  try {
    const sheet = getSheet(SHEETS.COURSES);
    const id = getNextId(SHEETS.COURSES, COLUMNS.COURSES.ID);
    
    const rowData = [
      id,
      courseData.name,
      courseData.description
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Course added successfully',
      id: id
    };
  } catch (error) {
    Logger.log('Add course error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to add course: ' + error.toString()
    };
  }
}

/**
 * Delete a course
 * @param {number} courseId - ID of course to delete
 * @return {Object} Operation result
 */
function deleteCourse(courseId) {
  try {
    const sheet = getSheet(SHEETS.COURSES);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.COURSES.ID] == courseId) {
        sheet.deleteRow(i + 1);
        return {
          success: true,
          message: 'Course deleted successfully'
        };
      }
    }
    
    return {
      success: false,
      message: 'Course not found'
    };
  } catch (error) {
    Logger.log('Delete course error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to delete course: ' + error.toString()
    };
  }
}

// ==================== ENROLLMENT MANAGEMENT FUNCTIONS ====================

/**
 * Get all enrollments with student and course names
 * @return {Array} Array of enrollment objects
 */
function getAllEnrollments() {
  try {
    const enrollmentSheet = getSheet(SHEETS.ENROLLMENTS);
    const enrollmentData = enrollmentSheet.getDataRange().getValues();
    
    const students = getAllStudents();
    const courses = getAllCourses();
    
    const enrollments = [];
    
    // Skip header row
    for (let i = 1; i < enrollmentData.length; i++) {
      const row = enrollmentData[i];
      if (row[COLUMNS.ENROLLMENTS.STUDENT_ID]) { // Check if row has data
        const student = students.find(s => s.id == row[COLUMNS.ENROLLMENTS.STUDENT_ID]);
        const course = courses.find(c => c.id == row[COLUMNS.ENROLLMENTS.COURSE_ID]);
        
        enrollments.push({
          studentId: row[COLUMNS.ENROLLMENTS.STUDENT_ID],
          courseId: row[COLUMNS.ENROLLMENTS.COURSE_ID],
          status: row[COLUMNS.ENROLLMENTS.STATUS],
          studentName: student ? student.name : 'Unknown',
          courseName: course ? course.name : 'Unknown'
        });
      }
    }
    
    return enrollments;
  } catch (error) {
    Logger.log('Get enrollments error: ' + error.toString());
    return [];
  }
}

/**
 * Enroll a student in a course
 * @param {Object} enrollmentData - Enrollment information
 * @return {Object} Operation result
 */
function enrollStudent(enrollmentData) {
  try {
    const sheet = getSheet(SHEETS.ENROLLMENTS);
    const data = sheet.getDataRange().getValues();
    
    // Check if enrollment already exists
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[COLUMNS.ENROLLMENTS.STUDENT_ID] == enrollmentData.studentId && 
          row[COLUMNS.ENROLLMENTS.COURSE_ID] == enrollmentData.courseId) {
        return {
          success: false,
          message: 'Student is already enrolled in this course'
        };
      }
    }
    
    const rowData = [
      enrollmentData.studentId,
      enrollmentData.courseId,
      enrollmentData.status
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Student enrolled successfully'
    };
  } catch (error) {
    Logger.log('Enroll student error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to enroll student: ' + error.toString()
    };
  }
}

/**
 * Get courses for a specific student
 * @param {number} studentId - Student ID
 * @return {Array} Array of course objects with enrollment status
 */
function getStudentCourses(studentId) {
  try {
    const enrollmentSheet = getSheet(SHEETS.ENROLLMENTS);
    const enrollmentData = enrollmentSheet.getDataRange().getValues();
    
    const courses = getAllCourses();
    const studentCourses = [];
    
    // Skip header row
    for (let i = 1; i < enrollmentData.length; i++) {
      const row = enrollmentData[i];
      if (row[COLUMNS.ENROLLMENTS.STUDENT_ID] == studentId) {
        const course = courses.find(c => c.id == row[COLUMNS.ENROLLMENTS.COURSE_ID]);
        if (course) {
          studentCourses.push({
            ...course,
            status: row[COLUMNS.ENROLLMENTS.STATUS]
          });
        }
      }
    }
    
    return studentCourses;
  } catch (error) {
    Logger.log('Get student courses error: ' + error.toString());
    return [];
  }
}

// ==================== ASSIGNMENT MANAGEMENT FUNCTIONS ====================

/**
 * Get all assignments with course names
 * @return {Array} Array of assignment objects
 */
function getAllAssignments() {
  try {
    const assignmentSheet = getSheet(SHEETS.ASSIGNMENTS);
    const assignmentData = assignmentSheet.getDataRange().getValues();
    
    const courses = getAllCourses();
    const assignments = [];
    
    // Skip header row
    for (let i = 1; i < assignmentData.length; i++) {
      const row = assignmentData[i];
      if (row[COLUMNS.ASSIGNMENTS.ASSIGNMENT_ID]) { // Check if row has data
        const course = courses.find(c => c.id == row[COLUMNS.ASSIGNMENTS.COURSE_ID]);
        
        assignments.push({
          id: row[COLUMNS.ASSIGNMENTS.ASSIGNMENT_ID],
          courseId: row[COLUMNS.ASSIGNMENTS.COURSE_ID],
          title: row[COLUMNS.ASSIGNMENTS.TITLE],
          description: row[COLUMNS.ASSIGNMENTS.DESCRIPTION],
          dueDate: row[COLUMNS.ASSIGNMENTS.DUE_DATE],
          courseName: course ? course.name : 'Unknown'
        });
      }
    }
    
    return assignments;
  } catch (error) {
    Logger.log('Get assignments error: ' + error.toString());
    return [];
  }
}

/**
 * Add a new assignment
 * @param {Object} assignmentData - Assignment information
 * @return {Object} Operation result
 */
function addAssignment(assignmentData) {
  try {
    const sheet = getSheet(SHEETS.ASSIGNMENTS);
    const id = getNextId(SHEETS.ASSIGNMENTS, COLUMNS.ASSIGNMENTS.ASSIGNMENT_ID);
    
    const rowData = [
      id,
      assignmentData.courseId,
      assignmentData.title,
      assignmentData.description,
      assignmentData.dueDate
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Assignment added successfully',
      id: id
    };
  } catch (error) {
    Logger.log('Add assignment error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to add assignment: ' + error.toString()
    };
  }
}

/**
 * Get a specific assignment
 * @param {number} assignmentId - Assignment ID
 * @return {Object} Assignment object
 */
function getAssignment(assignmentId) {
  try {
    const assignments = getAllAssignments();
    return assignments.find(a => a.id == assignmentId) || null;
  } catch (error) {
    Logger.log('Get assignment error: ' + error.toString());
    return null;
  }
}

/**
 * Delete an assignment
 * @param {number} assignmentId - ID of assignment to delete
 * @return {Object} Operation result
 */
function deleteAssignment(assignmentId) {
  try {
    const sheet = getSheet(SHEETS.ASSIGNMENTS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.ASSIGNMENTS.ASSIGNMENT_ID] == assignmentId) {
        sheet.deleteRow(i + 1);
        return {
          success: true,
          message: 'Assignment deleted successfully'
        };
      }
    }
    
    return {
      success: false,
      message: 'Assignment not found'
    };
  } catch (error) {
    Logger.log('Delete assignment error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to delete assignment: ' + error.toString()
    };
  }
}

/**
 * Get assignments for a specific student
 * @param {number} studentId - Student ID
 * @return {Array} Array of assignment objects with submission status
 */
function getStudentAssignments(studentId) {
  try {
    // Get student's enrolled courses
    const studentCourses = getStudentCourses(studentId);
    const courseIds = studentCourses.map(c => c.id);
    
    // Get all assignments for those courses
    const allAssignments = getAllAssignments();
    const studentAssignments = allAssignments.filter(a => courseIds.includes(a.courseId));
    
    // Get submissions to check status
    const submissions = getStudentSubmissions(studentId);
    
    // Add submission status to assignments
    return studentAssignments.map(assignment => {
      const submission = submissions.find(s => s.assignmentId == assignment.id);
      return {
        ...assignment,
        submitted: !!submission,
        grade: submission ? submission.grade : null
      };
    });
  } catch (error) {
    Logger.log('Get student assignments error: ' + error.toString());
    return [];
  }
}

// ==================== SUBMISSION MANAGEMENT FUNCTIONS ====================

/**
 * Get all submissions with assignment and student names
 * @return {Array} Array of submission objects
 */
function getAllSubmissions() {
  try {
    const submissionSheet = getSheet(SHEETS.SUBMISSIONS);
    const submissionData = submissionSheet.getDataRange().getValues();
    
    const assignments = getAllAssignments();
    const students = getAllStudents();
    const submissions = [];
    
    // Skip header row
    for (let i = 1; i < submissionData.length; i++) {
      const row = submissionData[i];
      if (row[COLUMNS.SUBMISSIONS.SUBMISSION_ID]) { // Check if row has data
        const assignment = assignments.find(a => a.id == row[COLUMNS.SUBMISSIONS.ASSIGNMENT_ID]);
        const student = students.find(s => s.id == row[COLUMNS.SUBMISSIONS.STUDENT_ID]);
        
        submissions.push({
          id: row[COLUMNS.SUBMISSIONS.SUBMISSION_ID],
          assignmentId: row[COLUMNS.SUBMISSIONS.ASSIGNMENT_ID],
          studentId: row[COLUMNS.SUBMISSIONS.STUDENT_ID],
          submissionDate: row[COLUMNS.SUBMISSIONS.SUBMISSION_DATE],
          grade: row[COLUMNS.SUBMISSIONS.GRADE],
          submissionText: row[COLUMNS.SUBMISSIONS.SUBMISSION_TEXT] || '',
          assignmentTitle: assignment ? assignment.title : 'Unknown',
          studentName: student ? student.name : 'Unknown'
        });
      }
    }
    
    return submissions;
  } catch (error) {
    Logger.log('Get submissions error: ' + error.toString());
    return [];
  }
}

/**
 * Submit an assignment
 * @param {Object} submissionData - Submission information
 * @return {Object} Operation result
 */
function submitAssignment(submissionData) {
  try {
    const sheet = getSheet(SHEETS.SUBMISSIONS);
    const id = getNextId(SHEETS.SUBMISSIONS, COLUMNS.SUBMISSIONS.SUBMISSION_ID);
    
    // Check if submission already exists
    const existingSubmissions = getAllSubmissions();
    const existing = existingSubmissions.find(s => 
      s.assignmentId == submissionData.assignmentId && 
      s.studentId == submissionData.studentId
    );
    
    if (existing) {
      return {
        success: false,
        message: 'Assignment has already been submitted'
      };
    }
    
    const rowData = [
      id,
      submissionData.assignmentId,
      submissionData.studentId,
      new Date().toISOString(),
      '', // Grade (empty initially)
      submissionData.submissionText || ''
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Assignment submitted successfully',
      id: id
    };
  } catch (error) {
    Logger.log('Submit assignment error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to submit assignment: ' + error.toString()
    };
  }
}

/**
 * Get submissions for a specific student
 * @param {number} studentId - Student ID
 * @return {Array} Array of submission objects
 */
function getStudentSubmissions(studentId) {
  try {
    const allSubmissions = getAllSubmissions();
    return allSubmissions.filter(s => s.studentId == studentId);
  } catch (error) {
    Logger.log('Get student submissions error: ' + error.toString());
    return [];
  }
}

/**
 * Grade a submission
 * @param {number} submissionId - Submission ID
 * @param {string} grade - Grade to assign
 * @return {Object} Operation result
 */
function gradeSubmission(submissionId, grade) {
  try {
    const sheet = getSheet(SHEETS.SUBMISSIONS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.SUBMISSIONS.SUBMISSION_ID] == submissionId) {
        sheet.getRange(i + 1, COLUMNS.SUBMISSIONS.GRADE + 1).setValue(grade);
        return {
          success: true,
          message: 'Submission graded successfully'
        };
      }
    }
    
    return {
      success: false,
      message: 'Submission not found'
    };
  } catch (error) {
    Logger.log('Grade submission error: ' + error.toString());
    return {
      success: false,
      message: 'Failed to grade submission: ' + error.toString()
    };
  }
}

// ==================== PROGRESS TRACKING FUNCTIONS ====================

/**
 * Get progress data for a specific student
 * @param {number} studentId - Student ID
 * @return {Object} Progress data
 */
function getStudentProgress(studentId) {
  try {
    const studentCourses = getStudentCourses(studentId);
    const submissions = getStudentSubmissions(studentId);
    
    const coursesEnrolled = studentCourses.length;
    const coursesCompleted = studentCourses.filter(c => c.status === 'Completed').length;
    const assignmentsSubmitted = submissions.length;
    
    // Calculate average grade
    const gradedSubmissions = submissions.filter(s => s.grade && s.grade !== '');
    const averageGrade = gradedSubmissions.length > 0 ? 
      (gradedSubmissions.reduce((sum, s) => sum + parseFloat(s.grade || 0), 0) / gradedSubmissions.length).toFixed(2) : 
      null;
    
    // Calculate course progress
    const courseProgress = [];
    for (const course of studentCourses) {
      const courseAssignments = getAllAssignments().filter(a => a.courseId == course.id);
      const courseSubmissions = submissions.filter(s => 
        courseAssignments.some(a => a.id == s.assignmentId)
      );
      
      const progress = courseAssignments.length > 0 ? 
        Math.round((courseSubmissions.length / courseAssignments.length) * 100) : 
        0;
      
      courseProgress.push({
        name: course.name,
        progress: progress
      });
    }
    
    return {
      coursesEnrolled,
      coursesCompleted,
      assignmentsSubmitted,
      averageGrade,
      courseProgress
    };
  } catch (error) {
    Logger.log('Get student progress error: ' + error.toString());
    return {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      assignmentsSubmitted: 0,
      averageGrade: null,
      courseProgress: []
    };
  }
}

/**
 * Get overall progress data for all students
 * @return {Array} Array of progress data for all students
 */
function getAllProgress() {
  try {
    const students = getAllStudents();
    const progressData = [];
    
    for (const student of students) {
      const progress = getStudentProgress(student.id);
      progressData.push({
        studentId: student.id,
        studentName: student.name,
        department: student.department,
        ...progress
      });
    }
    
    return progressData;
  } catch (error) {
    Logger.log('Get all progress error: ' + error.toString());
    return [];
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Test function to verify script setup
 * @return {string} Test result
 */
function testSetup() {
  try {
    const stats = getDashboardStats();
    return 'LMS Backend is working correctly. Stats: ' + JSON.stringify(stats);
  } catch (error) {
    return 'Setup error: ' + error.toString();
  }
}

/**
 * Initialize the LMS with sample data (run once)
 * WARNING: This will add sample data to your sheets
 */
function initializeSampleData() {
  try {
    // Add sample students
    addStudent({
      name: 'John Doe',
      username: 'john.doe',
      password: 'password123',
      department: 'Computer Science'
    });
    
    addStudent({
      name: 'Jane Smith',
      username: 'jane.smith',
      password: 'password123',
      department: 'Mathematics'
    });
    
    // Add sample courses
    addCourse({
      name: 'Introduction to Programming',
      description: 'Learn the basics of programming with Python'
    });
    
    addCourse({
      name: 'Data Structures',
      description: 'Understanding fundamental data structures and algorithms'
    });
    
    // Add sample enrollments
    enrollStudent({
      studentId: 1,
      courseId: 1,
      status: 'Enrolled'
    });
    
    enrollStudent({
      studentId: 2,
      courseId: 1,
      status: 'Enrolled'
    });
    
    // Add sample assignment
    addAssignment({
      courseId: 1,
      title: 'Hello World Program',
      description: 'Write your first Python program that prints "Hello, World!"',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Due in 7 days
    });
    
    return 'Sample data initialized successfully!';
  } catch (error) {
    return 'Failed to initialize sample data: ' + error.toString();
  }
} 