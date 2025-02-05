import express from "express";
import axios from "axios";
import problem from "../models/problem.js";

const router = express.Router();
const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = "dbe32c7301msha8dfc9660bdf2bfp1bf391jsn29d2b4dbdae2";

const getLanguageId = (language) => {
  const languageMap = {
    python: 71,
    cpp: 54,
    java: 62,
    javascript: 63,
  };
  return languageMap[language] || null;
};

const decodeBase64 = (base64Str) => {
  const buffer = Buffer.from(base64Str, "base64");
  return buffer.toString("utf-8");
};

// Helper function to normalize output by trimming whitespace and line endings
// const normalizeOutput = (output) => {
//   return output.trim().replace(/\r?\n/g, '\n');
// };

// Route to compile and test code
router.post("/compileCode", async (req, res) => {
  const { code, language, testCases } = req.body;
  console.log(req.body);

  // Validate the request payload
  if (
    !code ||
    !language ||
    !Array.isArray(testCases) ||
    testCases.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. Missing required fields or test cases.",
    });
  }

  const languageId = getLanguageId(language);
  console.log("Language ID:", languageId);
  if (!languageId) {
    return res.status(400).json({
      success: false,
      message: "Unsupported programming language.",
    });
  }

  try {
    // Prepare submissions for Judge0
    const submissions = testCases.map((testCase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testCase.input || "",
      expected_output: testCase.expectedOutput || "",
    }));

    // Submit code for each test case
    const submissionResponses = await Promise.all(
      submissions.map((submission) =>
        axios.post(`${JUDGE0_BASE_URL}/submissions`, submission, {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": JUDGE0_API_KEY,
          },
        })
      )
    );

    // Collect submission tokens
    const tokens = submissionResponses.map((response) => response.data.token);

    // Helper function to fetch results for a token
    const fetchResults = async (token) => {
      let result = null;
      let retries = 0;

      while (!result || result.status.id <= 2) {
        try {
          const { data } = await axios.get(
            `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true&fields=*`,
            {
              headers: {
                "X-RapidAPI-Key": JUDGE0_API_KEY,
              },
            }
          );
          result = data;

          // Retry after 1 second if the result is not ready
          if (result.status.id <= 2 && retries < 5) {
            retries++;
            console.log(`Waiting for result... Retry #${retries}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error("Error fetching result:", error.message);
          break;
        }
      }
      return result;
    };

    // Fetch results for all submissions
    const results = await Promise.all(tokens.map(fetchResults));

    // Map results to the test cases and decode base64 outputs
    const testResults = results.map((result, index) => {
      const decodedOutput = decodeBase64(result.stdout?.trim() || "");
      const normalizedOutput = normalizeOutput(decodedOutput);
      const normalizedExpectedOutput = normalizeOutput(
        testCases[index].expectedOutput
      );

      const isPassed = normalizedOutput === normalizedExpectedOutput;
      return {
        input: testCases[index].input,
        expectedOutput: testCases[index].expectedOutput,
        output: decodedOutput,
        passed: isPassed,
        time: result.time,
        memory: result.memory,
      };
    });

    // Check overall test status
    const allPassed = testResults.every((test) => test.passed);

    // Calculate total time and average memory usage
    const totalTests = testResults.length;
    const overallTime = testResults.reduce(
      (sum, test) => sum + parseFloat(test.time || 0),
      0
    );
    const averageMemory =
      totalTests > 0
        ? testResults.reduce(
            (sum, test) => sum + parseInt(test.memory || 0),
            0
          ) / totalTests
        : 0;

    // Respond with test results
    res.json({
      success: true,
      testResults,
      overallTime,
      averageMemory,
      allPassed,
    });
  } catch (error) {
    console.error("Error processing code with Judge0:", error.message || error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the code.",
      error: error.message || error,
    });
  }
});

const JUDGE0_BASE_URL2 = "http://localhost:2358"; // Your Judge0 instance URL
const JUDGE0_TOKEN = "your-auth-token"; // Replace with your actual token

// router.post("/run-code", async (req, res) => {
//   const { code, language, testCases } = req.body;

//   if (!code || !language || !Array.isArray(testCases) || testCases.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid input. Missing required fields or test cases."
//     });
//   }

//   const languageId = getLanguageId(language);
//   if (!languageId) {
//     return res.status(400).json({
//       success: false,
//       message: "Unsupported programming language."
//     });
//   }

//   try {
//     // Prepare submissions for Judge0
//     const submissions = testCases.map((testCase) => ({
//       source_code: code,
//       language_id: languageId,
//       stdin: testCase.input,
//       expected_output: testCase.expectedOutput,
//       cpu_time_limit: 2,
//       memory_limit: 128000,
//     }));

//     // Submit all test cases concurrently
//     const submissionResponses = await Promise.all(
//       submissions.map((submission) =>
//         axios.post(`${JUDGE0_BASE_URL2}/submissions`, submission, {
//           headers: { Authorization: `Bearer ${JUDGE0_TOKEN}` },
//         })
//       )
//     );

//     // Extract submission tokens
//     const tokens = submissionResponses.map((response) => response.data.token);

//     // Helper function to poll for a submission result
//     const fetchResult = async (token) => {
//       let result = null;
//       let delay = 500; // Start with 500ms delay
//       const maxRetries = 10; // Limit to 10 retries

//       for (let attempt = 0; attempt < maxRetries; attempt++) {
//         const { data } = await axios.get(`${JUDGE0_BASE_URL2}/submissions/${token}`);
//         result = data;

//         if (result.status.id > 2) break; // Not "In Queue" or "Processing"
//         await new Promise((resolve) => setTimeout(resolve, delay));
//         delay = Math.min(delay * 2, 5000); // Exponential backoff up to 5s
//       }

//       return result;
//     };

//     // Fetch results concurrently
//     const results = await Promise.all(tokens.map(fetchResult));

//     // Process results
//     const testResults = results.map((result, index) => {
//       const trimmedActualOutput = result.stdout?.trim() || null;
//       const trimmedExpectedOutput = testCases[index].expectedOutput.trim();

//       return {
//         input: testCases[index].input,
//         expectedOutput: trimmedExpectedOutput,
//         actualOutput: trimmedActualOutput,
//         time: result.time || "N/A",
//         memory: result.memory || "N/A",
//         status: result.status.description,
//         passed: trimmedActualOutput === trimmedExpectedOutput,
//       };
//     });

//     // Calculate metrics
//     const overallTime = testResults.reduce((sum, result) => sum + (parseFloat(result.time) || 0), 0);
//     const totalMemory = testResults.reduce((sum, result) => sum + (parseInt(result.memory) || 0), 0);
//     const averageMemory = testResults.length > 0 ? totalMemory / testResults.length : 0;
//     const allPassed = testResults.every((result) => result.passed);

//     // Respond with results
//     res.json({
//       success: true,
//       testResults,
//       overallTime,
//       averageMemory,
//       allPassed,
//     });
//   } catch (error) {
//     console.error("Error during code execution:", error.message || error);
//     res.status(500).json({ success: false, error: "An error occurred during execution." });
//   }
// });

// const normalizeOutput = (output) => {
//   return output
//     .trim() // Remove leading and trailing spaces/newlines
//     .replace(/\s+/g, " ") // Replace multiple spaces/newlines with a single space
//     .split("\n") // Split by rows
//     .map((line) => line.trim()) // Trim each row individually
//     .join("\n"); // Join rows back with a single newline
// };

// router.post("/run-code", async (req, res) => {
//   const { code, language, testCases } = req.body;
//   // console.log(req.body);

//   // Validate the request payload
//   if (!code || !language || !Array.isArray(testCases) || testCases.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid input. Missing required fields or test cases.",
//     });
//   }

//   const languageId = getLanguageId(language);
//   console.log("Language ID:", languageId);
//   if (!languageId) {
//     return res.status(400).json({
//       success: false,
//       message: "Unsupported programming language.",
//     });
//   }

//   try {
//     // Prepare submissions for Judge0
//     console.log("Test cases:", testCases);
//     const submissions = testCases.map((testCase) => ({
//       source_code: code,
//       language_id: languageId,
//       stdin: testCase.input || "",
//       expected_output: testCase.expectedOutput || "",
//     }));

//     // console.log("Submissions:", submissions);

//     // Submit code for each test case
//     const submissionResponses = await Promise.all(
//       submissions.map((submission) =>
//         axios.post(`${JUDGE0_BASE_URL2}/submissions`, submission, {
//             headers: { Authorization: `Bearer ${JUDGE0_TOKEN}` },
//         })
//       )
//     );

//     // console.log("Submission responses:", submissionResponses);

//     // Collect submission tokens
//     const tokens = submissionResponses.map((response) => response.data.token);

//     // Helper function to fetch results for a token
//     const fetchResults = async (token) => {
//       let result = null;
//       let retries = 0;

//       while (!result || result.status.id <= 2) {
//         try {
//           const { data } = await axios.get(
//             `${JUDGE0_BASE_URL2}/submissions/${token}?base64_encoded=true&fields=*`
//           );
//           result = data;
//           // console.log("Result:", result);

//           // Retry after 1 second if the result is not ready
//           if (result.status.id <= 2 && retries < 5) {
//             retries++;
//             console.log(`Waiting for result... Retry #${retries}`);
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//           }
//         } catch (error) {
//           console.error("Error fetching result:", error.message);
//           break;
//         }
//       }
//       return result;
//     };

//     // Fetch results for all submissions
//     const results = await Promise.all(tokens.map(fetchResults));

//     // Map results to the test cases and decode base64 outputs
//     const testResults = results.map((result, index) => {
//       const decodedOutput = decodeBase64(result.stdout?.trim() || "");
//       const normalizedOutput = normalizeOutput(decodedOutput);
//       const normalizedExpectedOutput = normalizeOutput(testCases[index].expectedOutput);
//       console.log("Normalized output:", normalizedOutput);
//       console.log("Normalized expected output:", normalizedExpectedOutput);

//       const isPassed = normalizedOutput === normalizedExpectedOutput;
//       return {
//         input: testCases[index].input,
//         expectedOutput: testCases[index].expectedOutput,
//         output: decodedOutput,
//         passed: isPassed,
//         time: result.time,
//         memory: result.memory,
//       };
//     });

//     // Check overall test status
//     const allPassed = testResults.every((test) => test.passed);

//     // Calculate total time and average memory usage
//     const totalTests = testResults.length;
//     const overallTime = testResults.reduce(
//       (sum, test) => sum + parseFloat(test.time || 0),
//       0
//     );
//     const averageMemory =
//       totalTests > 0
//         ? testResults.reduce((sum, test) => sum + parseInt(test.memory || 0), 0) / totalTests
//         : 0;

//     // Respond with test results
//     res.json({
//       success: true,
//       testResults,
//       overallTime,
//       averageMemory,
//       allPassed,
//     });
//   } catch (error) {
//     console.error("Error processing code with Judge0:", error.message || error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while processing the code.",
//       error: error.message || error,
//     });
//   }
// });

const normalizeOutput = (output) => {
  if (!output || typeof output !== "string") {
    return ""; // Return an empty string if output is not valid
  }
  return output
    .replace(/\s+/g, " ") // Replace multiple spaces/newlines with a single space
    .trim(); // Trim the entire output
};

router.post("/run-code", async (req, res) => {
  const { code, language, allTestCases, problemId } = req.body;
  console.log("hello--->123")

  if (
    !code ||
    !language   ||
    !problemId 
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. Missing required fields or test cases.",
    });
  }

  const languageId = getLanguageId(language);
  if (!languageId) {
    return res.status(400).json({
      success: false,
      message: "Unsupported programming language.",
    });
  }


  try {
    const problemData = await problem.findById(problemId).select("testCases");

    if (!problemData || !problemData.testCases || problemData.testCases.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No test cases found for the given problem ID.",
      });
    }

    let selectedTestCases = problemData.testCases;


    if (!allTestCases) {
      selectedTestCases = [problemData.testCases[0]]; // Only first test case
    }

    console.log("Selected test cases:", selectedTestCases);

    const submissions = selectedTestCases.map((testCase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testCase.inputs || "",
      expected_output: testCase.outputs || "",
    }));

    const submissionResponses = await Promise.all(
      submissions.map((submission) =>
        axios.post(`${JUDGE0_BASE_URL2}/submissions`, submission, {
          headers: { Authorization: `Bearer ${JUDGE0_TOKEN}` },
        })
      )
    );

    const tokens = submissionResponses.map((response) => response.data.token);

    const fetchResults = async (token) => {
      let result = null;
      let retries = 0;
      while (!result || result.status.id <= 2) {
        try {
          const { data } = await axios.get(
            `${JUDGE0_BASE_URL2}/submissions/${token}?base64_encoded=true&fields=*`
          );
          result = data;
          if (result.status.id <= 2 && retries < 5) {
            retries++;
            console.log(`Waiting for result... Retry #${retries}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error("Error fetching result:", error.message);
          break;
        }
      }
    
      // Adding compilationError and standardError logic here
      const compilationError = result.compile_output
        ? decodeBase64(result.compile_output)
        : null;
      const standardError = result.stderr ? decodeBase64(result.stderr) : null;
    
      return {
        ...result,
        compilationError,
        standardError,
      };
    };

    const results = await Promise.all(tokens.map(fetchResults));
    const testResults = results.map((result, index) => {
      const decodedOutput = decodeBase64(result.stdout?.trim() || "");
      const normalizedOutput = normalizeOutput(decodedOutput);
      const expectedOutput = normalizeOutput(
        selectedTestCases[index]?.outputs || ""
      );
    
      return {
        input: selectedTestCases[index]?.inputs || "",
        expectedOutput: selectedTestCases[index]?.outputs || "",
        output: decodedOutput,
        error: result.compilationError || result.standardError,
        passed: normalizedOutput === expectedOutput && !result.error,
        time: result.time,
        memory: result.memory,
      };
    });
    

    const overallTime = testResults.reduce(
      (sum, test) => sum + parseFloat(test.time || 0),
      0
    );
    const averageMemory =
      testResults.length > 0
        ? testResults.reduce(
            (sum, test) => sum + parseInt(test.memory || 0),
            0
          ) / testResults.length
        : 0;

    console.log("Test Results:", testResults);
    res.json({
      success: true,
      testResults,
      overallTime,
      averageMemory,
      allPassed: testResults.every((test) => test.passed),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the code.",
      error: error.message || error,
    });
  }
});

export default router;
