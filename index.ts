import express from "express";
import bodyParser from "body-parser";
import { getData } from "./get_data";
import dotenv from "dotenv";
dotenv.config();
const port: string | number = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello world!");
});
app.post("/api/:method", (req, res) => {
  const method = req.params.method;
  const { username, password } = req.body;

  if (
    method == "schedule" ||
    method == "grade" ||
    method == "test_schedule" ||
    method == "all"
  ) {
    if (username && password) {
      getData({ username, password, method })
        .then((value: any) => {
          if (value.status) {
            return res.json({
              status: 1,
              data: value.data,
            });
          } else {
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
    } else {
      res.json({
        status: 0,
        message: "Username and password are required",
      });
    }
  } else {
    res.json({ status: 0, message: "Invalid method" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
