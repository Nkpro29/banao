import express from "express";

import authController from "./authcontroller.js";
import postController from "./postController.js";
import isAuth from "./isAuth.js";

const app = express();

app.use(express.json());

app.post("/register", authController.register);

app.post("/login", authController.login);

app.post("/forgotpassword",authController.forgotPassword);

app.post("/resetPassword/:token", authController.resetPassword);

app.post("/createpost",isAuth, postController.createPost);

app.get("/getallposts",isAuth, postController.getAllPosts);

app.get("/getPost/:postId",isAuth, postController.getPost);

app.put("/editpost/:postId",isAuth, postController.updatePost);

app.delete("/deletepost/:postId",isAuth, postController.deletePost);

app.post("/addlike/:postId",isAuth, postController.addLike);

app.post("/writecomment/:postId",isAuth, postController.writeComment);


const port = 4000;

app.listen(port, () => {
  console.log(`\x1b[33mThe app is running on ${port}\x1b[0m`);
});
