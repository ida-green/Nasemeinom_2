import React, { useEffect, useState } from 'react';

const UserOrders = ({ userId }) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const response = await fetch(`/api/orders?userId=${userId}`);
            const data = await response.json();
            setOrders(data);
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
