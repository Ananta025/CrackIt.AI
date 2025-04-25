/**
 * Format profile optimization response
 * 
 * @param {Object} profileData - Original profile data
 * @param {Object} optimizationResults - AI optimization results
 * @returns {Object} - Formatted response
 */
function formatProfileResponse(profileData, optimizationResults) {
    return {
      status: 'success',
      data: {
        originalProfile: profileData,
        optimizationResults,
        meta: {
          generatedAt: new Date().toISOString(),
          version: '1.0'
        }
      }
    };
  }
  
  /**
   * Format post optimization response
   * 
   * @param {string} postContent - Original post content
   * @param {string} targetAudience - Target audience
   * @param {string} purpose - Post purpose
   * @param {Object} optimizationResults - AI optimization results
   * @returns {Object} - Formatted response
   */
  function formatPostResponse(postContent, targetAudience, purpose, optimizationResults) {
    return {
      status: 'success',
      data: {
        originalPost: {
          content: postContent,
          targetAudience,
          purpose
        },
        optimizationResults,
        meta: {
          generatedAt: new Date().toISOString(),
          version: '1.0'
        }
      }
    };
  }
  
  export default {
    formatProfileResponse,
    formatPostResponse
  };