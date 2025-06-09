// вспомогательная функция debounce для автозаполнения стран, регионов и городов

// src/utils/debounce.js
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

export default debounce;
