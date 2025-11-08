const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());   // To parse JSON request bodies 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Test Route 
app.get('/', (req, res) => {
  res.send('AI Money Mentor API is running!');
});

//Import Routes (we will create these next) 
 app.use('/api/auth', require('./routes/auth'));
 app.use('/api/transactions', require('./routes/transactions'));  

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
