const posts = [];

const generateUniqueId = (authorId) => {
  return Date.now() + `${authorId}`;
};

const createPost = (req, res) => {
  const authorId = req.decodedToken;
  const { content } = req.body;
  const newPost = {
    postId: generateUniqueId(authorId),
    authorId: authorId,
    content: content,
    likes: 0,
    comments: [],
  };
  try {
    posts.push(newPost);
    console.log("posts ==> ", posts);
    return res.status(201).json({
      status: "success",
      message: "a post is created successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getAllPosts = (req, res) => {
  try {
    return res.status(201).json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

const getPost = (req, res) => {
  try {
    const postId = req.params.postId;
    const post = posts.find((i) => i.postId === postId);
    if (!post) {
      return res.status(400).json({
        status: "fail",
        message: "No such post exists.",
      });
    }
    return res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

const updatePost = (req, res) => {
  try {
    const postId = req.params.postId;
    const { updatedContent } = req.body;
    const postInd = posts.findIndex((i) => i.postId === postId);
    if (postInd == -1) {
      return res.status(400).json({
        status: "fail",
        message: "No such post exists.",
      });
    }
    posts[postInd].content = updatedContent;
    return res.status(202).json({
      status: "success",
      data: posts[postInd],
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

const deletePost = (req, res) => {
  try {
    const userId = req.decodedToken;
    const postId = req.params.postId;
    const postInd = posts.findIndex((i) => i.postId === postId);
    if (postInd == -1) {
      return res.status(400).json({
        status: "fail",
        message: "No such post exists.",
      });
    }
    if (posts[postInd].authorId === userId) {
      posts.splice(postInd, 1);
      return res.status(204).json({
        status: "success",
        data: posts,
      });
    }else{
      return res.status(400).json({
        status: "fail",
        message: "post can only be deleted by author.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

const userLikes = [];

const addLike = (req, res) => {
  try {
    const userId = req.decodedToken;
    const postId = req.params.postId;

    const isLiked = userLikes.some(
      (like) => like.postId === postId && like.userId === userId
    );
    if (isLiked) {
      return res.status(400).json({
        status: "fail",
        message: "already liked the post.",
      });
    }

    const post = posts.find((i) => i.postId === postId);
    if (!post) {
      return res.status(400).json({
        status: "fail",
        message: "No such post exists.",
      });
    }
    post.likes++;
    userLikes.push({ userId, postId });
    return res.status(201).json({
      status: "success",
      data: post,
      message: "a like added",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

const writeComment = (req, res) => {
  try {
    const userId = req.decodedToken;
    const postId = req.params.postId;
    const comment = req.body.comment;
    const postInd = posts.findIndex((i) => i.postId === postId);
    if (postInd == -1) {
      return res.status(400).json({
        status: "fail",
        message: "No such post exists.",
      });
    }
    const newComment = {
      userId: userId,
      comment: comment,
    };
    posts[postInd].comments.push(newComment);
    return res.status(201).json({
      status: "success",
      data: posts,
      message: "comment added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

export default {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  addLike,
  writeComment,
};
