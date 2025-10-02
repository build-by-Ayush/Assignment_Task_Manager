import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTaskSession } from '../context/TaskSessionContext';

const FOCUS_TIME = 25*60; // 25 minutes
const TIMER_STATE_KEY = 'focus_timer_state';

function Focus() {
  const { tasks, sessionLog, fetchSessions, refreshTasks } = useTaskSession();

  // Load initial timer state from localStorage or defaults
  const [selectedTaskId, setSelectedTaskId] = useState(() => {
    const saved = localStorage.getItem(TIMER_STATE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).selectedTaskId || null;
      } catch { return null; }
    }
    return null;
  });

  const [selectedTask, setSelectedTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);

  const timerRef = useRef(null);
  const hasLoggedRef = useRef(false); // prevent double logging

  // Reconcile selectedTask from selectedTaskId whenever tasks change
  useEffect(() => {
    const task = tasks.find(t => t.id === selectedTaskId);
    setSelectedTask(task || null);
  }, [tasks, selectedTaskId]);

  // Load timer state from localStorage on mount
  useEffect(() => {
    if (!selectedTaskId) return;

    const saved = localStorage.getItem(TIMER_STATE_KEY);
    if (!saved) return;

    try {
      const { endTime, isActive: wasActive, selectedTaskId: savedTaskId } = JSON.parse(saved);
      if (savedTaskId !== selectedTaskId) return;
      if (!endTime) return;

      const now = Date.now();
      if (endTime > now) {
        const remaining = Math.floor((endTime - now) / 1000);
        setTimeLeft(remaining);
        setIsActive(wasActive);
      } else {
        setTimeLeft(FOCUS_TIME);
        setIsActive(false);
        localStorage.removeItem(TIMER_STATE_KEY);
      }

    } catch {
      // Ignore parse errors
    }
  }, [selectedTaskId]);

  // Save/update timer state on every tick or change
  useEffect(() => {
    if (!selectedTaskId) return;

    if (isActive) {
      const endTime = Date.now() + timeLeft * 1000;
      const timerState = { endTime, isActive, selectedTaskId };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(timerState));
    } else {
      const timerState = JSON.parse(localStorage.getItem(TIMER_STATE_KEY)) || {};
      timerState.isActive = false;
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(timerState));
    }
  }, [timeLeft, isActive, selectedTaskId]);

  // Timer ticking logic
  useEffect(() => {
    if (isActive) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Log session once
            if (!hasLoggedRef.current) {
              logSession();
              hasLoggedRef.current = true;
            }
            // Auto-reset after a short delay to avoid double log
            setTimeout(() => {
              setTimeLeft(FOCUS_TIME);
              setIsActive(true); // auto-start next session
              hasLoggedRef.current = false; // reset log flag for next session
            }, 500);
            return 0; // show 0 briefly before reset
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);


  // Log session and refresh sessions count after focus ends
  const logSession = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/focus/', { task: selectedTask?.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      fetchSessions();
      refreshTasks();
    } catch {
      // ignore errors
    }
  };

  // Reset timer and clear storage
  const resetTimer = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setTimeLeft(FOCUS_TIME);
    localStorage.removeItem(TIMER_STATE_KEY);
    hasLoggedRef.current = false;
  };

  // Handlers for selecting a task
  const onTaskSelect = (task) => {
    setSelectedTaskId(task.id);
    setTimeLeft(FOCUS_TIME);
    setIsActive(false);
    hasLoggedRef.current = false;
  };

  const formatTime = () => {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const RADIUS = 45;
  const circumference = 2 * Math.PI * RADIUS;
  const elapsedFraction = (FOCUS_TIME - timeLeft) / FOCUS_TIME;
  const visibleProgress = elapsedFraction === 0 ? 0.004 : elapsedFraction;
  const strokeDashoffset = circumference * (1 - visibleProgress);

  const today = new Date().toDateString();
  const sessionsToday = sessionLog.filter(s => new Date(s.timestamp).toDateString() === today).length;
  const sessionsTotal = sessionLog.length;

  // --- LIST PAGE ---
  if (!selectedTask) {
    return (
      <div style={{
        minHeight: "84vh",
        backgroundColor: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "40px"
      }}>
        <h1 style={{
          fontFamily: 'inherit',
          textAlign: "center",
          fontWeight: 700,
          fontSize: 32,
          margin: 0,
          marginBottom: "1.2rem"
        }}>Focus Mode</h1>
        <div style={{ color: "#e05353ff", fontWeight: 600, fontSize: 20, marginBottom: 10 }}>
          {tasks.length === 0 ? "No tasks found. Please create a task first." : "Select a task to focus on:"}
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 440,
        }}>
          {tasks.map(task => (
            <div key={task.id} onClick={() => onTaskSelect(task)} style={{
              width: "100%",
              background: "#ffffffff",
              boxShadow: "0 2px 12px #e3e7ee64",
              borderRadius: 11,
              marginBottom: 15,
              padding: "19px 20px",
              cursor: "pointer",
              border: "1px solid #eef2f7",
              transition: "box-shadow 0.15s",
              display: "flex",
              alignItems: "center"
            }}>
              <div style={{ flexGrow: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 1 }}>{task.title}</div>
              </div>
              <span style={{
                padding: "2px 16px",
                borderRadius: 12,
                fontWeight: 600,
                marginLeft: 15,
                background: task.priority === "high" ? "#ffeded" : task.priority === "low" ? "#e8fae6" : "#fff7d0",
                color: task.priority === "high" ? "#e04a44" : task.priority === "low" ? "#24943a" : "#e6ba06",
                fontSize: 15,
                textTransform: "lowercase"
              }}>{task.priority}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- TIMER PAGE ---
  return (
    <div style={{
      minHeight: "89vh",
      backgroundColor: "#F9FAFB",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: "1px"
    }}>
      {/* BACK BUTTON */}
      <button
        onClick={() => {
          resetTimer();
          setSelectedTaskId(null);
        }}
        style={{
          background: "transparent",
          border: "none",
          color: "#3b82f6",
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          alignSelf: "flex-start",
          marginLeft: 20,
          marginBottom: 10
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 28 }}>Focus Mode</h1>
      <div style={{ fontWeight: 600, fontSize: 18, marginTop: 5, marginBottom: 6 }}>{selectedTask.title}</div>
      <div style={{ color: "#6d7a8f", fontSize: 17, marginBottom: 30 }}>Work Session</div>

      <div style={{ position: "relative", width: 210, height: 210, margin: "auto", marginBottom: 10, marginTop: -8 }}>
        <svg viewBox="0 0 100 100" width="210" height="210" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={RADIUS} stroke="#e7e4e4ff" strokeWidth={2} fill="none" />
          <circle cx="50" cy="50" r={RADIUS} stroke="#3b82f6" strokeWidth={2} fill="none" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.6s linear" }}
          />
        </svg>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 38, fontWeight: 600 }}>{formatTime()}</span>
          <span style={{ fontSize: 14, color: "#6c7379ff", marginTop: 5 }}>minutes remaining</span>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: "20px", justifyContent: "center" }}>
        <button
          onClick={() => {
            if (isActive) {
              clearInterval(timerRef.current);
              setIsActive(false);
            } else {
              if (timeLeft <= 0) setTimeLeft(FOCUS_TIME); // auto-reset when time=0
              setIsActive(true);
            }
          }}
          style={{
            background: isActive ? "#facc15" : "#2db872",
            color: "white",
            fontWeight: 600,
            border: "none",
            padding: "13px 36px",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button onClick={resetTimer}
          style={{
            background: "#f6524d",
            color: "white",
            fontWeight: 600,
            border: "none",
            padding: "13px 36px",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer"
          }}>Reset</button>
      </div>

      <div style={{ marginTop: 46, display: "flex", justifyContent: "center", gap: 50 }}>
        <div style={{
          background: "#fff",
          boxShadow: "0 2px 8px #e1e3e9b2",
          borderRadius: 12,
          padding: "30px 40px",
          marginRight: 2,
          width: 160,
          height: 30,
          fontWeight: 500,
          fontSize: 16,
          color: "#7790ab",
          minWidth: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}>
          <div style={{ fontWeight: 700, color: "#2973e4ff", fontSize: 23 }}>{sessionsToday}</div>
          <div style={{ fontWeight: 500, color: "#484c4fff", fontSize: 14 }}>Sessions Today</div>
        </div>
        <div style={{
          background: "#fff",
          boxShadow: "0 2px 8px #e1e3e9b2",
          borderRadius: 12,
          padding: "30px 40px",
          marginRight: 2,
          width: 160,
          height: 30,
          fontWeight: 500,
          fontSize: 16,
          color: "#7790ab",
          minWidth: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}>
          <div style={{ fontWeight: 700, color: "#129d40ff", fontSize: 23 }}>{sessionsTotal}</div>
          <div style={{ fontWeight: 500, color: "#484c4fff", fontSize: 14 }}>Total Sessions</div>
        </div>
      </div>
    </div>
  );
}

export default Focus;
