import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserOrders = ({ userId }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
                params: { userId: userId },
            });
            setOrders(response.data); // Обновляем состояние с новыми заказами
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
        }
    };
    fetchOrders();
}, [userId]);

    return (
        <div className="user-orders">
            <h2>Заказы</h2>
            {orders.length === 0 ? (
                <p>Нет заказов.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id}>{order.description}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserOrders;
