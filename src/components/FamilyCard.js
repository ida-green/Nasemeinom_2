import React from 'react';
import { Link } from 'react-router-dom';

export default function FamilyCard({ family, countryName, regionName, cityName }) {
      
    const calculateAge = (birthDate) => {
        if (!birthDate) return 'Не указано'; // Или любое другое значение по умолчанию

        const birthDateObj = new Date(birthDate);
        if (isNaN(birthDateObj)) return 'Некорректная дата'; // Проверка на корректность даты

        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDifference = today.getMonth() - birthDateObj.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        return age;
    };

    return (
        <div>
            <div className="row row-cols-1 g-4 mb-5">
                <div className="col-12">
                    <div className="family-card card h-100">
                        <div>
                            <img src={family.familyImageUrl} className="card-img-top" alt="Семья" />
                        </div>
                       
                        <div className="family-card-body d-flex flex-column">
                            <div className="city-country">
                                {cityName},{' '} 
                                {((regionName === 'Москва и Московская обл.' && cityName === 'Москва') || 
                                (regionName === 'Санкт-Петербург и Ленинградская обл.' && cityName === 'Санкт-Петербург') || 
                                (regionName === cityName))
                                ? null 
                                : (
                                    <>
                                        {regionName === 'Москва и Московская обл.' ? 'Московская обл.' : 
                                        regionName === 'Санкт-Петербург и Ленинградская обл.' ? 'Ленинградская обл.' : 
                                        regionName}
                                        {', '} {/* Добавляем пробел перед названием страны */}
                                    </>
                                    )
                                }
                                {countryName}
                            </div>


                            <img src={family.userImageUrl} className="user-photo" />    
                            <div className="user-name-under-photo">{family.name}</div>
                            <div className="family-card-description mb-3">{family.description}</div>
                            <strong>Дети:</strong>
                            <ul>
                                {Array.isArray(family.Children) && family.Children.length > 0 ? (
                                    family.Children.map(child => (
                                        <li key={child.id}>
                                            {child.name ?? 'Имя не указано'}, {calculateAge(child.birth_date)} лет, {child.education_form_id?.title ?? 'Нет информации о форме обучения'}
                                        </li>
                                    ))
                                ) : (
                                    <li>Нет детей</li> // Сообщение, если нет детей
                                )}
                            </ul>

                            <p className="card-text mt-2">{family.familyDescription}</p>
                        </div>
                        <div className="card-footer">
                            <div className="social-icons d-flex justify-content-center">
                            <Link >
                            <i class="fa-brands fa-telegram fa-lg"></i>
                            </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
