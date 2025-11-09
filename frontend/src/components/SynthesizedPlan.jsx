import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function SynthesizedPlan({ plan }) {
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
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <motion.span
        animate={{ rotate: expandedSections.has(sectionKey) ? 180 : 0 }}
        className="text-gray-600"
      >
        ▼
      </motion.span>
    </button>
  )

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Business Plan Summary</h2>

      {plan.executive_summary && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-xl font-semibold mb-3">Executive Summary</h3>
          <p className="leading-relaxed">{plan.executive_summary}</p>
        </div>
      )}

      {plan.action_plan && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <SectionHeader title="Action Plan" sectionKey="action_plan" icon="📋" />
          <AnimatePresence>
            {expandedSections.has('action_plan') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {plan.action_plan.immediate_steps && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Immediate Steps</h4>
                      <ul className="space-y-2">
                        {plan.action_plan.immediate_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-indigo-600 mt-1">→</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.action_plan.short_term_goals && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Short-term Goals</h4>
                      <ul className="space-y-2">
                        {plan.action_plan.short_term_goals.map((goal, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.action_plan.long_term_considerations && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Long-term Considerations</h4>
                      <ul className="space-y-2">
                        {plan.action_plan.long_term_considerations.map((consideration, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-gray-500 mt-1">○</span>
                            <span>{consideration}</span>
                          </li>
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <SectionHeader title="Risk Assessment" sectionKey="risk_assessment" icon="⚠️" />
          <AnimatePresence>
            {expandedSections.has('risk_assessment') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {plan.risk_assessment.legal_risks && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Legal Risks</h4>
                      <ul className="space-y-2">
                        {plan.risk_assessment.legal_risks.map((risk, idx) => (
                          <li key={idx} className="text-gray-700">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.risk_assessment.financial_risks && (
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">Financial Risks</h4>
                      <ul className="space-y-2">
                        {plan.risk_assessment.financial_risks.map((risk, idx) => (
                          <li key={idx} className="text-gray-700">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.risk_assessment.mitigation_strategies && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Mitigation Strategies</h4>
                      <ul className="space-y-2">
                        {plan.risk_assessment.mitigation_strategies.map((strategy, idx) => (
                          <li key={idx} className="text-gray-700">✓ {strategy}</li>
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <SectionHeader title="Recommendations" sectionKey="recommendations" icon="💡" />
          <AnimatePresence>
            {expandedSections.has('recommendations') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6">
                  <ul className="space-y-3">
                    {plan.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                        <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {plan.next_steps && plan.next_steps.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🚀</span> Next Steps
          </h3>
          <div className="space-y-2">
            {plan.next_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <span className="text-green-600 font-bold mt-1">{idx + 1}.</span>
                <span className="text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SynthesizedPlan

