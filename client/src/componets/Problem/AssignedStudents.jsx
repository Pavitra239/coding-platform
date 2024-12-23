import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../Header";

const AssignedStudents = () => {
  const { problemId } = useParams();

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axiosInstance.get(
          `/problems/${problemId}/students`
        );
        setStudents(response.data.assignedStudents || []);
      } catch (err) {
        setError("Failed to load students");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchStudents();
  }, [problemId]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedStudents = [...students].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setStudents(sortedStudents);
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((student) => student._id));
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
    try {
      const response = await axiosInstance.post(
        `/problems/${problemId}/unassign-students`,
        { studentIds: selectedStudents }
      );
      setStudents(
        students.filter((student) => !selectedStudents.includes(student._id))
      );
      setSelectedStudents([]);
      setError(null);
    } catch (error) {
      setError("Failed to unassign students. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <h1 className="text-2xl font-bold mb-4 pt-20">Assign Problem</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="p-4">
      <table className="w-full border-collapse  border border-gray-700 text-sm sm:text-lg text-left text-gray-500">
        <thead className="bg-gray-900 text-gray-400">
          <tr>
            <th className="py-3 px-4 text-center">
              <button
                onClick={handleSelectAll}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                {selectedStudents.length === students.length
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
          ) : students.length > 0 ? (
            students.map((student, index) => (
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

      <div className="mt-4 mr-4 flex justify-end">
        <button
          onClick={handleUnassign}
          disabled={selectedStudents.length === 0}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-600"
        >
          Unassign Problem
        </button>
      </div>
    </div>
  );
};

export default AssignedStudents;
