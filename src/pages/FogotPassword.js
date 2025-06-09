import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/auth/forgot-password', { email });
            setMessage(response.data);
            setError(''); // сброс ошибки при успешной отправке
        } catch (error) {
            setError(error.response ? error.response.data : 'Произошла ошибка');
            setMessage(''); // сброс сообщения при ошибке
        }
    };

    return (
        <div className="container-fluid mb-3 mt-5">
            <div className="row">
                <div className="col-12">
                    <div className="page-login bg-white p-3">
                        <h1 className="section-title h3"><span>Восстановление пароля</span></h1>
                        
                        <div className="row">
                        
                            <div className="col-md-6 offset-md-3 mt-3 mb-3">
                                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label required">Email</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            id="email" 
                                            placeholder="Введите ваш email" 
                                            required 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <div className="invalid-feedback">Пожалуйста, укажите ваш email</div>
                                    </div>

                                    <button type="submit" className="btn btn-outline-secondary">Отправить</button> 
                                    <div className="mt-3">
                                        Нет аккаунта? <Link to="/register">Зарегистрируйтесь!</Link>
                                    </div>
                                </form>
                                {message && <p className="text-success">{message}</p>}
                                {error && <p className="text-danger">{error}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;