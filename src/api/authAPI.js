// @ts-nocheck

import API from "./axios";

/**
 * Send a password reset email to the given email address.
 * Server always returns 200 (enumeration-safe).
 */
export const forgotPasswordAPI = async (email) => {
  const { data } = await API.post("/auth/forgot-password", { email });
  return data;
};

/**
 * Submit the new password using the raw token from the email link.
 */
export const resetPasswordAPI = async (token, newPassword) => {
  const { data } = await API.post(`/auth/reset-password/${token}`, { newPassword });
  return data;
};
