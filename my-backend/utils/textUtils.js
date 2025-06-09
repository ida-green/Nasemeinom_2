// utils/textUtils.js

/**
 * Преобразует текст, содержащий URL, в HTML-ссылки.
 * @param {string} text - Текст, который нужно преобразовать.
 * @returns {string} - Текст с преобразованными ссылками.
 */
export const convertTextToLinks = (text) => {
    // Регулярное выражение для поиска URL
    const urlPattern = `/(https?://[^s]+)/g`;
  
    // Заменяем найденные URL на HTML-ссылки
    return text.replace(urlPattern, (url) => {
      return <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>;
    });
  };
  