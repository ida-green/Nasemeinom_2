import React from "react"
import '../styles/App.css';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <div>
          <footer className="footer" id="footer">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-3 col-6">
                    <h4>Информация</h4>
                    <ul className="list-unstyled">
                      <li><Link className="nav-item active" aria-current="page" to="/">Главная</Link></li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/catalogue">Курсы</Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/families">Семьи</Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/forum">Форум</Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/communication">Общение</Link>
                      </li>
                    </ul>    
                  </div>
                  <div className="col-md-3 col-6">
                    <h4>Документы</h4>
                  <ul className="list-unstyled">
                    <a href="#">Правила портала</a>
                  </ul>    
                  </div>

                  <div className="col-md-3 col-6">
                    <h4>Контакты</h4>
                  <ul className="list-unstyled">
                    <li>e-mail: nasemeinom@mail.ru</li>
                  </ul>  
                  </div>

                  <div className="col-md-3 col-6">
                    <h4>Телеграм</h4>
                  <ul className="footer-icons">
                    <li><a href="index.html"><i className="fa-brands fa-telegram"></i></a></li>
                  </ul>    
                  </div>
                </div>
              </div>
            </footer> 
        </div>
    )
}