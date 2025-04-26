/**
 * Compares original and optimized LinkedIn profiles to generate side-by-side comparison
 * 
 * @param {Object} originalProfile - Original LinkedIn profile data
 * @param {Object} optimizedProfile - Optimized LinkedIn profile data
 * @returns {Object} - Side-by-side comparison of profiles
 */
export const compareProfiles = (originalProfile, optimizedProfile) => {
  // Initialize comparison object
  const comparison = {
    headline: {
      original: originalProfile.headline || '',
      optimized: optimizedProfile.headline?.optimized || '',
      improvement: calculateImprovementScore('headline', originalProfile, optimizedProfile)
    },
    about: {
      original: originalProfile.about || '',
      optimized: optimizedProfile.about?.optimized || '',
      improvement: calculateImprovementScore('about', originalProfile, optimizedProfile)
    },
    experience: {
      original: originalProfile.experience || [],
      optimized: optimizedProfile.experience?.optimized || [],
      improvement: calculateImprovementScore('experience', originalProfile, optimizedProfile)
    },
    education: {
      original: originalProfile.education || [],
      optimized: optimizedProfile.education?.optimized || [],
      improvement: calculateImprovementScore('education', originalProfile, optimizedProfile)
    },
    skills: {
      original: originalProfile.skills || [],
      optimized: optimizedProfile.skills?.optimized || [],
      improvement: calculateImprovementScore('skills', originalProfile, optimizedProfile)
    },
    overallImprovement: calculateOverallImprovement(originalProfile, optimizedProfile),
    suggestions: optimizedProfile.overallSuggestions || []
  };
  
  return comparison;
};

/**
 * Calculate improvement score for a specific section
 * 
 * @param {string} section - Profile section 
 * @param {Object} originalProfile - Original profile data
 * @param {Object} optimizedProfile - Optimized profile data
 * @returns {number} - Improvement score (0-100%)
 */
const calculateImprovementScore = (section, originalProfile, optimizedProfile) => {
  // Simple scoring based on content differences
  let score = 75; // Default baseline score
  
  try {
    const original = section === 'headline' || section === 'about' 
      ? originalProfile[section] || ''
      : JSON.stringify(originalProfile[section] || []);
      
    const optimized = section === 'headline' || section === 'about'
      ? optimizedProfile[section]?.optimized || '' 
      : JSON.stringify(optimizedProfile[section]?.optimized || []);
    
    if (!optimized || optimized.length === 0) return 0;
    
    // Basic heuristics for scoring
    if (original === optimized) return 50; // No change
    
    if (optimized.length > original.length * 1.5) score += 10; // Significantly expanded
    if (optimized.length < original.length * 0.5) score -= 10; // Significantly shortened
    
    // Check keywords presence
    const keywords = ['achievement', 'result', 'success', 'improve', 'increase', 'skill', 'experience', 
                     'leadership', 'manage', 'develop', 'create', 'implement', 'analyze', 'collaborate'];
    
    const originalKeywordCount = keywords.filter(kw => original.toLowerCase().includes(kw)).length;
    const optimizedKeywordCount = keywords.filter(kw => optimized.toLowerCase().includes(kw)).length;
    
    if (optimizedKeywordCount > originalKeywordCount) {
      score += 5 * (optimizedKeywordCount - originalKeywordCount);
    }
    
    // Cap the score
    return Math.min(98, Math.max(50, score));
  } catch (error) {
    console.error('Error calculating improvement score:', error);
    return 75; // Default score on error
  }
};

/**
 * Calculate overall profile improvement
 * 
 * @param {Object} originalProfile - Original profile data
 * @param {Object} optimizedProfile - Optimized profile data
 * @returns {number} - Overall improvement score
 */
const calculateOverallImprovement = (originalProfile, optimizedProfile) => {
  // Weight each section by importance
  const weights = {
    headline: 0.25,
    about: 0.30,
    experience: 0.25,
    education: 0.10,
    skills: 0.10
  };
  
  // Calculate weighted average
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.keys(weights).forEach(section => {
    const score = calculateImprovementScore(section, originalProfile, optimizedProfile);
    totalScore += score * weights[section];
    totalWeight += weights[section];
  });
  
  return Math.round(totalScore / totalWeight);
};
