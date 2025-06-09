import React, { useState, useEffect } from 'react';

const UFPFamilyImage = ({ user }) => {
    const [FamilyImageUrl, setFamilyImageUrl] = useState('');

    // Устанавливаем начальное значение из props user при монтировании компонента
    useEffect(() => {
        if (user && user.familyImageUrl) {
            setFamilyImageUrl(user.familyImageUrl);
        }
    }, [user]);

    const handleChange = (e) => {
        const { value } = e.target;
        setFamilyImageUrl(value);
    };

    return (
        <div className="col-12 col-md-6 mb-2">
            <label htmlFor="user-short-description" className="form-label">
                Фото семьи 
            </label>
            <div class="input-group">
            <input 
            type="file" 
            class="form-control" 
            id="inputGroupFile04" 
            aria-describedby="inputGroupFileAddon04" 
            aria-label="Upload"
            
            onChange={handleChange}
            />
            </div>
        </div>
    );
};

export default UFPFamilyImage;