class GeminiAIServices {
    constructor(){
        this.interviewContexts = new Map(); // Store interview contexts for each user
    }

    async generateIntroduction(interviewType, settings) {
        // In a real implementation, this would call Gemini API
        
        const difficultyLevel = settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1);
        const focusAreas = settings.focus.length > 0 
          ? `with focus on ${settings.focus.join(', ')}` 
          : '';
        
        let introduction = '';
        
        switch (interviewType) {
          case 'technical':
            introduction = `Welcome to your ${difficultyLevel} level Technical Interview ${focusAreas}. I'll be asking you questions to assess your programming skills and problem-solving abilities. Let's start with your first question: Could you explain the difference between REST and GraphQL APIs, and when you might choose one over the other?`;
            break;
          case 'behavioral':
            introduction = `Welcome to your ${difficultyLevel} level Behavioral Interview ${focusAreas}. I'll be asking questions about your past experiences to understand how you handle various workplace situations. Let's begin: Tell me about a time when you faced a significant challenge in a project. How did you approach it, and what was the outcome?`;
            break;
          case 'hr':
            introduction = `Welcome to your ${difficultyLevel} level HR Interview ${focusAreas}. I'll be asking general questions about your background, career goals, and fit for potential roles. Let's start: Could you walk me through your professional background and what you're looking for in your next role?`;
            break;
          default:
            introduction = `Welcome to your interview session. Let's start with your first question: Tell me about your professional background and what brings you to this interview today?`;
        }
        return introduction;
  }
  async processUserResponse(userMessage, interviewType, interviewData) {
    // In a real implementation, this would call Gemini API
    // Here we'll simulate the AI response and feedback
    
    // Generate feedback using STAR method
    const feedback = this.generateSTARFeedback(userMessage, interviewType);
    
    // Generate follow-up question based on interview type and context
    const response = this.generateFollowUpQuestion(userMessage, interviewType, interviewData);
    
    return {
      response,
      feedback,
      lastQuestion: this.getLastQuestion(interviewType, interviewData)
    };
  }

  generateSTARFeedback(answer, interviewType) {
    // Simulate AI analysis of the STAR components in the answer
    const starAnalysis = {
      situation: this.extractSTARComponent(answer, 'situation'),
      task: this.extractSTARComponent(answer, 'task'),
      action: this.extractSTARComponent(answer, 'action'),
      result: this.extractSTARComponent(answer, 'result')
    };
    
    // Generate feedback based on the completeness of STAR elements
    const strengths = [];
    const improvements = [];
    
    // Simulate identifying strengths
    if (starAnalysis.situation) strengths.push("Good context setting");
    if (starAnalysis.action && starAnalysis.action.length > 30) strengths.push("Detailed description of actions taken");
    if (starAnalysis.result) strengths.push("Clear articulation of outcomes");
    if (answer.length > 100) strengths.push("Comprehensive response");
    
    // Ensure at least one strength is provided
    if (strengths.length === 0) strengths.push("Addressed the question directly");
    
    // Simulate identifying areas for improvement
    if (!starAnalysis.situation || starAnalysis.situation.length < 20) 
      improvements.push("Provide more context about the situation");
    if (!starAnalysis.task || starAnalysis.task.length < 15) 
      improvements.push("Clarify your specific responsibilities or objectives");
    if (!starAnalysis.action || starAnalysis.action.length < 25) 
      improvements.push("Elaborate on the specific actions you took");
    if (!starAnalysis.result || starAnalysis.result.length < 20) 
      improvements.push("Quantify results or explain the impact of your actions");
    
    // Ensure we don't overwhelm with too many improvement points
    if (improvements.length > 3) improvements.length = 3;
    
    // If no improvements needed, add a general suggestion
    if (improvements.length === 0) 
      improvements.push("Consider adding more specific examples to strengthen your answer");
    
    // Simulate a rating based on completeness of STAR and answer quality
    const starElementsPresent = Object.values(starAnalysis).filter(Boolean).length;
    let rating = 5 + starElementsPresent; // Base rating of 5, +1 for each STAR element
    
    // Adjust rating based on answer length and quality (simplified simulation)
    if (answer.length > 200) rating += 1;
    if (answer.length < 50) rating -= 2;
    
    // Clamp rating between 1-10
    rating = Math.max(1, Math.min(10, rating));
    
    return {
      star: starAnalysis,
      strengths,
      improvements,
      rating
    };
  }

  extractSTARComponent(text, component) {
    // In a real implementation, this would use Gemini to intelligently extract STAR components
    // Here we'll use a simplified approach to simulate extraction
    
    const keywords = {
      situation: ['situation', 'context', 'background', 'faced', 'setting', 'scenario', 'environment'],
      task: ['task', 'goal', 'objective', 'assigned', 'responsibility', 'needed to', 'had to'],
      action: ['action', 'approach', 'steps', 'implemented', 'strategy', 'method', 'executed', 'did', 'took', 'handled'],
      result: ['result', 'outcome', 'achievement', 'accomplishment', 'impact', 'effect', 'learned', 'benefit', 'success']
    };
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Look for sentences that might contain the component based on keywords
    const relevantSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return keywords[component].some(keyword => lowerSentence.includes(keyword));
    });
    
    if (relevantSentences.length > 0) {
      return relevantSentences.join('. ') + '.';
    }
    
    return null;
  }

  generateFollowUpQuestion(userMessage, interviewType, interviewData) {
    // In a real implementation, this would use Gemini to generate contextual follow-up questions
    // Here we'll provide pre-defined questions based on interview type and progress
    
    const questionNumber = interviewData.questions.length;
    const difficulty = interviewData.settings.difficulty;
    
    // Hardcoded follow-up questions based on interview type
    const questions = {
      technical: [
        "How would you approach debugging a complex performance issue in a web application?",
        "Explain your experience with CI/CD pipelines and how they improve development workflows.",
        "What's your approach to ensuring code quality and maintainability in team projects?",
        "Describe a time when you had to make a technical decision that involved trade-offs.",
        "How do you stay current with industry trends and new technologies?",
        "Tell me about a challenging technical problem you solved recently.",
        "How would you design a scalable system for a service that needs to handle millions of requests?",
        "What considerations would you make when designing an API for external use?"
      ],
      behavioral: [
        "Describe a situation where you had to influence someone without having direct authority.",
        "Tell me about a time when you received difficult feedback. How did you respond?",
        "Give an example of a goal you didn't meet and how you handled it.",
        "Describe a time when you had to adapt quickly to a significant change.",
        "Tell me about a time when you needed to deliver results under a tight deadline.",
        "How have you handled disagreements with team members?",
        "Describe a situation where you took initiative on a project.",
        "Tell me about a time when you failed. What did you learn from it?"
      ],
      hr: [
        "What are your salary expectations for this role?",
        "Why are you interested in joining our company specifically?",
        "How would you describe your ideal work environment?",
        "Where do you see yourself professionally in five years?",
        "What are your greatest strengths and areas for improvement?",
        "How do you handle stress and pressure?",
        "What questions do you have about the company or role?",
        "Why are you looking to leave your current position?"
      ]
    };
    
    // Additional questions for higher difficulty levels
    const advancedQuestions = {
      technical: [
        "How would you architect a microservices solution for a complex e-commerce platform?",
        "Explain your approach to handling distributed systems challenges like eventual consistency."
      ],
      behavioral: [
        "Describe a scenario where you had to make an unpopular decision and how you managed stakeholder expectations.",
        "Tell me about a time when you had to lead a project with inadequate resources."
      ],
      hr: [
        "How do you evaluate the success of your current role?",
        "What leadership style brings out your best performance?"
      ]
    };
    
    // Select question based on progress and difficulty
    const questionPool = questions[interviewType] || questions.behavioral;
    let nextQuestion = "";
    
    if (difficulty === 'hard' && questionNumber > 3 && Math.random() > 0.5) {
      // Occasionally use advanced questions for hard difficulty
      const advancedPool = advancedQuestions[interviewType] || advancedQuestions.behavioral;
      nextQuestion = advancedPool[questionNumber % advancedPool.length];
    } else {
      nextQuestion = questionPool[questionNumber % questionPool.length];
    }
    
    // Add a personalized response before the next question
    const acknowledgments = [
      "Thank you for sharing that.",
      "I appreciate your detailed response.",
      "That's helpful context.",
      "Thanks for explaining your approach."
    ];
    
    const transitions = [
      "Now, let's move to another question.",
      "Let's explore another area.",
      "Moving forward with our interview,",
      "For my next question,"
    ];
    
    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    const transition = transitions[Math.floor(Math.random() * transitions.length)];
    
    return `${acknowledgment} ${transition} ${nextQuestion}`;
  }

  getLastQuestion(interviewType, interviewData) {
    // This returns the last question asked to associate with the user's answer
    // In a real implementation with Gemini, this would be tracked in the conversation
    const questions = interviewData.questions;
    
    if (questions.length === 0) {
      // Return the default first question based on interview type
      switch (interviewType) {
        case 'technical':
          return "Could you explain the difference between REST and GraphQL APIs, and when you might choose one over the other?";
        case 'behavioral':
          return "Tell me about a time when you faced a significant challenge in a project. How did you approach it, and what was the outcome?";
        case 'hr':
          return "Could you walk me through your professional background and what you're looking for in your next role?";
        default:
          return "Tell me about your professional background and what brings you to this interview today?";
      }
    }
    
    // Extract the last question from the AI's response
    const lastResponse = questions[questions.length - 1].text;
    return lastResponse;
  }

  async generateInterviewResults(interview) {
    // In a real implementation, this would use Gemini to analyze the entire interview
    // Here we'll simulate the results generation
    
    // Calculate overall score based on individual question ratings
    let totalScore = 0;
    let questionCount = 0;
    
    interview.questions.forEach(question => {
      if (question.feedback && question.feedback.rating) {
        totalScore += question.feedback.rating;
        questionCount++;
      }
    });
    
    const overallScore = questionCount > 0 ? Math.round((totalScore / questionCount) * 10) / 10 : 5;
    
    // Generate skill scores
    const skillScores = {
      communication: this.calculateSkillScore(interview, 'communication'),
      technical: interview.type === 'technical' ? this.calculateSkillScore(interview, 'technical') : null,
      problemSolving: this.calculateSkillScore(interview, 'problemSolving'),
      behavioral: interview.type === 'behavioral' ? this.calculateSkillScore(interview, 'behavioral') : null,
      leadership: this.calculateSkillScore(interview, 'leadership')
    };
    
    // Remove null scores
    Object.keys(skillScores).forEach(key => {
      if (skillScores[key] === null) {
        delete skillScores[key];
      }
    });
    
    // Compile strengths and weaknesses
    const strengths = this.compileStrengths(interview);
    const weaknesses = this.compileWeaknesses(interview);
    
    // Generate feedback summary
    const feedback = this.generateFeedbackSummary(interview, overallScore);
    
    // Generate improvement tips
    const improvementTips = this.generateImprovementTips(interview, weaknesses);
    
    return {
      overallScore,
      feedback,
      skillScores,
      strengths,
      weaknesses,
      improvementTips
    };
  }

  calculateSkillScore(interview, skillType) {
    // This would be much more sophisticated with actual Gemini integration
    // Here we'll use a simplified approach
    
    const baseScore = 6; // Start with a default score
    let modifier = 0;
    
    // Analyze questions and responses to calculate skill score
    interview.questions.forEach(question => {
      if (!question.feedback) return;
      
      // Apply modifiers based on feedback
      const feedback = question.feedback;
      
      // Communication skill modifiers
      if (skillType === 'communication') {
        if (question.answer && question.answer.length > 100) modifier += 0.2;
        if (question.answer && question.answer.length < 50) modifier -= 0.3;
        if (feedback.star.situation && feedback.star.result) modifier += 0.3;
      }
      
      // Technical skill modifiers
      if (skillType === 'technical' && interview.type === 'technical') {
        if (feedback.rating > 7) modifier += 0.4;
        if (feedback.rating < 5) modifier -= 0.4;
      }
      
      // Problem solving modifiers
      if (skillType === 'problemSolving') {
        if (feedback.star.action) modifier += 0.2;
        if (feedback.strengths.some(s => s.toLowerCase().includes('detail'))) modifier += 0.3;
      }
      
      // Behavioral skill modifiers
      if (skillType === 'behavioral' && interview.type === 'behavioral') {
        if (Object.values(feedback.star).filter(Boolean).length >= 3) modifier += 0.5;
        if (Object.values(feedback.star).filter(Boolean).length <= 1) modifier -= 0.4;
      }
      
      // Leadership modifiers
      if (skillType === 'leadership') {
        if (question.answer && question.answer.toLowerCase().includes('lead')) modifier += 0.3;
        if (question.answer && question.answer.toLowerCase().includes('team')) modifier += 0.2;
        if (feedback.star.action && feedback.star.result) modifier += 0.2;
      }
    });
    
    // Calculate final score with limits
    const finalScore = Math.max(1, Math.min(10, baseScore + modifier));
    return Math.round(finalScore * 10) / 10;
  }

  compileStrengths(interview) {
    // Collect strengths mentioned in feedback
    const allStrengths = [];
    
    interview.questions.forEach(question => {
      if (question.feedback && question.feedback.strengths) {
        allStrengths.push(...question.feedback.strengths);
      }
    });
    
    // Count frequencies of each strength
    const strengthCounts = {};
    allStrengths.forEach(strength => {
      strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedStrengths = Object.entries(strengthCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([strength]) => strength);
    
    // Return top strengths (up to 5)
    return sortedStrengths.slice(0, 5);
  }

  compileWeaknesses(interview) {
    // Collect improvement areas mentioned in feedback
    const allWeaknesses = [];
    
    interview.questions.forEach(question => {
      if (question.feedback && question.feedback.improvements) {
        allWeaknesses.push(...question.feedback.improvements);
      }
    });
    
    // Count frequencies
    const weaknessCounts = {};
    allWeaknesses.forEach(weakness => {
      weaknessCounts[weakness] = (weaknessCounts[weakness] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWeaknesses = Object.entries(weaknessCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([weakness]) => weakness);
    
    // Return top weaknesses (up to 4)
    return sortedWeaknesses.slice(0, 4);
  }

  generateFeedbackSummary(interview, overallScore) {
    // This would be generated by Gemini in a real implementation
    // Here we'll provide templated feedback based on score
    
    let summary = '';
    
    if (overallScore >= 8) {
      summary = `Excellent interview performance! You demonstrated strong communication skills and provided comprehensive answers using the STAR method effectively. Your responses were well-structured, specific, and showcased your experience convincingly.`;
    } else if (overallScore >= 6) {
      summary = `Good interview performance. You provided solid answers to most questions and generally followed the STAR method. There are some opportunities to enhance your responses with more specific examples and quantifiable results.`;
    } else {
      summary = `You've shown potential in this interview, but there are several areas for improvement. Focus on structuring your answers using the STAR method, providing more specific examples, and clearly articulating the results of your actions.`;
    }
    
    // Add interview type specific feedback
    switch (interview.type) {
      case 'technical':
        summary += ` Your technical knowledge came across ${overallScore >= 7 ? 'well' : 'adequately'}, but continue to practice explaining complex concepts clearly and relating them to real-world applications.`;
        break;
      case 'behavioral':
        summary += ` Your behavioral examples were ${overallScore >= 7 ? 'compelling' : 'somewhat general'}. ${overallScore < 7 ? 'Consider preparing more specific stories that highlight your skills and achievements.' : ''}`;
        break;
      case 'hr':
        summary += ` Your career narrative was ${overallScore >= 7 ? 'clear and purposeful' : 'present but could be more focused'}. ${overallScore < 7 ? 'Work on aligning your background and goals more explicitly with potential roles.' : ''}`;
        break;
    }
    
    return summary;
  }

  generateImprovementTips(interview, weaknesses) {
    // Generate specific improvement tips based on identified weaknesses
    // In a real implementation, Gemini would provide tailored advice
    
    const generalTips = [
      "Practice the STAR method to structure your answers: Situation, Task, Action, Result",
      "Quantify your achievements whenever possible (e.g., 'increased sales by 20%')",
      "Prepare 5-7 strong examples that can be adapted to different questions",
      "Record yourself in mock interviews to improve your delivery and identify verbal tics"
    ];
    
    const specificTips = weaknesses.map(weakness => {
      // Convert weakness to specific actionable tip
      if (weakness.includes("context")) {
        return "Start answers by clearly establishing the situation and its importance";
      } else if (weakness.includes("specific")) {
        return "Include precise details, numbers, and timeframes in your examples";
      } else if (weakness.includes("responsibilities")) {
        return "Clearly define your role and objectives in each scenario you describe";
      } else if (weakness.includes("actions")) {
        return "Focus more on what YOU specifically did rather than what the team accomplished";
      } else if (weakness.includes("results")) {
        return "Always end your answers by explaining the positive outcomes and impact of your actions";
      } else {
        return weakness; // Use the weakness itself if no specific mapping
      }
    });
    
    // Combine general and specific tips, avoiding duplicates
    const allTips = [...specificTips];
    
    // Add general tips if we need more
    for (const tip of generalTips) {
      if (allTips.length >= 5) break;
      if (!allTips.includes(tip)) {
        allTips.push(tip);
      }
    }
    
    return allTips;
  }
}

// Add this at the bottom of the file
const aiService = new GeminiAIServices();
export default aiService;