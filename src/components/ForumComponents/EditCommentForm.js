// EditCommentForm.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth'; // Импортируем хук useAuth
import ReactQuill from 'react-quill'; // Импортируем ReactQuill
import 'react-quill/dist/quill.snow.css'; // Импортируем стили для редактора

// Пропсы:
// - comment: объект комментария, который нужно редактировать
// - onCommentUpdated: функция, которая будет вызвана после успешного обновления комментария,
//                     ей будет передан обновленный объект комментария.
// - onCancel: функция, которая будет вызвана для закрытия формы.
const EditCommentForm = ({ comment, onCommentUpdated, onCancel }) => {
    const { user, token } = useAuth(); // Получаем и user, и token
    // У комментария нет title, поэтому только content
    const [content, setContent] = useState(comment.content);
    const [contentError, setContentError] = useState(''); // Для валидации контента
    const [apiError, setApiError] = useState()
    const [loading, setLoading] = useState()

    // Обновляем content при изменении пропса comment (если компонент переиспользуется)
    useEffect(() => {
        setContent(comment.content);
    }, [comment]);

    // Определяем модули для ReactQuill (те же, что и для поста, если они подходят)
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ]
    };

    // Определяем форматы (аналогично посту)
    const formats = [
        'bold', 'italic', 'underline', 'strike',
        'blockquote', 'code-block',
        'list', 'bullet', 'indent',
        'link',
        'align'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Простая валидация содержимого
        if (!content.trim()) {
            setContentError('Содержимое комментария не может быть пустым.');
            return;
        }
        setContentError(''); // Сброс ошибки, если она была

        try {
            const response = await axios.patch(
                `http://localhost:3000/api/forum/comments/${comment.id}`, 
                {
                    content, 
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                const editedCommentData = response.data; // Сервер должен вернуть обновленный комментарий

                // Вызываем переданную функцию для обновления списка комментариев
                if (onCommentUpdated) {
                    onCommentUpdated(editedCommentData);
                }

                onCancel(); // Закрываем форму после успешного редактирования
            } else {
                console.warn('Комментарий успешно обновлен, но сервер вернул статус:', response.status);
                // Обработка других статусов, если необходимо
            }

        } catch (error) {
            console.error('Ошибка при редактировании комментария:', error);
            if (error.response) {
                console.error('Данные ошибки:', error.response.data);
                // *** ДОБАВЬТЕ ЭТОТ ЛОГ ***
                if (error.response.data.errors && error.response.data.errors.length > 0) {
                    console.error('Конкретные ошибки валидации:', error.response.data.errors);
                    // alert(`Ошибка валидации: ${error.response.data.errors.map(err => err.msg).join(', ')}`);
                }
                // **************************

                // Отображаем сообщение об ошибке от сервера
                // Если есть ошибки валидации, можно вывести их первыми
                setApiError(error.response.data.message || error.response.data.errors?.[0]?.msg || 'Не удалось отредактировать комментарий.');
            } else {
                setApiError('Произошла сетевая ошибка. Проверьте ваше подключение.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-comment-form mt-3 border rounded">
            <div className="mt-3 mb-2">Редактирование комментария</div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="commentContent" className="form-label visually-hidden">Содержимое комментария</label>
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        placeholder="Напишите свой комментарий здесь..."
                        className={contentError ? 'is-invalid' : ''} // Добавляем класс для стилизации ошибки
                    />
                    {contentError && <div className="invalid-feedback">{contentError}</div>}
                </div>

                 <button 
                type="submit" 
                className="btn button-btn button-btn-primary btn-sm mt-3 mb-3">Опубликовать изменения
                </button>
                <button 
                    type="button" 
                    className="btn button-btn button-btn-outline-primary btn-sm mt-3 mb-3"
                    onClick={onCancel}>Закрыть</button>
            </form>
        </div>
    );
};

export default EditCommentForm;
