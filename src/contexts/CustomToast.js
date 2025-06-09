import React from 'react';
import { Toast } from 'react-bootstrap';

const CustomToast = ({ show, onClose, children }) => {
  return (
    <Toast 
      show={show} 
      onClose={onClose} 
      style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '50%',
        transform: 'translateX(-50%)', // Центрирование по горизонтали
        zIndex: 1050 
      }}
    >
      <Toast.Body>
        {children}
      </Toast.Body>
      <button 
        type="button" 
        className="btn-close" 
        aria-label="Закрыть" 
        style={{ float: 'right', marginTop: '-10px' }} 
        onClick={onClose}
      />
    </Toast>
  );
};

export default CustomToast;
