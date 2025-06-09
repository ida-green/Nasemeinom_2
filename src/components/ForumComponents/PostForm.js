import React, { useState } from 'react';
import ReactQuill from 'react-quill'; // Импортируем ReactQuill
import 'react-quill/dist/quill.snow.css'; // Импортируем стили для редактора

const PostForm = ({ newPost, setNewPost, onSubmit, setIsPostFormVisible }) => {
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

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

  const handleTitleChange = (e) => {
    setNewPost((prev) => ({ ...prev, title: e.target.value }));
    if (titleError) {
      setTitleError('');
    }
  };

  const handleContentChange = (value) => {
    setNewPost((prev) => ({ ...prev, content: value })); // Обновляем содержимое с помощью значения из редактора
    if (contentError) {
      setContentError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasError = false;
    if (!newPost.title.trim()) {
      setTitleError('Заголовок не может быть пустым');
      hasError = true;
    }
    if (!newPost.content.trim()) {
      setContentError('Содержимое не может быть пустым');
      hasError = true;
    }
    if (hasError) {
      return;
    }
    onSubmit({ ...newPost }); // Передаем новый пост без преобразования
  };
  
  return (
    <div className="post-form-wrapper">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="post-form-header"
            value={newPost.title}
            onChange={handleTitleChange} // Используем handleTitleChange
            placeholder="Заголовок поста"
          />
          {titleError && <div className="error-message">{titleError}</div>}
          
          <ReactQuill
            theme="snow" // или "bubble"
            className="mt-3"
            value={newPost.content}
            modules={modules}
            formats={formats} // Опционально, но рекомендуется
            onChange={handleContentChange} // Используем handleContentChange
            placeholder="Напишите ваш пост"
          />
          {contentError && <div className="error-message">{contentError}</div>}
          
          <button 
          type="submit" 
          className="btn button-btn button-btn-primary btn-sm mt-3 mb-3">Опубликовать</button>
          {/* Кнопка "Закрыть" */}
          <button 
              type="button" 
              className="btn button-btn button-btn-outline-primary btn-sm mt-3 mb-3"
              onClick={() => setIsPostFormVisible(false)}>Закрыть</button>
        </form>
      </div>
  );
};

export default PostForm;
