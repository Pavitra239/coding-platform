import React, { useState } from "react";



const StudentTable = ({
    users,
    selectedStudents,
    handleSelectAll,
    handleSelectStudent,
    handleAssign,
    filters,
    updateFilter,
  }) => {
    const [sortConfig, setSortConfig] = useState({
      key: "id",
      direction: "asc",
    });
  
    // Apply filters
    const filteredUsers = users.filter((user) => {
      const branchMatch =
        filters.branch === "ALL" || user.branch === filters.branch;
      const semesterMatch =
        filters.semester === "ALL" ||
        user.semester.toString().toUpperCase() === filters.semester.toUpperCase();
      const batchMatch =
        filters.batch === "ALL" ||
        user.batch.toUpperCase() === filters.batch.toUpperCase();
  
      return branchMatch && semesterMatch && batchMatch;
    });
  
    // Sorting logic
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const keyA = a[sortConfig.key]?.toString().toLowerCase() || "";
      const keyB = b[sortConfig.key]?.toString().toLowerCase() || "";
  
      // Custom sorting for semester types like A1, B1, etc.
      if (sortConfig.key === "semester") {
        const parseSemester = (val) => {
          const match = val.match(/^([A-D])(\d)$/);
          if (match) {
            const [, letter, num] = match;
            return [letter.charCodeAt(0), parseInt(num, 10)];
          }
          return [0, parseInt(val, 10)];
        };
        const [charA, numA] = parseSemester(keyA);
        const [charB, numB] = parseSemester(keyB);
  
        if (charA !== charB)
          return sortConfig.direction === "asc" ? charA - charB : charB - charA;
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }
  
      // Default string sorting
      if (keyA < keyB) return sortConfig.direction === "asc" ? -1 : 1;
      if (keyA > keyB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  
    // Handle sorting configuration change
    const handleSort = (key) => {
      setSortConfig((prev) => {
        const isSameKey = prev.key === key;
        const newDirection = isSameKey
          ? prev.direction === "asc"
            ? "desc"
            : "asc"
          : "asc";
        return { key, direction: newDirection };
      });
    };
  
    return (
      <div className="overflow-x-auto p-5">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between items-center">
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
  
        {/* Student Count */}
        <div className="mb-4 text-gray-300">
          <span className="font-bold">{filteredUsers.length}</span>{" "}
          {filteredUsers.length === 1 ? "student" : "students"} found.
        </div>
  
        {/* Table */}
        <table className="w-full border-collapse border border-gray-700 text-sm sm:text-lg text-left text-gray-500">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="py-3 px-4 text-center">
                <button
                  onClick={handleSelectAll}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  {selectedStudents.length === users.length
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
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user, index) => (
                <tr
                  key={user._id}
                  className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(user._id)}
                      onChange={() => handleSelectStudent(user._id)}
                    />
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {user.id?.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {user.username}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {user.branch?.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {user.semester}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {user.batch?.toUpperCase()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-3 px-4 text-center text-gray-300">
                  No unassigned students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
  
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAssign}
            disabled={selectedStudents.length === 0}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-600"
          >
            Assign Problem
          </button>
        </div>
      </div>
    );
  };

  export default StudentTable;