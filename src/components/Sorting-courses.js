{/*import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard'; // Предполагаем, что у вас есть компонент ProductCard

const SortingCourses = ({ courses }) => {
    const [sortedCourses, setSortedCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);

    useEffect(() => {
        sortCoursesByPrice(); // Сортируем курсы при монтировании компонента
    }, [courses]);

    const sortCoursesByPrice = () => {
        let sorted = [...courses]; // Копируем массив курсов

        // Сортировка по цене
        sorted.sort((a, b) => {
            const priceA = parseFloat(a.newPrice) || 0; // Преобразуем в число, если не число - 0
            const priceB = parseFloat(b.newPrice) || 0; // Преобразуем в число, если не число - 0
            return priceA - priceB; // Сравниваем цены
        });

        setSortedCourses(sorted); // Обновляем состояние с отсортированными курсами
        setFilteredCourses(sorted); // Устанавливаем отфильтрованные курсы равными отсортированным
    };

    return (
        <div>
            
            {filteredCourses.length > 0 ? (
                <div className="row">
                    {filteredCourses.map(course => (
                        <ProductCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <p>Нет доступных курсов по выбранным критериям</p>
            )}
        </div>
    );
};

export default SortingCourses; */}
