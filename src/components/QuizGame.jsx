import React, { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import katex from 'katex';

import quizData from '../data/quiz_questions.json';
import OnboardingFlow from './OnboardingFlow';
import TopicTransition from './TopicTransition';
import UserProfileView from './UserProfileView';
import { UserProfile } from './UserProfile';

// Create audio elements once
const successSound = new Audio('/correct.mp3');
const errorSound = new Audio('/incorrect.mp3');

// Set volume to 50%
successSound.volume = 0.5;
errorSound.volume = 0.5;

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
  const [isInSamplerRound, setIsInSamplerRound] = useState(true);
  const [visitedTopics, setVisitedTopics] = useState(new Set());

  const QUESTIONS_PER_TOPIC = 3;

  const topics = Object.entries(quizData.topics).map(([id, topic]) => ({
    id,
    name: topic.name
  }));

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
    setUserProfile(profile);
    
    const isTestAccount = userData.name.toLowerCase() === 'testaccount';
    
    if (isTestAccount) {
      setIsInSamplerRound(false);
      const initialTopic = profile.selectNextTopic(topics.map(t => t.id));
      setSelectedTopic(initialTopic);
      
      const totalQuestions = quizData.topics[initialTopic].questions.length;
      const randomIndices = getRandomIndices(totalQuestions, Math.min(QUESTIONS_PER_TOPIC, totalQuestions));
      setSelectedQuestionIndices(randomIndices);
    } else {
      const initialTopic = topics[0].id;
      setIsInSamplerRound(true);
      setVisitedTopics(new Set([initialTopic]));
      setSelectedTopic(initialTopic);
      
      const totalQuestions = quizData.topics[initialTopic].questions.length;
      const randomIndex = Math.floor(Math.random() * totalQuestions);
      setSelectedQuestionIndices([randomIndex]);
    }
    
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuestionsInCurrentTopic(0);
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
    setIsInSamplerRound(false);
    startNewQuestions(selectedTopic);
  };

  const handleNextWeakestTopic = () => {
    setIsInSamplerRound(false);
    const nextTopic = userProfile.selectNextTopic(topics.map(t => t.id));
    startNewQuestions(nextTopic);
  };

  const handleAnswer = (optionId) => {
    const currentIdx = selectedQuestionIndices[currentQuestionIndex];
    const questionData = quizData.topics[selectedTopic].questions[currentIdx];
    const isAnswerCorrect = optionId === questionData.correctAnswer;
    
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    
    // Play the appropriate sound
    if (isAnswerCorrect) {
      successSound.play().catch(e => console.log('Sound play failed:', e));
      setScore(score + 1);
    } else {
      errorSound.play().catch(e => console.log('Sound play failed:', e));
    }
    
    userProfile.updateTopic(selectedTopic, isAnswerCorrect);

    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionId
    });

    setTimeout(() => {
      setShowFeedback(false);

      if (isInSamplerRound) {
        const nextUnvisitedTopic = topics.find(t => !visitedTopics.has(t.id))?.id;
        
        if (nextUnvisitedTopic) {
          const newVisitedTopics = new Set(visitedTopics);
          newVisitedTopics.add(nextUnvisitedTopic);
          setVisitedTopics(newVisitedTopics);
          
          const randomIndex = Math.floor(Math.random() * quizData.topics[nextUnvisitedTopic].questions.length);
          setSelectedTopic(nextUnvisitedTopic);
          setCurrentQuestionIndex(0);
          setQuestionsInCurrentTopic(0);
          setSelectedQuestionIndices([randomIndex]);
        } else {
          setIsInSamplerRound(false);
          setShowTransition(true);
        }
      } else {
        const newQuestionsCount = questionsInCurrentTopic + 1;
        if (newQuestionsCount >= QUESTIONS_PER_TOPIC) {
          setShowTransition(true);
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setQuestionsInCurrentTopic(newQuestionsCount);
        }
      }
    }, 1500);
  };

  const renderMathText = (text) => {
    if (!text.includes('$')) {
      return text;
    }
    
    const parts = text.split(/(\$[^$]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathExp = part.slice(1, -1).trim();
        const html = katex.renderToString(mathExp, {
          output: 'mathml',
          throwOnError: false,
          strict: false,
          trust: true
        });
        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return part ? <span key={index}>{part}</span> : null;
    });
  };

  if (!userProfile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (showTransition) {
    return (
      <TopicTransition
        currentTopic={selectedTopic}
        topics={topics}
        userProfile={userProfile}
        onContinue={handleContinueTopic}
        onNextWeakest={handleNextWeakestTopic}
        onViewProfile={handleViewProfile}
        startNewQuestions={startNewQuestions}
      />
    );
  }

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
            {isInSamplerRound 
              ? `Topic ${visitedTopics.size} of ${topics.length}`
              : `Question ${questionsInCurrentTopic + 1} of ${QUESTIONS_PER_TOPIC}`
            }
          </span>
        </div>
        <span className="text-sm text-gray-500">
          Score: {score}
        </span>
      </div>
      
      <h2 className="text-xl font-bold mb-6">
        {renderMathText(currentQuestion.text)}
      </h2>      

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
            {renderMathText(option.text)}
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
