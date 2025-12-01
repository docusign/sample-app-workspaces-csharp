import { handleError } from './apiHelper';
import axios from './interceptors';

export async function callback(navigate) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const response = await axios.post(
      process.env.REACT_APP_API_BASE_URL + '/callback',
      {
        code: code,
      },
      {
        withCredentials: true,
      }
    );
    return response.data.message;
  } catch (error) {
    navigate('/');
    handleError(error);
  }
}
