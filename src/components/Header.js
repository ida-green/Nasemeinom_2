import React, { useState, useContext } from 'react';
import '../styles/App.css';
import { Link, useNavigate } from 'react-router-dom';
import SearchComponent from "../components/SearchComponent.js";
import useAuth from '../hooks/useAuth';
import CartOffcanvas from '../components/CartOffcanvas.js';
import FavouriteOffcanvas from '../components/FavouriteOffcanvas.js';
import { useCartContext } from '../contexts/CartContext';
import { useFavourite } from '../contexts/FavouriteContext.js';

export default function Header() {
    const { user, logout } = useAuth(); // Получаем текущего пользователя и функцию logout
    const { cartItems } = useCartContext();
    const [isCartOpen, setCartOpen] = useState(false); // Состояние для корзины offcavas
    const [isFavouriteOpen, setFavouriteOpen] = useState(false); // Состояние для избранного offcanvas
    const navigate = useNavigate(); // Используем useNavigate вместо useHistory

    // Переключаем корзину offcanvas
    const toggleCart = () => {
        setCartOpen(!isCartOpen);
    };

    // Переключаем избранное offcanvas
    const toggleFavourite = () => {
        setFavouriteOpen(!isFavouriteOpen);
    };

     const handleLogout = () => {
        logout(); // Вызываем функцию выхода
        navigate('/login'); // Перенаправляем на главную страницу или другую
    };

    return (
        <div>
            <div className="header-top">
            <div className="container-fluid">
                <div className="row d-flex align-items-center">
                    <div className="col-12 col-md-6 py-1 ">
                        <div className="header-top-title h-100">
                            <h1>Портал о семейном образовании</h1>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            
            <div className="header-middle bg-white py-1">
                <div className="container-fluid">
                    <div className="row d-flex align-items-center">
                        <h1 className="col-6 col-md-6">
                            <Link className="header-logo" aria-current="page" to="/">На семейном</Link>
                        </h1>
                        <div className="col-6 col-md-6 d-flex justify-content-end">
                            <div>
                                 <button 
                                    className="social-icons me-2" 
                                    type="button">
                                        <Link className="nav-link active" aria-current="page" 
                                        to="/">
                                            <i className="fa-solid fa-magnifying-glass"></i>
                                        </Link>
                                </button>
                                
                                <button 
                                    className="social-icons me-2" 
                                    type="button">
                                        <Link className="nav-link active" aria-current="page" to={ user ? "/dashboard" : "/login"}>
                                            <i className="fa-regular fa-user fa-lg"></i>
                                        </Link>
                                </button> 
                                <button 
                                    className="social-icons me-2" 
                                    type="button"
                                    onClick={handleLogout}>
                                        <Link className="nav-link active" aria-current="page">
                                            <i className="fa-solid fa-arrow-right-from-bracket fa-lg"></i>
                                        </Link>
                                </button>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="header-bottom sticky-top" id="header-nav">
            <nav className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
                <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-expanded="false" aria-lable="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                    <div className="offcanvas offcanvas-start" id="offcanvasNavbar" tabIndex="-1" aria-labelledby="offcanvasNavbarLabel">
                    <div className="offcanvas-header">
                        
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                        <div className="offcanvas-body">
                            <ul className="navbar-nav">
                                
                                <li className="nav-item">
                                <Link className="nav-link" aria-current="page" to="/">Главная</Link>
                                </li>
                                <li className="nav-item">
                                <Link className="nav-link" to="/catalogue">Курсы</Link>
                                </li>
                                <li className="nav-item">
                                <Link className="nav-link" to="/userCatalogue">Семьи</Link>
                                </li>
                                <li className="nav-item">
                                <Link className="nav-link" to="/forum">Форум</Link>
                                </li>
                                <li className="nav-item">
                                <Link className="nav-link" to="/communication">Общение</Link>
                                </li>

                                <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                                    Меню
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><Link className="dropdown-item" to="/leagal">Законодательство</Link></li>
                                    <li><Link className="dropdown-item" to="/attestation">Аттестация</Link></li>
                                    <li><Link className="dropdown-item" to="/articles">Статьи</Link></li>
                                    {/* <li><Link className="dropdown-item" to="/bookishkids">Книжные дети</Link></li> */}
                                    <li className="dropdown-divider"></li>
                                    <li><Link className="dropdown-item" to="/editorcoloumn">Колонка редактора</Link></li>
                                </ul>
                                </li>
                            </ul>   
                        </div>
                    </div>

                    <div>
                    {/* Иконка сердечка для избранного */}
                    <button className="btn icons-cart-favourite p-1" onClick={toggleFavourite}>
                        <i className="fa-solid fa-heart"></i>
                        <span className="badge rounded-pill bg-warning text-dark">3</span>
                    </button>

                    {/* Иконка корзины */}
                    <button className="btn icons-cart-favourite" onClick={toggleCart}>
                        <i className="fa-solid fa-cart-shopping"></i>
                        <span className="badge rounded-pill bg-warning text-dark">
                            {user ? cartItems.length : 0} {/* Условный рендеринг */}
                        </span>
                    </button>
                    </div> 

                </div> 
            </nav> 
            </div>
            {/* Компоненты offcanvas */}
            <CartOffcanvas isCartOpen={isCartOpen} onCartClose={() => setCartOpen(false)} />
            <FavouriteOffcanvas isFavouriteOpen={isFavouriteOpen} onFavouriteClose={() => setFavouriteOpen(false)} />
        </div>
    )
}