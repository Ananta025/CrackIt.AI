# CrackIt.AI

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 An AI-powered platform for career development and interview preparation

CrackIt.AI helps job seekers optimize their resumes, LinkedIn profiles, and interview skills through AI-powered tools and personalized feedback.

![CrackIt.AI Screenshot](./client/public/images/Screenshot%202025-04-27%20014544.png)

## ✨ Features

- **📄 Resume Builder** - Create, analyze and optimize your resume with AI-powered feedback
- **👔 LinkedIn Optimizer** - Enhance your LinkedIn profile and posts for better engagement
- **🎯 Mock Interviews** - Practice with AI-powered interview simulations and get instant feedback
- **📚 Learning Resources** - Access curated learning materials for technical and behavioral interviews

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI**: Google Gemini API
- **Authentication**: JWT

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB
- Google Gemini API key

## 🚀 Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/CrackIt.AI.git
cd CrackIt.AI
```

### Backend setup

```bash
cd server
npm install

# Create .env file
cp .env
# Edit .env file with your MongoDB URI, JWT secret, and Gemini API key
```

### Frontend setup

```bash
cd client
npm install
# Create .env file
cp  .env
# Add your environment variables
```

## 🏃‍♀️ Running the Application

### Start the backend server

```bash
cd server
node server.js
# Development mode with hot reload
npx nodemon
```

### Start the frontend application

```bash
cd client
npm run dev
```

The application should be running at `http://localhost:5173`

## 📁 Project Structure

```
CrackIt.AI/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utility functions
│
└── server/                 # Node.js backend
    ├── config/             # Configuration files
    ├── controllers/        # Request controllers
    ├── middlewares/        # Express middlewares
    ├── models/             # MongoDB models
    ├── routes/             # API routes
    ├── services/           # Business logic
    └── utils/              # Utility functions
```

## 🌟 Key Features Explained

### Resume Builder
- Upload existing resumes for AI analysis
- Choose from multiple professional templates
- Get ATS compatibility feedback
- Generate optimized content for each section
- Export as PDF

### LinkedIn Optimizer
- Analyze and improve your LinkedIn profile
- Get section-by-section recommendations
- Optimize posts for better engagement
- Compare before and after metrics

### Mock Interviews
- Practice with AI-powered interviews
- Choose from technical, behavioral, and HR interview types
- Receive feedback using STAR method analysis
- Track progress and improvement areas

### Learning Resources
- Access curated topics for interview preparation
- Filter resources by category and difficulty

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_API_KEY=your_gemini_api_key
```

## 💡 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

 - [Ananta025](https://github.com/Ananta025)

## 🙏 Acknowledgements

- [Google Gemini API](https://ai.google.dev/)
- [MongoDB](https://www.mongodb.com/)
- [React.js](https://reactjs.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)