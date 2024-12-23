import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import StudentTable from "./StudentTable";

const AssignProblem = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [totalUnassigned, setTotalUnassigned] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    branch: "ALL",
    semester: "ALL",
    batch: "ALL",
  });
  const [error, setError] = useState("");

  // Fetch unassigned students
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

  // Filtered users based on filters
  const filteredUsers = unassignedStudents.filter((student) => {
    const { branch, semester, batch } = filters;
    return (
      (branch === "ALL" || student.branch === branch) &&
      (semester === "ALL" || student.semester === semester) &&
      (batch === "ALL" || student.batch === batch)
    );
  });

  // Handle individual student selection
  const handleSelectStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  // Handle select all for filtered users
  const handleSelectAll = () => {
    setSelectedStudents(
      selectedStudents.length === filteredUsers.length
        ? [] // Deselect all
        : filteredUsers.map((student) => student._id) // Select filtered users
    );
  };

  // Handle assigning students
  const handleAssign = async () => {
    try {
      await axiosInstance.post(`/problems/${problemId}/assign`, {
        studentIds: selectedStudents,
      });
      toast.success("Problem assigned successfully!");
      fetchUnassignedStudents();
      setSelectedStudents([]); // Clear selection after assigning
    } catch (err) {
      console.error("Error assigning problem:", err);
      toast.error("Failed to assign problem. Please try again.");
    }
  };

  // Update filter values
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-blue-500 text-lg font-medium">
            Loading, please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="pt-20 ml-4">
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

      <StudentTable
        users={filteredUsers}
        selectedStudents={selectedStudents}
        handleSelectStudent={handleSelectStudent}
        handleSelectAll={handleSelectAll}
        handleAssign={handleAssign}
        filters={filters}
        updateFilter={updateFilter}
      />
    </div>
  );
};

export default AssignProblem;
