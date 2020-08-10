import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const loginData = { email, password };
    const res = await axios.post('/api/v1/users/login', loginData);
    if (res.data.status === 'success') {
      showAlert('success', 'You logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      });
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('/api/v1/users/logout'); 
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error loging out! Please try again');
  }
};
