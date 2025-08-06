# Learning Management System (LMS) with Google Apps Script

A fully-featured Learning Management System built using Google Apps Script and Google Sheets as the database. This system provides comprehensive functionality for managing students, courses, enrollments, assignments, and progress tracking.

## 🌟 Features

### For Administrators
- **Dashboard Overview** - View statistics and recent activity
- **Student Management** - Add, view, and manage students
- **Course Management** - Create and manage courses
- **Enrollment Management** - Enroll students in courses and track status
- **Assignment Management** - Create assignments for courses
- **Submission Management** - View and grade student submissions
- **Progress Tracking** - Monitor student progress across all courses

### For Students
- **Personal Dashboard** - View enrolled courses and assignments
- **My Courses** - Access all enrolled courses with status
- **My Assignments** - View assignments and submit work
- **Progress Tracking** - Track personal academic progress
- **Assignment Submission** - Submit assignments with text

## 🚀 Setup Instructions

### Step 1: Create Google Sheet
1. Create a new Google Sheet
2. Create the following sheets with these exact names:
   - `Students`
   - `Courses` 
   - `Enrollments`
   - `Assignmetns` (Note: Keep this spelling as provided)
   - `Submissions`

### Step 2: Add Column Headers
Add these headers to each sheet:

**Students Sheet:**
| ID | Name | Username | Password | Department |
|----|------|----------|----------|------------|

**Courses Sheet:**
| ID | Name | Description |
|----|------|-------------|

**Enrollments Sheet:**
| Student ID | Course ID | Status |
|------------|-----------|--------|

**Assignmetns Sheet:**
| Assignment ID | Course ID | Title | Description | Due Date |
|---------------|-----------|-------|-------------|----------|

**Submissions Sheet:**
| Submission ID | Assignment ID | Student ID | Submission Date | Grade |
|---------------|---------------|------------|-----------------|-------|

### Step 3: Set Up Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Replace the default `Code.gs` content with the provided `Code.gs` file
4. Create a new HTML file called `Index.html` and paste the provided HTML content
5. In `Code.gs`, update the `SHEET_ID` constant with your Google Sheet ID:
   ```javascript
   const SHEET_ID = 'your_actual_google_sheet_id_here';
   ```

### Step 4: Deploy the Web App
1. In Google Apps Script, click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone" (or "Anyone with Google account" for more security)
5. Click "Deploy"
6. Copy the web app URL

### Step 5: Initial Setup (Optional)
Run the `initializeSampleData()` function once to add sample data:
1. In Google Apps Script, go to the editor
2. Select `initializeSampleData` from the function dropdown
3. Click "Run"
4. Grant necessary permissions when prompted

## 🔑 Default Login Credentials

**Administrator:**
- Username: `admin`
- Password: `admin`

**Sample Students** (if you ran `initializeSampleData()`):
- Username: `john.doe`, Password: `password123`
- Username: `jane.smith`, Password: `password123`

## 📊 Database Structure

### Students Table
- **ID**: Unique identifier for each student
- **Name**: Full name of the student
- **Username**: Login username (must be unique)
- **Password**: Login password
- **Department**: Student's department

### Courses Table
- **ID**: Unique identifier for each course
- **Name**: Course name
- **Description**: Course description

### Enrollments Table
- **Student ID**: References Students.ID
- **Course ID**: References Courses.ID
- **Status**: Enrollment status (Enrolled, Completed, Dropped)

### Assignments Table
- **Assignment ID**: Unique identifier for each assignment
- **Course ID**: References Courses.ID
- **Title**: Assignment title
- **Description**: Assignment description
- **Due Date**: Assignment due date

### Submissions Table
- **Submission ID**: Unique identifier for each submission
- **Assignment ID**: References Assignments.Assignment_ID
- **Student ID**: References Students.ID
- **Submission Date**: Date when assignment was submitted
- **Grade**: Grade assigned to the submission

## 🎨 UI Features

- **Clean, Modern Design** - Gradient backgrounds and card-based layout
- **Responsive Interface** - Works on desktop and mobile devices
- **Role-Based Access** - Different views for administrators and students
- **Real-time Updates** - Dynamic content loading without page refresh
- **Modal Forms** - Easy-to-use forms for adding data
- **Status Badges** - Visual indicators for enrollment and submission status
- **Progress Bars** - Visual progress tracking for students

## 🔧 Customization

### Adding New Features
The system is designed to be extensible. You can:
- Add new fields to existing sheets
- Create new sheets for additional functionality
- Modify the UI by editing `Index.html`
- Add new backend functions in `Code.gs`

### Styling Changes
All styles are contained in the `<style>` section of `Index.html`. You can:
- Change colors by modifying CSS variables
- Adjust layout by updating grid properties
- Customize components by modifying their CSS classes

### Security Enhancements
For production use, consider:
- Implementing proper password hashing
- Adding session management
- Implementing role-based permissions
- Adding input validation and sanitization

## 🚨 Important Notes

1. **Sheet ID**: Make sure to update the `SHEET_ID` in `Code.gs` with your actual Google Sheet ID
2. **Permissions**: Grant necessary permissions when deploying the web app
3. **Data Backup**: Regularly backup your Google Sheet data
4. **Security**: The default setup is for development/testing. Implement proper security for production use

## 📱 Mobile Compatibility

The LMS is fully responsive and works well on:
- Desktop browsers
- Tablet devices
- Mobile phones
- Different screen sizes and orientations

## 🔄 Data Flow

1. **Authentication**: Users log in through the frontend
2. **Data Retrieval**: Frontend calls backend functions via `google.script.run`
3. **Sheet Operations**: Backend functions interact with Google Sheets
4. **Response Handling**: Results are sent back to frontend and displayed
5. **Real-time Updates**: UI updates dynamically based on user actions

## 🎯 Usage Tips

### For Administrators
- Use the dashboard to get an overview of system activity
- Add students before enrolling them in courses
- Create courses before adding assignments
- Monitor student progress through the progress tracking section

### For Students
- Check "My Assignments" regularly for new assignments
- Submit assignments before due dates
- Monitor your progress to track academic performance
- Use "My Courses" to see all enrolled courses and their status

## 🛠️ Troubleshooting

### Common Issues
1. **"Sheet not found" error**: Ensure sheet names match exactly
2. **Permission denied**: Check Apps Script execution permissions
3. **Login fails**: Verify credentials and check authentication function
4. **Data not loading**: Check Sheet ID and internet connection

### Debug Tips
- Check the Apps Script execution log for errors
- Use browser developer tools to debug frontend issues
- Verify Google Sheet permissions and sharing settings
- Test individual functions in Apps Script editor

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Google Apps Script documentation
3. Verify your Google Sheet structure matches the requirements
4. Test with sample data first before adding real data

## 🔮 Future Enhancements

Potential improvements you could add:
- File upload for assignments
- Email notifications
- Advanced grading rubrics
- Discussion forums
- Calendar integration
- Attendance tracking
- Parent/guardian access
- Advanced reporting and analytics

---

## 👨‍💻 Developer

**Developed by N R Z Malik**
- Website: [nrzmalik.com](https://nrzmalik.com)
- Community: [ai4id.community](https://ai4id.community)

## 🚀 Future Compatibility & Hosting

For enhanced future compatibility and better package support, you can:
- Integrate with CDN services for improved performance
- Host the HTML package on your preferred hosting platform
- Add modern JavaScript frameworks and libraries
- Implement advanced features with external APIs
- Scale the application using cloud hosting services

This flexibility allows you to expand beyond Google Apps Script limitations and create a more robust, feature-rich learning management system.

---

**Note**: This LMS is built for educational and small-scale institutional use. For large-scale production environments, consider using dedicated LMS platforms or implementing additional security and scalability features. 