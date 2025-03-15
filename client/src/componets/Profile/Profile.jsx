import React, { useState, useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import ProfileLeft from "./ProfileLeft";
import ProfileRight from "./ProfileRight";
import SubmissionPage from "../SubmissionPage"; // Assume this is your SubmissionPage component
import { useSelector } from "react-redux";
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
  const [loading, setLoading] = useState(true);  
  const [isEditing, setIsEditing] = useState(false);  
  const [formData, dispatch] = useReducer(reducer, initialState);
  const user = useSelector(state => state.app.user);
  const imageUrl = useSelector(state => state.app.imageUrl);  

  useEffect(() => {
    if (user) {
      dispatch({
        type: "SET_FORM_DATA",
        payload: {
          username: user.username || "",
          name: user.profile?.name || "",
          gender: user.profile?.gender || "",
          bio: user.profile?.bio || "",
          location: user.profile?.location || "",
          birthday: user.profile?.birthday ? user.profile.birthday.slice(0, 10) : "",
          github: user.profile?.github || "",
          skills: user.profile?.skills || "",
          education: user.profile?.education || "",
          linkedIn: user.profile?.linkedIn || "",
          email: user.email || "",
        },
      });
      setLoading(false);  
    }
  }, [user]); 
  
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
      const response = await axiosInstance.put("user/update", { ...formData });

      if (response.data.success) {
        toast.success("Profile updated successfully.");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen"> 
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-500 h-screen flex items-center justify-center">
        <p>User data could not be loaded. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <section className="pt-16 dark:bg-gray-900">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
          <div className="md:col-span-1">
            <ProfileLeft
              formData={formData}
              toggleEdit={toggleEdit}
              isEditing={isEditing}
              imageUrl={imageUrl} 
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
    </div>
  );
};

export default Profile;