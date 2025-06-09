// PriceHistoryDisplay

import React from 'react';

// Компонент для отображения истории цен
const PriceHistoryDisplay = ({ history }) => (
    <div className="price-options-container">
    <div>
        {history.old_price != null && (
            <small 
                className="me-1" 
                style={{ textDecoration: 'line-through', fontSize: '.8em' }}>
                {history.old_price} р.
            </small>
        )}
        {history.new_price != null && (
            <span>{history.new_price} р.</span>
        )}
    </div>
    </div>
  );

  export default PriceHistoryDisplay;