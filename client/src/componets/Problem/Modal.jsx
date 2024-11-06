import React from "react";
import { FaTimes } from "react-icons/fa";

const Modal = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-gray-800 text-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-600">
          <h2 className="text-lg font-bold">Submission Details</h2>
          <button
            className="text-gray-400 hover:text-gray-200"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-600 text-right">
          <button
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
