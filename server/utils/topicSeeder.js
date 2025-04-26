import Topic from '../models/topicModel.js';
import mongoose from 'mongoose';
import config from '../config/config.js';

// Initial topics for seeding the database
const initialTopics = [
  // Technical topics
  {
    name: 'Data Structures - Arrays and Linked Lists',
    category: 'technical',
    description: 'Fundamentals of arrays and linked lists, their operations, and time complexity.',
    difficulty: 'beginner',
    keywords: ['data structures', 'arrays', 'linked lists', 'time complexity', 'algorithms']
  },
  {
    name: 'Data Structures - Trees and Graphs',
    category: 'technical',
    description: 'Understanding tree and graph data structures, traversal algorithms, and common operations.',
    difficulty: 'intermediate',
    keywords: ['data structures', 'binary trees', 'graphs', 'traversal', 'algorithms']
  },
  {
    name: 'Algorithms - Sorting and Searching',
    category: 'technical',
    description: 'Common sorting and searching algorithms, their implementations, and performance characteristics.',
    difficulty: 'intermediate',
    keywords: ['algorithms', 'sorting', 'searching', 'binary search', 'quicksort', 'mergesort']
  },
  {
    name: 'JavaScript Fundamentals',
    category: 'technical',
    description: 'Core concepts in JavaScript including closures, prototypes, async programming, and ES6+ features.',
    difficulty: 'beginner',
    keywords: ['javascript', 'closures', 'prototypes', 'async', 'promises', 'es6']
  },
  {
    name: 'React.js Core Concepts',
    category: 'technical',
    description: 'Understanding React components, state management, hooks, and rendering optimization.',
    difficulty: 'intermediate',
    keywords: ['react', 'hooks', 'components', 'state', 'props', 'jsx', 'frontend']
  },
  
  // System design topics
  {
    name: 'System Design Basics',
    category: 'system-design',
    description: 'Fundamental concepts in system design including scaling, load balancing, and caching.',
    difficulty: 'beginner',
    keywords: ['system design', 'architecture', 'scalability', 'load balancing', 'caching']
  },
  {
    name: 'Designing a URL Shortener',
    category: 'system-design',
    description: 'System design case study for creating a URL shortening service like bit.ly.',
    difficulty: 'intermediate',
    keywords: ['system design', 'url shortener', 'distributed systems', 'hashing', 'databases']
  },
  {
    name: 'Microservices Architecture',
    category: 'system-design',
    description: 'Design principles, patterns, and challenges in microservices-based architectures.',
    difficulty: 'advanced',
    keywords: ['microservices', 'architecture', 'distributed systems', 'api gateway', 'service discovery']
  },
  
  // Behavioral topics
  {
    name: 'STAR Method for Behavioral Questions',
    category: 'behavioral',
    description: 'Using the Situation-Task-Action-Result framework to structure compelling interview responses.',
    difficulty: 'beginner',
    keywords: ['behavioral interview', 'star method', 'interview techniques', 'soft skills']
  },
  {
    name: 'Leadership and Teamwork Examples',
    category: 'behavioral',
    description: 'Preparing effective examples of leadership and teamwork experiences for interviews.',
    difficulty: 'intermediate',
    keywords: ['leadership', 'teamwork', 'behavioral interview', 'soft skills', 'conflict resolution']
  },
  {
    name: 'Handling Conflict in the Workplace',
    category: 'behavioral',
    description: 'Frameworks and examples for discussing conflict resolution in interviews.',
    difficulty: 'intermediate',
    keywords: ['conflict resolution', 'workplace', 'behavioral interview', 'communication', 'soft skills']
  },
  
  // Other topics
  {
    name: 'Negotiating Job Offers',
    category: 'other',
    description: 'Strategies and techniques for negotiating salary and benefits in job offers.',
    difficulty: 'intermediate',
    keywords: ['negotiation', 'salary', 'benefits', 'job offer', 'career']
  },
  {
    name: 'Technical Interview Preparation',
    category: 'other',
    description: 'General strategies for preparing for technical interviews, including coding challenges.',
    difficulty: 'beginner',
    keywords: ['technical interview', 'coding challenge', 'whiteboarding', 'problem solving']
  }
];

/**
 * Seed the database with initial topics
 */
const seedTopics = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.database.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB for seeding');
    }
    
    // Check if topics already exist
    const topicCount = await Topic.countDocuments();
    if (topicCount > 0) {
      console.log(`Database already contains ${topicCount} topics. Skipping seed.`);
      return;
    }
    
    // Insert all topics
    const result = await Topic.insertMany(initialTopics);
    console.log(`Successfully seeded ${result.length} topics`);
    
  } catch (error) {
    console.error('Error seeding topics:', error);
  }
};

export { seedTopics };
