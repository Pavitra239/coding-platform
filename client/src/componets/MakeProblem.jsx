import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/Quiz.css";

const MakeProblem = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleCreateProblem = () => {
    navigate("/create-problem");
  }

  const fetchProblems = async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/problems?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { problems: newProblems, currentPage, totalPages } = response.data;
      console.log(response.data)
      setProblems((prevProblems) => [...prevProblems, ...newProblems]);
      setCurrentPage(currentPage);
      setTotalPages(totalPages);
      setHasMore(currentPage < totalPages);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch problems on initial load and when currentPage changes
  useEffect(() => {
    fetchProblems(currentPage);
  }, [currentPage]);

  // Handle infinite scroll
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 100 && hasMore && !loading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading]);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto p-4 mb-6">
        <button
          onClick={handleCreateProblem}
          className="bg-red-500 text-white font-semibold py-2 px-4 mt-20 rounded-lg hover:bg-red-600 transition mb-4 w-full sm:w-auto"
        >
          Add Problem
        </button>   
      </div>    

      <div className="space-y-6 p-5">
  {problems.map((problem) => (
    <div
      key={problem._id}
      className="bg-gray-800 text-white shadow-lg rounded-lg p-6 hover:bg-gray-700 transition duration-300 ease-in-out"
    >
      <h2 className="text-3xl font-bold">{problem.title}</h2>
      <p className="mt-4 text-gray-300">{problem.description}</p>
      <div className="mt-4">
        <span className="text-sm font-medium text-gray-400">Difficulty: </span>
        <span className={`text-sm ${problem.difficulty === 'Easy' ? 'text-green-500' : problem.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
          {problem.difficulty}
        </span>
      </div>
      <div className="mt-2">
        <span className="text-sm font-medium text-gray-400">Tags: </span>
        <span className="text-sm text-gray-300">{problem.tags.join(', ')}</span>
      </div>
    </div>
  ))}
</div>


      {loading && (
        <div className="flex justify-center mt-8">
          <div className="loader"></div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default MakeProblem;
