import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const { user, logoutUser, token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin');
        } else {
            fetchMyOrders();
        }
    }, [user, navigate]);

    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/orders/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(data);
        } catch (err) {
            console.log(err);
        }
    };

    const predefinedPizzas = [
        { name: 'Margherita', desc: 'Classic delight with 100% real mozzarella cheese' },
        { name: 'Farmhouse', desc: 'Delightful combination of onion, capsicum, tomato & grilled mushroom' },
        { name: 'Peppy Paneer', desc: 'Flavorful trio of juicy paneer, crisp capsicum with spicy red paprika' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 shadow rounded-lg">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
                <div className="space-x-4">
                    <Link to="/custom-pizza" className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 shadow-lg transition">
                        Start Custom Pizza
                    </Link>
                    <button onClick={logoutUser} className="text-gray-600 hover:text-gray-900 font-semibold border px-4 py-2 rounded">
                        Logout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {predefinedPizzas.map((pizza, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                        <h3 className="text-xl font-bold text-red-600 mb-2">{pizza.name}</h3>
                        <p className="text-gray-600 mb-4">{pizza.desc}</p>
                        <Link to="/custom-pizza" className="text-sm border-2 border-red-600 text-red-600 px-4 py-1 flex items-center justify-center rounded hover:bg-red-50">
                            Customize
                        </Link>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">My Orders</h2>
                {orders.length === 0 ? (
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="border-b pb-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-lg text-gray-800">Order ID: {order._id.substring(order._id.length - 6).toUpperCase()}</p>
                                    <p className="text-gray-600">Items: {order.items.length}</p>
                                    <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-gray-800">₹{order.totalAmount}</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-2
                    ${order.status === 'Order received' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'In the kitchen' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
