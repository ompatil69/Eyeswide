import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, LinearProgress, Chip, Paper, Grid, Avatar } from '@mui/material';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { Face, Visibility, VolumeUp, Security, TrendingDown, TrendingUp } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MetricBar = ({ label, value, color, icon }) => (
  <Box sx={{ mb: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        {React.cloneElement(icon, { sx: { fontSize: 14, color } })}
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
      </Box>
      <Typography variant="caption" fontWeight={800} sx={{ color }}>
        {Math.round(value)}%
      </Typography>
    </Box>
    <LinearProgress variant="determinate" value={value}
      sx={{
        height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.08)',
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
      }} />
  </Box>
);

const BehaviorAnalysis = ({ violations = [], isActive = true, examDuration = 0 }) => {
  const [scores, setScores] = useState({
    focus: 95, integrity: 100, compliance: 100, attention: 90, stability: 95,
  });
  const [riskLevel, setRiskLevel] = useState('low');
  const [overallScore, setOverallScore] = useState(96);
  const [trend, setTrend] = useState('stable');
  const prevViolationsRef = useRef(0);

  // Update scores based on violations
  useEffect(() => {
    if (!isActive) return;

    const count = violations.length;
    if (count === prevViolationsRef.current) return;
    prevViolationsRef.current = count;

    // Recalculate scores based on violation types
    const tabSwitches = violations.filter(v => v.type === 'tab-switch' || v.type === 'app-switch').length;
    const faceViolations = violations.filter(v => v.type === 'face-not-detected' || v.type === 'face-direction-change').length;
    const audioViolations = violations.filter(v => v.type === 'voice-detected' || v.type === 'high-audio-level').length;
    const highSeverity = violations.filter(v => v.severity === 'high').length;

    const newFocus = Math.max(20, 100 - faceViolations * 8 - tabSwitches * 5);
    const newIntegrity = Math.max(20, 100 - highSeverity * 15 - count * 3);
    const newCompliance = Math.max(20, 100 - tabSwitches * 10 - audioViolations * 8);
    const newAttention = Math.max(20, 100 - faceViolations * 10 - tabSwitches * 6);
    const newStability = Math.max(20, 100 - count * 4);

    const overall = Math.round((newFocus + newIntegrity + newCompliance + newAttention + newStability) / 5);

    setScores({ focus: newFocus, integrity: newIntegrity, compliance: newCompliance, attention: newAttention, stability: newStability });
    setOverallScore(overall);
    setTrend(overall < overallScore ? 'down' : 'stable');

    if (overall >= 80) setRiskLevel('low');
    else if (overall >= 60) setRiskLevel('medium');
    else setRiskLevel('high');
  }, [violations, isActive]);

  // Simulate small fluctuations when active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setScores(prev => ({
        focus: Math.min(100, Math.max(20, prev.focus + (Math.random() - 0.5) * 3)),
        integrity: prev.integrity,
        compliance: prev.compliance,
        attention: Math.min(100, Math.max(20, prev.attention + (Math.random() - 0.5) * 4)),
        stability: Math.min(100, Math.max(20, prev.stability + (Math.random() - 0.5) * 2)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive]);

  const radarData = [
    { subject: 'Focus', value: Math.round(scores.focus) },
    { subject: 'Integrity', value: Math.round(scores.integrity) },
    { subject: 'Compliance', value: Math.round(scores.compliance) },
    { subject: 'Attention', value: Math.round(scores.attention) },
    { subject: 'Stability', value: Math.round(scores.stability) },
  ];

  const riskColor = riskLevel === 'low' ? '#10b981' : riskLevel === 'medium' ? '#f59e0b' : '#ef4444';
  const riskBg = riskLevel === 'low' ? 'rgba(16,185,129,0.1)' : riskLevel === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security sx={{ color: '#6366f1', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={700}>Behavior Analysis</Typography>
        </Box>
        <Chip
          label={`${riskLevel.toUpperCase()} RISK`}
          size="small"
          sx={{ bgcolor: riskBg, color: riskColor, fontWeight: 700, fontSize: '0.7rem' }}
        />
      </Box>

      {/* Overall Score */}
      <AnimatePresence mode="wait">
        <motion.div
          key={overallScore}
          initial={{ scale: 0.95, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{
            p: 2, borderRadius: 2, mb: 2, textAlign: 'center',
            background: `linear-gradient(135deg, ${riskColor}22, ${riskColor}11)`,
            border: `1px solid ${riskColor}44`,
          }}>
            <Typography variant="h3" fontWeight={800} sx={{ color: riskColor, lineHeight: 1 }}>
              {overallScore}
            </Typography>
            <Typography variant="caption" color="text.secondary">Integrity Score / 100</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              {trend === 'down'
                ? <TrendingDown sx={{ fontSize: 14, color: '#ef4444' }} />
                : <TrendingUp sx={{ fontSize: 14, color: '#10b981' }} />}
              <Typography variant="caption" sx={{ color: trend === 'down' ? '#ef4444' : '#10b981' }}>
                {trend === 'down' ? 'Declining' : 'Stable'}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <RadarChart data={radarData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <PolarGrid stroke="rgba(0,0,0,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke={riskColor} fill={riskColor} fillOpacity={0.2} strokeWidth={2} />
          <Tooltip formatter={(v) => [`${v}%`]} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Metric Bars */}
      <Box sx={{ mt: 1 }}>
        <MetricBar label="Focus" value={scores.focus} color="#6366f1" icon={<Visibility />} />
        <MetricBar label="Integrity" value={scores.integrity} color="#10b981" icon={<Security />} />
        <MetricBar label="Compliance" value={scores.compliance} color="#3b82f6" icon={<Face />} />
        <MetricBar label="Attention" value={scores.attention} color="#f59e0b" icon={<Visibility />} />
        <MetricBar label="Stability" value={scores.stability} color="#8b5cf6" icon={<VolumeUp />} />
      </Box>

      {/* Violation Count */}
      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Total violations: <b style={{ color: violations.length > 3 ? '#ef4444' : '#10b981' }}>{violations.length}</b>
          {' '}• High severity: <b style={{ color: '#ef4444' }}>{violations.filter(v => v.severity === 'high').length}</b>
        </Typography>
      </Box>
    </Paper>
  );
};

export default BehaviorAnalysis;
