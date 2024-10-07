import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaGithub, FaLinkedin } from "react-icons/fa";
import Header from "./Header";
import toast from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    location: "",
    birthday: "",
    github: "",
    linkedIn: "",
    skills: "",
    education: "",
    name: "",
    bio: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3100/api/v1/auth/get-current-user",
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        setUser(response.data.user);
        setFormData({
          fullName: response.data.user.username || "",
          name: response.data.user.profile.name || "",
          gender: response.data.user.profile.gender || "",
          bio: response.data.user.profile.bio || "",
          location: response.data.user.profile.location || "",
          birthday: response.data.user.profile.birthday
            ? response.data.user.profile.birthday.slice(0, 10)
            : "",
          github: response.data.user.profile.github || "",
          skills: response.data.user.profile.skills || "",
          education: response.data.user.profile.education || "",
          linkedIn: response.data.user.profile.linkedIn || "",
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
      console.log(formData);
      const response = await axios.put(
        "http://localhost:3100/api/v1/user/update",
        formData,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Profile updated successfully");
        setUser(response.data.user);
        setEditMode(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  };

  const githubURL = `https://github.com/${formData.github}`;
  const linkedInURL = `https://linkedin.com/in/${formData.linkedIn}`;

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header />
      {user && (
        <section className="pt-16 dark:bg-gray-900">
          <div className="mx-auto flex items-start gap-10 mt-4">
            {/* Left Side - Profile Image, GitHub, LinkedIn */}
            <div
              className="flex flex-col items-center space-y-4 sticky top-20 ml-10"
              style={{width: "20%" }}
            >
              <FaUser size={200} className="text-primary" />
              <p>{formData.name}</p>
              <div className="flex items-center space-y-2">
                <a
                  href={githubURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-all mr-2"
                >
                  <FaGithub size={30} />
                </a>
                <a
                  href={linkedInURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-all"
                >
                  <FaLinkedin size={30} />
                </a>
              </div>
            </div>

            {/* Right Side - Profile Info */}
            <div className="flex flex-col space-y-4 w-[90%] mr-10" >
              <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6" style={{boxShadow: "1px 1px 4px white"}}>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                      placeholder="Enter your bio"
                      rows={4}
                    />
                  </div>

                  <div className="">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Github
                    </label>
                    <input
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                      placeholder="Enter your bio"
                      rows={4}
                    />
                  </div>
                  <div className="">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Linkedin
                    </label>
                    <input
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                      placeholder="Enter your bio"
                      rows={4}
                    />
                  </div>
                 

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Birthday
                    </label>
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 col-span-2">
                      Location
                    </label>
                    <textarea
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                      placeholder="Enter your location"
                      rows={4}
                    />
                  </div>

                  

                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                      placeholder="Enter your skills"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full p-4  bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
                      placeholder="Enter your education"
                    />
                  </div>

                  

                  <div className="col-span-2">
                    <button
                      type="submit"
                      className="w-full p-3 shadow-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      <div>
        hello
      </div>
    </div>
  );
};

export default Profile;
