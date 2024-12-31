import React, { useState, useEffect } from "react";
import Header from "../Header";
import toast from "react-hot-toast";
import ProfileLeft from "./ProfileLeft";
import ProfileRight from "./ProfileRight";
import SubmissionPage from "../SubmissionPage"; // Assume this is your SubmissionPage component
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";

const Profile = () => {
  const [user, setUser] = useState(null);
  const userId = useSelector((state) => state.app.user._id);
    const [formData, setFormData] = useState({
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
      email:""
    });
  const [isEditing, setIsEditing] = useState(false); // State to toggle between ProfileRight and SubmissionPage

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("auth/get-current-user");
        console.log(response.data);
  
        const userData = response.data.user;
        const userProfile = userData.profile || {}; // Handle cases where profile is undefined
  
        setUser(userData);
  
        setFormData({
          username: userData.username || "",
          name:  userProfile.name || "",
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
        });
      } catch (error) {
        toast.error("Error fetching user data");
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        "user/update",
        {
          ...formData,
          userId: userId // Include userId in the request body
        }
      );
  
      if (response.data.success) {
        toast.success("Profile updated successfully");
        console.log(response.data);
        setUser(response.data.user); 
        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Profile update failed");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Error updating profile. Please try again.");
      } else {
        toast.error("Unexpected error occurred. Please try again.");
      }
      console.error("Error updating profile:", error);
    }
  };
  

  // Function to toggle between editing and submission page
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      {user && (
        <section className="pt-16 dark:bg-gray-900">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
            <div className="md:col-span-1">
              <ProfileLeft formData={formData} toggleEdit={toggleEdit} isEditing={isEditing} />
            </div>

            {/* Conditionally render ProfileRight or SubmissionPage based on isEditing */}
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
