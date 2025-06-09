import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import Post1 from '../components/Post1';
{/*const apiUrl = process.env.REACT_APP_API_URL; //адрес сервера в .env - на продакшене поменяем*/}

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/forum/posts-with-comments'); // Убедитесь, что путь соответствует вашему API
                setPosts(response.data || []); // Убедитесь, что это массив
            } catch (err) {
                setError(err);
                console.error('Ошибка при получении постов:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка загрузки постов</p>;
     
    return (
        <div>
        <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="breadcrumbs">
                            <ul>
                                <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                                <li><span>Форум</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row"> 
                <div className="col-lg-12">
                        <div className="col-12">
                            <h1 className="section-title h3"><span>Форум</span></h1>
                        </div>
                        <div className="row">
                        <div className="col-12 forum-introduction">
                            <p>Задайте вопрос о семейном образовании, поделитесь мнением, порекомендуйте места, где вы были и вам понравилось, или попросите рекомендацию. Опишите вашу ситуацию и соберите мнения для принятия решения. Просто поделитесь, как у вас происходит семейное обучение, какими источниками пользуетесь, какие цели в образовании ставите, какие выборы делаете. Это полезно для всего сообщества на СО и для тех, кто только рассматривает семейное обучение. Форум предназначен для некомерческих сообщений. По вопросам сотрудничества пишите нам в Телеграм или на email: nasemeinom@mail.ru.</p>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="forum mt-4">
            {Array.isArray(posts) && posts.length > 0 ? (
                posts.map(post => (
                    <Post1
                        key={post.id}
                        post={post}
                    />
                ))
            ) : (
                <p>Нет доступных постов.</p>
            )}
        </div>
            </div>
        </div>
    );
};

export default Forum;
