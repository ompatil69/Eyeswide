import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { School, AdminPanelSettings, RemoveRedEye, Shield, Visibility, Speed } from '@mui/icons-material';

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '16px',
        background: 'rgba(99,102,241,0.15)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
      }}>
        {React.cloneElement(icon, { sx: { color: '#6366f1', fontSize: 28 } })}
      </Box>
      <Typography variant="subtitle1" fontWeight={700} color="white" gutterBottom>{title}</Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{desc}</Typography>
    </Box>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated background blobs */}
      <Box sx={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      <Grid container sx={{ position: 'relative', zIndex: 1 }}>
        {/* Left - Branding */}
        <Grid item xs={12} md={6} sx={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', p: { xs: 4, md: 8 },
        }}>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99,102,241,0.5)',
              }}>
                <RemoveRedEye sx={{ color: 'white', fontSize: 26 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'white', letterSpacing: 2 }}>
                EYESWIDE
              </Typography>
            </Box>

            <Typography variant="h2" fontWeight={800} sx={{
              color: 'white', lineHeight: 1.2, mb: 2,
              fontSize: { xs: '2.2rem', md: '3rem' },
            }}>
              AI-Powered<br />
              <Box component="span" sx={{
                background: 'linear-gradient(135deg, #6366f1, #f59e0b)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Exam Proctoring
              </Box>
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', mb: 5, lineHeight: 1.8, maxWidth: 480 }}>
              Secure, intelligent, and fair online examinations powered by advanced AI. 
              Real-time monitoring with face detection, gaze tracking, and behavioral analysis.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <FeatureCard icon={<Shield />} title="Secure" desc="End-to-end encrypted proctoring" delay={0.3} />
              <FeatureCard icon={<Visibility />} title="AI Vision" desc="Real-time face & gaze tracking" delay={0.4} />
              <FeatureCard icon={<Speed />} title="Real-time" desc="Instant violation detection" delay={0.5} />
            </Grid>
          </motion.div>
        </Grid>

        {/* Right - Login Selection */}
        <Grid item xs={12} md={6} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          p: { xs: 4, md: 8 },
        }}>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ width: '100%', maxWidth: 420 }}
          >
            <Paper sx={{
              p: 5, borderRadius: '24px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            }}>
              <Typography variant="h5" fontWeight={700} color="white" textAlign="center" mb={1}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mb: 4 }}>
                Choose your portal to continue
              </Typography>

              {/* Student Login Card */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Box
                  onClick={() => navigate('/login/student')}
                  sx={{
                    p: 3, borderRadius: '16px', mb: 3, cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))',
                    border: '1px solid rgba(99,102,241,0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(79,70,229,0.2))',
                      border: '1px solid rgba(99,102,241,0.7)',
                      boxShadow: '0 8px 30px rgba(99,102,241,0.3)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 52, height: 52, borderRadius: '14px',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(99,102,241,0.5)',
                      flexShrink: 0,
                    }}>
                      <School sx={{ color: 'white', fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="white">
                        Student Portal
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                        Take exams & view results
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>→</Box>
                  </Box>
                </Box>
              </motion.div>

              {/* Admin Login Card */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Box
                  onClick={() => navigate('/login/admin')}
                  sx={{
                    p: 3, borderRadius: '16px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))',
                    border: '1px solid rgba(245,158,11,0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(217,119,6,0.2))',
                      border: '1px solid rgba(245,158,11,0.7)',
                      boxShadow: '0 8px 30px rgba(245,158,11,0.3)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 52, height: 52, borderRadius: '14px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(245,158,11,0.5)',
                      flexShrink: 0,
                    }}>
                      <AdminPanelSettings sx={{ color: 'white', fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="white">
                        Admin Portal
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                        Manage exams & monitor students
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>→</Box>
                  </Box>
                </Box>
              </motion.div>

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                  New student?{' '}
                  <Box
                    component="span"
                    onClick={() => navigate('/register')}
                    sx={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                  >
                    Create an account
                  </Box>
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LandingPage;
