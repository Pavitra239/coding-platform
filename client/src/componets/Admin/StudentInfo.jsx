import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import axiosInstance from "../../utils/axiosInstance";

const StudentInfo = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [branchWiseCount, setBranchWiseCount] = useState([]);
  const [semesterWiseCount, setSemesterWiseCount] = useState({});
  const [error, setError] = useState("");

  const handleAssignStudentsNavigation = () => {
    navigate(`/assignedStudents/${problemId}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/problems/getStudents");
        setUsers(response.data.students);
        setTotalStudents(response.data.totalStudents);
        setBranchWiseCount(response.data.branchWiseCount);
        setSemesterWiseCount(response.data.semesterBranchBatchWiseCount);
      } catch (err) {
        setError("Failed to fetch student data. Please try again later.");
        console.error("Error fetching sorted users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleSelectStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((studentId) => studentId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === users.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(users.map((user) => user.id));
    }
  };

  const handleAssign = async () => {
    try {
      const response = await axiosInstance.post(
        `/problems/${problemId}/assign`,
        { studentIds: selectedStudents }
      );
      console.log("Assignment successful:", response.data);
      alert("Problem assigned successfully!");
    } catch (error) {
      console.error("Error assigning problem:", error);
      alert("Failed to assign problem.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
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
          onClick={handleAssignStudentsNavigation}
          className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition w-full sm:w-auto mb-4"
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
        <p className="text-xl font-medium">Total Students: {totalStudents}</p>
        <BranchWiseCount branches={branchWiseCount} />
        <SemesterWiseCount semesters={semesterWiseCount} />
      </div>

      <StudentTable
        users={users}
        selectedStudents={selectedStudents}
        handleSelectStudent={handleSelectStudent}
        handleSelectAll={handleSelectAll}
        handleAssign={handleAssign}
      />
    </div>
  );
};

const BranchWiseCount = ({ branches }) => (
  <div className="mt-4">
    <h3 className="text-lg font-medium text-white">Branch-wise Count:</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {branches.map((branch, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-4"
        >
          <span className="text-sm font-semibold text-yellow-400">
            {branch._id?.toUpperCase()}
          </span>
          <span className="text-sm text-gray-300">{branch.count} students</span>
        </div>
      ))}
    </div>
  </div>
);

const SemesterWiseCount = ({ semesters }) => (
  <div className="px-4 mb-4">
    <h3 className="text-lg font-medium text-white">Semester-wise Count:</h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
      {Object.entries(semesters).map(([semester, branches]) => (
        <div
          key={semester}
          className="border border-gray-700 rounded-lg bg-gray-800 p-4"
        >
          <h4 className="text-md font-semibold text-blue-400 mb-2">
            Semester: {semester}
          </h4>
          {Object.entries(branches).map(([branch, batches]) => (
            <div key={branch} className="mb-4">
              <h5 className="text-sm font-medium text-yellow-400">
                Branch: {branch.toUpperCase()}
              </h5>
              <ul className="mt-2 space-y-1">
                {Object.entries(batches).map(([batch, count]) => (
                  <li
                    key={batch}
                    className="text-sm text-gray-300 bg-gray-900 p-2 rounded-md"
                  >
                    <span className="font-medium text-green-400">
                      Batch {batch.toUpperCase()}:
                    </span>{" "}
                    {count} students
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const StudentTable = ({ users }) => (
  <div className="overflow-x-auto p-5">
      <table className="w-full border-collapse border border-gray-700 text-sm sm:text-lg text-left text-gray-500">
        <thead className="bg-gray-900 text-gray-400">
          <tr>
            <th className="py-3 px-4 sm:px-6 text-center">ID</th>
            <th className="py-3 px-4 sm:px-6 text-center">Username</th>
            <th className="py-3 px-4 sm:px-6 text-center">Branch</th>
            <th className="py-3 px-4 sm:px-6 text-center">Semester</th>
            <th className="py-3 px-4 sm:px-6 text-center">Batch</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr
                key={user.id}
                className={`${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}`}
              >
                <td className="py-3 px-4 sm:px-6 text-center text-white">
                  {user.id?.toUpperCase()}
                </td>
                <td className="py-3 px-4 sm:px-6 text-center text-white capitalize">
                  {user.username}
                </td>
                <td className="py-3 px-4 sm:px-6 text-center text-white">
                  {user.branch?.toUpperCase()}
                </td>
                <td className="py-3 px-4 sm:px-6 text-center text-white">
                  {user.semester}
                </td>
                <td className="py-3 px-4 sm:px-6 text-center text-white">
                  {user.batch?.toUpperCase()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="py-3 px-4 sm:px-6 text-center text-gray-300"
              >
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="mt-4 flex justify-end">
       
      </div>
    </div>
);

export default StudentInfo;
