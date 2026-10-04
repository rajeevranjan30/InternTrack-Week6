# InternTrack – Week 4 Full-Stack Integration

## 1. Project Overview

InternTrack is a full-stack task management application developed using a JavaScript-based frontend and a Node.js/Express backend with MongoDB.

Week 4 focuses on integrating the frontend application with the backend REST APIs developed in Week 3.

The integrated application allows users to:

- Register an account
- Log in securely
- View tasks dynamically
- Create new tasks
- View task details
- Update task information
- Delete tasks
- Log out
- Receive appropriate success and error messages

The frontend communicates with the backend using HTTP requests and processes API responses asynchronously.

---





## 2. Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API
- Live Server

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication and Security

- JWT authentication
- bcrypt password hashing
- Helmet
- CORS
- Rate limiting
- Request validation




### Testing

- Jest
- Supertest

---





## 3. Project Structure

```text
InternTrack_Week3_90plus/
│
├── backend/
│   ├── src/
│   ├── tests/
│   ├── postman/
│   ├── API_DOCUMENTATION.md
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── task.html
│   ├── css/
│   └── js/
│
└── README.md











4. Frontend–Backend Integration

The frontend communicates with the backend through REST API endpoints.

The backend runs locally at:

http://localhost:8087

The API base URL is:

http://localhost:8087/api

Frontend JavaScript uses the Fetch API to send HTTP requests to the backend.

Integration Flow
User Action
     ↓
Frontend JavaScript
     ↓
Fetch API Request
     ↓
Express REST API
     ↓
Validation & Authentication
     ↓
MongoDB Database
     ↓
API Response
     ↓
Frontend UI Update

This integration allows the frontend to display and modify data stored in the backend database instead of relying on hard-coded task information.










5. Authentication Integration

The application uses JWT-based authentication.

Registration Flow
User Registration
      ↓
Frontend sends registration data
      ↓
Backend validates the data
      ↓
Password is securely hashed
      ↓
User is stored in MongoDB
Login Flow
User Login
      ↓
Frontend sends credentials
      ↓
Backend verifies credentials
      ↓
JWT token is generated
      ↓
Frontend maintains authentication state
      ↓
Authenticated API requests include the token

Protected operations require valid authentication.

Passwords are not stored as plain text. Password hashing is handled using bcrypt.











6. Asynchronous Data Fetching

The frontend uses asynchronous JavaScript operations with the Fetch API.

The application waits for API responses before updating the interface.

General Flow
User clicks button
      ↓
Asynchronous API request starts
      ↓
Backend processes request
      ↓
Response is received
      ↓
Frontend processes response
      ↓
UI is updated

Asynchronous operations are used for:

User registration
User login
Loading tasks
Creating tasks
Updating tasks
Deleting tasks

This approach allows the application to communicate with the backend without requiring a complete page reload for every operation.












7. Frontend State Management

The frontend maintains the information required for the current application session and task data.

Important application state includes:

Authentication status
JWT authentication information
Current user
Task list
Selected task
Login and registration status
API success messages
API error messages

When a task is created, updated, or deleted, the frontend processes the API response and updates the displayed task information so that the interface remains synchronized with the backend.









8. CRUD API Integration

The frontend was tested against the backend for the complete task lifecycle.

Create

A user can create a new task through the frontend.

Frontend
   ↓
POST Request
   ↓
Backend
   ↓
Validation
   ↓
MongoDB
   ↓
Success Response
   ↓
Task Appears in UI
Read

The dashboard requests task data from the backend and displays the returned records dynamically.

This confirms that task information is being retrieved from the backend rather than being permanently hard-coded in the frontend.

Update

A selected task can be modified through the frontend.

Example tested task:

Task: Week 4 Integration Testing
Status: In Progress
Progress: 50%

The updated information is sent to the backend and the frontend reflects the updated data.

Delete

A task can be deleted through the frontend.

The delete request is sent to the backend, the corresponding database record is removed, and the frontend updates the task list.









9. Error and Exception Handling

The application handles unsuccessful API operations and provides appropriate feedback to the user.

Examples include:

Incorrect login credentials
Invalid input
Unauthorized requests
Network/API failures
Invalid task operations
Example: Incorrect Login
Incorrect Password
       ↓
Backend verifies credentials
       ↓
Credentials rejected
       ↓
Error Response
       ↓
Frontend displays an error message

The application does not silently fail when an API request is unsuccessful. Instead, the frontend processes the response and provides feedback to the user.









10. Integration Testing Performed

The following workflow was manually tested through the frontend:

Register
   ↓
Login
   ↓
Open Dashboard
   ↓
Load Tasks
   ↓
Create Task
   ↓
View Task Details
   ↓
Update Task
   ↓
Delete Task
   ↓
Logout

The complete workflow was successfully executed.

The following operations were specifically verified:

Operation	Result
Registration	Successful
Login	Successful
Dashboard data loading	Successful
Task creation	Successful
Task details	Successful
Task update	Successful
Task deletion	Successful
Logout	Successful
Invalid login handling	Successful









11. Automated Testing

Automated backend tests were executed using Jest and Supertest.

Test Command
npm test
Test Result
Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        9.711 s
Ran all test suites.

Therefore:

1 test suite passed
10 tests passed
0 tests failed
0 snapshots were used

The automated tests provide additional verification of backend API behavior.










12. Local Setup and Execution
Step 1 – Install Dependencies

Open a terminal inside the backend directory:

npm install
Step 2 – Configure Environment Variables

Create a .env file using .env.example as a reference.

Configure the required environment variables:

PORT=8087
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<your secure secret>
JWT_EXPIRES_IN=1d

Do not commit real secrets or sensitive credentials to GitHub.

Step 3 – Start MongoDB

Ensure that MongoDB is running before starting the backend application.

Step 4 – Start the Backend

Inside the backend folder, run:

npm start

The backend should start at:

http://localhost:8087
Step 5 – Run the Frontend

Open the frontend using a local development server such as VS Code Live Server.

The frontend communicates with the backend through:

http://localhost:8087/api






13. API Health Verification

The backend health endpoint was verified successfully.

Endpoint
GET /api/health
Example Response
{
  "success": true,
  "message": "InternTrack API is running"
}

The health endpoint provides a simple way to verify that the backend API is running and accessible.








14. Challenges and Solutions
Challenge 1 – Connecting the Frontend and Backend

The frontend needed to communicate with the backend using the correct API base URL.

Solution:

A common API base URL was used for frontend requests:

http://localhost:8087/api

This allowed frontend operations to communicate consistently with the Express backend.

Challenge 2 – Authentication

Protected API operations require authentication.

Solution:

JWT-based authentication was integrated into the frontend-backend communication flow. Authenticated requests include the required authentication information.

Challenge 3 – Handling API Errors

Incorrect credentials and unsuccessful API requests needed to provide understandable feedback.

Solution:

Frontend error handling was implemented to process unsuccessful API responses and display appropriate messages to the user.

Challenge 4 – Keeping UI Data Synchronized

After creating, updating, or deleting a task, the displayed data needed to remain synchronized with the database.

Solution:

The frontend processes API responses and refreshes or updates the relevant task information after successful operations.





15. Week 4 Integration Evidence

The following integration activities were successfully verified:

Backend server running successfully
MongoDB connection working
API health endpoint working
Frontend connected to backend
User registration
User login
Dynamic dashboard data loading
Task creation
Task detail viewing
Task updating
Task deletion
Frontend error handling
Logout
Automated backend testing
Automated Verification
1 Test Suite Passed
10 Tests Passed
0 Tests Failed





16. Demonstration Video

A short screen-recorded demonstration will show the complete integrated application workflow:

Login
  ↓
Dashboard
  ↓
Create Task
  ↓
View Task
  ↓
Update Task
  ↓
Delete Task
  ↓
Logout
Video Link
[https://drive.google.com/file/d/1L_ruKpOnS5_WFuE1TcSL94LJ_igvl3D3/view?usp=drive_link]

The final video link will be added after recording the demonstration.




17. Conclusion

The Week 4 implementation integrates the frontend application with the backend REST API and MongoDB database.

The application supports:

Authenticated user interaction
Asynchronous API communication
CRUD task operations
Dynamic frontend data
Frontend state updates
Error and exception handling
REST API integration
Automated testing

The complete integration workflow was manually verified through the frontend.

Automated backend verification also completed successfully:

1 test suite passed
10 tests passed
0 tests failed

This demonstrates the integration of the frontend, backend API, authentication system, and database into a cohesive full-stack application.


