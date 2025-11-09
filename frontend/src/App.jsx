import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Auth from './Auth'
import ResponseHeader from './components/ResponseHeader'
import LegalTab from './components/LegalTab'
import FinanceTab from './components/FinanceTab'
import SynthesizedPlan from './components/SynthesizedPlan'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [input, setInput] = useState('')
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('legal')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleAuthSuccess = (data) => {
    setIsAuthenticated(true)
    setUser(data.user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setInput('')
    setBudget('')
    setLocation('')
    setResponse(null)
    setError(null)
    setActiveTab('legal')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: input,
          budget: budget,
          location: location
        })
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      
      // Extract only required fields from response.data
      const simplifiedData = {
        received_idea: data?.data?.received_idea || '',
        budget: data?.data?.budget || null,
        location: data?.data?.location || null,
        legal: data?.data?.legal ? {
          formatted: data.data.legal.formatted
        } : null,
        financial: data?.data?.financial ? {
          formatted: data.data.financial.formatted
        } : null,
        synthesized_plan: data?.data?.synthesized_plan || null
      }
      
      setResponse(simplifiedData)
      // Set active tab based on available data
      if (simplifiedData.legal) {
        setActiveTab('legal')
      } else if (simplifiedData.financial) {
        setActiveTab('finance')
      }
      setInput('')
      setBudget('')
      setLocation('')
    } catch (err) {
      setError(err.message || 'Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FoundrMate</h1>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold text-gray-800">{user?.fullName || user?.email}</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Logout</button>
            </div>
          </div>
          <p className="text-gray-600 text-lg">Turn your business idea into reality</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Describe Your Business Idea</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="E.g., An app that helps people find local farmers markets..."
                className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                >
                  <option value="">Select budget range to get financial advice</option>
                  <option value="under-10k">Under $10,000</option>
                  <option value="10k-50k">$10,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k-500k">$100,000 - $500,000</option>
                  <option value="500k-plus">$500,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Eg: Princeton, NJ"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{input.length} characters</span>
              <button type="submit" disabled={loading || !input.trim()} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:from-gray-400">
                {loading ? 'Processing...' : 'Analyze Idea'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-8">
            <ResponseHeader
              receivedIdea={response.received_idea}
              budget={response.budget}
              location={response.location}
              executiveSummary={response.synthesized_plan?.executive_summary}
            />

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {(response.legal || response.financial) && (
                <div className="flex border-b border-gray-200">
                  {response.legal && (
                    <button
                      onClick={() => setActiveTab('legal')}
                      className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                        activeTab === 'legal'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ⚖️ Dive into Legality
                    </button>
                  )}
                  {response.financial && (
                    <button
                      onClick={() => setActiveTab('finance')}
                      className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                        activeTab === 'finance'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      💰 Understand Finances
                    </button>
                  )}
                </div>
              )}

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'legal' && response.legal && (
                    <motion.div
                      key="legal"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LegalTab legalData={response.legal} />
                    </motion.div>
                  )}
                  {activeTab === 'finance' && response.financial && (
                    <motion.div
                      key="finance"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FinanceTab financialData={response.financial} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {response.synthesized_plan && (
              <SynthesizedPlan plan={response.synthesized_plan} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
