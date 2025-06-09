import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isValidNumber, parsePhoneNumberWithError } from 'libphonenumber-js';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [isRegistered, setIsRegistered] = useState(false); // Новое состояние для отслеживания успешной регистрации
    const navigate = useNavigate(); 

    const validateForm = () => {
        const errors = {};
        
        if (!name) {
            errors.name = 'Имя обязательно для заполнения';
        }
        
        if (!email) {
            errors.email = 'Email обязателен для заполнения';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/.test(email)) {
            errors.email = 'Введите корректный email';
        }
        
        if (!phone) {
            errors.phone = 'Телефон обязателен для заполнения';
        } else {
            try {
                const phoneNumber = parsePhoneNumberWithError(phone);
                if (!isValidNumber(phoneNumber.number)) {
                    errors.phone = 'Введите корректный номер телефона';
                }
            } catch (error) {
                errors.phone = 'Введите корректный номер телефона';
            }
        }
        
        if (!login) {
            errors.login = 'Логин обязателен для заполнения';
        }
        
        if (!password) {
            errors.password = 'Пароль обязателен для заполнения';
        } else if (password.length < 6) {
            errors.password = 'Пароль должен содержать не менее 6 символов';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0; // Возвращает true, если ошибок нет
       
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError('');
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        try {
            // Проверка существования пользователя
            const checkResponse = await axios.post('http://localhost:3000/auth/check-user', {
                email,
                login,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

   
            if (checkResponse.data.exists) {
                // Если пользователь существует, устанавливаем ошибку
                setError('Пользователь с таким email или логином уже существует.');
                return;
            }
    
            // Если пользователь не найден, продолжаем регистрацию
            const response = await axios.post('http://localhost:3000/auth/register', {
                name,
                email,
                login,
                phone,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) { // Предполагаем, что сервер возвращает { success: true }
                setSuccessMessage('Регистрация прошла успешно!');
                setIsRegistered(true); // Устанавливаем состояние успешной регистрации

                // Очистка формы
                setName('');
                setEmail('');
                setPhone('');
                setLogin('');
                setPassword('');
            } else {
                setError(response.data.message || 'Произошла ошибка при регистрации');
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'Произошла ошибка при регистрации.');
            } else {
                console.error('Ошибка:', error);
                setError('Произошла ошибка при соединении с сервером.');
            }
        }
    };

    // useEffect для перенаправления
    useEffect(() => {
        console.log('isRegistered изменился:', isRegistered);
        if (isRegistered) {
            navigate('/login'); // Перенаправление на страницу входа
        }
    }, [isRegistered, navigate]); // Зависимость от isRegistered и navigate

    
       return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="breadcrumbs">
                            <ul>
                                <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                                <li><span>Регистрация</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container-fluid mb-3">
                <div className="row">
                    <div className="col-12">
                        <div className="page-register bg-white p-3">
                            <h1 className="section-title h3"><span>Регистрация</span></h1>
                            {error && <div className="alert alert-danger">{error}</div>} {/* Отображение ошибки */}
                            {successMessage && <div className="alert alert-success">{successMessage}</div>} {/* Успешное сообщение */}
                            <div className="row">
                                <div className="col-md-6 offset-md-3">
                                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>

                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label required">Имя</label>
                                            <input 
                                            type="text"
                                            className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                                            id="name"
                                            placeholder="Имя" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)} />
                                            {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label required">Email</label>
                                            <input 
                                            type="email"
                                            className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`} 
                                            id="email" 
                                            placeholder="example@mail.com" 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} />
                                            {validationErrors.email && <div className="invalid-feedback">{validationErrors.email}</div>}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label htmlFor="phone" className="form-label required">Телефон</label>
                                            <input 
                                            type="text"
                                            className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
                                            id="phone"
                                            placeholder="+79123456789" 
                                                value={phone} 
                                                onChange={(e) => setPhone(e.target.value)} />
                                            {validationErrors.phone && <div className="invalid-feedback">{validationErrors.phone}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="login" className="form-label required">Логин</label>
                                            <input 
                                            type="text"
                                            className={`form-control ${validationErrors.login ? 'is-invalid' : ''}`}
                                            id="login"
                                            placeholder="Логин" 
                                                value={login}
                                                onChange={(e) => setLogin(e.target.value)} />
                                            {validationErrors.login && <div className="invalid-feedback">{validationErrors.login}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label required">Пароль</label>
                                            <input 
                                            type="password"
                                            className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                                            id="password"
                                            placeholder="Пароль" 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)} />
                                            {validationErrors.password && <div className="invalid-feedback">{validationErrors.password}</div>}
                                        </div>

                                        <button type="submit" className="btn button-btn button-btn-primary">Зарегистрироваться</button>
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

export default Register;