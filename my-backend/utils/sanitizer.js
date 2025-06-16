const fs = require('fs');
const { JSDOM } = require("jsdom");
const DOMPurify = require('dompurify')(new JSDOM().window);
const { blockedSites } = require('../config/config.js');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // экранируем все специальные символы
}


const sanitizeMessage = (html) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  const socialMediaRegex = new RegExp(`\\b(https?:\\/\\/)?(www\\.)?(${blockedSites.map(escapeRegExp).join('|')})\\b`, 'i'); // исправленное регулярное выражение

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\+?[1-9]\d{1,14}/g;
  const telegramRegex = /@[a-zA-Z0-9_]+/g;

  let result = sanitizedHtml.replace(socialMediaRegex, '[ссылка скрыта модератором]');
  result = result.replace(emailRegex, '[email скрыт модератором]');
  result = result.replace(phoneRegex, '[номер телефона скрыт модератором]');
  result = result.replace(telegramRegex, '[ссылка на Telegram скрыта модератором]');
  return result;
};

module.exports = sanitizeMessage;
