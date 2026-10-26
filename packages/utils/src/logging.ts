import fs from "fs";

import { logDir } from "./lib/settings";
import { joinPaths } from "./fs";

import { writeFile } from "./io";

/** Anything capable of receiving messages is a logger. */
export type Logger = (message: string) => void;

/** Recording of every message sent to a Logger. */
export type Log = string[];

/** Stores two separate loggers. */
export interface LoggerWithErrors {
  info: Logger;
  error: Logger;
}

/** Recording of every message sent to a LoggerWithErrors. */
export interface LogWithErrors {
  infos: Log;
  errors: Log;
}

/** Logger that *just* outputs to the console and does not save anything. */
export const consoleLogger: LoggerWithErrors = {
  info: console.log,
  error: console.error,
};

/** Returns a logger that stores messages without emitting them to the console. */
export function quietLogger(): [Logger, () => Log] {
  const logged: Log = [];
  return [(message: string) => logged.push(message), () => logged];
}

/** Performs a side-effect and also records all logs. */
function alsoConsoleLogger(consoleLog: Logger): [Logger, () => Log] {
  const [log, logResult] = quietLogger();
  return [
    (message: string) => {
      consoleLog(message);
      log(message);
    },
    logResult,
  ];
}

/** Returns a logger that emits to the console and also records each message. */
export function logger(): [Logger, () => Log] {
  return alsoConsoleLogger(consoleLogger.info);
}

/** Helper for creating `info` and `error` loggers together. */
function loggerWithErrorsHelper(
  loggerOrQuietLogger: () => [Logger, () => Log],
): [LoggerWithErrors, () => LogWithErrors] {
  const [info, infoResult] = loggerOrQuietLogger();
  const [error, errorResult] = loggerOrQuietLogger();
  return [{ info, error }, () => ({ infos: infoResult(), errors: errorResult() })];
}

/** Records `info` and `error` messages without writing to console. */
export function quietLoggerWithErrors(): [LoggerWithErrors, () => LogWithErrors] {
  return loggerWithErrorsHelper(quietLogger);
}

/** Records `info` and `error` messages while also writing them to the console. */
export function loggerWithErrors(): [LoggerWithErrors, () => LogWithErrors] {
  return loggerWithErrorsHelper(logger);
}

/**
 * Move everything from one Log to another logger.
 * This is useful for performing several tasks in parallel, but outputting their logs in sequence.
 */
export function moveLogs(dest: Logger, src: Log, mapper?: (message: string) => string): void {
  for (const line of src) {
    dest(mapper ? mapper(line) : line);
  }
}

/** Performs `moveLogs` for both informational and error output streams. */
export function moveLogsWithErrors(
  dest: LoggerWithErrors,
  { infos, errors }: LogWithErrors,
  mapper?: (message: string) => string,
): void {
  moveLogs(dest.info, infos, mapper);
  moveLogs(dest.error, errors, mapper);
}

/** Resolves the full filesystem path for a named log file under the shared log directory. */
export function logPath(logName: string): string {
  return joinPaths(logDir, logName);
}

/** Writes a log entry set to disk, creating the log directory as needed. */
export async function writeLog(logName: string, contents: readonly string[]): Promise<void> {
  await fs.promises.mkdir(logDir, { recursive: true });
  await writeFile(logPath(logName), contents.join("\r\n"));
}

/** Combines normal output with the error section when any errors were emitted. */
export function joinLogWithErrors({ infos, errors }: LogWithErrors): Log {
  return errors.length ? infos.concat(["", "=== ERRORS ===", ""], errors) : infos;
}

/** Removes the shared log directory and all files under it. */
export function cleanLogDirectory() {
  fs.rmSync(logDir, { recursive: true, force: true });
}
