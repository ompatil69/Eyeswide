import React, { useEffect, useRef, useState } from 'react';
import { Alert, Snackbar, Typography, Box } from '@mui/material';
import { Warning } from '@mui/icons-material';

const TabSwitchDetector = ({ examId, onViolation, isActive = true }) => {
  const [violations, setViolations] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const violationCountRef = useRef(0);
  const lastViolationRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    let isTabActive = true;
    let tabSwitchCount = 0;
    let warningTimeout = null;

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      const now = new Date();
      
      if (document.hidden) {
        // Tab became hidden
        isTabActive = false;
        lastViolationRef.current = now;
      } else {
        // Tab became visible again
        if (!isTabActive && lastViolationRef.current) {
          const timeAway = now - lastViolationRef.current;
          
          // Report all tab switches but with different severity based on time
          tabSwitchCount++;
          violationCountRef.current++;

          let severity = 'low';
          let message = `Tab switched (${Math.round(timeAway / 1000)}s away)`;
          
          if (timeAway > 10000) {
            severity = 'high';
            message += ' - Extended time away from exam';
          } else if (timeAway > 3000) {
            severity = 'medium';
            message += ' - Moderate time away from exam';
          } else {
            severity = 'low';
            message += ' - Brief tab switch detected';
          }

          const violation = {
            type: 'tab-switch',
            severity: severity,
            message: message + ` - Warning ${tabSwitchCount}`,
            timestamp: now,
            timeAway: timeAway
          };

          setViolations(prev => [...prev.slice(-4), violation]);
          
          // Show alert for all violations (not just medium/high)
          setCurrentAlert(violation);
          setShowAlert(true);

          // Call parent violation handler
          if (onViolation) {
            onViolation(violation);
          }

          // Auto-hide alert after 3 seconds
          if (warningTimeout) clearTimeout(warningTimeout);
          warningTimeout = setTimeout(() => {
            setShowAlert(false);
          }, 3000);
        }
        isTabActive = true;
      }
    };

    // Handle window focus/blur (additional detection)
    const handleWindowFocus = () => {
      // Window regained focus - check if we were away
      if (!isTabActive) {
        handleVisibilityChange();
      }
    };

    const handleWindowBlur = () => {
      // Window lost focus - this catches Alt+Tab and other app switches
      const now = new Date();
      
      if (isTabActive) {
        isTabActive = false;
        lastViolationRef.current = now;
        
        // Immediate violation for app switching
        const violation = {
          type: 'app-switch',
          severity: 'medium',
          message: 'Switched to another application (Alt+Tab or similar)',
          timestamp: now
        };

        setViolations(prev => [...prev.slice(-4), violation]);
        setCurrentAlert(violation);
        setShowAlert(true);

        if (onViolation) {
          onViolation(violation);
        }

        // Auto-hide alert after 3 seconds
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
    };

    // Handle keyboard shortcuts that might indicate cheating
    const handleKeyDown = (event) => {
      const forbiddenKeys = [
        'F12', // Developer tools
        'F11', // Fullscreen toggle - re-added
      ];

      const forbiddenCombinations = [
        { ctrl: true, shift: true, key: 'I' }, // Dev tools
        { ctrl: true, shift: true, key: 'J' }, // Console
        { ctrl: true, shift: true, key: 'C' }, // Inspector
        { alt: true, key: 'Tab' }, // Alt+Tab - re-added for app switching detection
        { cmd: true, key: 'Tab' }, // Cmd+Tab (Mac) - re-added for app switching detection
        { ctrl: true, key: 'T' }, // New tab
        { ctrl: true, key: 'N' }, // New window
        { ctrl: true, key: 'W' }, // Close tab
        { alt: true, key: 'F4' }, // Close window (Windows)
        { cmd: true, key: 'Q' }, // Quit application (Mac)
      ];

      // Check forbidden single keys
      if (forbiddenKeys.includes(event.key)) {
        event.preventDefault();
        
        const violation = {
          type: 'forbidden-key',
          severity: 'medium', // Reduced from 'high'
          message: `Attempted to use forbidden key: ${event.key}`,
          timestamp: new Date()
        };

        setViolations(prev => [...prev.slice(-4), violation]);
        setCurrentAlert(violation);
        setShowAlert(true);

        if (onViolation) {
          onViolation(violation);
        }
      }

      // Check forbidden key combinations
      forbiddenCombinations.forEach(combo => {
        const isMatch = (
          (combo.ctrl && event.ctrlKey) ||
          (combo.shift && event.shiftKey) ||
          (combo.alt && event.altKey) ||
          (combo.cmd && event.metaKey)
        ) && event.key.toLowerCase() === combo.key.toLowerCase();

        if (isMatch) {
          event.preventDefault();
          
          const violation = {
            type: 'forbidden-shortcut',
            severity: 'medium', // Reduced from 'high'
            message: `Attempted forbidden shortcut: ${Object.keys(combo).filter(k => k !== 'key' && combo[k]).join('+')}+${combo.key}`,
            timestamp: new Date()
          };

          setViolations(prev => [...prev.slice(-4), violation]);
          setCurrentAlert(violation);
          setShowAlert(true);

          if (onViolation) {
            onViolation(violation);
          }
        }
      });
    };

    // Prevent right-click context menu
    const handleContextMenu = (event) => {
      event.preventDefault();
      
      const violation = {
        type: 'right-click',
        severity: 'medium',
        message: 'Right-click attempted',
        timestamp: new Date()
      };

      setViolations(prev => [...prev.slice(-4), violation]);
      setCurrentAlert(violation);
      setShowAlert(true);

      if (onViolation) {
        onViolation(violation);
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      if (warningTimeout) {
        clearTimeout(warningTimeout);
      }
    };
  }, [isActive, onViolation, examId]);

  // Disable text selection and drag
  useEffect(() => {
    if (!isActive) return;

    const disableSelection = (e) => {
      e.preventDefault();
      return false;
    };

    const disableDrag = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    document.addEventListener('selectstart', disableSelection);
    document.addEventListener('dragstart', disableDrag);

    // Add CSS to disable selection
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('selectstart', disableSelection);
      document.removeEventListener('dragstart', disableDrag);
      document.head.removeChild(style);
    };
  }, [isActive]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <>
      {/* Violation Alert */}
      <Snackbar
        open={showAlert}
        autoHideDuration={5000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={currentAlert ? getSeverityColor(currentAlert.severity) : 'warning'}
          onClose={() => setShowAlert(false)}
          sx={{
            minWidth: 300,
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          <Warning />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Proctoring Violation Detected
            </Typography>
            <Typography variant="body2">
              {currentAlert?.message}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      {/* Fullscreen enforcement */}
      {isActive && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}
    </>
  );
};

export default TabSwitchDetector;