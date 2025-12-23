import api from './api';

export const googleLogin = async (token) => {
  const response = await api.post('/auth/google', { token });
  return response.data;
};

export const completeEmployeeProfile = async (profileData) => {
  const response = await api.post('/employees/complete-profile', profileData);
  return response.data;
};
