const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  identifier: z.string().min(3, "Email or phone required"), // email or phone
  password: z.string().min(6)
});

const verifyOtpSchema = z.object({
  identifier: z.string().min(3),
  otp: z.string().length(6),
  purpose: z.enum(["register", "login", "reset_password"]).default("register")
});

const forgotPasswordSchema = z.object({
  identifier: z.string().min(3)
});

const resetPasswordSchema = z.object({
  identifier: z.string().min(3),
  otp: z.string().length(6),
  newPassword: z.string().min(6)
});

module.exports = { registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema };
