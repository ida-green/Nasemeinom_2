import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentList from './CommentList';
import usePulsate from '../../hooks/usePulsate';
import useAuth from '../../hooks/useAuth'; // Импортируем хук useAuth
import CommentForm from './CommentForm';
import EditPostForm from './EditPostForm';
import { useUserModal } from '../../contexts/UserModalContext';
import UserCardModal from '../UserCardModal';

import { useNotification } from '../../contexts/NotificationContext'; // Импортируем хук для уведомлений
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faComments as regularComments } from '@fortawesome/free-regular-svg-icons';
import { faComments as solidComments } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import 'react-quill/dist/quill.snow.css'; // Подключите это в вашем главном файле или в компоненте
import DOMPurify from 'dompurify';
import parse from 'html-react-parser'; // Для отображения постов со ссылками
import { useLinkWarning } from '../../hooks/useLinkWarning'; 

const Post = ({ post, setPosts, activeForm, setActiveForm, activeId, toggleForm }) => {
  
  const { user, token } = useAuth(); // <-- Получаем и user, и token
  const { showAuthRequiredMessage } = useNotification();
  const { openModal, modalIsOpen, closeModal, selectedUserId } = useUserModal();

  const [comments, setComments] = useState([]);
  
  // Состояние для управления видимостью комментариев
  const [showComments, setShowComments] = useState(false);
  
  // Состояние для нового комментария
  const [newComment, setNewComment] = useState(''); 
  const [showChildrenMap, setShowChildrenMap] = useState({});
  
  // Состояние для лайков
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isHeartPulsing, handleHeartClick] = usePulsate(); // Для пульсации сердечка
  
  // Состояние для хранения параметров сортировки и пагинации для комментариев
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
      sortBy: 'createdAt',
      order: 'DESC', // По умолчанию при загрузке комментариев сначала новые
  });
    
  // Состояние для проверки возможности редактирования
  const [canUserEdit, setCanUserEdit] = useState(false); 
  
  // useEffect для пересчета возможности редактирования
    useEffect(() => {
        if (!post || !post.createdAt) {
            setCanUserEdit(false);
            return;
        }

        const checkEditEligibility = () => {
            const createdAt = new Date(post.createdAt);
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
    }, [post.createdAt]); // Пересчитываем, если изменилось время создания поста

     // Общая логика для отображения кнопки
    const showEditButton = user && 
    user.id === post.user_id && 
    canUserEdit && // Проверка времени
    !(activeForm === 'editPost' && activeId === post.id); // Проверка, что форма закрыта


  const toggleChildrenVisibility = (commentId) => {
    setShowChildrenMap(prev => {
      const newShowChildrenMap = { ...prev };
      
      // Получаем всех дочерних комментариев для данного commentId
      const childComments = comments.filter(c => c.parent_id === commentId).map(c => c.id);
  
      // Если текущий комментарий был открыт, мы закрываем его и всех детей
      if (prev[commentId]) {
        childComments.forEach(childId => {
          newShowChildrenMap[childId] = false; // Скрываем вложенные комментарии
        });
      }
  
      // Переключаем видимость текущего комментария
      newShowChildrenMap[commentId] = !prev[commentId];
  
      return newShowChildrenMap;
    });
  };
 
 useEffect(() => {
    const fetchComments = async () => {
        const { sortBy, order } = sortConfig; // Извлекаем параметры сортировки
        const page = currentPage; // Текущая страница

        try {
            const response = await axios.get(`http://localhost:3000/api/forum/posts/${post.id}/comments`, {
                params: {
                    sortBy,
                    order,
                    page,
                },
            });

            // Очищаем HTML-контент комментариев перед сохранением в состояние
            const sanitizedComments = response.data.map(comment => ({
                ...comment,
                content: DOMPurify.sanitize(comment.content),
            }));
            setComments(sanitizedComments);
        } catch (error) {
            console.error('Ошибка при получении комментариев:', error);
        }
    };

    fetchComments();
}, [post.id, currentPage, sortConfig]); // Обновляем зависимости useEffect

 

// Функция для обработки изменения сортировки
const handleSortChange = (event) => {
  const value = event.target.value;
  let newSortBy, newOrder;

  switch (value) {
    case 'newest':
      newSortBy = 'createdAt';
      newOrder = 'DESC';
      break;
    case 'oldest':
      newSortBy = 'createdAt';
      newOrder = 'ASC';
      break;
    case 'popular':
      newSortBy = 'popularity'; // Убедитесь, что сервер поддерживает 'popularity'
      newOrder = 'DESC'; // Обычно популярные отображаются от самых популярных
      break;
    default:
      newSortBy = 'createdAt';
      newOrder = 'DESC';
  }
  setSortConfig({ sortBy: newSortBy, order: newOrder });
};

// Определяем текущее выбранное значение для select на основе sortConfig
const getCurrentSortValue = () => {
  if (sortConfig.sortBy === 'createdAt' && sortConfig.order === 'DESC') return 'newest';
  if (sortConfig.sortBy === 'createdAt' && sortConfig.order === 'ASC') return 'oldest';
  if (sortConfig.sortBy === 'popularity' && sortConfig.order === 'DESC') return 'popular'; // или ASC если так нужно
  return 'newest'; // Значение по умолчанию
};


// Функция для получения лайков к посту и проверки, поставил ли пользователь лайк
  useEffect(() => {
    const fetchLikes = async () => {
        if (!post || !post.id) { // Добавим проверку, что post и post.id существуют
            console.log('Post или post.id не определены, лайки не загружаются.');
            return;
        }

        try {
            // Формируем URL с query-параметрами
            const params = new URLSearchParams({
                likeable_type: 'post', // Указываем, что лайки для поста
                likeable_id: post.id   // ID конкретного поста
            });

            // Новый URL запроса
            const response = await axios.get(`http://localhost:3000/api/likes?${params.toString()}`);
            // response.data теперь должен быть массивом объектов лайков для этого поста

            setLikesCount(response.data.length); // Количество лайков - это длина массива

            // Проверяем, поставил ли текущий пользователь лайк
            if (user && user.id) {
                // response.data - это массив лайков, каждый лайк должен содержать user_id того, кто лайкнул
                const userHasLiked = response.data.some(like => like.user_id === user.id);
                setHasLiked(userHasLiked);
            } else {
                setHasLiked(false); // Если пользователя нет, он точно не лайкал
            }

        } catch (error) {
            console.error('Ошибка при получении лайков:', error);
            // Можно добавить специфическую обработку ошибок, если сервер возвращает детальную информацию
            // Например, если error.response.data.message есть, можно его показать
            setLikesCount(0); // В случае ошибки, можно сбросить счетчик
            setHasLiked(false);
        }
    };

    fetchLikes(); // Вызываем функцию при загрузке компонента или изменении зависимостей
}, [post, user]); // Зависимости: post (или post.id) и user (или user.id)
                  // Если post - это объект, лучше использовать post.id, чтобы избежать лишних перезапусков,
                  // если меняются другие поля post, не влияющие на лайки.
                  // Но если post целиком может меняться, то post в зависимостях нормально.


  // Обработчик клика для показа/скрытия комментариев
  const toggleComments = () => {
    setShowComments(prevShowComments => {
      const newShowComments = !prevShowComments;
  
      // Если мы скрываем комментарии, сбрасываем показ дочерних комментариев
      if (!newShowComments) {
        setShowChildrenMap({});
      }
  
      return newShowComments;
    });
  };
  

  // Отправляем новый комментарий
  const handleCommentSubmit = async (e, parentId = null) => {
    e.preventDefault();

    // Санитизация контента комментария
    const cleanComment = DOMPurify.sanitize(newComment, {
      USE_PROFILES: {html: true},
      // Или ваши явные настройки тегов/атрибутов
    });

    // **ШАГ 1: Получить токен (уже должен быть доступен из useAuth())**
    const authToken = token; // Используем переменную token из useAuth()

    // Проверяем наличие токена
    if (!authToken) {
      console.error('Пользователь не аутентифицирован. Нельзя добавить комментарий.');
      // Логика для перенаправления на вход или показа модального окна
      // Например: alert('Для добавления комментария необходимо войти.');
      return; // Прекращаем выполнение функции
    }

    try {
      // **ШАГ 2: Отправить POST запрос БЕЗ userId в теле и С токеном в заголовках**
      const response = await axios.post('http://localhost:3000/api/forum/comments',
        { // Тело запроса - только необходимые данные
          content: cleanComment,
          // УДАЛЯЕМ userId из тела запроса!
          // userId: user.id, // <-- Удалить/закомментировать эту строку
          postId: post.id,
          parentId: parentId,
        },
        { // Объект конфигурации Axios для заголовков
          headers: {
            Authorization: `Bearer ${authToken}`, // Добавляем токен
            'Content-Type': 'application/json', // Обычно нужен этот заголовок
          },
        }
      );

      if (response.status === 201) {
        // **ШАГ 3: Используем данные, возвращенные бэкендом (response.data)**
        // Бэкенд должен вернуть полный объект комментария, включая ID, user info, timestamps и т.д.
        const newCommentData = response.data;

        // Добавляем НОВЫЙ объект комментария (из response.data) в состояние
        // Важно: Если комментарий является ответом, вам может понадобиться
        // более сложная логика для вставки его в правильное место в структуре данных
        // (например, как дочерний элемент родительского комментария).
        // Этот пример просто добавляет его в конец общего списка, что может быть некорректно для тредов.
        // Адаптируйте эту часть под вашу структуру данных комментариев.
        setComments(prevComments => [...prevComments, newCommentData]);

        setNewComment(''); // Очищаем поле ввода
        setActiveForm(null); // Закрываем форму ответа
        if (!showComments) {
          setShowComments(true); // Показываем комментарии, если они были скрыты
        }

        // Логика для показа дочерних комментариев, если это ответ
        if (parentId) {
          setShowChildrenMap(prev => ({
            ...prev,
            [parentId]: true,
          }));
        }

        // Опционально: сообщение об успехе
        // alert('Комментарий успешно добавлен!');

      } else {
        // Обработка других успешных статусов, если необходимо
        console.warn('Комментарий отправлен, но получен неожиданный статус:', response.status);
      }
    } catch (error) {
      // Улучшенная обработка ошибок, аналогичная handlePostSubmit
      console.error('Ошибка при отправке комментария:', error.response ? (error.response.data.message || error.response.data || error.response.statusText) : error.message);

      if (error.response) {
           if (error.response.status === 401 || error.response.status === 403) {
               console.error('Пользователь не аутентифицирован или не имеет прав для добавления комментария.');
               // Логика для перенаправления на вход/показа модального окна
           } else if (error.response.status === 400) {
               console.error('Ошибка валидации данных комментария:', error.response.data.errors);
               // Отображение ошибок валидации пользователю
           } else {
               console.error('Ошибка сервера при создании комментария:', error.response.status);
           }
      } else {
           console.error('Сетевая ошибка или другая проблема при добавлении комментария:', error.message);
      }
    }
  };
    

// Функция для добавления лайка к посту
const addLike = async () => {
  if (!user || !user.id) { 
    showAuthRequiredMessage(); 
    return;
  }

   // **ШАГ 1: Получить токен (уже должен быть доступен из useAuth())**
    const authToken = token; // Используем переменную token из useAuth()

    // Проверяем наличие токена
    if (!authToken) {
      console.error('Пользователь не аутентифицирован. Нельзя добавить комментарий.');
      // Логика для перенаправления на вход или показа модального окна
      // Например: alert('Для добавления комментария необходимо войти.');
      return; // Прекращаем выполнение функции
    }

  try {
    // Используем универсальный эндпоинт без передачи user_id
    await axios.post(`http://localhost:3000/api/likes`, {
      likeable_type: 'post', // Тип объекта, который лайкаем
      likeable_id: post.id,  // ID поста, который лайкаем
      // user_id: user.id, // Убираем user_id, так как он больше не нужен
    },
   { // Объект конфигурации Axios для заголовков
          headers: {
            Authorization: `Bearer ${authToken}`, // Добавляем токен
            'Content-Type': 'application/json', // Обычно нужен этот заголовок
          },
        });
    setLikesCount(prevCount => prevCount + 1);
    setHasLiked(true);
  } catch (error) {
    console.error('Ошибка при добавлении лайка:', error);
  }
};

// Функция для удаления лайка с поста
const removeLike = async () => {
  if (!user || !user.id) { // Проверяем, существует ли user и есть ли у него id
    showAuthRequiredMessage(); // Показываем уведомление о необходимости авторизации
    return;
  }

  // ШАГ 1: Получить токен (уже должен быть доступен из useAuth())
  const authToken = token; // Используем переменную token из useAuth()

  // Проверяем наличие токена
  if (!authToken) {
    console.error('Пользователь не аутентифицирован. Нельзя удалить лайк.');
    return; // Прекращаем выполнение функции
  }

  try {
    // Используем универсальный эндпоинт для удаления лайка без передачи user_id
    await axios.delete(`http://localhost:3000/api/likes`, {
      data: {
        likeable_type: 'post',
        likeable_id: post.id,
        // user_id: user.id, // Убираем user_id
      },
      headers: {
        Authorization: `Bearer ${authToken}`, // Добавляем токен
        'Content-Type': 'application/json', // Указываем тип контента
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
  LinkWarningDialog // Получаем компонент диалога
} = useLinkWarning();

if (!post || !post.content) {
  return null;
}

// Получаем опции из хука для перехода по внешним ссылкам
const parserOptions = getParserOptions(); 

// Обновление поста в списке для отображения сразу после редактирования
const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts =>
        prevPosts.map(post =>
            post.id === updatedPost.id ? updatedPost : post
        )
    );
};

   return (
   <div className="container-fluide">
  <div id={`post-${post.id}`} className="post-card">
      {/* Meta информация */}
      <div className="post-meta">
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>
      </div>

      {/* Заголовок поста */}
      <h2 className="post-title">{post.title}</h2>

      {/* Аватар пользователя и имя */}
        <img 
        className="comment-user-avatar" 
        src={post.User.userImageUrl} 
        alt={`Аватар пользователя ${post.User.name}`}
        onClick={() => openModal(post.User.id)} />
        <UserCardModal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            selectedUserId={selectedUserId} // Используем selectedUserId из контекста
        />

        <div className="post-user-name">{post.User.name}</div>
      
      {/* Содержимое поста */}
      <div className="post-content">
          {parse(post.content, parserOptions)}
      </div>

      {/* Динамическое поведение */}
      <LinkWarningDialog
        visible={warningVisible}
        url={clickedUrl}
        onConfirm={handleConfirmNavigation}
        onClose={handleCloseWarning}
      />

      {/* Иконка с количеством комментариев и возможность лайка */}
      <div className="post-meta d-flex align-items-center">

        <div onClick={toggleComments} className="comment-button">
          <button className="custom-button d-flex align-items-center">
            <FontAwesomeIcon 
              icon={comments.length > 0 ? (showComments ? regularComments : solidComments) : regularComments} 
              className="fa-lg me-1" 
            />
            {comments.length > 0 ? comments.length : 0}
          </button>
        </div>
            
        <div onClick={handleLikeClick} style={{ cursor: 'pointer' }} className="custom-button ms-3">
          <FontAwesomeIcon 
            icon={hasLiked ? solidHeart : regularHeart} 
            className={`fa-lg me-1 ${hasLiked ? 'text-danger' : ''} ${isHeartPulsing ? 'pulse' : ''}`} 
          />
          <span>{likesCount}</span>
        </div>

         {/* Кнопка для открытия/закрытия формы комментария */}
      {activeId !== post.id || activeForm !== 'post' ? (
        <button className="custom-button ms-3" onClick={() => toggleForm(post.id, 'post')}>
          Ответить
        </button>
      ) : null}

      {/* Отображение кнопки редактирования */}
            {showEditButton && (
                <button
                    className="custom-button ms-3"
                    onClick={() => toggleForm(post.id, 'editPost')}
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                </button>
            )}
      </div>

    {activeForm === 'editPost' && activeId === post.id && (
      <div>
        <EditPostForm
          post={post}
          onCancel={() => toggleForm(post.id, 'editPost')}
          onPostUpdated={handlePostUpdated}
        >
        </EditPostForm>
      </div>
    )}  

    {activeForm === 'post' && activeId === post.id && (
        <div>
          <CommentForm 
            newComment={newComment} 
            setNewComment={setNewComment} 
            onSubmit={(e) => handleCommentSubmit(e)} // Передаем функцию отправки
            onCancel={() => toggleForm(post.id, 'post')}
          />
        </div>
      )}

      {/* Компонент для управления сортировкой */}
        {comments.length > 0  && showComments && (
        <div className="sort-options post-meta">
          <label htmlFor="comment-sort">Сортировать комментарии: </label>
          <select
            id="comment-sort"
            className="mt-1"
            value={getCurrentSortValue()} // Устанавливаем текущее значение
            onChange={handleSortChange}    // Обработчик изменения
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>
            )}
      
      <div className={`comments-container ${showComments ? 'open' : ''}`}>
      {/* Отображение списка комментариев, если showComments равно true */}
      
      {showComments && (
        <CommentList 
          comments={comments} 
          setComments={setComments}
          postTitle={post.title}
          postId={post.id}  
          newComment={newComment} 
          setNewComment={setNewComment} 
          onSubmit={handleCommentSubmit} 
          activeForm={activeForm}
          activeId={activeId}
          toggleForm={toggleForm}
          showChildrenMap={showChildrenMap}
          toggleChildrenVisibility={toggleChildrenVisibility}
         />
      )}
    </div>

    {showComments && comments.length > 0 && (
    <div className="post-meta" onClick={toggleComments} style={{ cursor: 'pointer' }}>Свернуть все комментарии к этому посту</div>
    )}
    </div>
   </div>  
  );
};

export default Post;
