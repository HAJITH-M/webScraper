import { useEffect } from "react";
import toast from "react-hot-toast";

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  toast.success("Logout successful");
  window.location.href = "/";
};

export const clearLocalStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  window.location.href = "/";
};

const LogOut = () => {
  useEffect(() => {
    logoutUser();
  }, []);

  return null;
};

export default LogOut;