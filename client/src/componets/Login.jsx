import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../redux/userSlice";
import Header from "./Header";
import axiosInstance from "../utils/axiosInstance";

const Login = () => {
  const user = useSelector((store) => store.app.user);
  const [isLogin, setIsLogin] = useState(true);
  const authStatus = useSelector((store) => store.app.authStatus);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState(""); // New state for username
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    const user = isLogin
      ? { email, password }
      : {
          username,
          email,
          password,
          profile: { name: fullName }, // Include profile in registration payload
        };

    try {
      const url = isLogin ? `auth/login` : `auth/register`;
      const res = await axiosInstance.post(url, user);

      if (res.data.success) {
        toast.success(res.data.message);
        if (isLogin) {
          const loggedInUser = res.data.user;
          // console.log(res.data.token);
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
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r overflow-y">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-md p-8 space-y-6 bg-gray-900 bg-opacity-90 rounded-lg shadow-lg"
            style={{ border: "2px solid white" }}
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  placeholder="Profile Name"
                  className="p-4 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </>
            )}
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

      <style>{`
        @media (max-width: 768px) {
          .min-h-screen {
            padding-top: 40px; /* Space between header and form */
            padding-bottom: 20px;
          }
          form {
            margin-top: 20px;
          }
        }

        @media (max-width: 480px) {
          form {
            padding: 10px;
            max-width: 90%;
          }

          input {
            padding: 10px;
          }

          h1 {
            font-size: 24px;
          }

          button {
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default Login;
