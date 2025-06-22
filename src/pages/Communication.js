import React, { useEffect, useState } from "react";
import '../styles/App.css';
import { Link } from 'react-router-dom';
import FreeSchoolsList from "../components/FreeSchoolCard.js";

export default function Home() {
    const [freeSchools, setFreeSchools] = useState([]); // Состояние для хранения данных
    const [loading, setLoading] = useState(true); // Состояние для загрузки
    const [error, setError] = useState(null); // Состояние для ошибок

    useEffect(() => {
        const fetchFreeSchools = async () => {
            try {
                const response = await fetch('http://localhost:3000/freeSchools'); // Запрос к вашему API
                if (!response.ok) {
                    throw new Error('Ошибка при получении данных');
                }
                const data = await response.json();
                setFreeSchools(data); // Сохранение данных в состоянии
            } catch (error) {
                setError(error.message); // Установка сообщения об ошибке
            } finally {
                setLoading(false); // Завершение загрузки
            }
        };

        fetchFreeSchools(); // Вызов функции получения данных
    }, []); // Пустой массив зависимостей - вызовется только при монтировании компонента

    if (loading) {
        return <div>Загрузка...</div>; // Отображение загрузки
    }

    if (error) {
        return <div>Ошибка: {error}</div>; // Отображение ошибки
    }

    return (
        
            <div className="container">
                <div className="col-12 col-md-9">
                    <div className="container mt-3">
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item"><Link aria-current="page" to="/">Главная</Link></li>
                                <li class="breadcrumb-item active" aria-current="page">Социализация</li>
                            </ol>
                        </nav>
                    </div>
                </div>
           
            <div className="container">
                <div className="row"> 
                    <div className="col-lg-12">
                        <div className="col-12">
                            <h1 className="section-title h3"><span>Свободные школы</span></h1>
                        </div>
                    </div>            
                </div>
                {/* Передаем данные в компонент FreeSchoolsList */}
                <FreeSchoolsList freeSchools={freeSchools} />
            </div>   
        </div> 
    );
}
