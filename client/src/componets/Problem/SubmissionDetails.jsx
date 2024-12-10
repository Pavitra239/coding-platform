import React, { useState } from "react";

const SubmissionDetails = ({ submission, onBack }) => {
  console.log(submission);
  const [expandedCase, setExpandedCase] = useState(0); // Default: Show details of the first test case

  // Count the number of passed test cases
  // const passedCount = submission?.testCaseResults
  //   ? submission.testCaseResults.filter((test) => test.passed).length
  //   : 0;
  // const totalTests = submission?.testCaseResults
  //   ? submission.testCaseResults.length
  //   : 0;

  // Toggle visibility of a test case's details
  const toggleExpand = (index) => {
    setExpandedCase(expandedCase === index ? null : index);
  };

  return (
    <div className="bg-gray-900 min-h-screen p-2">
      {/* Back button */}
      <button
        className="mb-4 bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-500"
        onClick={onBack}
      >
        Back to Submissions
      </button>

      <h3 className="font-bold text-xl text-white mb-4">Submission Details</h3>

      {/* Test Case Overview */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg flex justify-between items-center">
        <span className="text-lg font-semibold text-white">
          Test Cases: {submission.numberOfTestCasePass}/{submission.numberOfTestCase} Passed
        </span>
        <span
          className={`px-3 py-1 rounded ${
            submission.numberOfTestCase === submission.numberOfTestCasePass ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {submission.numberOfTestCase === submission.numberOfTestCasePass ? "All Passed" : "Some Failed"}
        </span>
      </div>

      {/* Submission Details */}
      <div className="mb-6 p-6 rounded-lg shadow-md bg-gray-800 text-gray-300">
        {/* Language */}
        {/* Execution Time and Memory Usage */}
        <div className="flex space-x-4 p-4 rounded-lg bg-gray-800 text-gray-300 shadow-lg">
          {/* Runtime Section */}
          <div className="flex-1 p-4 rounded-lg bg-gray-900 flex flex-col items-center text-center shadow-sm">
            <div className="flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 112-0v-1a1 1 0 10-2 0v1zm0-5a1 1 0 10-2 0v3a1 1 0 002 0V8z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-200 font-semibold">Runtime</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {submission?.execution_time
                ? `${submission.execution_time.toFixed(2)} ms`
                : "N/A"}
            </p>
          </div>

          {/* Memory Section */}
          <div className="flex-1 p-4 rounded-lg bg-gray-900 flex flex-col items-center text-center shadow-sm">
            <div className="flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a7 7 0 00-7 7v2a7 7 0 007 7h2a7 7 0 007-7V9a7 7 0 00-7-7H9zM9 16v-4h2v4H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-200 font-semibold">Memory</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {submission?.memory_usage
                ? `${submission.memory_usage.toFixed(2)} MB`
                : "N/A"}
            </p>
          </div>
        </div>

        <p className="mb-4 text-lg flex items-center mt-5">
          <strong className="mr-2">Language:</strong>
          <span>{submission?.language || "N/A"}</span>
        </p>
        {/* Code Block */}
        <div className="mt-6 p-4 rounded-lg bg-gray-900 shadow-inner border border-gray-700 overflow-auto">
          <p className="mb-2">
            <strong>Code:</strong>
          </p>
          <pre className="text-gray-100 font-mono bg-gray-900 p-4 rounded-md overflow-x-auto">
            {submission?.code || "No code available"}
          </pre>
        </div>
      </div>

      {/* Test Case Details */}
      <div className="mt-4">
        <h4 className="text-lg font-bold text-white mb-4">Test Cases</h4>
        {submission?.testCaseResults &&
        submission.testCaseResults.length > 0 ? (
          <div>
            {submission.testCaseResults.map((testCase, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4">
                {/* Test Case Summary */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <p className="text-lg font-semibold text-gray-300">
                    Case {index + 1} -{" "}
                    <span
                      className={`text-${
                        testCase.passed ? "green" : "red"
                      }-500`}
                    >
                      {testCase.passed ? "✓ Passed" : "✗ Failed"}
                    </span>
                  </p>
                  <button className="text-blue-400 hover:underline">
                    {expandedCase === index ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {/* Test Case Details (Visible when expanded) */}
                {expandedCase === index && (
                  <div className="mt-3">
                    {/* Input */}
                    <div className="mb-2">
                      <p className="text-gray-400 mb-1">
                        <strong>Input:</strong>
                      </p>
                      <pre className="bg-gray-900 p-3 rounded text-white">
                        {testCase?.inputs?.map((input, idx) => (
                          <div key={idx}>{input?.value || "N/A"}</div>
                        ))}
                      </pre>
                    </div>

                    {/* Output */}
                    <div className="mb-2">
                      <p className="text-gray-400 mb-1">
                        <strong>Output:</strong>
                      </p>
                      <pre className="bg-gray-900 p-3 rounded text-white">
                        {testCase?.output ? testCase.output.join("\n") : "N/A"}
                      </pre>
                    </div>

                    {/* Expected Output */}
                    <div className="mb-2">
                      <p className="text-gray-400 mb-1">
                        <strong>Expected Output:</strong>
                      </p>
                      <pre className="bg-gray-900 p-3 rounded text-white">
                        {testCase?.expectedOutputs?.map((output, idx) => (
                          <div key={idx}>{output?.value || "N/A"}</div>
                        ))}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No test cases available.</p>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetails;
