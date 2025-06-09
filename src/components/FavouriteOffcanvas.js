
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavouriteContext } from '../contexts/FavouriteContext';
import useAuth from '../hooks/useAuth';

const FavouriteOffcanvas = ({ isFavouriteOpen, onFavouriteClose }) => {
    const { user, loading: authLoading } = useAuth();
    const {
        favouriteItems,
        removeItemFromFavourite,
        calculateTotalPrice,
        error,
        loading: favouriteLoading,
    } = useFavouriteContext();

    const navigate = useNavigate();

     useEffect(() => {
        if (favouriteItems.length > 0) {      
            console.log("Корзина обновилась:", favouriteItems);
        } else {
            console.log("Корзина пуста");
        }
    }, [favouriteItems]);

    if (authLoading || (favouriteLoading && user)) {
        return <div>Loading...</div>;
    }

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleCatalog = () => {
        navigate('/catalog');
    };

    const handleLoginClick = () => {
        onFavouriteClose(); // Закрываем корзину
        navigate('/login'); // Переход на страницу входа
    };

    const handleRegisterClick = () => {
        onFavouriteClose(); // Закрываем корзину
        navigate('/register'); // Переход на страницу регистрации
    };

    const totalPrice = calculateTotalPrice(favouriteItems);

    if (!isFavouriteOpen) return null;
    
    return (
        <div className={`favourite-offcanvas ${isFavouriteOpen ? 'show' : ''}`}>
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="favourite-title">Избранное</h5>
                <button type="button" className="btn-close close-favourite" aria-label="Close" onClick={onFavouriteClose}>
                </button>
            </div>
            <div className="offcanvas-body">
                {error && <div>{error}</div>}
                {!user ? (
                    <div>
                        <p>Пожалуйста, войдите в систему, чтобы добавить товары в корзину.</p>
                        <div className="mt-3">
                            <Link 
                                to="/login" 
                                className="btn button-btn button-btn-primary"
                                onClick={handleLoginClick}>Войти
                            </Link>
                            <Link 
                                to="/register" 
                                className="btn button-btn button-btn-outline-primary"
                                onClick={handleRegisterClick}>Зарегистрироваться
                            </Link>
                    </div>
                    </div>
                ) : favouriteItems.length === 0 ? (
                    <div>
                    <div>Корзина пуста</div>
                    <Link 
                        to="/catalogue" 
                        className="btn button-btn button-btn-outline-primary mt-4">
                            Каталог курсов
                    </Link>
                    </div>
                ) : (
                    favouriteItems && favouriteItems.length > 0 && favouriteItems.map((item) => (
                        <div key={item.course.id} className="favourite-items card card-body mb-1">
                        <div className="favourite-item-header">
                            <img src={item.course.img} className="favourite-item-img" alt={item.course.title} />
                            <Link to={`/course/${item.course.id}`} className="favourite-item-title">
                                    {item.course.title}
                            </Link>
                        </div>
                        <div className="favourite-item-footer">
                            <div className="favourite-item-price">{item.purchasedPrice} руб.</div>
                            <i 
                                className="fa-regular fa-trash-can" 
                                onClick={() => removeItemFromFavourite(item.course.id)} 
                                style={{ cursor: 'pointer', color: 'black' }} 
                                title="Удалить курс"
                            ></i>
                        </div>    
                    </div>
                    ))
                )}
                {user && favouriteItems.length > 0 && (
                    <div className="mt-3">
                          <div className="total-price mb-3">
                            <strong>Итого: {totalPrice.toFixed(2)} руб.</strong> 
                        </div>
                        <Link to="/checkout" className="btn button-btn button-btn-primary">Корзина</Link>
                        <Link to="/catalogue" className="btn button-btn button-btn-outline-primary">Каталог курсов</Link>
                    </div>
                )}
            </div>
        </div>
    );
    
};

export default FavouriteOffcanvas;