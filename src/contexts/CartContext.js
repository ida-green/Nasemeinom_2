import { createContext, useContext, useMemo } from 'react';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { getGuestIdFromLocalStorage, setGuestIdToLocalStorage } from '../utils';
import { API_URL } from '../config';

const CartContext = createContext();

export const useCart = () => {
    const { user, loading: authLoading } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [error, setError] = useState(null);
    const [loadingCart, setLoadingCart] = useState(true);

    
    // Функция для получения корзины по ID (fetchCartById)
    const fetchCart = useCallback(async (id) => {
        try {
            setLoadingCart(true);
            const response = await axios.get(`${API_URL}/api/cart/${id}`);
            const courses = response.data.cartcourses.map(item => ({
                course: item.course,
                purchasedPrice: item.purchasedPrice // или как вы храните цену
            }));
            setCartItems(courses); // Устанавливаем полученные курсы в состояние
            setError(null);
        } catch (error) {
            setError("Ошибка при получении корзины");
            console.error("Ошибка при получении корзины:", error);
        } finally {
            setLoadingCart(false);
        }
    }, []);

    // Получение корзины по userId
    const fetchCartByUserId = useCallback(async () => {
        if (!user || !user.id) {
            console.error("Пользователь не аутентифицирован или ID пользователя отсутствует");
            return;
        }
    
        try {
            setLoadingCart(true);
            const response = await axios.get(`http://localhost:3000/api/cart/user/${user.id}`);
            
            // Извлекаем cartId из ответа
            const { id: cartId, cartcourses } = response.data;
    
            // Устанавливаем cartId
            setCartId(cartId);
    
            // Преобразуем cartcourses в нужный формат, чтобы установить в cartItems
            const courses = cartcourses.map(item => ({
                course: item.course,
                purchasedPrice: item.purchasedPrice,
                purchasedPriceDescription: item.purchasedPriceDescription
            }));
    
            setCartItems(courses);
            setError(null);
        } catch (error) {
            setError("Ошибка при получении корзины по userId");
            console.error("Ошибка при получении корзины по userId:", error);
        } finally {
            setLoadingCart(false);
        }
    }, [user]);

   // Добавляем useEffect для вызова fetchCartByUserId при изменении user
   useEffect(() => {
    if (user && user.id) {
        fetchCartByUserId();
    }
}, [user, fetchCartByUserId]);


    // Функция для добавления товара в корзину
    const addItemToCart = useCallback(async (course, purchasedPrice) => {
        if (!cartId) {
            console.error('Cart ID not found');
            return;
        }
    
        // Сразу добавляем курс в cartItems
        setCartItems(prevItems => [...prevItems, { course, purchasedPrice }]);
    
        try {
            // setLoadingCart(true);
            setError(null);
    
            const response = await axios.post(`http://localhost:3000/api/cart/${cartId}/add`, {
                courseId: course.id,
                purchasedPrice,
            });
    
            if (response.status === 200) {
                // После успешного добавления вызываем fetchCartByUserId
           
                setError(null);
            } else {
                throw new Error("Ошибка при добавлении товара");
            }
        } catch (error) {
            setError("Ошибка при добавлении товара");
            console.error("Ошибка при добавлении товара:", error);
    
            // Удаляем временный элемент из корзины, если произошла ошибка
            setCartItems(prevItems => prevItems.filter(item => item.course.id !== course.id));
        } finally {
            //setLoadingCart(false);
        }
    }, [cartId, fetchCartByUserId]);
    

    // Функция для удаления товара из корзины
    const removeItemFromCart = useCallback(async (courseId) => {
        if (!cartId) {
            console.error("cartId отсутствует");
            return;
        }
        try {
            // setLoadingCart(true);
            await axios.delete(`http://localhost:3000/api/cart/${cartId}/course/${courseId}`);
            // После успешного удаления обновите состояние корзины
            setCartItems(prevItems => prevItems.filter(item => item.course.id !== courseId));
            setError(null);
        } catch (error) {
            setError("Ошибка при удалении элемента из корзины");
            console.error("Ошибка при удалении элемента из корзины:", error);
        } // finally { setLoadingCart(false); } 
    }, [cartId]);

    // Функция для обновления цены товара в корзине, если есть опции цены
    const updateItemPriceInCart = useCallback(async (courseId, newPrice) => {
        if (!cartId) {
            console.error('Cart ID not found');
            return;
        }
    
        try {
            // setLoadingCart(true);
            setError(null);
    
            const response = await axios.put(`http://localhost:3000/api/cart/${cartId}/courses/${courseId}/price`, {
                newPrice,
            });
    
            if (response.status === 200) {
                // Обновляем локальное состояние корзины
                setCartItems(prevItems => 
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
            // setLoadingCart(false);
        }
    }, [cartId]);

    //Считаем Итого в корзине
    const calculateTotalPrice = (cartItems) => {
        return cartItems.reduce((total, item) => {
            return total + item.purchasedPrice;
        }, 0);
    };
    

   
    return {
        cartItems,
        fetchCartByUserId,
        addItemToCart,
        removeItemFromCart,
        updateItemPriceInCart,
        calculateTotalPrice,
        error,
        loading: loadingCart,
    };
};
// Вы можете создать и экспортировать провайдер для контекста
export const CartProvider = ({ children }) => {
    return (
        <CartContext.Provider value={useCart()}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => useContext(CartContext);
