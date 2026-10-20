# EYESWIDE Setup Guide

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation Steps

1. **Install Dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Update .env with your settings:
   # - MongoDB connection string
   # - JWT secret
   # - Other configuration
   ```

3. **Start Development Servers**
   ```bash
   # Start both server and client (from root directory)
   npm run dev
   
   # Or start individually:
   # Server: npm run server
   # Client: npm run client
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## Project Structure

```
EYESWIDE/
├── server/                 # Backend Node.js/Express server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── server.js          # Main server file
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── public/            # Static files
├── docs/                  # Phase documentation
├── tasks/                 # Task tracking
└── README.md              # Project overview
```

## Development Workflow

### Current Phase: Foundation (Phase 1)
- ✅ Project structure and dependencies
- ✅ Authentication system (JWT-based)
- ✅ Beautiful UI with Material-UI
- ✅ Responsive design and navigation
- 🔄 Database setup and models
- 🔄 Complete authentication flow
- ⏳ Video streaming setup
- ⏳ Basic AI integration

### Next Steps
1. Set up MongoDB database
2. Test authentication end-to-end
3. Implement exam management
4. Add video streaming capabilities
5. Integrate basic AI features

## Available Scripts

### Root Directory
- `npm run dev` - Start both server and client
- `npm run server` - Start backend server only
- `npm run client` - Start frontend client only
- `npm run build` - Build client for production
- `npm test` - Run tests

### Client Directory
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run client tests

## Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **State Management**: React Query + Context API
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

### Development Tools
- **Concurrently**: Run multiple scripts
- **Nodemon**: Auto-restart server
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/eyeswide

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Client URL
CLIENT_URL=http://localhost:3000
```

## Demo Credentials

### Student Account
- Email: student@demo.com
- Password: password123

### Admin Account
- Email: admin@demo.com
- Password: password123

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **MongoDB connection error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network connectivity

3. **Dependencies issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules client/node_modules
   npm run install-all
   ```

## Contributing

1. Check current phase tasks in `tasks/current-phase.md`
2. Pick an uncompleted task
3. Create a feature branch
4. Implement the feature
5. Test thoroughly
6. Update task status
7. Submit pull request

## Support

- Check `docs/` folder for detailed phase documentation
- Review `tasks/` folder for current progress
- Create issues for bugs or feature requests

---

**Happy Coding! 🚀**

Built with ❤️ by the EYESWIDE Team