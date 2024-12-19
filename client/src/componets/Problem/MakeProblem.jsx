import React, { useState, useEffect } from "react";
import Header from "../Header";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import "../../CSS/Quiz.css";
import { useSelector } from "react-redux";

const MakeProblem = () => {
  const user = useSelector((store) => store.app.user);
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [userRole, setUserRole] = useState(null); // State for storing user role

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    // Assuming the user's role is stored in local storage
    const role = user.role;
    setUserRole(role);
    fetchProblems();
  }, []);

  const handleCreateProblem = () => {
    navigate("/problem-form");
  };

  const handleEditProblem = (problemId) => {
    navigate(`/problem-form/${problemId}`);
  };

  const handleDeleteProblem = async () => {
    try {
      await axiosInstance.delete(`/problems/${problemToDelete}`);
      toast.success("Problem deleted successfully!");
      setShowDeleteModal(false);
      setProblemToDelete(null);
      fetchProblems();
    } catch (error) {
      toast.error("Error deleting problem!");
      console.error("Error deleting problem:", error);
    }
  };

  const handleDeleteConfirmation = (problemId) => {
    setProblemToDelete(problemId);
    setShowDeleteModal(true);
  };

  const handleDashboardConfirmation = (
    problemId,
    title,
    difficulty,
    createdAt
  ) => {
    // Passing the problem data using state with the navigate function
    navigate(`/dashboard/${problemId}`, {
      state: {
        problemTitle: title,
        difficulty: difficulty,
        createdAt: createdAt,
      },
    });
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProblemToDelete(null);
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/problems`);
      const { problems: allProblems } = response.data;
      setProblems(allProblems);
    } catch (error) {
      toast.error("Error fetching problems!");
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyFilterChange = (event) => {
    setDifficultyFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const sortedProblems = React.useMemo(() => {
    let sortableProblems = [...problems];
    if (sortConfig !== null) {
      sortableProblems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProblems;
  }, [problems, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredProblems = sortedProblems
    .filter((problem) =>
      difficultyFilter === "All"
        ? true
        : problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
    )
    .filter((problem) =>
      problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="mx-auto p-4">
        {/* Show the Add Problem button only if the user is not a student */}
        {userRole !== "student" && (
          <button
            onClick={handleCreateProblem}
            className="bg-red-500 text-white font-semibold text-lg py-2 px-4 mt-20 rounded-lg hover:bg-red-600 transition  w-full sm:w-auto"
          >
            Add Problem
          </button>
        )}
      </div>

      <div className="p-5 pt-8">
        <h1 className="text-2xl font-bold text-white mb-10 text-center">
          Problem List
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label
              htmlFor="difficulty-filter"
              className="mr-2 text-lg sm:text-sm text-white"
            >
              Filter by Difficulty:
            </label>
            <select
              id="difficulty-filter"
              value={difficultyFilter}
              onChange={handleDifficultyFilterChange}
              className="bg-gray-800 text-white py-2 px-4 rounded text-lg sm:text-sm"
            >
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <label
              htmlFor="search-box"
              className="text-lg sm:text-sm text-white"
            >
              Search Problems:
            </label>
            <input
              id="search-box"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by title..."
              className="bg-gray-800 text-white py-2 px-4 rounded text-lg sm:text-sm w-full sm:w-96"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-5">
        <table className="w-full border-collapse border border-gray-700 text-sm sm:text-lg text-left text-gray-500">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th
                className="py-3 px-4 sm:px-6 cursor-pointer text-center"
                onClick={() => handleSort("index")}
              >
                #
              </th>
              <th
                className="py-3 px-4 sm:px-6 cursor-pointer text-center"
                onClick={() => handleSort("title")}
              >
                Title
              </th>
              <th
                className="py-3 px-4 sm:px-6 cursor-pointer text-center"
                onClick={() => handleSort("difficulty")}
              >
                Difficulty
              </th>
              <th
                className="py-3 px-4 sm:px-6 cursor-pointer text-center"
                onClick={() => handleSort("createdAt")}
              >
                Created Date
              </th>
              <th className="py-3 px-4 sm:px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => (
                <tr
                  key={problem._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                  }`}
                >
                  <td className="py-3 px-4 sm:px-6 text-center font-medium text-gray-300">
                    {index + 1}
                  </td>
                  <td
                    className="capitalize py-3 px-4 sm:px-6 text-white font-bold cursor-pointer hover:text-blue-500 transition duration-300 truncate max-w-[180px] sm:max-w-[300px]"
                    onClick={() => navigate(`/problems/${problem._id}`)}
                    title={problem.title}
                  >
                    {problem.title}
                  </td>
                  <td
                    className={`py-3 px-4 sm:px-6 text-center font-medium ${
                      problem.difficulty === "easy"
                        ? "text-green-400"
                        : problem.difficulty === "medium"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {problem.difficulty.charAt(0).toUpperCase() +
                      problem.difficulty.slice(1)}
                  </td>
                  <td className="py-3 px-4 sm:px-4 text-center text-gray-300">
                    {formatDate(problem.createdAt)}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-center flex justify-center gap-2">
                    {userRole !== "student" && (
                      <>
                        <button
                          onClick={() => handleEditProblem(problem._id)}
                          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteConfirmation(problem._id)}
                          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() =>
                            handleDashboardConfirmation(
                              problem._id,
                              problem.title,
                              problem.difficulty,
                              problem.createdAt
                            )
                          }
                          className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition"
                        >
                          Dashboard
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="py-3 px-4 sm:px-6 text-center text-gray-300"
                >
                  No problems found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
            <p className="mt-4 text-blue-500 text-lg font-medium">
              Loading, please wait...
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 sm:p-8 rounded-lg w-11/12 max-w-md sm:max-w-lg mx-auto">
            <h3 className="text-white text-lg sm:text-xl font-bold mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-gray-300 mb-4 text-sm sm:text-base text-center">
              Are you sure you want to delete this problem? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-500 text-white py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProblem}
                className="bg-red-500 text-white py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MakeProblem;
