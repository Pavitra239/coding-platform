import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import SubmissionList from "./SubmissionList.jsx";
import SubmissionDetails from "./SubmissionDetails";

const Submission = ({ problemId, latestSubmission }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(latestSubmission || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.app.user);
  const userId = user._id;

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/submissions", {
        params: {
          user_id: userId,
          problem_id: problemId,
        },
      });
      // console.log(response.data);
      const sortedSubmissions = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSubmissions(sortedSubmissions);
      setLoading(false);
    } catch (error) {
      setError("Failed to load submissions. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [userId, problemId]);

  // Update selected submission if a new one is passed
  useEffect(() => {
    if (latestSubmission) {
      setSelectedSubmission(latestSubmission);
    }
  }, [latestSubmission]);

  return (
    <div className="bg-gray-900 p-2 rounded-lg shadow-lg">
      {selectedSubmission ? (
        <SubmissionDetails
          submission={selectedSubmission}
          onBack={() => setSelectedSubmission(null)}
        />
      ) : ( 
        <SubmissionList
          submissions={submissions}
          onSelect={setSelectedSubmission}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default Submission;
