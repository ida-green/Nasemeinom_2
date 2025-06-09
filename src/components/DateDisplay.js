import React from 'react';

const DateDisplay = ({ date }) => {
    return (
        <small className="post-meta">
            {new Date(date).toLocaleString('ru-RU', {
                year: '2-digit',
                month: 'numeric',
                day: 'numeric',
            })}
        </small>
    );
};

export default DateDisplay;
