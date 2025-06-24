import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Post from './Post';
import PostForm from './PostForm';
import useAuth from '../../hooks/useAuth'; // Импортируем хук useAuth
import { useNotification } from '../../contexts/NotificationContext'; // Импортируем хук для уведомлений
import DOMPurify from 'dompurify';
import Pagination from '../Pagination'; // Импорт компонента пагинации

const Forum = () => {
  const { user, token } = useAuth(); // <-- Получаем и user, и token
  const { showAuthRequiredMessage } = useNotification();

  const [isLoading, setIsLoading] = useState(false); // Для индикации загрузки
  const [error, setError] = useState(null); // Для отображения ошибок

  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isPostFormVisible, setIsPostFormVisible] = useState(false); // Состояние для управления видимостью формы для написания поста

  const [activeForm, setActiveForm] = useState(null); // 'post', 'comment' или null
  const [activeId, setActiveId] = useState(null); // хранит ID активного поста или комментария
  
  // Состояния для параметров запроса
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'createdAt', // Поле для сортировки по умолчанию
    order: 'DESC',       // Направление по умолчанию (новые сначала)
  });

  //Состояния для пагинации
  const [postsPerPage, setPostsPerPage] = useState(5);// Количество постов на страницу
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState([]); // Используем posts для отображения постов
   
  const handlePageChange = (page) => {
    setCurrentPage(page); // Обновляем currentPage напрямую
  };

  // Функция для переключения формы комментария
const toggleForm = (id, formType) => {
  if (!user) { // Проверяем, авторизован ли пользователь
    showAuthRequiredMessage(); // Показываем сообщение о необходимости авторизации
    return; // Прерываем выполнение функции
  }

  // Если форма уже открыта для данного идентификатора, закрываем её
  if (activeForm === formType && activeId === id) {
    setActiveForm(null);
    setActiveId(null);
  } else {
    // Закрываем форму для поста, если она открыта
    if (isPostFormVisible) {
      setIsPostFormVisible(false);
    }
    
    // Открываем новую форму и устанавливаем её тип и идентификатор
    setActiveForm(formType);
    setActiveId(id);
  }
};

// Форма для написания поста
const togglePostForm = () => {
  if (!user) { 
    showAuthRequiredMessage(); 
    return; 
  }

  // Закрываем форму комментария, если она открыта
  if (activeForm) {
    setActiveForm(null);
    setActiveId(null);
  }

  // Переключаем видимость формы для поста
  setIsPostFormVisible(prevState => !prevState);
  setNewPost({ title: '', content: '' });
};


// Функция для загрузки постов
 const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: postsPerPage,
        sortBy: sortConfig.sortBy,
        order: sortConfig.order,
      });

      const response = await axios.get(`http://localhost:3000/api/forum/posts?${params.toString()}`);
     
      const sanitizedPosts = response.data.posts.map(post => ({
        ...post,
      }));

      setPosts(sanitizedPosts); // Обновляем posts
      setTotalPages(Math.ceil(response.data.totalPosts / postsPerPage));
    } catch (err) {
      console.error('Ошибка при получении постов:', err);
      setError(err.message || 'Не удалось загрузить посты.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, postsPerPage, sortConfig]);

   useEffect(() => {
    fetchPosts();
  }, [fetchPosts, currentPage]);

  useEffect(() => {
  console.log('Посты после обновления состояния:', posts);
}, [posts]); // Важно: здесь posts в массиве зависимостей


  // Обработчик изменения сортировки (вызывается из вашего UI)
  const handleSortChange = (newSortBy, newOrder) => {
    setSortConfig({ sortBy: newSortBy, order: newOrder });
    setCurrentPage(1); // Сбрасываем на первую страницу при смене сортировки
  };

  if (isLoading) {
    return <p>Загрузка постов...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  // Отправка нового поста
const handlePostSubmit = async (postData) => {
  const cleanContent = DOMPurify.sanitize(postData.content, {
    USE_PROFILES: { html: true },
  });

  // **Теперь переменная token доступна здесь благодаря деструктуризации useAuth()**
  const authToken = token; // <-- Используем переменную token из useAuth()

  // Проверяем наличие токена перед отправкой запроса
  if (!authToken) {
    console.error('Пользователь не аутентифицирован. Токен отсутствует.');
    // Здесь должна быть логика для перенаправления или показа модального окна входа
    // Например: navigate('/login'); или dispatch(showLoginModal());
    // alert('Для создания поста необходимо войти.'); // Простой вариант для отладки
    return; // Прекращаем выполнение функции
  }

  try {
    const response = await axios.post('http://localhost:3000/api/forum/posts',
      { // Тело запроса
        title: postData.title,
        content: cleanContent,
        // userId больше не отправляем!
      },
      { // Объект конфигурации Axios
        headers: {
          Authorization: `Bearer ${authToken}`, // Используем authToken
          'Content-Type': 'application/json',
        },
      }
    );

    // ... остальная логика обработки успешного ответа (та, что была после 201) ...
    if (response.status === 201) {
        const newPostData = response.data;
        setPosts(prevPosts => [newPostData, ...prevPosts]);
        setNewPost({ title: '', content: '' });
        setIsPostFormVisible(false);
    } else {
         console.warn('Пост отправлен, но получен неожиданный статус:', response.status);
    }

  } catch (error) {
    console.error('Ошибка при отправке поста:', error.response ? (error.response.data.message || error.response.data || error.response.statusText) : error.message);
    // ... ваша логика обработки ошибок ...
     if (error.response) {
           if (error.response.status === 401 || error.response.status === 403) {
               console.error('Пользователь не аутентифицирован или не имеет прав.');
               // Логика для перенаправления на вход/показа модального окна
           } else if (error.response.status === 400) {
               console.error('Ошибка валидации данных:', error.response.data.errors);
               // Отображение ошибок валидации пользователю
           } else {
               console.error('Ошибка сервера при создании поста:', error.response.status);
           }
      } else {
           console.error('Сетевая ошибка или другая проблема:', error.message);
      }
  }
};
    
     return (
    <div className="container">
    <div className="col-12 col-md-9">
      <div className="container mt-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><Link aria-current="page" to="/">Главная</Link></li>
            <li class="breadcrumb-item active" aria-current="page">Форум</li>
          </ol>
        </nav>
                  
      <div className="col-12">
        <h1 className="section-title h3"><span>Форум</span></h1>
      </div>
      <div className="mb-3">
    Организуем локальные сообщества семей на СО и семейные микро-классы вскладчину, встречаемся для общения и социализации детей, планируем совместные выезды для изучения окружающего мира, обмениваемся идеями, ссылками и рекомендациями, присматриваем за детьм и отвозим на кружки по-очереди, а также обсуждаем любые вопросы про семейное образование.
    <span> </span>
    <Link to="/rules">Правила форума</Link>.{/* Замените "/rules" на путь к вашей странице с правилами */}
    </div>

      {/* Скрываем кнопку "Написать пост", когда форма видима */}
      {!isPostFormVisible && (
        <button 
            className={`btn ${isPostFormVisible ? 'button-btn button-btn-outline-secondary' : 'button-btn button-btn-primary'}`}
            onClick={togglePostForm}>
            Создать новый пост
        </button>
      )}

      {!user && (
      <div className="mt-3">
        <Link 
           to="/login">
           Войти
       </Link>
       <span> или </span>
       <Link 
           to="/register">
           зарегистрироваться
       </Link>
       <span>. </span>
      </div>
      )}
   
      {isPostFormVisible && (
        <PostForm 
            newPost={newPost} 
            setNewPost={setNewPost} 
            onSubmit={handlePostSubmit}
            setIsPostFormVisible={setIsPostFormVisible} // Передаем функцию закрытия
        />
        )}

      {/* Компонент для выбора сортировки */}
      <div className="sort-options post-meta mt-3">
        <label htmlFor="sort-select">Сортировать посты: </label>
        <select 
          id="sort-select"
          className="mt-1"
          value={`${sortConfig.sortBy}-${sortConfig.order}`} // Комбинированное значение для select
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split('-');
            handleSortChange(sortBy, order);
          }}
        >
          <option value="createdAt-DESC">Сначала новые</option>
          <option value="createdAt-ASC">Сначала старые</option>
          {/* Добавьте другие опции, если они поддерживаются бэкендом */}
        </select>
      </div>

      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          setPosts={setPosts}
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeId={activeId}
          toggleForm={toggleForm}
          />
      ))}
      
      <Pagination totalPages={totalPages} onPageChange={handlePageChange} currentPage={currentPage} /> {/* Передаем currentPage */}
          
      </div>
    </div>
    </div>
  );
};

export default Forum;
