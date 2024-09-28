import React from "react";

const Statement = ({ problem }) => {
    return (
      <div>
        <p className="whitespace-pre-wrap leading-7 tracking-wide text-gray-300">
          {problem.description}
        </p>
  
        <p className="mt-4 flex items-center">
          <strong className="text-lg text-white">Difficulty:</strong>
          <span
            className={`ml-3 px-4 py-2 text-white font-semibold rounded-lg shadow-md ${
              problem.difficulty === "easy"
                ? "bg-green-600"
                : problem.difficulty === "medium"
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
          >
            {problem.difficulty.charAt(0).toUpperCase() +
              problem.difficulty.slice(1)}
          </span>
        </p>
  
        <div className="mt-5">
          <h3 className="font-bold text-lg text-white">Input Format:</h3>
          <p className="whitespace-pre-wrap m-2 bg-gray-800 p-4 rounded-md shadow-sm text-gray-300">
            {problem.inputFormat}
          </p>
        </div>
  
        <div className="mt-5">
          <h3 className="font-bold text-lg text-white">Output Format:</h3>
          <p className="whitespace-pre-wrap m-2 bg-gray-800 p-4 rounded-md shadow-sm text-gray-300">
            {problem.outputFormat}
          </p>
        </div>
  
        <div className="mt-5">
          <h3 className="font-bold text-lg text-white">Constraints:</h3>
          <p className="whitespace-pre-wrap m-2 bg-gray-800 p-4 rounded-md shadow-sm text-gray-300">
            {problem.constraints}
          </p>
        </div>
  
        {problem.sampleIO && problem.sampleIO.length > 0 && (
          <div className="m-2">
            <h3 className="font-bold mb-3 mt-5 text-lg text-white">
              Sample Input/Output:
            </h3>
            {problem.sampleIO.map((sample, index) => (
              <div
                key={index}
                className="mb-4 bg-gray-700 p-4 rounded-lg shadow-lg"
              >
                <div className="mb-4">
                  <p className="text-white font-bold">Input {index + 1}:</p>
                  <pre className="block bg-gray-800 p-4 rounded-md text-gray-300 shadow-sm">
                    {sample.input}
                  </pre>
                </div>
                <div>
                  <p className="text-white font-bold">Output {index + 1}:</p>
                  <pre className="block bg-gray-800 p-4 rounded-md text-gray-300 shadow-sm">
                    {sample.output}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default Statement;
  