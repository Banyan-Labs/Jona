import { useContext } from "react";
import { AuthUserContext } from "../context/AuthUserContext";

// export const useUserContext = () => {
//   const context = useContext(AuthUserContext);
//   if (!context) {
//     throw new Error("useUserContext must be used within an AuthUserProvider");
//   }
//   return context;

// }
export const useUserContext = () => {
  const context = useContext(AuthUserContext);
  if (!context) throw new Error("useUserContext must be used within an AuthUserProvider");

  const { user, setUser, setCurrentPageAction } = context;
  const isAdmin = user?.user_metadata?.role === "admin";
  const isAuthenticated = !!user;

  return { user, setUser, setCurrentPageAction, isAdmin, isAuthenticated };
};