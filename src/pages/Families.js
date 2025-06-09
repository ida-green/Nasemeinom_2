import React from "react";
import '../styles/App.css';
import { Link } from 'react-router-dom';

export default function Families() {
    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="breadcrumbs">
                            <ul>
                                <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                                <li><span>Семьи</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row"> 
                    <div className="col-lg-12">
                            <div className="col-12">
                                <h1 className="section-title h3"><span>Семьи</span></h1>
                            </div>
                            <div className="row">
                            <div className="col-12 col-lg-8">
                                <img src="/images/families-images/2.jpg" alt="" className="img-thumbnail" />
                            </div>
                            <div className="col-12 col-lg-4 families-intro">
                                <p>На семейной форме образования учатся дети в разных уголках России и мира. Найдите единомышленников, которые живут рядом с вами. Заполните карточку в разделе 
                                <Link className="nav-link active" aria-current="page" to="/dashboard">"Моя семья"</Link> 
                                в личном кабинете. Другие участники смогут написать вам в Tелеграм.</p>
                                
                                
                            </div> 
                            </div>
                        </div>
                        </div> 
                        <hr />       
            <div className="container">
                <div className="row">
                    <div>
                       
                    </div>
                </div>
            </div>
        </div>            
        </div>
    );
}
