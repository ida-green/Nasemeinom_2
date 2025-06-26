import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const apiUrl = process.env.REACT_APP_API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        setLoading(true);
        try {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.id;

          const response = await axios.get(`http://localhost:3000/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
        } catch (err) {
          console.error('Ошибка получения данных о пользователе', err);
          setError(err);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
      }
    };

    fetchUserData();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
        const response = await axios.post('http://localhost:3000/auth/login', { email, password });
        const newToken = response.data.token;
        setToken(newToken);
        localStorage.setItem('jwtToken', newToken);

        const decodedToken = jwtDecode(newToken);
        const userId = decodedToken.id;

        const userResponse = await axios.get(`http://localhost:3000/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${newToken}`,
            },
        });

        setUser(userResponse.data);
    } catch (err) {
        console.error('Ошибка при входе:', err);
        setError(err.response ? err.response.data.message : 'Произошла ошибка при соединении с сервером.');
    } finally {
        setLoading(false);
    }
};


  useEffect(() => {
    console.log('Пользователь изменился:', user);
}, [user]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwtToken');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};