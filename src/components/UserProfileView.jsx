import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// Colors for different topics
const TOPIC_COLORS = [
  '#4C72B0',  // Blue
  '#55A868',  // Green
  '#C44E52',  // Red
  '#8172B3',  // Purple
  '#CCB974',  // Sand
  '#64B5CD',  // Sky blue
  '#4C9385',  // Teal
  '#BA6338',  // Rust
  '#B47CC7',  // Lilac
  '#C98D4F',  // Brown
  '#DD8452',  // Orange
  '#937860',  // Taupe
  '#DA6D99',  // Pink
  '#71A9C9',  // Light blue
  '#6B8E23',  // Olive
  '#8B4513',  // Saddle brown
  '#4682B4',  // Steel blue
  '#DB7093',  // Pale violet red
  '#CD853F',  // Peru
  '#8FBC8F',  // Dark sea green
  '#BC8F8F',  // Rosy brown
  '#DA70D6',  // Orchid
  '#B8860B',  // Dark goldenrod
  '#CD5C5C',  // Indian red
];

const BetaDistributionChart = ({ alpha, beta, color = '#8884d8' }) => {
  // Generate points for the beta distribution
  const points = [];
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    // Beta distribution PDF
    const y = (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) / 
              (Math.pow(x * (1 - x), 0) || 1); // Avoid division by zero
    points.push({ x, y });
  }

  // Normalize the y values
  const maxY = Math.max(...points.map(p => p.y));
  points.forEach(p => p.y = p.y / maxY);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={points}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          domain={[0, 1]}
          tickFormatter={(value) => (value * 100).toFixed(0) + '%'} 
        />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [(value * 100).toFixed(1) + '%', 'Probability']}
          labelFormatter={(value) => 'Success Rate: ' + (value * 100).toFixed(0) + '%'}
        />
        <Area type="monotone" dataKey="y" stroke={color} fill={color} fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const TopicComparisonChart = ({ topics, userProfile }) => {
  // Generate points for all distributions
  const generatePoints = (alpha, beta) => {
    const points = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const y = (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) / 
                (Math.pow(x * (1 - x), 0) || 1);
      points.push({ x, y });
    }
    return points;
  };

  // Get all distributions
  const allPoints = topics.map((topic, index) => {
    const stats = userProfile.getTopicStats(topic.id);
    const points = generatePoints(stats.alpha, stats.beta);
    
    // Normalize the points
    const maxY = Math.max(...points.map(p => p.y));
    return points.map(p => ({ 
      x: p.x, 
      [topic.id]: p.y / maxY 
    }));
  });

  // Merge all points into single dataset
  const mergedData = allPoints[0].map((point, i) => {
    const merged = { x: point.x };
    topics.forEach((topic, index) => {
      merged[topic.id] = allPoints[index][i][topic.id];
    });
    return merged;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={mergedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          domain={[0, 1]}
          tickFormatter={(value) => (value * 100).toFixed(0) + '%'} 
        />
        <YAxis />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-3 border rounded shadow-lg">
                  <p className="text-sm font-semibold mb-1">
                    Success Rate: {(label * 100).toFixed(0)}%
                  </p>
                  {payload.map((entry, index) => {
                    const topicName = topics.find(t => t.id === entry.dataKey)?.name || entry.dataKey;
                    if (entry.value > 0.01) { // Only show non-zero probabilities
                      return (
                        <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                          {topicName}: {(entry.value * 100).toFixed(1)}%
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend 
          formatter={(value) => topics.find(t => t.id === value)?.name || value}
        />
        {topics.map((topic, index) => (
          <Area
            key={topic.id}
            type="monotone"
            dataKey={topic.id}
            stroke={TOPIC_COLORS[index % TOPIC_COLORS.length]}
            fill={TOPIC_COLORS[index % TOPIC_COLORS.length]}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

const UserProfileView = ({ userProfile, topics, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Profile: {userProfile.name}</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Back to Game
          </button>
        </div>
        {/* Calculate and display strongest/weakest topics */}
        <p className="text-gray-600 mt-2">
          {(() => {
            const topicStats = topics.map(topic => ({
              ...topic,
              stats: userProfile.getTopicStats(topic.id),
              successRate: userProfile.getTopicStats(topic.id).getSuccessRate()
            })).filter(topic => topic.stats.totalAttempts > 0);

            if (topicStats.length === 0) return 'No topics attempted yet';

            const strongest = topicStats.reduce((prev, current) => 
              (current.successRate > prev.successRate) ? current : prev
            );

            const weakest = topicStats.reduce((prev, current) => 
              (current.successRate < prev.successRate) ? current : prev
            );

            return (
              <>
                Strongest topic: <span className="font-medium">{strongest.name}</span> | 
                Weakest topic: <span className="font-medium">{weakest.name}</span>
              </>
            );
          })()}
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
        
        {/* Topic Comparison Chart */}
        <div className="mb-6 bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Topic Performance Comparison</h3>
          <p className="text-sm text-gray-600 mb-4">
            This chart shows your estimated performance across all topics, allowing you
            to compare your strengths and areas for improvement.
          </p>
          <TopicComparisonChart topics={topics} userProfile={userProfile} />
        </div>

        {/* Topic Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          {topics.map((topic, index) => {
            const stats = userProfile.getTopicStats(topic.id);
            const totalQuestions = stats.totalAttempts;
            const successRate = stats.getSuccessRate();

            return (
              <div 
                key={topic.id} 
                className="bg-gray-50 p-4 rounded-lg border-l-4"
                style={{ borderLeftColor: TOPIC_COLORS[index % TOPIC_COLORS.length] }}
              >
                <h3 className="font-semibold mb-2">{topic.name}</h3>
                <div className="text-sm space-y-1">
                  <p>Success Rate: {(successRate * 100).toFixed(1)}%</p>
                  <p>Total Questions: {totalQuestions}</p>
                  <p>Correct: {stats.correctAnswers}</p>
                  <p>Incorrect: {totalQuestions - stats.correctAnswers}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Topic Analysis */}
      <div className="space-y-8">
        {topics.map((topic, index) => {
          const stats = userProfile.getTopicStats(topic.id);
          return (
            <div key={topic.id} className="border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{topic.name} Analysis</h3>
              
              {/* Topic Statistics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {(stats.getSuccessRate() * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-gray-600">α (successes)</p>
                  <p className="text-2xl font-bold">{stats.alpha.toFixed(1)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-gray-600">β (failures)</p>
                  <p className="text-2xl font-bold">{stats.beta.toFixed(1)}</p>
                </div>
              </div>

              {/* Beta Distribution Visualization */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2">Probability Distribution</h4>
                <p className="text-sm text-gray-600 mb-4">
                  This chart shows the beta distribution for this topic, representing
                  our uncertainty about your true success rate.
                </p>
                <BetaDistributionChart 
                  alpha={stats.alpha} 
                  beta={stats.beta}
                  color={TOPIC_COLORS[index % TOPIC_COLORS.length]}
                />
              </div>

              {/* Interpretation */}
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <h4 className="font-semibold mb-2">What does this mean?</h4>
                <p>
                  Based on your performance, we estimate with 95% confidence that
                  your true success rate in {topic.name} is between{' '}
                  {(stats.sampleBeta() * 100 - 10).toFixed(1)}% and{' '}
                  {(stats.sampleBeta() * 100 + 10).toFixed(1)}%.
                </p>
                {stats.totalAttempts < 10 && (
                  <p className="mt-2 text-blue-600">
                    More questions needed for a more accurate assessment.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserProfileView;
