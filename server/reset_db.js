require('dotenv').config();
const mongoose = require('mongoose');

const resetDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gdgc_portal');
        console.log(`Connected to ${mongoose.connection.host}`);

        await mongoose.connection.dropDatabase();
        console.log('Database dropped successfully. System is clean.');

        process.exit(0);
    } catch (err) {
        console.error('Error resetting DB:', err.message);
        process.exit(1);
    }
};

resetDB();
