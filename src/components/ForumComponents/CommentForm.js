import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Импорт стилей

const CommentForm = ({ newComment, setNewComment, onSubmit, onCancel }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const blockedDomains = ['example.com', 'malicious-site.com'];

  // Определяем модули для ReactQuill
  const modules = {
    toolbar: [
      // Группа 1: Базовые стили
      ['bold', 'italic', 'underline', 'strike'], // Жирный, курсив, подчеркнутый, зачеркнутый
     
      // Группа 2: Списки
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],

      // Группа 3: Ссылки, изображения, видео (если нужны)
      ['link' ],

      // Группа 5: Очистка форматирования
      ['clean']                                   // Удалить форматирование

      // ЗАМЕТЬТЕ: опции 'header' здесь НЕТ
      // Если бы она была, она выглядела бы так:
      // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      // или просто
      // [{ 'header': 1 }, { 'header': 2 }], // Только H1 и H2
    ]
  };

  // (Опционально) Определяем форматы, которые будут разрешены
  // Если вы не указываете форматы, Quill разрешает все, что есть на тулбаре.
  // Рекомендуется указывать явно, чтобы не пропустить что-то лишнее, если
  // пользователь вставит HTML извне.
  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align'
    // 'header' здесь также отсутствует
  ];

  const handleCommentChange = (value) => {
    setNewComment(value);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateLink = (text) => {
    // Регулярное выражение для поиска URL
    const urlPattern = `/https?://[^s/$.?#].[^s]*/g`; // Для ссылок с http/https
    const plainUrlPattern = `/(^|[^/])(www.[^s]+)/g`; // Для ссылок без протокола (www)

    // Находим все URL в тексте
    const urls = text.match(urlPattern) || [];
    
    // Находим ссылки без протокола и добавляем http://
    const plainUrls = text.match(plainUrlPattern) || [];
    for (const match of plainUrls) {
        const fullUrl = `http://${match.trim()}`;
        urls.push(fullUrl);
    }

    // Проверяем каждую найденную ссылку
    for (const url of urls) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            if (blockedDomains.includes(domain)) {
                return false; // Если домен в списке запрещенных, возвращаем false
            }
        } catch (error) {
            return false; // Если URL некорректен, возвращаем false
        }
    }
    
    return true; // Если все ссылки допустимы, возвращаем true
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setErrorMessage('Комментарий не может быть пустым');
      return;
    }
    if (!validateLink(newComment)) {
      setErrorMessage('Содержит недопустимые ссылки');
      return;
    }
    onSubmit(e); // Вызов функции отправки
  };

  return (
    <form onSubmit={handleSubmit}>
      <ReactQuill
        theme="snow" // или "bubble"
        className="mt-3"
        value={newComment}
        modules={modules}
        formats={formats} // Опционально, но рекомендуется
        onChange={handleCommentChange}
        placeholder="Напишите ваш комментарий"
      />
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button 
      type="submit" 
      className="btn button-btn button-btn-primary btn-sm mt-3 mb-3">Опубликовать
      </button>
      <button 
        type="button" 
        className="btn button-btn button-btn-outline-primary btn-sm mt-3 mb-3"
        onClick={onCancel}>Закрыть</button>
    </form>
  );
};

export default CommentForm;
