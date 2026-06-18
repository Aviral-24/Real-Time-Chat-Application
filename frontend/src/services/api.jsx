import axios from 'axios';

const API_URL = 'https://real-time-chat-application-i39j.onrender.com/api/auth'; // Backend ka URL

export const loginCall = async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
};

export const registerCall = async (credentials) => {
    const response = await axios.post(`${API_URL}/register`, credentials);
    return response.data;
};