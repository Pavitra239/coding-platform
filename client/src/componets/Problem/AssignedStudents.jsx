import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../Header";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AssignedStudents = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false); // For button-specific loading
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({
    branch: "ALL",
    semester: "ALL",
    batch: "ALL",
  });
  const [loading, setLoading] = useState(false);
  const [totalassigned, setTotalassigned] = useState(0);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 12;

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/problems/${problemId}/students`
        );
        setStudents(response.data.assignedStudents || []);
        setTotalassigned(response.data.assignedStudents.length);
      } catch (err) {
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [problemId]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to the first page when filters change
  };

  const filteredStudents = students.filter((student) => {
    const { branch, semester, batch } = filters;
    return (
      (branch === "ALL" || student.branch === branch) &&
      (semester === "ALL" || student.semester.toString() === semester) &&
      (batch === "ALL" || student.batch === batch)
    );
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setStudents(sortedStudents);
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student._id));
    }
  };

  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(
        selectedStudents.filter((studentId) => studentId !== id)
      );
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleUnassign = async () => {
    setAssignLoading(true);
    try {
      const res = await axiosInstance.post(`/problems/${problemId}/unassign-students`, {
        studentIds: selectedStudents,
      });
      setStudents(
        students.filter((student) => !selectedStudents.includes(student._id))
      );
      // console.log(res.data)
      toast.success(res.data.message);
      setSelectedStudents([]);
      setError(null);
    } catch (error) {
      toast.error(res.data.message);
      setError("Failed to unassign students. Please try again.");
    }finally {
      setAssignLoading(false); // Stop loading
    }
    
  };

  // Pagination Logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <h1 className="text-2xl font-bold mb-4 pt-20 justify-center flex items-center">
        Students Assigned to the Problem
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {assignLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <p className="text-white text-lg font-semibold">Assigning...</p>
          </div>
        </div>
      )}


      <button
        className="py-2 px-6 ml-6 bg-gradient-to-r mb-4 from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition transform duration-200"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <div className="px-4 mb-4">
        <p className="text-xl font-medium">
          Assigned Students: {totalassigned}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between items-center pl-4">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <select
            value={filters.branch}
            onChange={(e) => updateFilter("branch", e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Branches</option>
            <option value="cspit-it">CSPIT-IT</option>
            <option value="cspit-cse">CSPIT-CSE</option>
            <option value="cspit-ce">CSPIT-CE</option>
          </select>
          <select
            value={filters.semester}
            onChange={(e) => updateFilter("semester", e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Semesters</option>
            {[...Array(8)].map((_, i) => (
              <option key={`semester-${i + 1}`} value={i + 1}>
                Semester {i + 1}
              </option>
            ))}
          </select>
          <select
            value={filters.batch}
            onChange={(e) => updateFilter("batch", e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Batches</option>
            {["a", "b", "c", "d"].map((letter) =>
              [1, 2].map((num) => (
                <option key={`${letter}${num}`} value={`${letter}${num}`}>
                  {`${letter}${num}`}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="mb-4 text-gray-300 pl-4">
        <span className="font-bold">{filteredStudents.length}</span>{" "}
        {filteredStudents.length === 1 ? "student" : "students"} found.
      </div>

      {/* Students Table */}
      <div className="p-4">
        <table className="w-full border-collapse border border-gray-700  text-left text-gray-500">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="py-3 px-4 text-center">
                <button
                  onClick={handleSelectAll}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  {selectedStudents.length === currentStudents.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </th>
              <th
                className="py-3 px-4 text-center cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID
                {sortConfig.key === "id" &&
                  (sortConfig.direction === "asc" ? " ↑" : " ↓")}
              </th>
              <th
                className="py-3 px-4 text-center cursor-pointer"
                onClick={() => handleSort("username")}
              >
                Username
                {sortConfig.key === "username" &&
                  (sortConfig.direction === "asc" ? " ↑" : " ↓")}
              </th>
              <th className="py-3 px-4 text-center">Branch</th>
              <th
                className="py-3 px-4 text-center cursor-pointer"
                onClick={() => handleSort("semester")}
              >
                Semester
                {sortConfig.key === "semester" &&
                  (sortConfig.direction === "asc" ? " ↑" : " ↓")}
              </th>
              <th className="py-3 px-4 text-center">Batch</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-6 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                    <p className="mt-4 text-blue-500 text-lg font-medium">
                      Loading, please wait...
                    </p>
                  </div>
                </td>
              </tr>
            ) : currentStudents.length > 0 ? (
              currentStudents.map((student, index) => (
                <tr
                  key={student._id}
                  className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleSelectStudent(student._id)}
                    />
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {student.id?.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {student.username}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {student.branch?.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {student.semester}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {student.batch?.toUpperCase()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-3 px-4 text-center text-gray-300">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      <div className="flex justify-start ml-4 p-4">
        <button
          onClick={handleUnassign}
          disabled={selectedStudents.length === 0}
          className="bg-green-500 text-white  px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-600"
        >
          Unassign Problem
        </button>
      </div>
    </div>
  );
};

export default AssignedStudents;
