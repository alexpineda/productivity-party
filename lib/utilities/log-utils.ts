/**
 * Appends a message to a local log file
 * @param message The message to append to the log
 * @param logFileName Optional custom log file name, defaults to 'app.log'
 */
export const appendToLog = async (
  message: string | object,
  logFileName: string = "app.log"
): Promise<void> => {
  // Only log in debug environment
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    const [{ default: fs }, { default: path }] = await Promise.all([
      import("fs"),
      import("path"),
    ]);

    const timestamp = new Date().toISOString();
    const formattedMessage =
      typeof message === "object" ? JSON.stringify(message) : message;
    const logMessage = `[${timestamp}] ${formattedMessage}\n`;
    const logPath = path.join(process.cwd(), logFileName);

    fs.appendFileSync(logPath, logMessage);
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
};
