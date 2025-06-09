// Хук для поиска в тексте комментария или поста url и формирования ссылок
export const convertTextToLinks = (text, onClickLinkHandler) => {
  if (typeof text !== 'string') {
    return null;
  }
  if (!text.trim()) {
    return text;
  }

  const urlRegex = /(?:(?:https?|ftp):\/\/)?[\w-]+(?:\.[\w.-]+)+(?::\d+)?(?:\/[^\s]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?/gi;
  const parts = [];
  let lastIndex = 0;
  const matches = Array.from(text.matchAll(urlRegex));

  if (!matches.length) {
    return text;
  }

  matches.forEach((match, index) => {
    const url = match[0]; // Оригинальный текст URL
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    let href = url; // URL для атрибута href
    if (!url.match(/^(?:https?|ftp):\/\//i)) {
      href = `http://${url}`;
    }

    // ... (внутри matches.forEach)
    let originalUrlText = match[0]; // Текст, который нашел regex
    let hrefForTag = originalUrlText; // URL для атрибута href

    if (!/^(?:https?|ftp):\/\//i.test(hrefForTag)) {
      hrefForTag = `http://${hrefForTag}`; // Добавляем схему
    }

    parts.push(
      <a
      key={`link-${index}-${startIndex}`}
      href={hrefForTag} // Используем исправленный URL для href
      onClick={(e) => {
        if (onClickLinkHandler) {
          onClickLinkHandler(hrefForTag, e); // Передаем исправленный URL
        } else {
          window.open(hrefForTag, '_blank', 'noopener,noreferrer');
        }
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {originalUrlText} {/* Отображаем оригинальный текст, как он был вбит */}
    </a>
  );

    lastIndex = startIndex + url.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts; // Массив строк и JSX-элементов <a>
};
