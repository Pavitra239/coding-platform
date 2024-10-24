import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import util from "util";
import Code from "../models/Code.js";
import problem from "../models/problem.js";

const __dirname = path.resolve();
const execAsync = util.promisify(exec);
const TIME_LIMIT = 10000; 

export const compileCode = async (req, res) => {
  const { code, problemId, language, runSingleTestCase } = req.body;
  // console.log("Received request body:", req.body);

  
  if (!code || !problemId || !language) {
    return res
      .status(400)
      .json({ error: "Code, problem ID, and language are required" });
  }

  const fileExtension =
    language === "python"
      ? "py"
      : language === "cpp"
      ? "cpp"
      : language === "java"
      ? "java"
      : null;
  if (!fileExtension) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const fileName =
    language === "java"
      ? "Solution.java"
      : `Solution_${uuidv4()}.${fileExtension}`;
  const tempDir = path.join(__dirname, "temp");
  const filePath = path.join(tempDir, fileName);

  try {
    // Fetch test cases associated with the problemId
    const problemData = await problem.findById(problemId);
    if (
      !problemData ||
      !problemData.testCases ||
      !Array.isArray(problemData.testCases)
    ) {
      return res
        .status(404)
        .json({ error: "Test cases not found for this problem" });
    }
    const { testCases } = problemData;
    const testCasesToRun = runSingleTestCase ? [testCases[0]] : testCases;

    console.log(testCases);

    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(filePath, code);
    console.log(`File created successfully at ${filePath}`);

    // Define compile and run commands based on the language
    const compileCommand =
      language === "cpp"
        ? `g++ ${filePath} -o ${filePath}.exe`
        : language === "java"
        ? `javac ${filePath}`
        : null;
    const runCommand =
      language === "cpp" && process.platform === "win32"
        ? `${filePath}.exe`
        : language === "cpp"
        ? `${filePath}.out`
        : language === "java"
        ? `java -cp ${tempDir} Solution`
        : `python ${filePath}`;

    // Compile the code if necessary
    if (compileCommand) {
      const { stderr: compileStderr } = await execAsync(compileCommand);
      if (compileStderr) {
        throw new Error(`Compilation Error: ${compileStderr}`);
      }
      console.log("Compilation successful");
    }

    const arraysEqual = (arr1, arr2) => {
      console.log("Comparing arrays:", arr1, arr2);
      const areEqual =
        arr1.length === arr2.length &&
        arr1.every((value, index) => value === arr2[index]);
      console.log("Arrays are equal:", areEqual);
      return areEqual;
    };

    const executeWithTimeout = (inputs) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Execution timed out"));
        }, TIME_LIMIT);

        // Extract input values and prepare the input string for execution
        const inputValues = inputs.map((input) => input.value);
        const inputString = inputValues.join(" ") + "\n"; // Adjust this format as needed

        console.log(
          `Executing command: ${runCommand} with input: ${inputString}`
        );

        const child = exec(
          runCommand,
          { timeout: TIME_LIMIT },
          (error, stdout, stderr) => {
            clearTimeout(timeout);
            if (error) {
              if (
                stderr.includes("invalid_argument") ||
                stderr.includes("stoi")
              ) {
                resolve(["Invalid input"]);
              } else {
                reject(
                  new Error(`Execution Error: ${stderr || error.message}`)
                );
              }
            } else {
              const outputArray = stdout
                .trim()
                .replace("Output: ", "")
                .split(/\s+/)
                .map((value) => (isNaN(value) ? value : Number(value)));

              console.log("Raw output from execution:", stdout.trim());
              console.log("Parsed output array:", outputArray);

              resolve(outputArray);
            }
          }
        );

        // Send the prepared input to the child process
        child.stdin.write(inputString);
        child.stdin.end();
      });
    };

    const testResults = [];
    for (const { inputs, outputs: expectedOutputs } of testCasesToRun) {
      try {
        const cleanedOutput = await executeWithTimeout(inputs);
        const expectedValues = expectedOutputs.map((output) => output.value);
        const passed = arraysEqual(cleanedOutput, expectedValues);
        testResults.push({
          inputs,
          expectedOutputs,
          output: cleanedOutput,
          passed,
        });
      } catch (runError) {
        testResults.push({
          inputs,
          expectedOutputs,
          output: runError.message,
          passed: false,
        });
      }
    }

    res.json({ testResults });
  } catch (error) {
    console.error("An error occurred during compilation or execution:", error);
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  } finally {
    try {
      await fs.unlink(filePath);
      if (language === "cpp") {
        await fs.unlink(`${filePath}.exe`);
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }
};

export const saveCode = async (req, res) => {
  const { userId, problemId, codeByLanguage } = req.body;
  console.log("Received request body:", req.body);

  try {
    const code = await Code.findOneAndUpdate(
      { userId, problemId },
      { codeByLanguage, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    console.log(code);
    res
      .status(200)
      .json({ success: true, message: "Code saved successfully", code });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error saving code", error });
  }
};

export const getCode = async (req, res) => {
  const { userId, problemId } = req.query;
  console.log("Received query params:", req.query);

  try {
    const code = await Code.findOne({ userId, problemId });
    console.log("Retrieved code draft:", code);

    if (code) {
      // Send back the codeByLanguage object directly
      res.status(200).json({ success: true, code: code.codeByLanguage });
    } else {
      res
        .status(404)
        .json({ success: false, message: "No code found for this problem" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching code", error });
  }
};
