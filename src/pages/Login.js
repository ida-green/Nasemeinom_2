//Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth'; // Импортируем контекст аутентификации

const Login = () => {
    const { login, loading, error } = useAuth(); // Получаем функцию login из контекста
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password); // Вызов функции логина из контекста
        if (!error) { // Если нет ошибки, перенаправляем пользователя
            navigate('/');
        }
    };
    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="breadcrumbs">
                            <ul>
                                <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                                <li><span>Вход</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container-fluid mb-3">
                <div className="row">
                    <div className="col-12">
                        <div className="page-login bg-white p-3">
                            <h1 className="section-title h3"><span>Вход</span></h1>
                            {error && <div className="alert alert-danger">{error}</div>} {/* Отображение ошибки */}
                            <div className="row">
                                <div className="col-md-6 offset-md-3">
                                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label required">Email</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="email" 
                                                placeholder="Email" 
                                                required 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                            />
                                            <div className="invalid-feedback">Пожалуйста, укажите ваш email</div>
                                        </div>

                                        <div className="mb-3">
                                        <label htmlFor="password" className="form-label required">Пароль</label>
                                            <input 
                                                type="password" 
                                                className="form-control" 
                                                id="password" 
                                                placeholder="Пароль" 
                                                required 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                            />
                                            <div className="invalid-feedback">Пожалуйста, введите пароль</div>
                                        </div>

                                        <button type="submit" className="btn button-btn button-btn-primary" disabled={loading}>
                                            {loading ? 'Загрузка...' : 'Войти'}
                                        </button>

                                        <div className="mt-3">
                                        Нет аккаунта? <Link to="/register">Зарегистрируйтесь!</Link>
                                        </div>
                                        <div className="mt-3">    
                                        Забыли пароль? <Link to="/fogot-password">Восстановить</Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
