import puppeteer from "puppeteer";
import { minimal_args, config } from "./constants";

interface Props {
  username: string;
  password: string;
  method: "calendar" | "grade" | "test_schedule" | "all";
}

export function getData({ username, password, method }: Props) {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
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
      await page.waitForNavigation();
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
        if (method == "all") {
          const result: any = {
            status: 1,
            data: {},
          };
          await page.waitForSelector(config["calendar"].selector);
          await page.click(config["calendar"].selector);
          page.on("response", async (response) => {
            if (response.url() == config["calendar"].url) {
              console.log(`Get calendar successfully: ${username}`);
              result.data.calendar = await response.json();
              await page.click("#tab-menu-home");
              await page.waitForSelector(config["grade"].selector);
              await page.click(config["grade"].selector);
              page.on("response", async (response) => {
                if (response.url() == config["grade"].url) {
                  console.log(`Get test_schedule successfully: ${username}`);
                  result.data.grade = await response.json();
                  await page.click("#tab-menu-home");
                  await page.waitForSelector(config["test_schedule"].selector);
                  await page.click(config["test_schedule"].selector);
                  page.on("response", async (response) => {
                    if (response.url() == config["test_schedule"].url) {
                      console.log(
                        `Get test_schedule successfully: ${username}`
                      );
                      result.data.test_schedule = await response.json();
                      await browser.close();
                      return resolve(result);
                    }
                  });
                }
              });
            }
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
                data: {
                  [method]: result,
                },
              });
            }
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}
