import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import SubmissionDetails from "./Problem/SubmissionDetails";

const SubmissionPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((store) => store.app.user);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const navigate = useNavigate();

  const userId = user?._id; // Ensure user exists

  // Fetch submissions
  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const response = await axiosInstance.get(
        "/submissions/user/submissions",
        {
          params: {page: 1, limit: 7 }, // Fetch up to 7 submissions
        }
      );
      setSubmissions(response.data.submissions);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while fetching submissions."
      );
      setSubmissions([]); // Clear outdated submissions
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (userId) fetchSubmissions();
  }, [userId]);

  const handleViewMore = () => {
    navigate("/history");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const truncateTitle = (title, maxLength) => {
    return title && title.length > maxLength
      ? `${title.slice(0, maxLength)}...`
      : title || "Untitled";
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Submission History</h2>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
              <p className="mt-4 text-blue-500 text-lg font-medium">
                Loading, please wait...
              </p>
            </div>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && submissions.length === 0 && (
          <p>No submissions found.</p>
        )}
        <ul className="space-y-2">
          {!loading &&
            submissions.map((submission) => (
              <li
                key={submission._id}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center cursor-pointer"
                onClick={() => navigate("/submissions/" + submission._id)}
                // onClick={() => setSelectedSubmission(submission)}
              >
                <span className="text-lg font-medium">
                  {truncateTitle(submission.problem_id?.title, 50)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(submission.createdAt)}
                </span>
              </li>
            ))}
        </ul>

        {!loading && submissions.length > 0 && (
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={handleViewMore}
            >
              View More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionPage;
