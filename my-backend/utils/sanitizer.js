const fs = require('fs');
const { JSDOM } = require("jsdom");
const DOMPurify = require('dompurify')(new JSDOM().window);
const { blockedSites } = require('../config/config.js');

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeHtml = (html) => {
  const sanitizedHtml = DOMPurify.sanitize(html); // Базовая санитазия
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+7|8)[\s(]?[\d]{3}[-\s)]?[\d]{3}[-\s]?[\d]{2}[-\s]?[\d]{2}/g; 

  const telegramRegex = /@[a-zA-Z0-9_]+/g;
  let result = sanitizedHtml.replace(emailRegex, '[email скрыт модерацией]');
  result = result.replace(phoneRegex, '[номер телефона скрыт модерацией]');
  result = result.replace(telegramRegex, '[Telegram скрыт модерацией]');
  return result;
};

const blockUrls = (text) => {
  const normalizedBlockedSites = blockedSites.map(escapeRegExp).map(site => site.toLowerCase()); //EscapeRegExp перед созданием regex
  const blockedSitesRegex = new RegExp(`\\b(${normalizedBlockedSites.join('|')})(?:\\/[^\\s]*)?\\b`, 'gi'); //изменено для корректной работы
  return text.replace(blockedSitesRegex, '[ссылка скрыта модерацией]');
};


const convertUrlsToLinks = (text) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
};

const sanitizeMessage = (text) => {
  console.log('Данные перед санитайзингом', text)
    let result = blockUrls(text); // блокируем ссылки
    result = sanitizeHtml(result); // делаем основную санитацию
    result = convertUrlsToLinks(result); // превращаем в ссылки
    console.log('Данные после санитайзинга', result)
    return result;
};

module.exports = { sanitizeHtml, blockUrls, convertUrlsToLinks, sanitizeMessage };


