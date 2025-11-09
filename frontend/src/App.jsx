import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './context/ThemeContext'
import Auth from './Auth'
import ResponseHeader from './components/ResponseHeader'
import LegalTab from './components/LegalTab'
import FinanceTab from './components/FinanceTab'
import SynthesizedPlan from './components/SynthesizedPlan'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [input, setInput] = useState('')
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('legal')
  const [generatingBrief, setGeneratingBrief] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)

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

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      setIsRecording(false)
      return
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const audioChunks = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        
        // Send to backend for transcription
        setIsTranscribing(true)
        try {
          const token = localStorage.getItem('token')
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')
          
          const res = await fetch('http://localhost:3000/api/transcribe', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })
          
          if (!res.ok) {
            throw new Error(`Transcription failed: ${res.status}`)
          }
          
          const data = await res.json()
          if (data.transcript) {
            setInput(data.transcript)
          } else {
            throw new Error('No transcript received')
          }
        } catch (err) {
          setError(err.message || 'Failed to transcribe audio')
        } finally {
          setIsTranscribing(false)
        }
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone permissions.')
      setIsRecording(false)
    }
  }

  const handleGenerateBrief = async () => {
    if (!response) return
    
    setGeneratingBrief(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/business-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idea: response.received_idea,
          budget: response.budget,
          location: response.location,
          legal_data: response.legal?.formatted || null,
          financial_data: response.financial?.formatted || null,
          synthesized_plan: response.synthesized_plan || null
        })
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      // Get the PDF blob
      const blob = await res.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `business_brief_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err.message || 'Failed to generate business brief')
    } finally {
      setGeneratingBrief(false)
    }
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  const isDark = theme === 'dark'
  
  // Theme-based colors
  const bgColors = isDark 
    ? {
        primary: 'from-slate-900 via-slate-800 to-slate-900',
        secondary: 'from-slate-800/50 via-slate-700/50 to-slate-800/50',
        accent: 'from-blue-600/10 via-indigo-600/10 to-slate-700/10'
      }
    : {
        primary: 'from-slate-100 via-slate-50 to-slate-100',
        secondary: 'from-slate-200/50 via-slate-100/50 to-slate-200/50',
        accent: 'from-blue-100/20 via-indigo-100/20 to-slate-200/20'
      }

  const textColors = isDark
    ? {
        primary: 'text-white',
        secondary: 'text-white/90',
        muted: 'text-white/70',
        subtle: 'text-white/60'
      }
    : {
        primary: 'text-slate-900',
        secondary: 'text-slate-800',
        muted: 'text-slate-700',
        subtle: 'text-slate-600'
      }

  const cardStyles = isDark
    ? 'bg-white/10 backdrop-blur-xl border-white/20'
    : 'bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-lg'

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'dark' : 'light'}`}>
      {/* Animated background with color transitions */}
      <div className={`fixed inset-0 bg-gradient-to-br ${bgColors.primary} transition-colors duration-1000`}>
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] ${isDark ? 'opacity-20' : 'opacity-10'}`}></div>
        <motion.div
          animate={{
            background: isDark 
              ? [
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(79, 70, 229, 0.08) 100%)',
                  'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.08) 50%, rgba(59, 130, 246, 0.08) 100%)',
                  'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(99, 102, 241, 0.08) 100%)',
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(79, 70, 229, 0.08) 100%)'
                ]
              : [
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 50%, rgba(79, 70, 229, 0.12) 100%)',
                  'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(79, 70, 229, 0.12) 50%, rgba(59, 130, 246, 0.12) 100%)',
                  'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(59, 130, 246, 0.12) 50%, rgba(99, 102, 241, 0.12) 100%)',
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 50%, rgba(79, 70, 229, 0.12) 100%)'
                ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/30' : 'from-white/20'} to-transparent`}></div>
              </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto p-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1"></div>
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl font-extrabold flex-1 text-center relative"
            >
              <span
                className="inline-block animate-gradient-text drop-shadow-lg"
                style={{
                  backgroundImage: isDark
                    ? "linear-gradient(90deg, #a78bfa, #c084fc, #e879f9, #f472b6, #fb7185, #f472b6, #e879f9, #c084fc, #a78bfa)"
                    : "linear-gradient(90deg, #7c3aed, #9333ea, #c026d3, #db2777, #e11d48, #db2777, #c026d3, #9333ea, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Foundaura+
              </span>
            </motion.h1>
            <div className="flex items-center gap-3 flex-1 justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2.5 cursor-pointer ${isDark 
                  ? 'bg-white/10 hover:bg-white/15 text-white' 
                  : 'bg-slate-200/80 hover:bg-slate-300/80 text-slate-700'
                } backdrop-blur-md rounded-xl border ${isDark ? 'border-white/20' : 'border-slate-300/50'} transition-all`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </motion.button>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`text-right ${isDark 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/60 border-slate-200/50'
                } backdrop-blur-md rounded-2xl px-4 py-2 border`}
              >
                <p className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>Welcome,</p>
                <p className={`font-semibold ${textColors.primary}`}>{user?.fullName || user?.email}</p>
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout} 
                className={`px-4 py-2 cursor-pointer ${isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 border-white/10' 
                  : 'bg-slate-200/60 hover:bg-slate-300/60 text-slate-600 hover:text-slate-700 border-slate-300/30'
                } rounded-lg text-sm font-medium border transition-all`}
              >
                Logout
              </motion.button>
            </div>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${textColors.muted} text-xl font-medium`}
          >
            Empowering the founder in everyone.
          </motion.p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit} 
          className="space-y-6 mb-8"
        >
          <div className={`${cardStyles} rounded-3xl shadow-2xl border p-8 space-y-6`}>
            <div>
              <label className={`block text-sm font-bold ${textColors.secondary} mb-3 flex items-center gap-2`}>
                <span className="text-2xl">💡</span>
                Describe Your Business Idea
              </label>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="E.g., An app that helps people find local farmers markets..."
                  className={`w-full h-40 p-5 pr-16 ${isDark 
                    ? 'bg-white/10 border-white/30 text-white placeholder-white/50 focus:ring-blue-500/50 focus:border-blue-500/50' 
                    : 'bg-white/60 border-slate-300/50 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500/30'
                  } backdrop-blur-sm border-2 rounded-2xl resize-none transition-all`}
                  disabled={loading || isTranscribing}
                />
                <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
                  {(isRecording || isTranscribing) && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        isRecording
                          ? isDark
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-red-100 text-red-700'
                          : isDark
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isRecording ? 'Recording' : 'Transcribing'}
                    </motion.span>
                  )}
                  <motion.button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={loading || isTranscribing}
                    whileHover={{ scale: isRecording || loading || isTranscribing ? 1 : 1.1 }}
                    whileTap={{ scale: isRecording || loading || isTranscribing ? 1 : 0.9 }}
                    className={`p-3 cursor-pointer rounded-xl transition-all ${
                      isRecording
                        ? isDark
                          ? 'bg-red-500/20 border-red-400/50 text-red-400'
                          : 'bg-red-100 border-red-300 text-red-600'
                        : isDark
                          ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                          : 'bg-white/60 border-slate-300/50 text-slate-700 hover:bg-white/80'
                    } border backdrop-blur-sm ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Record voice input'}
                  >
                    {isTranscribing ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="text-xl"
                      >
                        ⏳
                      </motion.span>
                    ) : isRecording ? (
                      <span className="text-xl">⏹️</span>
                    ) : (
                      <span className="text-xl">🎤</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`block text-sm font-bold ${textColors.secondary} mb-3 flex items-center gap-2`}>
                  <span className="text-xl">💰</span>
                  Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={`w-full px-5 py-3.5 ${isDark 
                    ? 'bg-white/10 border-white/30 text-white focus:ring-blue-500/50 focus:border-blue-500/50' 
                    : 'bg-white/60 border-slate-300/50 text-slate-900 focus:ring-blue-500/30 focus:border-blue-500/30'
                  } backdrop-blur-sm border-2 rounded-2xl transition-all`}
                  disabled={loading}
                >
                  <option value="" className={isDark ? 'bg-slate-800' : 'bg-white'}>Select budget range to get financial advice</option>
                  <option value="under-10k" className={isDark ? 'bg-slate-800' : 'bg-white'}>Under $10,000</option>
                  <option value="10k-50k" className={isDark ? 'bg-slate-800' : 'bg-white'}>$10,000 - $50,000</option>
                  <option value="50k-100k" className={isDark ? 'bg-slate-800' : 'bg-white'}>$50,000 - $100,000</option>
                  <option value="100k-500k" className={isDark ? 'bg-slate-800' : 'bg-white'}>$100,000 - $500,000</option>
                  <option value="500k-plus" className={isDark ? 'bg-slate-800' : 'bg-white'}>$500,000+</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-bold ${textColors.secondary} mb-3 flex items-center gap-2`}>
                  <span className="text-xl">📍</span>
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Eg: Princeton, NJ"
                  className={`w-full px-5 py-3.5 ${isDark 
                    ? 'bg-white/10 border-white/30 text-white placeholder-white/50 focus:ring-blue-500/50 focus:border-blue-500/50' 
                    : 'bg-white/60 border-slate-300/50 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500/30'
                  } backdrop-blur-sm border-2 rounded-2xl transition-all`}
              disabled={loading}
            />
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <motion.span 
                animate={{ scale: input.length > 0 ? [1, 1.1, 1] : 1 }}
                className={`text-xs ${textColors.subtle} font-medium`}
              >
                {input.length} characters
              </motion.span>
              <motion.button 
                type="submit" 
                disabled={loading || !input.trim()} 
                whileHover={{ scale: loading || !input.trim() ? 1 : 1.05 }}
                whileTap={{ scale: loading || !input.trim() ? 1 : 0.95 }}
                className={`px-10 py-4 cursor-pointer ${isDark 
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 text-white shadow-lg shadow-purple-500/20'
                } rounded-2xl font-bold text-lg disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        ⚡
                      </motion.span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Analyze Idea
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.form>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mt-6 ${isDark 
              ? 'bg-red-500/20 border-red-400/50 text-red-100' 
              : 'bg-red-100/80 border-red-400/60 text-red-800'
            } backdrop-blur-md border-l-4 rounded-2xl p-5 shadow-xl`}
          >
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <ResponseHeader
              receivedIdea={response.received_idea}
              budget={response.budget}
              location={response.location}
              executiveSummary={response.synthesized_plan?.executive_summary}
              theme={theme}
              onGenerateBrief={handleGenerateBrief}
              generatingBrief={generatingBrief}
            />

            <div className={`${cardStyles} rounded-3xl shadow-2xl border overflow-hidden`}>
              {(response.legal || response.financial) && (
                <div className={`flex ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/50 border-slate-200/50'} backdrop-blur-sm border-b`}>
                  {response.legal && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('legal')}
                      className={`flex-1 px-8 py-5 font-bold text-lg transition-all relative cursor-pointer ${
                        activeTab === 'legal'
                          ? isDark
                            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20'
                          : isDark
                            ? 'bg-transparent text-white/70 hover:text-white hover:bg-white/5'
                            : 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      {activeTab === 'legal' && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 ${isDark 
                            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600' 
                            : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500'
                          }`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        ⚖️ Dive into Legality & Compliance
                      </span>
                    </motion.button>
                  )}
                  {response.financial && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('finance')}
                      className={`flex-1 px-8 py-5 font-bold text-lg transition-all relative cursor-pointer ${
                        activeTab === 'finance'
                          ? isDark
                            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20'
                          : isDark
                            ? 'bg-transparent text-white/70 hover:text-white hover:bg-white/5'
                            : 'bg-transparent text-slate-700 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      {activeTab === 'finance' && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 ${isDark 
                            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600' 
                            : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500'
                          }`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        💰 Understand Finances
                      </span>
                    </motion.button>
                  )}
                </div>
              )}

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'legal' && response.legal && (
                    <motion.div
                      key="legal"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <LegalTab legalData={response.legal} theme={theme} />
                    </motion.div>
                  )}
                  {activeTab === 'finance' && response.financial && (
                    <motion.div
                      key="finance"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <FinanceTab financialData={response.financial} theme={theme} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {response.synthesized_plan && (
              <SynthesizedPlan plan={response.synthesized_plan} theme={theme} />
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App
