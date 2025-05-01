import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

class GeminiAIServices {
  constructor() {
    // Initialize the Gemini API client with the new format
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.model = "gemini-2.0-flash"; // Updated to use newer model
    this.interviewContexts = new Map(); // Store interview contexts for each user
    this.setupPrompts();
  }

  setupPrompts() {
    // Interview type specific system prompts
    this.systemPrompts = {
      technical: `You are an expert technical interviewer for software engineering roles. 
Your goal is to conduct a professional technical interview following best practices:
1. Ask relevant questions based on the candidate's role focus
2. Start with fundamental concepts before moving to more complex topics
3. Follow up on the candidate's answers to explore their depth of understanding
4. Evaluate responses using the STAR method where applicable
5. Provide constructive feedback on technical accuracy, problem-solving approach, and communication
6. Adjust difficulty based on the candidate's responses`,

      behavioral: `You are an expert behavioral interviewer for professional roles.
Your goal is to assess a candidate's soft skills and past experiences using the STAR method:
1. Ask questions that reveal how candidates have handled specific workplace situations
2. Probe for details about the Situation, Task, Action, and Result in their responses
3. Focus on leadership, teamwork, conflict resolution, problem-solving, and adaptability
4. Provide feedback on the structure, specificity, and impact described in responses
5. Ask follow-up questions that build on previous answers to explore depth of experience`,

      hr: `You are an experienced HR interviewer conducting a screening interview.
Your goal is to evaluate the candidate's fit for roles they're applying to:
1. Ask questions about career goals, background, and motivations
2. Explore what they're looking for in their next role and company
3. Assess communication skills, self-awareness, and professional presentation
4. Provide feedback on interview performance and alignment with typical expectations
5. Focus on general skills and career narrative rather than deep technical knowledge`
    };

    // Interview difficulty modifiers
    this.difficultyModifiers = {
      easy: "Keep questions at an entry-level, focusing on fundamentals and common scenarios. Be encouraging in feedback.",
      medium: "Ask moderately challenging questions suitable for professionals with 2-3 years of experience. Be balanced in feedback.",
      hard: "Ask challenging questions that test deep understanding and edge cases. Suitable for senior candidates. Be rigorous but fair in feedback."
    };
  }

  /**
   * Get a new conversation for an interview
   * @param {string} interviewId - Unique interview identifier
   * @param {string} interviewType - Type of interview (technical, behavioral, hr)
   * @param {Object} settings - Interview settings
   * @returns {Object} - Conversation object
   */
  async getOrCreateConversation(interviewId, interviewType, settings) {
    if (!this.interviewContexts.has(interviewId)) {
      // Create system prompt based on interview type and settings
      const systemPrompt = `${this.systemPrompts[interviewType]}
${this.difficultyModifiers[settings.difficulty]}
${settings.focus && settings.focus.length > 0 ? `Focus areas for this interview: ${settings.focus.join(", ")}` : ""}

Please conduct this interview professionally. Start with an appropriate introduction and first question.
Each of your responses should have the following JSON structure:
{
  "question": "Your next interview question",
  "feedback": {
    "strengths": ["list of 2-3 specific strengths in the candidate's previous answer"],
    "improvements": ["list of 2-3 specific areas for improvement"],
    "rating": <numeric score between 1-10 based on answer quality>,
    "star": {
      "situation": "extracted situation component from answer or null",
      "task": "extracted task component from answer or null",
      "action": "extracted action component from answer or null",
      "result": "extracted result component from answer or null"
    }
  }
}

For the first question, include only the "question" field without feedback.`;

      // Create a new conversation
      const history = [
        { role: "user", text: `I'm ready to begin my ${interviewType} interview. Please give me my first question.` },
      ];

      this.interviewContexts.set(interviewId, { history });
      console.log(`Created new interview conversation for interview ID: ${interviewId}`);
    }

    return this.interviewContexts.get(interviewId);
  }

  /**
   * Generate first interview question
   * @param {string} interviewType - Type of interview
   * @param {Object} settings - Interview settings
   * @returns {string} - Introduction and first question
   */
  async generateIntroduction(interviewType, settings) {
    try {
      // Create system prompt
      const systemPrompt = `${this.systemPrompts[interviewType]}
${this.difficultyModifiers[settings.difficulty]}
${settings.focus && settings.focus.length > 0 ? `Focus areas for this interview: ${settings.focus.join(", ")}` : ""}

Generate a brief introduction and first question for a ${settings.difficulty} ${interviewType} interview.
Return ONLY the introduction and question in plain text format, keeping it concise and professional.`;

      // Use new format for generating content
      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: [
          { role: "system", text: systemPrompt },
          { role: "user", text: `I'm starting a ${interviewType} interview. Please provide an introduction and first question.` }
        ],
      });

      const result = response.text;
      console.log("Generated introduction:", result);
      return result;
    } catch (error) {
      console.error("Error generating introduction:", error);
      // Fallback to default introduction
      return this.getFallbackIntroduction(interviewType, settings);
    }
  }

  /**
   * Process a user's response and generate the next question with feedback
   */
  async processUserResponse(userMessage, interviewType, interviewData) {
    try {
      const interviewId = interviewData._id.toString();
      const settings = interviewData.settings;
      
      // Check if this is the first message
      const isFirstMessage = interviewData.questions.length === 0 || 
        (interviewData.questions.length === 1 && 
         userMessage.includes("ready to begin"));

      if (isFirstMessage) {
        // For the first message, just return an introduction with the first question
        const introduction = await this.generateIntroduction(interviewType, settings);
        return {
          response: introduction,
          feedback: null,
          lastQuestion: introduction
        };
      }

      // Get conversation context
      const history = this.getInterviewHistory(interviewId, interviewType, settings);
      
      // Add user message to history
      history.push({ role: "user", text: userMessage });
      
      // Prepare system prompt
      const systemPrompt = `${this.systemPrompts[interviewType]}
${this.difficultyModifiers[settings.difficulty]}
${settings.focus && settings.focus.length > 0 ? `Focus areas for this interview: ${settings.focus.join(", ")}` : ""}

Please conduct this interview professionally and provide feedback on the candidate's answer.
Each of your responses should be in the following JSON structure:
{
  "question": "Your next interview question",
  "feedback": {
    "strengths": ["list of 2-3 specific strengths in the candidate's previous answer"],
    "improvements": ["list of 2-3 specific areas for improvement"],
    "rating": <numeric score between 1-10 based on answer quality>,
    "star": {
      "situation": "extracted situation component from answer or null",
      "task": "extracted task component from answer or null",
      "action": "extracted action component from answer or null",
      "result": "extracted result component from answer or null"
    }
  }
}`;

      try {
        // Generate AI response with new format
        const response = await this.genAI.models.generateContent({
          model: this.model,
          contents: [
            { role: "system", text: systemPrompt },
            ...history
          ],
          generationConfig: {
            temperature: 0.7,
            responseFormat: { type: "json" }
          }
        });
        
        let responseText = response.text;
        
        // Parse the response as JSON
        let parsedResponse;
        try {
          // Clean up potential text around JSON
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            responseText = jsonMatch[0];
            parsedResponse = JSON.parse(responseText);
          } else {
            // If no JSON found, create a structured response from the text
            console.log("No JSON found in response, creating structured response from text");
            parsedResponse = {
              question: "What other aspects of this topic would you like to discuss?",
              feedback: this.generateFallbackFeedback(userMessage, interviewType)
            };
          }
        } catch (jsonError) {
          console.error("Error parsing Gemini response as JSON:", jsonError);
          console.log("Raw response:", responseText);
          
          // Use fallback parsing
          parsedResponse = this.extractResponseComponents(responseText);
        }
        
        // Extract components
        const nextQuestion = parsedResponse.question || "Could you elaborate more on your previous answer?";
        const feedback = parsedResponse.feedback || this.generateFallbackFeedback(userMessage, interviewType);
        
        // Store the updated history
        this.updateInterviewContext(interviewId, history, { role: "assistant", text: JSON.stringify({ question: nextQuestion, feedback }) });
        
        return {
          response: nextQuestion,
          feedback,
          lastQuestion: interviewData.questions.length > 0 ? 
            interviewData.questions[interviewData.questions.length - 1].text : 
            nextQuestion
        };
      } catch (aiError) {
        console.error("Error calling AI service:", aiError);
        return this.createFallbackResponse(userMessage, interviewType, interviewData);
      }
    } catch (error) {
      console.error("Error processing user response:", error);
      return this.createFallbackResponse(userMessage, interviewType, interviewData);
    }
  }
  
  /**
   * Create a fallback response when AI processing fails
   */
  createFallbackResponse(userMessage, interviewType, interviewData) {
    return {
      response: this.getFallbackQuestion(interviewType),
      feedback: this.generateFallbackFeedback(userMessage, interviewType),
      lastQuestion: interviewData.questions.length > 0 ? 
        interviewData.questions[interviewData.questions.length - 1].text : 
        this.getFallbackQuestion(interviewType)
    };
  }

  /**
   * Extract response components from text if JSON parsing fails
   */
  extractResponseComponents(text) {
    // Try to find a question in the text
    const lines = text.split(/[\n\r]+/);
    let questionText = "";
    
    // Look for a line that looks like a question (ends with ?)
    for (const line of lines) {
      if (line.trim().endsWith('?')) {
        questionText = line.trim();
        break;
      }
    }
    
    // If no question mark found, use the first substantial line
    if (!questionText) {
      for (const line of lines) {
        if (line.trim().length > 20) {
          questionText = line.trim();
          break;
        }
      }
    }
    
    // If still no question, use a default
    if (!questionText) {
      questionText = "Could you tell me more about your experience in this area?";
    }
    
    // Generate feedback based on text content
    const strengths = [];
    const improvements = [];
    
    // Simple heuristic: positive words likely indicate strengths
    if (text.match(/good|great|excellent|well done|impressive|clear|concise|detailed|thorough/i)) {
      strengths.push("You provided a clear response");
    }
    if (text.match(/example|specific|detail/i)) {
      strengths.push("You included specific examples");
    }
    if (text.match(/structure|organized|logical/i)) {
      strengths.push("Your answer was well-structured");
    }
    
    // Negative or improvement-oriented phrases likely indicate areas for improvement
    if (text.match(/could have|should|might want to|consider|try to|would be better/i)) {
      improvements.push("Consider providing more specific examples");
    }
    if (text.match(/unclear|vague|general|broad/i)) {
      improvements.push("Be more specific in your explanations");
    }
    if (text.match(/STAR|structure|organize/i)) {
      improvements.push("Structure your answer using the STAR method");
    }
    
    // Ensure we have at least one item in each category
    if (strengths.length === 0) strengths.push("You addressed the question");
    if (improvements.length === 0) improvements.push("Provide more context in your answers");
    
    // Estimate a rating based on the tone of the response
    let rating = 5; // Default middle rating
    
    // Adjust based on positive/negative language
    const positiveMatches = (text.match(/good|great|excellent|well|impressive|clear|concise|detailed|thorough/gi) || []).length;
    const negativeMatches = (text.match(/improve|should|could|better|unclear|vague|missing|lack/gi) || []).length;
    
    rating += Math.min(positiveMatches, 3); // Up to +3 for positive language
    rating -= Math.min(negativeMatches, 3); // Up to -3 for improvement language
    
    // Clamp between 2-9 to avoid extremes
    rating = Math.max(2, Math.min(9, rating));
    
    return {
      question: questionText,
      feedback: {
        strengths: strengths,
        improvements: improvements,
        rating: rating,
        star: {
          situation: null,
          task: null,
          action: null,
          result: null
        }
      }
    };
  }

  /**
   * Generate fallback feedback when AI processing fails
   */
  generateFallbackFeedback(answer, interviewType) {
    const wordCount = answer.split(/\s+/).length;
    const rating = wordCount > 100 ? 7 : wordCount > 50 ? 5 : 3;
    
    return {
      strengths: [
        "You provided a response to the question",
        wordCount > 100 ? "Your answer was detailed" : "You addressed the core question"
      ],
      improvements: [
        "Consider structuring your answer using the STAR method",
        "Add specific examples to strengthen your response",
        "Quantify results where possible"
      ],
      rating: rating,
      star: {
        situation: null,
        task: null,
        action: null,
        result: null
      }
    };
  }

  /**
   * Get a fallback question if Gemini API call fails
   */
  getFallbackQuestion(interviewType) {
    const questions = {
      technical: [
        "How would you approach debugging a complex performance issue in a web application?",
        "What's your approach to ensuring code quality and maintainability in team projects?",
        "How do you stay current with industry trends and new technologies?"
      ],
      behavioral: [
        "Describe a situation where you had to influence someone without having direct authority.",
        "Tell me about a time when you received difficult feedback. How did you respond?",
        "How have you handled disagreements with team members?"
      ],
      hr: [
        "What are you looking for in your next role?",
        "How would you describe your ideal work environment?",
        "What are your greatest strengths and areas for improvement?"
      ]
    };
    
    const questionPool = questions[interviewType] || questions.behavioral;
    return questionPool[Math.floor(Math.random() * questionPool.length)];
  }

  /**
   * Get or create interview context history
   */
  getInterviewHistory(interviewId, interviewType, settings) {
    if (!this.interviewContexts.has(interviewId)) {
      // Create a new context
      this.interviewContexts.set(interviewId, {
        history: [
          { role: "user", text: `I'm ready to begin my ${interviewType} interview. Please give me my first question.` }
        ]
      });
      console.log(`Created new interview context for interview ID: ${interviewId}`);
    }
    
    return this.interviewContexts.get(interviewId).history;
  }
  
  /**
   * Update interview context with new messages
   */
  updateInterviewContext(interviewId, history, newMessage) {
    if (!this.interviewContexts.has(interviewId)) {
      this.interviewContexts.set(interviewId, { history: [] });
    }
    
    this.interviewContexts.get(interviewId).history = [...history, newMessage];
  }

  /**
   * Generate comprehensive interview results
   */
  async generateInterviewResults(interview) {
    try {
      // Use Gemini to analyze the entire interview
      const interviewSummary = this.prepareInterviewSummary(interview);
      
      const systemPrompt = `You are an expert interview coach analyzing an interview.
Based on the interview summary provided, generate a comprehensive evaluation with the following structure:
{
  "overallScore": <number between 1-10>,
  "feedback": "<detailed paragraph with overall assessment>",
  "skillScores": {
    "communication": <number between 1-10>,
    "technical": <number between 1-10 or null if not applicable>,
    "problemSolving": <number between 1-10>,
    "behavioral": <number between 1-10 or null if not applicable>,
    "leadership": <number between 1-10>
  },
  "strengths": ["list of 3-5 key strengths demonstrated"],
  "weaknesses": ["list of 3-4 key areas for improvement"],
  "improvementTips": ["list of 5 specific actionable tips to improve"]
}`;

      // Generate interview results with new format
      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: [
          { role: "system", text: systemPrompt },
          { role: "user", text: `Please analyze this interview and provide feedback: ${interviewSummary}` }
        ],
        generationConfig: {
          temperature: 0.2,
          responseFormat: { type: "json" }
        }
      });

      // Handle the response
      const responseText = response.text;
      
      try {
        // Clean up potential text around JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResults = JSON.parse(jsonMatch[0]);
          console.log("Generated interview results successfully");
          return parsedResults;
        }
      } catch (error) {
        console.error("Error parsing interview results:", error);
      }
      
      // Fallback to manual calculation if parsing fails
      return this.calculateFallbackResults(interview);
      
    } catch (error) {
      console.error("Error generating interview results:", error);
      return this.calculateFallbackResults(interview);
    }
  }

  /**
   * Prepare a summary of the interview for analysis
   */
  prepareInterviewSummary(interview) {
    let summary = `Interview Type: ${interview.type}\n`;
    summary += `Difficulty Level: ${interview.settings.difficulty}\n`;
    summary += `Focus Areas: ${interview.settings.focus ? interview.settings.focus.join(", ") : "None specified"}\n\n`;
    
    // Add Q&A pairs
    interview.questions.forEach((q, index) => {
      summary += `Question ${index + 1}: ${q.text}\n`;
      summary += `Answer: ${q.answer}\n`;
      
      // Add feedback if available
      if (q.feedback) {
        summary += `Rating: ${q.feedback.rating}/10\n`;
        summary += `Strengths: ${q.feedback.strengths ? q.feedback.strengths.join(", ") : "None provided"}\n`;
        summary += `Improvements: ${q.feedback.improvements ? q.feedback.improvements.join(", ") : "None provided"}\n`;
      }
      summary += '\n';
    });
    
    return summary;
  }

  /**
   * Clear interview context when interview is completed
   */
  clearInterviewContext(interviewId) {
    if (this.interviewContexts.has(interviewId)) {
      this.interviewContexts.delete(interviewId);
      console.log(`Cleared interview context for interview ID: ${interviewId}`);
      return true;
    }
    return false;
  }
}

// Initialize and export the service
const aiService = new GeminiAIServices();
export default aiService;