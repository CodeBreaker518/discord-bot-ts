import puppeteer, { Browser, Page } from "puppeteer";

class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    this.browser = await puppeteer.launch({ headless: true });
    this.page = await this.browser.newPage();
    console.log("Browser initialized");
  }

  async getPage(): Promise<Page> {
    if (!this.page || !this.browser) {
      await this.initialize();
    }
    return this.page!;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log("Browser closed");
    }
  }
}

export const browserManager = new BrowserManager();
