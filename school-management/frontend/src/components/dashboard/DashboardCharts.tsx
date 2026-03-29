import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardChartsProps {
  enrollmentData?: any[];
  gradeDistribution?: any[];
  attendanceData?: any[];
  averageAttendance?: number;
  currentAttendance?: number;
}

const DashboardCharts = ({ 
  enrollmentData = [], 
  gradeDistribution = [], 
  attendanceData = [],
  averageAttendance = 0,
  currentAttendance = 0
}: DashboardChartsProps) => {
  const [chartType, setChartType] = useState('bar');

  // If no data provided, show empty state
  const hasEnrollmentData = enrollmentData && enrollmentData.length > 0;
  const hasGradeData = gradeDistribution && gradeDistribution.length > 0;
  const hasAttendanceData = attendanceData && attendanceData.length > 0;

  return (
    <div className="space-y-6">
      {/* Enrollment Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Enrollment Trends</h3>
            <p className="text-sm text-gray-500">Monthly student enrollment</p>
          </div>
          {hasEnrollmentData && (
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={'px-3 py-1.5 text-sm rounded-lg ' + (chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={'px-3 py-1.5 text-sm rounded-lg ' + (chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                Line
              </button>
            </div>
          )}
        </div>

        <div className="h-80">
          {hasEnrollmentData ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#3b82f6" name="Students" />
                </BarChart>
              ) : (
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Students"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-400">No enrollment data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          <div className="h-64">
            {hasGradeData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={'cell-' + index} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-400">No grade data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Rate</h3>
          <div className="h-64">
            {hasAttendanceData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[85, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Attendance %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-400">No attendance data available</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-center flex-1">
              <span className="text-sm text-gray-500">Average</span>
              <p className="text-2xl font-bold text-emerald-600">{averageAttendance}%</p>
            </div>
            <div className="text-center flex-1">
              <span className="text-sm text-gray-500">This Month</span>
              <p className="text-2xl font-bold text-blue-600">{currentAttendance}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
