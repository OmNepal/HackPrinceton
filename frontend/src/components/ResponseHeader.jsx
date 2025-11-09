import { motion } from 'framer-motion'

function ResponseHeader({ receivedIdea, budget, location, executiveSummary, theme = 'dark', onGenerateBrief, generatingBrief }) {
  const isDark = theme === 'dark'
  const budgetLabels = {
    "under-10k": "Under $10,000",
    "10k-50k": "$10,000 - $50,000",
    "50k-100k": "$50,000 - $100,000",
    "100k-500k": "$100,000 - $500,000",
    "500k-plus": "$500,000+"
  }

  return (
    <div className="mb-8 space-y-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative ${isDark 
          ? 'bg-slate-800/60 backdrop-blur-xl border border-purple-500/20' 
          : 'bg-white/70 backdrop-blur-xl border border-purple-200/40'
        } rounded-3xl shadow-xl p-8 overflow-hidden`}
      >
        <div className={`absolute inset-0 ${isDark 
          ? 'bg-gradient-to-r from-purple-900/20 via-violet-900/20 to-fuchsia-900/20' 
          : 'bg-gradient-to-r from-purple-100/30 via-violet-100/30 to-fuchsia-100/30'
        } backdrop-blur-sm`}></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <h2 className={`text-4xl font-extrabold flex-1 ${isDark ? 'text-white' : 'text-slate-900'} drop-shadow-sm`}>{receivedIdea || "Business Idea"}</h2>
            {onGenerateBrief && (
              <motion.button
                onClick={onGenerateBrief}
                disabled={generatingBrief}
                whileHover={{ scale: generatingBrief ? 1 : 1.05 }}
                whileTap={{ scale: generatingBrief ? 1 : 0.95 }}
                className={`ml-4 px-6 py-3 cursor-pointer rounded-xl font-bold text-sm transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 text-white shadow-lg shadow-purple-500/20'
                } disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed`}
              >
                {generatingBrief ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      ⚡
                    </motion.span>
                    Generating...
                  </>
                ) : (
                  <>
                    📄 Generate Business Brief
                  </>
                )}
              </motion.button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {budget && (
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className={`px-4 py-2 ${isDark 
                  ? 'bg-purple-500/20 border-purple-400/30 text-purple-200' 
                  : 'bg-purple-200/50 border-purple-300/50 text-purple-800'
                } backdrop-blur-md rounded-full text-sm font-bold border shadow-md`}
              >
                💰 {budgetLabels[budget] || budget}
              </motion.span>
            )}
            {location && (
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className={`px-4 py-2 ${isDark 
                  ? 'bg-purple-500/20 border-purple-400/30 text-purple-200' 
                  : 'bg-purple-200/50 border-purple-300/50 text-purple-800'
                } backdrop-blur-md rounded-full text-sm font-bold border shadow-md`}
              >
                📍 {location}
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      {executiveSummary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative ${isDark 
            ? 'bg-slate-800/60 backdrop-blur-xl border border-purple-500/20' 
            : 'bg-white/70 backdrop-blur-xl border border-purple-200/40'
          } rounded-3xl shadow-xl p-8 overflow-hidden`}
        >
          <div className={`absolute inset-0 ${isDark 
            ? 'bg-gradient-to-r from-purple-900/20 via-violet-900/20 to-fuchsia-900/20' 
            : 'bg-gradient-to-r from-purple-100/30 via-violet-100/30 to-fuchsia-100/30'
          } backdrop-blur-sm`}></div>
          <div className="relative z-10">
            <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="text-3xl">📊</span>
              Executive Summary
            </h3>
            <p className={`leading-relaxed text-lg ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{executiveSummary}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ResponseHeader

