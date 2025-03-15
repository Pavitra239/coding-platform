import axios from "axios";
import amqp from "amqplib";
import submission from "../models/submission.js";
import os from 'os';

// Configuration constants
// Use service names for Docker networking
const JUDGE0_BASE_URL = "http://localhost:80"; // Using nginx service name
const JUDGE0_TOKEN = "CHAUHANRUTVIK22IT015";

// RabbitMQ configuration with Docker service name
const RABBITMQ_URL = "amqp://judge0:judge0_rabbitmq_password_123@localhost:5672"; // Using rabbitmq service name
const QUEUES = {
  NORMAL: "code_execution_queue"
};

// In-memory metrics storage
const metrics = {
  totalJobsProcessed: 0,
  successfulJobs: 0,
  failedJobs: 0,
  averageProcessingTime: 0,
  activeJobs: 0,
  instanceRequestCounts: {},
};

// Utility functions
const decodeBase64 = (base64Str) => {
  if (!base64Str) return null;
  const buffer = Buffer.from(base64Str, "base64");
  return buffer.toString("utf-8");
};

const normalizeOutput = (output) => {
  if (!output || typeof output !== "string") {
    return "";
  }
  return output.replace(/\r\n/g, "\n").trim();
};

// Log server instance from response headers
const logServerInstance = (response, requestType) => {
  const instance = response.headers["x-server-instance"];
  console.log(`${requestType} handled by instance: ${instance}`);
  
  // Track instance usage in memory
  if (instance) {
    metrics.instanceRequestCounts[instance] = (metrics.instanceRequestCounts[instance] || 0) + 1;
  }
};

// Submit code to Judge0 with retry logic
const submitToJudge0 = async (submission, userId, retryCount = 3) => {
  const requestId = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  for (let i = 0; i < retryCount; i++) {
    try {
      const response = await axios.post(
        `${JUDGE0_BASE_URL}/submissions`,
        submission,
        {
          headers: {
            Authorization: `Bearer ${JUDGE0_TOKEN}`,
            "X-Request-ID": requestId,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      logServerInstance(response, "Submission");
      return response;
    } catch (error) {
      console.error(`Attempt ${i+1} failed:`, error.message);
      
      // If last retry, throw error
      if (i === retryCount - 1) throw error;
      
      // Exponential backoff with jitter
      const backoffTime = 1000 * Math.pow(2, i) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
};

// Fetch execution results with advanced retry logic
const fetchResults = async (token, userId) => {
  let result = null;
  let retries = 0;
  const maxRetries = 7; // Increased retries
  const maxWaitTime = 40000; // 40 seconds maximum wait time
  const startTime = Date.now();
  const requestId = `${userId}-result-${Date.now()}`;

  while (!result || result.status.id <= 2) { // Processing or In Queue
    if (Date.now() - startTime > maxWaitTime) {
      throw new Error("Execution time exceeded maximum wait time");
    }

    try {
      const response = await axios.get(
        `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true&fields=*`,
        {
          headers: {
            Authorization: `Bearer ${JUDGE0_TOKEN}`,
            "X-Request-ID": requestId,
          },
        }
      );

      result = response.data;
      logServerInstance(response, "Status Check");

      // If still processing, wait with exponential backoff
      if (result.status.id <= 2 && retries < maxRetries) {
        retries++;
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.min(Math.pow(1.5, retries), 5))
        );
        continue;
      }
      
      break;
    } catch (error) {
      if (retries >= maxRetries) throw error;
      retries++;
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.min(Math.pow(1.5, retries), 5))
      );
    }
  }

  return {
    ...result,
    compilationError: result.compile_output ? decodeBase64(result.compile_output) : null,
    standardError: result.stderr ? decodeBase64(result.stderr) : null,
    error: getErrorDescription(result.status.id),
  };
};

// Get more descriptive error messages based on status ID
const getErrorDescription = (statusId) => {
  const statusMap = {
    3: "Accepted",
    4: "Wrong Answer",
    5: "Time Limit Exceeded",
    6: "Compilation Error",
    7: "Runtime Error (SIGSEGV)",
    8: "Runtime Error (SIGXFSZ)",
    9: "Runtime Error (SIGFPE)",
    10: "Runtime Error (SIGABRT)",
    11: "Runtime Error (NZEC)",
    12: "Runtime Error (Other)",
    13: "Internal Error",
    14: "Exec Format Error"
  };
  
  return statusId in statusMap && statusId > 4 ? statusMap[statusId] : null;
};

// Process a job from the queue
const processJob = async (job) => {
  console.log(`Received code execution job: ${JSON.stringify(job)}`);
  const startTime = Date.now();
  const { userId, submissions, selectedTestCases, code, language, problemId, allTestCases } = job;
  
  // Handle both string and ObjectId format for userId
  const userIdStr = typeof userId === 'object' && userId.toString ? 
    userId.toString() : userId;

  console.log(`Starting job for user ${userIdStr}, problem ${problemId}`);
  metrics.activeJobs++;
  
  try {
    // Send code to Judge0 API with load balancing
    const submissionResponses = await Promise.all(
      submissions.map(subm => submitToJudge0(subm, userIdStr))
    );

    const tokens = submissionResponses.map(response => response.data.token);

    // Fetch execution results
    const results = await Promise.all(tokens.map(token => fetchResults(token, userIdStr)));

    // Process test results
    const testResults = results.map((result, index) => {
      const decodedOutput = decodeBase64(result.stdout?.trim() || "");
      const normalizedOutput = normalizeOutput(decodedOutput);
      const expectedOutput = normalizeOutput(selectedTestCases[index]?.outputs || "");

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

    // Compute performance metrics
    const overallTime = testResults.reduce(
      (sum, test) => sum + parseFloat(test.time || 0), 0
    ) * 1000; // Convert to ms
    
    const averageMemory = testResults.length > 0
      ? testResults.reduce((sum, test) => sum + parseInt(test.memory || 0), 0) / testResults.length
      : 0;

    const numberOfTestCase = testResults.length;
    const numberOfTestCasePass = testResults.filter(test => test.passed).length;

    // Calculate marks for each test case
    const testCaseResults = testResults.map((test, index) => ({
      input: test.input,
      expectedOutput: test.expectedOutput,
      output: test.output,
      error: test.error,
      passed: test.passed,
      time: test.time,
      memory: test.memory,
      is_hidden: selectedTestCases[index]?.is_hidden || false,
      marks: test.passed && selectedTestCases[index]?.marks
        ? selectedTestCases[index].marks
        : 0,
    }));

    const totalMarks = testCaseResults.reduce(
      (sum, test) => sum + test.marks, 0
    );
    const submissionStatus = numberOfTestCase === numberOfTestCasePass ? "completed" : "rejected";

    // Save the submission only if all test cases were run
    if (allTestCases) {
      const submissionPayload = {
        user_id: userId, // Use original userId format for MongoDB compatibility
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
        processed_at: new Date(),
      };

      await submission.create(submissionPayload);
    }

    // Update metrics
    metrics.totalJobsProcessed++;
    metrics.successfulJobs++;
    metrics.activeJobs--;
    const processingTime = Date.now() - startTime;
    metrics.averageProcessingTime = 
      (metrics.averageProcessingTime * (metrics.totalJobsProcessed - 1) + processingTime) 
      / metrics.totalJobsProcessed;

    console.log(`Job processed successfully for user: ${userIdStr} in ${processingTime}ms`);
    return { success: true, testCaseResults, totalMarks, submissionStatus };
  } catch (error) {
    console.error("Error processing job:", error);
    metrics.totalJobsProcessed++;
    metrics.failedJobs++;
    metrics.activeJobs--;
    return { success: false, error: error.message };
  }
};

// Process jobs from a specific queue
const processQueue = async (channel, queueName, prefetchCount) => {
  await channel.prefetch(prefetchCount);
  console.log(`Worker subscribed to queue: ${queueName} with prefetch ${prefetchCount}`);
  
  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      try {
        const job = JSON.parse(msg.content.toString());
        console.log(`Received job from ${queueName} for user: ${job.userId}`);
        await processJob(job);
        channel.ack(msg);
        console.log(`Job from ${queueName} for user: ${job.userId} processed successfully`);
      } catch (error) {
        console.error(`Error processing message from ${queueName}:`, error);
        // Requeue with delay if it's not a permanent failure
        if (error.retryable !== false) {
          setTimeout(() => {
            channel.nack(msg, false, true);
          }, 5000);
        } else {
          channel.ack(msg); // Acknowledge but don't retry
        }
      }
    } else {
      console.log(`No message received from ${queueName}`);
    }
  });
};

// Start the worker
const startWorker = async () => {
  try {
    console.log(`Starting worker on ${os.hostname()}`);
    
    // Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Setup queue
    await channel.assertQueue(QUEUES.NORMAL, { durable: true });
    
    // Process queue
    processQueue(channel, QUEUES.NORMAL, 2); // Medium concurrency
    
    // Reset active jobs count on startup
    metrics.activeJobs = 0;
    
    console.log("Worker is running and waiting for jobs...");
    
    // Report metrics periodically
    setInterval(() => {
      console.log("=== Worker Metrics ===");
      console.log(`Active jobs: ${metrics.activeJobs}`);
      console.log(`Total jobs processed: ${metrics.totalJobsProcessed}`);
      console.log(`Successful jobs: ${metrics.successfulJobs}`);
      console.log(`Failed jobs: ${metrics.failedJobs}`);
      console.log(`Average processing time: ${metrics.averageProcessingTime.toFixed(2)}ms`);
      console.log("=====================");
    }, 60000);
    
  } catch (error) {
    console.error("Error starting worker:", error);
    // Attempt to reconnect after delay
    setTimeout(startWorker, 10000);
  }
};

startWorker();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});