import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ConfirmEmail = () => {
    const { token } = useParams(); // Получаем токен из параметров URL
    const [message, setMessage] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false); // Состояние для отслеживания подтверждения

    useEffect(() => {
        const confirmEmail = async () => {
            if (token) {
                try {
                    const response = await axios.get(`http://localhost:3000/auth/confirm/${token}`);
                    setMessage(response.data); // Сообщение от сервера
                    console.log('Response from server:', response.data);
                    setIsConfirmed(true); // Устанавливаем состояние подтверждения в true
                } catch (error) {
                    setMessage('Ссылка больше не действительна.');
                }
            } else {
                setMessage('Токен отсутствует.');
            }
        };

        confirmEmail();
    }, [token]);

    return (
        <div>
        <div className="container">
                       <div className="row">
                           <div className="col-12">
                               <nav className="breadcrumbs">
                                   <ul>
                                       <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                                       <li><span>Подтверждение регистрации</span></li>
                                   </ul>
                               </nav>
                           </div>
                       </div>
                   </div>
                   <div className="col-12 col-md-6 mt-5 ms-5">
            {isConfirmed ? (
                   <h6>Регистрация успешно завершена! Вход на сайт 
                    <Link to="/login"> здесь.</Link>
                    </h6>
            ) : (
                <p>{message}</p>
            )}
            </div>
        </div>
        
    );
};

export default ConfirmEmail;
