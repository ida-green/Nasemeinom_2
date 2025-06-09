import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentForm from './CommentForm';
import usePulsate from '../../hooks/usePulsate';
import useAuth from '../../hooks/useAuth'; // Импортируем хук useAuth
import { useNotification } from '../../contexts/NotificationContext'; // Импортируем хук для уведомлений
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faComment as regularComment } from '@fortawesome/free-regular-svg-icons';
import { faComment as solidComment } from '@fortawesome/free-solid-svg-icons'; 
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import 'react-quill/dist/quill.snow.css'; // Подключите это в вашем главном файле или в компоненте
import parse from 'html-react-parser'; // Для отображения постов со ссылками
import { useLinkWarning } from '../../hooks/useLinkWarning'; // Обновите путь к хуку
import EditCommentForm from './EditCommentForm';

const Comment = ({ 
  comment, comments, setComments, 
  postTitle, postId, 
  newComment, setNewComment, onSubmit,
  activeForm, activeId, toggleForm,
  showChildren, toggleChildrenVisibility, showChildrenMap }) => {
  
  const { user, token } = useAuth(); // Получаем информацию о том, авторизован ли пользователь
  const { showAuthRequiredMessage } = useNotification();
  const childComments = Array.isArray(comments) ? comments.filter(c => c.parent_id === comment.id) : [];
  const [isCommentPulsing, handleCommentClick] = usePulsate();

  // Состояние для лайков
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isHeartPulsing, handleHeartClick] = usePulsate(); // Для пульсации сердечка

  // Состояние для проверки возможности редактирования
    const [canUserEdit, setCanUserEdit] = useState(false); 

   // useEffect для пересчета возможности редактирования
      useEffect(() => {
          if (!comment || !comment.createdAt) {
              setCanUserEdit(false);
              return;
          }
  
          const checkEditEligibility = () => {
              const createdAt = new Date(comment.createdAt);
              const now = new Date();
              const timeDifference = now.getTime() - createdAt.getTime(); // Разница в миллисекундах
              const hoursDifference = timeDifference / (1000 * 60 * 60); // Разница в часах
  
              const isWithin24Hours = hoursDifference <= 24;
              setCanUserEdit(isWithin24Hours);
  
              // Если время еще не вышло, запланируем следующую проверку,
              // чтобы обновить UI, когда 24 часа истекут
              if (isWithin24Hours) {
                  const timeLeftMs = (24 * 60 * 60 * 1000) - timeDifference;
                  // Запланировать re-render или скрытие кнопки, когда время истечет
                  // Добавляем небольшой запас, чтобы гарантировать, что кнопка исчезнет
                  const timeoutId = setTimeout(() => {
                      setCanUserEdit(false); // Скрыть кнопку
                  }, timeLeftMs + 1000); // +1 секунда для надежности
  
                  return () => clearTimeout(timeoutId); // Очищаем таймер при размонтировании компонента
              }
          };
  
          checkEditEligibility(); // Вызываем при монтировании и при изменении post.createdAt
  
          // Запускать проверку периодически, если нужно, но setTimeout более эффективен
          // const intervalId = setInterval(checkEditEligibility, 60 * 60 * 1000); // Раз в час, если нужно более частое обновление
          // return () => clearInterval(intervalId);
      }, [comment.createdAt]); // Пересчитываем, если изменилось время создания поста
  
       // Общая логика для отображения кнопки
      const showEditButton = user && 
                             user.id === comment.user_id && 
                             canUserEdit && // Проверка времени
                             !(activeForm === 'editComment' && activeId === comment.id); // Проверка, что форма закрыта  


  // Функция для получения лайков к комментарию и проверки, поставил ли пользователь лайк
  useEffect(() => {
    const fetchLikes = async () => {
        if (!comment || !comment.id) { // Проверка, что comment и comment.id существуют
            console.log('Комментарий или comment.id не определены, лайки не загружаются.');
            return;
        }

        try {
            // Формируем URL с query-параметрами
            const params = new URLSearchParams({
                likeable_type: 'comment', // Указываем, что лайки для комментария
                likeable_id: comment.id   // ID конкретного комментария
            });

            // Новый URL запроса
            const response = await axios.get(`http://localhost:3000/api/likes?${params.toString()}`);
            // response.data теперь должен быть массивом объектов лайков для этого комментария

            setLikesCount(response.data.length); // Количество лайков - это длина массива

            // Проверяем, поставил ли текущий пользователь лайк
            if (user && user.id) {
                // response.data - это массив лайков
                const userHasLiked = response.data.some(like => like.user_id === user.id);
                setHasLiked(userHasLiked);
            } else {
                setHasLiked(false); // Если пользователя нет, он точно не лайкал
            }

        } catch (error) {
            console.error('Ошибка при получении лайков для комментария:', error);
            setLikesCount(0);
            setHasLiked(false);
        }
    };

    fetchLikes(); // Вызываем функцию при загрузке компонента или изменении зависимостей
}, [comment, user]); // Зависимости: comment (или comment.id) и user (или user.id)
                     // Аналогично постам, если comment - объект, можно использовать comment.id для оптимизации,
                     // если меняются только другие поля comment, не влияющие на лайки.



  // Функция для добавления лайка к комментарию
const addLike = async () => {
  if (!user || !user.id) { // Проверяем, существует ли user и есть ли у него id
      showAuthRequiredMessage(); // Показываем уведомление о необходимости авторизации
      return;
  }

  try {
      // Используем универсальный эндпоинт
       await axios.post(
    'http://localhost:3000/api/likes',
    { // Это тело запроса (data)
      likeable_type: 'comment',
      likeable_id: comment.id,
    },
    { // Это объект конфигурации (config), куда добавляются заголовки
      headers: {
        Authorization: `Bearer ${token}`, // Передаем токен авторизации
        'Content-Type': 'application/json', // Это хорошая практика, хотя Axios часто устанавливает его по умолчанию
      },
    }
  );
      setLikesCount(prevCount => prevCount + 1);
      setHasLiked(true);
  } catch (error) {
      console.error('Ошибка при добавлении лайка:', error);
  }
};

// Функция для удаления лайка к комментарию
const removeLike = async () => {
  if (!user || !user.id) { // Проверяем, существует ли user и есть ли у него id
      showAuthRequiredMessage(); // Показываем уведомление о необходимости авторизации
      return;
  }

  try {
      await axios.delete(`http://localhost:3000/api/likes`, { // Это объект конфигурации
      data: { // Тело запроса для DELETE
        likeable_type: 'comment',
        likeable_id: comment.id,
        // user_id: user.id, // <-- Удаляем это поле.
                             // Сервер должен брать user_id из токена.
      },
      headers: { // Заголовки запроса
        Authorization: `Bearer ${token}`, // Передаем токен авторизации
        'Content-Type': 'application/json', // Хорошая практика
      },
    });
      setLikesCount(prevCount => prevCount - 1); // Используем предыдущее состояние для обновления
      setHasLiked(false);
  } catch (error) {
      console.error('Ошибка при удалении лайка:', error);
  }
};

// Обработчик клика по лайку
const handleLikeClick = () => {
  handleHeartClick(); // Вызываем функцию пульсации
  if (hasLiked) {
      removeLike(); // Удаляем лайк, если он уже поставлен
  } else {
      addLike(); // Добавляем лайк, если он не поставлен
  }
};

const {
  warningVisible,
  clickedUrl,
  handleCloseWarning,
  handleConfirmNavigation,
  getParserOptions,
  LinkWarningDialog
} = useLinkWarning();

if (!comment || !comment.content) {
  return null;
}

const parserOptions = getParserOptions();
 
// Обновление комментария в списке для отображения сразу после редактирования
const handleCommentUpdated = (updatedComment) => {
    setComments(prevComments =>
        prevComments.map(comment =>
            comment.id === updatedComment.id ? updatedComment : comment
        )
    );
};

// Преобразование текста ссылки на родительский коммент из HTML в обычный текст
function getPlainTextFromHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  // textContent более надежен и стандартизован, чем innerText
  return div.textContent || div.innerText || '';
}

// Перед JSX, чтобы найти родительский комментарий и извлечь текст
const parentComment = comments.find(c => c.id === comment.parent_id);
const parentCommentContentHtml = parentComment?.content;
const parentCommentPlainText = getPlainTextFromHtml(parentCommentContentHtml);

  return (
    <div className={`comment-wrapper ${comment.parent_id === null ? 'root-comment' : 'nested-comment'}`}>
      <div className="comment-container" id={`comment-${comment.id}`}>
        <div className="post-meta">
        <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString()}</time>
      </div>
        <img className="comment-user-avatar" src={comment.User.userImageUrl} alt={`${comment.User.name}аватар пользователя`} />
        <div className="comment-user-name mt-1">{comment.User.name}</div>
        {comment.parent_id ? (
          <div className="parent-comment-link">
            <strong>В ответ на: </strong>
            <a href={`#comment-${comment.parent_id}`} className="parent-comment-link">
              "{parentCommentPlainText.substring(0, 70)}{parentCommentPlainText.length > 70 ? '...' : ''}"
            </a>
          </div>
        ) : (
          <div className="post-title-link">
            <a href={`#post-${postId}`} className="post-title-link">
                    В ответ на: "{postTitle.substring(0, 70)}{postTitle.length > 70 ? '...' : ''}"
                </a>
          </div>
        )}
        <div className="comment-content">
                {parse(comment.content, parserOptions)}
            </div>
            <LinkWarningDialog
                visible={warningVisible}
                url={clickedUrl}
                onConfirm={handleConfirmNavigation}
                onClose={handleCloseWarning}
            />
        <div className="post-meta d-flex align-items-center">
          
        <div onClick={() => toggleChildrenVisibility(comment.id)}>
        {childComments.length > 0 ? (
            <>
                {showChildren ? (
                    <button className="custom-button">
                        <FontAwesomeIcon 
                        icon={regularComment} 
                        className={`fa-lg me-1 ${isCommentPulsing ? 'pulse' : ''}`} />{childComments.length}
                    </button>
                ) : (
                    <button className="custom-button">
                        <FontAwesomeIcon 
                        icon={solidComment}
                        className={`fa-lg me-1 ${isCommentPulsing ? 'pulse' : ''}`} />{childComments.length}
                    </button>
                )}
            </>
        ) : (
            <div onClick={handleCommentClick} style={{ cursor: 'pointer' }} className="custom-button">
                <FontAwesomeIcon 
                    icon={regularComment} 
                    className={`fa-lg me-1 ${isCommentPulsing ? 'pulse' : ''}`} 
                />
                <span className={isCommentPulsing ? 'pulse' : ''}>0</span>
            </div>
        )}
    </div>

          <div onClick={handleLikeClick} style={{ cursor: 'pointer' }} className="custom-button ms-3">
           <FontAwesomeIcon 
               icon={hasLiked ? solidHeart : regularHeart} 
               className={`fa-lg me-1 ${hasLiked ? 'text-danger' : ''} ${isHeartPulsing ? 'pulse' : ''}`} 
           />
           <span>{likesCount}</span>
          </div>

             {/* Кнопка для открытия/закрытия формы комментария */}
          {activeId !== comment.id || activeForm !== 'comment' ? (
            <button className="custom-button ms-3" onClick={() => toggleForm(comment.id, 'comment')}>
              Ответить
            </button>
          ) : null}

          {/* Отображение кнопки редактирования комментария*/}
            {showEditButton && (
                <button
                    className="custom-button ms-3"
                    onClick={() => toggleForm(comment.id, 'editComment')}
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                </button>
            )}
        </div>

       {activeForm === 'editComment' && activeId === comment.id && (
      <div>
        <EditCommentForm
          comment={comment}
          onCancel={() => toggleForm(comment.id, 'editComment')}
          onCommentUpdated={handleCommentUpdated}
        >
        </EditCommentForm>
      </div>
    )}  
    
      {activeForm === 'comment' && activeId === comment.id && (
        <div>
          <CommentForm 
            newComment={newComment} 
            setNewComment={setNewComment} 
             onSubmit={(e) => onSubmit (e, comment.id)}
// Передаем comment.id как parentId - чтобы оставлять комментарии к вложенныем комментариям. Без parentId они все делаются корневыми комментариями.
            onCancel={() => toggleForm(comment.id, 'comment')}
          />
        </div>
      )}  
  
        {/* Дочерние комментарии */}
        {showChildren && childComments.map(childComment => (
          <Comment 
            key={childComment.id} 
            comment={childComment} 
            comments={comments}
            setComments={setComments}
            postTitle={postTitle} 
            postId={postId} 
            newComment={newComment} 
            setNewComment={setNewComment} 
            onSubmit={onSubmit}
            activeForm={activeForm}
            activeId={activeId}
            toggleForm={toggleForm}
            showChildren={showChildrenMap[childComment.id]} // Передаем состояние видимости
            toggleChildrenVisibility={toggleChildrenVisibility} // Передаем функцию
            showChildrenMap={showChildrenMap}
          />
        ))}
      </div>
    </div>
  );
};

export default Comment;


