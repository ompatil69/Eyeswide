import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  People,
  Assignment,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Security,
  BarChart,
  PlayArrow,
  Stop,
  Settings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data - will be replaced with API calls
  const mockStats = {
    totalExams: 25,
    activeExams: 3,
    totalStudents: 150,
    violationsToday: 8,
    completionRate: 87,
    averageScore: 78
  };

  const mockExams = [
    {
      id: 1,
      title: 'Mathematics Placement Test',
      subject: 'Mathematics',
      status: 'active',
      studentsEnrolled: 45,
      studentsCompleted: 32,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
      violations: 5,
      averageScore: 82
    },
    {
      id: 2,
      title: 'Physics Assessment',
      subject: 'Physics',
      status: 'scheduled',
      studentsEnrolled: 38,
      studentsCompleted: 0,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
      violations: 0,
      averageScore: 0
    },
    {
      id: 3,
      title: 'Chemistry Quiz',
      subject: 'Chemistry',
      status: 'completed',
      studentsEnrolled: 52,
      studentsCompleted: 50,
      startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 46 * 60 * 60 * 1000),
      violations: 12,
      averageScore: 75
    }
  ];

  const mockStudents = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      studentId: 'STU001',
      institution: 'Tech University',
      examsCompleted: 5,
      averageScore: 85,
      violations: 2,
      lastActive: new Date(),
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      studentId: 'STU002',
      institution: 'Tech University',
      examsCompleted: 8,
      averageScore: 92,
      violations: 0,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active'
    }
  ];

  const mockViolations = [
    {
      id: 1,
      studentName: 'John Doe',
      examTitle: 'Mathematics Test',
      type: 'tab-switch',
      severity: 'medium',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: false
    },
    {
      id: 2,
      studentName: 'Mike Johnson',
      examTitle: 'Physics Quiz',
      type: 'face-not-detected',
      severity: 'high',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      resolved: true
    }
  ];

  useEffect(() => {
    // Load data
    setStats(mockStats);
    setExams(mockExams);
    setStudents(mockStudents);
    setViolations(mockViolations);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'scheduled': return 'info';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
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

  const handleExamAction = (examId, action) => {
    switch (action) {
      case 'monitor':
        navigate(`/admin/monitor/${examId}`);
        break;
      case 'edit':
        navigate(`/admin/edit-exam/${examId}`);
        break;
      case 'delete':
        // Handle delete
        setExams(prev => prev.filter(exam => exam.id !== examId));
        break;
      default:
        break;
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${
            color === 'primary' ? '#1976d2' : 
            color === 'success' ? '#2e7d32' : 
            color === 'warning' ? '#ed6c02' : 
            color === 'error' ? '#d32f2f' : '#1976d2'
          } 0%, ${
            color === 'primary' ? '#42a5f5' : 
            color === 'success' ? '#4caf50' : 
            color === 'warning' ? '#ff9800' : 
            color === 'error' ? '#f44336' : '#42a5f5'
          } 100%)`,
          color: 'white',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" component="div" fontWeight={700}>
                {value}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {subtitle}
                </Typography>
              )}
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">
                    {trend}% from last month
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.firstName}! Manage your examinations and monitor student performance.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/create-exam')}
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              px: 3,
            }}
          >
            Create Exam
          </Button>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Exams"
            value={stats.totalExams}
            icon={<Assignment />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Exams"
            value={stats.activeExams}
            icon={<PlayArrow />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Violations Today"
            value={stats.violationsToday}
            icon={<Warning />}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Exams Management */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Exam Management
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<BarChart />}
                  size="small"
                  onClick={() => navigate('/admin/analytics')}
                >
                  View Analytics
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Exam</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Students</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Violations</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {exam.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {exam.subject}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={exam.status}
                            color={getStatusColor(exam.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {exam.studentsCompleted}/{exam.studentsEnrolled}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(exam.studentsCompleted / exam.studentsEnrolled) * 100}
                              sx={{ width: 60, height: 6 }}
                            />
                            <Typography variant="caption">
                              {Math.round((exam.studentsCompleted / exam.studentsEnrolled) * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={exam.violations}
                            color={exam.violations > 5 ? 'error' : exam.violations > 0 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {exam.status === 'active' && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleExamAction(exam.id, 'monitor')}
                              >
                                <Visibility />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleExamAction(exam.id, 'edit')}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleExamAction(exam.id, 'delete')}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        </Grid>

        {/* Quick Actions & Violations */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/admin/create-exam')}
                      fullWidth
                    >
                      Create New Exam
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<People />}
                      onClick={() => setShowStudentDialog(true)}
                      fullWidth
                    >
                      Manage Students
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<BarChart />}
                      onClick={() => navigate('/admin')}
                      fullWidth
                    >
                      View Reports
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Settings />}
                      onClick={() => navigate('/profile')}
                      fullWidth
                    >
                      System Settings
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Recent Violations */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Recent Violations
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {violations.map((violation) => (
                      <Alert
                        key={violation.id}
                        severity={getSeverityColor(violation.severity)}
                        sx={{ mb: 1, fontSize: '0.8rem' }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {violation.studentName}
                        </Typography>
                        <Typography variant="body2">
                          {violation.type.replace('-', ' ')} in {violation.examTitle}
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
        </Grid>
      </Grid>

      {/* Student Management Dialog */}
      <Dialog
        open={showStudentDialog}
        onClose={() => setShowStudentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Student Management</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Exams</TableCell>
                  <TableCell>Avg Score</TableCell>
                  <TableCell>Violations</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
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
                            {student.studentId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{student.examsCompleted}</TableCell>
                    <TableCell>{student.averageScore}%</TableCell>
                    <TableCell>
                      <Chip
                        label={student.violations}
                        color={student.violations > 2 ? 'error' : student.violations > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.status}
                        color={student.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStudentDialog(false)}>Close</Button>
          <Button variant="contained">Add Student</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;