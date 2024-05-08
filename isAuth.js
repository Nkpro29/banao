import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader && !authHeader.startsWith('Bearer ')){
    return res.status(400).json({
      status: "fail",
      message: "user is unauthorized.",
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, "Thisismysecret");
    req.decodedToken = decodedToken.userName;
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "authorization failed.",
    });
  }
  next();
  
};

export default isAuth ;