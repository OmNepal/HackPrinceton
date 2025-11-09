import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function StepCard({ step, index, isChecked, onToggle, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
          className={`${isDark ? 'bg-white/10 border-white/20 hover:border-purple-500/50' : 'bg-white/60 border-slate-200/50 hover:border-purple-400/50'} backdrop-blur-md rounded-2xl shadow-xl border overflow-hidden transition-all cursor-pointer`}
      onClick={onToggle}
    >
      <div className="p-6 flex items-start gap-4">
        <motion.input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className={`mt-1 w-6 h-6 ${isDark ? 'text-purple-400 accent-purple-400' : 'text-purple-500 accent-purple-500'} rounded-lg focus:ring-purple-400 cursor-pointer`}
        />
        <div className="flex-1">
          <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>{step.title}</h4>
          <p className={`${isDark ? 'text-white/80' : 'text-slate-700'} mb-4 leading-relaxed`}>{step.description}</p>
          {step.agency && (
            <div className={`mb-4 px-3 py-2 ${isDark ? 'bg-purple-500/20 border-purple-400/30' : 'bg-purple-100/60 border-purple-300/50'} rounded-lg border inline-block`}>
              <p className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                <span className="font-bold">Agency:</span> {step.agency}
              </p>
            </div>
          )}
          {step.links && step.links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {step.links.map((link, idx) => (
                <motion.a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 cursor-pointer ${isDark 
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 shadow-purple-500/30' 
                    : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 shadow-purple-500/20'
                  } text-white rounded-lg text-sm font-semibold shadow-lg transition-all`}
                >
                  🔗 Link {idx + 1}
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function LegalTab({ legalData, theme = 'dark' }) {
  const isDark = theme === 'dark'
  const [checkedSteps, setCheckedSteps] = useState(new Set())

  if (!legalData || !legalData.formatted) {
    return (
      <div className={`text-center py-12 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
        No legal data available
      </div>
    )
  }

  const { summary, steps = [], key_requirements = [], estimated_timeline } = legalData.formatted
  const progress = steps.length > 0 ? (checkedSteps.size / steps.length) * 100 : 0

  const toggleStep = (index) => {
    const newChecked = new Set(checkedSteps)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedSteps(newChecked)
  }

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
            <span className="text-2xl">📋</span>
            Summary
          </h3>
          <p className={`${isDark ? 'text-white/90' : 'text-slate-800'} leading-relaxed`}>{summary}</p>
        </motion.div>
      )}

      {steps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <span className="text-3xl">✅</span>
              Steps to Complete
            </h3>
            <motion.span 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`text-sm ${isDark ? 'text-white/80 bg-white/10 border-white/20' : 'text-slate-700 bg-white/60 border-slate-200/50'} font-bold backdrop-blur-sm px-4 py-2 rounded-full border`}
            >
              {checkedSteps.size} of {steps.length} completed
            </motion.span>
          </div>
          <div className={`mb-6 ${isDark ? 'bg-white/10 border-white/20' : 'bg-slate-200/50 border-slate-300/50'} backdrop-blur-sm rounded-full h-4 overflow-hidden border shadow-inner`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`${isDark 
                ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500' 
                : 'bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400'
              } h-full rounded-full shadow-lg`}
            />
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                step={step}
                index={index}
                isChecked={checkedSteps.has(index)}
                onToggle={() => toggleStep(index)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}

      {key_requirements && key_requirements.length > 0 && (
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
            <span className="text-2xl">⚠️</span>
            Key Requirements
          </h3>
          <ul className="space-y-3">
            {key_requirements.map((req, index) => (
              <motion.li 
                key={index} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`flex items-start gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/40 border-slate-200/30'} rounded-lg p-3 border`}
              >
                <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mt-1 text-xl`}>•</span>
                <span className={isDark ? 'text-white/90' : 'text-slate-800'}>{req}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {estimated_timeline && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${isDark 
            ? 'bg-purple-500/10 border-purple-400/20' 
            : 'bg-purple-50/80 border-purple-200/40'
          } backdrop-blur-md rounded-2xl p-6 border shadow-xl`}
        >
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-3 flex items-center gap-2`}>
            <span className="text-2xl">⏱️</span>
            Estimated Timeline
          </h3>
          <p className={`${isDark ? 'text-white/90' : 'text-slate-800'} text-lg`}>{estimated_timeline}</p>
        </motion.div>
      )}
    </div>
  )
}

export default LegalTab

