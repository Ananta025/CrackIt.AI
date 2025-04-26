import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';

const authenticateUser = async (req, res, next) => {
    // Safely check if req.cookies exists before accessing token
    const token = (req.cookies && req.cookies.token) || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token', error: error.message });
    }
}

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
