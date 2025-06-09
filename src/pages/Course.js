import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import axios from 'axios'; 
import '../styles/App.css';
import { useCartContext } from '../contexts/CartContext';
import { useFavouriteContext } from '../contexts/FavouriteContext';
import useAuth from '../hooks/useAuth'; 
import { useCoursePrice } from '../contexts/CoursePriceContext'; // контекст для выбранной цены товара, если есть PriceOptions
import PriceOptionsDisplay from './ProductsCatalogue/PriceOptionsDisplay';
import PriceHistoryDisplay from './ProductsCatalogue/PriceHistoryDispaly';
import SinglePriceDisplay from './ProductsCatalogue/SinglePriceDisplay';

export default function Course() {
  const { user } = useAuth(); // Получаем текущего пользователя
  const [course, setCourse] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 
  const { id } = useParams();
  
  const [isInFavourite, setIsInFavourite] = useState(false); // Состояние для отображения в избранном ли товар
  const { favouriteItems, addItemToFavourite, removeItemFromFavourite, updateItemPriceInFavourite } = useFavouriteContext();
  
  const [isInCart, setIsInCart] = useState(false); // Инициализируем как false
  const { cartItems, addItemToCart, removeItemFromCart, updateItemPriceInCart } = useCartContext();
  
  const { selectedPrice, updateSelectedPrice } = useCoursePrice();
  
  
// Функция для определения цены покупки (убрали локальное состояние)
const getPurchasedPrice = () => {
  if (course.PriceOptions && course.PriceOptions.length > 0) {
      return selectedPrice; // Используем selectedPrice из контекста
  }
  if (course.single_price) {
      return course.single_price;
  }
  if (course.PriceHistory) {
      return course.PriceHistory.new_price;
  }
  return null;
};

const purchasedPrice = getPurchasedPrice();

// Устанавливаем начальное значение selectedPrice
useEffect(() => {
  // Проверяем, есть ли опции по цене
  if (course.PriceOptions && course.PriceOptions.length > 0) {
    // Проверяем, есть ли товар в корзине
    const cartItem = cartItems.find(item => item.course.id === course.id); // Предполагаем, что у товара есть уникальный идентификатор id

    if (cartItem) {
      // Если товар уже в корзине, устанавливаем цену из корзины
      updateSelectedPrice(cartItem.purchasedPrice); // Предполагаем, что в cartItem есть поле selectedPrice
    } else {
      // Если товара нет в корзине, устанавливаем минимальную цену
      const lowestPrice = Math.min(...course.PriceOptions.map(option => parseFloat(option.price)));
      // Устанавливаем только если selectedPrice еще не установлен
      if (selectedPrice === null) {
        updateSelectedPrice(lowestPrice);
      }
    }
  }
}, [course.PriceOptions, updateSelectedPrice, cartItems, selectedPrice]);

// handlePriceChange теперь обновляет selectedPrice через контекст
const handlePriceChange = (newPrice) => {
  const priceOption = course.PriceOptions.find(option => option.price === newPrice);
  const description = priceOption ? priceOption.description : ''; // Получаем описание

  updateSelectedPrice(parseFloat(newPrice), description); // Обновляем через контекст
  const itemInCart = cartItems.find(item => item.course.id === course.id);
  if (itemInCart) {
    updateItemPriceInCart(course.id, parseFloat(newPrice));
  }
};


// CART
// Устанавливаем начальное значение isInCart - проверяем, есть ли товар в корзине
useEffect(() => {
  // Находим курс в cartItems при загрузке компонента и изменениях cartItems
  const isCourseInCart = cartItems?.some(item => item.course.id === course?.id) || false;
  setIsInCart(isCourseInCart);
}, [cartItems, course?.id]);

// Переключение: товар в корзине/не в корзине
const toggleCartItem = async () => {
  try {
    if (isInCart) {
      await removeItemFromCart(course.id);
    } else {
      await addItemToCart(course, selectedPrice.value, selectedPrice.description); // Передаем и цену, и описание
    }
    setIsInCart(!isInCart); // Переключаем состояние
  } catch (error) {
    console.error("Ошибка при изменении корзины:", error);
  }
};



//FAVOURITE
// Устанавливаем начальное значение isInFavourite - проверяем, есть ли товар в избранном
useEffect(() => {
  // Находим курс в favouriteItems при загрузке компонента и изменениях favouriteItems
  const isCourseInFavourite = favouriteItems?.some(item => item.course.id === course?.id) || false;
  setIsInFavourite(isCourseInFavourite);
}, [favouriteItems, course?.id]);

// Переключение: товар в корзине/не в избранном
const toggleFavouriteItem = async () => {
  try {
      if (isInFavourite) {
          await removeItemFromFavourite(course.id);
      } else {
          await addItemToFavourite(course, selectedPrice || purchasedPrice);
      }
          setIsInFavourite(!isInFavourite); // Переключаем состояние
  } catch (error) {
      console.error("Ошибка при изменении избранного:", error);
  }
};



// Функция для отображения цены с учетом всех вариантов
const renderPrice = () => {
  if (course.PriceOptions && course.PriceOptions.length > 0) {
    return (
      <PriceOptionsDisplay
        options={course.PriceOptions}
        isInCart={isInCart}
        selectedPrice={selectedPrice} // Это можно оставить для других нужд, если они есть
      />
    );
  } else if (course.PriceHistory) {
    return <PriceHistoryDisplay history={course.PriceHistory} />;
  } else if (course.single_price) {
    return <SinglePriceDisplay price={course.single_price} />;
  } else {
    return <div>Цена не определена</div>;
  }
};

   useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/product/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке курса:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false); // Устанавливаем loading в false после завершения запроса (успешного или неуспешного)
      }
    };

     const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке пользователей:', err);
        setError('Ошибка при загрузке данных');
      }
    };
  
    Promise.all([fetchCourse(), fetchUsers()])
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке данных:', err);
        setError('Ошибка при загрузке данных');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Загрузка...</div>; 
  }

  if (error) {
    return <div>{error}</div>; 
  }

  if (!course) {
    return <div>Курс не найден</div>;
  }

  // Извлечение автора и отзывов из полученного курса
  const author = course.Author;

  // Функция для вычисления среднего рейтинга
  const calculateAverageRating = (reviews) => {
    // Суммируем все рейтинги с помощью reduce, если массив пустой, возвращаем 0
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    
    // Возвращаем средний рейтинг или 0, если нет отзывов
    return reviews.length ? totalRating / reviews.length : 0;
};


  // Форматирование дат
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return (`${day}.${month}.${year}`);
    };
  
    const formatTime = (timeString) => {
      // Убедимся, что timeString в формате HH:mm
      const [hours, minutes] = timeString.split(':');
      
      // Проверяем на корректность
      if (hours === undefined || minutes === undefined) {
        return 'Некорректное время';
      }
    
      // Создаем объект даты с фиксированной датой
      const date = new Date(1970, 0, 1, parseInt(hours), parseInt(minutes));
      
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    };

    const getReviewLabel = (count) => {
      if (count === 0) return 'отзывов';
      if (count === 1) return 'отзыв';
      if (count >= 2 && count <= 4) return 'отзыва';
      return 'отзывов';
    };

    // Сколько раз в неделю проходят занятия
    const getTimesAWeek = (count) => {
      if (count === 1) return 'один раз в неделю';
      if (count === 2) return 'два раза в неделю';
      if (count === 3) return 'три раза в неделю';
    };

    const averageRating = calculateAverageRating(course.Reviews);

   // Проверяем наличие course перед рендерингом
   if (!course) {
    return <div>Loading...</div>; // Или любое другое сообщение о загрузке
  }

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="breadcrumbs">
              <ul>
                <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                <li><Link className="nav-link active" aria-current="page" to="/catalogue">Курсы</Link></li>
                <li><span>{course.title}</span></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card border mb-3">
          <div className="card-body text">
            <div className="row">
              {/* Изображение курса */}
              <div className="col-md-4">
                <img src={course.img} alt="изображение" className="img-thumbnail" />
                </div>
              
              {/* Информация о курсе */}
              <div className="col-md-8">
                <div className="col-12 mb-2">
                  <div className="bg-white product-content p-2 h-100">
                    
                  <small className="course-subject">
                      {course.Subjects && course.Subjects.length > 0 && (
                          course.Subjects.map((subject, index) => (
                              <span key={index} className="subject-tag">
                                  #{subject.subject} {''}
                              </span>
                          ))
                      )}
                  </small>   
                    <div> 
                    <h4><span>{course.title}</span></h4>
                    </div> 
                    <div className="short-description mt-1">
                      <p>{course.excerpt}</p>
                    </div>

                     {/* Отображение звездочек */}
                     <div className="rating">
                        {Array.from({ length: 5 }, (v, i) => (
                          <span key={i} className={i < Math.round(averageRating) ? 'filled-star' : 'empty-star'}>
                            ★
                          </span>
                        ))}

                        {course.Reviews.length > 0 && (
                          <small className="count-reviews ms-2">
                            {course.Reviews.length} {getReviewLabel(course.Reviews.length)}
                          </small>
                        )}
                    </div>

                    {author !== false && (
                    <p className="author">Автор: {author.name} {author.surname}
                    </p>)}
                           
                    <div className="product-price">
                    <div>{renderPrice()}</div> {/* Используем функцию renderPrice для отображения цены */}
                    </div>
                          
                    <div className="mt-3">
                    <button
                        type="button"
                        className="col-12 col-md-4 btn button-btn button-btn-primary"
                        onClick={toggleCartItem}
                        disabled={!course}> {/* кнопка отключается, если course не загружен */}
                    <i className="fa-solid fa-cart-shopping"></i> {isInCart ? 'Удалить из корзины' : 'Добавить в корзину'}
                    </button>

                    
                    <button 
                        type="button" 
                        className="col-12 col-md-5 btn button-btn button-btn-outline-primary"
                        onClick={toggleFavouriteItem}
                        disabled={!course}> {/* кнопка отключается, если course не загружен */} 
                        <i className="fa-regular fa-heart ms-3"></i>{isInFavourite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    </button>
                    </div>
                    <div>
                    </div>        
                    </div>
              </div>
            </div>
          </div>
        </div>

      
        <div className="row mt-2 ms-3 me-3">  
                  <div className="col-lg-2 mb-2">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title"><i className="fa-solid fa-child-reaching"></i> Для кого</h5>
                        <ul className="course-key-points">
                        {/* Проверяем наличие минимального и максимального возраста */}
                        {course.AgeMin && course.AgeMin.age_min != null && course.AgeMax && course.AgeMax.age_max != null ? (
                          <li>{course.AgeMin.age_min}-{course.AgeMax.age_max} лет</li>
                        ) : course.AgeMin && course.AgeMin.age_min != null ? (
                          <li>{course.AgeMin.age_min} лет</li>
                        ) : null}

                        {/* Проверяем наличие минимального и максимального класса */}
                        {course.GradeMin && course.GradeMin.grade_min != null && course.GradeMax && course.GradeMax.grade_max != null ? (
                          <li>{course.GradeMin.grade_min}-{course.GradeMax.grade_max} класс</li>
                        ) : course.GradeMin && course.GradeMin.grade_min != null ? (
                          <li>{course.GradeMin.grade_min} класс</li>
                        ) : null}
                      </ul>


                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 mb-2">
                      <div className="card h-100">
                          <div className="card-body">
                              <h5 className="card-title">
                                  <i className="fa-solid fa-laptop"></i> Формат
                              </h5>
                              <ul className="course-key-points">

                              
                              {course.LiveGroup && course.LiveGroup.platform && (
                                <li>{course.LiveGroup.platform}</li>
                              )}


                              {course.LiveGroup && course.LiveGroup.LiveSessions && (
                              <li>{getTimesAWeek(course.LiveGroup.LiveSessions.length)}
                              </li>
                              )} 
                               
                              {course.LiveGroup && course.LiveGroup.LiveSessions && Array.isArray(course.LiveGroup.LiveSessions) && (
                                course.LiveGroup.LiveSessions.map((s) => (
                                  <li key={s.id}>{s.day} {formatTime(s.time)} МСК</li>
                                ))
                              )}

                              {course.LiveGroup && course.LiveGroup.start_date && (
                                <li>начало {formatDate(course.LiveGroup.start_date)}</li>
                              )}

                              {(!course.LiveGroup || !course.LiveGroup.LiveSessions) && (
                                <li>Курс в записи</li>
                              )}
                            </ul>
                          </div>
                      </div>
                  </div>  

                  <div className="col-lg-3 mb-2">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="fa-regular fa-calendar"></i> Длительность</h5>
                          <ul className="course-key-points">

                            <li>Количество занятий: {course.lessons_quantity}</li>

                            {course.LiveGroup && course.LiveGroup.learn_with_record && 
                            (<li>Можно заниматься в записи</li> 
                            )}
                            <li>Доступ к записи: {course.record_available_period}</li>
                          </ul>
                      </div>
                    </div>
                  </div>            

                  {course.Aspects && course.Aspects.length > 0 && ( // Проверяем, что Aspects существует и не пустой
                      <div className="col-lg-4 mb-2">
                          <div className="card h-100">
                              <div className="card-body">
                                  <h5 className="card-title">
                                      <i className="fa-solid fa-bars-staggered"></i> Аспекты
                                  </h5>
                                  <ul className="course-key-points">
                                      {course.Aspects.map((aspect) => 
                                          <li key={aspect.id}>{aspect.aspect}</li> // Используем aspect.id как ключ
                                      )}
                                  </ul>
                              </div>
                          </div>
                      </div>
                  )}
                    
                  {/*
                  <div className="col-lg-4 mb-2">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">
                        <i class="fa-solid fa-money-bill-transfer"></i> Гарантия</h5>
                          <ul className="course-key-points">
                            <li>Инструкция придет на email</li> 
                            {course.LiveGroup && (
                                  <li>Передумали продолжать? Вы можете вернуть оплату за оставшиеся онлайн уроки</li>
                                  )} 
                            {!course.LiveGroup && (
                              <li>После оплаты - доступ сразу ко всем материалам курса</li>)
                            }
                          </ul>
                      </div>
                    </div>
                  </div>  
                  */}

        </div>
        </div>
      </div>

          <div className="row mt-3">
            <div className="col-12">
              <div className="product-content-details bg-white p-4">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#description-tab-pane" type="button" role="tab" aria-controls="description-tab-pane" aria-selected="true">Описание</button>
                  </li>
                    
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="author-tab" data-bs-toggle="tab" data-bs-target="#author-tab-pane" type="button" role="tab" aria-controls="author-tab-pane" aria-selected="false">Автор</button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews-tab-pane" type="button" role="tab" aria-controls="reviews-tab-pane" aria-selected="false">Отзывы ({course.Reviews.length})</button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="provider-tab" data-bs-toggle="tab" data-bs-target="#provider-tab-pane" type="button" role="tab" aria-controls="provider-tab-pane" aria-selected="false">Организатор</button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="video-tab" data-bs-toggle="tab" data-bs-target="#video-tab-pane" type="button" role="tab" aria-controls="video-tab-pane" aria-selected="false">Видео</button>
                  </li>
                </ul>

                <div className="tab-content" id="myTabContent">
                    
                    <div className="tab-pane fade show active" id="description-tab-pane" role="tabpanel" aria-labelledby="description-tab" tabIndex="0">
                      <p>{course.description}</p>
                    </div>
                    
                    <div className="tab-pane fade" id="author-tab-pane" role="tabpanel" aria-labelledby="author-tab" tabIndex="0">
                      <div className="row mb-3 align-items-end" >
                        <div className="col-5 col-sm-2">
                          <img src={author.img} alt="фото атора" className="img-thumbnail" />
                        </div>
                        <div className="col-7 col-sm-10">
                        <h5>{author.name} {author.surname}</h5>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-12">
                            <p>{author.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="reviews-tab-pane" role="tabpanel" aria-labelledby="reviews-tab" tabIndex="0">        
                    <div className="reviews-container">
                      {course.Reviews.length > 0 ? (
                        course.Reviews.map(review => (
                          <div className="card product-review" key={review.id}> 
                            <div className="card-body">
                              <div className="product-review-header">
                              <h5 className="card-title">
                                {users.find(user => user.id === review.user_id)?.userImageUrl ? (
                                  <img 
                                    src={users.find(user => user.id === review.user_id).userImageUrl} 
                                    alt={users.find(user => user.id === review.user_id)?.name || 'Пользователь'} 
                                    className="user-photo me-2" 
                                  />
                                ) : (
                                  <img 
                                  src="/images/users-images/user-regular.jpg"
                                  alt=""
                                  className="user-photo me-2" 
                                  />
                                )}
                                {users.find(user => user.id === review.user_id)?.name || 'Неизвестный пользователь'}
                              </h5>
                                </div>
                                <span className="review-date">{new Date(review.date).toLocaleDateString()}
                                </span>
                                <div className="rating">
                                {[...Array(5)].map((_, index) => (
                                  <span 
                                    key={index} 
                                    className={(`star ${index < review.rating ? 'filled' : 'empty'}`)}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>

                                <p>{review.review_text}</p>
                              </div>
                          </div>
                        ))
                      ) : (
                        <p>Нет отзывов для этого курса.</p>
                      )}
                    </div>
                    </div>
                    
                    <div className="tab-pane fade" id="video-tab-pane" role="tabpanel" aria-labelledby="video-tab" tabIndex="0">
                    <div className="ratio ratio-16x9">
                      {course.videoYoutubeUrl ? (
                        <iframe
                          width="560"
                          height="315"
                          src={course.videoYoutubeUrl}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        ></iframe>
                      ) : course.videoUrl ? (
                        <video src={course.videoUrl} controls></video>
                      ) : (
                        <p>У курса пока нет видео.</p>
                      )}
                    </div>
                    </div>

                    <div className="tab-pane fade show active" id="provider-tab-pane" role="tabpanel" aria-labelledby="provider-tab" tabIndex="0">
                    <div className="row">
                      {course && course.Provider && course.Provider.logo && (
                        <div>
                          <img src={course.Provider.logo} className="provider-logo mb-2" alt="Provider Logo" />
                        </div>
                      )}
                      <div className="col-12 col-md-4">{course && course.Provider ? course.Provider.title : 'Unknown Provider'}</div>
                    </div>
                    </div>  
                    
                </div>
              
              </div> 
              </div>
            </div> 
          </div> 
     
  );
}
