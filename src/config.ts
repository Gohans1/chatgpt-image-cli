import { homedir } from "node:os";
import { join } from "node:path";

export const CHATGPT_URL = "https://chatgpt.com/";
export const CHROME_EXECUTABLE_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
export const USER_DATA_DIR = join(homedir(), ".chatgpt-image-cli", "profile");
export const LAUNCHER_DESCRIPTOR_PATH = join(
  homedir(),
  ".codex-chatgpt-web",
  "runtime",
  "launcher-browser.json"
);

export const SELECTORS = {
  composer: '#prompt-textarea, div[contenteditable="true"], [data-testid="prompt-textarea"]',
  sendButton: '[data-testid="send-button"]',
  stopButton: '[data-testid="stop-button"]',
  generatedImage: 'img[src*="backend-api/estuary"], img[src*="files.oaiusercontent.com"], img[alt*="Generated image"], img[src*="oaidalleapiprodscus"]',
  loginButton: 'button[data-testid="login-button"], a[href*="/auth/login"]',
};
