import React from 'react';

const TopicTransition = ({ 
  currentTopic, 
  topics, 
  userProfile, 
  onContinue, 
  onNextWeakest,
  onViewProfile 
}) => {
  // Calculate Thompson sampling scores for debugging
  const topicScores = topics.map(topic => {
    const { alpha, beta } = userProfile.getTopicStats(topic.id);
    // Sample from beta distribution
    const score = Math.random() * (alpha / (alpha + beta));
    return {
      id: topic.id,
      name: topic.name,
      score,
      alpha,
      beta
    };
  }).sort((a, b) => a.score - b.score); // Sort by score ascending (weakest first)

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Round Complete!</h2>
          <p className="text-gray-600">
            Current Topic: {topics.find(t => t.id === currentTopic).name}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={onContinue}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Continue Current Topic
          </button>
          
          <button
            onClick={onNextWeakest}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Try Next Topic
          </button>
          
          <button
            onClick={onViewProfile}
            className="w-full py-3 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            View Profile
          </button>
        </div>

        {/* Debug information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Topic Rankings (Debug):</h3>
          <div className="space-y-1">
            {topicScores.map((topic, index) => (
              <div key={topic.id} className="flex justify-between">
                <span>{index + 1}. {topic.name}</span>
                <span className="text-gray-600">
                  Score: {topic.score.toFixed(3)} (α={topic.alpha}, β={topic.beta})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicTransition;
