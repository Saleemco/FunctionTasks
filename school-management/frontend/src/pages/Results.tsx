import { StudentResults } from '../components/parent/StudentResults'

export default function Results() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <p className="text-sm text-gray-500">View and manage student results</p>
      </div>
      <StudentResults />
    </div>
  )
}
