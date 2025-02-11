import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import StudentTable from "./StudentTable";

const AssignProblem = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false); // For button-specific loading
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [totalUnassigned, setTotalUnassigned] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    branch: "ALL",
    semester: "ALL",
    batch: "ALL",
  });
  const [error, setError] = useState("");

  const fetchUnassignedStudents = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/problems/${problemId}/unassignStudent`
      );
      setUnassignedStudents(response.data.unassignedStudents);
      setTotalUnassigned(response.data.unassignedStudents.length);
    } catch (err) {
      toast.error("Failed to fetch unassigned students. Please try again.");
      console.error("Error fetching unassigned students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassignedStudents();
  }, [problemId]);

  const filteredUsers = unassignedStudents.filter((student) => {
    const { branch, semester, batch } = filters;
    return (
      (branch === "ALL" || student.branch === branch) &&
      (semester === "ALL" || student.semester === semester) &&
      (batch === "ALL" || student.batch === batch)
    );
  });

  const handleSelectStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(
      selectedStudents.length === filteredUsers.length
        ? [] // Deselect all
        : filteredUsers.map((student) => student._id) // Select filtered users
    );
  };

  const handleAssign = async () => {
    setAssignLoading(true); // Start loading
    try {
      const res = await axiosInstance.post(`/problems/${problemId}/assign`, {
        studentIds: selectedStudents,
      });
      toast.success(res.data.message);
      // console.log(res.data)
      fetchUnassignedStudents();
      setSelectedStudents([]); // Clear selection after assigning
    } catch (err) {
      console.error("Error assigning problem:", err);
      toast.error("Error assigning problem");
    } finally {
      setAssignLoading(false); // Stop loading
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <div className="pt-20 ml-4">
        <h1 className="text-2xl font-bold mb-4 justify-center flex items-center">
          Students Unassigned to the Problem
        </h1>

        <button
          onClick={() => navigate(`/assignedStudents/${problemId}`)}
          className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition mb-4"
        >
          View Assigned Students
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 mb-4 bg-red-700 text-white rounded">
          {error}
        </div>
      )}

      <div className="px-4 mb-4">
        <p className="text-xl font-medium">
          Unassigned Students: {totalUnassigned}
        </p>
      </div>

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

      <StudentTable
        users={filteredUsers}
        selectedStudents={selectedStudents}
        handleSelectStudent={handleSelectStudent}
        handleSelectAll={handleSelectAll}
        handleAssign={handleAssign}
        filters={filters}
        updateFilter={updateFilter}
        loading={loading}
      />
    </div>
  );
};

export default AssignProblem;
