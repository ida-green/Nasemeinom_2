import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UFPChildren = ({ user }) => {
    const [children, setChildren] = useState(user.children || [{ name: '', gender_id: '', birthDate: '', educationForm: '' }]);
    const [educationForms, setEducationForms] = useState([]);
    const [errors, setErrors] = useState({});
    const [errorMessages, setErrorMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        if (user.children) {
            // Инициализация состояния детей с преобразованием gender_id и education_form_id в названия
            setChildren(user.children.map(child => ({
                name: child.name || '',
                gender_id: child.gender_id || '',
                birthDate: child.birth_date || '',
                educationForm: child.education_form_id || ''
            })));
        }
    }, [user]);

    useEffect(() => {
        const fetchEducationForms = async () => {
            setError(null);
            try {
                const educationFormsResponse = await axios.get('http://localhost:3000/api/educationForms');
                setEducationForms(educationFormsResponse.data);
                console.log(educationFormsResponse.data);
            } catch (err) {
                console.error('Ошибка при загрузке форм образования:', err);
                setError('Ошибка при загрузке форм образования');
            }
        };

        fetchEducationForms();
    }, []);

    const validateForm = () => {
    const newErrorMessages = [];
    children.forEach((child, index) => {
        if (!child.name || !child.gender_id || !child.birthDate || !child.educationForm) {
            newErrorMessages[index] = 'Необходимо заполнить все данные о ребенке';
        } else {
            newErrorMessages[index] = ''; // Очищаем сообщение об ошибке, если все данные введены
        }
    });
    setErrorMessages(newErrorMessages);
    return newErrorMessages.every(msg => msg === ''); // Возвращаем true, если ошибок нет
};

const addChild = (event) => {
    event.preventDefault(); // предотвращаем отправку формы
    if (validateForm() && children.length === 0 || errorMessages[children.length - 1] === '') {
        setChildren([...children, { name: '', gender_id: '', birthDate: '', educationForm: '' }]);
        setErrorMessages([]); // Очищаем сообщения об ошибках при добавлении нового ребенка
    }
};

const handleChangeChildren = (index, e) => {
    const updatedChildren = [...children];
    updatedChildren[index][e.target.name] = e.target.value;
    setChildren(updatedChildren);
    
    // После изменения данных проверяем форму
    validateForm();
};

    const removeChild = (index) => {
        setChildren(children.filter((_, i) => i !== index));
        setErrorMessages([]); // Очищаем сообщения об ошибках при удалении ребенка
    };
    
    return (
        <div>
            <label htmlFor="user-children" className="form-label mt-2">Дети</label>
            <ol className="list-group mb-2">
            {children.map((child, index) => (
                 <li className="list-group-item mb-1" key={index}>
                     <div className="row align-items-center mt-1 mb-2">
                     <div className="col-12 col-md-3 mb-1 align-center">
                     <label htmlFor={`child-name-${index}`} className="form-label">Имя ребенка</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={child.name}
                        onChange={(e) => handleChangeChildren(index, e)}
                        placeholder="Имя"
                    />
                    </div>
                    <div className="col-12 col-md-2 mb-1">
                            <label htmlFor={`child-gender-${index}`} className="form-label">Пол</label>
                    <select
                        name="gender_id"
                        className="form-select"
                        value={child.gender_id}
                        onChange={(e) => handleChangeChildren(index, e)}
                    >
                        <option value="">Выберите пол</option>
                        <option value="1">мальчик</option>
                        <option value="2">девочка</option>
                    </select>
                    </div>

                    <div className="col-12 col-md-3 mb-1">
                            <label htmlFor={`birthDate-${index}`} className="form-label">Дата рождения</label>
                    <input
                        type="date"
                        className="form-control" 
                        name="birthDate"
                        value={child.birthDate}
                        onChange={(e) => handleChangeChildren(index, e)}
                    />
                    </div>

                    <div className="col-12 col-md-3 mb-1">
                    <label htmlFor={`education-form-${index}`} className="form-label">Форма обучения</label>
                    <select
                        name="educationForm"
                        className="form-select"
                        value={child.educationForm}
                        onChange={(e) => handleChangeChildren(index, e)}
                    >
                        <option value="">Форма обучения</option>
                        {educationForms.map((form) => (
                            <option key={form.id} value={form.id}>{form.title}</option>
                        ))}
                    </select>
                    </div>
                    {errors[index] && <p style={{ color: 'grey' }}>{errors[index]}</p>}
                    
                    {/* Иконка удаления */}
                     <div className="col-auto">
                            <button 
                                className="btn" 
                                onClick={() => removeChild(index)} 
                                aria-label="Удалить ребенка">
                                <i className="fa-solid fa-trash-can fa-lg"></i>
                            </button>
                        </div>
                    </div> 
                </li>
            ))}
            </ol>
            <button 
            className="btn btn-outline-secondary" 
            onClick={addChild}>Добавить ребенка</button>
            {errorMessages.length > 0 && errorMessages.map((msg, index) => (
                <p key={index} style={{ color: 'red' }}>{msg}</p>
            ))}       
        </div>
    );
};

export default UFPChildren;
