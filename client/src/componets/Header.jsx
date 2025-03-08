import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { logout, setUser } from "../redux/userSlice";
import axiosInstance from "../utils/axiosInstance";
import {
  Menu,
  X,
  Home,
  User,
  History,
  HelpCircle,
  Code2,
  ClipboardList,
  LogOut,
  ChevronDown,
  Plus,
} from "lucide-react";

const Header = () => {
  const user = useSelector((store) => store.app.user);
  const authStatus = useSelector((store) => store.app.authStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScreenSmall, setIsScreenSmall] = useState(false);
  const [isOnMakeContest, setIsOnMakeContest] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (authStatus === false) {
      navigate("/");
    }
  }, [authStatus]);

  useEffect(() => {
    setIsAdmin(user?.role);
  }, [user?.role]);

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSmall(window.innerWidth <= 1200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setIsOnMakeContest(location.pathname === "/make-contest");
  }, [location]);

  const logoutHandler = async () => {
    try {
      await axiosInstance.get(`auth/logout`);
      dispatch(setUser(null));
      localStorage.removeItem("UserToken");
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const toggleMakeContest = () => {
    if (isOnMakeContest) {
      navigate("/browse");
    } else {
      navigate("/make-contest");
    }
  };

  const isActive = (path) => location.pathname === path;
  const makeContestButtonText =
    user?.role === "student" ? "Contest" : "Make Contest";

  const navLinks = [
    { path: "/browse", label: "Home", icon: <Home size={18} /> },
    { path: "/profile", label: "Profile", icon: <User size={18} /> },
    { path: "/history", label: "History", icon: <History size={18} /> },
    { path: "/support", label: "Support", icon: <HelpCircle size={18} /> },
  ];

  if (user?.role !== "student") {
    navLinks.push({ path: "/make-problem", label: "Problem", icon: <Code2 size={18} /> });
  }

  if (user?.role === "admin") {
    navLinks.push({
      path: "/pending-requests",
      label: "Requests",
      icon: <ClipboardList size={18} />,
    });
  }
  if (user?.role === "faculty") {
    navLinks.push({
      path: "/faculty-section",
      label: "Requests",
      icon: <ClipboardList size={18} />,
    });
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="z-10 w-full fixed top-0 bg-black/80 backdrop-blur-lg border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Codify
            </h1>
          </motion.div>

          {isScreenSmall && user ? (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          ) : (
            user && (
              <div className="hidden md:flex items-center space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-300 hover:bg-blue-500/10 hover:text-blue-300"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    <span>{user?.id?.toUpperCase()}</span>
                    <ChevronDown size={16} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1"
                      >
                        <button
                          onClick={logoutHandler}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Make Contest Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMakeContest}
                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isOnMakeContest ? <Home size={18} /> : <Plus size={18} />}
                  <span>
                    {isOnMakeContest ? "Home" : makeContestButtonText}
                  </span>
                </motion.button>
              </div>
            )
          )}
        </div>
      </div>

      <AnimatePresence>
        {isScreenSmall && isMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-300 hover:bg-blue-500/10 hover:text-blue-300"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}

              <button
                onClick={logoutHandler}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  toggleMakeContest();
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                {isOnMakeContest ? <Home size={18} /> : <Plus size={18} />}
                <span>{isOnMakeContest ? "Home" : makeContestButtonText}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Header;