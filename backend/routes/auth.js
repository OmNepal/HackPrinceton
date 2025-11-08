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
