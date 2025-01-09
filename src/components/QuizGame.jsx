import React, { useState } from 'react';
import quizData from '../data/quiz_questions.json';
import OnboardingFlow from './OnboardingFlow';
import TopicTransition from './TopicTransition';
import UserProfileView from './UserProfileView';
import { UserProfile } from './UserProfile';

const QuizGame = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [questionsInCurrentTopic, setQuestionsInCurrentTopic] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState([]);

  const QUESTIONS_PER_TOPIC = 3;

  // Get all available topics
  const topics = Object.entries(quizData.topics).map(([id, topic]) => ({
    id,
    name: topic.name
  }));

  // Helper function to get random indices
  const getRandomIndices = (max, count) => {
    const indices = new Set();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * max));
    }
    return Array.from(indices);
  };

  const handleViewProfile = () => {
    setShowProfile(true);
    setShowTransition(false);
  };

  const handleOnboardingComplete = (userData) => {
    const profile = new UserProfile(userData.name, userData);
    // Select initial topic directly using the profile object
    const initialTopic = profile.selectNextTopic(topics.map(t => t.id));
    setUserProfile(profile);
    
    // Start questions with the selected topic
    const totalQuestions = quizData.topics[initialTopic].questions.length;
    const randomIndices = getRandomIndices(
      totalQuestions,
      Math.min(QUESTIONS_PER_TOPIC, totalQuestions)
    );
    
    setSelectedTopic(initialTopic);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuestionsInCurrentTopic(0);
    setSelectedQuestionIndices(randomIndices);
  };

  const startNewQuestions = (topicId) => {
    const totalQuestions = quizData.topics[topicId].questions.length;
    const randomIndices = getRandomIndices(
      totalQuestions,
      Math.min(QUESTIONS_PER_TOPIC, totalQuestions)
    );
    
    setSelectedTopic(topicId);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuestionsInCurrentTopic(0);
    setSelectedQuestionIndices(randomIndices);
    setShowTransition(false);
    setShowProfile(false);
  };

  const handleContinueTopic = () => {
    startNewQuestions(selectedTopic);
  };

  const handleNextWeakestTopic = () => {
    // Use Thompson sampling to select the next topic
    const nextTopic = userProfile.selectNextTopic(topics.map(t => t.id));
    startNewQuestions(nextTopic);
  };

  const handleAnswer = (optionId) => {
    const questionIndex = selectedQuestionIndices[currentQuestionIndex];
    const currentQuestion = quizData.topics[selectedTopic].questions[questionIndex];
    const isAnswerCorrect = optionId === currentQuestion.correctAnswer;
    
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    
    if (isAnswerCorrect) {
      setScore(score + 1);
    }
    
    // Update the user's topic statistics
    userProfile.updateTopic(selectedTopic, isAnswerCorrect);

    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionId
    });

    setTimeout(() => {
      setShowFeedback(false);
      const newQuestionsCount = questionsInCurrentTopic + 1;
      
      if (newQuestionsCount >= QUESTIONS_PER_TOPIC) {
        setShowTransition(true);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionsInCurrentTopic(newQuestionsCount);
      }
    }, 1500);
  };

  // Show onboarding if user hasn't completed it
  if (!userProfile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show transition screen after completing questions
  if (showTransition) {
    return (
      <TopicTransition
        currentTopic={selectedTopic}
        topics={topics}
        userProfile={userProfile}
        onContinue={handleContinueTopic}
        onNextWeakest={handleNextWeakestTopic}
        onViewProfile={handleViewProfile}
      />
    );
  }

  // Show profile view
  if (showProfile) {
    return (
      <UserProfileView
        userProfile={userProfile}
        topics={topics}
        onBack={() => {
          setShowProfile(false);
          setShowTransition(true);
        }}
      />
    );
  }

  // Quiz Screen
  const questionIndex = selectedQuestionIndices[currentQuestionIndex];
  const currentQuestion = quizData.topics[selectedTopic].questions[questionIndex];
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-500">
            Topic: {topics.find(t => t.id === selectedTopic).name}
          </span>
          <span className="text-sm text-gray-500 ml-4">
            Question {questionsInCurrentTopic + 1} of {QUESTIONS_PER_TOPIC}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          Score: {score}
        </span>
      </div>
      
      <h2 className="text-xl font-bold mb-6">{currentQuestion.text}</h2>
      
      <div className="space-y-4">
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleAnswer(option.id)}
            disabled={showFeedback}
            className={`w-full text-left p-4 rounded border ${
              showFeedback
                ? option.id === currentQuestion.correctAnswer
                  ? 'bg-green-100 border-green-500'
                  : answers[currentQuestionIndex] === option.id
                  ? 'bg-red-100 border-red-500'
                  : 'border-gray-200'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className={`mt-4 p-4 rounded ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect!'}
        </div>
      )}
    </div>
  );
};

export default QuizGame;
