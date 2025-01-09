// UserProfile.js
export class TopicStats {
  constructor() {
    // Beta distribution parameters for each topic
    // alpha = successes + 1 (adding 1 for prior)
    // beta = failures + 1 (adding 1 for prior)
    this.alpha = 1;
    this.beta = 1;
    this.totalAttempts = 0;
    this.correctAnswers = 0;
  }

  updateStats(isCorrect) {
    this.totalAttempts += 1;
    if (isCorrect) {
      this.alpha += 1;
      this.correctAnswers += 1;
    } else {
      this.beta += 1;
    }
  }

  // Bulk update stats for test account
  bulkUpdate(correct, incorrect) {
    this.totalAttempts = correct + incorrect;
    this.correctAnswers = correct;
    this.alpha = correct + 1;  // +1 for prior
    this.beta = incorrect + 1; // +1 for prior
  }

  // Sample from beta distribution
  // Using approximation method for Beta distribution sampling
  sampleBeta() {
    // Using the ratio of gamma distributions method
    const x = this.sampleGamma(this.alpha);
    const y = this.sampleGamma(this.beta);
    return x / (x + y);
  }

  // Marsaglia and Tsang's method for sampling from Gamma distribution
  sampleGamma(shape) {
    if (shape < 1) {
      return this.sampleGamma(1 + shape) * Math.pow(Math.random(), 1 / shape);
    }
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      const x = this.generateNormal();
      const v = Math.pow(1 + c * x, 3);
      
      if (v > 0) {
        const u = Math.random();
        if (u < 1 - 0.0331 * Math.pow(x, 4) ||
            Math.log(u) < 0.5 * Math.pow(x, 2) + d * (1 - v + Math.log(v))) {
          return d * v;
        }
      }
    }
  }

  // Box-Muller transform for normal distribution
  generateNormal() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  getSuccessRate() {
    return this.totalAttempts === 0 ? 0 : this.correctAnswers / this.totalAttempts;
  }
}

const TEST_ACCOUNT_DATA = {
  'moral_scenarios': { correct: 4, incorrect: 16 },
  'high_school_mathematics': { correct: 8, incorrect: 12 },
  'high_school_world_history': { correct: 12, incorrect: 8 },
  'marketing': { correct: 15, incorrect: 5 },
  'computer_security': { correct: 16, incorrect: 4 },
  'high_school_geography': { correct: 14, incorrect: 6 },
  'college_computer_science': { correct: 10, incorrect: 1 },
  'professional_psychology': { correct: 18, incorrect: 2 },
  'virology': { correct: 13, incorrect: 7 },
  'prehistory': { correct: 11, incorrect: 9 },
  'high_school_psychology': { correct: 17, incorrect: 3 },
  'high_school_chemistry': { correct: 9, incorrect: 11 },
  'logical_fallacies': { correct: 7, incorrect: 13 },
  'business_ethics': { correct: 15, incorrect: 5 },
  'world_religions': { correct: 14, incorrect: 6 },
  'astronomy': { correct: 12, incorrect: 8 },
  'college_biology': { correct: 16, incorrect: 4 },
  'philosophy': { correct: 13, incorrect: 7 },
  'machine_learning': { correct: 70, incorrect: 10 },
  'nutrition': { correct: 11, incorrect: 2 } 
};

export class UserProfile {
  constructor(name, preferences) {
    this.name = name;
    this.preferences = preferences;
    this.topicStats = {};

    // If this is the test account, initialize with mock data
    if (name.toLowerCase() === 'testaccount') {
      Object.entries(TEST_ACCOUNT_DATA).forEach(([topicId, data]) => {
        this.initializeTopic(topicId);
        this.topicStats[topicId].bulkUpdate(data.correct, data.incorrect);
      });
    }
  }

  initializeTopic(topicId) {
    if (!this.topicStats[topicId]) {
      this.topicStats[topicId] = new TopicStats();
    }
  }

  updateTopic(topicId, isCorrect) {
    this.initializeTopic(topicId);
    this.topicStats[topicId].updateStats(isCorrect);
  }

  // Thompson sampling to select next topic
  selectNextTopic(availableTopics) {
    // Initialize any new topics
    availableTopics.forEach(topic => this.initializeTopic(topic));
    // Sample from each topic's beta distribution
    const samples = availableTopics.map(topicId => ({
      topicId,
      sample: this.topicStats[topicId].sampleBeta()
    }));
    // Select topic with lowest sample (we want to focus on topics with lower success rates)
    const selectedTopic = samples.reduce((prev, current) => 
      current.sample < prev.sample ? current : prev
    );
    return selectedTopic.topicId;
  }

  // Get stats for a topic
  getTopicStats(topicId) {
    this.initializeTopic(topicId);
    return this.topicStats[topicId];
  }

  // Get all topic statistics
  getAllTopicStats() {
    return this.topicStats;
  }
}
