class RateLimiter {
  constructor(maxRequestsPer10Seconds = 150, retryDelay = 2000) {
    this.maxRequestsPer10Seconds = maxRequestsPer10Seconds;
    this.retryDelay = retryDelay;
    this.queue = [];
    this.processing = false;
    this.requestCount = 0;
    this.resetTime = Date.now() + 10000;
  }

  async execute(fn, retries = 3) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, retries });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();

      if (now >= this.resetTime) {
        this.requestCount = 0;
        this.resetTime = now + 10000;
      }

      if (this.requestCount >= this.maxRequestsPer10Seconds) {
        const waitTime = Math.max(this.resetTime - now, 100);
        console.log(`Rate limit reached (${this.requestCount}/${this.maxRequestsPer10Seconds}), waiting ${waitTime}ms...`);
        await this.sleep(waitTime);
        continue;
      }

      const { fn, resolve, reject, retries } = this.queue.shift();
      this.requestCount++;

      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        if (error.response?.status === 429 && retries > 0) {
          const delay = this.retryDelay * (4 - retries);
          console.log(`TMDB rate limit hit (429), retrying in ${delay}ms...`);
          await this.sleep(delay);
          this.queue.unshift({ fn, resolve, reject, retries: retries - 1 });
          this.requestCount = 0;
          this.resetTime = Date.now() + 10000;
        } else if (error.response?.status === 401) {
          console.error('API Key error:', error.response?.data?.status_message);
          reject(error);
        } else {
          console.warn(`Request failed: ${error.message}`);
          resolve(null);
        }
      }

      if (this.queue.length > 0) {
        await this.sleep(20);
      }
    }

    this.processing = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      queueLength: this.queue.length,
      requestCount: this.requestCount,
      processing: this.processing
    };
  }
}

export default new RateLimiter();