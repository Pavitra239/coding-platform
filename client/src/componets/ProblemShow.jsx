import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance'; // Adjust this path as needed

const ProblemShow = () => {
  const { id } = useParams(); // Get problem ID from URL
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      const token = localStorage.getItem('UserToken');
      try {
        const response = await axiosInstance.get(`/problems/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setProblem(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Failed to load problem data', error);
      }
    };

    fetchProblem();
  }, [id]);

  if (!problem) {
    return <div>Loading problem details...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
      <p className="mb-4">{problem.description}</p>
      <p>
        <strong>Difficulty:</strong>{' '}
        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
      </p>
      <p>
        <strong>Created At:</strong> {new Date(problem.createdAt).toLocaleString()}
      </p>
      {/* You can add more problem details here */}
    </div>
  );
};

export default ProblemShow;
