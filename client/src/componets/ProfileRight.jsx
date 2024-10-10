import React from "react";

const ProfileRight = ({ formData, handleInputChange, handleSubmit, user }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div
        className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6"
        style={{ boxShadow: "1px 1px 4px white" }}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
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
              className="w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
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
              className="w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Github
            </label>
            <input
              name="github"
              value={formData.github}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
              placeholder="Enter your GitHub profile name"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              LinkedIn
            </label>
            <input
              name="linkedIn"
              value={formData.linkedIn}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
              placeholder="Enter your LinkedIn profile URL"
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
              className="w-full p-4 bg-gray-800 border rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700"
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

          {/* Other form fields like Gender, Birthday, Location, etc. */}

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
  );
};

export default ProfileRight;
