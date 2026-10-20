import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Avatar, Tooltip, Menu, MenuItem, Divider, Badge,
} from '@mui/material';
import {
  RemoveRedEye, Dashboard, School, AdminPanelSettings,
  AccountCircle, ExitToApp, Add, Monitor, Notifications, BarChart,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const NavItem = ({ icon, label, path, active, onClick, badge }) => (
  <Tooltip title={label} placement="right" arrow>
    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
      <Box
        onClick={onClick}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2, py: 1.4, borderRadius: '12px', cursor: 'pointer', mb: 0.5,
          background: active
            ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.15))'
            : 'transparent',
          border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: active
              ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.2))'
              : 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {React.cloneElement(icon, {
            sx: { fontSize: 20, color: active ? '#818cf8' : 'rgba(255,255,255,0.45)' },
          })}
          {badge > 0 && (
            <Box sx={{
              position: 'absolute', top: -4, right: -4,
              width: 14, height: 14, borderRadius: '50%',
              bgcolor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ fontSize: 8, color: 'white', fontWeight: 700 }}>{badge}</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="body2" fontWeight={active ? 700 : 500}
          sx={{ color: active ? '#c7d2fe' : 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>
          {label}
        </Typography>
        {active && (
          <Box sx={{
            ml: 'auto', width: 6, height: 6, borderRadius: '50%',
            bgcolor: '#6366f1', boxShadow: '0 0 8px #6366f1',
          }} />
        )}
      </Box>
    </motion.div>
  </Tooltip>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isStudent } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/');
  };

  const studentNav = [
    { icon: <Dashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <School />, label: 'My Exams', path: '/exams' },
    { icon: <AccountCircle />, label: 'Profile', path: '/profile' },
  ];

  const adminNav = [
    { icon: <Dashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <AdminPanelSettings />, label: 'Admin Panel', path: '/admin' },
    { icon: <Add />, label: 'Create Exam', path: '/admin/create-exam' },
    { icon: <BarChart />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <AccountCircle />, label: 'Profile', path: '/profile' },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <Box sx={{
      width: 260, height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'linear-gradient(180deg, #0f0c29 0%, #1e1b4b 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      zIndex: 1200,
    }}>
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box
          onClick={() => navigate('/dashboard')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', mb: 0.5 }}
        >
          <Box sx={{
            width: 38, height: 38, borderRadius: '11px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99,102,241,0.5)',
          }}>
            <RemoveRedEye sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'white', letterSpacing: 1.5, lineHeight: 1 }}>
              EYESWIDE
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>
              AI Proctoring
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      {/* Role Badge */}
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.5, borderRadius: '8px',
          background: isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
          border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
        }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: '50%',
            bgcolor: isAdmin ? '#f59e0b' : '#6366f1',
            boxShadow: `0 0 6px ${isAdmin ? '#f59e0b' : '#6366f1'}`,
          }} />
          <Typography variant="caption" fontWeight={700}
            sx={{ color: isAdmin ? '#fbbf24' : '#818cf8', fontSize: '0.7rem', letterSpacing: 0.5 }}>
            {isAdmin ? 'ADMIN' : 'STUDENT'}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ px: 2, flex: 1 }}>
        <Typography variant="caption" sx={{
          color: 'rgba(255,255,255,0.25)', px: 2, mb: 1, display: 'block',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          Navigation
        </Typography>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            badge={item.badge}
          />
        ))}
      </Box>

      {/* User Profile */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.5, borderRadius: '12px', cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { background: 'rgba(255,255,255,0.05)' },
          }}
        >
          <Avatar sx={{
            width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700,
            background: isAdmin
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'white', fontSize: '0.8rem' }} noWrap>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }} noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 16 }}>⋮</Typography>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px', minWidth: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}
          sx={{ color: 'rgba(255,255,255,0.7)', gap: 1.5, py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'white' } }}>
          <AccountCircle fontSize="small" /> Profile Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}
          sx={{ color: '#f87171', gap: 1.5, py: 1.2, '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
          <ExitToApp fontSize="small" /> Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Sidebar;
