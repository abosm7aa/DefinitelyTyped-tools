import crypto from "crypto";
import { Minimatch } from "minimatch";

/**
 * Attempts to parse JSON text and returns `undefined` when the input is malformed or fails validation.
 */
export function tryParseJson(text: string): unknown;
export function tryParseJson<T>(text: string, predicate: (parsed: unknown) => parsed is T): T | undefined;
export function tryParseJson<T>(text: string, predicate?: (parsed: unknown) => parsed is T) {
  try {
    return parseJson(text, predicate);
  } catch {
    return undefined;
  }
}

/**
 * Parses JSON text and throws a descriptive error when the content is invalid or does not match the expected shape.
 */
export function parseJson(text: string): unknown;
export function parseJson<T>(text: string, predicate?: (parsed: unknown) => parsed is T): T;
export function parseJson<T>(text: string, predicate: (parsed: unknown) => parsed is T = (_): _ is T => true) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`${(err as Error).message} due to JSON: ${text}`);
  }
  if (!predicate(parsed)) {
    throw new Error("Parsed JSON did not match required form");
  }
  return parsed;
}

/** Returns the value unchanged. Useful for passing through generic identity helpers. */
export function identity<T>(t: T): T {
  return t;
}

/** Returns true when a value is a non-null object (including arrays and plain objects). */
export function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

/** Removes a known prefix from a string when present. */
export function withoutStart(s: string, start: string): string | undefined {
  return s.startsWith(start) ? s.slice(start.length) : undefined;
}

/** Computes a stable SHA-256 hash for a string using normalized newline semantics. */
export function computeHash(content: string): string {
  // Normalize line endings so equivalent files hash consistently across platforms.
  const normalContent = content.replace(/\r\n?/g, "\n");
  const h = crypto.createHash("sha256");
  h.update(normalContent, "utf8");
  return h.digest("hex");
}

/** Returns true when a package name is in the scoped `@scope/name` format. */
export function isScopedPackage(packageName: string): boolean {
  return packageName.startsWith("@");
}

/**
 * Converts the TypeScript package-name mangling convention back into a normal scoped package name.
 * For example, `foo__bar` becomes `@foo/bar`.
 */
// Based on `getPackageNameFromAtTypesDirectory` in TypeScript.
export function unmangleScopedPackage(packageName: string): string | undefined {
  const separator = "__";
  return packageName.includes(separator) ? `@${packageName.replace(separator, "/")}` : undefined;
}

/** The inverse of `unmangleScopedPackage`. */
export function mangleScopedPackage(packageName: string): string {
  return isScopedPackage(packageName) ? packageName.replace(/\//, "__").replace("@", "") : packageName;
}

/** Standard `@types/` package prefix used by DefinitelyTyped packages. */
export const atTypesSlash = "@types/";

/** Returns true when the package name is an `@types` package. */
export function isTypesPackageName(packageName: string): boolean {
  return packageName.startsWith(atTypesSlash);
}

function trimAtTypesPrefix(packageName: string): string {
  return packageName.slice(atTypesSlash.length);
}

/** Strips the `@types/` prefix only when it is present. */
export function trimAtTypesPrefixIfPresent(packageName: string): string {
  if (isTypesPackageName(packageName)) {
    return trimAtTypesPrefix(packageName);
  }
  return packageName;
}

/** Removes the `@types/` prefix and throws if the argument is not a types package name. */
export function mustTrimAtTypesPrefix(packageName: string): string {
  if (!isTypesPackageName(packageName)) {
    throw new Error(`Not a types package name: ${packageName}`);
  }
  return trimAtTypesPrefix(packageName);
}

/** Converts a DefinitelyTyped package name back to the original package name. */
export function typesPackageNameToRealName(typesPackageName: string) {
  const name = mustTrimAtTypesPrefix(typesPackageName);
  return unmangleScopedPackage(name) ?? name;
}

/** Resolves after waiting for the requested number of seconds. */
export async function sleep(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));
}

const declarationMatcher = new Minimatch("**/*.d.{ts,cts,mts,*.ts}", { optimizationLevel: 2 });

/** Returns true when the path points at a TypeScript declaration file. */
export function isDeclarationPath(path: string): boolean {
  if (process.platform === "win32") {
    path = path.replace(/\\/g, "/");
  }
  return declarationMatcher.match(path);
}
