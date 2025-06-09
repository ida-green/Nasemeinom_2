import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams(); // Получаем токен из URL
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:3000/auth/reset-password/${token}`, { password });
            setMessage(response.data);
            setError('');
    
            // Задержка перед перенаправлением
            setTimeout(() => {
                navigate('/login');
            }, 2000); // 2000 миллисекунд = 2 секунды
        } catch (error) {
            setError(error.response ? error.response.data : 'Произошла ошибка');
            setMessage('');
        }
    };
    

    return (
        <div className="container-fluid mb-3 mt-5">
            <div className="row">
                <div className="col-12">
                    <div className="page-login bg-white p-3">
                        <h1 className="section-title h3"><span>Сброс пароля</span></h1>
                        <div className="row">
                            <div className="col-md-6 offset-md-3 mt-3 mb-3">
                                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label required">Пароль</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="password" 
                                            placeholder="Введите новый пароль" 
                                            required 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div className="invalid-feedback">Пожалуйста, укажите новый пароль</div>
                                    </div>

                                    <button type="submit" className="btn btn-warning">Сменить пароль</button> 
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

export default ResetPassword;
