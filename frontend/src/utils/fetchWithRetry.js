/**
 * Custom fetch wrapper with exponential backoff retry logic for handling 429 (Too Many Requests).
 * Implementation provided by USER.
 * 
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Maximum number of retries
 * @param {number} delay - Base delay for exponential backoff
 * @returns {Promise<Response>} - The fetch Response object
 */
export async function fetchDataWithRetry(url, options, retries = 5, delay = 1000) {
    try {
        const response = await fetch(url, options);

        if (response.status === 429) {
            if (retries > 0) {
                const retryAfter = response.headers.get('Retry-After');
                let waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;

                // Add jitter
                waitTime = waitTime * (0.75 + Math.random() * 0.5);

                console.warn(`Rate limit hit. Retrying in ${Math.round(waitTime / 1000)} seconds... (Attempts left: ${retries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return fetchDataWithRetry(url, options, retries - 1, delay * 2);
            }
        }

        return response;

    } catch (error) {
        if (error instanceof TypeError && retries > 0) {
            console.warn(`Network error or timeout. Retrying in ${Math.round(delay / 1000)} seconds... (Attempts left: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchDataWithRetry(url, options, retries - 1, delay * 2);
        }
        console.error("Fetch failed:", error);
        throw error;
    }
}
