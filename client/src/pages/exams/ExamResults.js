import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  Avatar, Chip, Button, LinearProgress, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent,
} from '@mui/material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  CheckCircle, Warning, ArrowBack, Download, Share,
  Timer, Security, TrendingUp, Face, VolumeUp, Tab,
  Fullscreen, EmojiEvents, Cancel,
} from '@mui/icons-material';

// Mock result data
const mockResult = {
  examTitle: 'Mathematics Placement Test',
  subject: 'Mathematics',
  date: 'April 9, 2026',
  duration: '58 minutes',
  totalQuestions: 25,
  answered: 23,
  correct: 19,
  score: 76,
  maxScore: 100,
  passed: true,
  rank: 12,
  totalStudents: 45,
  percentile: 73,
  grade: 'B+',
  violations: [
    { type: 'Tab Switch', time: '00:12:34', severity: 'medium', desc: 'Switched to another tab for 4 seconds' },
    { type: 'Face Away', time: '00:28:11', severity: 'low', desc: 'Looking left for 2.5 seconds' },
    { type: 'Audio Detected', time: '00:41:05', severity: 'medium', desc: 'Voice activity detected' },
  ],
  attentionTimeline: [
    { min: 0, focus: 95 }, { min: 5, focus: 88 }, { min: 10, focus: 92 },
    { min: 15, focus: 78 }, { min: 20, focus: 85 }, { min: 25, focus: 70 },
    { min: 30, focus: 88 }, { min: 35, focus: 91 }, { min: 40, focus: 65 },
    { min: 45, focus: 82 }, { min: 50, focus: 90 }, { min: 55, focus: 87 },
  ],
  questionBreakdown: [
    { topic: 'Algebra', total: 8, correct: 7, color: '#6366f1' },
    { topic: 'Calculus', total: 7, correct: 5, color: '#10b981' },
    { topic: 'Geometry', total: 5, correct: 4, color: '#f59e0b' },
    { topic: 'Statistics', total: 5, correct: 3, color: '#ef4444' },
  ],
  behaviorScore: {
    focus: 82,
    integrity: 91,
    compliance: 88,
    attention: 76,
  },
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const ScoreRing = ({ score, size = 120 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{score}</Typography>
        <Typography variant="caption" color="text.secondary">/ 100</Typography>
      </Box>
    </Box>
  );
};

const BehaviorBar = ({ label, value, color }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2" fontWeight={600}>{label}</Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color }}>{value}%</Typography>
    </Box>
    <LinearProgress variant="determinate" value={value}
      sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
  </Box>
);

const ExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const r = mockResult;

  const handleDownloadPDF = () => {
    // Build printable content
    const content = `
EYESWIDE - Exam Result Report
==============================
Exam: ${r.examTitle}
Date: ${r.date}
Duration: ${r.duration}

SCORE SUMMARY
Score: ${r.score}/100
Grade: ${r.grade}
Status: ${r.passed ? 'PASSED' : 'FAILED'}
Rank: ${r.rank} / ${r.totalStudents}
Percentile: ${r.percentile}th

QUESTION BREAKDOWN
Answered: ${r.answered}/${r.totalQuestions}
Correct: ${r.correct}/${r.answered}

VIOLATIONS (${r.violations.length} total)
${r.violations.map(v => `- [${v.time}] ${v.type} (${v.severity}): ${v.desc}`).join('\n')}

BEHAVIOR SCORES
Focus: ${r.behaviorScore.focus}%
Integrity: ${r.behaviorScore.integrity}%
Compliance: ${r.behaviorScore.compliance}%
Attention: ${r.behaviorScore.attention}%
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-result-${examId || 'report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/exams')} variant="outlined" size="small">
              Back
            </Button>
            <Box>
              <Typography variant="h5" fontWeight={800}>{r.examTitle}</Typography>
              <Typography variant="body2" color="text.secondary">{r.date} • {r.duration}</Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Download />} onClick={handleDownloadPDF}>
            Download Report
          </Button>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Score Card */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Chip
                label={r.passed ? 'PASSED' : 'FAILED'}
                color={r.passed ? 'success' : 'error'}
                icon={r.passed ? <CheckCircle /> : <Cancel />}
                sx={{ mb: 2, fontWeight: 700, fontSize: '0.85rem' }}
              />
              <ScoreRing score={r.score} size={140} />
              <Typography variant="h3" fontWeight={800} sx={{ mt: 2, mb: 0.5 }}>{r.grade}</Typography>
              <Typography variant="body2" color="text.secondary">Grade</Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={1}>
                {[
                  { label: 'Rank', value: `#${r.rank}` },
                  { label: 'Percentile', value: `${r.percentile}th` },
                  { label: 'Answered', value: `${r.answered}/${r.totalQuestions}` },
                  { label: 'Correct', value: `${r.correct}/${r.answered}` },
                ].map(item => (
                  <Grid item xs={6} key={item.label}>
                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="h6" fontWeight={800}>{item.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        </Grid>

        {/* Attention Timeline */}
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Attention Timeline</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Your focus level throughout the exam (drops indicate violations or distractions)
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={r.attentionTimeline}>
                  <defs>
                    <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="min" tickFormatter={v => `${v}m`} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Focus']} labelFormatter={v => `${v} min`} />
                  <Area type="monotone" dataKey="focus" stroke="#6366f1" fill="url(#focusGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>

              {/* Behavior Scores */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Behavior Analysis</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <BehaviorBar label="Focus" value={r.behaviorScore.focus} color="#6366f1" />
                  <BehaviorBar label="Integrity" value={r.behaviorScore.integrity} color="#10b981" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <BehaviorBar label="Compliance" value={r.behaviorScore.compliance} color="#3b82f6" />
                  <BehaviorBar label="Attention" value={r.behaviorScore.attention} color="#f59e0b" />
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>

        {/* Topic Breakdown */}
        <Grid item xs={12} md={5}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Topic Breakdown</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={r.questionBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" name="Total" fill="rgba(99,102,241,0.2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="correct" name="Correct" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {r.questionBreakdown.map(t => (
                  <Box key={t.topic} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.color }} />
                      <Typography variant="body2">{t.topic}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>
                      {t.correct}/{t.total} ({Math.round(t.correct / t.total * 100)}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Violation Timeline */}
        <Grid item xs={12} md={7}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Violation Timeline</Typography>
                <Chip label={`${r.violations.length} violations`}
                  color={r.violations.length === 0 ? 'success' : r.violations.length < 3 ? 'warning' : 'error'}
                  size="small" />
              </Box>

              {r.violations.length === 0 ? (
                <Alert severity="success" icon={<CheckCircle />}>
                  No violations detected during this exam!
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {r.violations.map((v, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Typography variant="caption" fontFamily="monospace" fontWeight={700}>
                              {v.time}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {v.type === 'Tab Switch' ? <Tab sx={{ fontSize: 14 }} /> :
                               v.type === 'Face Away' ? <Face sx={{ fontSize: 14 }} /> :
                               v.type === 'Audio Detected' ? <VolumeUp sx={{ fontSize: 14 }} /> :
                               <Fullscreen sx={{ fontSize: 14 }} />}
                              <Typography variant="caption">{v.type}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={v.severity} size="small"
                              color={v.severity === 'high' ? 'error' : v.severity === 'medium' ? 'warning' : 'default'} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">{v.desc}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {r.violations.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }} icon={<Security />}>
                  <Typography variant="caption">
                    Violations are reviewed by instructors. Minor violations typically don't affect your score.
                  </Typography>
                </Alert>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExamResults;
