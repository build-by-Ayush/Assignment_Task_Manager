import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTaskSession } from '../context/TaskSessionContext';

function Tasks() {
  const { tasks, setTasks, subtasks, setSubtasks, fetchTasks, fetchSubtasks } = useTaskSession();
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingPriority, setEditingPriority] = useState('low');
  const [editingDueDate, setEditingDueDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [newSubtaskTitles, setNewSubtaskTitles] = useState({});
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchSubtasks();
  }, [fetchTasks, fetchSubtasks]);

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    return dateTimeStr.split('T')[0];
  };

  // ----- Task Functions ----- (keeping all existing logic intact)
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/tasks/', {
        title,
        description,
        priority,
        due_date: formatDate(dueDate),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setTitle('');
      setDescription('');
      setPriority('low');
      setDueDate('');
      setShowAddTaskModal(false);
      await fetchTasks();
    } catch (error) {
      setError('Failed to add task: ' + (error.response?.data.detail || JSON.stringify(error.response?.data)));
    } finally {
      setLoading(false);
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingDescription(task.description || '');
    setEditingPriority(task.priority || 'low');
    setEditingDueDate(task.due_date ? task.due_date + "T00:00" : '');
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
    setEditingDescription('');
    setEditingPriority('low');
    setEditingDueDate('');
  };

  const submitEditTask = async (taskId) => {
    if (!editingTaskTitle.trim()) return;
    setLoading(true);
    try {
      await axios.put(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
        title: editingTaskTitle,
        description: editingDescription,
        priority: editingPriority,
        due_date: formatDate(editingDueDate),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      await fetchTasks();
      cancelEditTask();
    } catch (error) {
      setError('Failed to update task: ' + (error.response?.data.detail || JSON.stringify(error.response?.data)));
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    setLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      await fetchTasks();
    } catch {
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleteTask = async (task) => {
    setLoading(true);
    try {
      await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}/`, {
        ...task,
        completed: !task.completed
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      await fetchTasks();
    } catch {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // ----- Subtask Functions ----- (keeping all existing logic intact)
  const handleNewSubtaskTitleChange = (taskId, value) => {
    setNewSubtaskTitles(prev => ({ ...prev, [taskId]: value }));
  };

  const addSubtask = async (taskId) => {
    const title = newSubtaskTitles[taskId];
    if (!title || !title.trim()) return;
    try {
      await axios.post('http://127.0.0.1:8000/api/subtasks/', {
        task: taskId,
        title
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setNewSubtaskTitles(prev => ({ ...prev, [taskId]: '' }));
      await fetchSubtasks();
    } catch (error) {
      setError('Failed to add subtask');
    }
  };

  const startEditSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  };

  const cancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const submitEditSubtask = async (subtaskId) => {
    if (!editingSubtaskTitle.trim()) return;
    const subtask = subtasks.find(st => st.id === subtaskId);

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/subtasks/${subtaskId}/`,
        {
          title: editingSubtaskTitle,
          completed: subtask.completed,
          task: subtask.task
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        }
      );
      cancelEditSubtask();
      await fetchSubtasks();
    } catch (err) {
      console.log(err.response?.data); // Debug the exact error
      setError('Failed to update subtask');
    }
  };


  const deleteSubtask = async (subtaskId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/subtasks/${subtaskId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      await fetchSubtasks();
    } catch {
      setError('Failed to delete subtask');
    }
  };

  const toggleCompleteSubtask = async (subtask) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/subtasks/${subtask.id}/`, {
        ...subtask,
        completed: !subtask.completed
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      await fetchSubtasks();
    } catch {
      setError('Failed to update subtask');
    }
  };

  // ----- Filters & Sorting ----- (keeping existing logic)
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCompletion = completionFilter === 'all' || 
      (completionFilter === 'completed' && task.completed) || 
      (completionFilter === 'pending' && !task.completed);
    return matchesSearch && matchesPriority && matchesCompletion;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityBg = (priority) => {
    switch(priority) {
      case 'high': return '#fee2e2';
      case 'medium': return '#fef3c7';
      case 'low': return '#d1fae5';
      default: return '#f3f4f6';
    }
  };

  // ----- Enhanced UI Render -----
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#F9FAFB',
        padding: '1.5rem 2rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
          }}>My Tasks</h1>
          
          <button 
            onClick={() => setShowAddTaskModal(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1500px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto auto',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={completionFilter}
              onChange={(e) => setCompletionFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {sortedTasks.map(task => (
            <div key={task.id} style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s',
                opacity: task.completed ? 0.6 : 1, // fade effect by reducing opacity
                filter: task.completed ? 'grayscale(30%)' : 'none' // optional grayscale fade
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
              >
              {/* Task Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editingTaskTitle}
                      onChange={(e) => setEditingTaskTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #3b82f6',
                        borderRadius: '0.375rem',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: task.completed ? '#6b7280' : '#1e293b',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      margin: 0,
                      marginBottom: '0.5rem'
                    }}>
                      {task.title}
                    </h3>
                  )}
                  
                  {/* Priority Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: getPriorityColor(task.priority),
                    backgroundColor: getPriorityBg(task.priority),
                    textTransform: 'capitalize'
                  }}>
                    {task.priority || 'low'} Priority
                  </div>
                </div>
                
                {/* Task Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginLeft: '1rem'
                }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleCompleteTask(task)}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}
                  />
                  
                  {editingTaskId === task.id ? (
                    <>
                      <button
                        onClick={() => submitEditTask(task.id)}
                        disabled={loading}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditTask}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditTask(task)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        disabled={loading}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Task Description */}
              {(task.description || editingTaskId === task.id) && (
                <div style={{ marginBottom: '1rem' }}>
                  {editingTaskId === task.id ? (
                    <textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Enter task description"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '4rem'
                      }}
                    />
                  ) : task.description && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3, // limits lines to 3
                      WebkitBoxOrient: 'vertical',
                      whiteSpace: 'normal',
                      maxHeight: '4.5em',  // ~3 lines
                      wordWrap: 'break-word'
                    }}>
                      {task.description}
                    </p>
                  )}
                </div>
              )}

              {/* Task Meta Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
                fontSize: '0.8rem',
                color: '#6b7280'
              }}>
                {editingTaskId === task.id ? (
                  <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <select
                      value={editingPriority}
                      onChange={(e) => setEditingPriority(e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input
                      type="datetime-local"
                      value={editingDueDate}
                      onChange={(e) => setEditingDueDate(e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <span>Status: {task.completed ? 'Completed' : 'Pending'}</span>
                    {task.due_date && (
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                  </>
                )}
              </div>

              {/* Subtasks Section */}
              <div style={{ marginTop: '1rem' }}>
                {/* Add New Subtask */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtaskTitles[task.id] || ''}
                    onChange={(e) => handleNewSubtaskTitleChange(task.id, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSubtask(task.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => addSubtask(task.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Subtasks List */}
                {subtasks.filter(st => st.task === task.id).map(subtask => (
                  <div key={subtask.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.375rem',
                    marginBottom: '0.5rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleCompleteSubtask(subtask)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {editingSubtaskId === subtask.id ? (
                      <>
                        <input
                          type="text"
                          value={editingSubtaskTitle}
                          onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '0.25rem',
                            border: '1px solid #3b82f6',
                            borderRadius: '0.25rem',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={() => submitEditSubtask(subtask.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEditSubtask}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{
                          flex: 1,
                          fontSize: '0.8rem',
                          textDecoration: subtask.completed ? 'line-through' : 'none',
                          color: subtask.completed ? '#6b7280' : '#374151'
                        }}>
                          {subtask.title}
                        </span>
                        <button
                          onClick={() => startEditSubtask(subtask)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteSubtask(subtask.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Task Modal */}
        {showAddTaskModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Add New Task
              </div>

              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Enter task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '5rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTaskModal(false);
                      setTitle('');
                      setDescription('');
                      setPriority('low');
                      setDueDate('');
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: loading || !title.trim() ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: loading || !title.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;