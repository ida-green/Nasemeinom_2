import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ course, handleToggleFavorite }) => {
    const [selectedPrice, setSelectedPrice] = useState(null); 

 // Получаем начальную цену
useEffect(() => {
    if (course?.PriceOptions && course.PriceOptions.length > 0 && !selectedPrice) {
        setSelectedPrice(parseFloat(course.PriceOptions[0].price));
    } else if (course?.single_price && !selectedPrice) {
        setSelectedPrice(parseFloat(course.single_price));
    } else if (course?.PriceHistory && !selectedPrice) {
        setSelectedPrice(parseFloat(course.PriceHistory.new_price));
    }
}, [course, selectedPrice]);
  
    // Компонент для отображения ценовых опций
const PriceOptionsDisplay = ({ options }) => {
    const prices = options.map(option => option.price);
    const minPrice = Math.min(...prices);
    return <div>от {minPrice} р.</div>;
};

// Компонент для отображения истории цен
const PriceHistoryDisplay = ({ history }) => (
    <div>
        {history.old_price != null && (
            <small 
                className="me-1" 
                style={{ textDecoration: 'line-through', fontSize: '1em' }}>
                {history.old_price} р.
            </small>
        )}
        <span>{history.new_price} р.</span>
    </div>
);

// Компонент для отображения единственной цены
const SinglePriceDisplay = ({ price }) => (
    <span>{price} р.</span>
);


    return (
        <div className="product-card d-flex flex-column flex-md-row mb-5">
            <div className="card-img-top" style={{ flex: '1 1 30%' }}>
                <img 
                src={course.img}
                className="img-fluid" 
                alt={course.title} />
            </div>
            <div className="card-body d-flex flex-column justify-content-between" style={{ flex: '1 1 70%' }}>
            {/* Отображение предметов */}
            <small className="course-subject">
                {course.Subjects && course.Subjects.length > 0 && (
                    course.Subjects.map((subject, index) => (
                        <span key={index} className="subject-tag">
                            #{subject.subject} {''}
                        </span>
                    ))
                )}
            </small>      
                        <Link to={`/course/${course.id}`}>
                        <h5>{course.title}</h5>
                        </Link> 
                <div className="row filter-options mb-2">
                    <span className="age-and-grade">
                        {course.age_min === course.age_max ? (
                            <span>{course.age_min} лет</span>
                        ) : (
                            <span>{course.age_min}-{course.age_max} лет</span>
                        )}
                    </span>
                    <span className="age-and-grade">
                        {!course.grade_max && course.grade_min ? (
                            <span>{course.grade_min} класс</span>
                        ) : (
                            <span>{course.grade_min}-{course.grade_max} класс</span>
                        )}
                    </span>
                    
                </div>

                <div className="product-details card-footer mb-2">
                    <div className="product-bottom-details d-flex justify-content-start">
                    <div className="product-price">
                        {course.PriceOptions && !course.PriceHistory && !course.single_price ? (
                            <PriceOptionsDisplay options={course.PriceOptions} />
                        ) : course.PriceHistory ? (
                            <PriceHistoryDisplay history={course.PriceHistory} />
                        ) : (
                            <SinglePriceDisplay price={course.single_price} />
                        )}
                    </div>
                        
                        <div className="product-links ms-2">
                        <i className="fa-regular fa-heart ms-2" onClick={handleToggleFavorite}></i>
                        </div>
                    </div>
                </div>      
            </div>
        </div>
    );
};

export default ProductCard;
