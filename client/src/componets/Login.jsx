import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../redux/userSlice";
import Header from "./Header";
import axiosInstance from "../utils/axiosInstance";
import { SEM, BRANCH } from "../../../server/utils/constants";

const Login = () => {
  const user = useSelector((store) => store.app.user);
  const [isLogin, setIsLogin] = useState(true);
  const authStatus = useSelector((store) => store.app.authStatus);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [branch, setBranch] = useState("");
  const [sem, setSem] = useState("");
  const [batch, setBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((store) => store.app.isLoading);

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

  const handleRegistration = async (e) => {
    e.preventDefault();

    const newUser = {
      username,
      id,
      email,
      mobileNo,
      password,
      branch,
      semester: sem,
      batch,
      subject,
      profile: { name: fullName },
    };

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

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     console.log("Hello there")
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //   }
  // }

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    const user = isLogin
      ? { email, password }
      : {
        username,
        email,
        password,
        profile: { name: fullName },
        branch,
        semester: sem,
        batch,
        subject,
      };

    try {
      const url = isLogin ? `auth/login` : `auth/register`;
      const res = await axiosInstance.post(url, user);

      if (res.data.success) {
        toast.success(res.data.message);
        if (isLogin) {
          const loggedInUser = res.data.user;
          localStorage.setItem("UserToken", res.data.token);
          dispatch(setUser(loggedInUser));
          navigate("/browse");
        } else {
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      dispatch(setLoading(false));
    }
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <>
      <div style={{ backgroundColor: "black" }}>
        <Header />
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={isLogin ? handleLogin : handleRegistration}
            className="flex flex-col w-full max-w-lg p-8 space-y-6 bg-gray-900 bg-opacity-90 rounded-lg shadow-lg"
            style={{ border: "2px solid white", width: '100%' }}
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
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  type="text"
                  placeholder="ID"
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  type="text"
                  placeholder="Mobile No"
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Semester</option>
                  {Object.values(SEM).map((semOption, index) => (
                    <option key={index} value={semOption}>
                      Semester {semOption}
                    </option>
                  ))}
                </select>

                <input
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  type="text"
                  placeholder="Batch"
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  type="text"
                  placeholder="Subject"
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </>
            )}
            {isLogin && (
              <>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </>
            )}
            <button
              type="submit"
              className={`w-full py-4 bg-blue-600 text-white font-bold rounded-md transition-transform transform hover:scale-105 focus:scale-95`}
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
        </div>
      </div>
    </>
  );
};

export default Login;