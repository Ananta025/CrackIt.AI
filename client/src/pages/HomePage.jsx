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
  
  // Chart data configuration for activity overview
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Interview Attempts',
        data: [3, 5, 4, 7, 6, 8],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(75, 192, 192, 0.2)');
          gradient.addColorStop(1, 'rgba(75, 192, 192, 0.8)');
          return gradient;
        },
      },
      {
        label: 'Quiz Scores',
        data: [65, 78, 80, 75, 85, 90],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
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

  // Interview data bar chart
  const interviewBarChartData = {
    labels: interviewData.map(data => data.role),
    datasets: [
      {
        label: 'Interview Score',
        data: interviewData.map(data => data.score),
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            // This case happens on initial chart load
            return 'rgba(75, 192, 192, 0.6)';
          }
          return getGradient(ctx, chartArea);
        },
        borderColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return 'rgb(75, 192, 192)';
          }
          return getGradient(ctx, chartArea);
        },
        borderWidth: 1,
        borderRadius: 5,
      }
    ]
  };

  // Interview bar chart options
  const interviewBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'white' }
      },
      title: {
        display: true,
        text: 'Interview Performance',
        color: 'white',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        max: 100 // Max score is 100%
      },
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  // Line chart for monthly interview performance
  const interviewLineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Interview Progress',
        data: [65, 72, 68, 75, 82, 88, 91],
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

  // Interview line chart options
  const interviewLineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'white' }
      },
      title: {
        display: true,
        text: 'Interview Progress Over Time',
        color: 'white',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        max: 100 // Max score is 100%
      },
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
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
  
  // For demonstration purposes - in real app, would fetch from API
  useEffect(() => {
    // Set has interview data to true since we're now providing sample data
    setHasInterviewData(true);
    setQuizScores([]);
    setInterviewData([]);

    // Sample interview data
    setInterviewData([
      { role: 'Frontend Developer', score: 85, date: '2023-06-10' },
      { role: 'Backend Engineer', score: 72, date: '2023-06-18' },
      { role: 'Full Stack Developer', score: 91, date: '2023-07-05' },
    ]);
    
    // Uncomment to show example quiz scores
    setQuizScores([
      { topic: 'Python Basics', score: 85, date: '2023-05-15' },
      { topic: 'JavaScript', score: 92, date: '2023-05-20' },
      { topic: 'Data Structures', score: 78, date: '2023-05-25' },
    ]);
    // Uncomment to show example skills
    setSkills(['Python', 'JAVA', 'C++', 'HTML', 'CSS', 'Javascript']);
  }, []);
  
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
    <div className={styles.main}>
      <div className={styles.upper}>
        <img className={styles.avatar} src="./images/avatar-male.svg" alt="avatar" />
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
            {hasInterviewData ? (
              <div className={styles.chartContainer}>
                <Line data={interviewLineChartData} options={interviewLineChartOptions} />
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
          {quizScores.length > 0 ? (
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
