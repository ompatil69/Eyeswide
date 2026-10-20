import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  Warning,
  CheckCircle,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import aiService from '../../services/aiService';

const VideoProctor = ({ examId, onViolation, isActive = true }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [violations, setViolations] = useState([]);
  const [detectionStatus, setDetectionStatus] = useState({
    faceDetected: false,
    faceCount: 0,
    gazeDirection: 'center',
    confidence: 0,
    emotions: [],
    objects: []
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [aiInitialized, setAiInitialized] = useState(false);

  // Initialize AI service
  useEffect(() => {
    const initAI = async () => {
      const initialized = await aiService.initialize();
      setAiInitialized(initialized);
      if (!initialized) {
        setError('AI service initialization failed. Using fallback detection.');
      }
    };
    
    initAI();
  }, []);

  // Initialize camera and microphone
  const initializeMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      
      // Initialize socket connection
      initializeSocket();
      
      // Start AI monitoring
      startAIMonitoring();

    } catch (err) {
      console.error('Media access error:', err);
      setError('Unable to access camera and microphone. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [examId]);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      socketRef.current.emit('join-exam', examId);
      
      socketRef.current.on('violation-alert', (data) => {
        console.log('Violation alert received:', data);
      });
    }
  }, [examId]);

  // Start AI monitoring
  const startAIMonitoring = useCallback(() => {
    if (!aiService.isReady() || !videoRef.current) return;

    aiService.startMonitoring(videoRef.current, null, {
      onFaceDetection: (result) => {
        setDetectionStatus(prev => ({
          ...prev,
          faceDetected: result.faceDetected,
          faceCount: result.faceCount,
          gazeDirection: result.gazeDirection,
          confidence: result.confidence,
          emotions: result.emotions
        }));

        // Check for violations
        checkFaceViolations(result);
      },
      
      onObjectDetection: (result) => {
        setDetectionStatus(prev => ({
          ...prev,
          objects: result.objects
        }));

        // Check for object violations
        checkObjectViolations(result);
      },
      
      onError: (error) => {
        console.error('AI monitoring error:', error);
      }
    });
  }, [examId]);

  // Track gaze direction changes
  const gazeDirectionRef = useRef('center');
  const gazeChangeTimeRef = useRef(null);
  const lastGazeViolationRef = useRef(0);

  // Check for face-related violations
  const checkFaceViolations = useCallback((detection) => {
    const newViolations = [];
    const now = Date.now();

    // Face not detected - trigger at moderate confidence
    if (!detection.faceDetected && detection.confidence < 0.2) {
      newViolations.push({
        type: 'face-not-detected',
        severity: 'medium',
        message: 'Face not visible - please stay in frame',
        timestamp: new Date(),
        confidence: 1 - detection.confidence
      });
    }

    // Multiple faces - moderate confidence
    if (detection.faceCount > 1 && detection.confidence > 0.85) {
      newViolations.push({
        type: 'multiple-faces',
        severity: 'high',
        message: `${detection.faceCount} faces detected in frame`,
        timestamp: new Date(),
        confidence: detection.confidence
      });
    }

    // Face direction - warn after 2 seconds, cooldown 5 seconds
    if (detection.faceDetected && detection.confidence > 0.65) {
      const currentDirection = detection.gazeDirection || 'center';
      
      if (currentDirection !== gazeDirectionRef.current) {
        if (currentDirection !== 'center') {
          gazeChangeTimeRef.current = now;
        }
        gazeDirectionRef.current = currentDirection;
      }
      
      if (currentDirection !== 'center' && gazeChangeTimeRef.current) {
        const timeAwayFromCenter = now - gazeChangeTimeRef.current;
        
        // Warn after 2 seconds, cooldown 5 seconds
        if (timeAwayFromCenter > 2000 && (now - lastGazeViolationRef.current) > 5000) {
          let severity = 'low';
          let message = `Looking ${currentDirection} - please face the screen`;
          
          if (timeAwayFromCenter > 6000) {
            severity = 'high';
            message = `Looking ${currentDirection} for too long (${Math.round(timeAwayFromCenter / 1000)}s)`;
          } else if (timeAwayFromCenter > 3500) {
            severity = 'medium';
            message = `Looking ${currentDirection} - please face the screen (${Math.round(timeAwayFromCenter / 1000)}s)`;
          }
          
          newViolations.push({
            type: 'face-direction-change',
            severity,
            message,
            timestamp: new Date(),
            confidence: detection.confidence,
            direction: currentDirection,
            duration: timeAwayFromCenter
          });
          
          lastGazeViolationRef.current = now;
        }
      } else if (currentDirection === 'center') {
        gazeChangeTimeRef.current = null;
      }
    }

    // Report medium + high + low gaze violations
    const significantViolations = newViolations.filter(v =>
      v.severity === 'medium' ||
      v.severity === 'high' ||
      (v.type === 'face-direction-change' && v.severity === 'low')
    );
    
    if (significantViolations.length > 0) {
      setViolations(prev => [...prev.slice(-4), ...significantViolations]);
      
      significantViolations.forEach(violation => {
        onViolation && onViolation(violation);
        
        // Send violation to server
        if (socketRef.current) {
          socketRef.current.emit('violation-detected', {
            examId,
            violation: violation.type,
            severity: violation.severity,
            description: violation.message,
            confidence: violation.confidence
          });
        }
      });
    }
  }, [examId, onViolation]);

  // Check for object-related violations
  const checkObjectViolations = useCallback((detection) => {
    if (detection.suspiciousObjects && detection.suspiciousObjects.length > 0) {
      const violations = detection.suspiciousObjects.map(obj => ({
        type: 'object-detected',
        severity: 'high',
        message: `Unauthorized object detected: ${obj.type}`,
        timestamp: new Date(),
        confidence: obj.confidence
      }));

      setViolations(prev => [...prev.slice(-4), ...violations]);
      
      violations.forEach(violation => {
        onViolation && onViolation(violation);
        
        if (socketRef.current) {
          socketRef.current.emit('violation-detected', {
            examId,
            violation: violation.type,
            severity: violation.severity,
            description: violation.message,
            confidence: violation.confidence
          });
        }
      });
    }
  }, [examId, onViolation]);

  // Toggle video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      aiService.stopMonitoring();
    };
  }, []);

  // Auto-initialize when component mounts
  useEffect(() => {
    if (isActive && aiInitialized) {
      initializeMedia();
    }
  }, [isActive, aiInitialized, initializeMedia]);

  const getStatusColor = (status) => {
    if (!isActive) return 'default';
    return status ? 'success' : 'error';
  };

  const getGazeColor = (direction) => {
    return direction === 'center' ? 'success' : 'warning';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'success';
    if (confidence > 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Main Video Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: isMinimized ? 0.3 : 1,
          x: isMinimized ? 200 : 0,
          y: isMinimized ? -100 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 2,
            background: 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)',
            color: 'white',
            borderRadius: 3,
            position: isMinimized ? 'fixed' : 'relative',
            top: isMinimized ? 20 : 'auto',
            right: isMinimized ? 20 : 'auto',
            zIndex: isMinimized ? 1000 : 'auto',
            minWidth: isMinimized ? 200 : 400,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility />
              AI Proctoring
              {aiInitialized && (
                <Chip 
                  label="AI Active" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={isMinimized ? "Expand" : "Minimize"}>
                <IconButton
                  size="small"
                  onClick={() => setIsMinimized(!isMinimized)}
                  sx={{ color: 'white' }}
                >
                  {isMinimized ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {!isMinimized && (
            <>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Video Feed */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: 240,
                    borderRadius: 8,
                    backgroundColor: '#000',
                    objectFit: 'cover'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                
                {/* Loading Overlay */}
                {isLoading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: 2,
                    }}
                  >
                    <CircularProgress color="primary" />
                  </Box>
                )}

                {/* Status Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Chip
                    icon={detectionStatus.faceDetected ? <CheckCircle /> : <Warning />}
                    label={`Face: ${detectionStatus.faceCount}`}
                    color={getStatusColor(detectionStatus.faceDetected)}
                    size="small"
                  />
                  <Chip
                    label={`Gaze: ${detectionStatus.gazeDirection}`}
                    color={getGazeColor(detectionStatus.gazeDirection)}
                    size="small"
                  />
                  {detectionStatus.confidence > 0 && (
                    <Chip
                      label={`${Math.round(detectionStatus.confidence * 100)}%`}
                      color={getConfidenceColor(detectionStatus.confidence)}
                      size="small"
                    />
                  )}
                </Box>

                {/* Objects Detected */}
                {detectionStatus.objects.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    {detectionStatus.objects.map((obj, index) => (
                      <Chip
                        key={index}
                        label={obj.type}
                        color="error"
                        size="small"
                        icon={<Warning />}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* AI Status */}
              <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                <Typography variant="caption" display="block">
                  AI Status: {aiInitialized ? '✅ Active' : '❌ Inactive'}
                </Typography>
                {detectionStatus.emotions.length > 0 && (
                  <Typography variant="caption" display="block">
                    Emotion: {detectionStatus.emotions[0].emotion} 
                    ({Math.round(detectionStatus.emotions[0].confidence * 100)}%)
                  </Typography>
                )}
              </Box>

              {/* Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Tooltip title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}>
                  <IconButton
                    onClick={toggleVideo}
                    sx={{
                      color: isVideoEnabled ? 'success.main' : 'error.main',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {isVideoEnabled ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}>
                  <IconButton
                    onClick={toggleAudio}
                    sx={{
                      color: isAudioEnabled ? 'success.main' : 'error.main',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {isAudioEnabled ? <Mic /> : <MicOff />}
                  </IconButton>
                </Tooltip>

                {!isVideoEnabled && (
                  <Button
                    variant="contained"
                    onClick={initializeMedia}
                    disabled={isLoading}
                    size="small"
                  >
                    {isLoading ? 'Connecting...' : 'Start Proctoring'}
                  </Button>
                )}
              </Box>

              {/* Recent Violations */}
              <AnimatePresence>
                {violations.slice(-2).map((violation, index) => (
                  <motion.div
                    key={`${violation.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      severity={violation.severity === 'high' ? 'error' : 'warning'}
                      sx={{ mb: 1, fontSize: '0.8rem' }}
                    >
                      {violation.message}
                      {violation.confidence && (
                        <Typography variant="caption" display="block">
                          Confidence: {Math.round(violation.confidence * 100)}%
                        </Typography>
                      )}
                    </Alert>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}

          {/* Minimized Status */}
          {isMinimized && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={detectionStatus.faceDetected ? <CheckCircle /> : <Warning />}
                label={detectionStatus.faceDetected ? "OK" : "Alert"}
                color={getStatusColor(detectionStatus.faceDetected)}
                size="small"
              />
              {violations.length > 0 && (
                <Chip
                  label={`${violations.length} violations`}
                  color="error"
                  size="small"
                />
              )}
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default VideoProctor;