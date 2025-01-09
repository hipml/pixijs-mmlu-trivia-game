import React, { useState } from 'react';

const OnboardingFlow = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleStart = () => {
    if (!name.trim()) return;
    
    onComplete({
      name: name,
      // Include minimal required fields for UserProfile
      experienceLevel: 'Beginner',
      mode: 'sampler',  // Custom mode flag
      isFirstRound: true  // Flag to indicate we're in the initial sampler round
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Quiz Game!</h1>
        <p className="text-gray-600">
          Get ready for a quick tour through all our topics!
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">What's your name?</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleStart}
        disabled={!name.trim()}
        className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
          name.trim()
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Start Quiz
      </button>
    </div>
  );
};

export default OnboardingFlow;
