import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function SynthesizedPlan({ plan, theme = 'dark' }) {
  const isDark = theme === 'dark'
  const [expandedSections, setExpandedSections] = useState(new Set(['immediate_steps']))

  if (!plan) return null

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const SectionHeader = ({ title, sectionKey, icon }) => (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => toggleSection(sectionKey)}
      className={`w-full flex items-center justify-between p-5 cursor-pointer ${isDark 
        ? 'bg-purple-500/10 border-white/20 hover:bg-purple-500/15' 
        : 'bg-purple-50/80 border-slate-200/50 hover:bg-purple-100/80'
      } backdrop-blur-md rounded-2xl transition-all border shadow-xl`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      </div>
      <motion.span
        animate={{ rotate: expandedSections.has(sectionKey) ? 180 : 0 }}
        className={isDark ? 'text-white' : 'text-slate-700'}
        style={{ fontSize: '1.5rem' }}
      >
        ▼
      </motion.span>
    </motion.button>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-6"
    >
      <h2 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mb-8 flex items-center gap-3`}>
        <span className="text-4xl">🧩</span>
        AI Business Plan Summary
      </h2>

      {plan.action_plan && (
        <div className={`${isDark 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/80 border-slate-200/50'
        } backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden`}>
          <SectionHeader title="Action Plan" sectionKey="action_plan" icon="📋" />
          <AnimatePresence>
            {expandedSections.has('action_plan') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 space-y-6">
                  {plan.action_plan.immediate_steps && (
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} text-lg mb-4 flex items-center gap-2`}>
                        <span className="text-2xl">⚡</span>
                        Immediate Steps
                      </h4>
                      <ul className="space-y-3">
                        {plan.action_plan.immediate_steps.map((step, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex items-start gap-3 ${isDark 
                              ? 'bg-white/5 border-white/10' 
                              : 'bg-white/40 border-slate-200/30'
                            } rounded-xl p-4 border`}
                          >
                            <span className={`${isDark ? 'text-purple-400' : 'text-purple-500'} mt-1 text-xl font-bold`}>→</span>
                            <span className={isDark ? 'text-white/90' : 'text-slate-800'}>{step}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.action_plan.short_term_goals && (
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} text-lg mb-4 flex items-center gap-2`}>
                        <span className="text-2xl">🎯</span>
                        Short-term Goals
                      </h4>
                      <ul className="space-y-3">
                        {plan.action_plan.short_term_goals.map((goal, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex items-start gap-3 ${isDark 
                              ? 'bg-white/5 border-white/10' 
                              : 'bg-white/40 border-slate-200/30'
                            } rounded-xl p-4 border`}
                          >
                            <span className={`${isDark ? 'text-fuchsia-400' : 'text-fuchsia-500'} mt-1 text-xl font-bold`}>•</span>
                            <span className={isDark ? 'text-white/90' : 'text-slate-800'}>{goal}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.action_plan.long_term_considerations && (
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} text-lg mb-4 flex items-center gap-2`}>
                        <span className="text-2xl">🔮</span>
                        Long-term Considerations
                      </h4>
                      <ul className="space-y-3">
                        {plan.action_plan.long_term_considerations.map((consideration, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex items-start gap-3 ${isDark 
                              ? 'bg-white/5 border-white/10' 
                              : 'bg-white/40 border-slate-200/30'
                            } rounded-xl p-4 border`}
                          >
                            <span className={isDark ? 'text-white/50' : 'text-slate-500'} style={{ fontSize: '1.25rem' }}>○</span>
                            <span className={isDark ? 'text-white/80' : 'text-slate-700'}>{consideration}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {plan.risk_assessment && (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <SectionHeader title="Risk Assessment" sectionKey="risk_assessment" icon="⚠️" />
          <AnimatePresence>
            {expandedSections.has('risk_assessment') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 space-y-6">
                  {plan.risk_assessment.legal_risks && (
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} text-lg mb-4 flex items-center gap-2`}>
                        <span className="text-2xl">⚖️</span>
                        Legal Risks
                      </h4>
                      <ul className="space-y-3">
                        {plan.risk_assessment.legal_risks.map((risk, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`${isDark 
                              ? 'text-white/90 bg-slate-700/30 border-slate-600/40' 
                              : 'text-slate-800 bg-slate-100/60 border-slate-300/50'
                            } rounded-lg p-3 border`}
                          >
                            • {risk}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.risk_assessment.financial_risks && (
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} text-lg mb-4 flex items-center gap-2`}>
                        <span className="text-2xl">💸</span>
                        Financial Risks
                      </h4>
                      <ul className="space-y-3">
                        {plan.risk_assessment.financial_risks.map((risk, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`${isDark 
                              ? 'text-white/90 bg-slate-700/30 border-slate-600/40' 
                              : 'text-slate-800 bg-slate-100/60 border-slate-300/50'
                            } rounded-lg p-3 border`}
                          >
                            • {risk}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.risk_assessment.mitigation_strategies && (
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'} text-lg mb-4 flex items-center gap-2`}>
                        <span className="text-2xl">🛡️</span>
                        Mitigation Strategies
                      </h4>
                      <ul className="space-y-3">
                        {plan.risk_assessment.mitigation_strategies.map((strategy, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`${isDark 
                              ? 'text-white/90 bg-purple-500/10 border-purple-400/30' 
                              : 'text-slate-800 bg-purple-50/60 border-purple-300/50'
                            } rounded-lg p-3 border`}
                          >
                            ✓ {strategy}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {plan.recommendations && plan.recommendations.length > 0 && (
        <div className={`${isDark 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/80 border-slate-200/50'
        } backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden`}>
          <SectionHeader title="Recommendations" sectionKey="recommendations" icon="💡" />
          <AnimatePresence>
            {expandedSections.has('recommendations') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8">
                  <ul className="space-y-4">
                    {plan.recommendations.map((rec, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-start gap-4 p-4 ${isDark 
                          ? 'bg-white/5 border-white/20' 
                          : 'bg-white/40 border-slate-200/30'
                        } backdrop-blur-sm rounded-xl border`}
                      >
                        <span className={`${isDark ? 'text-purple-400' : 'text-purple-500'} font-extrabold text-xl`}>{idx + 1}.</span>
                        <span className={`${isDark ? 'text-white/90' : 'text-slate-800'} text-lg`}>{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {plan.next_steps && plan.next_steps.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDark 
            ? 'bg-purple-500/10 border-purple-400/20' 
            : 'bg-purple-50/80 border-purple-200/40'
          } backdrop-blur-xl rounded-3xl shadow-2xl p-8 border`}
        >
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-6 flex items-center gap-2`}>
            <span className="text-3xl">🚀</span>
            Next Steps
          </h3>
          <div className="space-y-3">
            {plan.next_steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-4 p-4 ${isDark 
                  ? 'bg-white/10 border-white/20 hover:border-purple-500/50' 
                  : 'bg-white/60 border-slate-200/50 hover:border-purple-400/50'
                } backdrop-blur-sm rounded-xl border transition-all`}
              >
                <span className={`${isDark ? 'text-purple-400' : 'text-purple-500'} font-extrabold text-xl mt-1`}>{idx + 1}.</span>
                <span className={`${isDark ? 'text-white/90' : 'text-slate-800'} text-lg`}>{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default SynthesizedPlan

