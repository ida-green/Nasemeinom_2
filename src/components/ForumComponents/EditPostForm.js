import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth'; // Импортируем хук useAuth
import ReactQuill from 'react-quill'; // Импортируем ReactQuill
import 'react-quill/dist/quill.snow.css'; // Импортируем стили для редактора

const EditPostForm = ({ post, onPostUpdated, onCancel }) => {
    const { user, token } = useAuth(); // <-- Получаем и user, и token
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);
    const [titleError, setTitleError] = useState('');
    const [contentError, setContentError] = useState('');

    const [loading, setLoading] = useState(false); // Опционально: для индикации загрузки
    const [apiError, setApiError] = useState(null); // Для ошибок от API

 // Эффект для обновления стейта, если пропс post меняется (например, если компонент переиспользуется)
    useEffect(() => {
    setTitle(post.title || '');
    setContent(post.content || '');
    setTitleError(''); // Сбрасываем ошибки при изменении поста
    setContentError('');
    setApiError(null);
    }, [post]);

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

  
     const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Сброс предыдущих ошибок
        setTitleError('');
        setContentError('');
        setApiError(null); // Сброс ошибки API

        let isValid = true; // Флаг для отслеживания ошибок валидации

        // 2. Валидация заголовка
        if (!title.trim()) {
            setTitleError('Заголовок не может быть пустым');
            isValid = false;
        }

        // 3. Валидация содержимого (учитывая ReactQuill, который может оставлять <p><br></p> для пустой строки)
        if (!content.trim() || content === '<p><br></p>') {
            setContentError('Содержимое поста не может быть пустым');
            isValid = false;
        }

        // Если есть ошибки, прерываем выполнение функции
        if (!isValid) {
            return;
        }

        // Если валидация прошла успешно, приступаем к отправке на сервер
        setLoading(true); // Устанавливаем статус загрузки
        try {
            const response = await axios.patch(
                `http://localhost:3000/api/forum/posts/${post.id}`, // Используем обратные кавычки для шаблонной строки
                {
                    title,
                    content,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Используем обратные кавычки
                    },
                }
            );

            if (response.status === 200) {
                const editedPostData = response.data; // Сервер должен вернуть обновленный пост

                if (onPostUpdated) {
                    onPostUpdated(editedPostData);
                }
                onCancel(); // Закрываем форму после успешного редактирования
            } else {
                console.warn('Пост успешно обновлен, но сервер вернул статус:', response.status);
                // В идеале, API должен возвращать 200 OK с данными или ошибку.
                // Если сюда попали, возможно, что-то пошло не так на сервере, но не критично.
            }

        } catch (error) {
            console.error('Ошибка при редактировании поста:', error);
            if (error.response) {
                console.error('Данные ошибки:', error.response.data);
                // Отображаем сообщение об ошибке от сервера
                setApiError(`Ошибка: ${error.response.data.message || 'Не удалось отредактировать пост.'}`);
            } else {
                // Для сетевых ошибок
                setApiError('Произошла сетевая ошибка. Проверьте ваше подключение.');
            }
        } finally {
            setLoading(false); // Снимаем статус загрузки независимо от результата
        }
    };

    return (
        <div>
        <div className="mt-3 mb-2">Редактирование поста</div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="post-form-header"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок поста"
          />
          {titleError && <div className="error-message">{titleError}</div>} {/* Отображение ошибки заголовка */}

          <ReactQuill
            theme="snow"
            className="mt-3"
            value={content}
            modules={modules}
            formats={formats}
            onChange={(value) => setContent(value)}
            placeholder="Напишите ваш пост"
          />
          {contentError && <div className="error-message">{contentError}</div>} {/* Отображение ошибки контента */}

          {apiError && <div className="error-message alert alert-danger mt-3">{apiError}</div>} {/* Отображение ошибки API */}

          <div>
          <button
          type="submit"
          className="btn button-btn button-btn-primary btn-sm mt-3 mb-3"
          disabled={loading} // Отключаем кнопку во время загрузки
          >
              {loading ? 'Сохранение...' : 'Опубликовать изменения'}
          </button>
          <button
              type="button"
              className="btn button-btn button-btn-outline-primary btn-sm mt-3 mb-3"
              onClick={onCancel}
              disabled={loading} // Отключаем кнопку во время загрузки
          >
              Закрыть
          </button>
          </div>
        </form>        
            </div> 
          );
};

export default EditPostForm;