import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPaths';

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, passwords);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An unknown error occurred' };
  }
};

const forgotPassword = async (email) => {
  const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await axiosInstance.post(`${API_PATHS.AUTH.RESET_PASSWORD}?token=${token}`, { password });
  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};

export default authService;