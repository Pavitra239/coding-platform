import React, { useState, useEffect } from "react";
import Header from "../Header";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import "../../CSS/Quiz.css";

const MakeContest = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contestToDelete, setContestToDelete] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const handleAddContest = () => {
    navigate("/create-contest");
  };

  const handleEditContest = (contestId) => {
    navigate(`/create-contest/${contestId}`);
  };

  const handleDeleteContest = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/contests/${contestToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }); 
      toast.success("Contest deleted successfully!");
      setShowDeleteModal(false);
      setContestToDelete(null);
      fetchContests(); // Refresh the contest list
    } catch (error) {
      toast.error("Error deleting contest!");
      console.error("Error deleting contest:", error);
    }
  };

  const handleDeleteConfirmation = (contestId) => {
    setContestToDelete(contestId);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setContestToDelete(null);
  };

  const fetchContests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/contests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
  
   
  
      // Adjust how contests are set based on the actual data structure
      if (Array.isArray(response.data)) {
        setContests(response.data); // If the response itself is the array
      } else if (Array.isArray(response.data.contests)) {
        setContests(response.data.contests); // If contests are within the response object
      } else {
        console.error("Expected an array but got:", response.data);
        setContests([]); // Default to an empty array to avoid errors
      }
  
    } catch (error) {
      toast.error("Error fetching contests!");
      console.error("Error fetching contests:", error);
      setContests([]); // Handle error by setting contests to an empty array
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    fetchContests();
  }, []);

  const sortedContests = React.useMemo(() => {
    let sortableContests = Array.isArray(contests) ? [...contests] : [];
    if (sortConfig !== null) {
      sortableContests.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableContests;
  }, [contests, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    console.log("key", key);
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredContests = sortedContests.filter((contest) =>
    contest.name.toLowerCase().includes(searchQuery.toLowerCase())  // Use 'name' instead of 'title' if applicable
  );
  

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="mx-auto p-4">
        <button
          onClick={handleAddContest}
          className="bg-blue-500 text-white text-lg font-semibold py-2 px-4 mt-20 rounded-lg hover:bg-blue-600 transition mb-4 w-full sm:w-auto"
        >
          Add Contest
        </button>
      </div>

      <div className="overflow-x-auto p-5">
        <h1 className="text-3xl font-bold text-white mb-10 text-center">
          Contest List
        </h1>

        <div className="mb-10 flex flex-col gap-4">
          <label htmlFor="search-box" className="text-lg">Search Contests:</label>
          <input
            id="search-box"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="bg-gray-800 text-white py-2 px-4 rounded text-lg"
          />
        </div>

        <table className="min-w-full text-lg text-left text-gray-500">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th
                className="py-3 px-6 cursor-pointer text-lg"
                onClick={() => handleSort("index")}
              >
                #
              </th>
              <th
                className="py-3 px-6 cursor-pointer text-lg"
                onClick={() => handleSort("title")}
              >
                Name
              </th>
              <th
                className="py-3 px-6 cursor-pointer text-lg"
                onClick={() => handleSort("createdAt")}
              >
                Created Date
              </th>
              <th
                className="cursor-pointer text-lg"
              >
              Status
              </th>
              <th className="py-3 px-6 text-lg cursor-pointer"></th>
              
            </tr>
          </thead>
          <tbody>
            {filteredContests.length > 0 ? (
              filteredContests.map((contest, index) => (
                <tr
                  key={contest._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                  }`}
                >
                  <td className="py-3 px-6">{index + 1}</td>
                  <td
                    className="py-3 capitalize px-6 font-bold text-white cursor-pointer hover:text-blue-500 transition duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]"
                    onClick={() => navigate(`/contests/${contest._id}`)}
                    title={contest.name}
                  >
                    {contest.name}
                  </td>
                  <td className="py-3 px-6 text-gray-300">
                    {new Date(contest.createdAt).toLocaleString()}
                  </td>
                  <td className="text-white">
                    {contest.status }
                  </td>
                  <td className="py-3 px-6 text-gray-300 flex gap-2">
                    <button
                      onClick={() => handleEditContest(contest._id)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmation(contest._id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                  
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-3 px-6 text-center text-gray-300">
                  No contests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <div className="loader"></div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-gray-800 p-8 rounded-lg">
            <h3 className="text-white text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this contest? This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                onClick={cancelDelete}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContest}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MakeContest;
