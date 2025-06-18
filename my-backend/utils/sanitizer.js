const fs = require('fs');
const { JSDOM } = require("jsdom");
const DOMPurify = require('dompurify')(new JSDOM().window);
const { blockedSites } = require('../config/config.js');

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeHtml = (html) => {
  const sanitizedHtml = DOMPurify.sanitize(html); // Базовая санитазия
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\+?[1-9]\d{1,14}/g;
  const telegramRegex = /@[a-zA-Z0-9_]+/g;
  let result = sanitizedHtml.replace(emailRegex, '[email скрыт модератором]');
  result = result.replace(phoneRegex, '[номер телефона скрыт модератором]');
  result = result.replace(telegramRegex, '[ссылка на Telegram скрыта модератором]');
  return result;
};

const blockUrls = (text) => {
  console.log("Исходный текст:", text);
  const blockedSitesRegex = new RegExp(`\\b(${blockedSites.map(site => site.toLowerCase()).join('|')})(?:\\/[^\\s]*)?\\b`, 'gi');

  const processedText = text.replace(blockedSitesRegex, '[ссылка скрыта модератором]');

  console.log("Обработанный текст:", processedText);
  return processedText;
};


const convertUrlsToLinks = (text) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi; // Изменено на gi
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
};

module.exports = { sanitizeHtml, blockUrls, convertUrlsToLinks };

