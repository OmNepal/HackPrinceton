function ResponseHeader({ receivedIdea, budget, location, executiveSummary }) {
  const budgetLabels = {
    "under-10k": "Under $10,000",
    "10k-50k": "$10,000 - $50,000",
    "50k-100k": "$50,000 - $100,000",
    "100k-500k": "$100,000 - $500,000",
    "500k-plus": "$500,000+"
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-4">{receivedIdea || "Business Idea"}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {budget && (
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              💰 {budgetLabels[budget] || budget}
            </span>
          )}
          {location && (
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              📍 {location}
            </span>
          )}
        </div>
      </div>

      {executiveSummary && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Executive Summary</h3>
          <p className="text-gray-600 leading-relaxed">{executiveSummary}</p>
        </div>
      )}
    </div>
  )
}

export default ResponseHeader

