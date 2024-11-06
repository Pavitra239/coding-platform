import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { FaClock, FaMemory } from "react-icons/fa";
import Modal from "./Modal"; // Assume a Modal component for displaying submission details

const Submission = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);  // Loading state
  const user = useSelector((state) => state.app.user);
  const userId = user._id;

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);  // Set loading to true when the fetch starts
        const response = await axiosInstance.get("/submissions", {
          params: {
            user_id: userId,
            problem_id: problemId,
          },
        });
        // Sort submissions by createdAt (latest first)
        const sortedSubmissions = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setSubmissions(sortedSubmissions);
        setLoading(false);  // Set loading to false once the data is fetched
      } catch (error) {
        setError("Failed to load submissions. Please try again.");
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId, problemId]);

  const handleRowClick = (submission) => {
    setSelectedSubmission(submission); // Open modal with selected submission data
  };

  const closeModal = () => {
    setSelectedSubmission(null); // Close modal
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h3 className="font-bold text-xl text-white mb-2">Submissions</h3>
      <p className="text-gray-400 mb-4">
        Here, you can view your previous submissions for this problem.
      </p>
      {error && <p className="text-red-500">{error}</p>}

      {/* Show loading spinner when data is being fetched */}
      {loading ? (
        <div className="flex justify-center items-center my-4">
          <div className="spinner-border animate-spin border-t-4 border-blue-600 border-solid rounded-full w-12 h-12"></div>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          {submissions.length > 0 ? (
            <table
              className="min-w-full text-gray-200 border-separate"
              style={{ borderSpacing: "0 15px" }}
            >
              <thead>
                <tr className="bg-gray-700 text-gray-300 uppercase text-sm">
                  <th className="px-4 py-3 rounded-l-lg">Status</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3 flex items-center justify-center">
                    <FaClock className="mr-1" /> Runtime
                  </th>
                  <th className="px-4 py-3">Memory</th>
                  <th className="px-4 py-3 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission._id}
                    onClick={() => handleRowClick(submission)}
                    className="transition duration-200 ease-in-out hover:bg-gray-900 rounded-lg hover:cursor-pointer"
                  >
                    <td className="px-4 py-2 font-semibold text-center capitalize">
                      <span
                        className={`px-2 py-1 rounded ${
                          submission.status === "completed"
                            ? "bg-green-600 text-green-200"
                            : "bg-red-600 text-red-200"
                        }`}
                      >
                        {submission.status === "completed" ? "Accepted" : "Rejected"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center capitalize">
                      {submission.language}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {submission.execution_time
                        ? `${submission.execution_time.toFixed(2)} ms`
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {submission.memory_usage
                        ? `${submission.memory_usage.toFixed(2)} MB`
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-center">
                      {submission.createdAt
                        ? new Date(submission.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "Invalid Date"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-center mt-4">
              No submissions found.
            </p>
          )}
        </div>
      )}

      {/* Modal for submission details */}
      {selectedSubmission && (
        <Modal onClose={closeModal}>
          <div className="p-6 bg-gray-900 rounded-lg">
            <h3 className="font-bold text-lg text-white mb-4">Submission Details</h3>
            <p className="text-gray-300 mb-2">
              <strong>Status:</strong> {selectedSubmission.status}
            </p>
            <p className="text-gray-300 mb-2">
              <strong>Language:</strong> {selectedSubmission.language}
            </p>
            <p className="text-gray-300 mb-2">
              <strong>Execution Time:</strong> {selectedSubmission.execution_time
                ? `${selectedSubmission.execution_time.toFixed(2)} ms`
                : "N/A"}
            </p>
            <p className="text-gray-300 mb-2">
              <strong>Memory Usage:</strong> {selectedSubmission.memory_usage
                ? `${selectedSubmission.memory_usage.toFixed(2)} MB`
                : "N/A"}
            </p>
            <p className="text-gray-300 mb-2">
              <strong>Test Cases Passed:</strong> {selectedSubmission.test_cases_passed || "N/A"}
            </p>
            <p className="text-gray-300 mb-2">
              <strong>Code:</strong>
              <pre className="bg-gray-800 p-3 rounded mt-2 text-white">
                {selectedSubmission.code || "No code available"}
              </pre>
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Submission;
