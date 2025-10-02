import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Context to manage tasks, subtasks, and focus sessions globally
const TaskSessionContext = createContext();

export function TaskSessionProvider({ children }) {
  const { user } = useContext(AuthContext); // Get current logged-in user

    // States for tasks, subtasks, and focus sessions
  const [tasks, setTasks] = useState([]);
  const [sessionLog, setSessionLog] = useState([]);
  const [subtasks, setSubtasks] = useState([]); // <-- expose setter for instant updates

  // Refs to prevent overlapping fetch requests
  const isFetchingTasksRef = useRef(false);
  const isFetchingSessionsRef = useRef(false);
  const isFetchingSubtasksRef = useRef(false);

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    if (isFetchingTasksRef.current) return; // Avoid duplicate calls
    isFetchingTasksRef.current = true;
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/tasks/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      isFetchingTasksRef.current = false;
    }
  }, []);

  // Fetch focus sessions from backend
  const fetchSessions = useCallback(async () => {
    if (isFetchingSessionsRef.current) return;
    isFetchingSessionsRef.current = true;
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/focus/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setSessionLog(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessionLog([]);
    } finally {
      isFetchingSessionsRef.current = false;
    }
  }, []);

  const fetchSubtasks = useCallback(async () => {
    if (isFetchingSubtasksRef.current) return;
    isFetchingSubtasksRef.current = true;
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/subtasks/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setSubtasks(response.data);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      setSubtasks([]);
    } finally {
      isFetchingSubtasksRef.current = false;
    }
  }, []);

  // Fetch all data when user logs in; reset when logged out
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchSessions();
      fetchSubtasks();
    } else {
      setTasks([]);
      setSessionLog([]);
      setSubtasks([]);
    }
  }, [user, fetchTasks, fetchSessions, fetchSubtasks]);

  return (
    <TaskSessionContext.Provider
      value={{
        tasks,
        setTasks,          
        sessionLog,
        setSessionLog,     
        subtasks,
        setSubtasks,       
        fetchTasks,
        fetchSessions,
        fetchSubtasks,
        refreshTasks: fetchTasks,
        refreshSessions: fetchSessions,
        refreshSubtasks: fetchSubtasks
      }}
    >
      {children}
    </TaskSessionContext.Provider>
  );
}

// Custom hook to access task/session context
export function useTaskSession() {
  return useContext(TaskSessionContext);
}
