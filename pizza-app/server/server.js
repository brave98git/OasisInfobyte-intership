const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Make io accessible in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const pizzaRoutes = require('./routes/pizzaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pizza', pizzaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('DB Connection Error:', err));

// Socket.io for Real-time Updates
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
