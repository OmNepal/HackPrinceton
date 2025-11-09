import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function StepCard({ step, index, isChecked, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
    >
      <div className="p-5 flex items-start gap-4">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h4>
          <p className="text-gray-600 mb-3">{step.description}</p>
          {step.agency && (
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-medium">Agency:</span> {step.agency}
            </p>
          )}
          {step.links && step.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {step.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  Link {idx + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function LegalTab({ legalData }) {
  const [checkedSteps, setCheckedSteps] = useState(new Set())

  if (!legalData || !legalData.formatted) {
    return (
      <div className="text-center py-12 text-gray-500">
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
    <div className="space-y-6">
      {summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Steps to Complete</h3>
            <span className="text-sm text-gray-600">
              {checkedSteps.size} of {steps.length} completed
            </span>
          </div>
          <div className="mb-4 bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full"
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
              />
            ))}
          </div>
        </div>
      )}

      {key_requirements && key_requirements.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Requirements</h3>
          <ul className="space-y-2">
            {key_requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {estimated_timeline && (
        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Estimated Timeline</h3>
          <p className="text-gray-700">{estimated_timeline}</p>
        </div>
      )}
    </div>
  )
}

export default LegalTab

