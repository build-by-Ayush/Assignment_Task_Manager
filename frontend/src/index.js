import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Global CSS styles
import App from './App'; // Root App component
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // Auth context for user login state
import { TaskSessionProvider } from './context/TaskSessionContext';  // Context for tasks, subtasks, and sessions

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <TaskSessionProvider>
        <App />
      </TaskSessionProvider>
    </AuthProvider>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
