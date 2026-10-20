import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, Button,
  Avatar, Chip, LinearProgress, CircularProgress, Paper,
} from '@mui/material';
import {
  Assignment, TrendingUp, Security, Schedule,
  People, CheckCircle, Warning, ArrowForward,
  School, Add, PlayArrow,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const StatCard = ({ title, value, icon, gradient, delay = 0, sub }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
    <Card sx={{
      background: gradient, color: 'white', border: 'none',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>{value}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>{title}</Typography>
            {sub && <Typography variant="caption" sx={{ opacity: 0.65 }}>{sub}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 52, height: 52 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const { user, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isStudent) fetchUpcomingExams();
    else setLoading(false);
  }, [isStudent]);

  const fetchUpcomingExams = async () => {
    try {
      const response = await axios.get('/exams');
      const exams = response.data.exams || [];
      setUpcomingExams(exams.filter(e => e.status === 'scheduled').slice(0, 3));
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const recentActivity = [
    { id: 1, type: 'exam_completed', title: 'Chemistry Test completed', time: '2 hours ago', score: 92 },
    { id: 2, type: 'violation', title: 'Minor violation detected', time: '1 day ago', desc: 'Brief gaze deviation' },
    { id: 3, type: 'exam_scheduled', title: 'New exam scheduled', time: '2 days ago', desc: 'Mathematics Placement Test' },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isStudent
              ? 'Ready for your next exam? Check your upcoming assessments below.'
              : 'Monitor your exams and student performance from your dashboard.'}
          </Typography>
        </Box>
      </motion.div>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isStudent ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Upcoming Exams" value={upcomingExams.length} icon={<Schedule />}
                gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" delay={0} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Completed Exams" value={12} icon={<CheckCircle />}
                gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" delay={0.1} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Average Score" value="85%" icon={<TrendingUp />}
                gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" delay={0.2} sub="+12% this month" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Violations" value={2} icon={<Warning />}
                gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" delay={0.3} />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Exams" value={25} icon={<Assignment />}
                gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" delay={0} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Exams" value={3} icon={<School />}
                gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" delay={0.1} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Students" value={150} icon={<People />}
                gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" delay={0.2} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Violations Today" value={8} icon={<Security />}
                gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" delay={0.3} />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={3}>
        {/* Main Panel */}
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  {isStudent ? 'Upcoming Exams' : 'Recent Exam Activity'}
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  size="small"
                  onClick={() => navigate(isStudent ? '/exams' : '/admin')}
                  sx={{ color: 'primary.main' }}
                >
                  View All
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : upcomingExams.length > 0 ? (
                upcomingExams.map((exam, index) => (
                  <Box key={exam._id} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    py: 2, borderBottom: index < upcomingExams.length - 1 ? 1 : 0, borderColor: 'divider',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{exam.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(exam.scheduledDate)} at {formatTime(exam.startTime)} • {exam.duration} min
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={exam.status} color="primary" variant="outlined" size="small" />
                      {isStudent && (
                        <Button variant="contained" size="small" startIcon={<PlayArrow />}
                          onClick={() => navigate(`/exam/${exam._id}`)}>
                          Start
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Assignment sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No upcoming exams</Typography>
                  {isStudent && (
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/exams')}>
                      Browse Exams
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>

        {/* Sidebar Panel */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3} direction="column">
            {/* Recent Activity */}
            <Grid item>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Recent Activity</Typography>
                  {recentActivity.map((activity, index) => (
                    <Box key={activity.id} sx={{
                      py: 1.5, borderBottom: index < recentActivity.length - 1 ? 1 : 0, borderColor: 'divider',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Avatar sx={{
                          width: 32, height: 32,
                          bgcolor: activity.type === 'violation' ? 'warning.main' : activity.type === 'exam_completed' ? 'success.main' : 'primary.main',
                        }}>
                          {activity.type === 'violation' ? <Warning sx={{ fontSize: 16 }} />
                            : activity.type === 'exam_completed' ? <CheckCircle sx={{ fontSize: 16 }} />
                            : <Schedule sx={{ fontSize: 16 }} />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{activity.title}</Typography>
                          {activity.desc && <Typography variant="caption" color="text.secondary">{activity.desc}</Typography>}
                          {activity.score && <Chip label={`${activity.score}%`} color="success" size="small" sx={{ mt: 0.5, display: 'block', width: 'fit-content' }} />}
                          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.3 }}>{activity.time}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </motion.div>
            </Grid>

            {/* Quick Actions */}
            <Grid item>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Quick Actions</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {isStudent ? (
                      <>
                        <Button variant="contained" fullWidth startIcon={<School />}
                          onClick={() => navigate('/exams')}>
                          View My Exams
                        </Button>
                        <Button variant="outlined" fullWidth startIcon={<Assignment />}
                          onClick={() => navigate('/profile')}>
                          Update Profile
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="contained" fullWidth startIcon={<Add />}
                          onClick={() => navigate('/admin/create-exam')}>
                          Create Exam
                        </Button>
                        <Button variant="outlined" fullWidth startIcon={<People />}
                          onClick={() => navigate('/admin')}>
                          Admin Panel
                        </Button>
                        <Button variant="outlined" fullWidth startIcon={<Security />}
                          onClick={() => navigate('/admin')}>
                          View Reports
                        </Button>
                      </>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
