import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/Quiz.css";

const MakeContest = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  const user = useSelector((state) => state.app.user);

  // useEffect(() => {
  //   const fetchQuizzes = async () => {
  //     try {
  //       const response = await axios.get(`http://localhost:8080/api/v1/user/quiz`, {
  //         params: { userId: user._id },
  //       });
  //       if (response.data.success) {
  //         // Sort quizzes by the newest first
  //         const sortedQuizzes = response.data.quizzes.sort(
  //           (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //         );
  //         setQuizzes(sortedQuizzes);
  //       } else {
  //         console.error("Failed to fetch quizzes:", response.data.message);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching quizzes:", error);
  //     }
  //   };

  //   if (user) {
  //     fetchQuizzes(); // Fetch quizzes only if the user is available
  //   }
  // }, [user]);

  const handleAddQuiz = () => {
    navigate("/create-contest");
  };

  const handleCreateProblem = () => {
    navigate("/create-problem");
  }

  const handleEditQuiz = (code) => {
    navigate(`/edit-quiz/${code}`);
  };

  const handleDashboardQuiz = (code, title) => {
    console.log("Dashboard Quiz Code:", code,title);
    navigate(`/dashboard`, { state: { quizCode: code, quizTitle: title } });
  };

  const handleDeleteQuiz = async (code) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/v1/user/quiz/${code}`);
      if (response.data.success) {
        setQuizzes(quizzes.filter((quiz) => quiz.code !== code));
        toast.success("Quiz deleted successfully!");
      } else {
        toast.error("Failed to delete quiz.");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Error deleting quiz.");
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Quizzes</h1>
        <button
          onClick={handleAddQuiz}
          className="bg-blue-500 text-white font-semibold py-2 px-4 mt-5 rounded-lg hover:bg-blue-600 transition mb-4 w-full sm:w-auto"
        >
          Add Contest
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.code}
              className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-md flex flex-col"
            >
              {/* Display the quiz number in reverse order */}
              <p className="text-gray-400 mb-2">#{quizzes.length - index}</p>
              <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
              <p className="text-gray-400 mb-2">
                <span className="font-semibold text-white">Code:</span>{" "}
                <span className="text-blue-400 cursor-pointer" onClick={() => handleCopyCode(quiz.code)}>
                  {quiz.code}
                </span>
              </p>
              <button
                onClick={() => handleCopyCode(quiz.code)}
                className="bg-green-500 text-white font-semibold py-1 px-4 mb-4 rounded-lg hover:bg-green-600 transition w-full sm:w-auto"
              >
                Copy Code
              </button>
              <p className="text-gray-400 mb-2">
                <span className="font-semibold">Questions:</span> {quiz.questions.length}
              </p>
              <p className="text-gray-400 mb-1">
                <span className="font-semibold">Created:</span>{" "}
                {new Date(quiz.createdAt).toLocaleString()}
              </p>
              <p className="text-gray-400 mb-4">
                <span className="font-semibold">Updated:</span>{" "}
                {new Date(quiz.updatedAt).toLocaleString()}
              </p>
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <button
                  onClick={() => handleDashboardQuiz(quiz.code, quiz.title)}
                  className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition w-full sm:w-auto"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleEditQuiz(quiz.code)}
                  className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition w-full sm:w-auto"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz.code)}
                  className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition w-full sm:w-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>


        <button
          onClick={handleCreateProblem}
          className="bg-red-500 text-white font-semibold py-2 px-4 mt-5 rounded-lg hover:bg-red-600 transition mb-4 w-full sm:w-auto"
        >
          Add Problem
        </button>   

      </div>    
      {/* Toaster Container */}
      <ToastContainer />
    </div>
  );
};

export default MakeContest;
