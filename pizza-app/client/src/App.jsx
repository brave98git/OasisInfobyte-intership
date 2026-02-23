import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Placeholders for Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CustomPizza from './pages/CustomPizza';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    return children;
};

function AppRoutes() {
    return (
        <div className="min-h-screen">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-red-600">PizzaApp</span>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/custom-pizza" element={<ProtectedRoute><CustomPizza /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
