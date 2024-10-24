import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import ScoreAndLanguageSelector from "./ScoreAndLanguageSelector";
import CodeEditorArea from "./CodeEditorArea";
import TestCaseResults from "./TestCaseResults";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const CodeEditor = ({ language, setLanguage, problem }) => {
  const user = useSelector((state) => state.app.user);
  const userId = user._id;
  const [codeByLanguage, setCodeByLanguage] = useState({
    java: `import java.util.*;
import java.lang.*;
import java.io.*;

class Solution {
    public static void main(String[] args) throws java.lang.Exception {
        // Your code goes here
        System.out.println("Hello, World!");
    }
}`,
    python: `print("Hello, World!")`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your code goes here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  });

  const [results, setResults] = useState(null);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const previousLanguageRef = useRef(language);

  useEffect(() => {
    const fetchSavedCode = async () => {
      try {
        const response = await axiosInstance.get("/compile/getCode", {
          params: { userId, problemId: problem._id },
        });
        if (response.data.success) {
          setCodeByLanguage(response.data.code);
        }
      } catch (error) {
        console.error("Error fetching saved code:", error);
      }
    };

    fetchSavedCode();
  }, [userId, problem._id]);

  useEffect(() => {
    previousLanguageRef.current = language;
  }, [language]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleEditorChange = (value) => {
    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: value,
    }));
  };

  const handleRun = async () => {
    setIsLoading(true);
    setRunLoading(true);
    setResults(null);
    setError(null);
    try {
      // Fetch only the first test case associated with the problemId
      const response = await axiosInstance.post("/compile", {
        code: codeByLanguage[language],
        problemId: problem._id,
        language,
        runSingleTestCase: true, // New flag to indicate only the first test case
      });
      setResults(response.data.testResults);
    } catch (error) {
      setError(
        error.response?.data?.details || "Failed to run code. Please try again."
      );
    } finally {
      setIsLoading(false);
      setRunLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitLoading(true);
    setResults(null);
    setError(null);
    try {
      // Run all test cases associated with the problemId
      const response = await axiosInstance.post("/compile", {
        code: codeByLanguage[language],
        problemId: problem._id,
        language,
        runSingleTestCase: false, // New flag to indicate all test cases should be run
      });
      setResults(response.data.testResults);
    } catch (error) {
      setError(
        error.response?.data?.details ||
          "Failed to submit code. Please try again."
      );
    } finally {
      setIsLoading(false);
      setSubmitLoading(false);
    }
  };
  

  const handleSaveCode = async () => {
    try {
      await axiosInstance.post("/compile/saveCode", {
        userId,
        problemId: problem._id,
        codeByLanguage,
      });
      toast.success("Code saved successfully!");
    } catch (error) {
      console.error("Error saving code:", error);
      toast.error("Failed to save code. Please try again.");
    }
  };

  return (
    <div className="code-editor bg-gray-900 p-6  shadow-lg">
      <ScoreAndLanguageSelector
        language={language}
        handleLanguageChange={handleLanguageChange}
        score={problem.score}
      />
      <CodeEditorArea
        language={language}
        code={codeByLanguage[language] || ""}
        handleEditorChange={handleEditorChange}
      />
      <TestCaseResults
        results={results}
        activeTestCaseIndex={activeTestCaseIndex}
        setActiveTestCaseIndex={setActiveTestCaseIndex}
        isLoading={isLoading}
        runLoading={runLoading}
        submitLoading={submitLoading}
        handleRun={handleRun}
        handleSubmit={handleSubmit}
        handleSaveCode={handleSaveCode}
        error={error}
      />
    </div>
  );
};

export default CodeEditor;
