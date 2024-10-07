import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../Header";
import ConfirmationModal from "../ConfirmationModal";
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
    start_time: "", // Start time of the contest
    end_time: "", // End time of the contest
  });

  const [problems, setProblems] = useState([]); // All problems
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering
  const [isInvalid, setIsInvalid] = useState({
    name: false,
    description: false,
    problems: false,
    start_time: false,
    end_time: false,
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
        toast.error("Error fetching problems.");
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblems();
  }, []);

  // Utility function to format ISO date to yyyy-MM-ddThh:mm
const formatDateTimeLocal = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};


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
            created_by: contestData.created_by,
            start_time: formatDateTimeLocal(contestData.start_time),
            end_time: formatDateTimeLocal(contestData.end_time),
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
      start_time: contest.start_time.trim() === "",
      end_time: contest.end_time.trim() === "",
    };

    setIsInvalid(invalidFields);

    if (
      invalidFields.name ||
      invalidFields.description ||
      invalidFields.problems ||
      invalidFields.start_time ||
      invalidFields.end_time
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
      <div className="mx-auto p-[5%] bg-gray-900 text-white rounded-lg shadow-lg">
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
        <ConfirmationModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleConfirmBack}
          />

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
              className={`w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isInvalid.name ? "border-red-500" : "border-gray-700"
              }`}
              placeholder="Enter contest title"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={contest.description}
              onChange={handleChange}
              className={`w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isInvalid.description ? "border-red-500" : "border-gray-700"
              }`}
              rows={5}
              placeholder="Enter contest description"
            />
          </div>

          {/* Start Time */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2" htmlFor="start_time">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="start_time"
              name="start_time"
              value={contest.start_time}
              onChange={handleChange}
              className={`w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isInvalid.start_time ? "border-red-500" : "border-gray-700"
              }`}
            />
          </div>

          {/* End Time */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2" htmlFor="end_time">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="end_time"
              name="end_time"
              value={contest.end_time}
              onChange={handleChange}
              className={`w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isInvalid.end_time ? "border-red-500" : "border-gray-700"
              }`}
            />
          </div>

          {/* Problems */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">
              Select Problems <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Search Problems"
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="rounded-lg p-4 max-h-64 overflow-y-auto">
              {displayedProblems.map((problem) => (
                <li key={problem._id} className="mb-2 p-2">
                  <label className="flex items-center p-4 border border-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      className="mr-10 cursor-pointer"
                      checked={contest.problems.includes(problem._id)}
                      onChange={() => handleProblemSelect(problem._id)}
                      
                    />
                    <span className="text-lg capitalize cursor-pointer"
                    onClick={() => navigate(`/problems/${problem._id}`)} >
                    {problem.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {isInvalid.problems && (
              <p className="text-red-500 text-sm">Please select at least one problem.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300"
          >
            {isEditMode ? "Update Contest" : "Create Contest"}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to go back? All unsaved changes will be lost."
          onConfirm={handleConfirmBack}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CreateContest;
