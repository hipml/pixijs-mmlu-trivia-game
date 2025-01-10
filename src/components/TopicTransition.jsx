import React, { useState } from 'react';

const TopicTransition = ({ 
  currentTopic, 
  topics, 
  userProfile, 
  onContinue,
  onViewProfile,
  startNewQuestions
}) => {
  // Calculate initial recommendations only once when component mounts
  const [recommendedTopics] = useState(() => {
    const availableTopics = topics.map(t => t.id).filter(id => id !== currentTopic);
    const next1 = userProfile.selectNextTopic(availableTopics);
    const next2 = userProfile.selectNextTopic(availableTopics.filter(id => id !== next1));
    return [next1, next2];
  });

  // Calculate success rates for each topic
  const topicStats = topics.map(topic => {
    const stats = userProfile.getTopicStats(topic.id);
    return {
      id: topic.id,
      name: topic.name,
      successRate: stats.getSuccessRate() * 100,
      attempts: stats.totalAttempts,
      correct: stats.correctAnswers
    };
  });

  const handleTopicSelect = (topicId) => {
    if (topicId === currentTopic) {
      onContinue();
    } else {
      startNewQuestions(topicId);
    }
  };

  // Reusable topic card component
  const TopicCard = ({ topic, isRecommended = false }) => {
    const isCurrentTopic = topic.id === currentTopic;
    
    return (
      <button
        onClick={() => handleTopicSelect(topic.id)}
        className={`p-4 rounded-lg border transition-all duration-200 text-left ${
          isCurrentTopic 
            ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
            : isRecommended
              ? 'border-green-500 bg-green-50 hover:bg-green-100'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <h3 className="font-semibold mb-2">{topic.name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Success Rate:</span>
            <span className={`font-medium ${
              topic.successRate >= 80 ? 'text-green-600' :
              topic.successRate >= 60 ? 'text-blue-600' :
              topic.successRate >= 40 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {topic.successRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Questions:</span>
            <span>{topic.correct}/{topic.attempts}</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Choose Your Next Topic</h2>
          <button
            onClick={onViewProfile}
            className="py-2 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            View Full Profile
          </button>
        </div>

        {/* Recommended Topics Row */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Recommended Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TopicCard 
              topic={topicStats.find(t => t.id === currentTopic)} 
              isRecommended={true}
            />
            {recommendedTopics.map(topicId => (
              <TopicCard
                key={topicId}
                topic={topicStats.find(t => t.id === topicId)}
                isRecommended={true}
              />
            ))}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* All Topics Grid */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">All Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicStats.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicTransition;
