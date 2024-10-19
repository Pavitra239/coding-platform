import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ language, setLanguage, code, setCode, problem }) => {
  const [results, setResults] = useState(null);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use a ref to hold the previous language for restoration
  const previousLanguageRef = React.useRef(language);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("autosavedCode", code);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [code]);

  useEffect(() => {
    const savedCode = localStorage.getItem("autosavedCode");
    if (savedCode) {
      setCode(savedCode);
    }
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    // Save the current code
    localStorage.setItem(`autosavedCode_${language}`, code);
    // Restore the code if it exists for the new language
    const savedCode = localStorage.getItem(`autosavedCode_${newLanguage}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(""); // Reset code if no previous code exists
    }
    previousLanguageRef.current = newLanguage;
    setLanguage(newLanguage);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitLoading(true);
    setResults(null);
    setError(null);
    try {
      const response = await axiosInstance.post("/compile", {
        code,
        testCases: problem.testCases,
        language,
      });
      setResults(response.data.testResults);
    } catch (error) {
      setError(error.response?.data?.details || "Failed to submit code. Please try again.");
    } finally {
      setIsLoading(false);
      setSubmitLoading(false);
    }
  };

  const handleRun = async () => {
    setIsLoading(true);
    setRunLoading(true);
    setResults(null);
    setError(null);
    try {
      const response = await axiosInstance.post("/compile", {
        code,
        testCases: [problem.testCases[0]],
        language,
      });
      setResults(response.data.testResults);
    } catch (error) {
      setError(error.response?.data?.details || "Failed to run code. Please try again.");
    } finally {
      setIsLoading(false);
      setRunLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div className="code-editor bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4 mt-10">
        <span className="text-lg font-semibold text-white"></span>
        <span className="bg-blue-500 px-3 text-white py-2 rounded-lg shadow-md">
          Score: {problem.score}
        </span>
      </div>

      <div className="mb-4">
        <label htmlFor="language" className="block text-sm font-medium text-gray-300">
          Select Language:
        </label>
        <select
          id="language"
          className="w-full mt-1 p-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)} // Use the updated language change handler
        >
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      {/* Monaco Editor with fixed height */}
      <Editor
        height="400px"
        defaultLanguage={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />

      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleRun}
          disabled={isLoading || runLoading || submitLoading}
          className={`px-4 py-2 rounded-lg shadow-md text-white transition-all duration-200 ${
            runLoading ? "bg-gray-500" : "bg-yellow-500 hover:bg-yellow-400"
          }`}
        >
          {runLoading ? "Running..." : "Run"}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isLoading || submitLoading || runLoading}
          className={`px-4 py-2 rounded-lg shadow-md text-white transition-all duration-200 ${
            submitLoading ? "bg-gray-500" : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {submitLoading ? "Submitting..." : "Submit Code"}
        </button>
      </div>

      {/* Error Handling Section */}
      {error && (
        <div className="mt-4 p-4 bg-red-800 text-red-200 rounded-lg shadow-lg max-w-full overflow-auto">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Section */}
      {results && !error && (
        <div className="mt-6">
          <div className="flex space-x-4">
            {results.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestCaseIndex(index)}
                className={`px-3 py-2 rounded-lg shadow-md transition-all duration-200 ${
                  activeTestCaseIndex === index
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Case {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 bg-gray-800 p-4 rounded-lg shadow-lg text-gray-300">
            <h3
              className={`text-lg font-semibold ${
                results[activeTestCaseIndex].passed ? "text-green-400" : "text-red-400"
              }`}
            >
              {results[activeTestCaseIndex].passed ? "Accepted" : "Failed"}
            </h3>
            <div className="mt-2 flex flex-col">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Input</h4>
                <div className="p-3 bg-gray-900 rounded-lg overflow-auto mb-2">
                  {JSON.stringify(results[activeTestCaseIndex].input)}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Output</h4>
                <div className="p-3 bg-gray-900 rounded-lg overflow-auto">
                  {results[activeTestCaseIndex].output || "Error"}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Expected</h4>
              <div className="p-3 bg-gray-900 rounded-lg overflow-auto">
                {results[activeTestCaseIndex].expectedOutput}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
