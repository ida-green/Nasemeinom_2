import React from 'react';

const DateDisplay = ({ isoDateString }) => {
   const date = new Date(isoDateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

 function formatDate(date) {
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

export default DateDisplay;