import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const MakeContest = () => {
  const [contest, setContest] = useState({
    name: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContest((prevContest) => ({
      ...prevContest,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axiosInstance.post('contest/create', contest); // Adjust the endpoint as per your backend routes
      console.log('Contest created:', response.data);
    } catch (error) {
      console.error('Error creating contest:', error);
    }
  };

  return (
    <div>
      <h2>Create a Contest</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Contest Name:</label>
          <input
            type="text"
            name="name"
            value={contest.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={contest.description}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Contest</button>
      </form>
    </div>
  );
};

export default MakeContest;
