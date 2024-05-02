import express from "express";

import authController from "./authcontroller.js";

const app = express();

app.use(express.json());

app.post("/register", authController.register);

app.post("/login", authController.login);

app.post("/forgotpassword",authController.forgotPassword);

app.post("/resetPassword/:token", authController.resetPassword);

const port = 4000;

app.listen(port, () => {
  console.log(`\x1b[33mThe app is running on ${port}\x1b[0m`);
});
