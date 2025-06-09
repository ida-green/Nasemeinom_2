import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';
import useAuth from '../hooks/useAuth';
import { Button } from 'react-bootstrap';

const CartOffcanvas = ({ isCartOpen, onCartClose }) => {
    const { user, loading: authLoading } = useAuth();
    const {
        cartItems,
        removeItemFromCart,
        calculateTotalPrice,
        error,
        loading: cartLoading,
    } = useCartContext();

    console.log('cartItems приходит в OffCanvas', cartItems);
    const navigate = useNavigate();

     useEffect(() => {
        if (cartItems.length > 0) {      
            console.log("Корзина обновилась:", cartItems);
        } else {
            console.log("Корзина пуста");
        }
    }, [cartItems]);

    if (authLoading || (cartLoading && user)) {
        return <div>Loading...</div>;
    }

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleCatalog = () => {
        navigate('/catalog');
    };

    const handleLoginClick = () => {
        onCartClose(); // Закрываем корзину
        navigate('/login'); // Переход на страницу входа
    };

    const handleRegisterClick = () => {
        onCartClose(); // Закрываем корзину
        navigate('/register'); // Переход на страницу регистрации
    };

    const totalPrice = calculateTotalPrice(cartItems);

    if (!isCartOpen) return null;
    
    return (
        <div className={`cart-offcanvas ${isCartOpen ? 'show' : ''}`}>
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="cart-title">Корзина</h5>
                <button type="button" className="btn-close close-cart" aria-label="Close" onClick={onCartClose}>
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
                ) : cartItems.length === 0 ? (
                    <div>
                    <div>Корзина пуста</div>
                    <Link 
                        to="/catalogue" 
                        className="btn button-btn button-btn-outline-primary mt-4">
                            Каталог курсов
                    </Link>
                    </div>
                ) : (
                    cartItems && cartItems.length > 0 && cartItems.map((item) => (
                        <div key={item.course.id} className="cart-items card card-body mb-1">
                        <div className="row d-flex">
                            <div className="col-3">
                                <img src={item.course.img} className="cart-item-img" alt={item.course.title} />
                                
                            </div>
                            <div className="col-9">
                            <Link to={`/course/${item.course.id}`} className="cart-item-title">
                                        {item.course.title}
                                </Link>
                            <div className="cart-item-price">{item.purchasedPrice} руб.</div>
                            <div className="cart-item-price-description">{item.purchasedPriceDescription}</div>
                            </div>
                        </div>
                        <div className="cart-item-footer">
                            <i 
                                className="fa-regular fa-trash-can" 
                                onClick={() => removeItemFromCart(item.course.id)} 
                                style={{ cursor: 'pointer', color: 'black' }} 
                                title="Удалить курс"
                            ></i>
                        </div>    
                    </div>
                    ))
                )}
                {user && cartItems.length > 0 && (
                    <div className="mt-3">
                          <div className="total-price mb-3">
                            <strong>Итого: {totalPrice.toFixed(2)} руб.</strong> {/* Форматируем до двух знаков после запятой */}
                        </div>
                        <Link to="/checkout" className="btn button-btn button-btn-primary">Оформить заказ</Link>
                        <Link to="/catalogue" className="btn button-btn button-btn-outline-primary">Каталог курсов</Link>
                    </div>
                )}
            </div>
        </div>
    );
    
};

export default CartOffcanvas;
