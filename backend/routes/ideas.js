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
