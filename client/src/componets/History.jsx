import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const user = useSelector((store) => store.app.user);

  const userId = user._id;

  const fetchSubmissions = async (page) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/submissions/user/submissions",
        {
          params: { user_id: userId, page, limit: 9 },
        }
      );
      console.log(response.data);
      setSubmissions(response.data.submissions);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
    <div className="relative min-h-screen bg-gray-900 text-white">
      <div className="mx-auto px-5 pt-20">
        <h1 className="text-2xl font-bold mb-4">Submission History</h1>

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

        {!loading && (
          <div>
            {/* Add responsive overflow behavior */}
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full text-left text-gray-500">
                <thead className="bg-gray-900 text-gray-400">
                  <tr>
                    <th className="py-3 px-4 sm:px-6 text-center border border-gray-600">
                      #
                    </th>
                    <th className="py-3 px-4 sm:px-6 text-center border border-gray-600">
                      Problem Title
                    </th>
                    <th className="py-3 px-4 sm:px-6 text-center border border-gray-600">
                      Language
                    </th>
                    <th className="py-3 px-4 sm:px-6 text-center border border-gray-600">
                      TestCases
                    </th>
                    <th className="py-3 px-4 sm:px-6 text-center border border-gray-600">
                      Status
                    </th>
                    <th className="py-3 px-4 sm:px-6 text-center border border-gray-600">
                      Submission Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length > 0 ? (
                    submissions.map((submission, index) => (
                      <tr
                        key={submission._id}
                        onClick={() => navigate("/submissions/" + submission._id)}
                        className={`${
                          index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                        } hover:text-blue-400 text-gray-300 cursor-pointer transition-all duration-300 ease-in-out transform`}
                      >
                        <td className="py-3 px-6 border border-gray-600 text-center">
                          {index + 1 + (currentPage - 1) * 10}
                        </td>
                        <td className="capitalize py-3 px-4 border border-gray-600 sm:px-6 text-white font-bold">
                          {truncateTitle(
                            submission.problem_id?.title,
                            window.innerWidth < 900 ? 25 : 50
                          )}
                        </td>
                        <td className="py-3 px-4 border border-gray-600 sm:px-6 text-center capitalize">
                          {submission.language}
                        </td>
                        <td className="py-3 px-4 sm:px-6 border border-gray-600 capitalize text-center">
                          {submission.numberOfTestCasePass != null &&
                          submission.numberOfTestCase != null
                            ? `${submission.numberOfTestCasePass}/${submission.numberOfTestCase}`
                            : "N/A"}
                        </td>
                        <td
                          className={`py-3 px-4 sm:px-6 border border-gray-600 text-center capitalize ${
                            submission.status === "completed"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {submission.status}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-center border border-gray-600 text-gray-300">
                          {formatDate(submission.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-3 px-6 text-center text-gray-400 border border-gray-600"
                      >
                        No Submission Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                Previous
              </button>
              <span className="mx-4 mt-1 text-white">{`Page ${currentPage} of ${totalPages}`}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="cursor-pointer bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
