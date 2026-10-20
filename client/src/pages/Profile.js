import React, { useState, useRef } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Camera,
  Save,
  Edit,
  CheckCircle,
  Warning,
  History,
  School,
  Email,
  Phone,
  Lock,
  Face,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import aiService from '../services/aiService';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showFaceEnrollment, setShowFaceEnrollment] = useState(false);
  const [faceEnrollmentStep, setFaceEnrollmentStep] = useState(0);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    institution: user?.institution || '',
    studentId: user?.studentId || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    examReminders: true,
    violationAlerts: false,
    systemUpdates: true,
  });

  const [faceEnrollmentData, setFaceEnrollmentData] = useState({
    images: [],
    progress: 0,
    isComplete: false,
  });

  // Mock exam history
  const examHistory = [
    {
      id: 1,
      title: 'Mathematics Placement Test',
      date: '2024-01-20',
      score: 85,
      status: 'completed',
      violations: 1,
    },
    {
      id: 2,
      title: 'Physics Assessment',
      date: '2024-01-15',
      score: 92,
      status: 'completed',
      violations: 0,
    },
    {
      id: 3,
      title: 'Chemistry Quiz',
      date: '2024-01-10',
      score: 78,
      status: 'completed',
      violations: 2,
    },
  ];

  const handleProfileUpdate = async () => {
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setShowPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const startFaceEnrollment = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowFaceEnrollment(true);
      setFaceEnrollmentStep(1);
    } catch (error) {
      toast.error('Camera access denied');
    }
  };

  const captureFaceImage = async () => {
    if (!videoRef.current || !stream) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    // Use AI service to detect face
    const detection = await aiService.detectFaces(videoRef.current);
    
    if (detection.faceDetected && detection.faceCount === 1) {
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      setFaceEnrollmentData(prev => ({
        ...prev,
        images: [...prev.images, {
          data: imageData,
          timestamp: new Date(),
          confidence: detection.confidence
        }],
        progress: Math.min((prev.images.length + 1) * 20, 100)
      }));

      if (faceEnrollmentData.images.length >= 4) {
        completeFaceEnrollment();
      } else {
        toast.success(`Face captured! ${5 - faceEnrollmentData.images.length} more needed.`);
      }
    } else if (detection.faceCount > 1) {
      toast.error('Multiple faces detected. Please ensure only you are visible.');
    } else {
      toast.error('No face detected. Please position yourself properly.');
    }
  };

  const completeFaceEnrollment = () => {
    setFaceEnrollmentData(prev => ({
      ...prev,
      isComplete: true,
      progress: 100
    }));
    
    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    toast.success('Face enrollment completed successfully!');
    setTimeout(() => {
      setShowFaceEnrollment(false);
      setFaceEnrollmentStep(0);
    }, 2000);
  };

  const cancelFaceEnrollment = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowFaceEnrollment(false);
    setFaceEnrollmentStep(0);
    setFaceEnrollmentData({ images: [], progress: 0, isComplete: false });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <Person /> },
    { id: 'security', label: 'Security', icon: <Security /> },
    { id: 'preferences', label: 'Preferences', icon: <Notifications /> },
    { id: 'history', label: 'Exam History', icon: <History /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Personal Information</Typography>
                <Button
                  startIcon={isEditing ? <Save /> : <Edit />}
                  onClick={isEditing ? handleProfileUpdate : () => setIsEditing(true)}
                  variant={isEditing ? 'contained' : 'outlined'}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    disabled
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={profileData.studentId}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Institution"
                    value={profileData.institution}
                    onChange={(e) => setProfileData(prev => ({ ...prev, institution: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 'security':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Password Security
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Keep your account secure with a strong password.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPasswordDialog(true)}
                    fullWidth
                  >
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Face sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Face Recognition
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Enroll your face for enhanced security during exams.
                  </Typography>
                  
                  {faceEnrollmentData.isComplete ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Face enrollment completed! Your face is registered for proctoring.
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Face enrollment required for AI proctoring features.
                      </Typography>
                    </Alert>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<Camera />}
                    onClick={startFaceEnrollment}
                    fullWidth
                    disabled={faceEnrollmentData.isComplete}
                  >
                    {faceEnrollmentData.isComplete ? 'Face Enrolled' : 'Enroll Face'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 'preferences':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive important updates via email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      />
                    }
                    label=""
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Exam Reminders"
                    secondary="Get notified about upcoming exams"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.examReminders}
                        onChange={(e) => setPreferences(prev => ({ ...prev, examReminders: e.target.checked }))}
                      />
                    }
                    label=""
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Warning />
                  </ListItemIcon>
                  <ListItemText
                    primary="Violation Alerts"
                    secondary="Receive alerts about proctoring violations"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.violationAlerts}
                        onChange={(e) => setPreferences(prev => ({ ...prev, violationAlerts: e.target.checked }))}
                      />
                    }
                    label=""
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="System Updates"
                    secondary="Get notified about system updates and new features"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.systemUpdates}
                        onChange={(e) => setPreferences(prev => ({ ...prev, systemUpdates: e.target.checked }))}
                      />
                    }
                    label=""
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" startIcon={<Save />}>
                  Save Preferences
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 'history':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Exam History</Typography>
              
              {examHistory.map((exam) => (
                <Box key={exam.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {exam.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exam.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={`${exam.score}%`}
                        color={exam.score >= 80 ? 'success' : exam.score >= 60 ? 'warning' : 'error'}
                        size="small"
                      />
                      <Chip
                        label={exam.status}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Violations: {exam.violations}
                    </Typography>
                    {exam.violations > 0 && (
                      <Chip
                        icon={<Warning />}
                        label={`${exam.violations} violations`}
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mr: 3,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Chip
              label={user?.role?.toUpperCase()}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Settings</Typography>
            <List component="nav">
              {tabs.map((tab) => (
                <ListItem
                  key={tab.id}
                  button
                  selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === tab.id ? 'inherit' : 'text.secondary' }}>
                    {tab.icon}
                  </ListItemIcon>
                  <ListItemText primary={tab.label} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={9}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePasswordChange}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Face Enrollment Dialog */}
      <Dialog open={showFaceEnrollment} onClose={cancelFaceEnrollment} maxWidth="md" fullWidth>
        <DialogTitle>Face Enrollment</DialogTitle>
        <DialogContent>
          {faceEnrollmentStep === 1 && !faceEnrollmentData.isComplete && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Position your face in the camera
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                We need to capture 5 clear images of your face for enrollment.
              </Typography>
              
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  style={{
                    width: 400,
                    height: 300,
                    borderRadius: 8,
                    backgroundColor: '#000',
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Progress: {faceEnrollmentData.images.length}/5 images captured
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={faceEnrollmentData.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Button
                variant="contained"
                onClick={captureFaceImage}
                startIcon={<Camera />}
                size="large"
              >
                Capture Face
              </Button>
            </Box>
          )}

          {faceEnrollmentData.isComplete && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Face Enrollment Complete!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your face has been successfully enrolled for AI proctoring.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelFaceEnrollment}>
            {faceEnrollmentData.isComplete ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;