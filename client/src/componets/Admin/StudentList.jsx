import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../Header";

const StudentList = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Total pages from backend
  const studentsPerPage = 10;
  const [totalStudents, setTotalStudents] = useState(0);

  const fetchStudents = async (page) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/faculty/get-students-by-faculty",
        {
          facultyId,
          page,
          limit: studentsPerPage,
        }
      );
      if (response.data.success) {
        console.log(response.data);
        setStudents(response.data.students);
        setTotalPages(response.data.totalPages); // Ensure backend sends the total pages
        setTotalStudents(response.data.totalStudents);
      } else {
        setError(response.data.message || "Failed to fetch students.");
      }
    } catch (err) {
      setError("An error occurred while fetching students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage); // Fetch students when currentPage changes
  }, [facultyId, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="flex justify-center pt-[6%]">
        <h1 className="text-2xl font-bold mb-4">Student List</h1>
      </div>

      <button
        className="py-2 px-6 ml-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition transform duration-200"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <div className="flex items-center ml-4 text-white py-2 px-4 rounded-full shadow-lg text-lg font-semibold">
        <span>Total Number of Students Register:</span>
        <span className="ml-2 text-xl font-bold">{totalStudents}</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
            <p className="mt-4 text-blue-500 text-lg font-medium">
              Loading, please wait...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-gray-900 shadow-md rounded-lg p-4">
            <table className="min-w-full text-lg text-left text-gray-500">
              <thead className="bg-gray-900 text-gray-400">
                <tr>
                  <th className="py-3 px-6">#</th>
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Username</th>
                  <th className="py-3 px-6">Semester</th>
                  <th className="py-3 px-6">Branch</th>
                  <th className="py-3 px-6">Batch</th>
                  <th className="py-3 px-6">Create Date</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-3 px-6 text-center text-gray-400"
                    >
                      Data not available
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      }`}
                    >
                      <td className="py-3 px-6">
                        {(currentPage - 1) * studentsPerPage + index + 1}
                      </td>
                      <td className="py-3 px-6">
                        {student?.id?.toUpperCase()}
                      </td>
                      <td className="capitalize py-3 px-6">
                        {student?.username}
                      </td>
                      <td className="py-3 px-6">{student?.semester}</td>
                      <td className="py-3 px-6">
                        {student?.branch?.toUpperCase()}
                      </td>
                      <td className="py-3 px-6">
                        {student?.batch?.toUpperCase()}
                      </td>

                      <td className="py-3 px-6">
                        {formatDate(student?.createdAt)}{" "}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-300 pr-2 pl-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentList;
