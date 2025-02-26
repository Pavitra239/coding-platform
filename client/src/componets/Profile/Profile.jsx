import React, { useState, useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import ProfileLeft from "./ProfileLeft";
import ProfileRight from "./ProfileRight";
import SubmissionPage from "../SubmissionPage"; // Assume this is your SubmissionPage component
import axiosInstance from "../../utils/axiosInstance";

const initialState = {
  username: "",
  gender: "",
  location: "",
  birthday: "",
  github: "",
  linkedIn: "",
  skills: "",
  education: "",
  name: "",
  bio: "",
  email: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return { ...state, ...action.payload };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("auth/get-current-user");
        const userData = response?.data?.user;
        const userProfile = userData?.profile || {};

        setUser(userData);
        dispatch({
          type: "SET_FORM_DATA",
          payload: {
            username: userData.username || "",
            name: userProfile.name || "",
            gender: userProfile.gender || "",
            bio: userProfile.bio || "",
            location: userProfile.location || "",
            birthday: userProfile.birthday
              ? userProfile.birthday.slice(0, 10)
              : "",
            github: userProfile.github || "",
            skills: userProfile.skills || "",
            education: userProfile.education || "",
            linkedIn: userProfile.linkedIn || "",
            email: userData.email || "",
          },
        });
      } catch (error) {
        toast.error("Failed to load user data. Please try again.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FORM_DATA", payload: { [name]: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email) {
      toast.error("Username and email are required.");
      return;
    }

    try {
      const response = await axiosInstance.put("user/update", {
        ...formData,
      });

      if (response.data.success) {
        toast.success("Profile updated successfully.");
        setUser(response.data.user);
        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Profile update failed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
      console.error(error);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          {/* <div className="relative w-12 h-12">
            <div className="absolute w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-8 h-8 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
          </div> */}
        </div>
      ) : !user ? (
        <div className="text-center text-gray-500 h-screen flex items-center justify-center">
          <p>User data could not be loaded. Please refresh the page.</p>
        </div>
      ) : (
        <section className="pt-16 dark:bg-gray-900">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
            <div className="md:col-span-1">
              <ProfileLeft
                formData={formData}
                toggleEdit={toggleEdit}
                isEditing={isEditing}
              />
            </div>

            <div className="md:col-span-3">
              {isEditing ? (
                <ProfileRight
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  user={user}
                />
              ) : (
                <SubmissionPage />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
