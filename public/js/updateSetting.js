// updateData
import axios from 'axios';
import { showAlert } from './alert';

export const updateSetting = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:5000/api/v1/users/updatePassword'
        : 'http://localhost:5000/api/v1/users/updateMe';
    const res = await axios.patch(url, data);
    if (res.data.status === 'success') {
      showAlert('success', `${type}update succesfully`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
