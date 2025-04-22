import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';



const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
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


export default authenticateUser;
