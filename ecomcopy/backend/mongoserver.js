const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/Ecommerce'; // Adjust to match your setup

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Ecommerce') .then(() => console.log('Connected to MongoDB')) .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  searchHistory: [
    {
      searchQuery: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model('User', userSchema);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Recommendation System API!');
});

// Signup Endpoint
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();

    // Include userId in the response
    res.status(201).json({ 
      message: 'User registered successfully!', 
      userId: savedUser._id
    });
  } catch (error) {
    res.status(400).json({ error: 'Error registering user', details: error });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });

    // Include userId in the response
    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      userId: user._id 
    });
  } catch (error) {
    res.status(400).json({ error: 'Error logging in', details: error });
  }
});

// Save Search History Endpoint
app.post('/saveSearchHistory', async (req, res) => {
  const { userId, searchQuery } = req.body;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const user = await User.findById(userId); // Ensure userId is provided in the body
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.searchHistory.push({ searchQuery });
    await user.save();

    res.status(201).json({ message: 'Search history saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save search history', details: error });
  }
});

// Get User's Search History Endpoint
app.get('/getSearchHistory/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.searchHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search history', details: error });
  }
});

// Update User Profile Endpoint
app.put('/updateProfile', async (req, res) => {
  const { userId, username, email } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.username = username || user.username;
    user.email = email || user.email;
    const updatedUser = await user.save();

    res.status(200).json({ message: 'User profile updated successfully!', updatedUser });
  } catch (error) {
    res.status(400).json({ error: 'Error updating profile', details: error });
  }
});

// Get User Profile Endpoint
// Get User Profile Endpoint
app.get('/getUserProfile/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error('Invalid user ID format:', userId);
    return res.status(400).json({ error: 'Invalid user ID format' });
  }
  try {
    const user = await User.findById(userId, 'username email');
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User profile fetched successfully:', user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile', details: error });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});