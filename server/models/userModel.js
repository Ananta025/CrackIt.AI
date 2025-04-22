import mongoose from 'mongoose';



const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
    profilePicture: {
        type: String,
        default: "A"
    },
}, { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;