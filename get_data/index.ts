import puppeteer from "puppeteer";
import { minimal_args, config } from "./constants";

interface Props {
  username: string;
  password: string;
  method: "calendar" | "grade" | "test_schedule";
}

export function getData({ username, password, method }: Props) {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        args: minimal_args,
      });
      const page = await browser.newPage();
      await page.goto(
        "https://sso.hcmut.edu.vn/cas/login?service=https://mybk.hcmut.edu.vn/my/homeSSO.action"
      );
      await page.waitForSelector("#username");
      await page.click("#username");
      await page.type("#username", username);
      await page.waitForSelector("#password");
      await page.type("#password", password);
      await page.waitForSelector(".btn-submit");
      await page.click(".btn-submit");
      await page.goto("https://mybk.hcmut.edu.vn/stinfo/", {
        waitUntil: "domcontentloaded",
      });
      const urlAddress = await page.url();
      if (urlAddress != "https://mybk.hcmut.edu.vn/stinfo/") {
        await browser.close();
        return resolve({
          status: 0,
          message: "Invalid password",
        });
      } else {
        await page.waitForSelector(config[method].selector);
        await page.click(config[method].selector);
        page.on("response", async (response) => {
          if (response.url() == config[method].url) {
            console.log(`Get ${method} successfully: ${username}`);
            const result = await response.json();
            await browser.close();
            return resolve({
              status: 1,
              data: result,
            });
          }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}
