/**
 * Utility to format API responses consistently
 */
export const responseFormatter = {
  /**
   * Format LinkedIn profile optimization response
   */
  formatProfileResponse: (originalProfile, optimizedProfile, comparison) => {
    return {
      success: true,
      originalProfile: {
        name: originalProfile.name || '',
        headline: originalProfile.headline || '',
        about: originalProfile.about || '',
        experience: originalProfile.experience || [],
        education: originalProfile.education || [],
        skills: originalProfile.skills || []
      },
      optimizedProfile: {
        headline: optimizedProfile.headline?.optimized || '',
        about: optimizedProfile.about?.optimized || '',
        experience: optimizedProfile.experience?.optimized || [],
        education: optimizedProfile.education?.optimized || [],
        skills: optimizedProfile.skills?.optimized || [],
        overallSuggestions: optimizedProfile.overallSuggestions || []
      },
      explanations: {
        headline: optimizedProfile.headline?.explanation || '',
        about: optimizedProfile.about?.explanation || '',
        experience: optimizedProfile.experience?.explanation || '',
        education: optimizedProfile.education?.explanation || '',
        skills: optimizedProfile.skills?.explanation || ''
      },
      comparison: comparison || {
        overallImprovement: 0,
        headline: { improvement: 0 },
        about: { improvement: 0 },
        experience: { improvement: 0 },
        education: { improvement: 0 },
        skills: { improvement: 0 }
      }
    };
  },

  /**
   * Format LinkedIn post optimization response
   */
  formatPostResponse: (originalPost, targetAudience, purpose, optimizedPost) => {
    return {
      success: true,
      original: {
        content: originalPost,
        targetAudience: targetAudience || 'General LinkedIn users',
        purpose: purpose || 'Engagement and visibility'
      },
      optimized: {
        content: optimizedPost.optimizedPost || '',
        hashtags: optimizedPost.hashtags || [],
        improvements: optimizedPost.improvements || {
          content: [],
          structure: [],
          engagement: []
        },
        bestPractices: optimizedPost.bestPractices || []
      },
      analysis: optimizedPost.analysis || {
        strengths: [],
        weaknesses: []
      }
    };
  },

  /**
   * Format resume template response
   */
  formatResumeTemplatesResponse: (templates) => {
    return {
      success: true,
      data: templates.map(template => ({
        _id: template._id,
        name: template.name,
        category: template.category,
        description: template.description,
        previewImage: template.previewImage || null
      }))
    };
  },

  /**
   * Format resume save response
   */
  formatResumeSaveResponse: (resumeId, isNewResume = true) => {
    return {
      success: true,
      message: isNewResume ? 'Resume created successfully' : 'Resume updated successfully',
      data: {
        resumeId
      }
    };
  }
};
