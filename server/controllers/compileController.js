import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import util from "util";

const __dirname = path.resolve();

const execAsync = util.promisify(exec);

export const compileCode = async (req, res) => {
  const { code, testCases, language } = req.body;
  console.log("Received request body:", req.body);

  // Validate input
  if (!code || !testCases || !Array.isArray(testCases)) {
    return res.status(400).json({ error: "Code and test cases are required" });
  }

  // Determine file extension and create a file name
  const fileExtension =
    language === "python" ? "py" : language === "cpp" ? "cpp" : "java";
  const fileName =
    language === "java"
      ? "Solution.java"
      : `Solution_${uuidv4()}.${fileExtension}`;
  console.log("Generated file name:", fileName);

  // Create the temporary directory path
  const tempDir = path.join(__dirname, "temp");
  const filePath = path.join(tempDir, fileName);
  console.log("File path:", filePath);

  try {
    // Ensure the temp directory exists
    await fs.mkdir(tempDir, { recursive: true });
    console.log("Temporary directory is ready at:", tempDir);

    // Save the code to a temporary file
    await fs.writeFile(filePath, code);
    console.log(`File created successfully at ${filePath}`);

    // Determine the compile and run commands based on the language
    const compileCommand =
      language === "cpp"
        ? `g++ ${filePath} -o ${filePath}.out`
        : language === "java"
        ? `javac ${filePath}`
        : null;

    const runCommand =
      language === "cpp"
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

    // Run the code for each test case
    // Run the code for each test case
    const testResults = [];
    for (const { input, output: expectedOutput } of testCases) {
      // Access output as expectedOutput
      try {
        const { stdout, stderr } = await execAsync(
          `echo "${input}" | ${runCommand}`
        );
        if (stderr) {
          testResults.push({
            input,
            expectedOutput,
            output: stderr,
            passed: false,
          });
        } else {
          // Remove any surrounding quotes from the output
          const cleanedOutput = stdout.trim().replace(/^"(.*)"$/, "$1");
          const passed = cleanedOutput === expectedOutput.trim();
          testResults.push({
            input,
            expectedOutput,
            output: cleanedOutput,
            passed,
          });
        }
      } catch (runError) {
        testResults.push({
          input,
          expectedOutput,
          output: runError.message,
          passed: false,
        });
      }
    }

    // Send the results
    console.log("Test results:", testResults);
    res.json({ testResults });
  } catch (error) {
    console.error("An error occurred during compilation or execution:", error);
    // console.log("Error details: --->", error);
    // console.log("Error details: --->", error.message);
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  } finally {
    // Clean up the temporary files
    try {
      await fs.unlink(filePath); // Delete the source file
      if (language === "cpp") {
        await fs.unlink(`${filePath}.out`); // Delete the output file if cpp
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }
};
