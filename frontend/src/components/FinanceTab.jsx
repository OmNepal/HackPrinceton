import { motion } from 'framer-motion'

function FundingCard({ source, index, isDark }) {
  const typeColors = isDark
    ? {
        grant: "from-emerald-600 via-teal-600 to-cyan-600 text-emerald-100 border-emerald-400/50",
        loan: "from-cyan-600 via-blue-600 to-indigo-600 text-cyan-100 border-cyan-400/50",
        mentorship: "from-violet-600 via-purple-600 to-fuchsia-600 text-violet-100 border-violet-400/50",
        investor: "from-rose-600 via-pink-600 to-fuchsia-600 text-rose-100 border-rose-400/50"
      }
    : {
        grant: "from-emerald-500 via-teal-500 to-cyan-500 text-white border-emerald-400/50",
        loan: "from-cyan-500 via-blue-500 to-indigo-500 text-white border-cyan-400/50",
        mentorship: "from-violet-500 via-purple-500 to-fuchsia-500 text-white border-violet-400/50",
        investor: "from-rose-500 via-pink-500 to-fuchsia-500 text-white border-rose-400/50"
      }

  const typeColor = typeColors[source.type?.toLowerCase()] || (isDark 
    ? "from-slate-600 to-slate-700 text-slate-100 border-slate-400/50" 
    : "from-slate-400 to-slate-500 text-white border-slate-300/50")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`${isDark 
        ? 'bg-white/10 border-white/20 hover:border-purple-500/50' 
        : 'bg-white/60 border-slate-200/50 hover:border-purple-400/50'
      } backdrop-blur-md rounded-2xl shadow-xl border p-6 transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{source.name}</h4>
        <motion.span 
          whileHover={{ scale: 1.1 }}
          className={`px-4 py-2 bg-gradient-to-r ${typeColor} rounded-full text-xs font-bold border shadow-lg`}
        >
          {source.type || "Other"}
        </motion.span>
      </div>
      <p className={`${isDark ? 'text-white/80' : 'text-slate-700'} mb-5 leading-relaxed`}>{source.description}</p>
      {source.link && (
        <motion.a
          href={source.link}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`inline-block px-6 py-3 cursor-pointer ${isDark 
            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 shadow-purple-500/30' 
            : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 shadow-purple-500/20'
          } text-white rounded-xl transition-all text-sm font-bold shadow-lg`}
        >
          Learn More →
        </motion.a>
      )}
    </motion.div>
  )
}

function CostItem({ item, index, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className={`${isDark 
        ? 'bg-white/10 border-white/20 hover:border-blue-500/50' 
        : 'bg-white/60 border-slate-200/50 hover:border-blue-400/50'
      } backdrop-blur-sm rounded-xl p-5 border shadow-lg transition-all`}
    >
      <div className="flex justify-between items-start mb-3">
        <h5 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} text-lg`}>{item.category}</h5>
        <motion.span 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
          className={`text-2xl font-extrabold ${isDark 
            ? 'bg-gradient-to-r from-blue-400 to-indigo-400' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          } bg-clip-text text-transparent`}
        >
          ${item.amount?.toLocaleString() || "0"}
        </motion.span>
      </div>
      {item.description && (
        <p className={`text-sm ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{item.description}</p>
      )}
    </motion.div>
  )
}

function FinanceTab({ financialData, theme = 'dark' }) {
  const isDark = theme === 'dark'
  if (!financialData || !financialData.formatted) {
    return (
      <div className={`text-center py-12 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
        No financial data available
      </div>
    )
  }

  const { summary, cost_breakdown, funding_sources = [], recommendations = [] } = financialData.formatted

  const fundingByType = funding_sources.reduce((acc, source) => {
    const type = source.type?.toLowerCase() || "other"
    if (!acc[type]) acc[type] = []
    acc[type].push(source)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {summary && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDark 
            ? 'bg-purple-500/10 border-purple-400/20' 
            : 'bg-purple-50/80 border-purple-200/40'
          } backdrop-blur-md rounded-2xl p-6 border shadow-xl`}
        >
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-3 flex items-center gap-2`}>
            <span className="text-2xl">📊</span>
            Summary
          </h3>
          <p className={`${isDark ? 'text-white/90' : 'text-slate-800'} leading-relaxed`}>{summary}</p>
        </motion.div>
      )}

      {cost_breakdown && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${isDark 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/80 border-slate-200/50'
          } backdrop-blur-xl rounded-3xl shadow-2xl p-8 border`}
        >
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-6 flex items-center gap-2`}>
            <span className="text-3xl">💰</span>
            Cost Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {cost_breakdown.startup_costs !== undefined && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={`${isDark 
                  ? 'bg-purple-500/20 border-purple-400/30' 
                  : 'bg-purple-100/60 border-purple-300/50'
                } backdrop-blur-md rounded-2xl p-6 border shadow-xl`}
              >
                <p className={`text-sm ${isDark ? 'text-white/70' : 'text-slate-700'} mb-2 font-medium`}>Startup Costs</p>
                <p                 className={`text-4xl font-extrabold ${isDark 
                  ? 'bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400' 
                  : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500'
                } bg-clip-text text-transparent`}>
                  ${cost_breakdown.startup_costs?.toLocaleString() || "0"}
                </p>
              </motion.div>
            )}
            {cost_breakdown.monthly_operating_costs !== undefined && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className={`${isDark 
                  ? 'bg-fuchsia-500/20 border-fuchsia-400/30' 
                  : 'bg-fuchsia-100/60 border-fuchsia-300/50'
                } backdrop-blur-md rounded-2xl p-6 border shadow-xl`}
              >
                <p className={`text-sm ${isDark ? 'text-white/70' : 'text-slate-700'} mb-2 font-medium`}>Monthly Operating Costs</p>
                <p className={`text-4xl font-extrabold ${isDark 
                  ? 'bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400' 
                  : 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500'
                } bg-clip-text text-transparent`}>
                  ${cost_breakdown.monthly_operating_costs?.toLocaleString() || "0"}
                </p>
              </motion.div>
            )}
          </div>
          {cost_breakdown.breakdown && cost_breakdown.breakdown.length > 0 && (
            <div className="space-y-4">
              <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} text-lg mb-4`}>Detailed Breakdown</h4>
              {cost_breakdown.breakdown.map((item, index) => (
                <CostItem key={index} item={item} index={index} isDark={isDark} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {funding_sources.length > 0 && (
        <div>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-6 flex items-center gap-2`}>
            <span className="text-3xl">🎯</span>
            Funding Sources
          </h3>
          {Object.entries(fundingByType).map(([type, sources]) => (
            <div key={type} className="mb-8">
              <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4 capitalize ${isDark 
                ? 'bg-white/10 border-white/20' 
                : 'bg-white/60 border-slate-200/50'
              } backdrop-blur-sm px-4 py-2 rounded-xl inline-block border`}>
                {type}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sources.map((source, index) => (
                  <FundingCard key={index} source={source} index={index} isDark={isDark} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${isDark 
            ? 'bg-slate-700/30 border-slate-600/40' 
            : 'bg-slate-100/60 border-slate-300/50'
          } backdrop-blur-md rounded-2xl p-6 border shadow-xl`}
        >
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-4 flex items-center gap-2`}>
            <span className="text-2xl">💡</span>
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`${isDark 
                  ? 'bg-white/10 border-white/20 hover:border-purple-500/50' 
                  : 'bg-white/40 border-slate-200/30 hover:border-purple-400/50'
                } backdrop-blur-sm rounded-xl p-4 border transition-all`}
              >
                <p className={isDark ? 'text-white/90' : 'text-slate-800'}>{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FinanceTab

