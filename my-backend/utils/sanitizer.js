const fs = require('fs');
const { JSDOM } = require("jsdom");
const DOMPurify = require('dompurify')(new JSDOM().window);
const { blockedSites } = require('../config/config.js');

const sanitizeMessage = (html) => {
  console.log('перед строкой const sanitizedHtml', DOMPurify);
  const sanitizedHtml = DOMPurify.sanitize(html);

  const socialMediaRegex = new RegExp(`^(https?:\\/\\/)?(www\\.)?(${blockedSites.map(site => site.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})$`, 'i');

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\+?[1-9]\d{1,14}/g;
  const telegramRegex = /@[a-zA-Z0-9_]+/g;

  let result = sanitizedHtml.replace(socialMediaRegex, '[ссылка на запрещенный сайт скрыта]');
  result = result.replace(emailRegex, '[адрес электронной почты скрыт]');
  result = result.replace(phoneRegex, '[номер телефона скрыт]');
  result = result.replace(telegramRegex, '[ссылка на Telegram скрыта]');
  return result;
};

module.exports = sanitizeMessage;
