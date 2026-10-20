import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Schedule,
  Assignment,
  Timer,
  PlayArrow,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const ExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/exams');
      setExams(response.data.exams || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to load exams. Please try again.');
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': '#1976d2',
      'Physics': '#388e3c',
      'Chemistry': '#f57c00',
      'Computer Science': '#7b1fa2',
    };
    return colors[subject] || '#757575';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading exams...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchExams}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            My Exams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your upcoming and completed examinations.
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {exams.map((exam, index) => (
          <Grid item xs={12} md={6} key={exam._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getSubjectColor(exam.subject),
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <Assignment />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {exam.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={exam.status}
                          color={getStatusColor(exam.status)}
                          size="small"
                        />
                        <Chip
                          label={exam.subject}
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: getSubjectColor(exam.subject),
                            color: getSubjectColor(exam.subject),
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    {exam.description}
                  </Typography>

                  {/* Exam Details */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Schedule sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(exam.scheduledDate)} at {formatTime(exam.startTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Timer sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Duration: {exam.duration} minutes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Assignment sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Total Marks: {exam.totalMarks}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Button */}
                  <Box sx={{ mt: 'auto' }}>
                    {exam.status === 'scheduled' && (
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        fullWidth
                        onClick={() => handleStartExam(exam._id)}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          background: `linear-gradient(45deg, ${getSubjectColor(exam.subject)} 30%, ${getSubjectColor(exam.subject)}aa 90%)`,
                        }}
                      >
                        Start Exam
                      </Button>
                    )}
                    {exam.status === 'completed' && (
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate(`/exam/${exam._id}/results`)}
                        sx={{ py: 1.5, fontWeight: 600 }}
                      >
                        View Results
                      </Button>
                    )}
                    {exam.status === 'active' && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrow />}
                        fullWidth
                        onClick={() => handleStartExam(exam._id)}
                        sx={{ py: 1.5, fontWeight: 600 }}
                      >
                        Continue Exam
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {exams.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No exams available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for upcoming examinations.
            </Typography>
          </Box>
        </motion.div>
      )}
    </Container>
  );
};

export default ExamList;