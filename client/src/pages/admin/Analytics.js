import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  Avatar, Chip, Tab, Tabs, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  TrendingUp, Warning, People, Assignment,
  Security, CheckCircle, Timeline, BarChartOutlined,
} from '@mui/icons-material';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

// --- Mock Data ---
const violationTrend = [
  { day: 'Mon', tabSwitch: 12, faceAway: 8, audio: 5, fullscreen: 3 },
  { day: 'Tue', tabSwitch: 9, faceAway: 11, audio: 7, fullscreen: 2 },
  { day: 'Wed', tabSwitch: 15, faceAway: 6, audio: 4, fullscreen: 5 },
  { day: 'Thu', tabSwitch: 7, faceAway: 14, audio: 9, fullscreen: 1 },
  { day: 'Fri', tabSwitch: 18, faceAway: 10, audio: 6, fullscreen: 4 },
  { day: 'Sat', tabSwitch: 5, faceAway: 4, audio: 2, fullscreen: 0 },
  { day: 'Sun', tabSwitch: 3, faceAway: 2, audio: 1, fullscreen: 0 },
];

const examScores = [
  { exam: 'Math', avg: 78, highest: 98, lowest: 42, passed: 85 },
  { exam: 'Physics', avg: 72, highest: 95, lowest: 38, passed: 78 },
  { exam: 'Chemistry', avg: 81, highest: 100, lowest: 55, passed: 90 },
  { exam: 'CS', avg: 88, highest: 100, lowest: 60, passed: 95 },
  { exam: 'Biology', avg: 75, highest: 97, lowest: 45, passed: 82 },
];

const violationTypes = [
  { name: 'Tab Switch', value: 35, color: '#6366f1' },
  { name: 'Face Away', value: 28, color: '#f59e0b' },
  { name: 'Audio', value: 18, color: '#ef4444' },
  { name: 'Fullscreen Exit', value: 12, color: '#10b981' },
  { name: 'Multiple Faces', value: 7, color: '#3b82f6' },
];

const studentPerformance = [
  { month: 'Jan', avgScore: 72, violations: 45, examsCompleted: 120 },
  { month: 'Feb', avgScore: 75, violations: 38, examsCompleted: 145 },
  { month: 'Mar', avgScore: 78, violations: 32, examsCompleted: 160 },
  { month: 'Apr', avgScore: 74, violations: 41, examsCompleted: 138 },
  { month: 'May', avgScore: 82, violations: 28, examsCompleted: 175 },
  { month: 'Jun', avgScore: 85, violations: 22, examsCompleted: 190 },
];

const behaviorRadar = [
  { subject: 'Focus', A: 85, fullMark: 100 },
  { subject: 'Integrity', A: 78, fullMark: 100 },
  { subject: 'Compliance', A: 92, fullMark: 100 },
  { subject: 'Attention', A: 70, fullMark: 100 },
  { subject: 'Stability', A: 88, fullMark: 100 },
  { subject: 'Consistency', A: 76, fullMark: 100 },
];

const topViolators = [
  { name: 'Student A', violations: 12, risk: 'high', score: 58 },
  { name: 'Student B', violations: 9, risk: 'high', score: 64 },
  { name: 'Student C', violations: 7, risk: 'medium', score: 71 },
  { name: 'Student D', violations: 5, risk: 'medium', score: 76 },
  { name: 'Student E', violations: 3, risk: 'low', score: 83 },
];

const StatCard = ({ title, value, sub, icon, gradient, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
    <Card sx={{ background: gradient, color: 'white', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>{value}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>{title}</Typography>
            {sub && <Typography variant="caption" sx={{ opacity: 0.65 }}>{sub}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const SectionTitle = ({ children }) => (
  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'text.primary' }}>{children}</Typography>
);

const Analytics = () => {
  const [tab, setTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week');

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Analytics Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Real-time insights into exam performance and proctoring data</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} label="Time Range" onChange={e => setTimeRange(e.target.value)}>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </motion.div>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Violations" value="247" sub="-12% from last week" icon={<Warning />}
            gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" delay={0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Exams Completed" value="1,284" sub="+8% from last week" icon={<Assignment />}
            gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" delay={0.1} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg Score" value="79.4%" sub="+3.2% improvement" icon={<TrendingUp />}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" delay={0.2} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Students" value="342" sub="Currently monitored" icon={<People />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" delay={0.3} />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Violations" icon={<Warning sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label="Performance" icon={<TrendingUp sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label="Behavior" icon={<Security sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label="Overview" icon={<BarChartOutlined sx={{ fontSize: 16 }} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab 0: Violations */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>Violation Trends (Daily)</SectionTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={violationTrend}>
                    <defs>
                      {['tabSwitch', 'faceAway', 'audio', 'fullscreen'].map((key, i) => (
                        <linearGradient key={key} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="tabSwitch" name="Tab Switch" stroke={COLORS[0]} fill={`url(#grad0)`} strokeWidth={2} />
                    <Area type="monotone" dataKey="faceAway" name="Face Away" stroke={COLORS[2]} fill={`url(#grad1)`} strokeWidth={2} />
                    <Area type="monotone" dataKey="audio" name="Audio" stroke={COLORS[3]} fill={`url(#grad2)`} strokeWidth={2} />
                    <Area type="monotone" dataKey="fullscreen" name="Fullscreen" stroke={COLORS[1]} fill={`url(#grad3)`} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={4}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>Violation Breakdown</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={violationTypes} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {violationTypes.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 1 }}>
                  {violationTypes.map((v) => (
                    <Box key={v.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: v.color }} />
                        <Typography variant="caption">{v.name}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={700}>{v.value}%</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Top Violators */}
          <Grid item xs={12}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>High-Risk Students</SectionTitle>
                <Grid container spacing={2}>
                  {topViolators.map((s, i) => (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
                      <Box sx={{
                        p: 2, borderRadius: 2, border: '1px solid',
                        borderColor: s.risk === 'high' ? 'error.light' : s.risk === 'medium' ? 'warning.light' : 'success.light',
                        bgcolor: s.risk === 'high' ? 'rgba(239,68,68,0.05)' : s.risk === 'medium' ? 'rgba(245,158,11,0.05)' : 'rgba(16,185,129,0.05)',
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight={700}>{s.name}</Typography>
                          <Chip label={s.risk} size="small"
                            color={s.risk === 'high' ? 'error' : s.risk === 'medium' ? 'warning' : 'success'} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">Violations: <b>{s.violations}</b></Typography><br />
                        <Typography variant="caption" color="text.secondary">Score: <b>{s.score}%</b></Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Performance */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>Exam Score Distribution</SectionTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={examScores} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="exam" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                    <Legend />
                    <Bar dataKey="avg" name="Average" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="highest" name="Highest" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="lowest" name="Lowest" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={4}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>Pass Rate by Subject</SectionTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={examScores} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="exam" type="category" tick={{ fontSize: 12 }} width={60} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Pass Rate']} />
                    <Bar dataKey="passed" name="Pass Rate %" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>Monthly Performance Trend</SectionTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={studentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgScore" name="Avg Score %" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                    <Line yAxisId="right" type="monotone" dataKey="violations" name="Violations" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} strokeDasharray="5 5" />
                    <Line yAxisId="right" type="monotone" dataKey="examsCompleted" name="Exams Done" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Behavior */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>Behavioral Integrity Score</SectionTitle>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={behaviorRadar}>
                    <PolarGrid stroke="rgba(0,0,0,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Students" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(99,102,241,0.06)', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={700} color="primary">Overall Integrity Score: 81.5/100</Typography>
                  <Typography variant="caption" color="text.secondary">Based on 1,284 exam sessions this month</Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={7}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>Attention & Focus Metrics</SectionTitle>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={studentPerformance}>
                    <defs>
                      <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="avgScore" name="Focus Score %" stroke="#6366f1" fill="url(#focusGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="examsCompleted" name="Compliance Rate" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Overview */}
      {tab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>Weekly Violation Summary</SectionTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={violationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                    <Legend />
                    <Bar dataKey="tabSwitch" name="Tab Switch" stackId="a" fill="#6366f1" />
                    <Bar dataKey="faceAway" name="Face Away" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="audio" name="Audio" stackId="a" fill="#ef4444" />
                    <Bar dataKey="fullscreen" name="Fullscreen" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={6}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Paper sx={{ p: 3 }}>
                <SectionTitle>System Health Overview</SectionTitle>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { label: 'AI Detection Accuracy', value: '94.2%', color: '#10b981', icon: <Security /> },
                    { label: 'False Positive Rate', value: '2.1%', color: '#6366f1', icon: <CheckCircle /> },
                    { label: 'Avg Response Time', value: '142ms', color: '#f59e0b', icon: <Timeline /> },
                    { label: 'System Uptime', value: '99.8%', color: '#3b82f6', icon: <TrendingUp /> },
                  ].map((item) => (
                    <Grid item xs={6} key={item.label}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {React.cloneElement(item.icon, { sx: { fontSize: 18, color: item.color } })}
                          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        </Box>
                        <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;
