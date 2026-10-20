#!/usr/bin/env node

const axios = require('axios');
const mongoose = require('mongoose');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function checkHealth() {
  console.log('\n🔍 EYESWIDE System Health Check\n');
  
  let allHealthy = true;

  // Check Backend Server
  try {
    log('blue', '📡 Checking Backend Server...');
    const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    if (response.status === 200) {
      log('green', '✅ Backend Server: Healthy');
      console.log(`   Response: ${response.data.service}`);
    }
  } catch (error) {
    log('red', '❌ Backend Server: Unhealthy');
    console.log(`   Error: ${error.message}`);
    allHealthy = false;
  }

  // Check Frontend Server
  try {
    log('blue', '🌐 Checking Frontend Server...');
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    if (response.status === 200) {
      log('green', '✅ Frontend Server: Healthy');
    }
  } catch (error) {
    log('red', '❌ Frontend Server: Unhealthy');
    console.log(`   Error: ${error.message}`);
    allHealthy = false;
  }

  // Check Database Connection
  try {
    log('blue', '🗄️  Checking Database Connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eyeswide', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    log('green', '✅ Database: Connected');
    await mongoose.disconnect();
  } catch (error) {
    log('red', '❌ Database: Connection Failed');
    console.log(`   Error: ${error.message}`);
    allHealthy = false;
  }

  // Check AI Service
  try {
    log('blue', '🤖 Checking AI Service...');
    // This would check if AI models are loaded and ready
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      log('green', '✅ AI Service: Native Face Detection Available');
    } else {
      log('yellow', '⚠️  AI Service: Using Fallback Detection');
    }
  } catch (error) {
    log('red', '❌ AI Service: Error');
    console.log(`   Error: ${error.message}`);
  }

  // Check Environment Variables
  log('blue', '⚙️  Checking Environment Configuration...');
  const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
  let envHealthy = true;
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log('green', `✅ ${envVar}: Set`);
    } else {
      log('red', `❌ ${envVar}: Missing`);
      envHealthy = false;
      allHealthy = false;
    }
  });

  // Check Node.js Version
  log('blue', '🟢 Checking Node.js Version...');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 16) {
    log('green', `✅ Node.js: ${nodeVersion} (Compatible)`);
  } else {
    log('red', `❌ Node.js: ${nodeVersion} (Requires v16+)`);
    allHealthy = false;
  }

  // Check Available Ports
  log('blue', '🔌 Checking Port Availability...');
  const net = require('net');
  
  const checkPort = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      server.on('error', () => resolve(false));
    });
  };

  const port5000Available = await checkPort(5000);
  const port3000Available = await checkPort(3000);

  if (port5000Available) {
    log('green', '✅ Port 5000: Available');
  } else {
    log('yellow', '⚠️  Port 5000: In Use (Server may be running)');
  }

  if (port3000Available) {
    log('green', '✅ Port 3000: Available');
  } else {
    log('yellow', '⚠️  Port 3000: In Use (Client may be running)');
  }

  // Summary
  console.log('\n📊 Health Check Summary');
  console.log('========================');
  
  if (allHealthy) {
    log('green', '🎉 All systems healthy! EYESWIDE is ready to go.');
  } else {
    log('red', '⚠️  Some issues detected. Please check the errors above.');
  }

  // System Information
  console.log('\n💻 System Information');
  console.log('=====================');
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`Uptime: ${Math.round(process.uptime())}s`);

  // Recommendations
  if (!allHealthy) {
    console.log('\n💡 Recommendations');
    console.log('==================');
    console.log('1. Ensure MongoDB is running locally or update MONGODB_URI');
    console.log('2. Check that all environment variables are set in .env file');
    console.log('3. Run "npm run install-all" to ensure all dependencies are installed');
    console.log('4. Use "npm run dev" to start both servers');
  }

  console.log('\n');
  process.exit(allHealthy ? 0 : 1);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log('red', `❌ Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log('red', `❌ Unhandled Rejection: ${error.message}`);
  process.exit(1);
});

// Run health check
checkHealth();