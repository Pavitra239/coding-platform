import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../redux/userSlice";
import Header from "./Header";
import axiosInstance from "../utils/axiosInstance";
import { SEM, BRANCH } from "../../../server/utils/constants";
import PasswordChange from "./PassWordChange";
import { ClipLoader } from "react-spinners";

const Login = () => {
  const user = useSelector((store) => store.app.user);
  const [isLogin, setIsLogin] = useState(true);
  const authStatus = useSelector((store) => store.app.authStatus);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [idOrEmail, setIdOrEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [branch, setBranch] = useState("");
  const [sem, setSem] = useState("");
  const [batch, setBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((store) => store.app.isLoading);
  const [userType, setUserType] = useState("");
  const [isLoad, setIsLoad] = useState(false);

  const toggleLogin = () => {
    setIsLogin(!isLogin);
  };

  useEffect(() => {
    if (authStatus) {
      navigate("/browse");
    } else {
      navigate("/");
    }
  }, [authStatus]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        if (userType === "student") {
          setIsLoad(true);
          const res = await axiosInstance.get("auth/fetch-subjects");
          if (res.data.success) {
            console.log(res.data.subjects);
            setSubjects(res.data.subjects);
          }
          setIsLoad(false);
        }
      } catch (error) {
        setIsLoad(false);
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchSubjects();
  }, [userType]);

  const validateRegistration = () => {
    if (
      !username ||
      !idOrEmail ||
      !mobileNo ||
      !branch ||
      !sem ||
      !batch ||
      !subject
    ) {
      toast.error("All fields are required for registration.");
      return false;
    }
    if (mobileNo.length !== 10 || !/^\d+$/.test(mobileNo)) {
      toast.error("Mobile number must be 10 digits.");
      return false;
    }
    if (userType === "faculty" && !/\S+@\S+\.\S+/.test(idOrEmail)) {
      toast.error("Please enter a valid email for faculty.");
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!idOrEmail || !password) {
      toast.error("ID/Email and password are required for login.");
      return false;
    }
    return true;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!validateRegistration()) return;
  
    const selectedSubject = subjects.find((subj) => subj.id === subject);
    console.log(selectedSubject);
  
    const newUser = {
      username,
      id: userType === "student" ? idOrEmail.toLowerCase() : undefined, // Convert id to lowercase
      email: userType === "faculty" ? idOrEmail.toLowerCase() : undefined, // Convert email to lowercase
      facultyId: userType === "student" ? selectedSubject.id : undefined,
      mobileNo,
      branch: branch.toLowerCase(), // Convert branch to lowercase
      semester: sem,
      batch : batch.toLowerCase(),
      subject: userType === "student" ? selectedSubject.subject : subject,
      role: userType,
      profile: { name: fullName },
    };
  
    console.log(newUser);
  
    try {
      dispatch(setLoading(true));
  
      const res = await axiosInstance.post("auth/register", newUser);
  
      if (res.data.success) {
        toast.success(res.data.message);
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      dispatch(setLoading(false));
    }
  };
  

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    dispatch(setLoading(true));
    const user = {
      [idOrEmail.includes("@") ? "email" : "id"]: idOrEmail,
      password,
    };

    console.log("This is user: ", user);
    try {
      const url = `auth/login`;
      const res = await axiosInstance.post(url, user);
      console.log(res.data);
      if (res.data.success) {
        const { firstTimeLogin, message } = res.data;
        if (firstTimeLogin) {
          setIsFirstTime(true);
          toast.success("Welcome to your first login!");
          return;
        }

        const { user: loggedInUser, token } = res.data;
        toast.success(message || "Login successful!");
        localStorage.setItem("UserToken", token);
        dispatch(setUser(loggedInUser));
        navigate("/browse");
      } else {
        toast.error(res.data.message || "Login failed!");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An error occurred during login.";
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
      resetForm();
    }
  };

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setIdOrEmail("");
    setPassword("");
  };

  return (
    <>
      <div style={{ backgroundColor: "black" }}>
        <Header />
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
          {isFirstTime ? (
            <PasswordChange id={idOrEmail} />
          ) : (
            <form
              onSubmit={isLogin ? handleLogin : handleRegistration}
              className="flex flex-col w-full max-w-lg p-8 space-y-6 bg-gray-900 bg-opacity-90 rounded-lg shadow-lg"
            >
              <h1 className="text-4xl text-white font-bold text-center">
                {isLogin ? "Login" : "Signup"}
              </h1>
              {!isLogin && (
                <>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    placeholder="Username"
                    className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      type="text"
                      placeholder="Mobile No"
                      className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <select
                      id="userType"
                      value={userType}
                      onChange={(e) => {
                        setUserType(e.target.value);
                        setSubject("");
                      }}
                      className="p-3 w-full cursor-pointer rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="" disabled>
                        -- Select User Type --
                      </option>
                      <option value="student" onSelect={() => setSubject("")}>
                        Student
                      </option>
                      <option value="faculty" onSelect={() => setSubject("")}>
                        Faculty
                      </option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="p-4 cursor-pointer rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select Branch</option>
                      {Object.values(BRANCH).map((branchOption, index) => (
                        <option key={index} value={branchOption}>
                          {branchOption}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sem}
                      onChange={(e) => setSem(e.target.value)}
                      className="p-4 cursor-pointer rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select Semester</option>
                      {Object.values(SEM).map((semOption, index) => (
                        <option
                          key={index}
                          value={semOption}
                          className="cursor-pointer"
                        >
                          Semester {semOption}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      type="text"
                      placeholder="Batch"
                      className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {userType === "student" ? (
                      <input
                        value={idOrEmail}
                        onChange={(e) => setIdOrEmail(e.target.value)}
                        type="text"
                        disabled={userType !== "student"}
                        placeholder="Student ID"
                        className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    ) : (
                      <input
                        value={idOrEmail}
                        onChange={(e) => setIdOrEmail(e.target.value)}
                        disabled={userType !== "faculty"}
                        type="email"
                        placeholder="Faculty Email"
                        className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    )}
                  </div>
                  {userType === "student" && (
                    <select
                      value={isLoad ? "" : subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="p-4 cursor-pointer rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={isLoad}
                    >
                      <option value="" disabled>
                        {isLoad ? (
                          <div className="flex justify-center items-center">
                            <ClipLoader color="#36D7B7" size={15} />
                            <span className="ml-2">Loading...</span>
                          </div>
                        ) : subjects.length === 0 ? (
                          "Subjects not available"
                        ) : (
                          "-- Select Subject --"
                        )}
                      </option>
                      {!isLoad &&
                        subjects.map((subj, index) => (
                          <option
                            key={index}
                            value={subj.id}
                            className="cursor-pointer"
                          >
                            {subj.subject} ({subj.teacher})
                          </option>
                        ))}
                    </select>
                  )}

                  {userType === "faculty" && (
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      type="text"
                      placeholder="Enter Subject"
                      className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </>
              )}
              {isLogin && (
                <>
                  <input
                    value={idOrEmail}
                    onChange={(e) => setIdOrEmail(e.target.value)}
                    type="name"
                    placeholder="Id"
                    className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="relative w-full">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="p-4 w-full rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <span>👁️</span>
                      ) : (
                        <span>🙈</span> //
                      )}
                    </button>
                  </div>
                </>
              )}
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-md transition-transform transform hover:scale-105 focus:scale-95"
              >
                {isLoading ? "Loading..." : isLogin ? "Login" : "Signup"}
              </button>
              <p className="text-white text-center">
                {isLogin ? "New to Coding App?" : "Already have an account?"}
                <span
                  onClick={toggleLogin}
                  className="ml-2 text-blue-500 cursor-pointer hover:underline"
                >
                  {isLogin ? "Signup" : "Login"}
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
