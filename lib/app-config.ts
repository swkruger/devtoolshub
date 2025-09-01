/**
 * Application configuration utilities
 * Centralizes app-wide configuration including dynamic app name
 */

/**
 * Get the application name from environment variables
 * Defaults to "DevToolsKitHub" if not set
 */
export function getApplicationName(): string {
  return process.env.APPLICATION_NAME || 'DevToolsKitHub';
}

/**
 * Get the application name for use in client components
 * This should be used for display purposes in the UI
 */
export function getClientApplicationName(): string {
  // For client components, we'll use a default since env vars aren't available
  // The actual value will be passed from server components or API calls
  return 'DevToolsKitHub';
}

/**
 * Get the application name for use in server components and API routes
 * This has access to environment variables
 */
export function getServerApplicationName(): string {
  return getApplicationName();
}

/**
 * Get the application name for use in metadata
 * Used in page titles, meta tags, etc.
 */
export function getMetadataApplicationName(): string {
  return getApplicationName();
}

/**
 * Get the application name for use in emails
 * Used in email subjects, content, etc.
 */
export function getEmailApplicationName(): string {
  return getApplicationName();
}

/**
 * Get the application name for use in documentation
 * Used in generated docs, help text, etc.
 */
export function getDocsApplicationName(): string {
  return getApplicationName();
}

/**
 * Get the application name for use in API responses
 * Used in API documentation, error messages, etc.
 */
export function getApiApplicationName(): string {
  return getApplicationName();
}
