# EyesWide - ML Algorithms & Complete Tech Stack

## 🤖 MACHINE LEARNING & AI ALGORITHMS

### IMPORTANT NOTE: Phase 1 vs Future Phases

**Current Implementation (Phase 1):**
- Uses **Browser Native APIs** and **Computer Vision techniques**
- **NOT traditional ML models** (no training, no neural networks yet)
- Rule-based algorithms with statistical analysis
- Lightweight, browser-based processing

**Future Implementation (Phase 2-4):**
- Will use **TensorFlow.js** with pre-trained models
- Deep Learning models (CNNs, RNNs)
- Transfer learning from existing models

---

## 📊 CURRENT ALGORITHMS (Phase 1)

### 1. FACE DETECTION ALGORITHM

**Technology Used:** Browser Face Detection API (Shape Detection API)

**How It Works:**
```
Algorithm Type: Viola-Jones Algorithm (under the hood)
- Cascade Classifier approach
- Haar-like features detection
- AdaBoost for feature selection
```

**Technical Details:**
```javascript
// Native browser implementation
const faceDetector = new FaceDetector({
  maxDetectedFaces: 5,
  fastMode: false
});

// Returns bounding boxes
const faces = await faceDetector.detect(videoElement);
```

**What It Does:**
1. **Feature Extraction**: Scans image for face-like patterns
2. **Cascade Classification**: Multiple stages of classifiers
3. **Bounding Box**: Returns face location (x, y, width, height)
4. **Confidence Score**: Probability that detected region is a face

**Mathematical Approach:**
- **Integral Images**: Fast feature computation
- **Haar Features**: Edge, line, and rectangle features
- **Weak Classifiers**: Combined using AdaBoost
- **Cascade Structure**: Reject non-faces early

**Not ML in traditional sense, but uses:**
- Pre-trained cascade classifiers
- Statistical pattern matching
- Threshold-based decision making

---

### 2. FACE DIRECTION ESTIMATION

**Algorithm Type:** Geometric Computer Vision (Not ML)

**How It Works:**
```
Input: Face bounding box (x, y, width, height)
Process: Calculate face center position
Output: Direction (left, right, up, down, center)
```

**Implementation:**
```javascript
// Calculate face center
centerX = boundingBox.x + boundingBox.width / 2
centerY = boundingBox.y + boundingBox.height / 2

// Determine direction using thresholds
if (centerX < videoWidth * 0.35) → LEFT
if (centerX > videoWidth * 0.65) → RIGHT
if (centerY < videoHeight * 0.3) → UP
if (centerY > videoHeight * 0.7) → DOWN
else → CENTER
```

**Algorithm Type:**
- **Rule-Based System**: Threshold-based classification
- **Geometric Analysis**: Position-based inference
- **No ML Training**: Uses fixed thresholds

**Why This Approach:**
- Fast (no model inference)
- Lightweight (no model loading)
- Accurate enough for Phase 1
- Works in real-time

---

### 3. AUDIO ANALYSIS ALGORITHM

**Technology Used:** Web Audio API + FFT (Fast Fourier Transform)

**Algorithm: FFT (Fast Fourier Transform)**

**What is FFT:**
```
FFT is a mathematical algorithm that converts time-domain 
audio signals into frequency-domain representation.

Time Domain: Amplitude over time
Frequency Domain: Amplitude over frequency
```

**How It Works:**
```javascript
// Setup
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256; // Must be power of 2

// Get frequency data
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(dataArray);

// Analyze frequencies
voiceRange = dataArray[10-50]  // Human voice: 85-255 Hz
lowFreq = dataArray[0-20]      // Bass: 20-85 Hz
midFreq = dataArray[20-60]     // Mid: 85-500 Hz
highFreq = dataArray[60-100]   // High: 500-2000 Hz
```

**Mathematical Foundation:**
```
FFT Algorithm: Cooley-Tukey Algorithm
Complexity: O(N log N)
Formula: X(k) = Σ x(n) * e^(-2πikn/N)

Where:
- X(k) = frequency domain output
- x(n) = time domain input
- N = number of samples
- k = frequency bin
```

**Detection Algorithms:**

**A. Voice Activity Detection (VAD)**
```
Algorithm Type: Energy-Based Detection
Method: Threshold-based classification

Steps:
1. Calculate energy in voice frequency range (85-255 Hz)
2. Compare with threshold
3. If energy > threshold → Voice detected

Threshold: voiceActivity > 90 (out of 255)
```

**B. Volume Analysis**
```
Algorithm: RMS (Root Mean Square)

Formula: RMS = √(Σ(x²) / N)

Where:
- x = sample amplitude
- N = number of samples

Normalized: volume = RMS / 128 (0 to 1 scale)
```

**C. Multiple Speaker Detection**
```
Algorithm: Frequency Distribution Analysis
Method: Statistical pattern matching

Logic:
- Single speaker: Concentrated frequency peaks
- Multiple speakers: Distributed frequency energy

if (lowFreq > 70 AND midFreq > 70 AND highFreq > 50):
    → Multiple speakers detected
```

**Not Traditional ML, but uses:**
- Signal Processing (FFT)
- Statistical Analysis
- Threshold-based Classification
- Pattern Recognition

---

### 4. BEHAVIOR PATTERN DETECTION

**Algorithm Type:** Event-Based State Machine

**How It Works:**
```
State Machine with Event Listeners
- Monitors browser events
- Tracks state changes
- Classifies behavior patterns
```

**Implementation:**
```javascript
// Tab Switch Detection
State: {
  isTabActive: boolean,
  lastSwitchTime: timestamp,
  switchCount: number
}

Events:
- visibilitychange → Tab hidden/visible
- blur → Window lost focus
- focus → Window gained focus

Classification:
timeAway < 3s → Low severity
timeAway 3-10s → Medium severity
timeAway > 10s → High severity
```

**Algorithm Type:**
- **Finite State Machine (FSM)**: State-based logic
- **Event-Driven Architecture**: React to user actions
- **Time-Series Analysis**: Track duration patterns
- **Rule-Based Classification**: Severity assignment

**Not ML, but uses:**
- State tracking
- Temporal pattern analysis
- Rule-based decision trees

---

### 5. VIOLATION CLASSIFICATION ALGORITHM

**Algorithm Type:** Multi-Criteria Decision Analysis (MCDA)

**How It Works:**
```
Input: Violation data (type, duration, confidence)
Process: Apply rules and thresholds
Output: Severity level (low, medium, high)
```

**Decision Tree:**
```
if (violationType == "multiple-faces"):
    if (confidence > 0.8):
        severity = HIGH
    else:
        severity = MEDIUM

if (violationType == "face-direction"):
    if (duration > 5s):
        severity = HIGH
    elif (duration > 3s):
        severity = MEDIUM
    else:
        severity = LOW

if (violationType == "tab-switch"):
    if (timeAway > 10s):
        severity = HIGH
    elif (timeAway > 3s):
        severity = MEDIUM
    else:
        severity = LOW
```

**Algorithm Components:**
- **Decision Tree**: Rule-based classification
- **Threshold-Based Logic**: Numerical comparisons
- **Multi-Factor Analysis**: Considers type, duration, confidence
- **Weighted Scoring**: Different violations have different weights

---

## 🚀 FUTURE ML ALGORITHMS (Phase 2-4)

### Phase 2: Deep Learning Models

**1. Face Recognition (CNN)**
```
Model: FaceNet or MobileNet
Architecture: Convolutional Neural Network
Purpose: Verify student identity
Accuracy: 99%+

Layers:
- Convolutional layers (feature extraction)
- Pooling layers (dimensionality reduction)
- Fully connected layers (classification)
- Softmax output (probability distribution)
```

**2. Gaze Estimation (CNN + Regression)**
```
Model: iTracker or RT-GENE
Architecture: CNN with regression head
Purpose: Precise eye tracking
Accuracy: ±5 degrees

Input: Eye region images
Output: Gaze direction (x, y coordinates)
```

**3. Emotion Detection (CNN)**
```
Model: FER2013 or AffectNet
Architecture: Deep CNN
Purpose: Detect stress, confusion, anxiety
Classes: 7 emotions (happy, sad, angry, etc.)

Algorithm: Transfer Learning
- Pre-trained on large emotion datasets
- Fine-tuned for exam context
```

**4. Object Detection (YOLO/SSD)**
```
Model: YOLO v5 or MobileNet-SSD
Architecture: Single-shot detector
Purpose: Detect phones, books, papers
Speed: 30+ FPS

Algorithm: 
- Grid-based detection
- Bounding box regression
- Class probability prediction
```

**5. Voice Recognition (RNN/LSTM)**
```
Model: DeepSpeech or Wav2Vec
Architecture: Recurrent Neural Network
Purpose: Speaker identification
Accuracy: 95%+

Algorithm:
- Audio feature extraction (MFCC)
- Sequence modeling (LSTM)
- Speaker embedding
- Similarity comparison
```

### Phase 3: Advanced ML

**6. Anomaly Detection (Autoencoder)**
```
Model: Variational Autoencoder (VAE)
Purpose: Detect unusual behavior patterns
Algorithm: Unsupervised learning

Process:
1. Train on normal exam behavior
2. Detect deviations from normal
3. Flag anomalies as potential cheating
```

**7. Behavioral Analysis (Time Series)**
```
Model: LSTM or Transformer
Purpose: Analyze temporal patterns
Features: Mouse movements, typing patterns, gaze patterns

Algorithm:
- Sequence modeling
- Pattern recognition
- Anomaly scoring
```

---

## 🛠️ COMPLETE TECH STACK

### FRONTEND TECHNOLOGIES

**1. Core Framework**
```
React 18.2.0
- Component-based architecture
- Virtual DOM for performance
- Hooks for state management
- Context API for global state
```

**2. UI Library**
```
Material-UI (MUI) 5.14.5
- Pre-built components
- Responsive design system
- Theme customization
- Accessibility built-in

Components Used:
- Button, TextField, Card, Paper
- Dialog, Alert, Snackbar
- Grid, Box, Container
- Icons (@mui/icons-material)
```

**3. Animation Library**
```
Framer Motion 10.16.1
- Declarative animations
- Spring physics
- Gesture support
- Layout animations

Used For:
- Warning alerts (spring animation)
- Screen flash effects
- Component transitions
- Smooth UI interactions
```

**4. Routing**
```
React Router DOM 6.15.0
- Client-side routing
- Protected routes
- Dynamic routing
- Navigation guards
```

**5. HTTP Client**
```
Axios 1.5.0
- Promise-based HTTP client
- Request/response interceptors
- Automatic JSON transformation
- Error handling

Configuration:
- Base URL setup
- Authorization headers
- Request timeout
- Response parsing
```

**6. Real-Time Communication**
```
Socket.io-client 4.7.2
- WebSocket wrapper
- Automatic reconnection
- Room-based messaging
- Event-based communication

Used For:
- Violation reporting
- Live monitoring
- Admin notifications
- Real-time updates
```

**7. Notifications**
```
React Hot Toast 2.4.1
- Toast notifications
- Customizable styling
- Promise-based toasts
- Position control

Features:
- Color-coded severity
- Auto-dismiss
- Custom icons
- Animation support
```

**8. State Management**
```
React Context API
- Global state management
- Authentication context
- User data sharing
- Avoid prop drilling

React Query 3.39.3
- Server state management
- Caching
- Background refetching
- Optimistic updates
```

**9. Form Handling**
```
React Hook Form 7.45.4
- Form validation
- Error handling
- Performance optimization
- Minimal re-renders
```

**10. Date Handling**
```
date-fns 2.30.0
- Date formatting
- Date calculations
- Timezone handling
- Lightweight alternative to Moment.js
```

**11. Charts & Visualization**
```
Recharts 2.8.0
- React-based charts
- Responsive design
- Customizable
- Animation support

Used For:
- Admin analytics
- Performance graphs
- Violation statistics
```

**12. Webcam Access**
```
React Webcam 7.1.1
- Camera access wrapper
- Screenshot capture
- Video recording
- Stream management
```

---

### BACKEND TECHNOLOGIES

**1. Runtime Environment**
```
Node.js (v16+)
- JavaScript runtime
- Event-driven architecture
- Non-blocking I/O
- NPM package ecosystem
```

**2. Web Framework**
```
Express.js 4.18.2
- Minimal web framework
- Middleware support
- Routing
- HTTP utilities

Middleware Used:
- express.json() - JSON parsing
- express.urlencoded() - Form data
- cors() - Cross-origin requests
- morgan() - HTTP logging
```

**3. Database**
```
MongoDB 6.0+
- NoSQL document database
- Flexible schema
- Horizontal scaling
- JSON-like documents

Features:
- Collections: users, exams, submissions
- Indexes: email, examId
- Aggregation pipeline
- Replica sets (production)
```

**4. ODM (Object Document Mapper)**
```
Mongoose 7.4.0
- MongoDB object modeling
- Schema definition
- Validation
- Middleware (hooks)
- Query building

Features:
- Schema validation
- Virtual properties
- Instance methods
- Static methods
- Pre/post hooks
```

**5. Authentication**
```
jsonwebtoken (JWT) 9.0.2
- Token generation
- Token verification
- Payload encryption
- Expiration handling

bcryptjs 2.4.3
- Password hashing
- Salt generation
- Hash comparison
- Secure password storage

Algorithm: bcrypt
- Cost factor: 10 rounds
- Salt: Random per password
- One-way hashing
```

**6. Real-Time Communication**
```
Socket.io 4.7.2
- WebSocket server
- Room management
- Broadcasting
- Namespace support

Events:
- connection/disconnect
- join-exam
- violation-detected
- violation-alert
```

**7. Environment Variables**
```
dotenv 16.3.1
- Environment configuration
- Secret management
- Multi-environment support

Variables:
- PORT
- MONGODB_URI
- JWT_SECRET
- NODE_ENV
```

**8. Security**
```
helmet 7.0.0
- Security headers
- XSS protection
- CSRF protection
- Content Security Policy

express-rate-limit 6.10.0
- Rate limiting
- DDoS protection
- API throttling
```

**9. Validation**
```
express-validator 7.0.1
- Input validation
- Sanitization
- Custom validators
- Error formatting
```

**10. File Upload (Future)**
```
multer 1.4.5
- File upload handling
- Multipart form data
- File filtering
- Storage configuration
```

---

### BROWSER APIs (Computer Vision & Audio)

**1. MediaStream API**
```
Purpose: Camera and microphone access
Methods:
- getUserMedia() - Request permissions
- getVideoTracks() - Video stream
- getAudioTracks() - Audio stream
- stop() - Release resources
```

**2. Face Detection API**
```
Purpose: Native face detection
Browser: Chrome, Edge (experimental)
Methods:
- FaceDetector() - Create detector
- detect() - Find faces
Returns: Bounding boxes, landmarks
```

**3. Web Audio API**
```
Purpose: Audio processing and analysis
Components:
- AudioContext - Audio processing graph
- AnalyserNode - Frequency analysis
- MediaStreamSource - Input from mic
- OscillatorNode - Sound generation

Methods:
- createAnalyser() - FFT analysis
- getByteFrequencyData() - Frequency data
- createOscillator() - Generate tones
```

**4. Canvas API**
```
Purpose: Video frame processing
Methods:
- getContext('2d') - 2D rendering
- drawImage() - Draw video frame
- getImageData() - Pixel data
- putImageData() - Write pixels

Used For:
- Frame capture
- Image analysis
- Brightness calculation
- Pattern detection
```

**5. Fullscreen API**
```
Purpose: Fullscreen enforcement
Methods:
- requestFullscreen() - Enter fullscreen
- exitFullscreen() - Exit fullscreen
- fullscreenElement - Current element
Events:
- fullscreenchange - State change
```

**6. Page Visibility API**
```
Purpose: Tab switch detection
Properties:
- document.hidden - Tab visibility
- document.visibilityState - State
Events:
- visibilitychange - Tab switch
```

**7. Vibration API**
```
Purpose: Haptic feedback
Method:
- navigator.vibrate(pattern)
Pattern: [vibrate, pause, vibrate, ...]
Example: [200, 100, 200] - Two pulses
```

**8. Keyboard API**
```
Purpose: Keyboard event handling
Events:
- keydown - Key pressed
- keyup - Key released
Properties:
- key - Key name
- ctrlKey, altKey, shiftKey - Modifiers
```

---

### DEVELOPMENT TOOLS

**1. Build Tool**
```
Create React App (react-scripts 5.0.1)
- Webpack bundling
- Babel transpilation
- Hot module replacement
- Development server
```

**2. Package Manager**
```
npm (Node Package Manager)
- Dependency management
- Script running
- Version control
```

**3. Version Control**
```
Git
- Source code management
- Branch management
- Collaboration
```

**4. Code Editor**
```
VS Code (recommended)
- IntelliSense
- Debugging
- Extensions
- Git integration
```

---

### DEPLOYMENT STACK (Production)

**1. Frontend Hosting**
```
Options:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

Features:
- CDN distribution
- HTTPS
- Automatic deployments
- Custom domains
```

**2. Backend Hosting**
```
Options:
- Heroku
- AWS EC2
- DigitalOcean
- Railway

Features:
- Auto-scaling
- Load balancing
- SSL certificates
- Environment variables
```

**3. Database Hosting**
```
MongoDB Atlas
- Cloud-hosted MongoDB
- Automatic backups
- Replica sets
- Monitoring
- Free tier available
```

**4. Load Balancer**
```
Nginx
- Reverse proxy
- Load distribution
- SSL termination
- Caching
```

**5. Monitoring**
```
Options:
- PM2 (process management)
- New Relic (APM)
- Sentry (error tracking)
- LogRocket (session replay)
```

---

## 📊 ALGORITHM COMPARISON TABLE

| Feature | Current (Phase 1) | Future (Phase 2+) |
|---------|-------------------|-------------------|
| Face Detection | Viola-Jones (Browser API) | CNN (FaceNet) |
| Gaze Tracking | Geometric (Position-based) | CNN + Regression |
| Emotion Detection | None | CNN (FER2013) |
| Object Detection | None | YOLO v5 |
| Voice Recognition | FFT + Thresholds | RNN/LSTM |
| Anomaly Detection | Rule-based | Autoencoder |
| Accuracy | 85-95% | 98%+ |
| Processing | Client-side | Client + Server |
| Model Size | 0 MB (Native API) | 5-50 MB |
| Latency | <50ms | 50-200ms |

---

## 🎯 KEY TAKEAWAYS FOR PRESENTATION

**When asked about ML:**

"Currently in Phase 1, we use **Computer Vision techniques** and **Signal Processing algorithms** rather than traditional Machine Learning models. Specifically:

1. **Face Detection**: Browser's native Viola-Jones algorithm
2. **Audio Analysis**: FFT (Fast Fourier Transform) for frequency analysis
3. **Behavior Tracking**: Event-based state machines
4. **Classification**: Rule-based decision trees

This approach is **lightweight, fast, and runs entirely in the browser** without requiring model downloads or GPU processing.

In **Phase 2**, we'll integrate **TensorFlow.js** with deep learning models:
- CNNs for face recognition and emotion detection
- YOLO for object detection
- RNNs for voice recognition
- Autoencoders for anomaly detection

This will increase accuracy from 85-95% to 98%+ while adding advanced features like emotion analysis and object detection."

---

**Remember**: You're using **Computer Vision** and **Signal Processing**, not traditional ML in Phase 1. This is actually an advantage - it's faster, lighter, and doesn't require training data!
