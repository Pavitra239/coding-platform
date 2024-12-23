import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Header from "../Header";
import axiosInstance from "../../utils/axiosInstance";

// Lowercase branch and batch values constants
export const SEM = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
};

export const BRANCH = {
  CSPIT_CSE: 'cspit-cse',
  CSPIT_CE: 'cspit-ce',
  CSPIT_IT: 'cspit-it',
};

const AssignProblem = () => {
  const { problemId } = useParams(); // Retrieve the problem ID from the route
  const navigate = useNavigate(); // Hook for navigation

  // State for branch, semester, batch selection, and users data
  // const [branch, setBranch] = useState([]);
  // const [semester, setSemester] = useState([]);
  // const [batch, setBatch] = useState([]);
  // const [users, setUsers] = useState([]);

  // Function for navigating to assigned students page
  const handleAssignStudentsNavigation = () => {
    navigate(`/assignedStudents/${problemId}`); // Navigate to the assigned students page
  };

  // Function for handling student assignment
  // const handleAssignStudents = async () => {
  //   try {
  //     const response = await axiosInstance.get(
  //       `/problems/sortUsers`, 
  //       { 
  //         branch: branch.map(b => b.value.toLowerCase()), // Send lowercase branch values
  //         semester: semester.map(s => s.value), // Send semester values (no change for semester)
  //         batch: batch.map(b => b.value.toLowerCase()) // Send lowercase batch values
  //       }
  //     );
  //     setUsers(response.data); // Set the sorted users to the state
  //   } catch (error) {
  //     console.error("Error fetching sorted users:", error);
  //   }
  // };

  // Options for branch, semester, and batch
  // const branchOptions = [
  //   { value: "ALL", label: "All Branches" },
  //   { value: BRANCH.CSPIT_IT, label: "CSPIT-IT" },
  //   { value: BRANCH.CSPIT_CE, label: "CSPIT-CE" },
  //   { value: BRANCH.CSPIT_CSE, label: "CSPIT-CSE" },
  // ];

  // const semesterOptions = [
  //   { value: "ALL", label: "All Semesters" },
  //   ...Array.from({ length: 8 }, (_, i) => ({
  //     value: (i + 1).toString(),
  //     label: `Semester ${i + 1}`,
  //   })),
  // ];

  // const batchOptions = [
  //   { value: "ALL", label: "All Batches" },
  //   { value: "a1", label: "A1" },
  //   { value: "b1", label: "B1" },
  //   { value: "c1", label: "C1" },
  //   { value: "d1", label: "D1" },
  //   { value: "a2", label: "A2" },
  //   { value: "b2", label: "B2" },
  //   { value: "c2", label: "C2" },
  //   { value: "d2", label: "D2" },
  // ];

  // // Fetch users initially or when filters change
  // useEffect(() => {
  //   handleAssignStudents();
  // }, [branch, semester, batch]);

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

      





      {/* <div className="mx-auto p-6 max-w-xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Assign Problem</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Branch</label>
          <Select
            isMulti
            value={branch}
            onChange={(selected) => setBranch(selected)}
            options={branchOptions}
            className="text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Semester</label>
          <Select
            isMulti
            value={semester}
            onChange={(selected) => setSemester(selected)}
            options={semesterOptions}
            className="text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Batch</label>
          <Select
            isMulti
            value={batch}
            onChange={(selected) => setBatch(selected)}
            options={batchOptions}
            className="text-black"
          />
        </div>

        <button
          onClick={handleAssignStudents}
          className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition w-full sm:w-auto"
        >
          Assign Students
        </button>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Sorted Users</h2>
          <table className="min-w-full bg-gray-700 text-white rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4">Username</th>
                <th className="py-2 px-4">Branch</th>
                <th className="py-2 px-4">Semester</th>
                <th className="py-2 px-4">Batch</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-600">
                    <td className="py-2 px-4">{user.username}</td>
                    <td className="py-2 px-4">{user.branch}</td>
                    <td className="py-2 px-4">{user.semester}</td>
                    <td className="py-2 px-4">{user.batch}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 px-4 text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div> */}


    </div>
  );
};

export default AssignProblem;
