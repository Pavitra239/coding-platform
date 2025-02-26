import React, { useState, useEffect, useCallback } from "react";
import {
  FaUser,
  FaGithub,
  FaLinkedin,
  FaBirthdayCake,
  FaClipboardList,
} from "react-icons/fa";
import {
  User,
  Github,
  Linkedin,
  Cake,
  ClipboardList,
  Edit,
  Upload,
  X,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

const ProfileLeft = ({ formData, toggleEdit, isEditing }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const githubURL = formData.github
    ? `https://github.com/${formData.github}`
    : null;
  const linkedInURL = formData.linkedIn || null;

  const fetchProfilePic = useCallback(async () => {
    // console.log("Hello there");
    try {
      setLoading(true);
      const response = await axiosInstance.get("/user/profile/upload-avatar", {
        responseType: "blob",
      });
      // console.log("this is it: ", response.data);
      const imageUrl = URL.createObjectURL(response.data);
      setProfilePic(imageUrl);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!profilePic) {
      fetchProfilePic();
    }
  }, [setProfilePic]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfilePic = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/user/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status == 200) {
        toast.success(response.data.message);
        setProfilePic(URL.createObjectURL(selectedFile));
      }
      setLoading(false);
    } catch (error) {
      toast.error("upload Error");
      console.error("Upload Error:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setLoading(true);
      toast.success("Remove successfully");
      setSelectedFile(null);
      setProfilePic(null);
      setLoading(false);
      const response = await axiosInstance.delete(
        "/user/profile/remove-profile-pic"
      );
      if (response.status === 200) {
        setSelectedFile(null);
        setProfilePic(null);
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Remove Error");
      console.error("Remove Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-20 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-2xl p-8 border border-gray-700">
      <div className="flex flex-col items-center">
        {/* Profile Image with improved styling */}
        <div className="relative mb-6">
          {loading ? (
            <div className="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-blue-500 shadow-lg transition-all duration-300 hover:ring-blue-400">
                {selectedFile ? (
                  <img
                    src={imagePreview}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                ) : profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <User size={80} className="text-gray-400" />
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => document.getElementById("fileInput").click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-all"
                  >
                    <Edit size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Name with improved typography */}
        <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          {formData.name}
        </h2>

        {/* Social links with improved styling */}
        <div className="flex items-center space-x-4 mb-6">
          <a
            href={githubURL}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-all p-2 rounded-full ${
              githubURL
                ? "bg-gray-700 text-white hover:bg-gray-600 hover:scale-110"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
            title={githubURL ? "GitHub Profile" : "No GitHub profile available"}
          >
            <Github size={24} />
          </a>
          <a
            href={linkedInURL}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-all p-2 rounded-full ${
              linkedInURL
                ? "bg-gray-700 text-white hover:bg-gray-600 hover:scale-110"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
            title={
              linkedInURL ? "LinkedIn Profile" : "No LinkedIn profile available"
            }
          >
            <Linkedin size={24} />
          </a>
        </div>

        {/* Edit button with improved styling */}
        <button
          onClick={toggleEdit}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
            isEditing
              ? "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
              : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
          } text-white shadow-lg`}
        >
          {isEditing ? "Cancel Edit" : "Edit Details"}
        </button>

        {/* File upload section with improved styling */}
        {isEditing && (
          <div className="mt-6 w-full space-y-4">
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile && (
              <button
                onClick={() => document.getElementById("fileInput").click()}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg px-4 py-3 shadow-lg hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all flex items-center justify-center space-x-2"
              >
                <Upload size={18} />
                <span>Select New Image</span>
              </button>
            )}

            {selectedFile && (
              <div className="space-y-3">
                <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg flex items-center">
                  <div className="flex-1 truncate">{selectedFile.name}</div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-red-400 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>

                <button
                  onClick={handleUpdateProfilePic}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg px-4 py-3 shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all flex items-center justify-center space-x-2"
                >
                  <Upload size={18} />
                  <span>Upload Profile Picture</span>
                </button>
              </div>
            )}

            {profilePic && !selectedFile && (
              <button
                onClick={handleRemoveImage}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg px-4 py-3 shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all flex items-center justify-center space-x-2"
              >
                <X size={18} />
                <span>Remove Profile Picture</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileLeft;
