import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import '../styles/platformbreakdown.css';

const COLORS = {
  leetcode: '#ffa116',
  codeforces: '#1f8acb'
};

function PlatformBreakdown({ data }) {
  const { combinedMetrics, profiles } = data;

  const platformData = [
    { name: 'LeetCode', value: combinedMetrics.totalSolvedLeetCode, color: COLORS.leetcode },
    { name: 'Codeforces', value: combinedMetrics.totalSolvedCodeforces, color: COLORS.codeforces }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / combinedMetrics.combinedTotal) * 100).toFixed(1);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value} problems</p>
          <p className="tooltip-percentage">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card platform-breakdown-card" style={{ backgroundColor: 'rgba(165, 148, 148, 0.03)', padding: '2rem' }}>
      <h3>🌐 Platform Distribution</h3>
      
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={platformData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {platformData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="platform-stats">
        <div className="platform-stat leetcode-stat">
          <div className="platform-icon">💻</div>
          <div className="platform-info">
            <h4>LeetCode</h4>
            <p className="platform-count">{combinedMetrics.totalSolvedLeetCode}</p>
            <p className="platform-percentage">
              {((combinedMetrics.totalSolvedLeetCode / combinedMetrics.combinedTotal) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="platform-stat codeforces-stat">
          <div className="platform-icon">🏆</div>
          <div className="platform-info">
            <h4>Codeforces</h4>
            <p className="platform-count">{combinedMetrics.totalSolvedCodeforces}</p>
            <p className="platform-percentage">
              {((combinedMetrics.totalSolvedCodeforces / combinedMetrics.combinedTotal) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlatformBreakdown;
