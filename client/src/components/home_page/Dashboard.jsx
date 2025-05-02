import React, { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'
import Sidebar from './Sidebar'
import { Line, Bar } from 'react-chartjs-2'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { FaGithub, FaNewspaper, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
// Import the services
import learnQuizService from '../../services/learnQuizService'
import interviewService from '../../services/interviewService'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Cache variables for gradient
let width, height, gradient;

// Function to get and cache gradient
const getGradient = (ctx, chartArea) => {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(53, 162, 235, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 205, 86, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 99, 132, 0.8)');
  }

  return gradient;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState('Home');
  const [quizScores, setQuizScores] = useState([]);
  const [hasInterviewData, setHasInterviewData] = useState(false);
  const [skills, setSkills] = useState([]);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [interviewData, setInterviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewMonthlyData, setInterviewMonthlyData] = useState({ labels: [], data: [] });
  const [userName, setUserName] = useState('User');

  // Fetch user data, quiz history, and interview data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      // Fetch quiz data
      try {
        const quizHistory = await learnQuizService.getQuizHistory();
        if (Array.isArray(quizHistory) && quizHistory.length > 0) {
          // Get the 5 most recent quiz scores
          const recentScores = quizHistory
            .slice(0, 5)
            .map(quiz => ({
              topic: quiz.topic,
              score: quiz.score,
              date: new Date(quiz.completedAt).toLocaleDateString()
            }));
          
          setQuizScores(recentScores);
        } else {
          console.log('No quiz history found');
          setQuizScores([]);
        }
      } catch (error) {
        console.error('Error fetching quiz history:', error);
        setQuizScores([]);
      }
      
      // Fetch interview data
      try {
        const interviewHistory = await interviewService.getInterviewHistory();
        
        if (interviewHistory && interviewHistory.interviews && interviewHistory.interviews.length > 0) {
          setHasInterviewData(true);
          
          // Get the 5 most recent interviews
          const formattedData = interviewHistory.interviews
            .slice(0, 5)
            .map(interview => ({
              role: interview.title || interview.type || 'Interview',
              score: interview.score || 0,
              date: new Date(interview.date || interview.createdAt).toLocaleDateString()
            }));
          
          setInterviewData(formattedData);
          
          // Process monthly data for line chart
          processInterviewData(interviewHistory.interviews);
        } else {
          console.log('No interview history found');
          setHasInterviewData(false);
          setInterviewData([]);
        }
      } catch (error) {
        console.error('Error fetching interview history:', error);
        setHasInterviewData(false);
        setInterviewData([]);
      }
      
      // Try to get user info from localStorage
      const storedUserName = localStorage.getItem('userName');
      if (storedUserName) {
        setUserName(storedUserName);
      }
      
      // Sample skills - in a real app you would fetch these from an API
      setSkills(['React', 'JavaScript', 'Node.js', 'MongoDB', 'Express']);
      
      setIsLoading(false);
    };
    
    fetchUserData();
  }, []);
  
  // Process interview data to generate monthly stats
  const processInterviewData = (interviews) => {
    // Group interviews by month and calculate average scores
    const monthlyData = {};
    
    interviews.forEach(interview => {
      // Use date or createdAt field
      const interviewDate = new Date(interview.date || interview.createdAt);
      if (isNaN(interviewDate.getTime())) return;
      
      const score = interview.score || 0;
      const monthYear = `${interviewDate.getMonth() + 1}/${interviewDate.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { 
          total: 0, 
          count: 0, 
          month: interviewDate.toLocaleString('default', { month: 'short' }),
          year: interviewDate.getFullYear()
        };
      }
      
      monthlyData[monthYear].total += score;
      monthlyData[monthYear].count += 1;
    });
    
    // Calculate averages and prepare data for chart
    const labels = [];
    const data = [];
    
    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.split('/').map(Number);
      const [bMonth, bYear] = b.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
    
    // Get the last 7 months or all if less
    const recentMonths = sortedMonths.slice(-7);
    
    recentMonths.forEach(key => {
      const entry = monthlyData[key];
      labels.push(`${entry.month} ${entry.year}`);
      data.push(Math.round(entry.total / entry.count));
    });
    
    setInterviewMonthlyData({ labels, data });
  };

  // Line chart for monthly interview performance with real data
  const interviewLineChartData = {
    labels: interviewMonthlyData.labels.length > 0 
      ? interviewMonthlyData.labels 
      : [],
    datasets: [
      {
        label: 'Interview Progress',
        data: interviewMonthlyData.data.length > 0 
          ? interviewMonthlyData.data 
          : [],
        borderColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return 'rgb(75, 192, 192)';
          }
          return getGradient(ctx, chartArea);
        },
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: 'white',
        fill: false
      }
    ]
  };

  // Horizontal bar chart for quiz scores
  const quizBarChartData = {
    labels: quizScores.map(score => score.topic),
    datasets: [
      {
        label: 'Quiz Score (%)',
        data: quizScores.map(score => score.score),
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return;
          }
          const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          gradient.addColorStop(0, 'rgba(153, 102, 255, 0.8)');
          gradient.addColorStop(1, 'rgba(75, 192, 192, 0.8)');
          return gradient;
        },
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1,
        borderRadius: 5,
        barPercentage: 0.6,
      }
    ]
  };

  // Horizontal bar chart options
  const quizBarChartOptions = {
    indexAxis: 'y', // This makes the bars horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'white' }
      },
      title: {
        display: true,
        text: 'Quiz Performance',
        color: 'white',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        max: 100 // Max score is 100%
      }
    }
  };

  const handleLogout = () => {
    // Remove all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('user');
    
    // Navigate to home page
    navigate('/');
    
    console.log('Logged out successfully');
  };

  const openGithubLink = () => {
    window.open('https://github.com/trending', '_blank');
  };

  const openNewsLink = () => {
    window.open('https://news.ycombinator.com/', '_blank');
  };

  const handleEditSkills = () => {
    console.log('Edit skills clicked');
    setShowSkillInput(true);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      setShowSkillInput(false);
    }
  };

  const handleCancelSkill = () => {
    setNewSkill('');
    setShowSkillInput(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddSkill();
    } else if (e.key === 'Escape') {
      handleCancelSkill();
    }
  };

  return (
    <div className={styles.dashboard}>
        {/* Use the new modular Sidebar component */}Changed from username to name to match Sidebar's prop name
        <Sidebar 
          username={userName} 
          onLogout={handleLogout}
          activeFeature={activeFeature}
        />

        {/* dashboard main part */}
        <main className={styles.main}>
            <div className={styles.upper}>
                <div className={styles.welcomeContainer}>
                    <img className={styles.avatar} src="./images/avatar-male.svg" alt="avatar" />
                    <h2 className={styles.welcomeText}>Hello, {userName}</h2>
                </div>
                <div className={styles["user-details"]}>
                    <div className={styles["top-skill"]}>
                        <div className={styles.skillHeader}>
                            <p className={styles["skill-heading"]}>Professional Skills</p>
                            {!showSkillInput && (
                                <button 
                                    onClick={handleEditSkills} 
                                    className={styles.editButton} 
                                    aria-label="Edit skills"
                                >
                                    <FaEdit className={styles.editIcon} />
                                </button>
                            )}
                        </div>

                        {skills.length > 0 ? (
                            <div className={styles["skill-list"]}>
                                {skills.map((skill, index) => (
                                    <p key={index} className={styles.skill}>{skill}</p>
                                ))}
                            </div>
                        ) : (
                            !showSkillInput && (
                                <div className={styles["skill-list"]}>
                                    <div className={styles.emptySkillsMessage}>
                                        You haven't added any skills yet.
                                    </div>
                                </div>
                            )
                        )}

                        {showSkillInput && (
                            <div className={styles.skillInputContainer}>
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter a skill (e.g., Python)"
                                    className={styles.skillInput}
                                    autoFocus
                                />
                                <div className={styles.skillButtonGroup}>
                                    <button 
                                        onClick={handleAddSkill}
                                        className={styles.iconButton}
                                        aria-label="Save skill"
                                    >
                                        <FaCheck className={styles.checkIcon} />
                                    </button>
                                    <button 
                                        onClick={handleCancelSkill}
                                        className={styles.iconButton}
                                        aria-label="Cancel"
                                    >
                                        <FaTimes className={styles.cancelIcon} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.activity}>
                        {isLoading ? (
                            <div className={styles.loadingContainer}>
                                <p>Loading your progress data...</p>
                            </div>
                        ) : hasInterviewData ? (
                            <div className={styles.chartContainer}>
                                <Line data={interviewLineChartData} options={interviewLineChartOptions} />
                            </div>
                        ) : (
                            <div className={styles.noDataContainer}>
                                <h3>No Interview Data Yet</h3>
                                <p className={styles.noDataMessage}>
                                    Complete your first interview to see your progress here!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.lower}>
                <div className={styles.card}>
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <p>Loading quiz scores...</p>
                        </div>
                    ) : quizScores.length > 0 ? (
                        <div className={styles.chartContainer}>
                            <Bar data={quizBarChartData} options={quizBarChartOptions} />
                        </div>
                    ) : (
                        <div className={styles.noScoreContainer}>
                            <p className={styles.quizHeading}>No Quiz Scores Yet!</p>
                            <p className={styles.noScoreSubtext}>
                                Complete your first quiz to see your results here.
                            </p>
                        </div>
                    )}
                </div>
                <div className={styles.infoCard} onClick={openGithubLink}>
                    <FaGithub className={styles.cardIcon} />
                    <h3 className={styles.cardTitle}>GITHUB</h3>
                    <p className={styles.cardSubtitle}>Get all top Development projects</p>
                </div>
                <div className={styles.infoCard} onClick={openNewsLink}>
                    <FaNewspaper className={styles.cardIcon} />
                    <h3 className={styles.cardTitle}>NEWSPAPER</h3>
                    <p className={styles.cardSubtitle}>Get all the latest job news</p>
                </div>
            </div>
        </main>
    </div>
  )
}
