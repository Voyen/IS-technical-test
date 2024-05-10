import api from './api';

const getCurrentCount = () => api.get<number>('/counter');
const decrementCount = () => api.put<number>('/decrement');
const resetCounter = () => api.put<number>('/reset');

export default { getCurrentCount, decrementCount, resetCounter };
