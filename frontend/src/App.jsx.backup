import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)
    console.log('Submitting idea:', input)

    try {
      const res = await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
      setInput('') // Clear input after successful send
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to connect to backend. Make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            FoundrMate
          </h1>
          <p className="text-gray-600 text-lg">
            Turn your business idea into reality with AI-powered guidance
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <label htmlFor="business-idea" className="block text-sm font-semibold text-gray-700 mb-3">
              Describe Your Business Idea
            </label>
            <textarea
              id="business-idea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., I want to create an app that helps people find local farmers markets and connect with local producers..."
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-gray-500">
                {input.length} characters
              </span>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Send Idea'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Response
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            ⚠️ FoundrMate provides informational guidance only and not legal advice
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
