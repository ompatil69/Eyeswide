import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Timer,
  Warning,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Flag,
  Send,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import VideoProctor from '../../components/proctoring/VideoProctor';
import TabSwitchDetector from '../../components/proctoring/TabSwitchDetector';
import AudioMonitor from '../../components/proctoring/AudioMonitor';
import BehaviorAnalysis from '../../components/proctoring/BehaviorAnalysis';
import axios from 'axios';
import toast from 'react-hot-toast';

const ExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [violations, setViolations] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [screenFlash, setScreenFlash] = useState(false);
  
  const timerRef = useRef(null);
  const violationCountRef = useRef(0);

  // Mock exam data (will be replaced with API call)
  const mockExam = {
    id: examId,
    title: 'Mathematics Placement Test',
    description: 'Comprehensive mathematics assessment',
    duration: 120, // minutes
    totalMarks: 100,
    questions: [
      {
        id: 1,
        questionText: 'What is the derivative of x²?',
        questionType: 'multiple-choice',
        options: [
          { text: '2x', isCorrect: true },
          { text: 'x²', isCorrect: false },
          { text: '2x²', isCorrect: false },
          { text: 'x', isCorrect: false }
        ],
        points: 5
      },
      {
        id: 2,
        questionText: 'Solve for x: 2x + 5 = 13',
        questionType: 'multiple-choice',
        options: [
          { text: '4', isCorrect: true },
          { text: '3', isCorrect: false },
          { text: '5', isCorrect: false },
          { text: '6', isCorrect: false }
        ],
        points: 5
      },
      {
        id: 3,
        questionText: 'Explain the concept of limits in calculus.',
        questionType: 'essay',
        points: 10
      }
    ],
    proctorSettings: {
      faceDetection: true,
      gazeTracking: true,
      faceDirectionTracking: true,
      tabSwitchDetection: true,
      audioMonitoring: true,
      allowedViolations: 4,
      strictMode: false
    }
  };

  // Initialize exam
  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const response = await axios.get(`/exams/${examId}`);
      setExam(response.data.exam);
      setTimeRemaining(response.data.exam.duration * 60); // Convert to seconds
    } catch (error) {
      console.error('Error fetching exam:', error);
      // Fallback to mock data for demo
      setExam(mockExam);
      setTimeRemaining(mockExam.duration * 60);
    }
  };

  // Start exam timer
  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examStarted, timeRemaining]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      if (!document.fullscreenElement && examStarted) {
        handleViolation({
          type: 'fullscreen-exit',
          severity: 'high',
          message: 'Exited fullscreen mode - this is a serious violation',
          timestamp: new Date()
        });
      }
    };

    // Additional detection for window resize (catches manual fullscreen exit)
    const handleWindowResize = () => {
      if (examStarted && !document.fullscreenElement) {
        // Check if window is not maximized
        if (window.innerHeight < screen.height - 100 || window.innerWidth < screen.width - 100) {
          handleViolation({
            type: 'window-resize',
            severity: 'medium',
            message: 'Window resized or not in fullscreen',
            timestamp: new Date()
          });
        }
      }
    };

    // Detect when user tries to leave the page
    const handleBeforeUnload = (e) => {
      if (examStarted) {
        handleViolation({
          type: 'page-exit-attempt',
          severity: 'high',
          message: 'Attempted to leave exam page',
          timestamp: new Date()
        });
        
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the exam?';
        return 'Are you sure you want to leave the exam?';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examStarted]);

  // Handle violations
  const handleViolation = (violation) => {
    violationCountRef.current++;
    setViolations(prev => [...prev, { ...violation, id: Date.now() }]);
    
    // Trigger screen flash for high severity violations
    if (violation.severity === 'high') {
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 300);
    }
    
    // Trigger vibration if supported
    if ('vibrate' in navigator) {
      // Different vibration patterns based on severity
      if (violation.severity === 'high') {
        // Strong vibration pattern for high severity: long-short-long
        navigator.vibrate([200, 100, 200, 100, 200]);
      } else if (violation.severity === 'medium') {
        // Medium vibration pattern: two pulses
        navigator.vibrate([150, 100, 150]);
      } else {
        // Light vibration for low severity: single pulse
        navigator.vibrate(100);
      }
    }
    
    // Play warning sound
    playWarningSound(violation.severity);
    
    // Show toast notification based on severity
    const remainingViolations = (exam?.proctorSettings?.allowedViolations || 4) - violationCountRef.current;
    
    if (violation.severity === 'high') {
      toast.error(
        `🚨 ${violation.message}\n${remainingViolations} violations remaining!`,
        {
          duration: 4000,
          style: {
            background: '#d32f2f',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
          },
          icon: '⚠️',
        }
      );
    } else if (violation.severity === 'medium') {
      toast.error(
        `⚠️ ${violation.message}\n${remainingViolations} violations remaining`,
        {
          duration: 3000,
          style: {
            background: '#f57c00',
            color: '#fff',
            fontWeight: '600',
          },
        }
      );
    } else {
      toast(
        `ℹ️ ${violation.message}`,
        {
          duration: 2000,
          style: {
            background: '#1976d2',
            color: '#fff',
          },
        }
      );
    }
    
    // Show warning with animation
    setWarningMessage(violation.message);
    setShowWarning(true);
    
    // Auto-hide warning after 4 seconds
    setTimeout(() => {
      setShowWarning(false);
    }, 4000);
    
    // Auto-submit if too many violations
    if (violationCountRef.current >= exam?.proctorSettings?.allowedViolations) {
      // Final strong vibration before disqualification
      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
      }
      
      // Show final warning
      toast.error(
        '🚫 EXAM DISQUALIFIED - Too many violations detected!',
        {
          duration: 5000,
          style: {
            background: '#000',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            border: '3px solid #f44336',
          },
        }
      );
      
      setTimeout(() => {
        handleSubmitExam('disqualified');
      }, 2000);
    }
  };

  // Play warning sound based on severity
  const playWarningSound = (severity) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different severities
      if (severity === 'high') {
        oscillator.frequency.value = 800; // High pitch for high severity
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (severity === 'medium') {
        oscillator.frequency.value = 600; // Medium pitch
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } else {
        oscillator.frequency.value = 400; // Low pitch for low severity
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
      }
    } catch (error) {
      console.error('Error playing warning sound:', error);
    }
  };

  // Start exam
  const startExam = async () => {
    try {
      // Request fullscreen
      await document.documentElement.requestFullscreen();
      setExamStarted(true);
    } catch (error) {
      console.error('Fullscreen error:', error);
      setExamStarted(true); // Continue without fullscreen
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigate questions
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Submit exam
  const handleSubmitExam = (status = 'completed') => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // In real app, submit to API
    console.log('Exam submitted:', {
      examId,
      answers,
      violations,
      status,
      timeSpent: (exam.duration * 60) - timeRemaining
    });

    navigate('/exams');
  };

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  if (!exam) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading exam...</Typography>
      </Container>
    );
  }

  if (!examStarted) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {exam.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {exam.description}
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Chip icon={<Timer />} label={`${exam.duration} minutes`} />
              </Grid>
              <Grid item>
                <Chip label={`${exam.questions.length} questions`} />
              </Grid>
              <Grid item>
                <Chip label={`${exam.totalMarks} marks`} />
              </Grid>
            </Grid>
          </Box>

          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Proctoring Requirements:
            </Typography>
            <Typography variant="body2">
              • Camera and microphone access required<br/>
              • Fullscreen mode will be enforced<br/>
              • Tab switching is monitored<br/>
              • Face detection is active<br/>
              • Face direction tracking enabled - keep facing the screen<br/>
              • Maximum {exam.proctorSettings.allowedViolations} violations allowed
            </Typography>
          </Alert>

          <Button
            variant="contained"
            size="large"
            onClick={startExam}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            }}
          >
            Start Exam
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentQ = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}>
      {/* Screen Flash Overlay for High Severity Violations */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#ff0000',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Proctoring Components */}
      <VideoProctor
        examId={examId}
        onViolation={handleViolation}
        isActive={examStarted}
      />
      
      <TabSwitchDetector
        examId={examId}
        onViolation={handleViolation}
        isActive={examStarted}
      />

      {/* Warning Snackbar */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -50, 
              scale: 0.8,
              transition: { duration: 0.2 }
            }}
            style={{
              position: 'fixed',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              minWidth: 400,
              maxWidth: 600,
            }}
          >
            <Alert
              severity="error"
              onClose={() => setShowWarning(false)}
              sx={{ 
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(255, 0, 0, 0.3)',
                border: '2px solid #f44336',
                animation: 'pulse 0.5s ease-in-out 3',
                '@keyframes pulse': {
                  '0%, 100%': {
                    boxShadow: '0 8px 32px rgba(255, 0, 0, 0.3)',
                  },
                  '50%': {
                    boxShadow: '0 8px 32px rgba(255, 0, 0, 0.6)',
                  },
                },
              }}
              icon={
                <Warning 
                  sx={{ 
                    fontSize: 32,
                    animation: 'shake 0.5s ease-in-out',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '25%': { transform: 'translateX(-5px)' },
                      '75%': { transform: 'translateX(5px)' },
                    },
                  }} 
                />
              }
            >
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  ⚠️ VIOLATION DETECTED!
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {warningMessage}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Violations: {violationCountRef.current}/{exam?.proctorSettings?.allowedViolations || 4}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(violationCountRef.current / (exam?.proctorSettings?.allowedViolations || 4)) * 100}
                    color="error"
                    sx={{ 
                      flex: 1, 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  />
                </Box>
                {violationCountRef.current >= (exam?.proctorSettings?.allowedViolations || 4) - 1 && (
                  <Typography 
                    variant="caption" 
                    color="error" 
                    sx={{ 
                      display: 'block', 
                      mt: 1,
                      fontWeight: 700,
                      animation: 'blink 1s ease-in-out infinite',
                      '@keyframes blink': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  >
                    ⚠️ WARNING: One more violation will result in disqualification!
                  </Typography>
                )}
              </Box>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Header */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{exam.title}</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Timer */}
              <Chip
                icon={<Timer />}
                label={formatTime(timeRemaining)}
                color={timeRemaining < 300 ? 'error' : 'primary'}
                sx={{ fontSize: '1rem', px: 1 }}
              />
              
              {/* Violations */}
              <Chip
                icon={<Warning />}
                label={`${violationCountRef.current}/${exam.proctorSettings.allowedViolations}`}
                color={violationCountRef.current > 0 ? 'error' : 'success'}
              />
              
              {/* Fullscreen Toggle */}
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                <IconButton onClick={toggleFullscreen}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Progress */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Question {currentQuestion + 1} of {exam.questions.length}
              </Typography>
              <Typography variant="body2">
                {Math.round(progress)}% Complete
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Question Panel */}
          <Grid item xs={12} md={8}>
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 3, minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Question {currentQuestion + 1}
                  <Chip
                    label={`${currentQ.points} marks`}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  {currentQ.questionText}
                </Typography>

                {/* Answer Input */}
                <Box sx={{ mt: 3 }}>
                  {currentQ.questionType === 'multiple-choice' && (
                    <RadioGroup
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    >
                      {currentQ.options.map((option, index) => (
                        <FormControlLabel
                          key={index}
                          value={option.text}
                          control={<Radio />}
                          label={option.text}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </RadioGroup>
                  )}

                  {currentQ.questionType === 'essay' && (
                    <TextField
                      multiline
                      rows={8}
                      fullWidth
                      placeholder="Type your answer here..."
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    startIcon={<NavigateBefore />}
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    variant="contained"
                    endIcon={currentQuestion === exam.questions.length - 1 ? <Send /> : <NavigateNext />}
                    onClick={currentQuestion === exam.questions.length - 1 ? 
                      () => setShowSubmitDialog(true) : nextQuestion}
                  >
                    {currentQuestion === exam.questions.length - 1 ? 'Submit Exam' : 'Next'}
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Question Navigator */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Questions
              </Typography>
              <Grid container spacing={1}>
                {exam.questions.map((q, index) => (
                  <Grid item xs={3} key={q.id}>
                    <Button
                      variant={index === currentQuestion ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => goToQuestion(index)}
                      sx={{
                        minWidth: 40,
                        height: 40,
                        bgcolor: answers[q.id] ? 'success.light' : undefined,
                        color: answers[q.id] && index !== currentQuestion ? 'success.dark' : undefined,
                      }}
                    >
                      {index + 1}
                      {answers[q.id] && <CheckCircle sx={{ fontSize: 12, ml: 0.5 }} />}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Audio Monitor */}
            <AudioMonitor
              examId={examId}
              onViolation={handleViolation}
              isActive={examStarted}
            />

            {/* Behavior Analysis */}
            <BehaviorAnalysis
              violations={violations}
              isActive={examStarted}
              examDuration={exam?.duration}
            />

            {/* Submit Button */}
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<Send />}
              onClick={() => setShowSubmitDialog(true)}
              sx={{ mt: 2 }}
            >
              Submit Exam
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your exam? This action cannot be undone.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Answered: {Object.keys(answers).length}/{exam.questions.length} questions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Time remaining: {formatTime(timeRemaining)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleSubmitExam()}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamTaking;