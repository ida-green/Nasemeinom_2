// UserModalContext.js
import React, { createContext, useContext, useState } from 'react';

const UserModalContext = createContext();

export const UserModalProvider = ({ children }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const openModal = (userId) => {
        setSelectedUserId(userId);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedUserId(null); // Сброс ID при закрытии
    };

    return (
        <UserModalContext.Provider value={{ modalIsOpen, openModal, closeModal, selectedUserId }}>
            {children}
        </UserModalContext.Provider>
    );
};

export const useUserModal = () => {
    return useContext(UserModalContext);
};