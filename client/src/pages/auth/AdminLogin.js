import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, InputAdornment,
  IconButton, Alert, Paper, Grid,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, AdminPanelSettings, ArrowBack, Security, BarChart, People } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(formData.email, formData.password);
    if (result.success) navigate('/dashboard');
  };

  const features = [
    { icon: <Security />, title: 'AI Proctoring', desc: 'Real-time violation detection' },
    { icon: <BarChart />, title: 'Analytics', desc: 'Detailed exam reports' },
    { icon: <People />, title: 'Student Mgmt', desc: 'Monitor all students' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0a00 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute', top: '-15%', left: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-15%', right: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      <Grid container sx={{ position: 'relative', zIndex: 1 }}>
        {/* Left - Form */}
        <Grid item xs={12} md={7} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 },
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%', maxWidth: 440 }}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, '&:hover': { color: 'white', bgcolor: 'transparent' } }}
            >
              Back
            </Button>

            <Paper sx={{
              p: { xs: 3, md: 5 }, borderRadius: '24px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(245,158,11,0.15)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{
                  width: 52, height: 52, borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(245,158,11,0.4)', mb: 3,
                }}>
                  <AdminPanelSettings sx={{ color: 'white', fontSize: 26 }} />
                </Box>
                <Typography variant="h5" fontWeight={700} color="white" mb={0.5}>
                  Admin Sign In
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                  Access the admin control panel
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth name="email" label="Admin Email" type="email"
                  value={formData.email} onChange={handleChange}
                  error={!!formErrors.email} helperText={formErrors.email}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} /></InputAdornment> }}
                  sx={inputSx}
                  margin="normal"
                />
                <TextField
                  fullWidth name="password" label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange}
                  error={!!formErrors.password} helperText={formErrors.password}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                  margin="normal"
                />

                <Button
                  type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{
                    mt: 3, py: 1.6, fontSize: '1rem', fontWeight: 700,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 8px 25px rgba(245,158,11,0.4)',
                    borderRadius: '12px', color: '#1a0a00',
                    '&:hover': { background: 'linear-gradient(135deg, #d97706, #b45309)' },
                  }}
                >
                  {loading ? 'Signing in...' : 'Access Admin Panel'}
                </Button>

                <Box sx={{
                  mt: 3, p: 2, borderRadius: '12px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5, fontWeight: 600 }}>
                    Demo Credentials
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                    admin@demo.com / password123
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} md={5} sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          justifyContent: 'center', p: 8,
        }}>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Typography variant="h3" fontWeight={800} color="white" mb={2}>
              Admin<br />
              <Box component="span" sx={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Control Panel
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, lineHeight: 1.8 }}>
              Full control over exams, students, and AI proctoring analytics.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {features.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 2, p: 2,
                    borderRadius: '14px', background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.15)',
                  }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '10px',
                      background: 'rgba(245,158,11,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {React.cloneElement(f.icon, { sx: { color: '#fbbf24', fontSize: 20 } })}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color="white">{f.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px', color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(245,158,11,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#f59e0b' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#fbbf24' },
  '& .MuiFormHelperText-root': { color: '#f87171' },
};

export default AdminLogin;
