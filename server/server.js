require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000; // This defines the port

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
const connectDB = async () => {
    try {
        // DNS override removed for production stability


        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gdgc_portal');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Routes Placeholders
app.get('/', (req, res) => {
    res.send('GDGC Portal API Running');
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin')); // Revert to original admin handling
app.use('/api/stats', require('./routes/stats')); // Mount the stats route at correct path
app.use('/api/messages', require('./routes/messages')); // Mount the messages route


// Start Server
// Start Server for local development
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
} else {
    // For Cloud Functions, ensure DB connection is initiated
    connectDB();
}

module.exports = app;
