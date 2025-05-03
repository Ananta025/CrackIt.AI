import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';

const authenticateUser = async (req, res, next) => {
    try {
        // Check for token in cookies first
        let token = req.cookies && req.cookies.token;
        
        // If not in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        // If no token found at all
        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                message: 'Authentication required', 
                error: 'No authentication token provided'
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                message: 'Invalid authentication',
                error: 'User not found'
            });
        }
        
        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({ 
            message: 'Authentication failed', 
            error: error.message 
        });
    }
};

const AIError = async (err, req, res, next) => {
    console.error('Error:', err);
  
    // Default error status and message
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    // Custom error response based on error type
    if (err.name === 'ScrapingError') {
      return res.status(400).json({
        error: message,
        type: 'ScrapingError',
        details: err.details || {}
      });
    }
  
    if (err.name === 'AIServiceError') {
      return res.status(503).json({
        error: message,
        type: 'AIServiceError',
        details: err.details || {}
      });
    }
  
    // Default error response
    return res.status(status).json({
      error: message,
      type: err.name || 'GeneralError'
    });
  };

// Export as an object with named properties
export default { authenticateUser, AIError };
