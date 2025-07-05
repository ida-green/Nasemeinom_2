import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import MyLocation from './MyLocation';
import MyDescription from './MyDescription';
import MyChildren from './MyChildren';
import useAuth from '../../hooks/useAuth'; 

const UserProfile = ({ user, userData, genders, educationForms }) => {
    return (
        <div className="user-profile">
            <div className="row">
                <div className="col-12 col-md-10">
                    
                    <div className="user-profile-block">
                        <img 
                        className="comment-user-avatar" 
                        src={userData.userImageUrl} 
                        alt={`Аватар пользователя ${userData.name}`}
                        />
                        <div>{userData.name}</div>
                        <button
                            className="custom-button"
                        >
                            <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                        </button>
                    </div>

                    <div className="user-profile-block">  
                    <div>Пароль: ********</div>
                    <button
                            className="custom-button"
                        >
                            <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                        </button>
                    </div>   
                                   
                    <div className="user-profile-block">   
                    <div>E-mail: {userData.email}</div>
                    <div>Телеграм: @{userData.telegramUsername}</div>
                    <div>Телефон: {userData.phone}</div>
                    <button
                            className="custom-button"
                        >
                            <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                        </button>
                    </div>

                    <MyLocation 
                        user={user} 
                        userData={userData}/> 

                    <MyDescription 
                        user={user} 
                        userData={userData}/>

                    <MyChildren 
                        user={user} 
                        userData={userData}
                        educationForms = {educationForms} 
                        genders = {genders} />
                        
                                                           
                    <div className="user-profile-block">  
                    <div>О семье: {userData.familyDescription}</div>
                    <button
                    className="custom-button"
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                </button>
                    </div>
                    
                    <div className="user-profile-block">  
                    <img src={userData.familyImageUrl} />
                    <button
                    className="custom-button"
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
