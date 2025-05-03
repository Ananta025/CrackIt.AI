import axios from 'axios';

// Use the environment variable or fallback to a default
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const addAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const getUserDetailsWithAuth = async (userId) => {
    try {
        // Remove '/users' from path to match server route structure
        const response = await axios.get(
            `${API_BASE_URL}/api/user/get-user-details/${userId}`, 
            addAuthHeader()
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
};

const updateUserSkillsWithAuth = async (userId, skills) => {
    try {
        // Remove '/users' from path to match server route structure
        const response = await axios.put(
            `${API_BASE_URL}/api/user/update-skills/${userId}`, 
            { skills }, 
            addAuthHeader()
        );
        return response.data;
    } catch (error) {
        console.error('Error updating skills:', error);
        throw error;
    }
};

export default {
    getUserDetails: getUserDetailsWithAuth,
    updateUserSkills: updateUserSkillsWithAuth,
};
