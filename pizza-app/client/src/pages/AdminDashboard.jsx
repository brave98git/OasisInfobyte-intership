import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

export default function AdminDashboard() {
    const { token, logoutUser } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newInv, setNewInv] = useState({ category: 'base', name: '', stock: 0, threshold: 20 });
    const [socketUrl] = useState('http://localhost:5000');

    useEffect(() => {
        fetchInventory();
        fetchOrders();

        const socket = io(socketUrl);
        socket.on('newOrderReceived', (order) => {
            setOrders(prev => [order, ...prev]);
            fetchInventory();
        });

        return () => socket.disconnect();
    }, [socketUrl]);

    const fetchInventory = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/inventory', { headers: { Authorization: `Bearer ${token}` } });
            setInventory(data);
        } catch (err) { console.log(err); }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
            setOrders(data);
        } catch (err) { console.log(err); }
    };

    const addInventoryItem = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/inventory', newInv, { headers: { Authorization: `Bearer ${token}` } });
            fetchInventory();
            setNewInv({ category: 'base', name: '', stock: 0, threshold: 20 });
        } catch (err) { console.log(err); }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/order/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchOrders();
        } catch (err) { console.log(err); }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center bg-gray-900 p-6 rounded-lg text-white shadow">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button onClick={logoutUser} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition">Logout</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inventory Management */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Inventory Management</h2>

                    <form onSubmit={addInventoryItem} className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded border">
                        <select className="border p-2 rounded" value={newInv.category} onChange={e => setNewInv({ ...newInv, category: e.target.value })}>
                            <option value="base">Base</option>
                            <option value="sauce">Sauce</option>
                            <option value="cheese">Cheese</option>
                            <option value="veggies">Veggies</option>
                            <option value="meat">Meat</option>
                        </select>
                        <input type="text" placeholder="Item Name" className="border p-2 rounded flex-1" value={newInv.name} onChange={e => setNewInv({ ...newInv, name: e.target.value })} required />
                        <input type="number" placeholder="Stock" className="border p-2 rounded w-24" value={newInv.stock} onChange={e => setNewInv({ ...newInv, stock: e.target.value })} required />
                        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">Add / Update</button>
                    </form>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {inventory.map(item => (
                            <div key={item._id} className="flex justify-between items-center p-3 border rounded shadow-sm hover:bg-gray-50">
                                <div>
                                    <span className="font-bold text-gray-800">{item.name}</span> <span className="text-xs text-gray-500 uppercase tracking-widest ml-2 bg-gray-200 px-2 py-1 rounded">{item.category}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold ${item.stock <= item.threshold ? 'text-red-600' : 'text-green-600'}`}>Stock: {item.stock}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Management */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Recent Orders</h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {orders.map(order => (
                            <div key={order._id} className="border p-4 rounded shadow-sm bg-gray-50">
                                <div className="flex justify-between mb-3 border-b pb-2">
                                    <span className="font-mono text-sm text-gray-600">ID: {order._id}</span>
                                    <span className="font-bold text-gray-800">Total: ₹{order.totalAmount}</span>
                                </div>
                                <div className="mb-3 text-sm text-gray-800">
                                    <p><span className="font-semibold">User:</span> {order.user?.name} ({order.user?.email})</p>
                                    <p><span className="font-semibold">Paid:</span> {order.isPaid ? 'Yes (Razorpay)' : 'No'}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase
                    ${order.status === 'Order received' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'In the kitchen' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'}`}>
                                        {order.status}
                                    </span>
                                    <select
                                        className="border p-1 rounded text-sm cursor-pointer shadow-sm hover:border-gray-400 focus:outline-none"
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    >
                                        <option value="Order received">Order received</option>
                                        <option value="In the kitchen">In the kitchen</option>
                                        <option value="Sent to delivery">Sent to delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-gray-500 text-center py-4">No orders yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
