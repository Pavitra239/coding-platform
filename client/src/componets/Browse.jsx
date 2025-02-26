import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Trophy, Users, Timer } from "lucide-react";
import Header from "./Header";

const Browse = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const features = [
    {
      icon: <Code2 className="w-8 h-8 text-blue-500" />,
      title: "Coding Challenges",
      description: "Tackle real-world programming problems",
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Compete & Win",
      description: "Earn points and climb the leaderboard",
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "Global Community",
      description: "Connect with developers worldwide",
    },
    {
      icon: <Timer className="w-8 h-8 text-purple-500" />,
      title: "Time-based Contests",
      description: "Test your speed and efficiency",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text"
          >
            Ready to Code?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join our coding contests to challenge yourself, compete with others,
            and improve your programming skills.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Join Contest Now
          </motion.button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors duration-300 border border-gray-700"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Browse;
