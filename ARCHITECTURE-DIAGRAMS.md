# EyesWide - Architecture Diagrams for Presentation

## 1. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐│
│  │   React    │  │ Material-UI│  │  Proctoring Services   ││
│  │ Components │  │   Framer   │  │  - VideoProctor        ││
│  │            │  │   Motion   │  │  - AudioMonitor        ││
│  │  - Login   │  │            │  │  - TabSwitchDetector   ││
│  │  - Exam    │  │  Styling & │  │                        ││
│  │  - Admin   │  │  Animation │  │  AI Service            ││
│  └────────────┘  └────────────┘  │  - Face Detection      ││
│                                   │  - Audio Analysis      ││
│  ┌────────────────────────────────┴────────────────────────┤│
│  │         Browser APIs                                     ││
│  │  MediaStream | Web Audio | Canvas | Vibration | Socket ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js)                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐│
│  │ Express.js │  │ Socket.io  │  │    Middleware          ││
│  │            │  │            │  │  - Authentication      ││
│  │ REST API   │  │ Real-time  │  │  - Authorization       ││
│  │ Routes:    │  │ Events:    │  │  - Validation          ││
│  │ - /auth    │  │ - join-exam│  │  - Error Handling      ││
│  │ - /exams   │  │ - violation│  │                        ││
│  │ - /admin   │  │ - alerts   │  │  Models (Mongoose)     ││
│  └────────────┘  └────────────┘  │  - User                ││
│                                   │  - Exam                ││
│                                   │  - Submission          ││
│                                   └────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Exams   │  │Submissions│ │Violations│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 2. PROCTORING FLOW

```
Student Starts Exam
        ↓
┌───────────────────┐
│ Request Permissions│
│  - Camera         │
│  - Microphone     │
│  - Fullscreen     │
└───────────────────┘
        ↓
┌───────────────────────────────────────────────────────┐
│           PARALLEL MONITORING (Real-time)             │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   VIDEO     │  │    AUDIO    │  │  BEHAVIOR   │ │
│  │ PROCTORING  │  │  MONITORING │  │  TRACKING   │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤ │
│  │ Every 3s:   │  │ Continuous: │  │ Event-based:│ │
│  │             │  │             │  │             │ │
│  │ • Face      │  │ • Volume    │  │ • Tab       │ │
│  │   detection │  │   analysis  │  │   switch    │ │
│  │ • Face      │  │ • Voice     │  │ • Alt+Tab   │ │
│  │   count     │  │   detection │  │ • Fullscreen│ │
│  │ • Direction │  │ • Multiple  │  │   exit      │ │
│  │   tracking  │  │   speakers  │  │ • Keyboard  │ │
│  │ • Confidence│  │ • Frequency │  │   shortcuts │ │
│  │             │  │   analysis  │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│         ↓                ↓                ↓          │
└─────────┼────────────────┼────────────────┼──────────┘
          └────────────────┴────────────────┘
                          ↓
              ┌───────────────────────┐
              │ VIOLATION CLASSIFIER  │
              ├───────────────────────┤
              │ Analyze:              │
              │ • Type                │
              │ • Severity (L/M/H)    │
              │ • Confidence          │
              │ • Duration            │
              └───────────────────────┘
                          ↓
              ┌───────────────────────┐
              │  WARNING SYSTEM       │
              ├───────────────────────┤
              │ 1. Vibration          │
              │ 2. Sound              │
              │ 3. Visual Alert       │
              │ 4. Toast Notification │
              │ 5. Progress Bar       │
              └───────────────────────┘
                          ↓
              ┌───────────────────────┐
              │ Check Threshold       │
              │ violations >= allowed?│
              └───────────────────────┘
                    ↓           ↓
                   YES         NO
                    ↓           ↓
            ┌──────────┐   Continue
            │DISQUALIFY│   Monitoring
            │Auto-submit│
            └──────────┘
```

