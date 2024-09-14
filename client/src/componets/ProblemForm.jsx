import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; // Custom axios instance for API calls
import ConfirmationModal from "./ConfirmationModal"; // Import the modal component

const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

const ProblemForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the problem ID from the URL
  const user = useSelector((state) => state.app.user); // Get the logged-in user
  
  // Initial state for problem data
  const [problemData, setProblemData] = useState({
    title: "",
    description: "",
    difficulty: DIFFICULTY.EASY,
    inputFormat: "",
    outputFormat: "",
    sampleIO: [{ input: "", output: "" }],
    constraints: "",
    tags: "",
    score: 0,
  });

  const [isEditing, setIsEditing] = useState(false); // Check if we're in edit mode
  const [errors, setErrors] = useState({});
  const [isModalOpenInternal, setIsModalOpenInternal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Fetch problem if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true); // We're editing an existing problem
      const fetchProblem = async () => {
        const token = localStorage.getItem("UserToken");
        try {
          const response = await axiosInstance.get(`/problems/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          setProblemData(response.data); // Populate form with fetched data
        } catch (error) {
          toast.error("Failed to load problem data");
          console.error(error);
        }
      };
      fetchProblem();
    } else {
      setIsEditing(false); // We're creating a new problem
    }
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblemData({ ...problemData, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  // Handle dynamic sample input/output change
  const handleSampleChange = (index, e) => {
    const { name, value } = e.target;
    const newSampleIO = [...problemData.sampleIO];
    newSampleIO[index][name] = value;
    setProblemData({ ...problemData, sampleIO: newSampleIO });
  };

  // Add new sample input/output pair
  const addSampleIO = () => {
    setProblemData({
      ...problemData,
      sampleIO: [...problemData.sampleIO, { input: "", output: "" }],
    });
  };

  // Remove a sample input/output pair
  const removeSampleIO = (index) => {
    const newSampleIO = problemData.sampleIO.filter((_, i) => i !== index);
    setProblemData({ ...problemData, sampleIO: newSampleIO });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!problemData.title) newErrors.title = true;
    if (!problemData.description) newErrors.description = true;
    if (!problemData.inputFormat) newErrors.inputFormat = true;
    if (!problemData.outputFormat) newErrors.outputFormat = true;
    if (problemData.sampleIO.some((sample) => !sample.input || !sample.output)) {
      newErrors.sampleIO = true;
    }
    if (!problemData.constraints) newErrors.constraints = true;
    if (!problemData.tags) newErrors.tags = true;
    if (!problemData.score) newErrors.score = true;
    return newErrors;
  };

  // Handle form submission for both create and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields!");
      return;
    }
    setIsModalOpenInternal(true); // Show confirmation modal
  };

  
  const confirmSubmit = async () => {
    const token = localStorage.getItem("UserToken");
    const actionType = isEditing ? "edit" : "create";
    const apiMethod = actionType === "edit" ? axiosInstance.put : axiosInstance.post;
    const apiEndpoint = actionType === "edit" ? `/problems/${id}` : "/problems";
  
    // Only split and update tags if the user has made changes to the tags field
    const tags =
      typeof problemData.tags === "string" && problemData.tags.trim() !== ""
        ? problemData.tags.split(",").map((tag) => tag.trim())
        : problemData.tags; // Keep the original tags if unchanged
  
    try {
      const response = await apiMethod(
        apiEndpoint,
        {
          ...problemData,
          tags, // Use the processed tags
          createdBy: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
  
      if (response.status === 200 || response.status === 201) {
        toast.success(
          actionType === "edit"
            ? "Problem updated successfully!"
            : "Problem created successfully!"
        );
        setTimeout(() => {
          setIsModalOpenInternal(false);
          navigate("/make-problem");
        }, 1000); // Redirect after 1 second
      }
    } catch (error) {
      toast.error(
        actionType === "edit"
          ? "Failed to update problem. Please try again."
          : "Failed to create problem. Please try again."
      );
      setTimeout(() => {
        setIsModalOpenInternal(false);
      }, 2000);
      console.error(error);
    }
  };

  

  const handleBackClick = () => {
    setIsModalOpen(true); // Open the modal when the "Back" button is clicked
  };

  const handleConfirmBack = () => {
    setIsModalOpen(false); // Close the modal
    navigate(-1); // Go back to the previous page
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal without navigating
  };
  
  
  

  return (
    <>
      <div className="relative min-h-screen bg-gray-800 text-white">
        <Header />
       
      
        <div className="container mx-auto p-[5%] bg-gray-800 text-white rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mt-10 mb-6 text-center">
            {isEditing ? "Edit Problem" : "Create Problem"}
          </h1>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-lg font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={problemData.title}
                onChange={handleChange}
                className={`w-full p-3 bg-gray-700 border ${
                  errors.title ? "border-red-500" : "border-gray-600"
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter problem title"
              />
            </div>

            {/* Similar fields for Description, Difficulty, Input/Output Format, Sample IO, Constraints, Tags, and Score */}
             {/* Description */}
             <div>
              <label className="block text-lg font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={problemData.description}
                onChange={handleChange}
                className={`w-full p-3 bg-gray-700 border ${
                  errors.description ? "border-red-500" : "border-gray-600"
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Describe the problem"
                rows="5"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={problemData.difficulty}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={DIFFICULTY.EASY}>Easy</option>
                <option value={DIFFICULTY.MEDIUM}>Medium</option>
                <option value={DIFFICULTY.HARD}>Hard</option>
              </select>
            </div>

            {/* Input Format */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Input Format
              </label>
              <textarea
                type="text"
                name="inputFormat"
                value={problemData.inputFormat}
                onChange={handleChange}
                className={`w-full p-3 bg-gray-700 border ${
                  errors.inputFormat ? "border-red-500" : "border-gray-600"
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Specify the input format"
                rows={3}
              />
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Output Format
              </label>
              <textarea
                type="text"
                name="outputFormat"
                value={problemData.outputFormat}
                onChange={handleChange}
                className={`w-full p-3 bg-gray-700 border ${
                  errors.outputFormat ? "border-red-500" : "border-gray-600"
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Specify the output format"
                rows={3}
              />
            </div>

            {/* Sample IO */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Sample Input/Output
              </label>
              {problemData.sampleIO.map((sample, index) => (
                <div key={index} className="space-y-2 mb-4">
                  <textarea
                    type="text"
                    name="input"
                    value={sample.input}
                    onChange={(e) => handleSampleChange(index, e)}
                    placeholder="Sample Input"
                    className={`w-full p-2 bg-gray-700 border ${
                      errors.sampleIO ? "border-red-500" : "border-gray-600"
                    } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <textarea
                    type="text"
                    name="output"
                    value={sample.output}
                    onChange={(e) => handleSampleChange(index, e)}
                    placeholder="Sample Output"
                    className={`w-full p-2 bg-gray-700 border ${
                      errors.sampleIO ? "border-red-500" : "border-gray-600"
                    } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />

                  {/* Disable Remove button if only one sample exists */}
                  {problemData.sampleIO.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSampleIO(index)}
                      className="bg-red-500 mt-5 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300 ease-in-out"
                    >
                      Remove Sample
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addSampleIO}
                className="text-blue-500 mt-2"
              >
                + Add More
              </button>
            </div>

            {/* Constraints */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Constraints
              </label>
              <textarea
                name="constraints"
                value={problemData.constraints}
                onChange={handleChange}
                className={`w-full p-3 bg-gray-700 border ${
                  errors.constraints ? "border-red-500" : "border-gray-600"
                } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Specify the problem constraints"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-lg font-medium mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={problemData.tags}
                onChange={handleChange}
                className={`w-full p-3 bg-gray-700 border ${
                 errors.tags ? "border-red-500" : "border-gray-600"}
                border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Comma-separated tags (e.g., arrays, sorting)"
              />
            </div>

            {/* Score */}
            <div>
              <label className="block text-lg font-medium mb-2">Score</label>
              <input
                type="number"
                name="score"
                value={problemData.score}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Score for the problem"
                min={0}
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {isEditing ? "Update Problem" : "Create Problem"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <div
        className={`${
          isModalOpenInternal ? "block" : "hidden"
        } fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center z-50`}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg text-gray-900 text-center">
          <p className="text-2xl font-bold mb-4">Confirmation</p>
          <p>{modalMessage || "Are you sure you want to proceed?"}</p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => setIsModalOpenInternal(false)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              onClick={confirmSubmit}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default ProblemForm;
