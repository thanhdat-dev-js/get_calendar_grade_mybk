"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const constants_1 = require("./constants");
function getData({ username, password, method }) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const browser = yield puppeteer_1.default.launch({
                headless: true,
                args: constants_1.minimal_args,
            });
            const page = yield browser.newPage();
            yield page.goto("https://sso.hcmut.edu.vn/cas/login?service=https://mybk.hcmut.edu.vn/my/homeSSO.action");
            yield page.waitForSelector("#username");
            yield page.click("#username");
            yield page.type("#username", username);
            yield page.waitForSelector("#password");
            yield page.type("#password", password);
            yield page.waitForSelector(".btn-submit");
            yield page.click(".btn-submit");
            yield page.waitForNavigation();
            yield page.goto("https://mybk.hcmut.edu.vn/stinfo/", {
                waitUntil: "domcontentloaded",
            });
            const urlAddress = yield page.url();
            if (urlAddress != "https://mybk.hcmut.edu.vn/stinfo/") {
                yield browser.close();
                return resolve({
                    status: 0,
                    message: "Invalid password",
                });
            }
            else {
                yield page.waitForSelector(constants_1.config[method].selector);
                yield page.click(constants_1.config[method].selector);
                page.on("response", (response) => __awaiter(this, void 0, void 0, function* () {
                    if (response.url() == constants_1.config[method].url) {
                        console.log(`Get ${method} successfully: ${username}`);
                        const result = yield response.json();
                        yield browser.close();
                        return resolve({
                            status: 1,
                            data: result,
                        });
                    }
                }));
            }
        }
        catch (error) {
            reject(error);
        }
    }));
}
exports.getData = getData;
//# sourceMappingURL=index.js.map