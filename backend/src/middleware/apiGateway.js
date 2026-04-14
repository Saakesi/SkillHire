// src/middleware/apiGateway.js
import rateLimit from "express-rate-limit";

// General — all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many requests. Please slow down." }
});

// Auth — GitHub OAuth + OTP routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      20,                // max 20 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many auth attempts. Try again later." }
});

// Analyze — heavy BullMQ jobs
export const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max:      5,                 // max 5 analysis triggers per hour
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Analysis limit reached. Try again in an hour." }
});

// College verify OTP — prevent OTP spam
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max:      10,                // max 10 OTP requests per hour
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many OTP requests. Try again later." }
});

// Recruiter — job posts, searches
export const recruiterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      50,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many recruiter requests." }
});