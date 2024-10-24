import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Header from "../Header";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance"; // Custom axios instance for API calls
import ConfirmationModal from "../ConfirmationModal"; // Import the modal component

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
    testCases: [
      {
        inputs: [""],
        inputTypes: ["string"],
        outputs: [""],
        outputTypes: ["string"],
      },
    ],
  });

  const [isEditing, setIsEditing] = useState(false); // Check if we're in edit mode
  const [errors, setErrors] = useState({});
  const [isModalOpenInternal, setIsModalOpenInternal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Fetch problem if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchProblem = async () => {
        const token = localStorage.getItem("UserToken");
        try {
          const response = await axiosInstance.get(`/problems/${id}`);
          const fetchedData = response.data;
          console.log(fetchedData);

          // Map fetched data to internal state structure
          setProblemData({
            title: fetchedData.title,
            description: fetchedData.description,
            difficulty: fetchedData.difficulty || DIFFICULTY.EASY,
            inputFormat: fetchedData.inputFormat,
            outputFormat: fetchedData.outputFormat,
            sampleIO: fetchedData.sampleIO || [{ input: "", output: "" }],
            constraints: fetchedData.constraints,
            tags: fetchedData.tags,
            score: fetchedData.score || 0,
            testCases: fetchedData.testCases.map((testCase) => ({
              inputs: testCase.inputs.map((input) => input.value), // Extracting only values
              inputTypes: testCase.inputs.map((input) => input.type), // Extracting types directly
              outputs: testCase.outputs.map((output) => output.value), // Extracting only values
              outputTypes: testCase.outputs.map((output) => output.type), // Extracting types directly
            })),
          });
        } catch (error) {
          toast.error("Failed to load problem data");
          console.error(error);
        }
      };
      fetchProblem();
    } else {
      setIsEditing(false);
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
    if (
      problemData.sampleIO.some((sample) => !sample.input || !sample.output)
    ) {
      newErrors.sampleIO = true;
    }

    if (!problemData.constraints) newErrors.constraints = true;
    if (!problemData.tags) newErrors.tags = true;
    if (!problemData.score) newErrors.score = true;
    return newErrors;
  };

  // Handle dynamic test cases change
  const handleTestCaseChange = (index, type, value, fieldIndex, inputType) => {
    const updatedTestCases = [...problemData.testCases];

    if (type === "input") {
      if (inputType === "int") {
        // Allow float values for integer type inputs
        const parsedValue = parseFloat(value);
        updatedTestCases[index].inputs[fieldIndex] = isNaN(parsedValue)
          ? ""
          : parsedValue;
      } else {
        // Store as a string if the type is not "int"
        updatedTestCases[index].inputs[fieldIndex] = value;
      }
    } else {
      if (inputType === "int") {
        const parsedValue = parseFloat(value);
        updatedTestCases[index].outputs[fieldIndex] = isNaN(parsedValue)
          ? ""
          : parsedValue;
      } else {
        updatedTestCases[index].outputs[fieldIndex] = value;
      }
    }

    setProblemData({ ...problemData, testCases: updatedTestCases });
  };

  const addTestCase = () => {
    setProblemData({
      ...problemData,
      testCases: [...problemData.testCases, { inputs: [], outputs: [] }],
    });
  };

  const removeTestCase = (index) => {
    const newTestCases = problemData.testCases.filter((_, i) => i !== index);
    setProblemData({ ...problemData, testCases: newTestCases });
  };

  const renderTestCases = () => {
    return problemData.testCases.map((testCase, index) => (
      <div
        key={index}
        className="relative p-6 mb-8 bg-gray-900 rounded-lg shadow-lg border border-gray-600"
      >
        <div className="flex justify-between items-center mb-4">
          <label className="text-xl font-semibold text-white">
            Test Case {index + 1}
          </label>
          <button
            type="button"
            onClick={() => removeTestCase(index)}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
          >
            Remove Test Case
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-white mb-2">
              Inputs
            </label>
            {testCase.inputs.map((input, inputIndex) => (
              <div
                key={inputIndex}
                className="flex items-center space-x-3 mb-3"
              >
                <select
                  onChange={(e) => {
                    const inputType = e.target.value;
                    const updatedTestCases = [...problemData.testCases];

                    // If the input type has changed, reset the input value
                    if (
                      updatedTestCases[index].inputTypes[inputIndex] !==
                      inputType
                    ) {
                      updatedTestCases[index].inputs[inputIndex] = ""; // Clear the input value
                    }

                    updatedTestCases[index].inputTypes[inputIndex] = inputType;
                    setProblemData({
                      ...problemData,
                      testCases: updatedTestCases,
                    });
                  }}
                  value={testCase.inputTypes[inputIndex]}
                  className="w-1/4 p-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="string">String</option>
                  <option value="int">Integer</option>
                </select>

                <input
                  type={
                    testCase.inputTypes[inputIndex] === "int"
                      ? "number"
                      : "text"
                  }
                  step={
                    testCase.inputTypes[inputIndex] === "int"
                      ? "any"
                      : undefined
                  }
                  value={input}
                  onChange={(e) =>
                    handleTestCaseChange(
                      index,
                      "input",
                      e.target.value,
                      inputIndex,
                      testCase.inputTypes[inputIndex]
                    )
                  }
                  className="w-2/3 p-3 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter input ${inputIndex + 1}`}
                />

                <button
                  type="button"
                  onClick={() => removeInputField(index, inputIndex)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <div
              onClick={() => addInputField(index)}
              className="text-blue-400 cursor-pointer hover:text-blue-500 transition-colors"
            >
              + Add Input
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-white mb-2">
              Outputs
            </label>
            {testCase.outputs.map((output, outputIndex) => (
              <div
                key={outputIndex}
                className="flex items-center space-x-3 mb-3"
              >
                <select
                  onChange={(e) => {
                    const outputType = e.target.value;
                    const updatedTestCases = [...problemData.testCases];

                    // If the output type has changed, reset the output value
                    if (
                      updatedTestCases[index].outputTypes[outputIndex] !==
                      outputType
                    ) {
                      updatedTestCases[index].outputs[outputIndex] = ""; // Clear the output value
                    }

                    updatedTestCases[index].outputTypes[
                      outputIndex
                    ] = outputType;
                    setProblemData({
                      ...problemData,
                      testCases: updatedTestCases,
                    });
                  }}
                  value={testCase.outputTypes[outputIndex]}
                  className="w-1/4 p-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="string">String</option>
                  <option value="int">Integer</option>
                </select>

                <input
                  type={
                    testCase.outputTypes[outputIndex] === "int"
                      ? "number"
                      : "text"
                  }
                  step={
                    testCase.outputTypes[outputIndex] === "int"
                      ? "any"
                      : undefined
                  }
                  value={output}
                  onChange={(e) =>
                    handleTestCaseChange(
                      index,
                      "output",
                      e.target.value,
                      outputIndex,
                      testCase.outputTypes[outputIndex]
                    )
                  }
                  className="w-2/3 p-3 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter output ${outputIndex + 1}`}
                />

                <button
                  type="button"
                  onClick={() => removeOutputField(index, outputIndex)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <div
              onClick={() => addOutputField(index)}
              className="text-blue-400 cursor-pointer hover:text-blue-500 transition-colors"
            >
              + Add Output
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const removeInputField = (testCaseIndex, inputIndex) => {
    const updatedTestCases = [...problemData.testCases];
    updatedTestCases[testCaseIndex].inputs.splice(inputIndex, 1); // Remove the input field
    setProblemData({ ...problemData, testCases: updatedTestCases });
  };

  const removeOutputField = (testCaseIndex, outputIndex) => {
    const updatedTestCases = [...problemData.testCases];
    updatedTestCases[testCaseIndex].outputs.splice(outputIndex, 1); // Remove the output field
    setProblemData({ ...problemData, testCases: updatedTestCases });
  };

  // Function to add an input field
  const addInputField = (testCaseIndex) => {
    const updatedTestCases = [...problemData.testCases];

    // Ensure the inputs array exists and is initialized
    if (!updatedTestCases[testCaseIndex].inputs) {
      updatedTestCases[testCaseIndex].inputs = [];
    }

    // Ensure the inputTypes array exists and is initialized
    if (!updatedTestCases[testCaseIndex].inputTypes) {
      updatedTestCases[testCaseIndex].inputTypes = [];
    }

    // Push a default empty string for input and a default 'string' type
    updatedTestCases[testCaseIndex].inputs.push("");
    updatedTestCases[testCaseIndex].inputTypes.push("string");

    setProblemData({ ...problemData, testCases: updatedTestCases });
  };

  // Function to add an output field
  const addOutputField = (testCaseIndex) => {
    const updatedTestCases = [...problemData.testCases];

    // Ensure the outputs array exists and is initialized
    if (!updatedTestCases[testCaseIndex].outputs) {
      updatedTestCases[testCaseIndex].outputs = [];
    }

    // Ensure the outputTypes array exists and is initialized
    if (!updatedTestCases[testCaseIndex].outputTypes) {
      updatedTestCases[testCaseIndex].outputTypes = [];
    }

    // Push a default empty string for output and a default 'string' type
    updatedTestCases[testCaseIndex].outputs.push("");
    updatedTestCases[testCaseIndex].outputTypes.push("string");

    setProblemData({ ...problemData, testCases: updatedTestCases });
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
    const actionType = isEditing ? "edit" : "create";
    const apiMethod =
      actionType === "edit" ? axiosInstance.put : axiosInstance.post;
    const apiEndpoint = actionType === "edit" ? `/problems/${id}` : "/problems";

    // Only split and update tags if the user has made changes to the tags field
    const tags =
      typeof problemData.tags === "string" && problemData.tags.trim() !== ""
        ? problemData.tags.split(",").map((tag) => tag.trim())
        : problemData.tags; // Keep the original tags if unchanged

    try {
      console.log(problemData);
      const response = await apiMethod(apiEndpoint, {
        ...problemData,
        tags, // Use the processed tags
        createdBy: user._id,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          actionType === "edit"
            ? "Problem updated successfully!"
            : "Problem created successfully!"
        );
        setTimeout(() => {
          setIsModalOpenInternal(false);
          navigate("/make-problem");
        }, 100); // Redirect after 1 second
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
    toast.success("Back to the previous page");
    navigate(-1); // Go back to the previous page
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal without navigating
  };

  return (
    <>
      <div className="relative min-h-screen bg-gray-900 text-white">
        <Header />

        <div className="mx-auto p-[5%] bg-gray-900 text-white rounded-lg shadow-lg">
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
                className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500  ${
                  errors.title ? "border-red-500" : "border-gray-700"
                }`}
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
                className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500  ${
                  errors.description ? "border-red-500" : "border-gray-700"
                } `}
                placeholder="Describe the problem"
                rows="6"
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
                className="w-full p-4  bg-gray-800 border border-gray-700 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 "
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
                className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500  ${
                  errors.inputFormat ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="Specify the input format"
                rows={4}
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
                className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500  ${
                  errors.outputFormat ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Specify the output format"
                rows={4}
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
                    className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500  ${
                      errors.sampleIO ? "border-red-500" : "border-gray-700"
                    }`}
                    rows={3}
                  />
                  <textarea
                    type="text"
                    name="output"
                    value={sample.output}
                    onChange={(e) => handleSampleChange(index, e)}
                    placeholder="Sample Output"
                    className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500  ${
                      errors.sampleIO ? "border-red-500" : "border-gray-700"
                    }`}
                    rows={3}
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
                className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500  ${
                  errors.constraints ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="Specify the problem constraints"
                rows={4}
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
                className={`w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500  ${
                  errors.tags ? "border-red-500" : "border-gray-700"
                }
                `}
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
                className="w-full p-4  bg-gray-800 border border-gray-700 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 "
                placeholder="Score for the problem"
                min={0}
              />
            </div>

            <div>
              {renderTestCases()}
              <button
                type="button"
                onClick={addTestCase}
                className="text-blue-500 mt-2 mb-2"
              >
                + Add More Test Case
              </button>

              <div className="bg-gray-100 border border-gray-300 rounded-md p-4 my-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Important Note:
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  As an admin, when you create a problem, please ensure that the
                  input and output examples are accurate. These examples are
                  crucial for testing the submitted code to determine its
                  correctness.
                </p>
              </div>
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
    </>
  );
};

export default ProblemForm;
