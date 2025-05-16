import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://www.mindahun.pro.et/api/v1',
    // withCredentials: true
});

/** Interceptor for requests sent from the application: 
retrieve the Access Token from localStorage and 
add it to every API request made using the axios instance.
*/
axiosInstance.interceptors.request.use(
    async function (config) {
        const token = await AsyncStorage.getItem("pulcity_token");
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

/** Interceptor for responses received by the application: 
check if the response indicates an expired access token, and 
if so, send a refresh token request to obtain a new access token and
retry the original request using the updated token.
Here the refresh token is stored as cookies.
*/
axiosInstance.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {

        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const token = await AsyncStorage.getItem("pulcity_refresh_token");

            try {
                const response = await axios.post(`https://www.mindahun.pro.et/api/v1/auth/token/refresh/`, {
                    // withCredentials: true
                    "refresh": token
                });
                if (response) {

                    await AsyncStorage.setItem('pulcity_token', response.data.access);
                    await AsyncStorage.setItem('pulcity_refresh_token', response.data.refresh);

                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

                    return axiosInstance(originalRequest);
                }
            } catch (error) {
                // console.error('Error fetching data:', error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;