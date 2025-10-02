# Task Manager Project - Local Installation & Setup Guide

This guide will help you quickly set up and run the Task Manager project on your local machine for development and testing.

---

## Prerequisites

- [Node.js](https://nodejs.org/en/download/) (Version 16 or later recommended)
- [Python 3](https://www.python.org/downloads/)
- SQLite (comes built-in with Python)
- Git (optional, for cloning the repo)
  
---

## Step 1: Clone the repository

If you have git installed, run:

```
git clone <your-repo-url>
cd <your-project-folder>
```

If not, download the zip archive and unzip it.

---

## Step 2: Setup Backend (Django REST API)

1. Create and activate a Python virtual environment:

- Linux/macOS:
  ```
  python3 -m venv venv
  source venv/bin/activate
  ```

- Windows:
  ```
  python -m venv venv
  venv\Scripts\activate
  ```

2. Install backend dependencies:

```
pip install -r requirements.txt
```

3. Apply migrations to setup SQLite database and tables:

```
python manage.py migrate
```

4. (Optional) Create Django admin superuser (for admin panel access):

```
python manage.py createsuperuser
```

5. Run the backend development server:

```
python manage.py runserver
```

Server will be accessible at: `http://127.0.0.1:8000/`

---

## Step 3: Setup Frontend (React app)

1. Navigate to frontend directory (if separate folder):

```
cd frontend
```

2. Install Node.js dependencies:

```
npm install
```

3. Run the frontend development server:

```
npm start
```

Frontend app opens at: `http://localhost:3000/`

---

## Step 4: Use the Application

- Open `http://localhost:3000` in your browser.
- Register a new user or use demo credentials:  
  `Username: Demo`  
  `Password: 123`
- Use the app to create and manage tasks, subtasks, focus sessions, and view analytics.

---

## Notes

- Always ensure backend server is running before starting the frontend.
- Token-based authentication stores tokens in browser localStorage.
- Adjust API base URLs if backend runs on a different host or port.
- For production deployment, consider using PostgreSQL instead of SQLite and proper server setups.

---

## Troubleshooting

- If API calls return 401 Unauthorized, check token validity and refresh.
- For dependency issues, verify your Node.js and Python versions.
- Access Django admin panel at `/admin` for database management if admin user is created.

---

Happy task managing!