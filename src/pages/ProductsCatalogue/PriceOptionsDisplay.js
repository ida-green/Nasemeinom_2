import React from 'react';
import { useCoursePrice } from '../../contexts/CoursePriceContext';

const PriceOptionsDisplay = ({ options }) => {
    const { selectedPrice, updateSelectedPrice } = useCoursePrice(); // Получаем данные из контекста
  
    const handlePriceChange = (price, description) => {
      updateSelectedPrice(price, description); // Обновляем выбранную цену и описание
    };
  
    return (
      <div className="price-options-container">
        {options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name="priceOption"
              value={option.price}
              checked={parseFloat(option.price) === selectedPrice.value} // Проверяем, совпадает ли текущая цена с выбранной
              onChange={() => handlePriceChange(parseFloat(option.price), option.description)} // Передаем цену и описание
            />
            <span className="custom-checkbox"></span>
            {option.price} р. ({option.description})
          </label>
        ))}
      </div>
    );
  };
  
  export default PriceOptionsDisplay;

