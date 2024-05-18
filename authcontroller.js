import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const users = [];
const resetTokens = [];

const ENCRYPTION_KEY = 'b14ca5898a4e4133bbce2ea2315a1916';
const IV_LENGTH = 16; 

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (text) => {
  const [iv, encryptedText] = text.split(':').map(part => Buffer.from(part, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
};


const generateToken = (userName) => {
  const token = jwt.sign({ userName }, "Thisismysecret", { expiresIn: "7d" });
  return token;
};

const register = async (req, res) => {
  const { userName, password, email } = req.body;

  if (users.some((user) => user.userName === userName)) {
    return res.status(400).json({
      status: "fail",
      message: "Username already taken",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedEmail = encrypt(email);
    users.push({ userName, password: hashedPassword, email: encryptedEmail });
    return res.status(201).json({
      status: "success",
      message: "user is successfully registered",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "failed in registration",
    });
  }
};

const login = async (req, res) => {
  const { userName, password } = req.body;
  const user = users.find((user) => user.userName === userName);
  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "User does not exist",
    });
  }
  
  try {
    if (await bcrypt.compare(password, user.password)) {
      const decryptedEmail = decrypt(user.email);
      const encryptedEmail = encrypt(user.email);
      return res.status(200).json({
        status: "success",
        message: "user successfully logged in",
        email: decryptedEmail,
        encryptedEmail: encryptedEmail,
        token: generateToken(userName),
      });
    } else {
      return res.status(401).json({
        status: "fail",
        message: "incorrect password",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  crypto.createHash("sha256").update(resetToken).digest("hex");
  return resetToken;
};

const forgotPassword = async (req, res) => {
  const { userName } = req.body;
  const user = users.find((user) => user.userName === userName);
  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "User does not exist",
    });
  }
  try {
    const resetToken = generateResetToken();
    resetTokens.push({ userName: userName, resetToken: resetToken });

    return res.status(200).json({
      status: "success",
      resetToken: resetToken,
      message: "user successfully logged in",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "error occured in generating reset token.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userName, newPassword, newConfirmPassword } = req.body;
    const token = req.params.token;
    const requiredToken = resetTokens.find(
      (user) => user.userName === userName && user.resetToken === token
    );

    if (!requiredToken) {
      return res.status(400).json({
        status: "fail",
        message: "invalid token",
      });
    }

    const user = users.find((user) => user.userName === userName);

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "user not found",
      });
    }

    if (newPassword !== newConfirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "password and confirm password are not same.",
      });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    resetTokens.splice(resetTokens.indexOf(requiredToken), 1);

    return res.status(200).json({
      status: "success",
      message: "password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "error occured in generating reset token.",
    });
  }
};

export default { register, login, forgotPassword, resetPassword };
