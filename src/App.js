import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import './styles/UserCard.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CoursePriceProvider } from './contexts/CoursePriceContext.js';
import { FavouriteProvider } from './contexts/FavouriteContext';
import { CartProvider } from './contexts/CartContext'; 
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorProvider } from './contexts/ErrorContext.js'; // Контекст для сообщения об ошибке

import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import Catalogue from './pages/Catalogue.js';
import Course from './pages/Course.js';
import UserCatalogue from './components/UserCatalogueComponents/UserCatalogue.js'; 
import Communication from './pages/Communication.js';
import Register from './pages/Register.js';
import Login from './pages/Login.js';
import EditorColoumn from './pages/EditorColumn.js';
import BookishKids from './pages/BookishKids.js';
import Articles from './pages/Articles.js';
import Attestation from './pages/Attestation.js';
import Leagal from './pages/Leagal.js';
import Forum from './components/ForumComponents/Forum.js';
import Dashboard from './pages/Dashboard.js';
import ConfirmEmail from './components/ConfirmEmail.js';
import FogotPassword from './pages/FogotPassword.js';
import ResetPassword from './pages/ResetPassword.js';

function App() {

    return (
      <Router>
        <ErrorProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <CoursePriceProvider>
                <FavouriteProvider>
                  <div className="App">
                    <Header />
                    <div className="wrapper">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/" element={<Home />} />
                        {/*<Route path="/catalogue" element={<Catalogue />} />*/}
                        {/*<Route path="/course/:id" element={<Course />} />*/}
                        <Route path="/userCatalogue" element={<UserCatalogue />} />
                        <Route path="/communication" element={<Communication />} />
                        <Route path="/leagal" element={<Leagal />} />
                        {/*<Route path="/attestation" element={<Attestation />} />*/}
                        <Route path="/editorcoloumn" element={<EditorColoumn />} />
                        <Route path="/bookishkids" element={<BookishKids />} />
                        <Route path="/articles" element={<Articles />} />
                        <Route path="/forum" element={<Forum />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/confirm/:token" element={<ConfirmEmail />} />
                        <Route path="/fogot-password" element={<FogotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                      </Routes>
                    </div>
                    <Footer />
                  </div>
                  </FavouriteProvider>
              </CoursePriceProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
        </ErrorProvider>
      </Router>
    );
}

export default App;
