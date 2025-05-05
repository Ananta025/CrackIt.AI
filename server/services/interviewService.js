import Interview from '../models/interviewModel.js';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Generative AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const interviewService = {
  // Create a new interview
  createInterview: async (userId, type, settings) => {
    try {
      const maxQuestions = getMaxQuestionsByDuration(settings.duration);

      const interview = new Interview({
        user: userId,
        type,
        settings,
        status: 'in-progress',
        startTime: new Date(),
        questions: [],
        currentQuestionIndex: 0,
        totalQuestions: maxQuestions
      });

      await interview.save();
      console.log(`Created new interview with ID ${interview._id}, max questions: ${maxQuestions}`);
      return interview;
    } catch (error) {
      console.error('Error creating interview:', error);
      throw new Error('Failed to create interview');
    }
  },

  // Generate interview question based on role and settings
  generateQuestion: async (interview, message, askedQuestions = [], isLastQuestion = false, questionIndex = null, answerAnalysis = null) => {
    try {
      const { type, settings } = interview;
      const role = settings.focus && settings.focus.length > 0 ? settings.focus[0] : 'software engineer';
      const difficulty = settings.difficulty || 'medium';

      if (isLastQuestion) {
        const response = {
          message: "That's all from my side. You did great!\n\nWe'll now analyze your responses and show you a summary. Thanks for taking the mock interview!",
          isLastQuestion: true
        };

        interview.status = 'completed';
        interview.endTime = new Date();
        interview.duration = Math.round((interview.endTime - interview.startTime) / (1000 * 60));
        await interview.save();

        return response;
      }

      const targetIndex = questionIndex !== null ? questionIndex : (interview.currentQuestionIndex || 0);

      console.log(`Generating question for position ${targetIndex + 1}`);

      const isFirstQuestion = targetIndex === 0;
      const isSecondQuestion = targetIndex === 1;

      const candidateName = settings.userName || "there";
      const extractedName = isSecondQuestion && interview.questions[0]?.answer ? 
                            extractNameFromIntroduction(interview.questions[0].answer) : null;
      
      const personName = extractedName || candidateName;

      let interviewContext = "This is the first question of the interview.";
      let lastAnswer = "";
      let answerAnalysisText = "";
      let topicsToFollow = [];
      let mentionedSkills = new Set();
      let mentionedProjects = new Set();
      let previousAnswerQuality = null;
      let personalizedIntro = "";
      let mentionedTechnologies = [];

      if (!isFirstQuestion) {
        if (targetIndex > 0 && interview.questions[targetIndex - 1]?.text) {
          interviewContext = `The previous question was: "${interview.questions[targetIndex - 1].text}"`;

          if (interview.questions[targetIndex - 1]?.answer) {
            const previousAnswer = interview.questions[targetIndex - 1].answer;
            lastAnswer = `The candidate answered: "${previousAnswer.substring(0, 300)}${previousAnswer.length > 300 ? '...' : ''}"`;

            previousAnswerQuality = interview.questions[targetIndex - 1]?.answerMetadata?.analysis || 
                                    analyzeAnswerContent(previousAnswer, interview.questions[targetIndex - 1].text);
            
            // For transition from introduction to technical questions
            if (isSecondQuestion && targetIndex === 1) {
              const introAnalysis = previousAnswerQuality || 
                                    analyzeAnswerContent(previousAnswer, interview.questions[targetIndex - 1].text);
              
              const isMinimalIntro = introAnalysis.type === 'minimal_intro' || 
                                    (previousAnswer.length < 30 && !extractedName);
              
              let backgroundItems = [];
              if (!isMinimalIntro) {
                backgroundItems = extractBackgroundFromIntroduction(previousAnswer);
                mentionedTechnologies = extractTechnologiesFromIntroduction(previousAnswer);
              }
              
              if (isMinimalIntro) {
                personalizedIntro = `Let's start our discussion.`;
              } else if (backgroundItems.length > 0) {
                personalizedIntro = `Thanks for sharing your ${backgroundItems.join(", ")} with me, ${personName}.`;
              } else {
                personalizedIntro = `Thanks for the introduction, ${personName}.`;
              }
            }
            
            answerAnalysisText = analyzeAnswer(previousAnswer, role, previousAnswerQuality);

            const extractedTopics = extractTopicsFromAnswer(previousAnswer);
            topicsToFollow = extractedTopics.slice(0, 3);
          }
        }

        const previousAnswers = [];
        for (let i = 0; i < targetIndex; i++) {
          if (interview.questions[i] && interview.questions[i].answer) {
            previousAnswers.push({
              question: interview.questions[i].text,
              answer: interview.questions[i].answer
            });

            const answer = interview.questions[i].answer.toLowerCase();

            const techSkills = ['javascript', 'python', 'react', 'node', 'express', 'mongodb', 'sql', 
                               'kubernetes', 'cloud', 'typescript', 'angular', 'vue',
                               'aws', 'azure', 'gcp', 'docker', 'java', 'c#', '.net', 'php'];

            techSkills.forEach(tech => {
              if (answer.includes(tech)) mentionedSkills.add(tech);
            });

            const softSkills = ['communication', 'teamwork', 'leadership', 'problem solving', 'agile', 
                              'scrum', 'kanban', 'testing', 'ci/cd', 'devops', 'frontend',
                              'backend', 'fullstack', 'performance', 'scalability', 'design'];

            softSkills.forEach(skill => {
              if (answer.includes(skill)) mentionedSkills.add(skill);
            });

            if (answer.includes('project') || answer.includes('application') || answer.includes('app')) {
              const projectMatches = answer.match(/(?:project|application|app|developed|built|created)\s+(\w+(?:\s+\w+){0,3})/gi);
              if (projectMatches) {
                projectMatches.forEach(match => mentionedProjects.add(match.trim()));
              }
            }
          }
        }
      }

      const cleanedAskedQuestions = askedQuestions
        .filter(q => q && q.length > 10)
        .map(q => q.substring(0, 100));

      const questionsToCover = determineTopicsToAsk(targetIndex, interview.totalQuestions, role, mentionedSkills, difficulty);

      let prompt = `You are Rahul, a professional Software Engineer interviewer at Cisco.
      
      Interview type: ${type}
      Difficulty level: ${difficulty}
      Question number: ${targetIndex + 1} of ${interview.totalQuestions}
      Role: ${role}
      
      ${interviewContext}
      ${lastAnswer}
      
      ${answerAnalysisText ? `Analysis of the candidate's last answer: ${answerAnalysisText}` : ''}
      ${previousAnswerQuality ? `The candidate's response quality: ${previousAnswerQuality.type}. ${previousAnswerQuality.message}` : ''}
      ${topicsToFollow.length > 0 ? `Topics to potentially follow-up on: ${topicsToFollow.join(', ')}` : ''}
      ${questionsToCover.length > 0 ? `Important topics that should be covered: ${questionsToCover.join(', ')}` : ''}
      
      I need you to generate a high-quality ${type} interview question for a ${difficulty}-level ${role} position.
      
      Guidelines:
      1. Make the question relevant to the ${role} role and match the ${difficulty} difficulty level
      2. Ensure it differs from previous questions: ${JSON.stringify(cleanedAskedQuestions)}
      3. ${lastAnswer ? 'Create a natural follow-up based on the candidate\'s previous answer when possible' : 'Focus on real-world skills and practical problem-solving'}
      4. If the candidate mentioned specific technologies or projects, consider including one of them
      ${previousAnswerQuality && previousAnswerQuality.type === 'dont_know' ? 
        "5. Since the candidate didn't know the answer to the previous question, ask a SIMPLER question on a DIFFERENT topic" : ''}
      ${previousAnswerQuality && previousAnswerQuality.type === 'inappropriate' ? 
        "5. The candidate used inappropriate language. Respond professionally but remind them about professional interview conduct before asking the next question" : ''}
      ${previousAnswerQuality && previousAnswerQuality.type === 'off_topic' ? 
        "5. The candidate's previous answer was off-topic. Politely redirect them to stay focused on relevant topics" : ''}
      
      VERY IMPORTANT FORMAT REQUIREMENTS:
      1. NEVER use emojis or special characters
      2. Use plain text only
      3. Your question must fit the interview position (question #${targetIndex + 1})
      4. Only introduce yourself in the first question, nowhere else
      
      ${isFirstQuestion ? 
        `For the first question use EXACTLY this format:
        "Hi ${candidateName}! I'm Rahul, a Software Engineer at Cisco. Nice to meet you. Let's start your mock interview — nothing to worry about, just be yourself.\\n\\nSo, to begin with, can you briefly introduce yourself?"` 
        : isSecondQuestion ?
        `For the second question use EXACTLY this format:
        "${personalizedIntro || `Great, thank you for that.`} Let's dive into some technical questions to understand your skills better.\\n\\n${
          mentionedTechnologies.length > 0 ?
          `I see you mentioned ${mentionedTechnologies.slice(0, 3).join(', ')}. Could you tell me more about your experience with these technologies?` :
          `Can you explain your experience with ${role} and what technologies you're most comfortable with?`
        }"` 
        : `For question #${targetIndex + 1}, use one of these exact formats WITHOUT mentioning your name:
        ${previousAnswerQuality && previousAnswerQuality.type === 'inappropriate' ?
          `"I'd like to remind you that this is a professional interview setting. Let's maintain appropriate language.\\n\\n[Your well-formed question here]"
          "I understand you may feel frustrated, but let's keep our discussion professional.\\n\\n[Your well-formed question here]"` :
         previousAnswerQuality && previousAnswerQuality.type === 'dont_know' ?
          `"That's alright if you're not familiar with that topic. Let's try something different.\\n\\n[Your simpler question on a different topic]"
          "No problem. Let's move to another area.\\n\\n[Your simpler question on a different topic]"` :
         previousAnswerQuality && previousAnswerQuality.type === 'off_topic' ?
          `"Let's focus on the interview questions.\\n\\n[Your well-formed question here]"
          "To better assess your skills, I need to ask you about specific topics.\\n\\n[Your well-formed question here]"` :
         lastAnswer ? 
          `"Thanks for explaining that. I see you mentioned [something they mentioned]. Let's explore that further —\\n[Your follow-up question here]"
          "That's interesting about [something they mentioned]. Now tell me —\\n[Your well-formed question here]"` : ''
        }
        "Nice explanation. Now, let's talk about [topic] —\\n[Your well-formed question here]"
        "Alright. Imagine [scenario related to ${role}] — [Your well-formed question here]"
        "Now switching gears a bit…\\n[Your well-formed question here]"
        "Cool. Let's go into [relevant topic] —\\n[Your well-formed question here]"
        ${targetIndex >= interview.totalQuestions - 2 ? '"For one of our last questions:\\n[Your well-formed question here]"' : ''}`
      }`;

      let question = await generateWithRetries(prompt, role, candidateName, isFirstQuestion, isSecondQuestion);

      question = cleanupQuestion(question, candidateName, role, isFirstQuestion, isSecondQuestion);

      console.log(`Updating question at index ${targetIndex}: ${question.substring(0, 50)}...`);

      while (interview.questions.length <= targetIndex) {
        interview.questions.push({
          text: null,
          answer: null,
          feedback: null,
          status: 'pending'
        });
      }

      interview.questions[targetIndex].text = question;
      interview.questions[targetIndex].status = 'generated';

      await interview.save();
      console.log(`Updated question at index ${targetIndex}, total questions now: ${interview.questions.length}`);

      return {
        message: question,
        questionIndex: targetIndex,
        isLastQuestion: false
      };
    } catch (error) {
      console.error('Error generating question:', error);
      throw new Error(`Failed to generate interview question: ${error.message}`);
    }
  },

  processAnswer: async (interviewId, message, questionIndex) => {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      if (interview.status !== 'in-progress') {
        throw new Error('Interview is not in progress');
      }

      if (!interview.questions) {
        console.log(`Creating questions array for interview ${interviewId}`);
        interview.questions = [];
      }

      if (questionIndex < 0) {
        throw new Error(`Invalid question index: ${questionIndex}. Index cannot be negative.`);
      }

      if (questionIndex >= interview.questions.length) {
        console.log(`Question at index ${questionIndex} doesn't exist yet. Creating placeholder.`);
        while (interview.questions.length <= questionIndex) {
          interview.questions.push({
            text: null,
            answer: null,
            feedback: null,
            status: 'pending'
          });
        }
      }

      if (!interview.questions[questionIndex].text) {
        console.log(`Question text at index ${questionIndex} is missing. Adding placeholder.`);
        interview.questions[questionIndex].text = "Untitled question";
        interview.questions[questionIndex].status = 'generated';
      }

      console.log(`Saving answer for question #${questionIndex + 1}`);
      interview.questions[questionIndex].answer = message;
      interview.questions[questionIndex].status = 'answered';

      // Analyze the answer content and store the analysis
      const answerAnalysis = analyzeAnswerContent(message, interview.questions[questionIndex].text);
      const answerLength = message.length;
      const keyTerms = extractKeyTerms(message);
      const answerMetadata = {
        length: answerLength,
        keyTerms: keyTerms,
        analysis: answerAnalysis,
        timestamp: new Date()
      };

      try {
        interview.questions[questionIndex].answerMetadata = answerMetadata;
      } catch (err) {
        console.log("Schema doesn't support answerMetadata, continuing without it");
      }

      const nextIndex = findNextUnansweredQuestionIndex(interview);
      if (nextIndex !== -1 && nextIndex !== interview.currentQuestionIndex) {
        console.log(`Advancing current question index from ${interview.currentQuestionIndex} to ${nextIndex}`);
        interview.currentQuestionIndex = nextIndex;
      }

      await interview.save();

      return { 
        success: true,
        message: "Answer saved successfully",
        nextQuestionIndex: nextIndex,
        answerAnalysis: answerAnalysis // Return the analysis to use for next question
      };
    } catch (error) {
      console.error('Error processing answer:', error);
      throw new Error(`Failed to process answer: ${error.message}`);
    }
  },

  getInterviewById: async (interviewId) => {
    try {
      console.log(`Fetching interview details for ID: ${interviewId}`);

      if (!interviewId) {
        throw new Error('Interview ID is required');
      }

      const interview = await Interview.findById(interviewId);

      if (!interview) {
        throw new Error(`Interview with ID ${interviewId} not found`);
      }

      console.log('Found interview:', {
        id: interview._id,
        user: interview.user,
        status: interview.status,
        questionsCount: interview.questions ? interview.questions.length : 0
      });

      return interview;
    } catch (error) {
      console.error('Error fetching interview:', error);
      throw new Error(`Failed to fetch interview: ${error.message}`);
    }
  },

  advanceToNextQuestion: async (interviewId) => {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      const nextIndex = findNextUnansweredQuestionIndex(interview);
      if (nextIndex === -1) {
        return {
          success: false,
          message: "No more questions available",
          interviewEnded: true
        };
      }

      interview.currentQuestionIndex = nextIndex;
      await interview.save();

      return {
        success: true,
        currentQuestionIndex: nextIndex,
        isLastQuestion: nextIndex >= interview.totalQuestions - 1
      };
    } catch (error) {
      console.error('Error advancing question:', error);
      throw new Error(`Failed to advance to next question: ${error.message}`);
    }
  },

  // Generate overall interview results
  generateResults: async (interviewId) => {
    try {
      console.log(`Generating results for interview ${interviewId}`);
      
      // Find the interview
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }
      
      if (interview.status !== 'completed') {
        interview.status = 'completed';
        interview.endTime = new Date();
        interview.duration = Math.round((interview.endTime - interview.startTime) / (1000 * 60));
      }
      
      // Skip if results already exist
      if (interview.results && interview.results.overallScore) {
        console.log(`Results already exist for interview ${interviewId}`);
        return interview;
      }
      
      // Create initial results structure if it doesn't exist
      if (!interview.results) {
        interview.results = {
          overallScore: 0,
          feedback: '',
          skillScores: {
            communication: 0,
            technical: 0,
            problemSolving: 0,
            behavioral: 0,
            leadership: 0
          },
          strengths: [],
          weaknesses: [],
          improvementTips: [],
          detailedAnalysis: {},
          careerInsights: [],
          learningResources: []
        };
      }
      
      // Generate feedback for each answered question that doesn't have feedback
      const answeredQuestions = interview.questions.filter(q => 
        q && q.answer && q.answer.trim().length > 0 && (!q.feedback || !q.feedback.rating)
      );
      
      console.log(`Generating feedback for ${answeredQuestions.length} answered questions`);
      
      // Calculate scores based on answer quality
      let totalScore = 0;
      let technicalScore = 0;
      let communicationScore = 0;
      let problemSolvingScore = 0;
      let behavioralScore = 0;
      let leadershipScore = 0;
      let questionCount = 0;
      
      // Track keywords and themes for detailed analysis
      const commonKeywords = {};
      const detailedStrengths = {};
      const detailedWeaknesses = {};
      
      // Process each question to provide feedback
      for (let i = 0; i < interview.questions.length; i++) {
        const question = interview.questions[i];
        
        // Skip questions without text or answer
        if (!question || !question.text || !question.answer) {
          continue;
        }
        
        questionCount++;
        
        // Generate feedback using simple heuristics if no AI available
        if (!question.feedback || !question.feedback.rating) {
          const answerQuality = evaluateAnswerQuality(question.answer, question.text);
          const questionType = determineQuestionType(question.text);
          
          // Track keywords for content analysis
          const extractedKeywords = extractKeyTerms(question.answer);
          extractedKeywords.forEach(keyword => {
            commonKeywords[keyword] = (commonKeywords[keyword] || 0) + 1;
          });
          
          // Create feedback structure with more detailed analysis
          question.feedback = {
            strengths: generateStrengths(question.answer, answerQuality),
            improvements: generateImprovements(question.answer, answerQuality),
            rating: answerQuality.score,
            star: {
              situation: answerQuality.hasSituation ? 'Present' : 'Missing',
              task: answerQuality.hasTask ? 'Present' : 'Missing',
              action: answerQuality.hasAction ? 'Present' : 'Missing',
              result: answerQuality.hasResult ? 'Present' : 'Missing'
            },
            keyInsight: generateKeyInsight(question.answer, question.text, answerQuality, questionType),
            suggestedTopics: generateSuggestedTopics(question.answer, question.text, questionType)
          };
          
          // Track strengths and weaknesses for detailed analysis
          question.feedback.strengths.forEach(strength => {
            detailedStrengths[strength] = (detailedStrengths[strength] || 0) + 1;
          });
          
          question.feedback.improvements.forEach(improvement => {
            detailedWeaknesses[improvement] = (detailedWeaknesses[improvement] || 0) + 1;
          });
          
          // Update skill scores based on question type
          switch(questionType) {
            case 'technical':
              technicalScore += answerQuality.score;
              problemSolvingScore += answerQuality.score * 0.5;
              break;
            case 'behavioral':
              behavioralScore += answerQuality.score;
              communicationScore += answerQuality.score * 0.5;
              break;
            case 'leadership':
              leadershipScore += answerQuality.score;
              behavioralScore += answerQuality.score * 0.3;
              break;
            default:
              communicationScore += answerQuality.score;
          }
          
          totalScore += answerQuality.score;
        } else {
          // If feedback already exists, just use the existing rating
          totalScore += question.feedback.rating || 5;
          
          // Ensure all questions have key insight and suggested topics
          if (!question.feedback.keyInsight) {
            const questionType = determineQuestionType(question.text);
            question.feedback.keyInsight = generateKeyInsight(
              question.answer, 
              question.text, 
              { score: question.feedback.rating || 5 }, 
              questionType
            );
          }
          
          if (!question.feedback.suggestedTopics) {
            question.feedback.suggestedTopics = generateSuggestedTopics(
              question.answer, 
              question.text,
              determineQuestionType(question.text)
            );
          }
        }
      }
      
      // Calculate overall score and normalize skill scores
      const overallScore = questionCount > 0 ? Math.round((totalScore / questionCount) * 10) / 10 : 5;
      
      // Normalize skill scores (avoid division by zero)
      const normalizeDivisor = Math.max(1, questionCount);
      const normalizedSkills = {
        technical: Math.round((technicalScore / normalizeDivisor) * 10) / 10,
        communication: Math.round((communicationScore / normalizeDivisor) * 10) / 10,
        problemSolving: Math.round((problemSolvingScore / normalizeDivisor) * 10) / 10,
        behavioral: Math.round((behavioralScore / normalizeDivisor) * 10) / 10,
        leadership: Math.round((leadershipScore / normalizeDivisor) * 10) / 10
      };
      
      // Generate overall feedback
      let overallFeedback = generateOverallFeedback(overallScore, interview.settings?.focus?.[0] || 'software engineer');
      
      // Generate detailed analysis
      const detailedAnalysis = {
        keywordFrequency: commonKeywords,
        starRatings: calculateStarRatings(interview.questions),
        answerLengths: calculateAnswerLengths(interview.questions),
        topicCoverage: analyzeTopicCoverage(interview.questions, interview.settings?.focus?.[0] || 'software engineer')
      };
      
      // Get strengths and weaknesses
      const skillEntries = Object.entries(normalizedSkills);
      const sortedByStrength = [...skillEntries].sort((a, b) => b[1] - a[1]);
      const sortedByWeakness = [...skillEntries].sort((a, b) => a[1] - b[1]);
      
      const strengths = sortedByStrength.slice(0, 3)
        .filter(entry => entry[1] >= 6)
        .map(entry => formatSkillFeedback(entry[0], true));
      
      const weaknesses = sortedByWeakness.slice(0, 3)
        .filter(entry => entry[1] < 7)
        .map(entry => formatSkillFeedback(entry[0], false));
      
      // Generate improvement tips
      const improvementTips = generateImprovementTips(normalizedSkills);
      
      // Generate career insights based on performance
      const careerInsights = generateCareerInsights(
        normalizedSkills, 
        interview.settings?.focus?.[0] || 'software engineer',
        interview.settings?.difficulty || 'medium'
      );
      
      // Generate learning resource recommendations
      const learningResources = generateLearningResources(
        weaknesses,
        normalizedSkills,
        interview.settings?.focus?.[0] || 'software engineer'
      );
      
      // Update interview results with enhanced data
      interview.results = {
        overallScore,
        feedback: overallFeedback,
        skillScores: normalizedSkills,
        strengths: strengths.length > 0 ? strengths : ["Structured communication"],
        weaknesses: weaknesses.length > 0 ? weaknesses : ["Providing specific examples"],
        improvementTips: improvementTips,
        detailedAnalysis,
        careerInsights,
        learningResources
      };
      
      // Save the interview with all feedback
      await interview.save();
      console.log(`Results generated for interview ${interviewId} with score ${overallScore}`);
      
      return interview;
    } catch (error) {
      console.error('Error generating results:', error);
      throw new Error(`Failed to generate interview results: ${error.message}`);
    }
  },

  // Get interview history for a user
  getInterviewHistory: async (userId) => {
    try {
      console.log(`Fetching interview history for user: ${userId}`);
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Find all interviews for this user, sort by most recent first
      const interviews = await Interview.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to reasonable number
        
      console.log(`Found ${interviews.length} interviews for user ${userId}`);
      return interviews;
    } catch (error) {
      console.error('Error fetching interview history:', error);
      throw new Error(`Failed to fetch interview history: ${error.message}`);
    }
  },

  // New function to analyze introductions or other answers
  analyzeIntroduction: async (message, questionText) => {
    try {
      return analyzeAnswerContent(message, questionText);
    } catch (error) {
      console.error('Error analyzing introduction:', error);
      // Provide a safe default if analysis fails
      return {
        type: 'normal',
        message: 'Standard introduction provided',
        details: message.length > 300 ? 'Detailed introduction' : 'Brief introduction'
      };
    }
  },
};

// Helper functions

function extractKeyTerms(answer) {
  if (!answer) return [];

  const text = answer.toLowerCase();
  const terms = [];

  const technicalTerms = [
    'javascript', 'python', 'java', 'typescript', 'c#', 'php', 'go', 'ruby',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'rails',
    'mongodb', 'postgresql', 'mysql', 'sql', 'nosql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'serverless',
    'ci/cd', 'jenkins', 'github', 'gitlab', 'bitbucket', 'git',
    'rest', 'graphql', 'api', 'microservices', 'architecture', 'design patterns',
    'testing', 'tdd', 'agile', 'scrum', 'kanban', 'devops'
  ];

  technicalTerms.forEach(term => {
    if (text.includes(term)) terms.push(term);
  });

  const softSkillTerms = [
    'communication', 'teamwork', 'collaboration', 'leadership', 'management',
    'problem solving', 'critical thinking', 'time management', 'organization',
    'mentoring', 'conflict resolution'
  ];

  softSkillTerms.forEach(term => {
    if (text.includes(term)) terms.push(term);
  });

  return terms;
}

function extractTechnologiesFromIntroduction(answer) {
  if (!answer || answer.length < 30) return [];
  
  const answerLower = answer.toLowerCase();
  
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[.!,]?$/i.test(answerLower)) {
    return [];
  }
  
  const technologies = [];
  
  const techKeywords = [
    'javascript', 'python', 'java', 'typescript', 'c#', 'php', 'golang', 'ruby', 'swift',
    'react', 'angular', 'vue', 'svelte', 'node', 'express', 'django', 'flask', 'spring',
    'mongodb', 'postgresql', 'mysql', 'sql', 'nosql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'serverless',
    'ci/cd', 'jenkins', 'github', 'gitlab', 'bitbucket', 'git',
    'rest', 'graphql', 'api', 'microservices', 'architecture', 'design patterns',
    'android', 'ios', 'mobile', 'responsive', 'ux', 'ui', 'web', 'testing', 'devops'
  ];
  
  techKeywords.forEach(tech => {
    if (answerLower.includes(tech)) {
      if (!technologies.some(t => t.includes(tech) || tech.includes(t))) {
        technologies.push(tech);
      }
    }
  });
  
  const experiencePatterns = [
    /experience (?:with|in) (\w+(?:\s+\w+){0,2})/gi,
    /worked (?:with|on) (\w+(?:\s+\w+){0,2})/gi,
    /using (\w+(?:\s+\w+){0,2})/gi,
    /developed (?:in|with|using) (\w+(?:\s+\w+){0,2})/gi
  ];
  
  experiencePatterns.forEach(pattern => {
    const matches = [...answerLower.matchAll(pattern)];
    matches.forEach(match => {
      if (match && match[1]) {
        const tech = match[1].trim();
        if (tech.length > 2 && !['the', 'and', 'for', 'that', 'with'].includes(tech)) {
          if (!technologies.includes(tech)) {
            technologies.push(tech);
          }
        }
      }
    });
  });
  
  return technologies;
}

function analyzeAnswer(answer, role, answerQuality = null) {
  if (!answer) return "";

  const analysis = [];

  if (answerQuality) {
    switch (answerQuality.type) {
      case 'dont_know':
        analysis.push("The candidate indicated they don't know the answer to this question.");
        break;
      case 'inappropriate':
        analysis.push("The candidate used inappropriate language in their response.");
        break;
      case 'off_topic':
        analysis.push("The candidate's response was not related to the question asked.");
        break;
      default:
        if (answer.length < 100) {
          analysis.push("The candidate provided a brief response that lacks detail.");
        } else if (answer.length > 500) {
          analysis.push("The candidate provided a detailed response.");
        }
    }
  } else {
    if (answer.length < 100) {
      analysis.push("The candidate provided a brief response that lacks detail.");
    } else if (answer.length > 500) {
      analysis.push("The candidate provided a detailed response.");
    }
  }

  const technicalTerms = ['algorithm', 'framework', 'library', 'architecture', 'pattern', 
                         'optimization', 'performance', 'scaling', 'database', 'cloud'];
  const containsTechnical = technicalTerms.some(term => answer.toLowerCase().includes(term));
  if (containsTechnical) {
    analysis.push("The candidate mentioned technical concepts.");
  }

  const experienceTerms = ['years', 'experience', 'worked on', 'developed', 'built', 'created', 'managed', 'led'];
  const containsExperience = experienceTerms.some(term => answer.toLowerCase().includes(term));
  if (containsExperience) {
    analysis.push("The candidate referenced their professional experience.");
  }

  const problemSolvingTerms = ['solved', 'solution', 'approach', 'resolved', 'fixed', 'implemented', 'improved'];
  const containsProblemSolving = problemSolvingTerms.some(term => answer.toLowerCase().includes(term));
  if (containsProblemSolving) {
    analysis.push("The candidate discussed problem-solving approaches.");
  }

  if (answer.toLowerCase().includes('example') || 
      answer.toLowerCase().includes('instance') || 
      answer.toLowerCase().includes('case study')) {
    analysis.push("The candidate provided specific examples.");
  }

  if (answer.toLowerCase().includes('star') || 
      (answer.toLowerCase().includes('situation') && answer.toLowerCase().includes('result'))) {
    analysis.push("The candidate followed STAR format.");
  }

  return analysis.join(' ');
}

function analyzeAnswerContent(answer, question) {
  if (!answer) return { 
    type: 'empty',
    message: 'No answer provided'
  };

  const answerLower = answer.toLowerCase().trim();
  
  // Check for "I don't know" type responses
  if (/^(i don't know|not sure|no idea|i have no clue|unsure|can't answer)/i.test(answerLower) || 
      (answerLower.length < 20 && !question.includes("introduce yourself"))) {
    return {
      type: 'dont_know',
      message: 'Candidate lacks knowledge on this topic',
      details: answerLower.length < 20 ? 'Very brief answer' : 'Explicitly stated lack of knowledge'
    };
  }
  
  // Check for abusive or inappropriate content
  const abusivePatterns = /\b(fuck|shit|damn|bitch|asshole|cunt|dick|wtf|stfu)\b/i;
  if (abusivePatterns.test(answerLower)) {
    return {
      type: 'inappropriate',
      message: 'Candidate used inappropriate language',
      details: 'Answer contains abusive language'
    };
  }
  
  // Don't check relevance for introduction question, but check if introduction is too brief
  if (question.toLowerCase().includes("introduce yourself")) {
    // Check if introduction is just a greeting with no actual introduction
    if (answerLower.length < 30 || 
        /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[.!,]?$/i.test(answerLower)) {
      return {
        type: 'minimal_intro',
        message: 'Candidate provided only a brief greeting',
        details: 'No substantial introduction content'
      };
    }
    
    return {
      type: 'normal',
      message: 'Candidate provided an introduction',
      details: answerLower.length > 300 ? 'Detailed introduction' : 'Brief introduction'
    };
  }
  
  const questionKeywords = extractKeywords(question.toLowerCase());
  const answerKeywords = extractKeywords(answerLower);
  
  const matches = questionKeywords.filter(keyword => 
    answerKeywords.some(answerWord => 
      answerWord.includes(keyword) || keyword.includes(answerWord)
    )
  );
  
  if (matches.length < Math.min(2, questionKeywords.length * 0.2)) {
    return {
      type: 'off_topic',
      message: 'Answer appears unrelated to the question',
      details: 'Few or no matching keywords between question and answer'
    };
  }
  
  return {
    type: 'normal',
    message: 'Standard answer provided',
    details: answerLower.length > 300 ? 'Detailed answer' : 'Brief but relevant answer'
  };
}

function extractTopicsFromAnswer(answer) {
  if (!answer) return [];

  const topics = [];
  const text = answer.toLowerCase();

  const topicKeywords = {
    'frontend': ['react', 'angular', 'vue', 'javascript', 'html', 'css', 'ui', 'ux', 'design'],
    'backend': ['api', 'server', 'database', 'node', 'express', 'django', 'flask', 'spring'],
    'devops': ['ci/cd', 'pipeline', 'docker', 'kubernetes', 'deployment', 'aws', 'azure', 'cloud'],
    'architecture': ['design', 'patterns', 'microservices', 'monolith', 'serverless', 'scale'],
    'testing': ['unit test', 'integration test', 'test-driven', 'tdd', 'quality assurance', 'qa'],
    'agile': ['scrum', 'sprint', 'kanban', 'jira', 'backlog', 'user story'],
    'data': ['database', 'sql', 'nosql', 'mongodb', 'postgres', 'mysql', 'redis']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      topics.push(topic);
    }
  }

  const projectMatches = answer.match(/(?:project|application|app|developed|built|created)\s+(\w+(?:\s+\w+){0,3})/gi);
  if (projectMatches && projectMatches.length > 0) {
    topics.push('projects');
  }

  if (/(junior|entry|associate|graduate)/i.test(text)) {
    topics.push('junior level experience');
  } else if (/(senior|lead|architect|manager)/i.test(text)) {
    topics.push('senior level experience');
  }

  return topics;
}

function extractNameFromIntroduction(answer) {
  if (!answer) return null;
  
  const namePatterns = [
    /my name is (\w+)/i,
    /I'm (\w+)/i,
    /I am (\w+)/i,
    /This is (\w+)/i,
    /^(\w+) here/i,
    /^Hi,?\s+I'm (\w+)/i,
    /^Hello,?\s+I'm (\w+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = answer.match(pattern);
    if (match && match[1]) {
      const lowercaseName = match[1].toLowerCase();
      const commonWords = ['here', 'just', 'glad', 'happy', 'excited', 'looking', 'going'];
      if (!commonWords.includes(lowercaseName) && lowercaseName.length > 1) {
        return match[1];
      }
    }
  }
  
  return null;
}

function extractBackgroundFromIntroduction(answer) {
  if (!answer || answer.length < 30) return [];
  const answerLower = answer.toLowerCase();
  
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)[.!,]?$/i.test(answerLower)) {
    return [];
  }
  
  const background = [];
  
  const expPatterns = [
    /(\d+)\s*(?:\+\s*)?years? of experience/i,
    /working (?:for|since) (\d+)\s*(?:\+\s*)?years/i,
    /(\d+)\s*(?:\+\s*)? years in/i
  ];
  
  for (const pattern of expPatterns) {
    const match = answer.match(pattern);
    if (match && match[1]) {
      const years = parseInt(match[1]);
      if (years > 0) {
        background.push(`${years} years of experience`);
        break;
      }
    }
  }
  
  if (answerLower.includes("graduate") || 
      answerLower.includes("degree") ||
      answerLower.includes("university") ||
      answerLower.includes("college") ||
      answerLower.includes("bachelor") ||
      answerLower.includes("master") ||
      answerLower.includes("phd")) {
    background.push("educational background");
  }
  
  if (answerLower.includes("currently") || answerLower.includes("working as") || answerLower.includes("work as")) {
    background.push("current role");
  }
  
  const techTerms = extractKeyTerms(answer);
  if (techTerms.length > 0) {
    background.push("technical skills");
  }
  
  return background;
}

function determineTopicsToAsk(currentIndex, totalQuestions, role, mentionedSkills, difficulty) {
  const roleLower = role.toLowerCase();
  const progress = currentIndex / totalQuestions;
  const topics = [];

  if (progress < 0.3) {
    if (roleLower.includes('frontend') && !mentionedSkills.has('javascript')) {
      topics.push('JavaScript fundamentals');
    } else if (roleLower.includes('backend') && !mentionedSkills.has('api')) {
      topics.push('API design');
    } else if (roleLower.includes('full')) {
      topics.push('frontend-backend integration');
    }
  } else if (progress >= 0.3 && progress < 0.7) {
    if (difficulty === 'hard' || difficulty === 'medium') {
      topics.push('system design');
    }

    topics.push('problem-solving approach');

    if (!mentionedSkills.has('testing')) {
      topics.push('testing strategies');
    }
  } else {
    if (!mentionedSkills.has('teamwork')) {
      topics.push('team collaboration');
    }

    if (difficulty === 'hard') {
      topics.push('leadership experience');
    }

    topics.push('project challenges');
  }

  return topics;
}

function getMaxQuestionsByDuration(duration) {
  switch (duration) {
    case 'short': return 5;
    case 'medium': return 8;
    case 'long': return 12;
    default: return 8;
  }
}

// Generate a question with retries
async function generateWithRetries(prompt, role, candidateName, isFirstQuestion, isSecondQuestion) {
  let retries = 0;
  const maxRetries = 5;
  
  while (retries < maxRetries) {
    try {
      console.log(`Attempt ${retries + 1} to generate question`);
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        generationConfig: {
          temperature: 0.4, // Lower temperature for more consistent output
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      const question = response.text.trim();
      
      console.log(`Generated (first 60 chars): "${question.substring(0, 60)}..."`);
      
      const isValid = validateQuestionFormat(question, isFirstQuestion, isSecondQuestion);
      if (isValid) {
        return question;
      }
      
      console.log(`Invalid question format on attempt ${retries + 1}. Retrying...`);
    } catch (error) {
      console.error(`Error on attempt ${retries + 1}:`, error);
    }
    
    retries++;
    await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
  }
  
  console.warn("All question generation attempts failed. Using fallback question");
  return getFallbackQuestion(role, candidateName, isFirstQuestion, isSecondQuestion);
}

// Validate question format
function validateQuestionFormat(question, isFirstQuestion, isSecondQuestion) {
  if (!question || question.length < 20) {
    console.log("Question validation failed: Too short or empty question");
    return false;
  }
  
  if (isFirstQuestion) {
    const hasHi = question.includes("Hi");
    const hasRahul = question.includes("Rahul");
    const hasIntroduce = question.includes("introduce yourself");
    
    const isValid = hasHi && hasRahul && hasIntroduce;
    
    if (!isValid) {
      console.log(`First question validation failed: hasHi=${hasHi}, hasRahul=${hasRahul}, hasIntroduce=${hasIntroduce}`);
    }
    
    return isValid;
  }
  
  if (isSecondQuestion) {
    const hasAcknowledgment = 
      question.includes("Great, thank you") || 
      question.includes("Thanks for") || 
      question.includes("Thank you for") ||
      question.includes("Thanks for sharing") ||
      question.includes("Let's start our discussion");
      
    const hasTechnicalTransition = 
      question.includes("Let's dive into") || 
      question.includes("Let's talk about") ||
      question.includes("Let's get into") ||
      question.includes("Let's discuss") ||
      question.includes("Let's start with");
    
    const hasQuestion = 
      question.includes("Can you explain") || 
      question.includes("Tell me about") || 
      question.includes("Could you describe") ||
      question.includes("What technologies");
    
    const isValid = hasAcknowledgment && (hasTechnicalTransition || hasQuestion);
    
    if (!isValid) {
      console.log(`Second question validation failed: hasAcknowledgment=${hasAcknowledgment}, hasTechnicalTransition=${hasTechnicalTransition}, hasQuestion=${hasQuestion}`);
      console.log(`Second question content: "${question.substring(0, 100)}..."`);
    }
    
    return isValid;
  }
  
  const hasQuestionMark = question.includes("?");
  const hasQuestionWord = 
    question.toLowerCase().includes("describe") || 
    question.toLowerCase().includes("explain") || 
    question.toLowerCase().includes("tell me about") || 
    question.toLowerCase().includes("how would you");
  
  const isValid = hasQuestionMark || hasQuestionWord;
  
  if (!isValid) {
    console.log(`Regular question validation failed: hasQuestionMark=${hasQuestionMark}, hasQuestionWord=${hasQuestionWord}`);
  }
  
  return isValid;
}

// Get fallback question
function getFallbackQuestion(role, candidateName, isFirstQuestion, isSecondQuestion) {
  if (isFirstQuestion) {
    return `Hi ${candidateName}! I'm Rahul, a Software Engineer at Cisco. Nice to meet you. Let's start your mock interview — nothing to worry about, just be yourself.\n\nSo, to begin with, can you briefly introduce yourself?`;
  }
  
  if (isSecondQuestion) {
    return `Let's start our discussion. I'd like to dive into some technical questions to understand your skills better.\n\nCan you explain your experience with ${role} and what technologies you're most comfortable with?`;
  }
  
  const fallbacks = [
    `Nice explanation. Now, let's talk about problem-solving —\n\nCan you describe a challenging technical problem you faced as a ${role} and how you solved it?`,
    `Alright. Imagine your app is getting slower — what are 2-3 techniques you'd use to optimize performance in a large application?`,
    `Now switching gears a bit…\n\nHow do you stay updated with the latest technologies and trends in the ${role} field?`,
    `Cool. Let's go into collaboration —\n\nCan you describe your experience working in a team environment and how you handle conflicts?`
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Clean up question text
function cleanupQuestion(question, candidateName, role, isFirstQuestion, isSecondQuestion) {
  question = question.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/ug, '');
  
  question = question.replace(/\n{3,}/g, '\n\n').trim();
  
  if (!isFirstQuestion) {
    const patterns = [
      /Hi,?\s+I'm Rahul.*?\./i,
      /Hello,?\s+I'm Rahul.*?\./i,
      /This is Rahul.*?\./i,
      /My name is Rahul.*?\./i,
    ];
    
    for (const pattern of patterns) {
      question = question.replace(pattern, '');
    }
    
    question = question.trim().replace(/^[a-z]/, match => match.toUpperCase());
  }
  
  if (isFirstQuestion && (!question.includes("Hi") || !question.includes("Rahul"))) {
    return getFallbackQuestion(role, candidateName, true, false);
  }
  
  if (isSecondQuestion) {
    const hasTechnicalTransition = 
      question.includes("Let's dive into") || 
      question.includes("Let's talk about") ||
      question.includes("Let's get into") ||
      question.includes("Let's discuss") ||
      question.includes("Let's start with");
      
    if (!hasTechnicalTransition) {
      return getFallbackQuestion(role, candidateName, false, true);
    }
  }
  
  return question;
}

// Find next unanswered question
function findNextUnansweredQuestionIndex(interview) {
  for (let i = 0; i < interview.questions.length; i++) {
    const question = interview.questions[i];
    if (question && question.text && question.status !== 'answered') {
      return i;
    }
  }
  return -1;
}

// Helper function to evaluate answer quality
function evaluateAnswerQuality(answer, question) {
  if (!answer) return { score: 3, hasSituation: false, hasTask: false, hasAction: false, hasResult: false };
  
  const answerText = answer.toLowerCase();
  const questionText = question.toLowerCase();
  
  const length = answer.length;
  const hasTechnicalTerms = /\b(algorithm|function|method|class|component|api|database|code|system|architecture|design pattern)\b/i.test(answerText);
  const hasExamples = /\b(example|for instance|for example|such as|like when|once when|i worked on|i developed|i created)\b/i.test(answerText);
  const hasDetails = length > 300;
  
  const hasSituation = /\b(situation|context|background|when i|there was a time|in my previous|at my last|scenario)\b/i.test(answerText);
  const hasTask = /\b(task|goal|objective|needed to|had to|was asked to|responsible for|assigned to)\b/i.test(answerText);
  const hasAction = /\b(i implemented|i designed|i developed|i created|i wrote|i used|i applied|i resolved|i decided|i led)\b/i.test(answerText);
  const hasResult = /\b(result|outcome|achieved|improved|increased|decreased|reduced|enhanced|successfully|completed|delivered)\b/i.test(answerText);
  
  const isRelevant = checkRelevance(answerText, questionText);
  
  let score = 5;
  
  if (length < 100) score -= 2;
  else if (length > 500) score += 1;
  
  if (hasTechnicalTerms) score += 1;
  if (hasExamples) score += 1;
  if (hasDetails) score += 1;
  
  let starPoints = 0;
  if (hasSituation) starPoints += 0.5;
  if (hasTask) starPoints += 0.5;
  if (hasAction) starPoints += 0.5;
  if (hasResult) starPoints += 0.5;
  score += starPoints;
  
  if (!isRelevant) score -= 2;
  
  score = Math.max(1, Math.min(10, score));
  
  return { 
    score, 
    hasSituation, 
    hasTask, 
    hasAction, 
    hasResult
  };
}

// Check relevance of answer to question
function checkRelevance(answer, question) {
  const questionKeywords = extractKeywords(question);
  const answerKeywords = extractKeywords(answer);
  
  const matches = questionKeywords.filter(keyword => 
    answerKeywords.some(answerWord => 
      answerWord.includes(keyword) || keyword.includes(answerWord)
    )
  );
  
  return matches.length >= Math.min(2, questionKeywords.length * 0.3);
}

// Extract keywords from text
function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['what', 'when', 'where', 'which', 'while', 'would', 'could', 'should', 
                       'tell', 'explain', 'about', 'have', 'your', 'with', 'that', 'this',
                       'there', 'their', 'were', 'from', 'will', 'more', 'much', 'some'].includes(word));
}

// Generate strengths based on answer quality
function generateStrengths(answer, quality) {
  const strengths = [];
  
  if (quality.score >= 7) {
    strengths.push("Provided a comprehensive and well-structured answer");
  }
  
  if (answer.length > 300) {
    strengths.push("Good level of detail in your response");
  }
  
  if (quality.hasSituation && quality.hasResult) {
    strengths.push("Effectively used the STAR method to structure your answer");
  }
  
  if (/\b(specific|concrete|particular|detailed|measurable)\b/i.test(answer)) {
    strengths.push("Used specific examples to illustrate your points");
  }
  
  if (/\b(data|metrics|numbers|percent|percentage|improved|increased|reduced|enhanced)\b/i.test(answer)) {
    strengths.push("Included quantifiable results and metrics");
  }
  
  if (strengths.length < 2) {
    strengths.push("Clear communication style");
    if (strengths.length < 2) {
      strengths.push("Demonstrated relevant knowledge");
    }
  }
  
  return strengths.slice(0, 3);
}

// Generate improvement areas based on answer quality
function generateImprovements(answer, quality) {
  const improvements = [];
  
  if (answer.length < 200) {
    improvements.push("Provide more detailed explanations and examples");
  }
  
  if (!quality.hasSituation || !quality.hasTask || !quality.hasAction || !quality.hasResult) {
    improvements.push("Structure your answer using the STAR method (Situation, Task, Action, Result)");
  }
  
  if (!/\b(example|instance|scenario|case|situation)\b/i.test(answer.toLowerCase())) {
    improvements.push("Include specific examples from your experience");
  }
  
  if (!/\b(numbers|metrics|data|statistics|percent|percentage|quantify|measure)\b/i.test(answer.toLowerCase())) {
    improvements.push("Quantify your achievements with metrics when possible");
  }
  
  if (answer.split(/[.!?]/).length < 4) {
    improvements.push("Develop more complete narratives with beginning, middle, and end");
  }
  
  if (improvements.length < 2) {
    improvements.push("Focus more on your specific contributions rather than team efforts");
    if (improvements.length < 2) {
      improvements.push("Practice more concise and focused responses");
    }
  }
  
  return improvements.slice(0, 3);
}

// Format skill feedback
function formatSkillFeedback(skill, isStrength) {
  const skillMap = {
    technical: isStrength ? 
      "Strong technical knowledge and application" : 
      "Technical concept explanation could be improved",
    communication: isStrength ? 
      "Clear and effective communication" : 
      "Communication clarity and structure",
    problemSolving: isStrength ? 
      "Excellent problem-solving approach" : 
      "Problem-solving methodology needs development",
    behavioral: isStrength ? 
      "Strong behavioral examples" : 
      "More detailed behavioral scenarios needed",
    leadership: isStrength ? 
      "Demonstrated leadership qualities" : 
      "Leadership examples could be stronger"
  };
  
  return skillMap[skill] || (isStrength ? 
    `Strong ${skill} skills` : 
    `${skill.charAt(0).toUpperCase() + skill.slice(1)} needs improvement`);
}

// Generate improvement tips
function generateImprovementTips(skillScores) {
  const tips = [];
  
  if (skillScores.technical < 7) {
    tips.push("Review technical fundamentals and practice explaining concepts clearly");
  }
  
  if (skillScores.communication < 7) {
    tips.push("Practice structured responses using the STAR method");
  }
  
  if (skillScores.problemSolving < 7) {
    tips.push("Work on breaking down problems step-by-step when explaining solutions");
  }
  
  if (skillScores.behavioral < 7) {
    tips.push("Prepare more specific examples of past experiences to showcase your skills");
  }
  
  if (tips.length < 2) {
    tips.push("Quantify your achievements with metrics when discussing past experiences");
  }
  
  if (tips.length < 3) {
    tips.push("Focus on demonstrating business impact in your answers");
  }
  
  return tips;
}

// Determine question type from text
function determineQuestionType(questionText) {
  const text = questionText.toLowerCase();
  
  if (/\b(code|algorithm|design pattern|architecture|system design|technical|function|implementation|data structure)\b/i.test(text)) {
    return 'technical';
  }
  
  if (/\b(lead|team|manage|mentor|guided|directed|leadership|strategy|vision)\b/i.test(text)) {
    return 'leadership';
  }
  
  if (/\b(tell me about a time|situation|challenge|conflict|difficult|disagree|mistake|fail|success)\b/i.test(text)) {
    return 'behavioral';
  }
  
  return 'general';
}

// Generate key insight for an answer
function generateKeyInsight(answer, question, quality, questionType) {
  if (!answer || answer.length < 30) return "Answer was too brief to provide meaningful insight.";
  
  if (questionType === 'technical') {
    if (quality.score >= 8) {
      return "Your technical explanation demonstrates strong domain knowledge. Continue to tie your technical discussion to business value.";
    } else if (quality.score >= 5) {
      return "You have a solid technical foundation but could benefit from more concrete examples.";
    } else {
      return "Focus on building a stronger understanding of technical concepts and practice explaining them clearly.";
    }
  } else if (questionType === 'behavioral') {
    if (quality.score >= 8) {
      return "Your structured response using the STAR method effectively showcased your experience.";
    } else if (quality.score >= 5) {
      return "While you shared relevant experiences, aim to more clearly outline the situation, task, action, and result.";
    } else {
      return "Try using the STAR method to better structure your behavioral responses with specific examples.";
    }
  } else if (questionType === 'leadership') {
    if (quality.score >= 8) {
      return "You effectively demonstrated leadership qualities with strong examples.";
    } else if (quality.score >= 5) {
      return "You touched on leadership concepts, but could provide more specific instances of your impact.";
    } else {
      return "Focus on highlighting specific leadership experiences and their measurable outcomes.";
    }
  } else {
    if (quality.score >= 8) {
      return "Your answer was comprehensive and well-articulated.";
    } else if (quality.score >= 5) {
      return "Your answer addressed the question but could benefit from more specificity.";
    } else {
      return "Try to provide more detailed responses with concrete examples from your experience.";
    }
  }
}

// Generate suggested topics for further study
function generateSuggestedTopics(answer, question, questionType) {
  const questionText = question.toLowerCase();
  const answerText = answer.toLowerCase();
  const topics = [];
  
  if (questionType === 'technical') {
    if (questionText.includes('performance') && !answerText.includes('profil')) {
      topics.push("Performance profiling techniques");
    }
    if (questionText.includes('scale') && !answerText.includes('load balanc')) {
      topics.push("Load balancing strategies");
    }
    if (questionText.includes('security') && !answerText.includes('vulnerab')) {
      topics.push("Common security vulnerabilities");
    }
    if (questionText.includes('design') && !answerText.includes('pattern')) {
      topics.push("Design patterns");
    }
  } else if (questionType === 'behavioral') {
    if (questionText.includes('conflict') && !answerText.includes('resolv')) {
      topics.push("Conflict resolution techniques");
    }
    if (questionText.includes('challeng') && !answerText.includes('outcome')) {
      topics.push("Outcome-oriented storytelling");
    }
    if (questionText.includes('fail') && !answerText.includes('learn')) {
      topics.push("Learning from failures");
    }
  }
  
  if (topics.length === 0) {
    if (questionType === 'technical') {
      topics.push("Technical implementation details");
      topics.push("Industry best practices");
    } else if (questionType === 'behavioral') {
      topics.push("STAR method implementation");
      topics.push("Quantifying achievements");
    } else if (questionType === 'leadership') {
      topics.push("Leadership frameworks");
      topics.push("Team motivation strategies");
    } else {
      topics.push("Concrete examples from experience");
      topics.push("Structured communication");
    }
  }
  
  return topics.slice(0, 2);
}

// Calculate STAR ratings across all questions
function calculateStarRatings(questions) {
  const validQuestions = questions.filter(q => q && q.answer && q.feedback && q.feedback.star);
  
  if (validQuestions.length === 0) return {
    situation: 0,
    task: 0,
    action: 0,
    result: 0
  };
  
  let situationCount = 0;
  let taskCount = 0;
  let actionCount = 0;
  let resultCount = 0;
  
  validQuestions.forEach(q => {
    if (q.feedback.star.situation === 'Present') situationCount++;
    if (q.feedback.star.task === 'Present') taskCount++;
    if (q.feedback.star.action === 'Present') actionCount++;
    if (q.feedback.star.result === 'Present') resultCount++;
  });
  
  const totalQuestions = validQuestions.length;
  
  return {
    situation: Math.round((situationCount / totalQuestions) * 100),
    task: Math.round((taskCount / totalQuestions) * 100),
    action: Math.round((actionCount / totalQuestions) * 100),
    result: Math.round((resultCount / totalQuestions) * 100)
  };
}

// Calculate answer length statistics
function calculateAnswerLengths(questions) {
  const lengths = questions
    .filter(q => q && q.answer)
    .map(q => q.answer.length);
    
  if (lengths.length === 0) return { average: 0, min: 0, max: 0 };
  
  const sum = lengths.reduce((acc, len) => acc + len, 0);
  
  return {
    average: Math.round(sum / lengths.length),
    min: Math.min(...lengths),
    max: Math.max(...lengths)
  };
}

// Analyze topic coverage based on role
function analyzeTopicCoverage(questions, role) {
  const roleTopics = getRoleSpecificTopics(role);
  const coverage = {};
  
  roleTopics.forEach(topic => {
    coverage[topic] = 0;
  });
  
  questions.forEach(q => {
    if (!q || !q.answer) return;
    
    const answerLower = q.answer.toLowerCase();
    roleTopics.forEach(topic => {
      if (answerLower.includes(topic.toLowerCase())) {
        coverage[topic] += 1;
      }
    });
  });
  
  return coverage;
}

// Get role-specific topics
function getRoleSpecificTopics(role) {
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes('frontend')) {
    return ['JavaScript', 'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Responsive design', 'State management', 'Performance'];
  } else if (roleLower.includes('backend')) {
    return ['APIs', 'Database', 'Security', 'Scalability', 'Performance', 'Architecture', 'Caching', 'Microservices'];
  } else if (roleLower.includes('full')) {
    return ['Frontend', 'Backend', 'Database', 'API integration', 'Authentication', 'Deployment', 'Architecture'];
  } else if (roleLower.includes('devops')) {
    return ['CI/CD', 'Docker', 'Kubernetes', 'Cloud', 'Monitoring', 'Security', 'Automation'];
  } else {
    return ['Problem solving', 'Collaboration', 'Communication', 'Architecture', 'Code quality', 'Testing'];
  }
}

// Generate personalized overall feedback
function generateOverallFeedback(overallScore, role) {
  const rolePart = getRoleFeedbackPart(role);
  
  if (overallScore >= 8) {
    return `Excellent interview performance! You demonstrated strong ${rolePart} knowledge, good communication skills, and provided detailed answers with relevant examples. You're well-prepared for real interviews.`;
  } else if (overallScore >= 6) {
    return `Good interview performance overall. You have a solid foundation in ${rolePart} concepts and were able to answer most questions effectively. Some areas could benefit from more preparation and specific examples.`;
  } else if (overallScore >= 4) {
    return `You provided reasonable answers but need more preparation in key ${rolePart} areas. Try to be more specific, provide more concrete examples, and structure your answers more clearly.`;
  } else {
    return `You need more preparation before a real ${rolePart} interview. Focus on developing more detailed answers, practicing technical explanations, and using the STAR method to structure your responses.`;
  }
}

// Get role-specific feedback part
function getRoleFeedbackPart(role) {
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes('frontend')) {
    return 'frontend development';
  } else if (roleLower.includes('backend')) {
    return 'backend development';
  } else if (roleLower.includes('full')) {
    return 'full-stack';
  } else if (roleLower.includes('devops')) {
    return 'DevOps';
  } else if (roleLower.includes('data')) {
    return 'data science';
  } else if (roleLower.includes('qa')) {
    return 'quality assurance';
  } else {
    return 'technical';
  }
}

// Generate career insights based on performance
function generateCareerInsights(skillScores, role, difficulty) {
  const insights = [];
  const roleLower = role.toLowerCase();
  const avgScore = Object.values(skillScores).reduce((a, b) => a + b, 0) / Object.values(skillScores).length;
  
  if (roleLower.includes('frontend')) {
    if (skillScores.technical > 7) {
      insights.push("Your strong technical knowledge positions you well for frontend roles requiring deep JS expertise.");
    }
    if (skillScores.problemSolving > 7) {
      insights.push("Your problem-solving approach would be valuable in frontend architecture positions.");
    }
  } else if (roleLower.includes('backend')) {
    if (avgScore > 7 && difficulty === 'hard') {
      insights.push("Your performance indicates readiness for senior backend engineering roles.");
    }
  } else if (roleLower.includes('full')) {
    if (skillScores.technical > 6 && skillScores.problemSolving > 6) {
      insights.push("Your balanced skillset is well-suited for full-stack positions requiring versatility.");
    }
  }
  
  if (skillScores.leadership > 7) {
    insights.push("Consider roles with team leadership opportunities, as you communicate leadership experience effectively.");
  }
  
  if (skillScores.communication > 7 && skillScores.technical > 6) {
    insights.push("Your combination of communication skills and technical knowledge would be valuable in client-facing engineering roles.");
  }
  
  if (insights.length === 0) {
    if (avgScore > 6) {
      insights.push(`You demonstrate the core competencies needed for ${role} positions. Focus on highlighting your strengths during interviews.`);
    } else {
      insights.push(`With additional preparation in the highlighted areas, you'll be better positioned for ${role} opportunities.`);
    }
  }
  
  return insights;
}

// Generate learning resource recommendations
function generateLearningResources(weaknesses, skillScores, role) {
  const resources = [];
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes('frontend')) {
    if (skillScores.technical < 7) {
      resources.push({
        title: "Frontend Masters JavaScript Path",
        type: "course",
        description: "Comprehensive JavaScript courses from basics to advanced patterns"
      });
    }
    if (weaknesses.some(w => w.includes('design'))) {
      resources.push({
        title: "UI/UX Design for Developers",
        type: "book",
        description: "Learn design principles applicable to frontend development"
      });
    }
  } else if (roleLower.includes('backend')) {
    if (skillScores.technical < 7) {
      resources.push({
        title: "System Design Interview",
        type: "book",
        description: "Step-by-step guide to ace the system design interview"
      });
    }
    if (weaknesses.some(w => w.includes('performance'))) {
      resources.push({
        title: "Database Performance Optimization",
        type: "course",
        description: "Techniques for improving database query performance"
      });
    }
  }
  
  if (skillScores.communication < 7) {
    resources.push({
      title: "STAR Method for Technical Interviews",
      type: "article",
      description: "Framework for structuring behavioral interview responses"
    });
  }
  
  if (skillScores.behavioral < 7) {
    resources.push({
      title: "Cracking the Coding Interview",
      type: "book",
      description: "Comprehensive interview preparation guide with practice problems"
    });
  }
  
  if (resources.length < 3) {
    resources.push({
      title: "Behavioral Interview Preparation",
      type: "video",
      description: "Tips and examples for answering common behavioral questions"
    });
  }
  
  return resources.slice(0, 3);
}

export default interviewService;
