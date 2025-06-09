// Генерация Id гостевого пользователя 
export const generateGuestId = () => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  };
  
  // Получение Id гостевого пользователя из localstorage
  export const getGuestIdFromLocalStorage = () => {
    try {
      const guestId = localStorage.getItem('guestId');
      return guestId;
    } catch (error) {
      console.error("Error getting guestId from localStorage:", error);
      return null;
    }
  };

  // Сохранение Id гостевого пользователя в localstorage
export const setGuestIdToLocalStorage = (guestId) => {
  try {
    localStorage.setItem('guestId', guestId);
  } catch (error) {
    console.error("Error setting guestId to localStorage:", error);
  }
};