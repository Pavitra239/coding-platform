import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../Header";
import { toast } from "react-hot-toast";

const Contest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth); // Initialize screen width
  const [isContestUpcoming, setIsContestUpcoming] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Fetch contest data and set time difference for countdown
    const fetchContest = async () => {
      if (id) {
        try {
          const token = localStorage.getItem("token");
          const response = await axiosInstance.get(`/contests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          const contestData = response.data;
          setContest(contestData);

          const startTime = new Date(contestData.start_time).getTime();
          const endTime = new Date(contestData.end_time).getTime();
          const currentTime = new Date().getTime(); // Define currentTime here

          // Calculate initial time difference
          if (currentTime < startTime) {
            setTimeLeft(startTime - currentTime); // Time left until contest starts
            setIsContestUpcoming(true); // Contest is upcoming
          } else if (currentTime >= startTime && currentTime <= endTime) {
            setTimeLeft(endTime - currentTime); // Time left until contest ends
            setIsContestUpcoming(false);
          } else {
            setTimeLeft(0); // Contest has ended
            setIsContestUpcoming(false); // Contest has ended
          }
        } catch (error) {
          console.error("Error fetching contest data:", error);
        }
      }
    };

    fetchContest();

    // Update contest data every 1 minute (60000 milliseconds)
    const contestInterval = setInterval(fetchContest, 60000);

    return () => clearInterval(contestInterval); // Cleanup interval on component unmount
  }, [id]);

  // Countdown timer logic
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((prevTime) => prevTime - 1000);
      }
    }, 1000); // Update every second

    return () => clearInterval(countdownInterval); // Cleanup on component unmount
  }, [timeLeft]);

  // Update screen width on resize
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  // Convert milliseconds to readable time format (hh:mm:ss)
  const formatTime = (time) => {
    if (time <= 0) return "Contest ended";

    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="mx-auto p-4 pt-20 text-white">
          {contest ? (
            <>
              <div className="mb-12 flex justify-center items-center p-6 bg-gray-800 rounded-lg shadow-lg w-full"
              style={{boxShadow : "1px 1px 5px white"}}>
                <h1 className="text-xl sm:text-2xl md:text-4xl font-semibold text-white text-center tracking-wide">
                  {contest.name}
                </h1>
              </div>

              <div className="flex justify-between items-start w-full   md:mt-0 mb-4">
                <div className="flex justify-center">
                  <button
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out border border-blue-500"
                    onClick={() => {
                      navigate(-1);
                      toast.success("Back to previous page");
                    }}
                  >
                    Back
                  </button>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Time Status</h2>
                  <p className="text-2xl font-bold">{formatTime(timeLeft)}</p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="border text-justify whitespace-pre-wrap border-gray-700 bg-gray-900 p-4 rounded-lg">
                  {contest.description}
                </p>
              </div>

              {!isContestUpcoming ? (
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
                          <h3 className="text-xl font-bold text-blue-400">
                            {problem.title}
                          </h3>
                          <span className="font-semibold text-white">
                            Score: {problem.score}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
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

                          <div className="flex gap-2">
                            {problem.tags
                              .slice(
                                0,
                                screenWidth <= 1000 ? 2 : problem.tags.length
                              )
                              .map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-700 px-3 py-1 rounded-full text-xs font-semibold uppercase text-white transition group-hover:bg-gray-900"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p>Loading contest data...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Contest;
