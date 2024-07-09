import { CompareResult } from '../types/types'

export const CompareView: React.FC<{ result: CompareResult }> = ({ result }) => {
  return (
    <div>
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 bg-gray-600 rounded-full mr-2"></div>
        <span className="text-sm text-gray-400">Overview</span>
      </div>
      <ul className="list-disc pl-6 mb-4">
        {result.overview.map((item, index) => (
          <li key={index} className="text-sm">
            {item}
          </li>
        ))}
      </ul>
      <div className="mb-2">
        <span className="text-sm font-semibold">Grok mentioned:</span>
      </div>
      <ul className="list-disc pl-6 mb-4">
        {result.grok.map((item, index) => (
          <li key={index} className="text-sm">
            {item}
          </li>
        ))}
      </ul>
      <div className="mb-2">
        <span className="text-sm font-semibold">Claude mentioned:</span>
      </div>
      <ul className="list-disc pl-6">
        {result.claude.map((item, index) => (
          <li key={index} className="text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
