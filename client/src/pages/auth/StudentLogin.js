import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, InputAdornment,
  IconButton, Alert, Paper, Grid,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, School, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const StudentLogin = () => {
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

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <Box sx={{
        position: 'absolute', top: '-15%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      <Grid container sx={{ position: 'relative', zIndex: 1 }}>
        {/* Left Panel */}
        <Grid item xs={12} md={5} sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          justifyContent: 'center', p: 8,
        }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(99,102,241,0.5)', mb: 4,
            }}>
              <School sx={{ color: 'white', fontSize: 36 }} />
            </Box>
            <Typography variant="h3" fontWeight={800} color="white" mb={2}>
              Student<br />Portal
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 320 }}>
              Access your exams, track your performance, and view results — all in one place.
            </Typography>

            {/* Stats */}
            <Box sx={{ mt: 5, display: 'flex', gap: 3 }}>
              {[['500+', 'Students'], ['50+', 'Exams'], ['99%', 'Uptime']].map(([val, label]) => (
                <Box key={label}>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#818cf8' }}>{val}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Grid>

        {/* Right - Form */}
        <Grid item xs={12} md={7} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 },
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} color="white" mb={0.5}>
                  Sign in as Student
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                  Enter your credentials to access your exams
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth name="email" label="Email Address" type="email"
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
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 8px 25px rgba(99,102,241,0.5)',
                    borderRadius: '12px',
                    '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #4338ca)' },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                {/* Demo credentials */}
                <Box sx={{
                  mt: 3, p: 2, borderRadius: '12px',
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5, fontWeight: 600 }}>
                    Demo Credentials
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                    student@demo.com / password123
                  </Typography>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    New here?{' '}
                    <Box component="span" onClick={() => navigate('/register')}
                      sx={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                      Create account
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
  '& .MuiFormHelperText-root': { color: '#f87171' },
};

export default StudentLogin;
