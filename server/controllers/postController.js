import optimizePost from "../services/postOptimizationService"; // Import the post optimization service
import responseFormatter from "../utils/responseFormatter"


/**
 * Controller for optimizing LinkedIn post content
 */
export default optimizePost = async (req, res, next) => {
  try {
    const { postContent, targetAudience, purpose } = req.body;
    
    // Optimize post using AI
    const optimizationResults = await postOptimizationService.optimizePost(
      postContent, 
      targetAudience, 
      purpose
    );
    
    // Format and send response
    const response = responseFormatter.formatPostResponse(
      postContent, 
      targetAudience, 
      purpose, 
      optimizationResults
    );
    
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};