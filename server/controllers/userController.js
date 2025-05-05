import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import httpStatus from "http-status";


const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
    }
    const {email, password, name} = req.body;
    if(!email || !password || !name){
        return res.status(httpStatus.BAD_REQUEST).json({message: "Please provide email and password"});
    }
    try{
        const isUserExist = await User.findOne({email});
        if(isUserExist){
            return res.status(httpStatus.BAD_REQUEST).json({message: "User already exists"});
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedpassword,
        });
        const token = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email,
            },process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        )
        return res.status(httpStatus.CREATED).json({
            message: "User created successfully",
            userId : newUser._id,
            userName : newUser.name,
            token
        });

    }catch(error){
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: "Internal server error", error: error.message});
    }
}

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(httpStatus.BAD_REQUEST).json({message: "Please provide email and password"});
    }
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(httpStatus.BAD_REQUEST).json({message: "User not found"});
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(httpStatus.BAD_REQUEST).json({message: "Invalid credentials"});
        }
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        )
        return res.status(httpStatus.OK).json({
            message: "User logged in successfully",
            userId : user._id,
            userName : user.name,
            token
        });
        

    }catch(error){
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: "Internal server error", error: error.message});
    }
}

const getUserDetails = async (req, res) => {
    const userId = req.params.id;
    try{
        const user = await User.findById(userId).select("-password -__v");
        if(!user){
            return res.status(httpStatus.BAD_REQUEST).json({message: "User not found"});
        }
        return res.status(httpStatus.OK).json({
            message: "User details fetched successfully",
            user
        });
    }catch(error){
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: "Internal server error", error: error.message});
    }
}

const updateUserSkills = async (req, res) => {
    const userId = req.params.id;
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Skills must be provided as an array" });
    }
    
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { skills },
            { new: true }
        ).select("-password -__v");
        
        if (!user) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "User not found" });
        }
        
        return res.status(httpStatus.OK).json({
            message: "Skills updated successfully",
            user
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
}

export { registerUser, loginUser, getUserDetails, updateUserSkills };