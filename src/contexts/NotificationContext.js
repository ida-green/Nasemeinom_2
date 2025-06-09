import React, { createContext, useContext, useState } from 'react';
import CustomToast from './CustomToast'; // Импортируем наш новый компонент
import { Link } from 'react-router-dom';

const NotificationContext = createContext();
export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [showToast, setShowToast] = useState(false);
  
  const triggerToast = () => {
    setShowToast(true);
  };
  
  const closeToast = () => {
    setShowToast(false);
  };

  // Функция для отображения стандартного сообщения о необходимости авторизации
  const showAuthRequiredMessage = () => {
    triggerToast();
  };

  return (
    <NotificationContext.Provider value={{ showToast, triggerToast, closeToast, showAuthRequiredMessage }}>
      {children}
      {/* Тост уведомление */}
      <CustomToast show={showToast} onClose={closeToast}>
        Для доступа ко всем функциям сайта, пожалуйста,{' '}
        <Link to="/login" onClick={closeToast}>войдите</Link> или{' '} 
        <Link to="/register" onClick={closeToast}> зарегистрируйтесь</Link>.
      </CustomToast>
    </NotificationContext.Provider>
  );
};
