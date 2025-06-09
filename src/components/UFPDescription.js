import React, { useState, useEffect } from 'react';

const UserDescriptionProfile = ({ user }) => {
    const [editedDescription, setEditedDescription] = useState('');

    // Устанавливаем начальное значение из props user при монтировании компонента
    useEffect(() => {
        if (user && user.description) {
            setEditedDescription(user.description);
        }
    }, [user]);

    const handleChange = (e) => {
        const { value } = e.target;
        setEditedDescription(value);
    };

    return (
        <div className="mb-2">
            <label htmlFor="user-short-description" className="form-label">
                Коротко о вас лично
            </label>
            <textarea
                className="form-control"
                id="user-short-description"
                name="description"
                required
                rows={2}
                placeholder="Кто вы, чем занимаетесь, чем интересуетесь (макс. 120 зн.)"
                value={editedDescription || ''} // Если editedDescription пустое, то отображаем пустую строку
                onChange={handleChange}
            />
        </div>
    );
};

export default UserDescriptionProfile;