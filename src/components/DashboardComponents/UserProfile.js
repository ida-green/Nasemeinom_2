import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import MyLocation from './MyLocation';

const UserProfile = ({ user, userData }) => {
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

                    <MyLocation user={user} userData={userData} />

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

                    <div className="user-profile-block">  
                    <div>О себе: {userData.description}</div>
                    <button
                            className="custom-button"
                        >
                            <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                        </button>
                    </div>

                    <div className="user-profile-block">  
                    <div>Дети:</div>
<ul>
  {userData.children.map((child, index) => (
    <li key={index} className="child-item">
      <div className="child-data">
        {child.gender ? <span>{child.gender.gender}</span> : null}
        {child.birth_date && (
        <span>
            {new Date(child.birth_date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            })}
        </span>
        )}
        {child.education_form ? <span>{child.education_form.title}</span> : null}
      </div>
    </li>
  ))}
</ul>

<style jsx>{`
  .child-item {
    margin-bottom: 10px;
  }
  .child-data {
    display: flex; /* Используем flexbox для адаптации */
    flex-wrap: wrap; /* Разрешаем перенос на новую строку */
  }
  .child-data span {
    margin-right: 10px;
    margin-bottom: 5px; /* Отступ между элементами на маленьких экранах */
  }
  @media (max-width: 768px) { /* Медиа-запрос для маленьких экранов */
    .child-data {
      flex-direction: column; /* Элементы в столбец */
    }
    .child-data span {
      margin-right: 0;
      margin-bottom: 5px;
    }
  }
`}</style>


<style jsx>{`
  .child-item {
    margin-bottom: 10px;
  }
  .child-item span {
    display: block; /* каждый элемент на новой строке */
  }
`}</style>
<button
    className="custom-button"
>
    <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
</button>
</div>

                                        
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
