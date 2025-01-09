import React, { useState } from 'react';

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    favoriteTopic: '',
    experienceLevel: '',
    studyHabit: '',
    goalScore: '',
    learningStyle: ''
  });

  const questions = [
    {
      id: 'name',
      question: "What's your name?",
      type: 'text',
      placeholder: 'Enter your name'
    },
    {
      id: 'favoriteTopic',
      question: 'Which subject interests you the most?',
      type: 'select',
      options: ['Science', 'History', 'Literature', 'Technology', 'Arts']
    },
    {
      id: 'experienceLevel',
      question: 'How would you rate your quiz experience?',
      type: 'select',
      options: ['Beginner', 'Intermediate', 'Advanced', 'Quiz Master']
    },
    {
      id: 'studyHabit',
      question: 'How do you prefer to learn?',
      type: 'select',
      options: ['Quick and intense', 'Slow and steady', 'Mix of both', 'Depends on the topic']
    },
    {
      id: 'goalScore',
      question: 'What score are you aiming for in this quiz?',
      type: 'select',
      options: ['Just passing', '70-80%', '80-90%', '90-100%']
    },
    {
      id: 'learningStyle',
      question: 'How do you best remember information?',
      type: 'select',
      options: ['Visual aids', 'Reading text', 'Practice questions', 'Teaching others']
    }
  ];

  const handleInputChange = (value) => {
    setUserData({
      ...userData,
      [questions[step].id]: value
    });
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(userData);
    }
  };

  const currentQuestion = questions[step];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      {step === 0 && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to the Quiz Game!</h1>
          <p className="text-gray-600">Let's get to know you better before we start.</p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Question {step + 1} of {questions.length}</span>
          <span>{Math.round((step / (questions.length - 1)) * 100)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / (questions.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
        
        {currentQuestion.type === 'text' ? (
          <input
            type="text"
            value={userData[currentQuestion.id]}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleInputChange(option)}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  userData[currentQuestion.id] === option
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!userData[currentQuestion.id]}
        className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
          userData[currentQuestion.id]
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {step === questions.length - 1 ? 'Start Quiz' : 'Next'}
      </button>
    </div>
  );
};

export default OnboardingFlow;
