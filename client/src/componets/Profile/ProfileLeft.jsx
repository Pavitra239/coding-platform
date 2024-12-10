import React, { useState } from "react";
import { FaUser, FaGithub, FaLinkedin, FaBirthdayCake, FaClipboardList } from "react-icons/fa";

const ProfileLeft = ({ formData, toggleEdit, isEditing }) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const githubURL = formData.github ? `https://github.com/${formData.github}` : null;
  const linkedInURL = formData.linkedIn || null;

  // Function to limit the bio length
  const getShortBio = (bio) => {
    return bio && bio.length > 50 ? bio.slice(0, 120) + "..." : bio;
  };

  return (
    <div className="flex flex-col items-center sticky top-20">
      <FaUser size={200} className="text-primary mb-3" />
      <p className="pb-5">{formData.name}</p>

      {/* Social Links */}
      <div className="flex items-center space-x-2">
        <a
          href={githubURL}
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-all ${githubURL ? "text-white" : "text-black"} hover:text-white`}
        >
          <FaGithub size={30} />
        </a>
        <a
          href={linkedInURL}
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-all ${linkedInURL ? "text-white" : "text-black"} hover:text-white`}
        >
          <FaLinkedin size={30} />
        </a>
      </div>

      <button
        onClick={toggleEdit}
        className={`px-4 py-2 rounded-md mt-4 transition ${
          isEditing ? "bg-red-500 hover:bg-red-700" : "bg-blue-500 hover:bg-blue-700"
        } text-white`}
      >
        {isEditing ? "Cancel Edit" : "Edit Details"}
      </button>

      {/* Always display additional user details */}
      <div className="mt-4 space-y-3 p-2" style={{ width: "100%" }}>
        {/* {formData.bio && (
          <div>
            <label className="font-semibold flex items-center justify-center">
              <FaClipboardList className="mr-1" /> Bio:
            </label>
            <p className="text-gray-400 whitespace-pre-wrap flex items-center justify-center text-justify">
              {isBioExpanded ? formData.bio : getShortBio(formData.bio)}
            </p>
            {formData.bio.length > 50 && (
              <button
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="text-blue-500 mt-1"
              >
                {isBioExpanded ? "See Less" : "See More"}
              </button>
            )}
          </div>
        )} */}

        {formData.birthday && (
          <div>
            <label className="font-semibold flex items-center justify-center">
              <FaBirthdayCake className="mr-1" /> Birthday:
            </label>
            <p className="text-gray-400 flex items-center justify-center">{formData.birthday}</p>
          </div>
        )}

        {formData.skills && (
          <div>
            <label className="font-semibold flex items-center justify-center">
              <FaClipboardList className="mr-1" /> Skills:
            </label>
            <p className="text-gray-400 whitespace-pre-wrap flex items-center justify-center">
              {formData.skills}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileLeft;
