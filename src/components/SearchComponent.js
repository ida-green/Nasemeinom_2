import React, { useState } from 'react';

const SearchComponent = ({ items }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState(items);

    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // Фильтруем элементы на основе поискового запроса
        const filtered = items.filter(item => 
            item.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredItems(filtered);
    };

    return (
        <div className="col-12">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        name="s"
                        placeholder="Поиск"
                        aria-label="Searching"
                        aria-describedby="button-search"
                        value={searchQuery}
                        onChange={handleInputChange}
                    />
                    <button className="btn btn-outline-secondary" type="submit" id="button-search">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
            </form>

            {/* Список отфильтрованных элементов */}
            <ul>
                {filteredItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default SearchComponent;
