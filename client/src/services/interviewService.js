import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Configure axios with credentials
const api = axios.create({
  baseURL: `${API_URL}/api/interview`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('API request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  console.error('API response error:', error.response?.data || error.message);
  return Promise.reject(error);
});

class InterviewService {
  constructor() {
    // Keep track of question states
    this.interviewState = {
      currentInterview: null,
      askedQuestions: new Set(),
      questionSequence: [],
      currentIndex: 0,
      isFirstQuestion: true
    };
    
    // Listen for window/tab close to save state
    window.addEventListener('beforeunload', () => this.saveStateToStorage());
    
    // Try to restore state from localStorage
    this.loadStateFromStorage();
  }
  
  // Reset tracking when starting a new interview
  resetTracking() {
    console.log("Resetting interview tracking state");
    this.interviewState = {
      currentInterview: null,
      askedQuestions: new Set(),
      questionSequence: [],
      currentIndex: 0,
      isFirstQuestion: true
    };
    localStorage.removeItem('interviewState');
  }
  
  // Save state to localStorage
  saveStateToStorage() {
    if (this.interviewState.currentInterview) {
      const serializedState = {
        currentInterview: this.interviewState.currentInterview,
        askedQuestions: Array.from(this.interviewState.askedQuestions),
        questionSequence: this.interviewState.questionSequence,
        currentIndex: this.interviewState.currentIndex,
        isFirstQuestion: this.interviewState.isFirstQuestion
      };
      
      localStorage.setItem('interviewState', JSON.stringify(serializedState));
      console.log("Saved interview state to localStorage");
    }
  }
  
  // Load state from localStorage
  loadStateFromStorage() {
    const savedState = localStorage.getItem('interviewState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        this.interviewState = {
          ...parsedState,
          askedQuestions: new Set(parsedState.askedQuestions)
        };
        console.log("Restored interview state from localStorage");
      } catch (error) {
        console.error("Failed to restore interview state:", error);
      }
    }
  }
  
  // Start a new interview session
  async startInterview(type, settings) {
    try {
      // Reset tracking for new interview
      this.resetTracking();
      
      // Get user information for personalization
      const userId = localStorage.getItem('userId');
      
      // Extract first name from various localStorage sources
      let firstName = 'Candidate';
      
      // Try to get user name from localStorage
      const storedName = localStorage.getItem('userName') || 
                        localStorage.getItem('name') || 
                        localStorage.getItem('userFullName') ||
                        localStorage.getItem('userFirstName');
                        
      if (storedName) {
        // Extract first name from full name by splitting on space and taking first part
        firstName = storedName.split(' ')[0];
      } else if (userId) {
        // If we only have userId, check if we have user data stored as JSON
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            if (parsedData.firstName) {
              firstName = parsedData.firstName;
            } else if (parsedData.name) {
              firstName = parsedData.name.split(' ')[0];
            }
          } catch (e) {
            console.log('Failed to parse user data:', e);
          }
        }
      }
      
      console.log(`Starting ${type} interview for ${firstName} with settings:`, settings);
      
      const response = await api.post('/start', {
        user: userId,
        type,
        settings,
        userName: firstName
      });
      
      // Update interview state
      this.interviewState.currentInterview = response.data.interview._id;
      this.interviewState.isFirstQuestion = true;
      
      console.log('Interview started successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to start interview:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to start interview' };
    }
  }
  
  // Send a message/answer during an interview
  async sendMessage(interviewId, message, options = {}) {
    try {
      // Debug information
      console.log(`Sending message for interview ${interviewId}:`, message.substring(0, 50) + '...');
      
      // Extract options with defaults
      const {
        isLastQuestion = false,
        forceNew = false,
        questionIndex = this.interviewState.currentIndex,
        nextQuestionIndex = null
      } = options;
      
      // Get asked questions for repetition prevention
      const askedQuestions = Array.from(this.interviewState.askedQuestions);
      
      // Extract first name from various localStorage sources
      let firstName = 'Candidate';
      
      // Try to get user name from localStorage
      const storedName = localStorage.getItem('userName') || 
                        localStorage.getItem('name') || 
                        localStorage.getItem('userFullName') ||
                        localStorage.getItem('userFirstName');
                        
      if (storedName) {
        // Extract first name from full name by splitting on space and taking first part
        firstName = storedName.split(' ')[0];
      } else if (localStorage.getItem('userId')) {
        // If we only have userId, check if we have user data stored as JSON
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            if (parsedData.firstName) {
              firstName = parsedData.firstName;
            } else if (parsedData.name) {
              firstName = parsedData.name.split(' ')[0];
            }
          } catch (e) {
            console.log('Failed to parse user data:', e);
          }
        }
      }
      
      // Build request payload
      const payload = {
        interviewId,
        message,
        askedQuestions,
        isFirstQuestion: this.interviewState.isFirstQuestion,
        isLastQuestion,
        forceNew,
        questionIndex,
        nextQuestionIndex,
        userName: firstName
      };
      
      console.log(`Request payload: questionIndex=${questionIndex}, nextQuestionIndex=${nextQuestionIndex}, isFirst=${this.interviewState.isFirstQuestion}`);
      
      // Make API call with proper error handling
      try {
        const response = await api.post('/message', payload);
        
        // Process response
        const processedResponse = this.processResponse(response.data);
        
        // Update interview state
        if (this.interviewState.isFirstQuestion) {
          this.interviewState.isFirstQuestion = false;
        }
        
        // Add question to tracking
        if (processedResponse.message && typeof processedResponse.message === 'string') {
          // Skip tracking loading messages or short messages
          if (!processedResponse.message.includes("Generating") && 
              !processedResponse.message.includes("preparing") && 
              processedResponse.message.length > 20) {
            
            // Add to tracking
            const trackableText = this.extractTrackablePart(processedResponse.message);
            console.log(`Adding to asked questions: "${trackableText.substring(0, 30)}..."`);
            this.interviewState.askedQuestions.add(trackableText);
            
            // If this response includes a question index, use it
            if (response.data.questionIndex !== undefined) {
              this.interviewState.currentIndex = response.data.questionIndex;
            } else {
              // Otherwise, increment our own tracking
              this.interviewState.currentIndex++;
            }
          }
        }
        
        // Save state
        this.saveStateToStorage();
        
        return processedResponse;
      } catch (error) {
        // Special handling for specific errors
        if (error.response?.status === 400 && 
            error.response?.data?.message?.includes('not generated yet')) {
          console.log("Got question not generated yet error - retrying with force new");
          
          // Retry the request with forceNew flag
          const retryPayload = {
            ...payload,
            forceNew: true
          };
          
          const retryResponse = await api.post('/message', retryPayload);
          return this.processResponse(retryResponse.data);
        }
        
        throw error; // Re-throw other errors
      }
    } catch (error) {
      console.error('Failed to process message:', error.response?.data || error.message);
      
      // Special handling for completed interviews
      if (error.response?.data?.message === 'Interview is not in progress') {
        return {
          message: "The interview has been completed. Please view your results.",
          feedback: null,
          interviewEnded: true
        };
      }
      
      // If we got a 500 error specifically for question not found
      if (error.response?.status === 500 && 
          error.response?.data?.message?.includes('not found or not generated')) {
        return {
          message: "There was an error with the previous question. Starting a new question...",
          error: true
        };
      }
      
      throw error.response?.data || { message: 'Failed to process message' };
    }
  }
  
  // Extract trackable part of question (without greetings)
  extractTrackablePart(message) {
    // Don't track too much text - just keep it manageable
    if (message.length > 100) {
      message = message.substring(0, 100);
    }
    
    // For first questions, remove the introduction
    if (this.interviewState.isFirstQuestion) {
      // Remove standard greetings/intros
      const greetingPatterns = [
        /Hi.*?\./i,
        /Hello.*?\./i,
        /I'm Rahul.*?\./i,
        /I am Rahul.*?\./i,
        /Welcome.*?\./i,
        /Good (morning|afternoon|evening).*?\./i
      ];
      
      for (const pattern of greetingPatterns) {
        const match = message.match(pattern);
        if (match) {
          // Remove the greeting part
          message = message.substring(match[0].length).trim();
          break;
        }
      }
    }
    
    return message.trim();
  }
  
  // Process API response
  processResponse(responseData) {
    // Create a clean copy of the response
    const processed = { ...responseData };
    
    // Ensure message is a string
    if (processed.message) {
      if (typeof processed.message === 'object') {
        console.log('Converting message object to string:', processed.message);
        
        // Handle various object formats
        if (Object.keys(processed.message).length === 0) {
          processed.message = "Generating your next interview question...";
        } else if (processed.message.response) {
          processed.message = processed.message.response;
        } else if (processed.message.question) {
          processed.message = processed.message.question;
        } else {
          try {
            processed.message = JSON.stringify(processed.message);
          } catch (e) {
            processed.message = "Generating your next interview question...";
          }
        }
      }
    } else {
      // If message is missing, use response or default
      if (processed.response && typeof processed.response === 'string') {
        processed.message = processed.response;
      } else {
        processed.message = "Generating your next interview question...";
      }
    }
    
    // Clean up message
    if (typeof processed.message === 'string') {
      // Remove emojis
      processed.message = processed.message.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/ug, '');
      
      // Fix duplicate Rahul introductions in follow-up questions
      if (!this.interviewState.isFirstQuestion) {
        const patterns = [
          /Hi,?\s+I'm Rahul.*?\./i,
          /Hello,?\s+I'm Rahul.*?\./i,
          /This is Rahul.*?\./i,
          /My name is Rahul.*?\./i,
        ];
        
        for (const pattern of patterns) {
          processed.message = processed.message.replace(pattern, '');
        }
        
        // Fix capitalization after removal
        processed.message = processed.message.trim().replace(/^[a-z]/, match => match.toUpperCase());
      }
      
      // Clean up excessive newlines
      processed.message = processed.message.replace(/\n{3,}/g, '\n\n');
    }
    
    return processed;
  }
  
  // Get interview history
  async getInterviewHistory() {
    try {
      const response = await api.get('/history');
      
      // Validate the response format
      if (!response.data || (!response.data.interviews && !Array.isArray(response.data))) {
        console.warn('Invalid response format from server:', response.data);
        // Return a safe default structure
        return {
          interviews: [],
          stats: {
            totalInterviews: 0,
            completedInterviews: 0,
            averageScore: 0
          }
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching interview history:', error.response?.data || error.message);
      
      // Return a safe default rather than throwing
      return {
        interviews: [],
        stats: {
          totalInterviews: 0,
          completedInterviews: 0,
          averageScore: 0
        }
      };
    }
  }
  
  // Get detailed information about a specific interview
  async getInterview(interviewId) {
    try {
      console.log(`Fetching interview details for ID: ${interviewId}`);
      
      if (!interviewId) {
        throw new Error('Interview ID is required');
      }
      
      // Add a retry mechanism for better reliability
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          const response = await api.get(`/detail/${interviewId}`);
          
          // Validate response
          if (!response.data || !response.data.interview) {
            console.error('Invalid response format from server:', response.data);
            throw new Error('Invalid response format from server');
          }
          
          const interview = response.data.interview;
          
          // Validate the interview object has expected properties
          if (!interview._id || !interview.questions) {
            console.error('Interview data is missing required fields:', interview);
            throw new Error('Interview data is incomplete');
          }
          
          console.log('Interview data fetched successfully:', interview._id);
          return interview;
        } catch (error) {
          lastError = error;
          attempts++;
          
          // Only retry on network errors or 500 errors, not on 404/403
          const shouldRetry = !error.response || 
                             (error.response && error.response.status >= 500);
          
          if (attempts < maxAttempts && shouldRetry) {
            // Exponential backoff
            const delay = 1000 * Math.pow(2, attempts - 1);
            console.log(`Retry attempt ${attempts} for interview data in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            if (error.response && error.response.status === 404) {
              throw new Error('Interview not found');
            } else if (error.response && error.response.status === 403) {
              throw new Error('You do not have permission to access this interview');
            } else {
              throw error;
            }
          }
        }
      }
      
      // If we got here, all attempts failed
      throw lastError || new Error('Failed to fetch interview after multiple attempts');
    } catch (error) {
      console.error('Error fetching interview details:', error);
      throw new Error(`Failed to fetch interview details: ${error.message}`);
    }
  }
}

export default new InterviewService();
