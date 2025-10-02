# Task Manager Web Application

This is a **full-stack Task Manager web application** I built as part of my project. I’m fairly new to full-stack development, so I tried my best to make it work smoothly with **React** on the frontend and **Django REST Framework** on the backend.  

The app helps users manage tasks, subtasks, track focus sessions, and visualize productivity.  

---

## 🚀 Features

- **User Authentication**
  - Sign up and login using username, email, and password.
  - JWT-based authentication for secure login sessions.
  
- **Task Management**
  - Create, edit, and delete tasks.
  - Set task priority (Low / Medium / High).
  - Mark tasks as complete.
  - Track completion timestamps automatically.

- **Subtask Management**
  - Add subtasks under each task.
  - Mark subtasks as complete.
  - Automatically track when subtasks are completed.

- **Focus Sessions**
  - Track focus sessions for tasks.
  - Save timestamps of focus sessions.

- **Dashboard**
  - Visual analytics of tasks, subtasks, and focus sessions over time.
  - Charts to understand your productivity trends.

- **Responsive UI**
  - Clean and minimal interface built with React.
  - Navbar adapts to authentication status.
  - Floating placeholders and feedback messages for better UX.

---

## 🛠 Technologies Used

**Frontend:**
- React.js & Context API
- React Router for page navigation
- Axios for API calls
- Chart.js for displaying analytics

**Backend:**
- Django REST Framework
- SQLite (for database)
- JWT (JSON Web Tokens) for authentication

---

## 📂 File Structure Overview

**Frontend**
src/                                                                                                                                                
│                                                                                                                                                
├── App.js # Root component; handles routing                                                                        
├── index.js # Renders App, wraps with contexts                                                                        
├── context/                                                                        
│ ├── AuthContext.js # Manages login/logout, user state, tokens                                                                        
│ └── TaskSessionContext.js # Manages tasks, subtasks, and focus sessions                                                                        
├── pages/                                                                        
│ ├── Login.js                                                                        
│ ├── Register.js                                                                        
│ ├── Tasks.js                                                                        
│ ├── Focus.js                                                                        
│ └── Dashboard.js                                                                        
└── components/                                                                        
└── Navbar.js # Navigation bar component                                                                                                                                                


**Backend**                                                                        
tasks/                                                                                                                                                
│                                                                                                                                                
├── models.py # Task, SubTask, FocusSession models                                                                        
├── serializers.py # Convert models to JSON for API                                                                        
├── views.py # API views (CRUD, login/register)                                                                        
├── urls.py # Route URLs to views                                                                        
└── settings.py # Django settings (CORS, database, etc.)                                                                        
                                                                                                                                                

---

## 🧩 How It Works (Data Flow)

1. On page load, **AuthContext** checks if there is a valid token in `localStorage`.  
   - If yes, the user is considered logged in.  
   - Axios headers are automatically set with the token.

2. **TaskSessionContext** fetches tasks, subtasks, and focus sessions from the backend.  
   - Prevents overlapping fetches using internal flags.

3. Users can create, update, delete tasks and subtasks.  
   - Completed timestamps are automatically set.

4. **Focus sessions** are tracked per user, per task.  
   - These are then visualized in charts on the **Dashboard**.

5. Navbar shows different links depending on whether the user is logged in or not.

---

## 🔑 Backend Models

- **User** (Django default)
- **Task**
  - title, description, due_date, priority, completed, created_at, completed_at
- **SubTask**
  - title, completed, completed_at, linked to Task
- **FocusSession**
  - timestamp, linked to User
