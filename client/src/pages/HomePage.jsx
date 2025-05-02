import React, { useState, useEffect } from 'react'
import styles from '../components/home_page/Dashboard.module.css'
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import { Line, Bar } from 'react-chartjs-2'
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
// Import the services
import learnQuizService from '../services/learnQuizService'
import interviewService from '../services/interviewService'

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

export default function HomePage() {
  const [hasInterviewData, setHasInterviewData] = useState(false);
  const [quizScores, setQuizScores] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [interviewData, setInterviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewMonthlyData, setInterviewMonthlyData] = useState({ labels: [], data: [] });
  
  // Fetch quiz history and interview data
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
      
      // Initialize with empty skills array instead of using sample data
      setSkills([]);
      
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

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'white' }
      },
      title: {
        display: true,
        text: 'Activity Overview',
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
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  // Update Line chart with real data
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

  // Update horizontal bar chart with real quiz data
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

  return (
    <div className={styles.main}>
      <div className={styles.upper}>
        <img className={styles.avatar} src="./images/avatar-male.svg" alt="avatar" />
        <div className={styles["user-details"]}>
          <div className={styles["top-skill"]}>
            <div className={styles.skillHeader}>
              <p className={styles["skill-heading"]}>Professional Skills</p>
              {!showSkillInput && (
                <button 
                  onClick={() => setShowSkillInput(true)} 
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (newSkill.trim() !== '') {
                        setSkills([...skills, newSkill.trim()]);
                        setNewSkill('');
                        setShowSkillInput(false);
                      }
                    } else if (e.key === 'Escape') {
                      setNewSkill('');
                      setShowSkillInput(false);
                    }
                  }}
                  placeholder="Enter a skill (e.g., Python)"
                  className={styles.skillInput}
                  autoFocus
                />
                <div className={styles.skillButtonGroup}>
                  <button 
                    onClick={() => {
                      if (newSkill.trim() !== '') {
                        setSkills([...skills, newSkill.trim()]);
                        setNewSkill('');
                        setShowSkillInput(false);
                      }
                    }}
                    className={styles.iconButton}
                    aria-label="Save skill"
                  >
                    <FaCheck className={styles.checkIcon} />
                  </button>
                  <button 
                    onClick={() => {
                      setNewSkill('');
                      setShowSkillInput(false);
                    }}
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
                <Line data={interviewLineChartData} options={chartOptions} />
              </div>
            ) : (
              <div className={styles.noDataContainer}>
                <h3>No Activity Data Yet</h3>
                <p className={styles.noDataMessage}>
                  Complete your first interview or quiz to see your progress here!
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
              <p className={styles.quizHeading}>No Quiz Scores Yet !</p>
              <p className={styles.noScoreSubtext}>
                Complete your first quiz to see your results here.
              </p>
            </div>
          )}
        </div>
        <div className={styles.github}>
          <img className={styles.updates} src="./images/github.svg" alt="" />
        </div>
        <div className={styles.news}>
          <img className={styles.updates} src="./images/news.svg" alt="" />
        </div>
      </div>
    </div>
  )
}
