import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, LinearProgress, Chip, Alert } from '@mui/material';
import { Mic, MicOff, VolumeUp, Warning } from '@mui/icons-material';

const AudioMonitor = ({ examId, onViolation, isActive = true }) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [violations, setViolations] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [microphone, setMicrophone] = useState(null);
  
  const animationRef = useRef();
  const violationTimeoutRef = useRef();
  const lastViolationRef = useRef(0);

  // Initialize audio monitoring
  useEffect(() => {
    if (!isActive) return;

    const initializeAudio = async () => {
      try {
        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });

        // Create audio context
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyserNode = audioCtx.createAnalyser();
        const microphoneNode = audioCtx.createMediaStreamSource(stream);

        // Configure analyser
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.8;

        // Connect nodes
        microphoneNode.connect(analyserNode);

        setAudioContext(audioCtx);
        setAnalyser(analyserNode);
        setMicrophone(stream);
        setIsMonitoring(true);

        // Start monitoring
        startAudioAnalysis(analyserNode);

      } catch (error) {
        console.error('Audio initialization error:', error);
        
        const violation = {
          type: 'audio-access-denied',
          severity: 'high',
          message: 'Microphone access denied or unavailable',
          timestamp: new Date()
        };

        setViolations(prev => [...prev.slice(-4), violation]);
        if (onViolation) onViolation(violation);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup
      if (microphone) {
        microphone.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }
    };
  }, [isActive, onViolation]);

  // Start audio analysis
  const startAudioAnalysis = (analyserNode) => {
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!isActive) return;

      analyserNode.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1

      setAudioLevel(normalizedLevel);

      // Check for violations
      checkAudioViolations(normalizedLevel, dataArray);

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  // Check for audio-based violations
  const checkAudioViolations = (level, frequencyData) => {
    const now = Date.now();
    
    // Prevent spam violations (minimum 8 seconds between similar violations - balanced)
    if (now - lastViolationRef.current < 8000) return;

    // Check for suspicious audio patterns
    const violations = [];

    // High volume detection (possible conversation) - moderate threshold
    if (level > 0.75) { // Slightly more sensitive than 0.85
      violations.push({
        type: 'high-audio-level',
        severity: 'medium', // Increased from 'low'
        message: 'High audio level detected - possible conversation',
        timestamp: new Date(),
        audioLevel: Math.round(level * 100)
      });
    }

    // Voice activity detection (simplified) - moderate thresholds
    const voiceFrequencies = frequencyData.slice(10, 50); // Typical voice range
    const voiceActivity = voiceFrequencies.reduce((sum, val) => sum + val, 0) / voiceFrequencies.length;
    
    if (voiceActivity > 90 && level > 0.4) { // Slightly more sensitive
      violations.push({
        type: 'voice-detected',
        severity: 'high', // Increased back to 'high'
        message: 'Voice activity detected - possible communication',
        timestamp: new Date(),
        confidence: Math.round((voiceActivity / 128) * 100)
      });
    }

    // Multiple speaker detection (frequency analysis) - moderate thresholds
    const lowFreq = frequencyData.slice(0, 20).reduce((sum, val) => sum + val, 0) / 20;
    const midFreq = frequencyData.slice(20, 60).reduce((sum, val) => sum + val, 0) / 40;
    const highFreq = frequencyData.slice(60, 100).reduce((sum, val) => sum + val, 0) / 40;

    // Check for multiple voice patterns - balanced thresholds
    if (lowFreq > 70 && midFreq > 70 && highFreq > 50 && level > 0.5) { // Slightly more sensitive
      violations.push({
        type: 'multiple-speakers',
        severity: 'high', // Increased back to 'high'
        message: 'Multiple speakers detected',
        timestamp: new Date(),
        confidence: Math.round(((lowFreq + midFreq + highFreq) / 3 / 128) * 100)
      });
    }

    // Background noise detection - moderate threshold
    const backgroundNoise = frequencyData.slice(0, 10).reduce((sum, val) => sum + val, 0) / 10;
    if (backgroundNoise > 60 && level > 0.3) { // Slightly more sensitive
      violations.push({
        type: 'background-noise',
        severity: 'low',
        message: 'Excessive background noise detected',
        timestamp: new Date(),
        noiseLevel: Math.round((backgroundNoise / 128) * 100)
      });
    }

    // Process violations - report medium and high severity
    const significantViolations = violations.filter(v => v.severity === 'medium' || v.severity === 'high');
    if (significantViolations.length > 0) {
      lastViolationRef.current = now;
      
      significantViolations.forEach(violation => {
        setViolations(prev => [...prev.slice(-4), violation]);
        if (onViolation) onViolation(violation);
      });
    }
  };

  const getAudioLevelColor = () => {
    if (audioLevel < 0.3) return 'success';
    if (audioLevel < 0.7) return 'warning';
    return 'error';
  };

  const getAudioLevelText = () => {
    if (audioLevel < 0.1) return 'Silent';
    if (audioLevel < 0.3) return 'Low';
    if (audioLevel < 0.7) return 'Medium';
    return 'High';
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {isMonitoring ? <Mic color="success" /> : <MicOff color="error" />}
        <Typography variant="h6">Audio Monitor</Typography>
        <Chip
          label={isMonitoring ? 'Active' : 'Inactive'}
          color={isMonitoring ? 'success' : 'error'}
          size="small"
        />
      </Box>

      {/* Audio Level Display */}
      {isMonitoring && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <VolumeUp />
            <Typography variant="body2" sx={{ minWidth: 60 }}>
              {getAudioLevelText()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(audioLevel * 100)}%
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={audioLevel * 100}
            color={getAudioLevelColor()}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              }
            }}
          />
        </Box>
      )}

      {/* Recent Violations */}
      {violations.slice(-2).map((violation, index) => (
        <Alert
          key={`${violation.timestamp}-${index}`}
          severity={violation.severity === 'high' ? 'error' : violation.severity === 'medium' ? 'warning' : 'info'}
          sx={{ mb: 1, fontSize: '0.8rem' }}
          icon={<Warning />}
        >
          <Typography variant="body2" fontWeight={500}>
            {violation.message}
          </Typography>
          {violation.confidence && (
            <Typography variant="caption" color="text.secondary">
              Confidence: {violation.confidence}%
            </Typography>
          )}
          {violation.audioLevel && (
            <Typography variant="caption" color="text.secondary">
              Level: {violation.audioLevel}%
            </Typography>
          )}
        </Alert>
      ))}

      {/* Status Information */}
      <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Audio monitoring detects conversations, multiple speakers, and suspicious audio patterns.
          {violations.length > 0 && ` Total violations: ${violations.length}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default AudioMonitor;