import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Header from "./Header";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const CreateContest = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get contest ID from URL params
  const user = useSelector((store) => store.app.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're editing
  const [contest, setContest] = useState({
    name: "",
    description: "",
    problems: [], // Store selected problem IDs
    created_by: user._id, // User ID
  });

  const [problems, setProblems] = useState([]); // All problems
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

        // Sort problems by latest
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

  // Fetch contest data if editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true); // We are in edit mode
      const fetchContest = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axiosInstance.get(`/contests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          const contestData = response.data;
          setContest({
            name: contestData.name,
            description: contestData.description,
            problems: contestData.problems.map((problem) => problem._id),
            userId: contestData.userId,
          });
        } catch (error) {
          console.error("Error fetching contest data:", error);
        }
      };

      fetchContest();
    }
  }, [id]);

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
      const isSelected = prevContest.problems.includes(problemId);
      if (isSelected) {
        return {
          ...prevContest,
          problems: prevContest.problems.filter((id) => id !== problemId),
        };
      } else {
        return {
          ...prevContest,
          problems: [...prevContest.problems, problemId],
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

    if (
      invalidFields.name ||
      invalidFields.description ||
      invalidFields.problems
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (isEditMode) {
        // Update existing contest
        await axiosInstance.put(`/contests/${id}`, contest, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        
        toast.success("Contest updated successfully!");
      } else {
        // Create new contest
        await axiosInstance.post("/contests/create", contest, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        toast.success("Contest created successfully!");
      }
      navigate("/make-contest");
    } catch (error) {
      toast.error("Error creating/updating contest.");
      console.error("Error creating/updating contest:", error);
    }
  };

  // Back button logic
  const handleBackClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmBack = () => {
    setIsModalOpen(false);
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
          {isEditMode ? "Edit Contest" : "Create Contest"}
        </h1>

        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Back
        </button>

        {/* Contest Form */}
        <form onSubmit={handleSubmit}>
          {/* Contest Name */}
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
              className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isInvalid.name
                  ? "border-red-500" : "  border-gray-700"
              }`}
              placeholder="Enter contest title"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              className="block text-lg font-medium mb-2"
              htmlFor="description"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={contest.description}
              onChange={handleChange}
              className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isInvalid.description
                  ? "border-red-500" : "  border-gray-700"
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
                          className="flex justify-between items-center p-4 mb-2 border border-gray-800 rounded-lg"
                        >
                          <span className="font-semibold capitalize">
                            {problem.title}
                          </span>
                          <span className="text-sm">
                            <span className="mr-5">
                              {new Date(problem.createdAt).toLocaleDateString()}{" "}
                              <span className="capitalize">
                              | {problem.difficulty}
                              </span>
                            </span>
                            <button
                              type="button"
                              className="px-2 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
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
              <p
                className={`text-red-500 ${
                  isInvalid.problems ? "block" : "hidden"
                }`}
              >
                Please select at least one problem.
              </p>
            )}
          </div>

          {/* Problem Search */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">
              Add Problems <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full p-4  bg-gray-800 border border-gray-700 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Search problems"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Problem List */}
          <div className="max-h-[350px] overflow-y-auto">
            {displayedProblems.map((problem) => (
              <div
                key={problem._id}
                className={`flex justify-between items-center p-5 mb-2 border border-gray-800 rounded-lg cursor-pointer ${
                  contest.problems.includes(problem._id)
                    ? "bg-blue-500"
                    : "bg-gray-800"
                }`}
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
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 mt-5"
          >
            {isEditMode ? "Update Contest" : "Create Contest"}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmBack}
        title="Go Back?"
        message="Are you sure you want to leave? All unsaved data will be lost."
      />
    </div>
  );
};

export default CreateContest;
