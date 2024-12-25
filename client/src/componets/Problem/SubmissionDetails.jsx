import React, { useState } from "react";

const SubmissionDetails = ({ submission, onBack }) => {
  const [expandedCase, setExpandedCase] = useState(null); // Default: No case expanded

  // Helper function to safely access nested properties
  const safeAccess = (obj, path, defaultValue = "N/A") =>
    path.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue),
      obj
    );

  // Toggle visibility of a test case's details
  const toggleExpand = (index) => {
    setExpandedCase(expandedCase === index ? null : index);
  };

  return (
    <div className="bg-gray-900 min-h-screen p-4">
      {/* Back button */}
      <button
        className="mb-4 bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-500"
        onClick={onBack}
      >
        Back to Submissions
      </button>

      <h3 className="font-bold text-xl text-white mb-4">Submission Details</h3>

      {/* Test Case Overview */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <span className="text-lg font-semibold text-white">
          Test Cases: {submission?.numberOfTestCasePass || 0}/
          {submission?.numberOfTestCase || 0} Passed
        </span>
        <span
          className={`px-3 py-1 rounded text-center ${
            submission?.numberOfTestCase === submission?.numberOfTestCasePass
              ? "bg-green-600"
              : "bg-red-600"
          } text-white`}
        >
          {submission?.numberOfTestCase === submission?.numberOfTestCasePass
            ? "All Passed"
            : "Some Failed"}
        </span>
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <span className="text-white font-semibold text-lg">
          Total Marks: {submission?.totalMarks ?? "Not Available"}
        </span>
      </div>

      {/* Submission Details */}
      <div className="mb-6 p-4 sm:p-6 rounded-lg shadow-md bg-gray-800 text-gray-300 space-y-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Runtime Section */}
          <div className="flex-1 p-4 rounded-lg bg-gray-900 flex flex-col items-center text-center shadow-sm">
            <span className="text-gray-200 font-semibold mb-2">Runtime</span>
            <p className="text-2xl font-bold text-white">
              {submission?.execution_time !== undefined
                ? `${submission.execution_time.toFixed(2)} ms`
                : "N/A"}
            </p>
          </div>

          {/* Memory Section */}
          <div className="flex-1 p-4 rounded-lg bg-gray-900 flex flex-col items-center text-center shadow-sm">
            <span className="text-gray-200 font-semibold mb-2">Memory</span>
            <p className="text-2xl font-bold text-white">
              {submission?.memory_usage !== undefined
                ? `${submission.memory_usage.toFixed(2)} MB`
                : "N/A"}
            </p>
          </div>
        </div>

        <p className="text-lg">
          <strong>Language:</strong> {submission?.language || "N/A"}
        </p>

        {/* Code Block */}
        <div className="p-4 rounded-lg bg-gray-900 shadow-inner border border-gray-700 overflow-auto">
          <p className="mb-2">
            <strong>Code:</strong>
          </p>
          <pre className="text-gray-100 font-mono bg-gray-900 p-4 rounded-md overflow-x-auto text-sm sm:text-base">
            {submission?.code || "No code available"}
          </pre>
        </div>
      </div>

      {/* Test Case Details */}
      <div className="mt-4">
        <h4 className="text-lg font-bold text-white mb-4">Test Cases</h4>
        {Array.isArray(submission?.testCaseResults) &&
        submission.testCaseResults.length > 0 ? (
          submission.testCaseResults.map((testCase, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4">
              {/* Test Case Summary */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                <p className="text-lg font-semibold text-gray-300">
                  Case {index + 1} -{" "}
                  <span
                    className={
                      testCase?.passed ? "text-green-500" : "text-red-500"
                    }
                  >
                    {testCase?.passed ? "✓ Passed" : "✗ Failed"}
                  </span>
                </p>
                <button className="text-blue-400 hover:underline">
                  {expandedCase === index ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {/* Test Case Details (Visible when expanded) */}
              {expandedCase === index && (
                <div className="mt-3 space-y-4">
                  {/* Input */}
                  <div>
                    <p className="text-gray-400 mb-1">
                      <strong>Input:</strong>
                    </p>
                    <pre className="bg-gray-900 p-3 rounded text-white text-sm sm:text-base">
                      {safeAccess(testCase, ["inputs"], []).map(
                        (input, idx) => (
                          <div key={idx}>{input?.value || "N/A"}</div>
                        )
                      )}
                    </pre>
                  </div>

                  {/* Output */}
                  <div>
                    <p className="text-gray-400 mb-1">
                      <strong>Output:</strong>
                    </p>
                    <pre className="bg-gray-900 p-3 rounded text-white text-sm sm:text-base">
                      {testCase?.output ? testCase.output.join("\n") : "N/A"}
                    </pre>
                  </div>

                  {/* Expected Output */}
                  <div>
                    <p className="text-gray-400 mb-1">
                      <strong>Expected Output:</strong>
                    </p>
                    <pre className="bg-gray-900 p-3 rounded text-white text-sm sm:text-base">
                      {safeAccess(testCase, ["expectedOutputs"], []).map(
                        (output, idx) => (
                          <div key={idx}>{output?.value || "N/A"}</div>
                        )
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400">No test cases available.</p>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetails;
