import React from "react"
import '../styles/App.css';
import { Link } from 'react-router-dom';

export default function Header() {

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="breadcrumbs">
                            <ul>
                                <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                                <li><span>А что, так можно?</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        <p>Вопросы и ответы кас. юридической стороны СО</p>    
        </div>
    )
}  