import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useTaskSession } from '../context/TaskSessionContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const iconSize = 24;

function Dashboard() {
  const { tasks, sessionLog, subtasks = [] } = useTaskSession();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed_at).length; // ✅ historic completions
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalFocusSessions = sessionLog.length;

  // Dates for last 7 days
  const today = new Date();
  const datesLast7Days = [...Array(7)].map((_, idx) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - idx));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });

  // Dates for last 30 days by week
  const datesLast30Days = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  // Helper to count completions by date field
  const countByDate = (items, dateField, filterFn = () => true) => {
    const counts = {};
    datesLast7Days.forEach(date => (counts[date] = 0));
    items.filter(filterFn).forEach(item => {
      const rawDate = item[dateField];
      if (rawDate) {
        const date = new Date(rawDate).toLocaleDateString('en-US', { weekday: 'short' });
        if (counts.hasOwnProperty(date)) counts[date]++;
      }
    });
    return datesLast7Days.map(date => counts[date]);
  };

  // Tasks completed last 7 days by completed_at
  const completedTasks7d = countByDate(tasks, 'completed_at', t => t.completed_at);

  // Completed tasks last 30 days aggregated by weeks (using completed_at)
  const completedTasks30d = (() => {
    const weekCounts = [0, 0, 0, 0];
    tasks.filter(t => t.completed_at).forEach(task => {
      const d = new Date(task.completed_at);
      const day = d.getDate();
      const weekIndex = Math.min(3, Math.floor((day - 1) / 7));
      weekCounts[weekIndex]++;
    });
    return weekCounts;
  })();

  // Subtasks completed last 7 days using completed_at
  const completedSubtasks7d = countByDate(subtasks, 'completed_at', st => st.completed_at);

  // Focus sessions completed last 7 days by timestamp
  const focusSessions7d = countByDate(sessionLog, 'timestamp');

  // Debug logs
  console.log('Tasks data:', tasks);
  console.log('Subtasks data:', subtasks);
  console.log('Session log data:', sessionLog);

  console.log('Completed Tasks 7d:', completedTasks7d);
  console.log('Completed Subtasks 7d:', completedSubtasks7d);
  console.log('Focus Sessions 7d:', focusSessions7d);

  // Colors
  const barColors = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF', '#BAE6FD'];
  const subtaskBarColors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5', '#BBF7D0'];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" , background:'#f8f8f8ff'}}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 32 }}>Analytics Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[{
          bg: '#DBEAFE',
          iconColor: '#2563EB',
          label: "Total Tasks",
          value: totalTasks,
          icon: (
            <svg width={iconSize} height={iconSize} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><path d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          )
        }, {
          bg: '#DCFCE7',
          iconColor: '#16A34A',
          label: "Completed",
          value: completedTasks,
          icon: (
            <svg width={iconSize} height={iconSize} fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
          )
        }, {
          bg: '#FEF3C7',
          iconColor: '#CA8A04',
          label: "Completion Rate",
          value: `${completionRate}%`,
          icon: (
            <svg width={iconSize} height={iconSize} fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          )
        }, {
          bg: '#EDE9FE',
          iconColor: '#7C3AED',
          label: "Focus Sessions",
          value: totalFocusSessions,
          icon: (
            <svg width={iconSize} height={iconSize} fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          )
        }].map(({ bg, icon, label, value }, idx) => (
          <div key={idx} style={{ backgroundColor: bg, display: 'flex', alignItems: 'center', padding: 20, borderRadius: 10, boxShadow: '0 4px 8px rgb(0 0 0 / 0.05)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.05)", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {icon}
            </div>
            <div style={{ marginLeft: 16 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111' }}>{value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#666' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 40 }}>
        {/* Tasks Completed last 7 days bar */}
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Tasks Completed in Last 7 Days</h3>
          <Bar data={{
            labels: datesLast7Days,
            datasets: [{
              label: 'Tasks Completed',
              data: completedTasks7d,
              backgroundColor: datesLast7Days.map((_, i) => barColors[i % barColors.length])
            }]
          }} options={{ plugins: { legend: { display: false } },
             scales: { y: { ticks: { precision: 0 } } } }} />
        </div>

        {/* Tasks Completed last 30 days line */}
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Tasks Completed in Last 30 Days</h3>
          <Line data={{
            labels: datesLast30Days,
            datasets: [{
              label: 'Tasks Completed',
              data: completedTasks30d,
              borderColor: '#2563EB',
              backgroundColor: '#dbeafe',
              fill: true,
              tension: 0.3
            }]
          }} options={{ plugins: { legend: { display: false } } ,
          scales: { y: { ticks: { precision: 0 } } }}} />
        </div>

        {/* Focus Sessions last 7 days line */}
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Focus Sessions in Last 7 Days</h3>
          <Line data={{
            labels: datesLast7Days,
            datasets: [{
              label: 'Focus Sessions',
              data: focusSessions7d,
              borderColor: '#7C3AED',
              backgroundColor: '#ede9fe',
              fill: true,
              tension: 0.3
            }]
          }} options={{ plugins: { legend: { display: false } },
          scales: { y: { ticks: { precision: 0 } } } }} />
        </div>

        {/* Subtasks Completed last 7 days bar */}
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Subtasks Completed in Last 7 Days</h3>
          <Bar data={{
            labels: datesLast7Days,
            datasets: [{
              label: 'Subtasks Completed',
              data: completedSubtasks7d,
              backgroundColor: subtaskBarColors.slice(0, datesLast7Days.length)
            }]
          }} options={{ plugins: { legend: { display: false } } ,
          scales: { y: { ticks: { precision: 0 } } }}} />
        </div>
      </div>
    </div>
  );
}

const chartContainerStyle = {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 4px 8px rgb(0 0 0 / 0.05)'
};

const chartTitleStyle = {
  fontWeight: 600,
  fontSize: 18,
  marginBottom: 20
};

export default Dashboard;
