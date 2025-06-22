import React from "react"
import '../styles/App.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Advantages() {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login'); // Переход на страницу входа
    };

    const handleRegisterClick = () => {
        navigate('/register'); // Переход на страницу регистрации
    };


    return(
        <div>
        <section className="advantages mt-3">
          <div className="col-10 container-fluid">

            <div className="row gy-3 gx-3items d-flex h-100">
            {/*        
            <div className="col-lg-4 col-sm-12">
                <div className="card">
                    <img src="/images/carousel-images/homeschooling18.jpg" className="card-img" alt="..." />
                    <div className="card-body">
                        <div className="row d-flex align-items-center">
                            <h5 className="card-title">
                                <span className="d-flex align-items-center">
                                    <Link to="/catalogue" className="link-no-underline link-hover">
                                        Курсы 
                                        <i className="fa-solid fa-angles-right advantages-icon ms-2"></i>
                                    </Link>
                                </span>
                            </h5>
                        </div>
                        <p className="card-text">Каталог курсов для детей</p>
                    </div>
                </div>
            </div>
            */}    
                                               

            <div className="col-lg-6 col-sm-12">
                <div className="card">
                    <img src="/images/carousel-images/homeschooling8.jpg" className="card-img" alt="..." />
                    <div className="card-body">
                        <div className="row d-flex align-items-center">
                            <h5 className="card-title">
                                <span className="d-flex align-items-center">
                                    <Link to="/userCatalogue" className="link-no-underline link-hover">
                                        Семьи
                                        <i className="fa-solid fa-angles-right advantages-icon ms-2"></i>
                                    </Link>
                                </span>
                            </h5>
                        </div>
                        <p className="card-text">Единомышленники в вашей локации</p>
                    </div>
                </div>
            </div>

            <div className="col-lg-6 col-sm-12">
                <div className="card">
                    <img src="/images/carousel-images/homeschooling15.jpg" className="card-img" alt="..." />
                    <div className="card-body">
                        <div className="row d-flex align-items-center">
                            <h5 className="card-title">
                                <span className="d-flex align-items-center">
                                    <Link to="/forum" className="link-no-underline link-hover">
                                        Форум
                                        <i className="fa-solid fa-angles-right advantages-icon ms-2"></i>
                                    </Link>
                                </span>
                            </h5>
                        </div>
                        <p className="card-text">Поддержка в СО-обществе</p>
                    </div>
                </div>
            </div>

            <div className="col-lg-6 col-sm-12">
                <div className="card">
                    <img src="/images/carousel-images/homeschooling6.jpg" className="card-img" alt="..." />
                    <div className="card-body">
                        <div className="row d-flex align-items-center">
                            <h5 className="card-title">
                                <span className="d-flex align-items-center">
                                    <Link to="/communication" className="link-no-underline link-hover">
                                        Социализация
                                        <i className="fa-solid fa-angles-right advantages-icon ms-2"></i>
                                    </Link>
                                </span>
                            </h5>
                        </div>
                        <p className="card-text">Свободные школы и пространства для общения</p>
                    </div>
                </div>
            </div>

{/*
            <div className="col-lg-4 col-sm-12">
                <div className="card">
                    <img src="/images/carousel-images/homeschooling14.jpg" className="card-img" alt="..." />
                    <div className="card-body">
                        <div className="row d-flex align-items-center">
                            <h5 className="card-title">
                                <span className="d-flex align-items-center">
                                    <Link to="/attestation" className="link-no-underline link-hover">
                                        Аттестация 
                                        <i className="fa-solid fa-angles-right advantages-icon ms-2"></i>
                                    </Link>
                                </span>
                            </h5>
                        </div>
                        <p className="card-text">Онлайн платформы для аттестации</p>
                    </div>
                </div>
            </div>
*/}

            <div className="col-lg-6 col-sm-12">
                <div className="card">
                    <img src="/images/carousel-images/homeschooling4.jpg" className="card-img" alt="..." />
                    <div className="card-body">
                        <div className="row d-flex align-items-center">
                            <h5 className="card-title">
                                <span className="d-flex align-items-center">
                                    <Link to="/articles" className="link-no-underline link-hover">
                                        Статьи 
                                        <i className="fa-solid fa-angles-right advantages-icon ms-2"></i>
                                    </Link>
                                </span>
                            </h5>
                        </div>
                        <p className="card-text">Контекст семейного образования</p>
                    </div>
                </div>
            </div>

                        
            </div>    
          </div>  
      </section>

      <div className="col-12 mt-2 d-flex justify-content-center">
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
    )
};