/**
 * SchoolGate - School Permission Management System
 * Google Apps Script Backend
 */

// Global variables for sheet names
const SHEET_NAMES = {
  TEACHERS: "Teachers",
  STUDENTS: "Students",
  ATTENDANCE: "Attendance",
  PERMISSIONS: "Permissions",
  DISCIPLINE: "DisciplinePoints",
  VIOLATIONS: "ViolationTypes",
  CLASSES: "Classes",
  SETTINGS: "Settings"
};

/**
 * Executes when the web app is accessed via GET request
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Executes when the web app is accessed via POST request
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Main function to handle all requests
 */
function handleRequest(e) {
  try {
    // Setup the spreadsheet if it doesn't exist or is missing sheets
    setupSpreadsheetIfNeeded();
    
    // Get the action parameter
    const action = e.parameter.action;
    
    // Authentication check for all actions except login
    if (action !== "login" && action !== "checkSetup") {
      const username = e.parameter.username;
      const password = e.parameter.password;
      const role = e.parameter.role;
      
      if (!authenticate(username, password, role)) {
        return createResponse("error", "Authentication failed", null);
      }
    }
    
    // Route the request based on action
    switch (action) {
      case "checkSetup":
        return createResponse("success", "System is set up", { isSetup: true });
        
      case "login":
        return handleLogin(e);
        
      // Teacher actions
      case "getStudentStats":
        return getStudentStats(e);
        
      case "getStudents":
        return getStudents(e);
        
      case "addStudent":
        return addStudent(e);
        
      case "updateStudent":
        return updateStudent(e);
        
      case "deleteStudent":
        return deleteStudent(e);
        
      case "getClasses":
        return getClasses(e);
        
      case "getPermissions":
        return getPermissions(e);
        
      case "approvePermission":
        return updatePermissionStatus(e, "Approved");
        
      case "rejectPermission":
        return updatePermissionStatus(e, "Rejected");
        
      case "getDisciplinePoints":
        return getDisciplinePoints(e);
        
      case "addDisciplinePoint":
        return addDisciplinePoint(e);
        
      case "getViolationTypes":
        return getViolationTypes(e);
        
      // Student actions
      case "getStudentProfile":
        return getStudentProfile(e);
        
      case "requestPermission":
        return requestPermission(e);
        
      case "getStudentPermissions":
        return getStudentPermissions(e);
        
      case "getStudentAttendance":
        return getStudentAttendance(e);
        
      case "getStudentDiscipline":
        return getStudentDiscipline(e);
        
      // Late arrivals handling
      case "getLateRecords":
        return getLateRecords(e);
        
      case "addLateRecord":
        return addLateRecord(e);
        
      case "updateLateRecord":
        return updateLateRecord(e);
        
      case "deleteLateRecord":
        return deleteLateRecord(e);
        
      default:
        return createResponse("error", "Unknown action", null);
    }
  } catch (error) {
    return createResponse("error", error.toString(), null);
  }
}

/**
 * Creates a standardized JSON response
 */
function createResponse(status, message, data) {
  const response = {
    status: status,
    message: message,
    data: data
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sets up the spreadsheet and its sheets if they don't exist
 */
function setupSpreadsheetIfNeeded() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create sheets if they don't exist
  createSheetIfNotExists(spreadsheet, SHEET_NAMES.TEACHERS, [
    "TeacherID", "Username", "Password", "FullName", "Position", 
    "Department", "Email", "PhoneNumber", "Status"
  ]);
  
  createSheetIfNotExists(spreadsheet, SHEET_NAMES.STUDENTS, [
    "StudentID", "Username", "Password", "FullName", "Class", 
    "Grade", "ParentName", "ParentContact", "Email", "Status"
  ]);
  
  createSheetIfNotExists(spreadsheet, SHEET_NAMES.ATTENDANCE, [
    "RecordID", "StudentID", "Date", "TimeIn", "Status", 
    "LateMinutes", "Notes"
  ]);
  
  createSheetIfNotExists(spreadsheet, SHEET_NAMES.PERMISSIONS, [
    "PermissionID", "StudentID", "RequestDate", "LeaveDate", 
    "LeaveTime", "ReturnTime", "Reason", "Notes", "Status", 
    "ApprovedByTeacherID", "ResponseDate", "ResponseNotes"
  ]);
  
  createSheetIfNotExists(spreadsheet, SHEET_NAMES.DISCIPLINE, [
    "RecordID", "StudentID", "Date", "ViolationType", 
    "Points", "Description", "IssuedByTeacherID", "Notes"
  ]);
  
  createSheetIfNotExists(spreadsheet, SHEET_NAMES.VIOLATIONS, [
    "ViolationID", "ViolationName", "PointValue", "Description"
  ]);
  
  createSheetIfNotExists(spreadsheet, SHEET_NAMES.CLASSES, [
    "ClassID", "ClassName", "Grade", "HomeroomTeacherID", "SchoolYear"
  ]);
  
  createSheetIfNotExists(spreadsheet, SHEET_NAMES.SETTINGS, [
    "SettingName", "SettingValue", "Description"
  ]);
  
  // Add default settings if the settings sheet is empty
  const settingsSheet = spreadsheet.getSheetByName(SHEET_NAMES.SETTINGS);
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(["MaximumPoints", "100", "Maximum discipline points before serious consequences"]);
    settingsSheet.appendRow(["PointsWarningThreshold", "70", "Points at which to issue a warning"]);
    settingsSheet.appendRow(["DefaultPermissionDuration", "120", "Default permission duration in minutes"]);
  }
  
  // Add default violation types if the violations sheet is empty
  const violationsSheet = spreadsheet.getSheetByName(SHEET_NAMES.VIOLATIONS);
  if (violationsSheet.getLastRow() <= 1) {
    violationsSheet.appendRow(["1", "Late to School", "2", "Arriving late to school"]);
    violationsSheet.appendRow(["2", "Uniform Violation", "5", "Not wearing proper school uniform"]);
    violationsSheet.appendRow(["3", "Disrespecting Teacher", "10", "Disrespecting a teacher or staff member"]);
    violationsSheet.appendRow(["4", "Skipping Class", "15", "Not attending class without permission"]);
    violationsSheet.appendRow(["5", "Fighting", "25", "Physical altercation with another student"]);
  }
  
  // Create an admin teacher if teachers sheet is empty
  const teachersSheet = spreadsheet.getSheetByName(SHEET_NAMES.TEACHERS);
  if (teachersSheet.getLastRow() <= 1) {
    teachersSheet.appendRow(["1", "admin", "admin123", "Administrator", "Principal", 
                           "Administration", "admin@school.edu", "123-456-7890", "Active"]);
  }
}

/**
 * Creates a sheet if it doesn't exist and adds header row
 */
function createSheetIfNotExists(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    
    // Format header row
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#E0E0E0")
      .setFontWeight("bold");
      
    // Freeze header row
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Authenticates a user based on username, password, and role
 */
function authenticate(username, password, role) {
  if (!username || !password || !role) return false;
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;
    let statusIndex;
    
    if (role === "teacher") {
      sheet = spreadsheet.getSheetByName(SHEET_NAMES.TEACHERS);
      statusIndex = 8; // Status is at index 8 for teachers
    } else if (role === "student") {
      sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
      statusIndex = 9; // Status is at index 9 for students
    } else {
      return false;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      // More lenient check for status - allow any non-empty value that contains "active" (case insensitive)
      const statusValue = data[i][statusIndex] ? String(data[i][statusIndex]).trim() : "";
      const isActive = statusValue.toLowerCase() === "active" || 
                        statusValue === "1" || 
                        statusValue.toLowerCase() === "yes" ||
                        statusValue.toLowerCase() === "ya";
      
      if (data[i][1] === username && data[i][2] === password && isActive) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    Logger.log("Authentication error: " + error);
    return false;
  }
}

/**
 * Handles user login
 */
function handleLogin(e) {
  const username = e.parameter.username;
  const password = e.parameter.password;
  const role = e.parameter.role;
  
  // Add debug logging
  Logger.log("Login attempt - Username: " + username + ", Role: " + role);
  
  if (!username || !password || !role) {
    return createResponse("error", "Missing login credentials", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;
    let statusIndex;
    
    if (role === "teacher") {
      sheet = spreadsheet.getSheetByName(SHEET_NAMES.TEACHERS);
      statusIndex = 8; // Status is at index 8 for teachers
    } else if (role === "student") {
      sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
      statusIndex = 9; // Status is at index 9 for students
      
      // Add detailed logging for student sheet
      const data = sheet.getDataRange().getValues();
      Logger.log("Student sheet found with " + data.length + " rows (including header)");
      if (data.length > 1) {
        // Log column names to verify structure
        Logger.log("Columns: " + JSON.stringify(data[0]));
        
        // Log first student record (skip password for security)
        const firstStudent = [...data[1]];
        firstStudent[2] = "HIDDEN"; // Hide password
        Logger.log("First student: " + JSON.stringify(firstStudent));
        Logger.log("Status value at index " + statusIndex + ": " + firstStudent[statusIndex]);
        
        // Try to find the student
        let found = false;
        for (let i = 1; i < data.length; i++) {
          if (data[i][1] === username) {
            Logger.log("Found username match at row " + (i+1));
            Logger.log("Password match: " + (data[i][2] === password));
            Logger.log("Status value: '" + data[i][statusIndex] + "'");
            Logger.log("Status match: " + (data[i][statusIndex] === "Active"));
            found = true;
            break;
          }
        }
        if (!found) {
          Logger.log("Username not found in student records");
        }
      } else {
        Logger.log("No student records found in sheet");
      }
    } else {
      return createResponse("error", "Invalid role", null);
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      // More lenient check for status - allow any non-empty value that contains "active" (case insensitive)
      const statusValue = data[i][statusIndex] ? String(data[i][statusIndex]).trim() : "";
      const isActive = statusValue.toLowerCase() === "active" || 
                        statusValue === "1" || 
                        statusValue.toLowerCase() === "yes" ||
                        statusValue.toLowerCase() === "ya";
      
      if (data[i][1] === username && data[i][2] === password && isActive) {
        // Return user data excluding password
        const user = {
          id: data[i][0],
          username: data[i][1],
          fullName: data[i][3],
          role: role,
          // Include additional fields based on role
          ...(role === "teacher" 
            ? { position: data[i][4], department: data[i][5] }
            : { class: data[i][4], grade: data[i][5] })
        };
        
        Logger.log("Login successful for " + role + ": " + username);
        return createResponse("success", "Login successful", user);
      } else if (data[i][1] === username) {
        // Debug if we found the username but login failed
        Logger.log("Found username but login failed:");
        Logger.log("- Username match: true");
        Logger.log("- Password match: " + (data[i][2] === password));
        Logger.log("- Status value: '" + statusValue + "'");
        Logger.log("- Is active: " + isActive);
      }
    }
    
    Logger.log("Invalid credentials for " + role + ": " + username);
    return createResponse("error", "Invalid credentials", null);
  } catch (error) {
    Logger.log("Login error: " + error.toString());
    return createResponse("error", "Login failed: " + error, null);
  }
}

/**
 * Gets list of students
 */
function getStudents(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
    const data = sheet.getDataRange().getValues();
    
    const headers = data[0];
    const students = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const student = {};
      for (let j = 0; j < headers.length; j++) {
        // Skip password field
        if (headers[j] !== "Password") {
          student[headers[j]] = data[i][j];
        }
      }
      students.push(student);
    }
    
    return createResponse("success", "Students retrieved successfully", students);
  } catch (error) {
    return createResponse("error", "Failed to retrieve students: " + error, null);
  }
}

/**
 * Gets all permissions
 */
function getPermissions(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const permissionsSheet = spreadsheet.getSheetByName(SHEET_NAMES.PERMISSIONS);
    const permissionsData = permissionsSheet.getDataRange().getValues();
    
    const studentsSheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
    const studentsData = studentsSheet.getDataRange().getValues();
    
    const permissionsHeaders = permissionsData[0];
    const permissions = [];
    
    // Create a map of student IDs to names for quick lookup
    const studentMap = {};
    for (let i = 1; i < studentsData.length; i++) {
      studentMap[studentsData[i][0]] = studentsData[i][3]; // StudentID -> FullName
    }
    
    // Skip header row
    for (let i = 1; i < permissionsData.length; i++) {
      const permission = {};
      for (let j = 0; j < permissionsHeaders.length; j++) {
        permission[permissionsHeaders[j]] = permissionsData[i][j];
      }
      
      // Add student name
      permission.StudentName = studentMap[permission.StudentID] || "Unknown";
      
      permissions.push(permission);
    }
    
    return createResponse("success", "Permissions retrieved successfully", permissions);
  } catch (error) {
    return createResponse("error", "Failed to retrieve permissions: " + error, null);
  }
}

/**
 * Updates permission status (approve/reject)
 */
function updatePermissionStatus(e, status) {
  const permissionId = e.parameter.permissionId;
  const teacherId = e.parameter.teacherId;
  const notes = e.parameter.notes || "";
  
  if (!permissionId || !teacherId) {
    return createResponse("error", "Missing required parameters", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.PERMISSIONS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == permissionId) {
        // Update status, teacher ID, response date and notes
        sheet.getRange(i + 1, 9).setValue(status); // Status column
        sheet.getRange(i + 1, 10).setValue(teacherId); // ApprovedByTeacherID column
        sheet.getRange(i + 1, 11).setValue(new Date()); // ResponseDate column
        sheet.getRange(i + 1, 12).setValue(notes); // ResponseNotes column
        
        return createResponse("success", `Permission request ${status.toLowerCase()}`, null);
      }
    }
    
    return createResponse("error", "Permission request not found", null);
  } catch (error) {
    return createResponse("error", "Failed to update permission status: " + error, null);
  }
}

/**
 * Gets student attendance and statistics
 */
function getStudentStats(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const attendanceSheet = spreadsheet.getSheetByName(SHEET_NAMES.ATTENDANCE);
    const attendanceData = attendanceSheet.getDataRange().getValues();
    
    const disciplineSheet = spreadsheet.getSheetByName(SHEET_NAMES.DISCIPLINE);
    const disciplineData = disciplineSheet.getDataRange().getValues();
    
    // Calculate statistics
    let totalStudents = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_NAMES.STUDENTS)
      .getLastRow() - 1;
    
    let lateToday = 0;
    let totalLate = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < attendanceData.length; i++) {
      const attendanceDate = new Date(attendanceData[i][2]);
      attendanceDate.setHours(0, 0, 0, 0);
      
      if (attendanceData[i][4] === "Late") {
        totalLate++;
        
        if (attendanceDate.getTime() === today.getTime()) {
          lateToday++;
        }
      }
    }
    
    // Get top violations
    const violations = {};
    for (let i = 1; i < disciplineData.length; i++) {
      const violationType = disciplineData[i][3];
      violations[violationType] = (violations[violationType] || 0) + 1;
    }
    
    // Sort violations by count
    const topViolations = Object.entries(violations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    const stats = {
      totalStudents,
      lateToday,
      totalLate,
      averageLatePerDay: totalLate / (totalStudents || 1),
      topViolations
    };
    
    return createResponse("success", "Statistics retrieved successfully", stats);
  } catch (error) {
    return createResponse("error", "Failed to retrieve statistics: " + error, null);
  }
}

/**
 * Gets a student's permissions
 */
function getStudentPermissions(e) {
  const studentId = e.parameter.studentId;
  
  if (!studentId) {
    return createResponse("error", "Student ID is required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.PERMISSIONS);
    const data = sheet.getDataRange().getValues();
    
    const headers = data[0];
    const permissions = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] == studentId) {
        const permission = {};
        for (let j = 0; j < headers.length; j++) {
          permission[headers[j]] = data[i][j];
        }
        permissions.push(permission);
      }
    }
    
    return createResponse("success", "Permissions retrieved successfully", permissions);
  } catch (error) {
    return createResponse("error", "Failed to retrieve permissions: " + error, null);
  }
}

/**
 * Creates a new permission request
 */
function requestPermission(e) {
  const studentId = e.parameter.studentId;
  const leaveDate = e.parameter.leaveDate;
  const leaveTime = e.parameter.leaveTime;
  const returnTime = e.parameter.returnTime;
  const reason = e.parameter.reason;
  const notes = e.parameter.notes || "";
  
  if (!studentId || !leaveDate || !leaveTime || !returnTime || !reason) {
    return createResponse("error", "Missing required parameters", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.PERMISSIONS);
    
    // Generate a new permission ID
    const permissionId = Utilities.getUuid().slice(0, 8);
    
    // Add new permission request
    sheet.appendRow([
      permissionId,
      studentId,
      new Date(), // Request date
      leaveDate,
      leaveTime,
      returnTime,
      reason,
      notes,
      "Pending", // Status
      "", // ApprovedByTeacherID
      "", // ResponseDate
      "" // ResponseNotes
    ]);
    
    return createResponse("success", "Permission request submitted successfully", { permissionId });
  } catch (error) {
    return createResponse("error", "Failed to submit permission request: " + error, null);
  }
}

/**
 * Adds a new student
 */
function addStudent(e) {
  const username = e.parameter.username;
  const password = e.parameter.password;
  const fullName = e.parameter.fullName;
  const studentClass = e.parameter.class;
  const grade = e.parameter.grade;
  const parentName = e.parameter.parentName || "";
  const parentContact = e.parameter.parentContact || "";
  const email = e.parameter.email || "";
  
  if (!username || !password || !fullName || !studentClass || !grade) {
    return createResponse("error", "Missing required parameters", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
    
    // Check if username already exists
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === username) {
        return createResponse("error", "Username already exists", null);
      }
    }
    
    // Generate a new student ID
    const studentId = "S" + new Date().getTime().toString().slice(-8);
    
    // Add new student
    sheet.appendRow([
      studentId,
      username,
      password,
      fullName,
      studentClass,
      grade,
      parentName,
      parentContact,
      email,
      "Active" // Status
    ]);
    
    return createResponse("success", "Student added successfully", { studentId });
  } catch (error) {
    return createResponse("error", "Failed to add student: " + error, null);
  }
}

/**
 * Updates a student's information
 */
function updateStudent(e) {
  const studentId = e.parameter.studentId;
  const username = e.parameter.username;
  const password = e.parameter.password;
  const fullName = e.parameter.fullName;
  const studentClass = e.parameter.class;
  const grade = e.parameter.grade;
  const parentName = e.parameter.parentName;
  const parentContact = e.parameter.parentContact;
  const email = e.parameter.email;
  const status = e.parameter.status;
  
  if (!studentId) {
    return createResponse("error", "Student ID is required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === studentId) {
        // Update only provided fields
        if (username) sheet.getRange(i + 1, 2).setValue(username);
        if (password) sheet.getRange(i + 1, 3).setValue(password);
        if (fullName) sheet.getRange(i + 1, 4).setValue(fullName);
        if (studentClass) sheet.getRange(i + 1, 5).setValue(studentClass);
        if (grade) sheet.getRange(i + 1, 6).setValue(grade);
        if (parentName) sheet.getRange(i + 1, 7).setValue(parentName);
        if (parentContact) sheet.getRange(i + 1, 8).setValue(parentContact);
        if (email) sheet.getRange(i + 1, 9).setValue(email);
        if (status) sheet.getRange(i + 1, 10).setValue(status);
        
        return createResponse("success", "Student updated successfully", null);
      }
    }
    
    return createResponse("error", "Student not found", null);
  } catch (error) {
    return createResponse("error", "Failed to update student: " + error, null);
  }
}

/**
 * Deletes a student (marks as inactive)
 */
function deleteStudent(e) {
  const studentId = e.parameter.studentId;
  
  if (!studentId) {
    return createResponse("error", "Student ID is required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === studentId) {
        // Mark as inactive instead of deleting
        sheet.getRange(i + 1, 10).setValue("Inactive");
        
        return createResponse("success", "Student deleted successfully", null);
      }
    }
    
    return createResponse("error", "Student not found", null);
  } catch (error) {
    return createResponse("error", "Failed to delete student: " + error, null);
  }
}

/**
 * Gets discipline points for all students or a specific student
 */
function getDisciplinePoints(e) {
  const studentId = e.parameter.studentId; // Optional
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const disciplineSheet = spreadsheet.getSheetByName(SHEET_NAMES.DISCIPLINE);
    const disciplineData = disciplineSheet.getDataRange().getValues();
    
    const studentsSheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
    const studentsData = studentsSheet.getDataRange().getValues();
    
    const headers = disciplineData[0];
    const disciplinePoints = [];
    
    // Create a map of student IDs to names for quick lookup
    const studentMap = {};
    for (let i = 1; i < studentsData.length; i++) {
      studentMap[studentsData[i][0]] = studentsData[i][3]; // StudentID -> FullName
    }
    
    // Skip header row
    for (let i = 1; i < disciplineData.length; i++) {
      if (!studentId || disciplineData[i][1] === studentId) {
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = disciplineData[i][j];
        }
        
        // Add student name
        record.StudentName = studentMap[record.StudentID] || "Unknown";
        
        disciplinePoints.push(record);
      }
    }
    
    return createResponse("success", "Discipline points retrieved successfully", disciplinePoints);
  } catch (error) {
    return createResponse("error", "Failed to retrieve discipline points: " + error, null);
  }
}

/**
 * Adds discipline points to a student
 */
function addDisciplinePoint(e) {
  const studentId = e.parameter.studentId;
  const violationType = e.parameter.violationType;
  const points = e.parameter.points;
  const description = e.parameter.description || "";
  const teacherId = e.parameter.teacherId;
  const notes = e.parameter.notes || "";
  
  if (!studentId || !violationType || !points || !teacherId) {
    return createResponse("error", "Missing required parameters", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.DISCIPLINE);
    
    // Generate a new record ID
    const recordId = "D" + new Date().getTime().toString().slice(-8);
    
    // Add new discipline record
    sheet.appendRow([
      recordId,
      studentId,
      new Date(), // Date
      violationType,
      points,
      description,
      teacherId,
      notes
    ]);
    
    return createResponse("success", "Discipline points added successfully", { recordId });
  } catch (error) {
    return createResponse("error", "Failed to add discipline points: " + error, null);
  }
}

/**
 * Gets violation types
 */
function getViolationTypes(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.VIOLATIONS);
    const data = sheet.getDataRange().getValues();
    
    const headers = data[0];
    const violations = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const violation = {};
      for (let j = 0; j < headers.length; j++) {
        violation[headers[j]] = data[i][j];
      }
      violations.push(violation);
    }
    
    return createResponse("success", "Violation types retrieved successfully", violations);
  } catch (error) {
    return createResponse("error", "Failed to retrieve violation types: " + error, null);
  }
}

/**
 * Gets student profile with attendance and discipline summary
 */
function getStudentProfile(e) {
  const studentId = e.parameter.studentId;
  
  if (!studentId) {
    return createResponse("error", "Student ID is required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get student details
    const studentsSheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
    const studentsData = studentsSheet.getDataRange().getValues();
    
    let student = null;
    for (let i = 1; i < studentsData.length; i++) {
      if (studentsData[i][0] === studentId) {
        student = {
          StudentID: studentsData[i][0],
          Username: studentsData[i][1],
          FullName: studentsData[i][3],
          Class: studentsData[i][4],
          Grade: studentsData[i][5],
          ParentName: studentsData[i][6],
          ParentContact: studentsData[i][7],
          Email: studentsData[i][8],
          Status: studentsData[i][9]
        };
        break;
      }
    }
    
    if (!student) {
      return createResponse("error", "Student not found", null);
    }
    
    // Get attendance summary
    const attendanceSheet = spreadsheet.getSheetByName(SHEET_NAMES.ATTENDANCE);
    const attendanceData = attendanceSheet.getDataRange().getValues();
    
    let totalAttendance = 0;
    let lateCount = 0;
    
    for (let i = 1; i < attendanceData.length; i++) {
      if (attendanceData[i][1] === studentId) {
        totalAttendance++;
        if (attendanceData[i][4] === "Late") {
          lateCount++;
        }
      }
    }
    
    // Get discipline summary
    const disciplineSheet = spreadsheet.getSheetByName(SHEET_NAMES.DISCIPLINE);
    const disciplineData = disciplineSheet.getDataRange().getValues();
    
    let totalPoints = 0;
    let violationCount = 0;
    
    for (let i = 1; i < disciplineData.length; i++) {
      if (disciplineData[i][1] === studentId) {
        totalPoints += Number(disciplineData[i][4]);
        violationCount++;
      }
    }
    
    // Get settings
    const settingsSheet = spreadsheet.getSheetByName(SHEET_NAMES.SETTINGS);
    const settingsData = settingsSheet.getDataRange().getValues();
    
    let maxPoints = 100;
    let warningThreshold = 70;
    
    for (let i = 1; i < settingsData.length; i++) {
      if (settingsData[i][0] === "MaximumPoints") {
        maxPoints = Number(settingsData[i][1]);
      } else if (settingsData[i][0] === "PointsWarningThreshold") {
        warningThreshold = Number(settingsData[i][1]);
      }
    }
    
    // Combine all data
    const profile = {
      student,
      attendance: {
        total: totalAttendance,
        lateCount,
        latePercentage: totalAttendance > 0 ? (lateCount / totalAttendance) * 100 : 0
      },
      discipline: {
        totalPoints,
        violationCount,
        maxPoints,
        warningThreshold,
        percentToMax: (totalPoints / maxPoints) * 100
      }
    };
    
    return createResponse("success", "Student profile retrieved successfully", profile);
  } catch (error) {
    return createResponse("error", "Failed to retrieve student profile: " + error, null);
  }
}

/**
 * Gets a student's attendance records
 */
function getStudentAttendance(e) {
  const studentId = e.parameter.studentId;
  
  if (!studentId) {
    return createResponse("error", "Student ID is required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.ATTENDANCE);
    const data = sheet.getDataRange().getValues();
    
    const headers = data[0];
    const attendance = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === studentId) {
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = data[i][j];
        }
        attendance.push(record);
      }
    }
    
    return createResponse("success", "Attendance records retrieved successfully", attendance);
  } catch (error) {
    return createResponse("error", "Failed to retrieve attendance records: " + error, null);
  }
}

/**
 * Gets a student's discipline records
 */
function getStudentDiscipline(e) {
  const studentId = e.parameter.studentId;
  
  if (!studentId) {
    return createResponse("error", "Student ID is required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const disciplineSheet = spreadsheet.getSheetByName(SHEET_NAMES.DISCIPLINE);
    const disciplineData = disciplineSheet.getDataRange().getValues();
    
    const teachersSheet = spreadsheet.getSheetByName(SHEET_NAMES.TEACHERS);
    const teachersData = teachersSheet.getDataRange().getValues();
    
    const headers = disciplineData[0];
    const discipline = [];
    
    // Create a map of teacher IDs to names for quick lookup
    const teacherMap = {};
    for (let i = 1; i < teachersData.length; i++) {
      teacherMap[teachersData[i][0]] = teachersData[i][3]; // TeacherID -> FullName
    }
    
    // Skip header row
    for (let i = 1; i < disciplineData.length; i++) {
      if (disciplineData[i][1] === studentId) {
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = disciplineData[i][j];
        }
        
        // Add teacher name
        record.TeacherName = teacherMap[record.IssuedByTeacherID] || "Unknown";
        
        discipline.push(record);
      }
    }
    
    return createResponse("success", "Discipline records retrieved successfully", discipline);
  } catch (error) {
    return createResponse("error", "Failed to retrieve discipline records: " + error, null);
  }
}

/**
 * Gets late records (attendance with "Late" status)
 */
function getLateRecords(e) {
  const date = e.parameter.date || null;
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.ATTENDANCE);
    const data = sheet.getDataRange().getValues();
    
    const headers = data[0];
    let lateRecords = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][4] === "Late") { // Status column index is 4
        const recordDate = data[i][2]; // Date column index is 2
        
        // Filter by date if provided
        if (date) {
          const recordDateStr = Utilities.formatDate(recordDate, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "yyyy-MM-dd");
          if (recordDateStr !== date) {
            continue;
          }
        }
        
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = data[i][j];
        }
        lateRecords.push(record);
      }
    }
    
    return createResponse("success", "Late records retrieved successfully", lateRecords);
  } catch (error) {
    return createResponse("error", "Failed to retrieve late records: " + error, null);
  }
}

/**
 * Adds a new late record
 */
function addLateRecord(e) {
  const studentId = e.parameter.studentId;
  const date = e.parameter.date ? new Date(e.parameter.date) : new Date();
  const timeIn = e.parameter.timeIn || "";
  const lateMinutes = e.parameter.lateMinutes || 0;
  const notes = e.parameter.notes || "";
  const addDiscipline = e.parameter.addDiscipline === "true";
  const teacherId = e.parameter.teacherId;
  
  if (!studentId) {
    return createResponse("error", "Student ID is required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const attendanceSheet = spreadsheet.getSheetByName(SHEET_NAMES.ATTENDANCE);
    
    // Generate a new record ID
    const recordId = "A" + new Date().getTime().toString().slice(-8);
    
    // Add new attendance record with Late status
    attendanceSheet.appendRow([
      recordId,
      studentId,
      date,
      timeIn,
      "Late", // Status
      lateMinutes,
      notes
    ]);
    
    // Add discipline points for lateness if requested
    if (addDiscipline && teacherId) {
      const violationsSheet = spreadsheet.getSheetByName(SHEET_NAMES.VIOLATIONS);
      const violationsData = violationsSheet.getDataRange().getValues();
      
      // Find the "Late to School" violation type
      let violationType = null;
      let points = 2; // Default points if violation type not found
      
      for (let i = 1; i < violationsData.length; i++) {
        if (violationsData[i][1] === "Late to School") {
          violationType = violationsData[i][0];
          points = violationsData[i][2];
          break;
        }
      }
      
      if (violationType) {
        const disciplineSheet = spreadsheet.getSheetByName(SHEET_NAMES.DISCIPLINE);
        
        // Generate a new discipline record ID
        const disciplineRecordId = "D" + new Date().getTime().toString().slice(-8);
        
        // Add discipline record
        disciplineSheet.appendRow([
          disciplineRecordId,
          studentId,
          date,
          violationType,
          points,
          "Keterlambatan " + lateMinutes + " menit",
          teacherId,
          notes
        ]);
      }
    }
    
    return createResponse("success", "Late record added successfully", { recordId });
  } catch (error) {
    return createResponse("error", "Failed to add late record: " + error, null);
  }
}

/**
 * Updates an existing late record
 */
function updateLateRecord(e) {
  const recordId = e.parameter.recordId;
  const studentId = e.parameter.studentId;
  const date = e.parameter.date ? new Date(e.parameter.date) : null;
  const timeIn = e.parameter.timeIn;
  const lateMinutes = e.parameter.lateMinutes;
  const notes = e.parameter.notes;
  
  if (!recordId || !studentId) {
    return createResponse("error", "Record ID and Student ID are required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.ATTENDANCE);
    const data = sheet.getDataRange().getValues();
    
    let rowIndex = -1;
    
    // Find the record
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === recordId) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse("error", "Late record not found", null);
    }
    
    // Update the record
    if (date) sheet.getRange(rowIndex, 3).setValue(date);
    if (timeIn) sheet.getRange(rowIndex, 4).setValue(timeIn);
    if (lateMinutes) sheet.getRange(rowIndex, 6).setValue(lateMinutes);
    if (notes !== undefined) sheet.getRange(rowIndex, 7).setValue(notes);
    
    return createResponse("success", "Late record updated successfully", null);
  } catch (error) {
    return createResponse("error", "Failed to update late record: " + error, null);
  }
}

/**
 * Deletes a late record
 */
function deleteLateRecord(e) {
  const recordId = e.parameter.recordId;
  
  if (!recordId) {
    return createResponse("error", "Record ID is required", null);
  }
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.ATTENDANCE);
    const data = sheet.getDataRange().getValues();
    
    let rowIndex = -1;
    
    // Find the record
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === recordId) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse("error", "Late record not found", null);
    }
    
    // Delete the row
    sheet.deleteRow(rowIndex);
    
    return createResponse("success", "Late record deleted successfully", null);
  } catch (error) {
    return createResponse("error", "Failed to delete late record: " + error, null);
  }
}

/**
 * Test function to diagnose student login issues
 * Run this function directly from the Google Apps Script editor
 */
function testStudentData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
  
  if (!sheet) {
    Logger.log("ERROR: Students sheet not found!");
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  Logger.log("Students sheet found with " + data.length + " rows (including header)");
  
  if (data.length <= 1) {
    Logger.log("No student records found in sheet");
    return;
  }
  
  // Log column headers
  Logger.log("Column headers: " + JSON.stringify(data[0]));
  
  // Check all student records
  for (let i = 1; i < data.length; i++) {
    const student = [...data[i]];
    student[2] = "HIDDEN"; // Hide password for security
    
    Logger.log("Student #" + i + ": " + JSON.stringify(student));
    Logger.log("Username: '" + data[i][1] + "'");
    Logger.log("Status value at index 9: '" + data[i][9] + "'");
    Logger.log("Is Status 'Active'?: " + (data[i][9] === "Active"));
    
    // Check for extra spaces
    if (data[i][9] && data[i][9].toString().trim() !== data[i][9].toString()) {
      Logger.log("WARNING: Status value has extra spaces!");
    }
  }
  
  Logger.log("TEST COMPLETED - Check logs for results");
}

/**
 * Test function to try a student login directly
 * Run this function directly from the Google Apps Script editor
 */
function testStudentLogin(testUsername, testPassword) {
  // Default test credentials if none provided
  const username = testUsername || "student1";
  const password = testPassword || "pass123";
  
  Logger.log(`Attempting to log in student: ${username}`);
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
  
  if (!sheet) {
    Logger.log("ERROR: Students sheet not found!");
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    Logger.log("No student records found in sheet");
    return;
  }
  
  // Check if the username exists
  let foundIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === username) {
      foundIndex = i;
      break;
    }
  }
  
  if (foundIndex === -1) {
    Logger.log(`Username "${username}" not found in student records`);
    return;
  }
  
  // Check each criteria for login
  const row = data[foundIndex];
  Logger.log(`Found student record at row ${foundIndex + 1}`);
  Logger.log(`Full record: ${JSON.stringify(row)}`);
  
  // Check password
  const passwordMatch = row[2] === password;
  Logger.log(`Password match: ${passwordMatch}`);
  
  // Check status
  const statusIndex = 9;
  const statusValue = row[statusIndex] ? String(row[statusIndex]).trim() : "";
  Logger.log(`Status value: "${statusValue}"`);
  
  // Try different status checks
  Logger.log(`Status === "Active": ${statusValue === "Active"}`);
  Logger.log(`Status.toLowerCase() === "active": ${statusValue.toLowerCase() === "active"}`);
  Logger.log(`Status code points: ${[...statusValue].map(c => c.charCodeAt(0))}`);
  
  // Try our lenient status check
  const isActive = statusValue.toLowerCase() === "active" || 
                    statusValue === "1" || 
                    statusValue.toLowerCase() === "yes" ||
                    statusValue.toLowerCase() === "ya";
  Logger.log(`Is active (lenient check): ${isActive}`);
  
  // Final result
  const loginSuccess = row[1] === username && row[2] === password && isActive;
  Logger.log(`Login would be ${loginSuccess ? "SUCCESSFUL" : "FAILED"}`);
  
  return loginSuccess;
}

/**
 * Utility function to add a test student account
 * Run this function directly from the Google Apps Script editor
 */
function addTestStudent() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAMES.STUDENTS);
  
  if (!sheet) {
    Logger.log("ERROR: Students sheet not found!");
    return false;
  }
  
  // Generate a timestamp-based ID
  const studentId = "S" + new Date().getTime().toString().slice(-8);
  
  // Create a simple test student
  const testStudent = [
    studentId,       // StudentID
    "teststudent",   // Username
    "test123",       // Password
    "Test Student",  // FullName
    "Test Class",    // Class
    "10",            // Grade
    "Test Parent",   // ParentName
    "081234567890",  // ParentContact
    "test@test.com", // Email
    "Active"         // Status - using exactly "Active"
  ];
  
  // Add to spreadsheet
  sheet.appendRow(testStudent);
  
  Logger.log("Test student created successfully!");
  Logger.log("Username: teststudent");
  Logger.log("Password: test123");
  
  return true;
}

/**
 * Gets classes
 */
function getClasses(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.CLASSES);
    const data = sheet.getDataRange().getValues();
    
    const headers = data[0];
    const classes = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const classObj = {};
      for (let j = 0; j < headers.length; j++) {
        classObj[headers[j]] = data[i][j];
      }
      classes.push(classObj);
    }
    
    return createResponse("success", "Classes retrieved successfully", classes);
  } catch (error) {
    return createResponse("error", "Failed to retrieve classes: " + error, null);
  }
} 