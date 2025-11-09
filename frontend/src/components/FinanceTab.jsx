import { motion } from 'framer-motion'

function FundingCard({ source, index }) {
  const typeColors = {
    grant: "bg-green-100 text-green-800 border-green-300",
    loan: "bg-blue-100 text-blue-800 border-blue-300",
    mentorship: "bg-purple-100 text-purple-800 border-purple-300",
    investor: "bg-orange-100 text-orange-800 border-orange-300"
  }

  const typeColor = typeColors[source.type?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-300"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-800">{source.name}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${typeColor}`}>
          {source.type || "Other"}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{source.description}</p>
      {source.link && (
        <a
          href={source.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Learn More →
        </a>
      )}
    </motion.div>
  )
}

function CostItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-semibold text-gray-800">{item.category}</h5>
        <span className="text-lg font-bold text-indigo-600">
          ${item.amount?.toLocaleString() || "0"}
        </span>
      </div>
      {item.description && (
        <p className="text-sm text-gray-600">{item.description}</p>
      )}
    </motion.div>
  )
}

function FinanceTab({ financialData }) {
  if (!financialData || !financialData.formatted) {
    return (
      <div className="text-center py-12 text-gray-500">
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
    <div className="space-y-6">
      {summary && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}

      {cost_breakdown && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {cost_breakdown.startup_costs !== undefined && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Startup Costs</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${cost_breakdown.startup_costs?.toLocaleString() || "0"}
                </p>
              </div>
            )}
            {cost_breakdown.monthly_operating_costs !== undefined && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Monthly Operating Costs</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${cost_breakdown.monthly_operating_costs?.toLocaleString() || "0"}
                </p>
              </div>
            )}
          </div>
          {cost_breakdown.breakdown && cost_breakdown.breakdown.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 mb-3">Detailed Breakdown</h4>
              {cost_breakdown.breakdown.map((item, index) => (
                <CostItem key={index} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      )}

      {funding_sources.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Funding Sources</h3>
          {Object.entries(fundingByType).map(([type, sources]) => (
            <div key={type} className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-3 capitalize">{type}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((source, index) => (
                  <FundingCard key={index} source={source} index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>💡</span> AI Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white/60 rounded-lg p-3 border border-amber-200">
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FinanceTab

