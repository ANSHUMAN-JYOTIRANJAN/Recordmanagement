# Student Academic Record Management System

A web-based application designed to manage student academic records, course registrations, marks, semester-wise academic performance, and cumulative academic results. The system provides role-based access control and automated calculation of Semester Weighted Average (SWA), Cumulative Weighted Average (CWA), and academic standing.

## 🌐 Live Demo

- **Frontend:** https://recordmanagement.onrender.com
- **Backend API:** https://recordmanagement1.onrender.com
- **Health Check:** https://recordmanagement1.onrender.com/api/health

## 📌 Features

- **User Authentication:** Secure registration and login using JWT.
- **Role-Based Access Control:** Different permissions for Students, Faculty, Course Administrators, and Academic Office staff.
- **Student Management:** Create, search, view, update, and manage student records.
- **Course Management:** Maintain course details, course numbers, credits, course types, and syllabi.
- **Course Registration:** Register students for courses and maintain semester-wise registration records.
- **Marks Management:** Record student marks for registered courses.
- **SWA Calculation:** Automatically calculate semester performance using course marks and credits.
- **CWA Calculation:** Maintain cumulative academic performance across semesters.
- **Academic Standing:** Automatically classify students based on their SWA.
- **Academic History:** Preserve previous semester records.
- **Reports:** Access academic performance summaries and reports.

## 🧮 Academic Calculation

### Semester Weighted Average (SWA)

The Semester Weighted Average is calculated using the marks obtained in each course and the corresponding course credits.

\[
SWA = \frac{\sum(\text{Marks} \times \text{Credits})}{\sum \text{Credits}}
\]

**Example:**

| Course | Marks | Credits | Marks × Credits |
|---|---:|---:|---:|
| Mathematics | 90 | 4 | 360 |
| Operating Systems | 80 | 3 | 240 |
| Database Management | 70 | 3 | 210 |
| **Total** | | **10** | **810** |

SWA = 810 / 10 = **81**

### Academic Standing

| SWA | Academic Standing |
|---|---|
| SWA ≥ 85 | Vice-Chancellor's List |
| 50 ≤ SWA < 85 | Normal Academic Standing |
| SWA < 50 | Conditional Standing |

### Cumulative Weighted Average (CWA)

CWA is calculated from the weighted totals and credits of the semesters completed.

\[
CWA = \frac{\sum \text{Semester Weighted Totals}}{\sum \text{Semester Credits}}
\]

Previous semester records are retained so that cumulative academic performance can be calculated across multiple semesters.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Security | bcryptjs |
| API Communication | REST API |
| Report Generation | PDFKit |
| Deployment | Render |

## 📂 Project Structure

```text
Student-Academic-Record-Management-System/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── students.html
│   ├── student-details.html
│   ├── courses.html
│   ├── add-course.html
│   ├── registration.html
│   ├── marks.html
│   ├── swa.html
│   ├── reports.html
│   ├── css/
│   └── js/
│       ├── api.js
│       └── app.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

*Note: The structure above represents the expected organization. Update the file names if your actual repository differs.*

## ⚙️ Installation and Setup

### Prerequisites

Install or configure the following:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account or a local MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Student-Academic-Record-Management-System
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your actual repository URL.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=https://recordmanagement.onrender.com
```

Replace the MongoDB connection string and JWT secret with your own values.

**Security notes:**
- Never commit `.env` to GitHub.
- Use a MongoDB database user and password for Atlas authentication.
- URL-encode special characters in the MongoDB password when required.
- Add the required frontend origin to your backend's CORS configuration.
- Configure the same environment variables in your Render backend service settings. Render provides the `PORT` variable automatically.

### 4. Start the Backend

From the `backend/` directory, run:

```bash
npm start
```

If your `package.json` does not define a start script, use:

```bash
node server.js
```

The backend should start at:

```text
http://localhost:5000
```

Test the health endpoint:

```text
http://localhost:5000/api/health
```

### 5. Run the Frontend Locally

Use a local development server, such as the **Live Server** extension in Visual Studio Code, to open `frontend/index.html` or the appropriate entry page.

Ensure `frontend/js/api.js` points to the local backend while developing:

```javascript
const defaultApiBaseUrl = isLocalFrontend
  ? "http://localhost:5000/api"
  : "https://recordmanagement1.onrender.com/api";
```

Ensure the frontend's API client uses the correct backend URL in production.

## 🔌 API Endpoints

The backend exposes REST API routes under the `/api` prefix.

| Module | Base Endpoint | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Registration, login, and current user |
| Students | `/api/students` | Student record management |
| Courses | `/api/courses` | Course management |
| Registrations | `/api/registrations` | Course registration |
| Marks | `/api/marks` | Marks management |
| SWA | `/api/swa` | Semester average calculations |
| Reports | `/api/reports` | Academic reports |
| Health | `/api/health` | Backend health check |

The exact HTTP methods, parameters, and permissions depend on the implemented routes.

## 🔐 User Roles

The application supports the following roles:

- **Student:** Access permitted student and academic information.
- **Faculty:** Perform permitted academic operations.
- **Course Administrator:** Manage authorized student and course operations.
- **Academic Office:** Perform authorized academic record administration.

Access is controlled by authentication middleware and role-based authorization middleware. Public registration is available for Student, Faculty, and Course Administrator accounts. Academic Office accounts remain restricted to the initial setup process.

## 🚀 Deployment

The application is deployed using Render.

### Frontend

- Service type: Static Site
- Root directory: `frontend`
- Build command: `echo "Static frontend ready"`
- Publish directory: `.`

### Backend

- Service type: Web Service
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

Configure the backend environment variables in Render and ensure that `FRONTEND_URL` matches the deployed frontend URL.

**Important:** Folder names and paths are case-sensitive in deployment environments. Confirm that the configured root directories match the actual GitHub repository.

## 🧪 Testing

Verify the following workflows:

1. Register as a student, faculty member, or course administrator and log in with the selected role.
2. Confirm that unauthorized users cannot access restricted operations.
3. Create and retrieve student records.
4. Add courses with the correct credits.
5. Register students for courses.
6. Enter marks and verify SWA calculations.
7. Verify academic standing for SWA values above, below, and at the thresholds.
8. Confirm that semester records are preserved.
9. Verify cumulative average calculations across semesters.
10. Test the backend health endpoint and deployed frontend-to-backend API requests.

## 🔒 Security

- Passwords are hashed using bcryptjs.
- JWTs are used for authenticated requests.
- Protected routes require valid authentication.
- Role-based middleware restricts privileged operations.
- Environment variables are used for secrets and database configuration.
- CORS restricts browser requests to configured origins.

## 🔮 Future Enhancements

- Downloadable PDF academic reports.
- Graphical semester-wise performance analytics.
- Student transcript generation.
- Email notifications for academic updates.
- Bulk student and marks import through CSV.
- Audit logs for changes to academic records.
- Improved dashboard analytics and accessibility.

## 👨‍💻 Contributors

Add the names and roll numbers of your project team members here.

## 📄 License

This project was developed for academic and educational purposes. Add an appropriate open-source license if you intend to distribute it publicly.
