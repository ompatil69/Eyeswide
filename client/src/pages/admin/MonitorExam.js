import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  Warning,
  CheckCircle,
  Person,
  Timer,
  Security,
  VideoCall,
  Stop,
  Assessment,
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const MonitorExam = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [socket, setSocket] = useState(null);
  const [liveStats, setLiveStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    violationsCount: 0,
    averageProgress: 0
  });

  // Live violation chart data (last 10 ticks)
  const [liveChart, setLiveChart] = useState(
    Array.from({ length: 10 }, (_, i) => ({ t: `${i * 3}m`, violations: 0, active: 0 }))
  );
  const tickRef = useRef(0);

  // Mock exam data
  const mockExam = {
    id: examId,
    title: 'Mathematics Placement Test',
    startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
    endTime: new Date(Date.now() + 90 * 60 * 1000), // Ends in 90 minutes
    duration: 120,
    totalQuestions: 25,
    status: 'active'
  };

  // Mock student data
  const mockStudents = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      progress: 65,
      currentQuestion: 16,
      violations: 2,
      lastActivity: new Date(),
      cameraStatus: 'active',
      audioStatus: 'active',
      faceDetected: true,
      gazeDirection: 'center',
      timeSpent: 45 * 60, // 45 minutes
      answers: 15
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      progress: 80,
      currentQuestion: 20,
      violations: 0,
      lastActivity: new Date(),
      cameraStatus: 'active',
      audioStatus: 'active',
      faceDetected: true,
      gazeDirection: 'left',
      timeSpent: 50 * 60,
      answers: 19
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      status: 'flagged',
      progress: 40,
      currentQuestion: 10,
      violations: 4,
      lastActivity: new Date(Date.now() - 2 * 60 * 1000),
      cameraStatus: 'inactive',
      audioStatus: 'active',
      faceDetected: false,
      gazeDirection: 'away',
      timeSpent: 35 * 60,
      answers: 8
    }
  ];

  // Mock violations
  const mockViolations = [
    {
      id: 1,
      studentId: 3,
      studentName: 'Mike Johnson',
      type: 'face-not-detected',
      severity: 'high',
      message: 'Face not detected for 10 seconds',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      resolved: false
    },
    {
      id: 2,
      studentId: 1,
      studentName: 'John Doe',
      type: 'tab-switch',
      severity: 'medium',
      message: 'Switched to another tab',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      resolved: true
    },
    {
      id: 3,
      studentId: 3,
      studentName: 'Mike Johnson',
      type: 'multiple-faces',
      severity: 'high',
      message: 'Multiple persons detected',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false
    }
  ];

  // Initialize data
  useEffect(() => {
    setExam(mockExam);
    setStudents(mockStudents);
    setViolations(mockViolations);

    // Calculate live stats
    const activeStudents = mockStudents.filter(s => s.status === 'active').length;
    const totalViolations = mockStudents.reduce((sum, s) => sum + s.violations, 0);
    const avgProgress = mockStudents.reduce((sum, s) => sum + s.progress, 0) / mockStudents.length;

    setLiveStats({
      totalStudents: mockStudents.length,
      activeStudents,
      violationsCount: totalViolations,
      averageProgress: Math.round(avgProgress)
    });

    // Initialize socket connection
    const socketConnection = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    socketConnection.emit('join-exam', examId);
    
    socketConnection.on('violation-alert', (data) => {
      setViolations(prev => [data, ...prev.slice(0, 19)]); // Keep last 20
    });

    socketConnection.on('student-update', (data) => {
      setStudents(prev => prev.map(student => 
        student.id === data.studentId ? { ...student, ...data } : student
      ));
    });

    setSocket(socketConnection);

    // Simulate live chart updates every 5 seconds
    const chartInterval = setInterval(() => {
      tickRef.current += 1;
      setLiveChart(prev => {
        const next = [...prev.slice(1), {
          t: `${tickRef.current * 3}m`,
          violations: Math.floor(Math.random() * 4),
          active: 2 + Math.floor(Math.random() * 2),
        }];
        return next;
      });
    }, 5000);

    return () => {
      socketConnection.disconnect();
      clearInterval(chartInterval);
    };
  }, [examId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'flagged': return 'error';
      case 'completed': return 'info';
      case 'disqualified': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentDialog(true);
  };

  const handleDisqualifyStudent = (studentId) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'disqualified' } : student
    ));
    setShowStudentDialog(false);
  };

  const handleResolveViolation = (violationId) => {
    setViolations(prev => prev.map(violation =>
      violation.id === violationId ? { ...violation, resolved: true } : violation
    ));
  };

  if (!exam) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Monitor: {exam.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              icon={<Timer />}
              label={`${Math.round((exam.endTime - new Date()) / 60000)} min remaining`}
              color="primary"
            />
            <Chip
              label={exam.status}
              color={exam.status === 'active' ? 'success' : 'default'}
            />
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {liveStats.totalStudents}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Students
                    </Typography>
                  </Box>
                  <Person sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {liveStats.activeStudents}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Now
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {liveStats.violationsCount}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Violations
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {liveStats.averageProgress}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Avg Progress
                    </Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Live Activity Chart */}
        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Live Activity Monitor</Typography>
                <Chip label="● LIVE" color="error" size="small" sx={{ fontWeight: 700, animation: 'pulse 2s infinite' }} />
              </Box>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={liveChart}>
                  <defs>
                    <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="violations" name="Violations" stroke="#ef4444" fill="url(#vGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="active" name="Active Students" stroke="#6366f1" fill="url(#aGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>

        {/* Students List */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Student Monitoring
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Violations</TableCell>
                      <TableCell>Camera</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {student.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Q{student.currentQuestion}/{exam.totalQuestions}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.status}
                            color={getStatusColor(student.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={student.progress}
                              sx={{ width: 60, height: 6 }}
                            />
                            <Typography variant="caption">
                              {student.progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.violations}
                            color={student.violations > 2 ? 'error' : student.violations > 0 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip
                              icon={<VideoCall />}
                              label=""
                              color={student.cameraStatus === 'active' ? 'success' : 'error'}
                              size="small"
                              sx={{ minWidth: 'auto', '& .MuiChip-label': { px: 0 } }}
                            />
                            <Chip
                              label={student.faceDetected ? '👤' : '❌'}
                              size="small"
                              sx={{ minWidth: 'auto' }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleStudentClick(student)}
                          >
                            <Visibility />
                          </IconButton>
                          {student.violations > 2 && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDisqualifyStudent(student.id)}
                            >
                              <Stop />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        </Grid>

        {/* Violations Panel */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Violations
              </Typography>
              
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {violations.slice(0, 10).map((violation) => (
                  <Alert
                    key={violation.id}
                    severity={getSeverityColor(violation.severity)}
                    sx={{ mb: 2 }}
                    action={
                      !violation.resolved && (
                        <Button
                          size="small"
                          onClick={() => handleResolveViolation(violation.id)}
                        >
                          Resolve
                        </Button>
                      )
                    }
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {violation.studentName}
                    </Typography>
                    <Typography variant="body2">
                      {violation.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {violation.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Student Detail Dialog */}
      <Dialog
        open={showStudentDialog}
        onClose={() => setShowStudentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Details: {selectedStudent?.name}
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedStudent.status}
                  color={getStatusColor(selectedStudent.status)}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary">Progress</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={selectedStudent.progress}
                    sx={{ flexGrow: 1, height: 8 }}
                  />
                  <Typography variant="body2">
                    {selectedStudent.progress}%
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">Time Spent</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatTime(selectedStudent.timeSpent)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Violations</Typography>
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                  {selectedStudent.violations}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">Camera Status</Typography>
                <Chip
                  label={selectedStudent.cameraStatus}
                  color={selectedStudent.cameraStatus === 'active' ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary">Face Detection</Typography>
                <Typography variant="body1">
                  {selectedStudent.faceDetected ? '✅ Detected' : '❌ Not Detected'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStudentDialog(false)}>Close</Button>
          {selectedStudent?.violations > 2 && (
            <Button
              color="error"
              variant="contained"
              onClick={() => handleDisqualifyStudent(selectedStudent.id)}
            >
              Disqualify Student
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MonitorExam;