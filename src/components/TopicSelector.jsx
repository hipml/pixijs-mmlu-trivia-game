import React, { useState, useRef } from 'react';

const TopicSelector = ({ onTopicSelected, topics, recommendedTopic, onViewProfile }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [leverAngle, setLeverAngle] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  
  const animationRef = useRef({
    startTime: 0,
    duration: 2000,
    currentIndex: 0,
    timeoutId: null,
    animating: false
  });

  const finishAnimation = () => {
    if (animationRef.current.timeoutId) {
      clearTimeout(animationRef.current.timeoutId);
      animationRef.current.timeoutId = null;
    }

    animationRef.current.animating = false;
    setSelectedTopic(recommendedTopic);
    setLeverAngle(0);
    setBlurAmount(0);
    setIsAnimating(false);
    onTopicSelected(recommendedTopic);
  };

  const handlePullLever = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setLeverAngle(45);
    setBlurAmount(4);
    
    animationRef.current.startTime = Date.now();
    animationRef.current.currentIndex = 0;
    animationRef.current.animating = true;

    const maxTimeout = setTimeout(() => {
      finishAnimation();
    }, 5000);
    animationRef.current.timeoutId = maxTimeout;
    
    const animate = () => {
      if (!animationRef.current.animating) return;
      
      const elapsed = Date.now() - animationRef.current.startTime;
      const { duration } = animationRef.current;
      const progress = elapsed / duration;
      
      setBlurAmount(Math.max(0, 4 * (1 - progress)));
      const speed = Math.max(50, Math.min(200, progress * 500));

      if (progress > 0.7) {
        const leverProgress = (progress - 0.7) / 0.3;
        setLeverAngle(45 * (1 - leverProgress));
      }
      
      if (elapsed < duration) {
        animationRef.current.currentIndex = 
          (animationRef.current.currentIndex + 1) % topics.length;
        setSelectedTopic(topics[animationRef.current.currentIndex].id);
        setTimeout(animate, speed);
      } else {
        finishAnimation();
      }
    };
    
    animate();
  };

  return (
    <div className="relative max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="bg-gray-800 rounded-lg p-8 relative">
        <div className="bg-white rounded-lg p-6 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-gray-200"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-gray-200"></div>
          
          <h3 className="text-2xl font-bold transition-all duration-150"
              style={{
                filter: `blur(${blurAmount}px)`
              }}>
            {selectedTopic 
              ? topics.find(t => t.id === selectedTopic).name
              : "Pull the lever!"}
          </h3>
        </div>

        <div
          onClick={handlePullLever}
          className="w-8 h-32 bg-red-500 rounded-t-full mx-auto cursor-pointer relative hover:bg-red-600 transition-colors duration-200"
          style={{ 
            transform: `rotateZ(${leverAngle}deg)`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-600 rounded-full">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-400 rounded-full"></div>
          </div>
        </div>

        <div className="absolute top-4 left-4 w-4 h-4 rounded-full animate-pulse" 
             style={{
               background: 'radial-gradient(circle, #FCD34D 0%, #F59E0B 100%)',
               boxShadow: '0 0 10px #FCD34D'
             }}
        />
        <div className="absolute top-4 right-4 w-4 h-4 rounded-full animate-pulse delay-500"
             style={{
               background: 'radial-gradient(circle, #FCD34D 0%, #F59E0B 100%)',
               boxShadow: '0 0 10px #FCD34D'
             }}
        />
      </div>

      <p className="text-center mt-4 text-gray-600">
        {isAnimating 
          ? "Selecting topic..." 
          : "Pull the lever to get your next topic!"}
      </p>

      <button
        onClick={onViewProfile}
        className="mt-6 w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
      >
        See User Profile
      </button>
    </div>
  );
};

export default TopicSelector;
