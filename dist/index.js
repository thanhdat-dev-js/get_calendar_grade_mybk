"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const get_data_1 = require("./get_data");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.post("/api/:method", (req, res) => {
    const method = req.params.method;
    const { username, password } = req.body;
    if (method == "calendar" || method == "grade" || method == "test_schedule") {
        if (username && password) {
            (0, get_data_1.getData)({ username, password, method })
                .then((value) => {
                if (value.status) {
                    return res.json({
                        status: 1,
                        data: value.data,
                    });
                }
                else {
                    return res.json({
                        status: 0,
                        data: value.message,
                    });
                }
            })
                .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
        }
        else {
            res.json({
                status: 0,
                message: "Username and password are required",
            });
        }
    }
    else {
        res.json({ status: 0, message: "Invalid method" });
    }
});
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
//# sourceMappingURL=index.js.map