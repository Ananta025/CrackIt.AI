import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

class GeminiAIServices {
  constructor() {
    // Initialize the Gemini API client
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.model = "gemini-2.0-flash";
    this.interviewContexts = new Map();
    this.interviewQuestions = new Map(); // Track questions for each interview
    this.setupPrompts();
  }

  setupPrompts() {
    // Interview type specific system prompts
    this.systemPrompts = {
      technical: `You are Rahul, an expert technical interviewer and Software Engineer at CrackIt.AI. 
Your goal is to conduct a professional technical interview following best practices:
1. Ask relevant questions specifically focused on the candidate's areas of interest
2. Start with fundamental concepts before moving to more complex topics
3. Ask detailed follow-up questions to explore depth of understanding
4. NEVER repeat a question that was already asked
5. Adapt questions based on the candidate's previous responses
6. Provide constructive feedback on technical accuracy, problem-solving approach, and communication
7. Address the candidate by name throughout the interview`,

      behavioral: `You are Rahul, an expert behavioral interviewer and Software Engineer at CrackIt.AI.
Your goal is to assess a candidate's soft skills and experiences using the STAR method:
1. Ask questions that focus specifically on the candidate's stated focus areas
2. Probe for details about the Situation, Task, Action, and Result in responses
3. Focus on leadership, teamwork, conflict resolution, problem-solving, and adaptability
4. Provide feedback on the structure, specificity, and impact described in responses
5. NEVER repeat a question that was already asked
6. Address the candidate by name throughout the interview`,

      hr: `You are Rahul, an experienced HR interviewer and Software Engineer at CrackIt.AI.
Your goal is to evaluate the candidate's fit for roles they're applying to:
1. Ask personalized questions about career goals, background, and motivations
2. Explore what they're looking for in their next role and company
3. Assess communication skills, self-awareness, and professional presentation
4. NEVER repeat a question that was already asked
5. Address the candidate by name throughout the interview`
    };

    // Interview difficulty modifiers
    this.difficultyModifiers = {
      easy: "Keep questions at an entry-level, focusing on fundamentals and common scenarios. Be encouraging in feedback.",
      medium: "Ask moderately challenging questions suitable for professionals with 2-3 years of experience. Be balanced in feedback.",
      hard: "Ask challenging questions that test deep understanding and edge cases. Suitable for senior candidates. Be rigorous but fair in feedback."
    };

    // Interview closing templates
    this.closingTemplates = {
      technical: "Thank you for your time today. I've enjoyed discussing these technical concepts with you. Is there anything else you'd like to ask me about the role or our technical stack at CrackIt.AI?",
      behavioral: "I appreciate your thoughtful responses today. You've given me good insight into your experiences and approach to work. Do you have any questions for me about our team culture at CrackIt.AI?",
      hr: "Thank you for sharing your background and career goals with me today. I've enjoyed learning more about you. Is there anything else you'd like to know about working at CrackIt.AI?"
    };
  }

  /**
   * Get or create a conversation context for an interview
   */
  async getOrCreateConversation(interviewId, interviewType, settings, userName) {
    if (!this.interviewContexts.has(interviewId)) {
      // Create system prompt based on interview type and settings
      const systemPrompt = `${this.systemPrompts[interviewType]}
${this.difficultyModifiers[settings.difficulty]}
${settings.focus && settings.focus.length > 0 ? `Focus areas for this interview: ${settings.focus.join(", ")}. Ask questions specifically about these areas.` : ""}

For the first message only, start with: "Hi ${userName}, thanks for interviewing with us today. I'm Rahul, and I'm a Software Engineer here at CrackIt.AI."

Each of your responses should have the following JSON structure:
{
  "question": "Your next interview question",
  "feedback": {
    "strengths": ["list of 2-3 specific strengths in the candidate's previous answer"],
    "improvements": ["list of 2-3 specific areas for improvement"],
    "score": <numeric score between 1-10 based on answer quality>,
    "suggestedTopics": ["key points they could have mentioned but didn't"]
  }
}

For the first question, only include the question with introduction. For the last question, end with a professional closing.`;

      // Initialize tracking for this interview
      this.interviewContexts.set(interviewId, { 
        history: [],
        askedQuestions: new Set(),
        userName,
        type: interviewType,
        settings
      });
      
      console.log(`Created new interview context for interview ID: ${interviewId}`);
    }

    return this.interviewContexts.get(interviewId);
  }

  /**
   * Process a user's response and generate the next question with feedback
   */
  async processUserResponse(userMessage, interviewType, interviewData) {
    try {
      const interviewId = interviewData._id.toString();
      const settings = interviewData.settings;
      const userName = interviewData.userName || "Candidate";
      
      // Get or create conversation context
      const context = await this.getOrCreateConversation(interviewId, interviewType, settings, userName);
      
      // Check if this is the first message
      const isFirstMessage = context.history.length === 0 || 
                            (context.history.length === 1 && 
                            userMessage.toLowerCase().includes("ready to begin"));

      // Check if this is the last question
      const isLastQuestion = this.isLastQuestion(interviewData);
      
      if (isFirstMessage) {
        // For the first message, return introduction with the first question
        const introduction = await this.generateFirstQuestion(interviewType, settings, userName);
        
        // Track this as the first question - extract just the question part after the greeting
        if (introduction) {
          const parts = introduction.split("CrackIt.AI.");
          const questionPart = parts.length > 1 ? parts[1].trim() : introduction;
          
          context.askedQuestions.add(questionPart);
          context.history.push({ role: "assistant", text: introduction });
        }
        
        return {
          response: introduction,
          feedback: null,
          lastQuestion: introduction
        };
      }

      // Add user message to history
      context.history.push({ role: "user", text: userMessage });
      
      // Prepare system prompt with stronger instructions against repetition
      const systemPrompt = this.prepareSystemPrompt(interviewType, settings, context, isLastQuestion);
      
      try {
        // Generate AI response
        const response = await this.genAI.models.generateContent({
          model: this.model,
          contents: [
            { role: "system", text: systemPrompt },
            ...context.history.map(msg => ({ 
              role: msg.role, 
              text: msg.text 
            }))
          ],
          generationConfig: {
            temperature: 0.7,
            responseFormat: { type: "json" }
          }
        });
        
        let responseText = response.text;
        
        // FIXED: Properly call parseAIResponse as an instance method
        let parsedResponse = this.parseAIResponse(responseText, userMessage, interviewType);
        
        // Handle special case for last question
        if (isLastQuestion) {
          // Only append closing template if Gemini didn't already include a closing statement
          if (!parsedResponse.question.toLowerCase().includes("thank you for your time") && 
              !parsedResponse.question.toLowerCase().includes("appreciate your")) {
            parsedResponse.question += "\n\n" + this.closingTemplates[interviewType];
          }
        }
        
        // Make sure question is personalized
        parsedResponse.question = this.ensurePersonalization(parsedResponse.question, userName);
        
        // Ensure question is not repeated - with enhanced checking
        if (this.isQuestionRepeated(parsedResponse.question, context.askedQuestions)) {
          console.log("Question repetition detected, generating new unique question");
          parsedResponse.question = await this.generateUniqueQuestion(
            interviewType, 
            settings, 
            context.askedQuestions, 
            userName, 
            isLastQuestion
          );
        }
        
        // Add to asked questions - store normalized version
        const normalizedQuestion = this.normalizeQuestion(parsedResponse.question);
        context.askedQuestions.add(normalizedQuestion);
        
        // Store the updated history
        context.history.push({ role: "assistant", text: parsedResponse.question });
        
        return {
          response: parsedResponse.question,
          feedback: parsedResponse.feedback,
          lastQuestion: interviewData.questions.length > 0 ? 
            interviewData.questions[interviewData.questions.length - 1].text : 
            parsedResponse.question
        };
      } catch (aiError) {
        console.error("Error calling AI service:", aiError);
        return this.createFallbackResponse(userMessage, interviewType, interviewData, userName, isLastQuestion);
      }
    } catch (error) {
      console.error("Error processing user response:", error);
      const userName = interviewData.userName || "Candidate";
      const isLastQuestion = this.isLastQuestion(interviewData);
      return this.createFallbackResponse(userMessage, interviewType, interviewData, userName, isLastQuestion);
    }
  }

  /**
   * Parse AI response and handle errors
   * FIXED: Ensure this method is properly defined
   */
  parseAIResponse(responseText, userMessage, interviewType) {
    try {
      // Clean up potential text around JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          // Fall through to extraction if JSON parsing fails
        }
      }
      
      // If no JSON found or parsing failed, extract question and create feedback
      const question = this.extractQuestion(responseText) || "Could you elaborate more on your approach to this subject?";
      return {
        question,
        feedback: this.generateFallbackFeedback(userMessage, interviewType)
      };
    } catch (jsonError) {
      console.error("Error parsing response as JSON:", jsonError);
      console.log("Raw response:", responseText);
      
      // Use fallback parsing
      return this.extractResponseComponents(responseText, userMessage, interviewType);
    }
  }

  /**
   * Generate first question with personalized introduction
   */
  async generateFirstQuestion(interviewType, settings, userName) {
    try {
      // IMPROVED: More emphasis on focus areas in first question
      const focusAreas = settings.focus && settings.focus.length > 0 
        ? `Focus specifically on these areas: ${settings.focus.join(", ")}. Your first question MUST relate directly to one of these topics.` 
        : "";
      
      const systemPrompt = `You are Rahul, a Software Engineer at CrackIt.AI conducting a ${interviewType} interview.
Generate a professional introduction and first question for ${userName}.
Your response MUST start with EXACTLY this greeting: "Hi ${userName}, thanks for interviewing with us today. I'm Rahul, and I'm a Software Engineer here at CrackIt.AI."
Then ask ONE relevant ${settings.difficulty} level question about ${interviewType} concepts. ${focusAreas}
DO NOT repeat the greeting. DO NOT add any additional greeting.
Keep your entire response concise and professional.`;

      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: [
          { role: "system", text: systemPrompt },
          { role: "user", text: `I'm ${userName} and I'm ready to start my ${interviewType} interview.` }
        ]
      });

      const result = response.text;
      console.log("Generated introduction:", result);
      
      // Ensure the greeting appears exactly once
      if (!result.startsWith(`Hi ${userName}`)) {
        return `Hi ${userName}, thanks for interviewing with us today. I'm Rahul, and I'm a Software Engineer here at CrackIt.AI. ${result}`;
      }
      
      return result;
    } catch (error) {
      console.error("Error generating introduction:", error);
      return `Hi ${userName}, thanks for interviewing with us today. I'm Rahul, and I'm a Software Engineer here at CrackIt.AI. Let's start by discussing your experience with ${settings.focus?.[0] || interviewType} concepts. Could you tell me about a recent project you've worked on?`;
    }
  }

  /**
   * Prepare system prompt for AI with stronger anti-repetition guidance
   */
  prepareSystemPrompt(interviewType, settings, context, isLastQuestion) {
    // IMPROVED: More emphasis on focus areas in all questions
    const focusAreasPrompt = settings.focus && settings.focus.length > 0 
      ? `Focus EXCLUSIVELY on these areas: ${settings.focus.join(", ")}. 
Your questions MUST directly relate to these topics.
Each question should explore a different aspect of these focus areas.` 
      : "";
    
    // IMPROVED: Better detection of repeated questions
    let askedQuestionsPrompt = "";
    if (context.askedQuestions.size > 0) {
      const askedList = Array.from(context.askedQuestions).slice(0, 5);
      askedQuestionsPrompt = `
CRITICAL: You've already asked these questions (or similar ones). DO NOT ask these or similar questions again:
${askedList.map(q => `- "${q}"`).join("\n")}

Your new question MUST be completely different in topic and wording from any previous question.`;
    }
    
    const lastQuestionPrompt = isLastQuestion
      ? "This is the FINAL question of the interview. Begin your response with 'This will be our final question.' Then ask your question, followed by a professional closing statement."
      : "";
    
    return `${this.systemPrompts[interviewType]}
${this.difficultyModifiers[settings.difficulty]}
${focusAreasPrompt}
${askedQuestionsPrompt}
${lastQuestionPrompt}

IMPORTANT INSTRUCTIONS:
1. DO NOT repeat any question that has already been asked or anything similar
2. DO NOT include any greeting like "Hi [name]" except in the very first question
3. DO NOT ask more than one question at a time

Respond with JSON in this format:
{
  "question": "Your next interview question for ${context.userName}",
  "feedback": {
    "strengths": ["list of 2-3 specific strengths in the candidate's previous answer"],
    "improvements": ["list of 2-3 specific areas for improvement"],
    "score": <numeric score between 1-10 based on answer quality>,
    "suggestedTopics": ["key points they could have mentioned but didn't"]
  }
}`;
  }

  /**
   * Check if a question is too similar to previously asked questions
   * IMPROVED: Better similarity detection
   */
  isQuestionRepeated(question, askedQuestions) {
    const normalized = this.normalizeQuestion(question);
    
    // Direct match check
    if (askedQuestions.has(normalized)) {
      return true;
    }
    
    // Enhanced similarity detection for partial matches
    for (const asked of askedQuestions) {
      // If core concepts match
      const questionKeywords = this.extractKeywords(normalized);
      const askedKeywords = this.extractKeywords(asked);
      
      // If there's significant keyword overlap (more than 60%)
      const commonKeywords = questionKeywords.filter(kw => askedKeywords.includes(kw));
      if (commonKeywords.length > 0 && 
          commonKeywords.length / Math.min(questionKeywords.length, askedKeywords.length) > 0.6) {
        console.log("Question similarity detected via keywords:", commonKeywords);
        return true;
      }
      
      // If the core part of the question is the same
      if (normalized.includes(asked) || asked.includes(normalized)) {
        // Only consider it a match if the overlap is significant
        if (Math.min(normalized.length, asked.length) > 15) {
          return true;
        }
      }
      
      // Check for very similar questions (with small differences)
      const similarity = this.getStringSimilarity(normalized, asked);
      if (similarity > 0.7) { // 70% similarity threshold
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Normalize a question for better comparison
   * ADDED: Missing method that was causing errors
   */
  normalizeQuestion(question) {
    // Remove greeting parts if present
    let normalized = question;
    if (question.includes("Hi ") && question.includes("I'm Rahul")) {
      const parts = question.split("CrackIt.AI.");
      if (parts.length > 1) {
        normalized = parts[1].trim();
      }
    }
    
    // Remove candidate name if present
    const namePrefixes = [", ", ": ", " - "];
    for (const prefix of namePrefixes) {
      const index = normalized.indexOf(prefix);
      if (index > 0 && index < 20) { // Name typically appears near the start
        normalized = normalized.substring(index + prefix.length);
        break;
      }
    }
    
    // Remove closing statement if present
    const closingMarkers = [
      "Thank you for your time", 
      "This will be our final question",
      "Is there anything else you'd like to ask"
    ];
    
    for (const marker of closingMarkers) {
      const index = normalized.indexOf(marker);
      if (index > 0) {
        normalized = normalized.substring(0, index).trim();
      }
    }
    
    return normalized.trim();
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  getStringSimilarity(str1, str2) {
    // Convert to lowercase for case-insensitive comparison
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // If the strings are identical, return 1
    if (s1 === s2) return 1.0;
    
    // If either string is empty, similarity is 0
    if (s1.length === 0 || s2.length === 0) return 0.0;
    
    // Use the longer string as reference
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    // Calculate Levenshtein distance
    let distance = 0;
    
    // Create two work vectors of integer distances
    let v0 = Array(shorter.length + 1).fill(0);
    let v1 = Array(shorter.length + 1).fill(0);
    
    // Initialize v0 (previous row of distances)
    // This row is A[0][i]: edit distance from an empty string to the first i characters of longer
    for (let i = 0; i <= shorter.length; i++) {
      v0[i] = i;
    }
    
    for (let i = 0; i < longer.length; i++) {
      // Calculate v1 (current row distances) from the previous row v0
      
      // First element of v1 is A[i+1][0]
      // Edit distance is delete (i+1) chars from longer to match empty string
      v1[0] = i + 1;
      
      // Use formula to fill in the rest of the row
      for (let j = 0; j < shorter.length; j++) {
        // Calculating costs for A[i+1][j+1]
        const deletionCost = v0[j + 1] + 1;
        const insertionCost = v1[j] + 1;
        const substitutionCost = longer[i] === shorter[j] ? v0[j] : v0[j] + 1;
        
        v1[j + 1] = Math.min(deletionCost, insertionCost, substitutionCost);
      }
      
      // Swap v0 and v1 for next iteration
      const temp = v0;
      v0 = v1;
      v1 = temp;
    }
    
    // After the final swap, v0 contains the Levenshtein distance
    distance = v0[shorter.length];
    
    // Calculate similarity score (0 to 1)
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = (maxLength - distance) / maxLength;
    
    return similarity;
  }

  /**
   * Extract important keywords from a question to check for conceptual similarity
   */
  extractKeywords(text) {
    // Common filler words to ignore
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'with', 'to', 'from', 
                      'for', 'about', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
                      'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'would',
                      'should', 'might', 'may', 'must', 'shall'];
    
    // Normalize and split text
    const words = text.toLowerCase()
                      .replace(/[.,?!;:()"']/g, '')
                      .split(/\s+/)
                      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Return unique keywords
    return [...new Set(words)];
  }

  /**
   * Check if this should be the last question based on interview data
   * FIXED: Improved detection of last question
   */
  isLastQuestion(interviewData) {
    const maxQuestions = this.getMaxQuestions(interviewData.settings.duration);
    return interviewData.questions.length >= maxQuestions - 1; // Changed from -2 to -1
  }

  /**
   * Get max questions based on interview duration
   */
  getMaxQuestions(duration) {
    switch (duration) {
      case "short": return 5;
      case "medium": return 8;
      case "long": return 12;
      default: return 8;
    }
  }

  /**
   * Generate a unique question when one is repeated
   */
  async generateUniqueQuestion(interviewType, settings, askedQuestions, userName, isLastQuestion) {
    // Build a prompt specifically requesting a unique question
    const focusAreas = settings.focus && settings.focus.length > 0 
      ? `Focus on these specific areas: ${settings.focus.join(", ")}` 
      : "";
    
    const askedList = Array.from(askedQuestions).slice(0, 5).join("\n- ");
    
    const systemPrompt = `You are Rahul, a Software Engineer at CrackIt.AI.
Generate a NEW ${interviewType} interview question on ${settings.difficulty} level that is DIFFERENT from these already asked questions:
- ${askedList}

${focusAreas}
${isLastQuestion ? "This will be the final question of the interview." : ""}
The question should be appropriate for a ${settings.difficulty} level ${interviewType} interview.
Return ONLY the question addressed to ${userName}, no other text.`;

    try {
      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: [
          { role: "system", text: systemPrompt }
        ],
      });
      
      const question = response.text;
      console.log("Generated unique question:", question);
      return question;
    } catch (error) {
      console.error("Error generating unique question:", error);
      return `${userName}, could you tell me about a challenge you faced with ${settings.focus?.[0] || interviewType} and how you overcame it?`;
    }
  }
  
  /**
   * Ensure the question is personalized with the candidate's name
   */
  ensurePersonalization(question, userName) {
    if (!question.includes(userName)) {
      return `${userName}, ${question}`;
    }
    return question;
  }

  /**
   * Create a fallback response when AI processing fails
   */
  createFallbackResponse(userMessage, interviewType, interviewData, userName, isLastQuestion) {
    let question = this.getFallbackQuestion(interviewType, userName);
    
    if (isLastQuestion) {
      question += "\n\n" + this.closingTemplates[interviewType];
    }
    
    return {
      response: question,
      feedback: this.generateFallbackFeedback(userMessage, interviewType),
      lastQuestion: interviewData.questions.length > 0 ? 
        interviewData.questions[interviewData.questions.length - 1].text : 
        question
    };
  }

  /**
   * Extract response components from text if JSON parsing fails
   */
  extractResponseComponents(text, userMessage, interviewType) {
    const question = this.extractQuestion(text);
    return {
      question: question || "Could you tell me more about your experience in this area?",
      feedback: this.generateFallbackFeedback(userMessage, interviewType)
    };
  }
  
  /**
   * Extract a question from text
   */
  extractQuestion(text) {
    // Try to find a question in the text
    const lines = text.split(/[\n\r]+/);
    for (const line of lines) {
      if (line.trim().endsWith('?')) {
        return line.trim();
      }
    }
    
    // If no question found, return first substantial line
    for (const line of lines) {
      if (line.trim().length > 20) {
        return line.trim();
      }
    }
    
    return null;
  }

  /**
   * Generate fallback feedback when AI processing fails
   */
  generateFallbackFeedback(answer, interviewType) {
    const wordCount = answer.split(/\s+/).length;
    const score = wordCount > 100 ? 7 : wordCount > 50 ? 5 : 3;
    
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
      score: score,
      suggestedTopics: [
        "Specific examples from your experience",
        "Quantifiable results or metrics",
        "Lessons learned from the situation"
      ]
    };
  }

  /**
   * Get a fallback question if Gemini API call fails
   */
  getFallbackQuestion(interviewType, userName) {
    const questions = {
      technical: [
        `${userName}, how would you approach debugging a complex performance issue in a web application?`,
        `${userName}, what's your approach to ensuring code quality and maintainability in team projects?`,
        `${userName}, how do you stay current with industry trends and new technologies?`
      ],
      behavioral: [
        `${userName}, describe a situation where you had to influence someone without having direct authority.`,
        `${userName}, tell me about a time when you received difficult feedback. How did you respond?`,
        `${userName}, how have you handled disagreements with team members in the past?`
      ],
      hr: [
        `${userName}, what are you looking for in your next role?`,
        `${userName}, how would you describe your ideal work environment?`,
        `${userName}, what are your greatest strengths and areas for improvement?`
      ]
    };
    
    const questionPool = questions[interviewType] || questions.behavioral;
    return questionPool[Math.floor(Math.random() * questionPool.length)];
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
   * Calculate fallback results if AI fails
   */
  calculateFallbackResults(interview) {
    // Simple score calculation based on available feedback
    let totalScore = 0;
    let validScores = 0;
    
    interview.questions.forEach(q => {
      if (q.feedback && typeof q.feedback.score === 'number') {
        totalScore += q.feedback.score;
        validScores++;
      } else if (q.feedback && typeof q.feedback.rating === 'number') {
        totalScore += q.feedback.rating;
        validScores++;
      }
    });
    
    const overallScore = validScores > 0 ? Math.round(totalScore / validScores) : 5;
    
    // Generate a basic feedback message
    let feedbackMessage;
    if (overallScore >= 8) {
      feedbackMessage = "Excellent performance! You demonstrated strong knowledge and communication skills throughout the interview. Your answers were well-structured and showed depth of understanding.";
    } else if (overallScore >= 6) {
      feedbackMessage = "Good job on your interview. You showed solid knowledge in several areas. With some additional preparation and more specific examples, you could further strengthen your responses.";
    } else {
      feedbackMessage = "Thank you for participating in this interview. There are several areas where additional preparation would help. Focus on structuring your answers with specific examples and demonstrating your problem-solving approach.";
    }
    
    return {
      overallScore,
      feedback: feedbackMessage,
      skillScores: {
        communication: Math.min(overallScore + 1, 10),
        technical: interview.type === 'technical' ? overallScore : null,
        problemSolving: Math.max(overallScore - 1, 1),
        behavioral: interview.type === 'behavioral' ? overallScore : null,
        leadership: Math.max(overallScore - 2, 1)
      },
      strengths: [
        "Attempted to answer all questions",
        "Participated actively in the interview process",
        "Showed interest in the subject matter"
      ],
      weaknesses: [
        "Could provide more specific examples",
        "May need to structure answers more clearly",
        "Could demonstrate deeper technical knowledge"
      ],
      improvementTips: [
        "Practice the STAR method for answering behavioral questions",
        "Prepare specific examples from your experience ahead of time",
        "Quantify your achievements when possible",
        "Research common interview questions for your role",
        "Consider mock interviews for additional practice"
      ]
    };
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
        summary += `Rating: ${q.feedback.score || q.feedback.rating || 0}/10\n`;
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