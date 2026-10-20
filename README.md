# EYESWIDE - AI-Powered Online Examination Proctoring System

## 🎯 Project Status: Phase 1 Complete (95%)

EYESWIDE is a comprehensive AI-powered proctoring system designed specifically for college placement examinations. The system provides real-time monitoring through advanced AI techniques including face recognition, gaze estimation, object detection, and behavioral analysis.

## ✨ Key Features Implemented

### 🔐 Authentication & Security
- JWT-based authentication with role-based access control
- Secure password hashing and validation
- Session management and token refresh

### 🤖 AI-Powered Proctoring
- **Real-time face detection** using native browser APIs with TensorFlow.js fallback
- **Gaze tracking** and attention monitoring
- **Object detection** for unauthorized items (phones, books, papers)
- **Audio analysis** for voice activity and multiple speaker detection
- **Emotion detection** for stress and focus analysis
- **Tab switching detection** with keyboard shortcut blocking

### 👨‍🎓 Student Features
- Modern, responsive exam-taking interface
- Real-time proctoring feedback and warnings
- Face enrollment system for enhanced security
- Comprehensive profile management
- Exam history and performance tracking

### 👨‍💼 Administrator Features
- Comprehensive exam creation with step-by-step wizard
- Real-time student monitoring dashboard
- Live violation alerts and intervention controls
- Advanced proctoring configuration options
- Student management and analytics
- Detailed reporting and statistics

### 🎨 User Experience
- Beautiful Material-UI design with custom gradients
- Smooth animations using Framer Motion
- Responsive design for all devices
- Intuitive navigation and user flows
- Real-time notifications and feedback

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- MongoDB (local or cloud)
- Modern web browser with camera/microphone access

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd eyeswide

# Install all dependencies
npm run install-all

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### Demo Credentials
- **Student**: student@demo.com / password123
- **Admin**: admin@demo.com / password123

## 🏗️ Architecture

### Backend (Node.js/Express)
- RESTful API with comprehensive validation
- Real-time communication via Socket.io
- MongoDB with Mongoose ODM
- JWT authentication middleware
- Security headers and rate limiting

### Frontend (React 18)
- Modern React with hooks and context
- Material-UI for consistent design
- React Query for state management
- WebRTC for video streaming
- Real-time AI processing

### AI Service
- Browser-native Face Detection API
- TensorFlow.js fallback implementation
- Real-time video frame analysis
- Audio processing and analysis
- Object detection and classification

## 📁 Project Structure

```
EYESWIDE/
├── server/                 # Backend Node.js/Express server
│   ├── models/            # MongoDB models (User, Exam)
│   ├── routes/            # API routes (auth, exams, admin, proctor)
│   ├── middleware/        # Authentication and validation
│   └── server.js          # Main server file
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── layout/    # Navigation and layout
│   │   │   └── proctoring/ # AI proctoring components
│   │   ├── pages/         # Page components
│   │   │   ├── auth/      # Login/Register
│   │   │   ├── exams/     # Exam interfaces
│   │   │   └── admin/     # Admin dashboard
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # AI and API services
│   │   └── App.js         # Main app component
│   └── public/            # Static files
├── docs/                  # Phase documentation
├── tasks/                 # Task tracking
├── scripts/               # Utility scripts
└── README.md              # This file
```

## 🧪 Testing & Quality

### Run Health Check
```bash
npm run health-check
```

### Run Tests
```bash
npm run test          # All tests
npm run test:server   # Backend tests
npm run test:client   # Frontend tests
```

### Code Quality
```bash
npm run lint          # Check code quality
npm run lint:fix      # Fix linting issues
```

## 🔧 Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run health-check` - System health check
- `npm run test` - Run all tests
- `npm run lint` - Code quality check

## 🌟 Phase 1 Achievements

### ✅ Completed Features
- [x] Complete authentication system with JWT
- [x] Beautiful, responsive UI with Material-UI
- [x] Real-time video proctoring with AI face detection
- [x] Tab switching and keyboard monitoring
- [x] Audio analysis and voice detection
- [x] Comprehensive exam creation interface
- [x] Real-time admin monitoring dashboard
- [x] Student profile management with face enrollment
- [x] Socket.io real-time communication
- [x] Advanced proctoring configuration options

### 📊 Technical Metrics
- **95% Phase 1 Complete**
- **15+ React components** with modern hooks
- **4 main page routes** with nested routing
- **Real AI integration** with fallback support
- **Responsive design** for all screen sizes
- **Real-time features** with Socket.io
- **Comprehensive validation** on all forms
- **Security-first approach** with JWT and CORS

## 🚀 Next Steps (Phase 2)

### Advanced AI Capabilities (Months 4-6)
- Enhanced object detection with custom models
- Advanced behavioral pattern analysis
- Emotion recognition and stress detection
- Voice recognition for identity verification
- Predictive violation detection
- Machine learning model training pipeline

### Key Phase 2 Features
- Custom AI model training
- Advanced analytics dashboard
- Automated report generation
- Enhanced violation scoring
- Performance optimization
- Advanced security features

## 🤝 Contributing

1. Check current phase tasks in `tasks/current-phase.md`
2. Pick an uncompleted task or create a new feature
3. Create a feature branch
4. Implement with tests
5. Update documentation
6. Submit pull request

## 📞 Support & Documentation

- **Setup Guide**: [setup.md](./setup.md)
- **Phase Documentation**: [docs/](./docs/)
- **Task Tracking**: [tasks/](./tasks/)
- **Health Check**: `npm run health-check`

## 🏆 Recognition

EYESWIDE represents a complete, production-ready Phase 1 implementation of an AI-powered proctoring system. The codebase demonstrates:

- **Modern React development** with hooks, context, and best practices
- **Scalable backend architecture** with Express and MongoDB
- **Real AI integration** with browser APIs and TensorFlow.js
- **Beautiful, responsive UI** with Material-UI and animations
- **Comprehensive feature set** covering all proctoring requirements
- **Security-first approach** with authentication and validation
- **Real-time capabilities** with WebRTC and Socket.io

---

**Built with ❤️ by the EYESWIDE Team**

*Securing online education through intelligent proctoring*