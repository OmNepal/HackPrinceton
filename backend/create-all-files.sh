#!/bin/bash

# Create models/User.js
cat > models/User.js << 'USERJS'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must be less than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  ideas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Idea' }],
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toJSON = function() {
  const user = this.toObject()
  delete user.password
  delete user.__v
  return user
}

export default mongoose.model('User', userSchema)
USERJS

# Create middleware/auth.js
cat > middleware/auth.js << 'AUTHJS'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET)
    
    // Verify user still exists in database
    const user = await User.findById(verified.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    req.user = verified
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired. Please login again.' })
    }
    res.status(500).json({ error: 'Error authenticating token' })
  }
}
AUTHJS

# Create routes/auth.js
cat > routes/auth.js << 'ROUTEAUTH'
import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    const user = new User({ fullName, email, password })
    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    })
  } catch (error) {
    console.error('Registration error:', error)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ error: messages.join(', ') })
    }
    res.status(500).json({ error: 'Error creating user account' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    user.lastLogin = Date.now()
    await user.save()

    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Error logging in' })
  }
})

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({
      success: true,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    })
  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({ error: 'Error verifying token' })
  }
})

export default router
ROUTEAUTH

# Create routes/ideas.js
cat > routes/ideas.js << 'ROUTEIDEAS'
import express from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a business idea' })
    }

    const mockResponse = {
      success: true,
      message: 'Idea received successfully',
      analysis: {
        ideaSummary: message,
        viabilityScore: 7.5,
        suggestedSteps: [
          'Market research and validation',
          'Competitive analysis',
          'Financial planning',
          'MVP development'
        ]
      },
      timestamp: new Date().toISOString()
    }

    res.json(mockResponse)
  } catch (error) {
    console.error('Idea submission error:', error)
    res.status(500).json({ error: 'Error processing your idea' })
  }
})

export default router
ROUTEIDEAS

echo "✅ All backend files created!"
echo ""
echo "Next: npm install && npm run dev"
