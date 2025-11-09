import { useState, useEffect } from 'react'
import Auth from './Auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

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
    setResponse(null)
    setError(null)
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
        body: JSON.stringify({ message: input }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setResponse(data)
      setInput('')
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
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
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Describe Your Business Idea</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., An app that helps people find local farmers markets..."
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
              disabled={loading}
            />
            <div className="flex justify-between mt-4">
              <span className="text-xs text-gray-500">{input.length} characters</span>
              <button type="submit" disabled={loading || !input.trim()} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:from-gray-400">
                {loading ? 'Processing...' : 'Send Idea'}
              </button>
            </div>
          </div>
        </form>

        {error && <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4"><p className="text-red-700">{error}</p></div>}
        {response && <div className="mt-6 bg-white rounded-2xl shadow-xl p-6"><h2 className="text-2xl font-bold text-gray-800 mb-4">Response</h2><pre className="whitespace-pre-wrap text-sm">{JSON.stringify(response, null, 2)}</pre></div>}
      </div>
    </div>
  )
}

export default App
