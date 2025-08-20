"use client";

import { useState } from "react";
import AuthForm from "@/components/AuthForm";
import { AuthUser } from "@/types/application"; // or define this in a shared types file if needed

export default function LoginPageWrapper() {
  const [currentPage, setCurrentPage] = useState<"login" | "register" | "dashboard">("login");

  // Match expected AuthUser type from AuthForm
  const handleSuccess = (user: AuthUser) => {
    console.log("User logged in:", user);
    setCurrentPage("dashboard");
  };

  // Wrap the setter in a function to match `(page: string) => void`
  const handlePageChange = (page: string) => {
    setCurrentPage(page as "login" | "register" | "dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <AuthForm
        mode={currentPage === "register" ? "register" : "login"}
        onSuccessAction={handleSuccess}
        setCurrentPageAction={handlePageChange}
      />
    </div>
  );
}