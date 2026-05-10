import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const getTokenFromRequest = (req) =>
  req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : req.body.token || req.query.token;

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Username and password are required",
      code: "MISSING_CREDENTIALS",
    });
  }

  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Incorrect password",
        code: "INCORRECT_PASSWORD",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong while logging in",
    });
  }
};


const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Username, email and password are required",
      code: "MISSING_FIELDS",
    });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }],
    });
    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({
        message: "User already exists",
        code: "USER_EXISTS",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(20).toString("hex");

    const newUser = new User({
      name: username.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      token,
    });

    await newUser.save();

    return res.status(httpStatus.CREATED).json({
      message: "Signup successful",
      token,
      user: {
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong while signing up",
    });
  }
};

const updateProfile = async (req, res) => {
  const token = getTokenFromRequest(req);
  const { username, avatar } = req.body;

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Authentication token is required",
      code: "TOKEN_MISSING",
    });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid session. Please login again",
        code: "TOKEN_INVALID",
      });
    }

    if (username && username.trim() !== user.username) {
      const existing = await User.findOne({ username: username.trim() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(httpStatus.CONFLICT).json({
          message: "Username already exists",
          code: "USER_EXISTS",
        });
      }
      user.username = username.trim();
      user.name = username.trim();
    }

    if (typeof avatar === "string") {
      user.avatar = avatar;
    }

    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Profile updated",
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong while updating profile",
    });
  }
};


const getUserHistory = async (req, res) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Authentication token is required",
      code: "TOKEN_MISSING",
    });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid session. Please login again",
        code: "TOKEN_INVALID",
      });
    }

    const meetings = await Meeting.find({
      $or: [{ user_id: user.username }, { user_id: user._id.toString() }],
    }).sort({ date: -1 });
    return res.status(httpStatus.OK).json(meetings);
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong while fetching history",
    });
  }
};

const addToHistory = async (req, res) => {
  const token = getTokenFromRequest(req);
  const { meeting_code } = req.body;

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Authentication token is required",
      code: "TOKEN_MISSING",
    });
  }

  if (!meeting_code) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Meeting code is required",
      code: "MEETING_CODE_MISSING",
    });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid session. Please login again",
        code: "TOKEN_INVALID",
      });
    }

    const newMeeting = new Meeting({
      user_id: user._id.toString(),
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    return res.status(httpStatus.CREATED).json({ message: "Meeting saved to history" });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong while saving meeting history",
    });
  }
};


export { login, register, getUserHistory, addToHistory, updateProfile }