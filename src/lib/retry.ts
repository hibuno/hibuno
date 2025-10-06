export interface RetryOptions {
	maxAttempts?: number;
	delay?: number;
	backoff?: "linear" | "exponential";
	retryCondition?: (error: Error) => boolean;
}

export class RetryError extends Error {
	constructor(
		message: string,
		public readonly lastError: Error,
		public readonly attempts: number
	) {
		super(message);
		this.name = "RetryError";
	}
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const {
		maxAttempts = 3,
		delay = 1000,
		backoff = "exponential",
		retryCondition = () => true,
	} = options;

	let lastError: Error;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Don't retry if it's the last attempt or condition fails
			if (attempt === maxAttempts || !retryCondition(lastError)) {
				throw new RetryError(
					`Function failed after ${attempt} attempts`,
					lastError,
					attempt
				);
			}

			// Calculate delay with backoff
			const currentDelay =
				backoff === "exponential"
					? delay * Math.pow(2, attempt - 1)
					: delay * attempt;

			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, currentDelay));
		}
	}

	// This should never be reached, but TypeScript requires it
	throw lastError!;
}

/**
 * Retry database operations specifically
 */
export async function retryDatabaseOperation<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	return withRetry(fn, {
		maxAttempts: 3,
		delay: 1000,
		backoff: "exponential",
		retryCondition: (error) => {
			// Retry on network errors, timeouts, and temporary database issues
			const retryableErrors = [
				"NetworkError",
				"TimeoutError",
				"ConnectionError",
				"TemporaryError",
				"ECONNRESET",
				"ENOTFOUND",
				"ETIMEDOUT",
			];

			const message = error.message.toLowerCase();
			return retryableErrors.some((retryable) =>
				message.includes(retryable.toLowerCase())
			);
		},
		...options,
	});
}