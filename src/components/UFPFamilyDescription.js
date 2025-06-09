import React, { useState, useEffect } from 'react';

const UFPFamilyDescription = ({ user, updateUser }) => {
    const [editedFamilyDescription, setEditedFamilyDescription] = useState('');

     // Устанавливаем начальное значение из props user при монтировании компонента
        useEffect(() => {
            if (user && user.familyDescription) {
                console.log(user.familyDescription)
                setEditedFamilyDescription(user.familyDescription);
            }
        }, [user]);
    
        const handleChange = (e) => {
            const { value } = e.target;
            setEditedFamilyDescription(value);
        };

    return (
        <div className="mb-3 mt-3">
            <label htmlFor="user-short-description" className="form-label">
                Описание семьи
            </label>
            <textarea
                className="form-control"
                id="user-family-description"
                name="fa
                mily-description"
                required
                placeholder="Расскажите немного о вашем семейном обучении. Какой у вас запрос? (макс. 1000 зн.)"
                value={editedFamilyDescription || ''} // Если editedDescription пустое, то отображаем пустую строку
                rows={4}
                onChange={handleChange}
            />
        </div>
    );
};

export default UFPFamilyDescription;
