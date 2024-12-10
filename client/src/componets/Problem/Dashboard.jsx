import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import SubmissionDetails from "./SubmissionDetails";
import Header from "../Header";

const Dashboard = () => {
  const { problemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const [filters, setFilters] = useState({
    branch: "ALL",
    semester: "ALL",
    language: "ALL",
    status: "ALL",
  });

  const { problemTitle, difficulty, createdAt } = location.state || {};

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosInstance.get("/submissions/problem", {
          params: { problem_id: problemId },
        });
        setSubmissions(response.data.submissions);
        setFilteredSubmissions(response.data.submissions);
        console.log(response.data);
      } catch (err) {
        setError(
          err.response ? err.response.data.message : "Error fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedData = [...filteredSubmissions].sort((a, b) => {
      const valA =
        field === "branch" || field === "batch"
          ? a.user_id[field]?.toUpperCase()
          : a.user_id[field];
      const valB =
        field === "branch" || field === "batch"
          ? b.user_id[field]?.toUpperCase()
          : b.user_id[field];

      if (order === "asc") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });

    setFilteredSubmissions(sortedData);
  };

  const applyFilters = () => {
    let filtered = submissions;

    if (filters.branch !== "ALL") {
      filtered = filtered.filter(
        (submission) =>
          submission.user_id.branch?.toUpperCase() === filters.branch
      );
    }

    if (filters.semester !== "ALL") {
      filtered = filtered.filter((submission) => {
        const semester = submission.user_id.semester; // Extract semester
        return semester && String(semester) === String(filters.semester);
      });
    }

    if (filters.language !== "ALL") {
      filtered = filtered.filter(
        (submission) => submission.language?.toUpperCase() === filters.language
      );
    }

    if (filters.status !== "ALL") {
      filtered = filtered.filter(
        (submission) => submission.status?.toUpperCase() === filters.status
      );
    }

    setFilteredSubmissions(filtered);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // if (selectedSubmission) {
  //   return (
  //     <SubmissionDetails
  //       submission={selectedSubmission}
  //       onBack={() => setSelectedSubmission(null)}
  //     />
  //   );
  // }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="mx-auto px-5 pt-20">
        {selectedSubmission ? (
          <SubmissionDetails
            submission={selectedSubmission}
            onBack={() => setSelectedSubmission(null)}
          />
        ) : (
          <>
            {problemTitle && (
              <div className="mb-6 bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                <h3 className="text-3xl font-bold text-blue-400 mb-2">
                  {problemTitle}
                </h3>
                <div className="flex justify-between text-lg">
                  <p className="font-semibold text-gray-300">
                    Difficulty:{" "}
                    <span className="text-blue-300">{difficulty}</span>
                  </p>
                  <p className="font-semibold text-gray-300">
                    Created on:{" "}
                    <span className="text-gray-400">
                      {new Date(createdAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex justify-between">
              <div className="space-x-4">
                <select
                  value={filters.branch}
                  onChange={(e) => updateFilter("branch", e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                  <option value="ALL">All Branches</option>
                  <option value="CSPIT-IT">CSPIT-IT</option>
                  <option value="CSPIT-CSE">CSPIT-CSE</option>
                  <option value="CSPIT-CE">CSPIT-CE</option>
                </select>
                <select
                  value={filters.semester}
                  onChange={(e) => updateFilter("semester", e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                  <option value="ALL">All Semesters</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Semester {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.language}
                  onChange={(e) => updateFilter("language", e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                  <option value="ALL">All Languages</option>
                  <option value="CPP">C++</option>
                  <option value="PYTHON">Python</option>
                  <option value="JAVA">Java</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="mb-3 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full flex items-center shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
                >
                  <svg
                    className="MuiSvgIcon-root _icon_1pe2i_343"
                    style={{ width: "15px" }}
                    focusable="false"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="white"
                  >
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
                  </svg>
                </button>
              </div>
            </div>

            

            {/* Submissions Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-lg text-left text-gray-500 border-collapse border border-gray-600">
                <thead className="sticky top-0 bg-gray-900 text-gray-400 z-10">
                  <tr>
                    <th
                      className="py-3 px-6 border border-gray-600 text-lg cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      ID
                    </th>
                    <th
                      className="py-3 px-6 border border-gray-600 text-lg cursor-pointer"
                      onClick={() => handleSort("username")}
                    >
                      User Name
                    </th>
                    <th className="py-3 px-6 border border-gray-600 text-lg">
                      Branch
                    </th>
                    <th
                      className="py-3 px-6 border border-gray-600 text-lg cursor-pointer"
                      onClick={() => handleSort("batch")}
                    >
                      Batch
                    </th>
                    <th
                      className="py-3 px-6 border border-gray-600 text-lg cursor-pointer"
                      onClick={() => handleSort("semester")}
                    >
                      Semester
                    </th>
                    <th className="py-3 px-6 border border-gray-600 text-lg">
                      Language
                    </th>
                    <th className="py-3 px-6 border border-gray-600 text-lg">
                      Status
                    </th>
                    <th className="py-3 px-6 border border-gray-600 text-lg">
                      TestCasePass
                    </th>
                  </tr>
                </thead>
                <tbody>
                
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission, index) => (
                      
                      <tr
                        key={submission._id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                        } hover:text-blue-400 text-gray-300 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-95`}
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <td className="py-3 px-6 border border-gray-600">
                          {submission.user_id.id}
                        </td>
                        <td className="py-3 px-6 border border-gray-600">
                          {submission.user_id.username}
                        </td>
                        <td className="py-3 px-6 border border-gray-600">
                          {submission.user_id.branch?.toUpperCase()}
                        </td>
                        <td className="py-3 px-6 border border-gray-600">
                          {submission.user_id.batch?.toUpperCase()}
                        </td>
                        <td className="py-3 px-6 border border-gray-600">
                          {submission.user_id.semester}
                        </td>
                        <td className="py-3 px-6 border border-gray-600">
                          {submission.language}
                        </td>
                        <td
                          className={`py-3 px-6 border border-gray-600 capitalize ${
                            submission.status === "completed"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {submission.status}
                        </td>
                        <td className="py-3 px-6 border border-gray-600 capitalize">
                          {submission.numberOfTestCasePass != null &&
                          submission.numberOfTestCase != null
                            ? `${submission.numberOfTestCasePass}/${submission.numberOfTestCase}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-3 px-6 text-center text-gray-300 border border-gray-600"
                      >
                        No submissions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
