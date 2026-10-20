import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Delete,
  Preview,
  Save,
  Schedule,
  Security,
  Assignment,
  People,
  Settings,
  Upload,
  ContentPaste,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const BULK_PLACEHOLDER = `Q1. What is the derivative of x²?
A) 2x *
B) x²
C) 2x²
D) x

Q2. Solve for x: 2x + 5 = 13
A) 3
B) 4 *
C) 5
D) 6

Q3. True or False: The speed of light is 3×10⁸ m/s
A) True *
B) False

Q4. What is the capital of France? [2pts]
A) Berlin
B) Madrid
C) Paris *
D) Rome

// Essay example:
Q5. Explain Newton's second law of motion. [5pts] [essay]`;

// ── Bulk parser ──────────────────────────────────────────────────────────────
const parseBulkText = (text) => {
  const questions = [];
  // Split on lines that start a new question: Q1. / 1. / Q1) / 1)
  const blocks = text.split(/\n(?=\s*(?:Q?\d+[\.\)])\s)/i).filter(b => b.trim());

  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    // First line = question text
    let qLine = lines[0].replace(/^Q?\d+[\.\)]\s*/i, '').trim();

    // Extract points [Xpts] and type [essay/short]
    let points = 1;
    let qType = 'multiple-choice';
    const ptsMatch = qLine.match(/\[(\d+)\s*pts?\]/i);
    if (ptsMatch) { points = parseInt(ptsMatch[1]); qLine = qLine.replace(ptsMatch[0], '').trim(); }
    if (/\[essay\]/i.test(qLine)) { qType = 'essay'; qLine = qLine.replace(/\[essay\]/i, '').trim(); }
    if (/\[short\]/i.test(qLine)) { qType = 'short-answer'; qLine = qLine.replace(/\[short\]/i, '').trim(); }

    // Option lines: A) text  or  A. text  — mark correct with *
    const optionLines = lines.slice(1).filter(l => /^[A-Fa-f][\.\)]/i.test(l));

    if (optionLines.length === 2 &&
      optionLines[0].replace(/^[A-F][\.\)]\s*/i,'').replace('*','').trim().toLowerCase() === 'true' &&
      optionLines[1].replace(/^[A-F][\.\)]\s*/i,'').replace('*','').trim().toLowerCase() === 'false') {
      qType = 'true-false';
    }

    const options = optionLines.map(ol => {
      const isCorrect = ol.includes('*');
      const text = ol.replace(/^[A-Fa-f][\.\)]\s*/i, '').replace('*', '').trim();
      return { text, isCorrect };
    });

    // If no option marked correct, mark first as placeholder
    if (options.length > 0 && !options.some(o => o.isCorrect)) {
      options[0].isCorrect = true;
    }

    if (qLine) {
      questions.push({
        id: Date.now() + Math.random(),
        questionText: qLine,
        questionType: options.length === 0 ? (qType === 'multiple-choice' ? 'essay' : qType) : qType,
        options: options.length > 0 ? options : [],
        points,
        timeLimit: null,
      });
    }
  });

  return questions;
};

const CreateExam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);

  const [examData, setExamData] = useState({
    // Basic Info
    title: '',
    description: '',
    subject: '',
    institution: user?.institution || '',
    
    // Timing
    duration: 60,
    scheduledDate: new Date(),
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    
    // Scoring
    totalMarks: 100,
    passingMarks: 40,
    
    // Questions
    questions: [],
    
    // Proctoring Settings
    proctorSettings: {
      faceDetection: true,
      gazeTracking: true,
      tabSwitchDetection: true,
      audioMonitoring: true,
      screenRecording: false,
      allowedViolations: 3,
      strictMode: false,
      requireFullscreen: true,
      preventCopyPaste: true,
      randomizeQuestions: false,
    },
    
    // Students
    enrolledStudents: [],
  });

  const steps = [
    'Basic Information',
    'Questions',
    'Proctoring Settings',
    'Schedule & Students',
    'Review & Create'
  ];

  const handleInputChange = (field, value) => {
    setExamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProctoringChange = (field, value) => {
    setExamData(prev => ({
      ...prev,
      proctorSettings: {
        ...prev.proctorSettings,
        [field]: value
      }
    }));
  };

  const addQuestion = (type = 'multiple-choice') => {
    const newQuestion = {
      id: Date.now(),
      questionText: '',
      questionType: type,
      options: type === 'true-false'
        ? [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: false }]
        : [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
      points: 1,
      timeLimit: null,
    };
    setExamData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const duplicateQuestion = (question) => {
    const copy = { ...question, id: Date.now(), questionText: question.questionText + ' (copy)' };
    setExamData(prev => ({ ...prev, questions: [...prev.questions, copy] }));
  };

  const addOption = (questionId) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: [...q.options, { text: '', isCorrect: false }] }
          : q
      ),
    }));
  };

  const removeOption = (questionId, optIndex) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.filter((_, i) => i !== optIndex) }
          : q
      ),
    }));
  };

  const setCorrectOption = (questionId, optIndex) => {
    // For single-correct: uncheck all others
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, i) => ({ ...opt, isCorrect: i === optIndex })) }
          : q
      ),
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        // Reset options when type changes
        if (field === 'questionType') {
          let options = q.options;
          if (value === 'true-false') {
            options = [{ text: 'True', isCorrect: false }, { text: 'False', isCorrect: false }];
          } else if (value === 'multiple-choice' && q.questionType !== 'multiple-choice') {
            options = [
              { text: '', isCorrect: false }, { text: '', isCorrect: false },
              { text: '', isCorrect: false }, { text: '', isCorrect: false },
            ];
          }
          return { ...q, [field]: value, options };
        }
        return { ...q, [field]: value };
      }),
    }));
  };

  const updateQuestionOption = (questionId, optionIndex, field, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? {
          ...q,
          options: q.options.map((opt, idx) => 
            idx === optionIndex ? { ...opt, [field]: value } : opt
          )
        } : q
      )
    }));
  };

  const deleteQuestion = (questionId) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  // ── Bulk import handlers ──────────────────────────────────────────────────
  const handleBulkPreview = () => {
    const parsed = parseBulkText(bulkText);
    if (parsed.length === 0) {
      toast.error('No questions detected. Check the format.');
      return;
    }
    setBulkPreview(parsed);
    toast.success(`${parsed.length} questions detected — review and confirm`);
  };

  const handleBulkConfirm = () => {
    if (bulkPreview.length === 0) return;
    setExamData(prev => ({ ...prev, questions: [...prev.questions, ...bulkPreview] }));
    toast.success(`${bulkPreview.length} questions added!`);
    setShowBulkImport(false);
    setBulkText('');
    setBulkPreview([]);
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Basic Info
        if (!examData.title.trim()) {
          toast.error('Exam title is required');
          return false;
        }
        if (!examData.subject.trim()) {
          toast.error('Subject is required');
          return false;
        }
        if (examData.duration < 1) {
          toast.error('Duration must be at least 1 minute');
          return false;
        }
        break;
      case 1: // Questions
        if (examData.questions.length === 0) {
          toast.error('At least one question is required');
          return false;
        }
        for (let q of examData.questions) {
          if (!q.questionText.trim()) {
            toast.error('All questions must have text');
            return false;
          }
          if (q.questionType === 'multiple-choice') {
            const hasCorrect = q.options.some(opt => opt.isCorrect);
            if (!hasCorrect) {
              toast.error('Each multiple choice question must have a correct answer');
              return false;
            }
          }
        }
        break;
      case 2: // Proctoring - always valid
        break;
      case 3: // Schedule
        if (examData.startTime >= examData.endTime) {
          toast.error('End time must be after start time');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      const totalMarks = examData.questions.reduce((sum, q) => sum + q.points, 0);

      const examPayload = {
        title: examData.title,
        description: examData.description,
        subject: examData.subject,
        duration: examData.duration,
        totalMarks: totalMarks || examData.totalMarks,
        passingMarks: examData.passingMarks,
        scheduledDate: examData.scheduledDate,
        startTime: examData.startTime,
        endTime: examData.endTime,
        questions: examData.questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          points: q.points,
          timeLimit: q.timeLimit || null,
        })),
        proctorSettings: examData.proctorSettings,
        status: 'scheduled',
      };

      const response = await axios.post('/exams', examPayload);

      if (response.data.success) {
        toast.success('Exam created successfully!');
        navigate('/admin');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create exam';
      toast.error(msg);
      console.error('Create exam error:', error);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Exam Title"
                value={examData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subject"
                value={examData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={examData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Duration (minutes)"
                value={examData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Passing Marks"
                value={examData.passingMarks}
                onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value))}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Questions
                <Chip label={examData.questions.length} size="small" color="primary" sx={{ ml: 1 }} />
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ContentPaste />}
                  onClick={() => setShowBulkImport(true)}
                  sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
                >
                  Bulk Import
                </Button>
                {['multiple-choice', 'true-false', 'short-answer', 'essay'].map(type => (
                  <Button
                    key={type}
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addQuestion(type)}
                    sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                  >
                    {type === 'multiple-choice' ? 'MCQ' : type === 'true-false' ? 'T/F' : type === 'short-answer' ? 'Short' : 'Essay'}
                  </Button>
                ))}
              </Box>
            </Box>

            <AnimatePresence>
              {examData.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      {/* Question Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={`Q${index + 1}`} size="small" color="primary" />
                          <Chip label={question.questionType} size="small" variant="outlined" />
                          <Chip label={`${question.points} pt${question.points > 1 ? 's' : ''}`} size="small" color="success" />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => duplicateQuestion(question)} title="Duplicate">
                            <Preview sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => deleteQuestion(question.id)}>
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        {/* Question Text */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth multiline rows={2}
                            label={`Question ${index + 1}`}
                            placeholder="Enter your question here..."
                            value={question.questionText}
                            onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                          />
                        </Grid>

                        {/* Type & Points */}
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select value={question.questionType} label="Type"
                              onChange={(e) => updateQuestion(question.id, 'questionType', e.target.value)}>
                              <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                              <MenuItem value="true-false">True / False</MenuItem>
                              <MenuItem value="short-answer">Short Answer</MenuItem>
                              <MenuItem value="essay">Essay</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                          <TextField fullWidth size="small" type="number" label="Points"
                            value={question.points}
                            onChange={(e) => updateQuestion(question.id, 'points', Math.max(1, parseInt(e.target.value) || 1))}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>

                        {/* Options for MCQ */}
                        {(question.questionType === 'multiple-choice' || question.questionType === 'true-false') && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                              OPTIONS — click the radio to mark correct answer
                            </Typography>
                            {question.options.map((option, optIndex) => (
                              <Box key={optIndex} sx={{
                                display: 'flex', alignItems: 'center', gap: 1, mb: 1,
                                p: 1, borderRadius: 1,
                                bgcolor: option.isCorrect ? 'rgba(16,185,129,0.08)' : 'transparent',
                                border: '1px solid',
                                borderColor: option.isCorrect ? 'success.light' : 'divider',
                              }}>
                                {/* Radio to mark correct */}
                                <Box
                                  onClick={() => setCorrectOption(question.id, optIndex)}
                                  sx={{
                                    width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                                    border: '2px solid', borderColor: option.isCorrect ? 'success.main' : 'grey.400',
                                    bgcolor: option.isCorrect ? 'success.main' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  {option.isCorrect && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />}
                                </Box>

                                <TextField
                                  fullWidth size="small"
                                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                  value={option.text}
                                  disabled={question.questionType === 'true-false'}
                                  onChange={(e) => updateQuestionOption(question.id, optIndex, 'text', e.target.value)}
                                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'transparent' } }}
                                />

                                {question.questionType === 'multiple-choice' && question.options.length > 2 && (
                                  <IconButton size="small" onClick={() => removeOption(question.id, optIndex)}>
                                    <Delete sx={{ fontSize: 16 }} />
                                  </IconButton>
                                )}
                              </Box>
                            ))}

                            {question.questionType === 'multiple-choice' && question.options.length < 6 && (
                              <Button size="small" startIcon={<Add />} onClick={() => addOption(question.id)}
                                sx={{ mt: 0.5 }}>
                                Add Option
                              </Button>
                            )}
                          </Grid>
                        )}

                        {/* Short answer hint */}
                        {question.questionType === 'short-answer' && (
                          <Grid item xs={12}>
                            <TextField fullWidth size="small" label="Expected Answer (for auto-grading)"
                              placeholder="Enter the expected answer..."
                              value={question.options[0]?.text || ''}
                              onChange={(e) => updateQuestion(question.id, 'options', [{ text: e.target.value, isCorrect: true }])}
                            />
                          </Grid>
                        )}

                        {/* Essay note */}
                        {question.questionType === 'essay' && (
                          <Grid item xs={12}>
                            <Alert severity="info" sx={{ py: 0.5 }}>
                              Essay questions require manual grading by the instructor.
                            </Alert>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {examData.questions.length === 0 && (
              <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'grey.50', border: '2px dashed', borderColor: 'divider' }}>
                <Assignment sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>No questions yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Use the buttons above to add MCQ, True/False, Short Answer, or Essay questions
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => addQuestion('multiple-choice')}>
                  Add First Question
                </Button>
              </Paper>
            )}

            {examData.questions.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  Total: {examData.questions.length} questions •{' '}
                  {examData.questions.reduce((s, q) => s + q.points, 0)} points •{' '}
                  {examData.questions.filter(q => q.questionType === 'multiple-choice').length} MCQ •{' '}
                  {examData.questions.filter(q => q.questionType === 'true-false').length} T/F •{' '}
                  {examData.questions.filter(q => q.questionType === 'essay').length} Essay
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Proctoring Configuration
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>AI Monitoring</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={examData.proctorSettings.faceDetection}
                        onChange={(e) => handleProctoringChange('faceDetection', e.target.checked)}
                      />
                    }
                    label="Face Detection"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={examData.proctorSettings.gazeTracking}
                        onChange={(e) => handleProctoringChange('gazeTracking', e.target.checked)}
                      />
                    }
                    label="Gaze Tracking"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={examData.proctorSettings.audioMonitoring}
                        onChange={(e) => handleProctoringChange('audioMonitoring', e.target.checked)}
                      />
                    }
                    label="Audio Monitoring"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Browser Security</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={examData.proctorSettings.tabSwitchDetection}
                        onChange={(e) => handleProctoringChange('tabSwitchDetection', e.target.checked)}
                      />
                    }
                    label="Tab Switch Detection"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={examData.proctorSettings.requireFullscreen}
                        onChange={(e) => handleProctoringChange('requireFullscreen', e.target.checked)}
                      />
                    }
                    label="Require Fullscreen"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={examData.proctorSettings.preventCopyPaste}
                        onChange={(e) => handleProctoringChange('preventCopyPaste', e.target.checked)}
                      />
                    }
                    label="Prevent Copy/Paste"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Allowed Violations"
                value={examData.proctorSettings.allowedViolations}
                onChange={(e) => handleProctoringChange('allowedViolations', parseInt(e.target.value))}
                helperText="Number of violations before auto-disqualification"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={examData.proctorSettings.strictMode}
                    onChange={(e) => handleProctoringChange('strictMode', e.target.checked)}
                  />
                }
                label="Strict Mode"
              />
              <Typography variant="caption" display="block" color="text.secondary">
                Enables maximum security with zero tolerance for violations
              </Typography>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Schedule Exam
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Scheduled Date"
                value={examData.scheduledDate.toISOString().slice(0, 16)}
                onChange={(e) => handleInputChange('scheduledDate', new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Start Time"
                value={examData.startTime.toISOString().slice(0, 16)}
                onChange={(e) => handleInputChange('startTime', new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="datetime-local"
                label="End Time"
                value={examData.endTime.toISOString().slice(0, 16)}
                onChange={(e) => handleInputChange('endTime', new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                Student Enrollment
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Student enrollment will be available after exam creation. You can add students from the exam management page.
              </Alert>
            </Grid>
          </Grid>
        );

      case 4:
        const totalMarks = examData.questions.reduce((sum, q) => sum + q.points, 0);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review Exam Details</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Basic Information</Typography>
                    <Typography><strong>Title:</strong> {examData.title}</Typography>
                    <Typography><strong>Subject:</strong> {examData.subject}</Typography>
                    <Typography><strong>Duration:</strong> {examData.duration} minutes</Typography>
                    <Typography><strong>Total Questions:</strong> {examData.questions.length}</Typography>
                    <Typography><strong>Total Marks:</strong> {totalMarks}</Typography>
                    <Typography><strong>Passing Marks:</strong> {examData.passingMarks}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Proctoring Settings</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {examData.proctorSettings.faceDetection && <Chip label="Face Detection" color="primary" size="small" />}
                      {examData.proctorSettings.gazeTracking && <Chip label="Gaze Tracking" color="primary" size="small" />}
                      {examData.proctorSettings.tabSwitchDetection && <Chip label="Tab Detection" color="primary" size="small" />}
                      {examData.proctorSettings.audioMonitoring && <Chip label="Audio Monitor" color="primary" size="small" />}
                      {examData.proctorSettings.strictMode && <Chip label="Strict Mode" color="error" size="small" />}
                    </Box>
                    <Typography sx={{ mt: 1 }}>
                      <strong>Allowed Violations:</strong> {examData.proctorSettings.allowedViolations}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Schedule</Typography>
                    <Typography><strong>Start:</strong> {examData.startTime.toLocaleString()}</Typography>
                    <Typography><strong>End:</strong> {examData.endTime.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Preview />}
                onClick={() => setShowPreview(true)}
              >
                Preview Exam
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Create New Exam
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Set up a comprehensive examination with AI-powered proctoring
        </Typography>
      </motion.div>

      <Paper sx={{ p: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent(activeStep)}
        </motion.div>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Save />}
                size="large"
              >
                Create Exam
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImport} onClose={() => { setShowBulkImport(false); setBulkPreview([]); setBulkText(''); }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContentPaste sx={{ color: '#7c3aed' }} />
            Bulk Import Questions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>Format Guide:</Typography>
            <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
{`Q1. Question text here?
A) Option A *        ← mark correct with *
B) Option B
C) Option C
D) Option D

Q2. True or False question?
A) True *
B) False

Q3. Essay question [5pts] [essay]

Q4. Question worth 2 points [2pts]
A) Wrong
B) Correct *`}
            </Typography>
          </Alert>

          <TextField
            fullWidth multiline rows={12}
            label="Paste your questions here"
            placeholder={BULK_PLACEHOLDER}
            value={bulkText}
            onChange={e => { setBulkText(e.target.value); setBulkPreview([]); }}
            sx={{ mb: 2, fontFamily: 'monospace' }}
            inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
          />

          {bulkPreview.length > 0 && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ {bulkPreview.length} questions parsed successfully — ready to import
              </Alert>
              <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                {bulkPreview.map((q, i) => (
                  <Box key={i} sx={{ mb: 2, pb: 2, borderBottom: i < bulkPreview.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <Chip label={`Q${i + 1}`} size="small" color="primary" />
                      <Chip label={q.questionType} size="small" variant="outlined" />
                      <Chip label={`${q.points} pt`} size="small" color="success" />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{q.questionText}</Typography>
                    {q.options.map((opt, oi) => (
                      <Typography key={oi} variant="caption" sx={{ display: 'block', ml: 2, color: opt.isCorrect ? 'success.main' : 'text.secondary' }}>
                        {String.fromCharCode(65 + oi)}. {opt.text} {opt.isCorrect ? '✓' : ''}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => { setShowBulkImport(false); setBulkPreview([]); setBulkText(''); }}>Cancel</Button>
          {bulkPreview.length === 0 ? (
            <Button variant="outlined" onClick={handleBulkPreview} disabled={!bulkText.trim()}>
              Preview ({bulkText.trim() ? '...' : '0'})
            </Button>
          ) : (
            <Button variant="contained" onClick={handleBulkConfirm}
              sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}>
              Import {bulkPreview.length} Questions
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Exam Preview</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>{examData.title}</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {examData.description}
          </Typography>
          
          {examData.questions.slice(0, 3).map((question, index) => (
            <Box key={question.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Question {index + 1} ({question.points} points)
              </Typography>
              <Typography variant="body1" paragraph>
                {question.questionText}
              </Typography>
              {question.questionType === 'multiple-choice' && (
                <Box sx={{ ml: 2 }}>
                  {question.options.map((option, optIndex) => (
                    <Typography key={optIndex} variant="body2" sx={{ mb: 0.5 }}>
                      {String.fromCharCode(65 + optIndex)}. {option.text}
                      {option.isCorrect && <Chip label="Correct" color="success" size="small" sx={{ ml: 1 }} />}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ))}
          
          {examData.questions.length > 3 && (
            <Typography variant="body2" color="text.secondary">
              ... and {examData.questions.length - 3} more questions
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateExam;