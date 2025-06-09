import React from "react";
import '../styles/App.css';
import Advantages from '../components/Advantages.js';
import AboutUs from '../components/AboutUs.js';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
    return(
        <div>
            <Advantages />
            <AboutUs />
        </div>    
    )     
}