
// FavouriteContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { API_URL } from '../config';

const FavouriteContext = createContext();

export const useFavourite = () => {
    const { user, loading: authLoading } = useAuth();
    const [favouriteItems, setFavouriteItems] = useState([]);
    const [favouriteId, setFavouriteId] = useState(null);
    const [error, setError] = useState(null);
    const [loadingFavourite, setLoadingFavourite] = useState(true);
    
        // Получение корзины по userId
    const fetchFavouriteByUserId = useCallback(async () => {
        if (!user || !user.id) {
            console.error("Пользователь не аутентифицирован или ID пользователя отсутствует");
            return;
        }
    
        try {
            setLoadingFavourite(true);
            const response = await axios.get(`http://localhost:3000/api/favourite/user/${user.id}`);
            
            // Извлекаем favouriteId из ответа
            const { id: favouriteId, favouritecourses } = response.data;
    
            // Устанавливаем favouriteId
            setFavouriteId(favouriteId);
    
            // Преобразуем favouritecourses в нужный формат, чтобы установить в favouriteItems
            const courses = favouritecourses.map(item => ({
                course: item.course,
                purchasedPrice: item.purchasedPrice
            }));
    
            setFavouriteItems(courses);
            setError(null);
        } catch (error) {
            setError("Ошибка при получении избранного по userId");
            console.error("Ошибка при получении избранного по userId:", error);
        } finally {
            setLoadingFavourite(false);
        }
    }, [user]);

   // Добавляем useEffect для вызова fetchFavouriteByUserId при изменении user
   useEffect(() => {
    if (user && user.id) {
        fetchFavouriteByUserId();
    }
}, [user, fetchFavouriteByUserId]);


    // Функция для добавления товара в корзину
    const addItemToFavourite = useCallback(async (course, purchasedPrice) => {
        if (!favouriteId) {
            console.error('Favourite ID not found');
            return;
        }
    
        // Сразу добавляем курс в favouriteItems
        setFavouriteItems(prevItems => [...prevItems, { course, purchasedPrice }]);
    
        try {
            // setLoadingFavourite(true);
            setError(null);
    
            const response = await axios.post(`http://localhost:3000/api/favourite/${favouriteId}/add`, {
                courseId: course.id,
                purchasedPrice,
            });
    
            if (response.status === 200) {
                // После успешного добавления вызываем fetchFavouriteByUserId
           
                setError(null);
            } else {
                throw new Error("Ошибка при добавлении товара");
            }
        } catch (error) {
            setError("Ошибка при добавлении товара");
            console.error("Ошибка при добавлении товара:", error);
    
            // Удаляем временный элемент из корзины, если произошла ошибка
            setFavouriteItems(prevItems => prevItems.filter(item => item.course.id !== course.id));
        } finally {
            //setLoadingFavourite(false);
        }
    }, [favouriteId, fetchFavouriteByUserId]);
    
    // Функция для удаления товара из корзины
    const removeItemFromFavourite = useCallback(async (courseId) => {
        if (!favouriteId) {
            console.error("favouriteId отсутствует");
            return;
        }
        try {
            // setLoadingFavourite(true);
            await axios.delete(`http://localhost:3000/api/favourite/${favouriteId}/course/${courseId}`);
            // После успешного удаления обновите состояние корзины
            setFavouriteItems(prevItems => prevItems.filter(item => item.course.id !== courseId));
            setError(null);
        } catch (error) {
            setError("Ошибка при удалении элемента из корзины");
            console.error("Ошибка при удалении элемента из корзины:", error);
        } // finally { setLoadingFavourite(false); } 
    }, [favouriteId]);

    // Функция для обновления цены товара в избранном, если есть опции цены
    const updateItemPriceInFavourite = useCallback(async (courseId, newPrice) => {
        if (!favouriteId) {
            console.error('Favourite ID not found');
            return;
        }
    
        try {
            // setLoadingFavourite(true);
            setError(null);
    
            const response = await axios.put(`http://localhost:3000/api/favourite/${favouriteId}/courses/${courseId}/price`, {
                newPrice,
            });
    
            if (response.status === 200) {
                // Обновляем локальное состояние корзины
                setFavouriteItems(prevItems => 
                    prevItems.map(item => 
                        item.course.id === courseId ? { ...item, purchasedPrice: newPrice } : item
                    )
                );
                setError(null);
            } else {
                throw new Error("Ошибка при обновлении цены товара");
            }
        } catch (error) {
            setError("Ошибка при обновлении цены товара");
            console.error("Ошибка при обновлении цены товара:", error);
        } finally {
            // setLoadingFavourite(false);
        }
    }, [favouriteId]);

    //Считаем Итого в избранном
    const calculateTotalPrice = (favouriteItems) => {
        return favouriteItems.reduce((total, item) => {
            return total + item.purchasedPrice;
        }, 0);
    };
       
    return {
        favouriteItems,
        fetchFavouriteByUserId,
        addItemToFavourite,
        removeItemFromFavourite,
        updateItemPriceInFavourite,
        calculateTotalPrice,
        error,
        loading: loadingFavourite,
    };
};
// Вы можете создать и экспортировать провайдер для контекста
export const FavouriteProvider = ({ children }) => {
    return (
        <FavouriteContext.Provider value={useFavourite()}>
            {children}
        </FavouriteContext.Provider>
    );
};

export const useFavouriteContext = () => useContext(FavouriteContext);
