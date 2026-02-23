import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CustomPizza() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [ingredients, setIngredients] = useState(null);

    const [selection, setSelection] = useState({
        base: '',
        sauce: '',
        cheese: '',
        veggies: []
    });

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/pizza/ingredients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIngredients(data);
            setSelection({
                base: data.base[0]?.name || '',
                sauce: data.sauce[0]?.name || '',
                cheese: data.cheese[0]?.name || '',
                veggies: []
            });
        } catch (err) {
            console.log(err);
        }
    };

    const handleVeggieChange = (veggieName) => {
        setSelection(prev => {
            const inArray = prev.veggies.includes(veggieName);
            if (inArray) {
                return { ...prev, veggies: prev.veggies.filter(v => v !== veggieName) };
            } else {
                return { ...prev, veggies: [...prev.veggies, veggieName] };
            }
        });
    };

    const currentPrice = 200 + (selection.veggies.length * 20);

    const initPayment = (data) => {
        const options = {
            key: "test_key_id", // Dummy key for frontend
            amount: data.razorpayOrder.amount,
            currency: data.razorpayOrder.currency,
            name: "Pizza Delivery App",
            description: "Custom Pizza Order",
            order_id: data.razorpayOrder.id,
            handler: async (response) => {
                try {
                    const verifyUrl = "http://localhost:5000/api/orders/verify-payment";
                    await axios.post(verifyUrl, {
                        ...response,
                        orderId: data.order._id
                    }, { headers: { Authorization: `Bearer ${token}` } });

                    alert('Order placed successfully!');
                    navigate('/');
                } catch (error) {
                    console.log(error);
                    alert('Payment verification failed');
                }
            },
            theme: {
                color: "#dc2626"
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handleCheckout = async () => {
        try {
            const orderData = {
                items: [{ customPizza: { ...selection, price: currentPrice }, quantity: 1 }],
                totalAmount: currentPrice
            };
            const { data } = await axios.post('http://localhost:5000/api/orders/create', orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            initPayment(data);
        } catch (error) {
            console.log(error);
            alert('Checkout failed');
        }
    };

    if (!ingredients) return <div className="text-center p-10">Loading ingredients...</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow mt-8">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Build Your Custom Pizza</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Base */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">1. Choose a Base</h3>
                    <div className="space-y-3">
                        {ingredients.base.map(item => (
                            <label key={item._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded transition">
                                <input type="radio" name="base" className="form-radio h-5 w-5 text-red-600"
                                    checked={selection.base === item.name}
                                    onChange={() => setSelection({ ...selection, base: item.name })} />
                                <span className="text-gray-700 font-medium">{item.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Sauce */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">2. Pick a Sauce</h3>
                    <div className="space-y-3">
                        {ingredients.sauce.map(item => (
                            <label key={item._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded transition">
                                <input type="radio" name="sauce" className="form-radio h-5 w-5 text-red-600"
                                    checked={selection.sauce === item.name}
                                    onChange={() => setSelection({ ...selection, sauce: item.name })} />
                                <span className="text-gray-700 font-medium">{item.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Cheese */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">3. Select Cheese</h3>
                    <div className="space-y-3">
                        {ingredients.cheese.map(item => (
                            <label key={item._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded transition">
                                <input type="radio" name="cheese" className="form-radio h-5 w-5 text-red-600"
                                    checked={selection.cheese === item.name}
                                    onChange={() => setSelection({ ...selection, cheese: item.name })} />
                                <span className="text-gray-700 font-medium">{item.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Veggies */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">4. Add Veggies (+₹20 each)</h3>
                    <div className="space-y-3">
                        {ingredients.veggies.map(item => (
                            <label key={item._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white rounded transition">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-red-600 rounded"
                                    checked={selection.veggies.includes(item.name)}
                                    onChange={() => handleVeggieChange(item.name)} />
                                <span className="text-gray-700 font-medium">{item.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-10 p-6 bg-red-50 rounded-lg flex flex-col md:flex-row justify-between items-center border border-red-100">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Total Amount: <span className="text-red-600">₹{currentPrice}</span></h3>
                    <p className="text-sm text-gray-600">Base Pizza: ₹200 | Veggies: ₹{selection.veggies.length * 20}</p>
                </div>
                <button onClick={handleCheckout} className="mt-4 md:mt-0 bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transform hover:-translate-y-1 transition duration-300">
                    Checkout with Razorpay
                </button>
            </div>
        </div>
    );
}
