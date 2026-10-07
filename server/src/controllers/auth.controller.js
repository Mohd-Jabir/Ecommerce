import * as authService from "../services/auth.service.js";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/cookie.utils.js";
export async function register(req, res, next) {
  try {
    const response = await authService.register(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}
export async function login(req, res, next) {
  try {
    const response = await authService.login({
      ...req.body,
    });
    setRefreshTokenCookie(res, response.refreshToken);
    res.status(200).json({
      message: response.message,
      accessToken: response.accessToken,
      user: response.user,
    });
  } catch (error) {
    next(error);
  }
}
export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.logout(refreshToken);
    clearRefreshTokenCookie(res);
    res.status(200).json({ message: result.message });
  } catch (error) {
    next(error);
  }
}
export async function refreshAccessToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const response = await authService.refreshAccessToken(refreshToken);
    setRefreshTokenCookie(res, response.refreshToken);
    res.status(200).json({
      message: response.message,
      accessToken: response.accessToken,
      user: response.user,
    });
  } catch (error) {
    next(error);
  }
}
export async function getCurrentUser(req, res, next) {
  try {
      const response=await authService.getCurrentUser(req.user);
      res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
