import React, { useState } from "react";
import axios from "axios";
import ConfirmationModal from "./ConfirmationModal"; // Import the modal component
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axiosInstance from '../utils/axiosInstance';

const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

const CreateProblem = () => {
  const navigate = useNavigate(); // Use navigate hook
  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
  const user = useSelector((state) => state.app.user); // Get the logged-in user
  const [problemData, setProblemData] = useState({
    title: "",
    description: "",
    difficulty: DIFFICULTY.EASY, // Default to easy
    inputFormat: "",
    outputFormat: "",
    sampleIO: [{ input: "", output: "" }], // Initialize with one pair
    constraints: "",
    tags: "",
    score: 0,
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // New state to store modal message

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblemData({ ...problemData, [name]: value });
    setErrors({ ...errors, [name]: false }); // Clear error on change
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
    if (
      problemData.sampleIO.some((sample) => !sample.input || !sample.output)
    ) {
      newErrors.sampleIO = true;
    }
    if (!problemData.constraints) newErrors.constraints = true;
    if (!problemData.score) newErrors.score = true;
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields!");
      return;
    }
    setShowModal(true); // Show confirmation modal
  };

  // Confirm submission
  const confirmSubmit = async () => {
    const token = localStorage.getItem("UserToken");

    try {
      const response = await axiosInstance.post(
        `problems`,
        {
          ...problemData,
          tags: problemData.tags.split(",").map((tag) => tag.trim()), // Split tags by commas
          createdBy: user._id, // Attach user ID
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token if needed
          },
          withCredentials: true, // Allow cookies to be sent
        }
      );

      if (response.status === 201) {
        // Show success message in the modal
        setModalMessage("Problem created successfully!");
        setTimeout(() => {
          setShowModal(false); // Close modal after 2 seconds
          navigate("/make-problem"); // Redirect after closing the modal
        }, 2000); // 2 second delay before redirect

        setProblemData({
          title: "",
          description: "",
          difficulty: DIFFICULTY.EASY,
          inputFormat: "",
          outputFormat: "",
          sampleIO: [{ input: "", output: "" }], // Reset to one pair
          constraints: "",
          tags: "",
          score: 0,
        }); // Reset form
      }
    } catch (error) {
      setModalMessage("Failed to create problem. Please try again.");
      setTimeout(() => {
        setShowModal(false); // Close modal after 2 seconds
      }, 2000); // 2 second delay
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
      <div className="relative min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto p-[5%] bg-gray-800 text-white rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mt-10 mb-6 text-center">
            Create New Problem
          </h1>
          {/* <button
            onClick={() => navigate(-1)}
            className="mt-4 mb-4 md:mt-0 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back
          </button> */}
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
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Submit Problem
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 w-96 text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p>
              {modalMessage || "Are you sure you want to submit this problem?"}
            </p>
            {!modalMessage && (
              <div className="mt-6 flex justify-around">
                <button
                  onClick={confirmSubmit}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default CreateProblem;
