// useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Убедитесь, что путь правильный

const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;
