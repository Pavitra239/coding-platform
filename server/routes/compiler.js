import express from "express";
import axios from "axios";
import problem from "../models/problem.js";
import submission from "../models/submission.js";
import { isAuthorized } from "../middlewares/auth.js";

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

const JUDGE0_BASE_URL2 = "http://localhost:2358"; // Your Judge0 instance URL
const JUDGE0_TOKEN = "CHAUHANRUTVIK22IT015"; // Replace with your actual token

const normalizeOutput = (output) => {
  if (!output || typeof output !== "string") {
    return ""; // Return an empty string if output is not valid
  }
  return output
    .replace(/\s+/g, " ") // Replace multiple spaces/newlines with a single space
    .trim(); // Trim the entire output
};

// router.post("/run-code", async (req, res) => {
//   const { code, language, allTestCases, problemId } = req.body;
//   console.log("hello--->123")

//   if (
//     !code ||
//     !language   ||
//     !problemId
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid input. Missing required fields or test cases.",
//     });
//   }

//   const languageId = getLanguageId(language);
//   if (!languageId) {
//     return res.status(400).json({
//       success: false,
//       message: "Unsupported programming language.",
//     });
//   }

//   try {
//     const problemData = await problem.findById(problemId).select("testCases");

//     if (!problemData || !problemData.testCases || problemData.testCases.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No test cases found for the given problem ID.",
//       });
//     }

//     let selectedTestCases = problemData.testCases;

//     if (!allTestCases) {
//       selectedTestCases = [problemData.testCases[0]]; // Only first test case
//     }

//     console.log("Selected test cases:", selectedTestCases);

//     const submissions = selectedTestCases.map((testCase) => ({
//       source_code: code,
//       language_id: languageId,
//       stdin: testCase.inputs || "",
//       expected_output: testCase.outputs || "",
//     }));

//     const submissionResponses = await Promise.all(
//       submissions.map((submission) =>
//         axios.post(`${JUDGE0_BASE_URL2}/submissions`, submission, {
//           headers: { Authorization: `Bearer ${JUDGE0_TOKEN}` },
//         })
//       )
//     );

//     const tokens = submissionResponses.map((response) => response.data.token);

//     const fetchResults = async (token) => {
//       let result = null;
//       let retries = 0;
//       while (!result || result.status.id <= 2) {
//         try {
//           const { data } = await axios.get(
//             `${JUDGE0_BASE_URL2}/submissions/${token}?base64_encoded=true&fields=*`
//           );
//           result = data;
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

//       // Adding compilationError and standardError logic here
//       const compilationError = result.compile_output
//         ? decodeBase64(result.compile_output)
//         : null;
//       const standardError = result.stderr ? decodeBase64(result.stderr) : null;

//       return {
//         ...result,
//         compilationError,
//         standardError,
//       };
//     };

//     const results = await Promise.all(tokens.map(fetchResults));
//     const testResults = results.map((result, index) => {
//       const decodedOutput = decodeBase64(result.stdout?.trim() || "");
//       const normalizedOutput = normalizeOutput(decodedOutput);
//       const expectedOutput = normalizeOutput(
//         selectedTestCases[index]?.outputs || ""
//       );

//       return {
//         input: selectedTestCases[index]?.inputs || "",
//         expectedOutput: selectedTestCases[index]?.outputs || "",
//         output: decodedOutput,
//         error: result.compilationError || result.standardError,
//         passed: normalizedOutput === expectedOutput && !result.error,
//         time: result.time,
//         memory: result.memory,
//       };
//     });

//     const overallTime = testResults.reduce(
//       (sum, test) => sum + parseFloat(test.time || 0),
//       0
//     );
//     const averageMemory =
//       testResults.length > 0
//         ? testResults.reduce(
//             (sum, test) => sum + parseInt(test.memory || 0),
//             0
//           ) / testResults.length
//         : 0;

//     console.log("Test Results:", testResults);
//     res.json({
//       success: true,
//       testResults,
//       overallTime,
//       averageMemory,
//       allPassed: testResults.every((test) => test.passed),
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while processing the code.",
//       error: error.message || error,
//     });
//   }
// });

router.post("/run-code", isAuthorized, async (req, res) => {
  const { code, language, allTestCases, problemId } = req.body;
  console.log(req.body);

  if (!req.user) {
    return console.log("Unauthorized access");
  }

  const userId = req.user?.id;

  if (!code || !language || !problemId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. Missing required fields.",
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

    if (
      !problemData ||
      !problemData.testCases ||
      problemData.testCases.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No test cases found for the given problem ID.",
      });
    }

    let selectedTestCases;

    // let selectedTestCases = problemData.testCases;

    // if (!allTestCases) {
    //   selectedTestCases = [problemData.testCases[0]]; // Only first test case
    // }

    if (!allTestCases) {
      selectedTestCases = problemData.testCases.filter(
        (testCase) => !testCase.is_hidden
      );
    } else {
      selectedTestCases = problemData.testCases; // Run all test cases during submission
    }

    if (selectedTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No visible test cases available for execution.",
      });
    }

    const submissions = selectedTestCases.map((testCase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testCase.inputs || "",
      expected_output: testCase.outputs || "",
      cpu_time_limit: testCase.cpu_time_limit || 2, // Default to 2 seconds if not provided
      memory_limit: testCase.memory_limit * 1024 || 128 * 1024, // Default to 128 MB if not provided
    }));

    // Send code to Judge0 API
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

          // Check if the submission exceeded the time limit
          if (result.status.id === 5) {
            return {
              ...result,
              error: "Time Limit Exceeded",
              compilationError: null,
              standardError: null,
            };
          }

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

      return {
        ...result,
        compilationError: result.compile_output
          ? decodeBase64(result.compile_output)
          : null,
        standardError: result.stderr ? decodeBase64(result.stderr) : null,
        error: result.status.id === 5 ? "Time Limit Exceeded" : null, // Explicitly set error for time limit
      };
    };

    // Fetch execution results
    const results = await Promise.all(tokens.map(fetchResults));

    console.log("Execution Results:", results);

    // Process test results
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
        error: result.error || result.compilationError || result.standardError,
        passed: normalizedOutput === expectedOutput && !result.error,
        time: result.time,
        memory: result.memory,
      };
    });

    console.log("Test Results:", testResults);

    // Compute performance metrics
    const overallTime =
      testResults.reduce((sum, test) => sum + parseFloat(test.time || 0), 0) *
      1000; // Convert to ms
    const averageMemory =
      testResults.length > 0
        ? testResults.reduce(
            (sum, test) => sum + parseInt(test.memory || 0),
            0
          ) / testResults.length
        : 0;

    const numberOfTestCase = testResults.length;
    const numberOfTestCasePass = testResults.filter((test) => test.passed)
      .length;

    // Calculate marks for each test case
    const testCaseResults = testResults.map((test, index) => ({
      input: test.input,
      expectedOutput: test.expectedOutput,
      output: test.output,
      error: test.error,
      passed: test.passed,
      time: test.time,
      memory: test.memory,
      is_hidden : selectedTestCases[index]?.is_hidden || false,
      marks:
        test.passed && selectedTestCases[index]?.marks
          ? selectedTestCases[index].marks
          : 0,
    }));

    const totalMarks = testCaseResults.reduce(
      (sum, test) => sum + test.marks,
      0
    );
    const submissionStatus =
      numberOfTestCase === numberOfTestCasePass ? "completed" : "rejected";

    console.log("Submission Metrics:");
    console.log("Total Test Cases:", numberOfTestCase);
    console.log("Passed Test Cases:", numberOfTestCasePass);
    console.log("Total Marks Obtained:", totalMarks);
    console.log("Submission Status:", submissionStatus);

    // Save the submission only if all test cases were run
    let savedSubmission = null;
    if (allTestCases) {
      const submissionPayload = {
        user_id: userId,
        problem_id: problemId,
        code,
        language,
        status: submissionStatus,
        execution_time: overallTime.toFixed(2),
        memory_usage: (averageMemory / 1024).toFixed(2), // Convert to MB
        numberOfTestCase,
        numberOfTestCasePass,
        totalMarks,
        testCaseResults, // Store full test cases data in DB
      };

      const submissionResponse = await submission.create(submissionPayload);
      savedSubmission = submissionResponse;
    }

    // Mask test case details except for the first one in the response
    res.json({
      success: true,
      testResults: testResults.map((test, index) => ({
        input: selectedTestCases[index].is_hidden ? "******" : test.input,
        expectedOutput: selectedTestCases[index].is_hidden
          ? "******"
          : test.expectedOutput,
        output: selectedTestCases[index].is_hidden ? "******"  : test.output,
        error: test.error,
        passed: test.passed,
        time: test.time,
        memory: test.memory,
        marks: test.marks,
      })),
      overallTime: overallTime.toFixed(2),
      averageMemory: (averageMemory / 1024).toFixed(2), // Convert to MB
      allPassed: testResults.every((test) => test.passed),
      savedSubmission: savedSubmission
        ? {
            ...savedSubmission._doc,
            testCaseResults: savedSubmission.testCaseResults.map(
              (test, index) => ({
                input: test.is_hidden ? "******" : test.input,
                expectedOutput: test.is_hidden ? "******" : test.expectedOutput,
                output: test.is_hidden ? "******" : test.output,
                error: test.error,
                passed: test.passed,
                time: test.time,
                memory: test.memory,
                marks: test.marks,
              })
            ),
          }
        : null,
    });
  } catch (error) {
    console.error("Error during execution:");
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the code.",
      error: error.message || error,
    });
  }
});

export default router;
