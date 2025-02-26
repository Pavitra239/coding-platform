import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../Header";
import { toast } from "react-hot-toast";

const Contest = () => {
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isContestUpcoming, setIsContestUpcoming] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Fetch contest data and set time difference for countdown
    const fetchContest = async () => {
      if (id) {
        try {
          const response = await axiosInstance.get(`/contests/${id}`);
          const contestData = response.data;
          setContest(contestData);

          const startTime = new Date(contestData.start_time).getTime();
          const endTime = new Date(contestData.end_time).getTime();
          const currentTime = new Date().getTime();

          // Calculate initial time difference
          if (currentTime < startTime) {
            setTimeLeft(startTime - currentTime);
            setIsContestUpcoming(true);
          } else if (currentTime >= startTime && currentTime <= endTime) {
            setTimeLeft(endTime - currentTime);
            setIsContestUpcoming(false);
          } else {
            setTimeLeft(0);
            setIsContestUpcoming(false);
          }
        } catch (error) {
          console.error("Error fetching contest data:", error);
        }
      }
    };

    fetchContest();

    const contestInterval = setInterval(fetchContest, 60000);
    return () => clearInterval(contestInterval);
  }, [id]);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((prevTime) => prevTime - 1000);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [timeLeft]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  // Helper to determine contest status
  const getContestStatus = () => {
    if (timeLeft <= 0 && contest) {
      const endTime = new Date(contest.end_time).getTime();
      return new Date().getTime() > endTime ? "ended" : "ongoing";
    }
    return isContestUpcoming ? "upcoming" : "ongoing";
  };

  // Format time into days, hours, minutes, and seconds
  const formatTime = (time) => {
    if (time <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  React.useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        <div className="mx-auto p-4 pt-20 text-white">
          {contest ? (
            <>
              <div
                className="mb-12 flex justify-center items-center p-4 sm:p-6 bg-gray-800 rounded-lg shadow-lg w-full"
                style={{ boxShadow: "1px 1px 5px white" }}
              >
                <h1
                  className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-semibold text-white text-center tracking-wide capitalize break-words truncate"
                  style={{
                    wordBreak: "break-word", // Break long words
                    overflowWrap: "break-word", // Ensure breaking on overflow
                    maxWidth: "100%", // Limit to container width
                    whiteSpace: "normal", // Allow wrapping to multiple lines
                  }}
                >
                  {contest.name}
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
                {/* Back Button */}
                <div className="flex justify-center sm:mb-0">
                  <button
                    className="px-4 sm:px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out border border-blue-500 text-sm sm:text-base"
                    onClick={() => {
                      navigate(-1);
                      toast.success("Back to previous page");
                    }}
                  >
                    Back
                  </button>
                </div>

                {/* Contest Status and Timer */}
                <div className="flex flex-col items-center w-full mb-8">
                  <h2 className="text-lg font-semibold text-gray-600 mb-4 text-center">
                    {getContestStatus() === "upcoming" && "Starts in"}
                    {getContestStatus() === "ongoing" && "Time Left"}
                    {getContestStatus() === "ended" && ""}
                  </h2>
                  {getContestStatus() !== "ended" && (
                    <div className="flex gap-4 justify-center sm:justify-start">
                      {Object.entries(formatTime(timeLeft)).map(
                        ([unit, value]) => (
                          <div
                            key={unit}
                            className="flex flex-col items-center bg-white text-gray-800 rounded-lg shadow-lg p-4 w-16"
                          >
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-xs text-gray-500">{unit}</p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-2 rounded-lg mb-8">
                <h2 className="text-1xl font-semibold mb-2">Description</h2>
                <p className="border text-justify whitespace-pre-wrap border-gray-700 bg-gray-900 p-4 rounded-lg capitalize text-base sm:text-sm">
                  {contest.description}
                </p>
              </div>

              {getContestStatus() !== "upcoming" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Problems:</h2>
                  <div className="p-4">
                    {contest.problems.map((problem) => (
                      <div
                        key={problem._id}
                        className="mb-5 bg-gray-800 shadow-lg hover:shadow-xl p-6 rounded-lg transition hover:bg-gray-700 cursor-pointer group"
                        onClick={() => handleProblemClick(problem._id)}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-1xl font-bold text-blue-400">
                            {problem.title.length > 30
                              ? `${problem.title.slice(0, 30)}...`
                              : problem.title}
                          </h3>

                          <span className="font-semibold text-white">
                            Score: {problem.score}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          {/* Difficulty Badge */}
                          <div className="text-white flex gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                                problem.difficulty === "easy"
                                  ? "bg-green-500"
                                  : problem.difficulty === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                          </div>

                          {/* Tags */}
                          <div className="flex gap-2">
                            {window.innerWidth > 600
                              ? problem.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-700 px-3 py-1 rounded-full text-xs font-semibold uppercase text-white transition group-hover:bg-gray-900"
                                  >
                                    {tag}
                                  </span>
                                ))
                              : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
                  <p className="mt-4 text-blue-500 text-lg font-medium">
                    Loading, please wait...
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Contest;
