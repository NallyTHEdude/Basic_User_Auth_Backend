import app from './app.js';
import dotenv from 'dotenv';

// configuring dotenv
dotenv.config({
    path: './.env',
});

// initializing express application
const PORT = process.env.PORT || 3000;


//app listener
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});