import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Header from "./Header";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const MakeContest = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.app.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contest, setContest] = useState({
    name: "",
    description: "",
    problems: [], // Initialize as an array to store selected problem IDs
    created_by: user._id, // Store the user ID
  });

  const [problems, setProblems] = useState([]); // To store all problems
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering
  const [isInvalid, setIsInvalid] = useState({
    name: false,
    description: false,
    problems: false,
  });

  // Fetch all problems on component mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get("/problems", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        let { problems: allProblems } = response.data;

        // Sort problems by latest (assuming `createdAt` exists)
        allProblems = allProblems.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setProblems(allProblems);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblems();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContest((prevContest) => ({
      ...prevContest,
      [name]: value,
    }));
    setIsInvalid((prevInvalid) => ({ ...prevInvalid, [name]: false }));
  };

  // Handle problem selection
  const handleProblemSelect = (problemId) => {
    setContest((prevContest) => {
      const isSelected = prevContest.problems.includes(problemId); // Check if the ID is already in the array
      if (isSelected) {
        return {
          ...prevContest,
          problems: prevContest.problems.filter((id) => id !== problemId), // Remove the problem ID
        };
      } else {
        return {
          ...prevContest,
          problems: [...prevContest.problems, problemId], // Add the problem ID
        };
      }
    });
    setIsInvalid((prevInvalid) => ({ ...prevInvalid, problems: false }));
  };

  // Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    const invalidFields = {
      name: contest.name.trim() === "",
      description: contest.description.trim() === "",
      problems: contest.problems.length === 0,
    };

    setIsInvalid(invalidFields);

    // If any field is invalid, do not submit
    if (invalidFields.name || invalidFields.description || invalidFields.problems) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axiosInstance.post("/contests/create", contest, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      toast.success("Contest created successfully!");
      navigate("/make-contest");
    } catch (error) {
      console.log(error.response.data);
      toast.error("Error creating contest.");
      console.error("Error creating contest:", error);
    }
  };

  // Back button logic
  const handleBackClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmBack = () => {
    setIsModalOpen(false);
    toast.success("Back to the previous page");
    navigate(-1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Filter problems based on search term
  const filteredProblems = Array.isArray(problems)
    ? problems.filter((problem) =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const displayedProblems = searchTerm ? filteredProblems : problems;

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto p-[5%] bg-gray-900 text-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mt-10 mb-6 text-center">
          Create Contest
        </h1>

        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Back
        </button>

        {/* Contest Creation Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2" htmlFor="name">
              Contest Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={contest.name}
              onChange={handleChange}
              className={`w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isInvalid.name ? "border-2 border-red-500 bg-gray-700" : "bg-gray-700"
              }`}
              placeholder="Enter contest title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-medium mb-2" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={contest.description}
              onChange={handleChange}
              className={`w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isInvalid.description ? "border-2 border-red-500 bg-gray-700" : "bg-gray-700"
              }`}
              rows={5}
              placeholder="Enter contest description"
            />
          </div>

          {/* Selected Problems */}
          <div className="mb-4">
            {contest.problems.length > 0 ? (
              <div>
                <h3 className="text-lg font-bold mb-2">Selected Problems:</h3>
                <div className="p-4 rounded-lg">
                  {contest.problems.map((problemId) => {
                    const problem = problems.find((p) => p._id === problemId);
                    return (
                      problem && (
                        <div
                          key={problem._id}
                          className="flex justify-between items-center p-3 mb-2 bg-gray-700 rounded-lg"
                        >
                          <span className="font-semibold capitalize">{problem.title}</span>
                          <span className="text-sm">
                            <span className="mr-5">
                              {new Date(problem.createdAt).toLocaleDateString()} |{" "}
                              {problem.difficulty}
                            </span>
                            <button
                              className="px-2 py-1 bg-red-500 rounded-lg text-white hover:bg-red-600"
                              onClick={() => handleProblemSelect(problemId)}
                            >
                              Remove
                            </button>
                          </span>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className={`text-red-500 ${isInvalid.problems ? "block" : "hidden"}`}>
                Please select at least one problem.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-lg mb-2 font-medium" htmlFor="search">
              Search Problems
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a problem..."
              className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
            />

            {/* Scrollable box for problems */}
            <div className="max-h-64 overflow-y-scroll border border-gray-800 p-2 rounded-lg bg-gray-900 custom-scrollbar">
              {displayedProblems.length > 0 ? (
                displayedProblems.map((problem) => (
                  <div
                    key={problem._id}
                    className={`flex justify-between items-center p-3 cursor-pointer rounded-lg mb-2 ${
                      contest.problems.includes(problem._id)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-900 text-gray-300"
                    } hover:bg-gray-500 hover:text-white`}
                    onClick={() => handleProblemSelect(problem._id)}
                  >
                    <span className="font-semibold capitalize">
                      {problem.title}
                    </span>
                    <span className="text-sm">
                      {new Date(problem.createdAt).toLocaleDateString()} |{" "}
                      {problem.difficulty}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-300">No problems found</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Create Contest
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmBack}
      />
    </div>
  );
};

export default MakeContest;
