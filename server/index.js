require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const searchRoutes = require('./routes/search');
const imageRoutes = require('./routes/images');
const filesRoutes = require('./routes/files');
const memoryRoutes = require('./routes/memory');
const projectRoutes = require('./routes/projects');
const agentRoutes = require('./routes/agents');
const assistantRoutes = require('./routes/assistants');
const billingRoutes = require('./routes/billing');
const developerRoutes = require('./routes/developer');
const adminRoutes = require('./routes/admin');
const educationRoutes = require('./routes/education');

const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const progressRoutes = require('./routes/progress');
const materialRoutes = require('./routes/materials');
const exportRoutes = require('./routes/exports');

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: 'VECTOR',
    version: '2.2.0',
    education: true,
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/education', educationRoutes);

app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/exports', exportRoutes);

app.use('/exports', express.static(path.join(__dirname, '..', 'exports')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('==================================================');
  console.log(' VECTOR v2.2.0 — EDUCATION PLATFORM ONLINE');
  console.log('==================================================');
  console.log(` PORT: ${PORT}`);
  console.log(' EDUCATION: ENABLED');
  console.log(' CLASSES: ENABLED');
  console.log(' STUDENTS: ENABLED');
  console.log(' ATTENDANCE: ENABLED');
  console.log(' PROGRESS: ENABLED');
  console.log(' MATERIALS: ENABLED');
  console.log(' PDF EXPORT: ENABLED');
  console.log(' WORD EXPORT: ENABLED');
  console.log(' POWERPOINT EXPORT: ENABLED');
  console.log('==================================================');
});

module.exports = app;
