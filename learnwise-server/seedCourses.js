require('./loadEnv');
const mongoose = require('mongoose');
const Course = require('./models/Course');

const sampleCourses = [
  {
    title: "React.js Complete Course",
    description: "Learn React.js from basics to advanced concepts including hooks, context, and state management.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
    price: 99.99,
    category: "Web Development"
  },
  {
    title: "Node.js Backend Development",
    description: "Master backend development with Node.js, Express, and MongoDB.",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
    price: 89.99,
    category: "Backend Development"
  },
  {
    title: "JavaScript Fundamentals",
    description: "Complete JavaScript course covering ES6+, async/await, and modern JavaScript features.",
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop",
    price: 79.99,
    category: "Programming"
  },
  {
    title: "MongoDB Database Design",
    description: "Learn database design, queries, and optimization with MongoDB.",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop",
    price: 69.99,
    category: "Database"
  },
  {
    title: "Full Stack MERN Development",
    description: "Complete full-stack development course using MongoDB, Express, React, and Node.js.",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
    price: 149.99,
    category: "Full Stack"
  },
  {
    title: "CSS & Tailwind CSS Mastery",
    description: "Master modern CSS and Tailwind CSS for beautiful, responsive web designs.",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
    price: 59.99,
    category: "Frontend Development"
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Existing courses cleared');

    // Insert sample courses
    const courses = await Course.insertMany(sampleCourses);
    console.log(`${courses.length} sample courses added successfully!`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
