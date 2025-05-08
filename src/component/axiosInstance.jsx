import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'https://bdcallingarbackend.duckdns.org/',
});

export default axiosInstance;
