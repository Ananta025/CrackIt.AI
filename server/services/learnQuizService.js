import { GoogleGenAI } from "@google/genai";

class QuizService {
  constructor() {
    this.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    this.ai = new GoogleGenAI({ apiKey: this.GEMINI_API_KEY });
  }

  /**
   * Get structured JSON response from Gemini API
   * @param {string} basePrompt - The core prompt content
   * @param {object} schema - JSON schema to enforce
   * @returns {Promise<object>} - Parsed JSON object
   */
  async getStructuredResponse(basePrompt, schema) {
    try {
      const prompt = `${basePrompt}

FORMAT INSTRUCTIONS: 
- Return a valid JSON object matching exactly this structure: ${JSON.stringify(schema)}
- Make sure to escape any backticks, quotes, or special characters in strings
- Do not include any markdown formatting, code blocks, or explanatory text
- The response must be pure, valid JSON only`;

      console.log(`Sending prompt to Gemini... (length: ${prompt.length})`);
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      
      const responseText = response.text;
      
      try {
        // First try direct parsing
        return JSON.parse(responseText);
      } catch (parseError) {
        console.log("Direct JSON parsing failed, attempting recovery...");
        return this.recoverJson(responseText);
      }
    } catch (error) {
      console.error("Error getting structured response:", error);
      throw new Error(`Failed to get structured response: ${error.message}`);
    }
  }

  /**
   * Attempt to recover and parse JSON from potentially malformed response
   * @param {string} text - The response text
   * @returns {object} - Parsed JSON object
   */
  recoverJson(text) {
    // Remove any markdown formatting or text outside JSON
    let jsonText = text.trim();
    
    // If it starts with ```json or ``` and ends with ```, extract content
    const codeBlockMatch = jsonText.match(/^```(?:json)?\s*([\s\S]+?)```$/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    
    // Handle cases where the model outputs explanations before/after JSON
    const jsonStartMatch = jsonText.match(/(\{[\s\S]*)/);
    if (jsonStartMatch) {
      jsonText = jsonStartMatch[1];
      
      // Find the last closing brace that would complete the JSON object
      let braceCount = 0;
      let endIndex = jsonText.length;
      
      for (let i = 0; i < jsonText.length; i++) {
        if (jsonText[i] === '{') braceCount++;
        if (jsonText[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      
      jsonText = jsonText.substring(0, endIndex);
    }

    // Clean up escape sequences and problematic characters
    jsonText = this.sanitizeJsonText(jsonText);
    
    console.log("Attempting to parse recovered JSON:", jsonText.substring(0, 100) + "...");
    
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("JSON recovery failed:", error);
      throw new Error("Failed to parse JSON response even after recovery attempts");
    }
  }
  
  /**
   * Sanitize JSON text to fix common issues
   * @param {string} text - The JSON text to sanitize
   * @returns {string} - Cleaned JSON text
   */
  sanitizeJsonText(text) {
    // Replace smart quotes with straight quotes
    let result = text.replace(/[\u2018\u2019\u201C\u201D]/g, '"');
    
    // Handle embedded code blocks by properly escaping backticks and newlines
    result = result.replace(/```(?:javascript|json|[a-z]+)?([\s\S]*?)```/g, 
      (match, code) => JSON.stringify(code).slice(1, -1));
    
    // Replace unescaped newlines in strings
    let inString = false;
    let sanitized = '';
    
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      const prevChar = i > 0 ? result[i-1] : '';
      
      if (char === '"' && prevChar !== '\\') {
        inString = !inString;
        sanitized += char;
      } else if (inString && (char === '\n' || char === '\r')) {
        sanitized += '\\n'; // Replace newlines with escaped newlines in strings
      } else {
        sanitized += char;
      }
    }
    
    return sanitized;
  }

  /**
   * Generate an explanation for a topic
   * @param {string} topic - The topic to explain
   * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
   * @returns {Promise<Object>} - Structured explanation data
   */
  async generateTopicExplanation(topic, difficulty = 'intermediate') {
    const levelGuide = {
      'beginner': 'simple terms with basic concepts only',
      'intermediate': 'moderate depth with some technical details',
      'advanced': 'in-depth with advanced concepts and nuances'
    };

    const prompt = `
    Explain the topic "${topic}" in ${levelGuide[difficulty]} for interview preparation.
    Include a thorough explanation, key concepts, examples, analogies, and interview tips.
    If the topic is technical, include properly-escaped code examples.`;
    
    // Define the expected schema
    const schema = {
      topic: "string",
      explanation: "string",
      keyConcepts: [
        {
          name: "string",
          description: "string"
        }
      ],
      examples: [
        {
          title: "string",
          description: "string"
        }
      ],
      analogies: ["string"],
      interviewTips: ["string"],
      codeExamples: [
        {
          language: "string",
          description: "string",
          code: "string"
        }
      ]
    };

    return this.getStructuredResponse(prompt, schema);
  }

  /**
   * Generate quiz questions for a topic
   * @param {string} topic - The topic for the quiz
   * @param {string} difficulty - Difficulty level
   * @param {number} questionCount - Number of questions to generate
   * @returns {Promise<Object>} - Structured quiz data
   */
  async generateQuiz(topic, difficulty = 'intermediate', questionCount = 5) {
    const difficultyGuide = {
      'beginner': 'basic knowledge and fundamental concepts',
      'intermediate': 'moderate difficulty testing solid understanding',
      'advanced': 'challenging questions requiring in-depth knowledge'
    };

    const prompt = `
    Create a multiple-choice quiz about "${topic}" with ${questionCount} questions at ${difficulty} level (${difficultyGuide[difficulty]}).
    Each question should have 4 possible answers with only one correct answer.
    Questions should test understanding, be relevant to interviews, cover different aspects of the topic, be clearly worded, and include practical scenarios when applicable.`;
    
    // Define the expected schema
    const schema = {
      topic: "string",
      difficulty: "string",
      questions: [
        {
          question: "string",
          answers: ["string", "string", "string", "string"],
          correctAnswerIndex: 0,
          explanation: "string"
        }
      ]
    };

    return this.getStructuredResponse(prompt, schema);
  }

  /**
   * Grade a user's quiz responses
   * @param {Array} userAnswers - User's selected answers
   * @param {Array} quizData - Original quiz data with correct answers
   * @returns {Object} - Grading results
   */
  gradeQuiz(userAnswers, quizData) {
    const results = {
      topic: quizData.topic,
      totalQuestions: quizData.questions.length,
      correctAnswers: 0,
      score: 0,
      answers: []
    };

    // Process each answer
    userAnswers.forEach((userAnswer, index) => {
      // Ensure we have corresponding question data
      if (index < quizData.questions.length) {
        const question = quizData.questions[index];
        const isCorrect = userAnswer === question.correctAnswerIndex;
        
        if (isCorrect) {
          results.correctAnswers++;
        }

        results.answers.push({
          questionIndex: index,
          userAnswer,
          correctAnswer: question.correctAnswerIndex,
          isCorrect
        });
      }
    });

    // Calculate percentage score
    results.score = Math.round((results.correctAnswers / results.totalQuestions) * 100);
    return results;
  }
}

const quizService = new QuizService();
export default quizService;