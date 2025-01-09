import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const BetaDistributionChart = ({ alpha, beta }) => {
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
        <Area type="monotone" dataKey="y" stroke="#8884d8" fill="#8884d8" />
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
        <p className="text-gray-600 mt-2">
          Learning Style: {userProfile.preferences.learningStyle}
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
        <div className="grid grid-cols-3 gap-4">
          {topics.map(topic => {
            const stats = userProfile.getTopicStats(topic.id);
            const totalQuestions = stats.totalAttempts;
            const successRate = stats.getSuccessRate();

            return (
              <div 
                key={topic.id} 
                className="bg-gray-50 p-4 rounded-lg"
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
        {topics.map(topic => {
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
