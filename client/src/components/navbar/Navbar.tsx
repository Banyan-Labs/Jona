"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  LogOut,
  Mail,
  Info,
  Shield,
  Menu,
  Settings,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import { useTheme } from "@/context/ThemeContext";

// Import the actual AuthUser type from your types file
import type { AuthUser } from "@/types/authUser";

interface NavbarProps {
  user: AuthUser | null;
  onLogoutAction: () => void;
  currentPage?: string;
  setCurrentPageAction?: (page: string) => void;
}

export default function Navbar({
  user,
  onLogoutAction,
  currentPage = "",
  setCurrentPageAction,
}: NavbarProps) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Get user role from either user_metadata or app_metadata
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  const isAdmin = role === "admin";
  const isAuthenticated = !!user;
  // Treat job_seeker and user the same way (regular user navigation)
  const isRegularUser = role === "user" || role === "job_seeker";

  // Individual button handlers for each navigation item
  const handleProfileClick = () => {
    if (setCurrentPageAction) setCurrentPageAction("profile");
    router.push("/profile");
    setIsMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (setCurrentPageAction) setCurrentPageAction("dashboard");
    router.push("/dashboard");
    setIsMenuOpen(false);
  };

  const handleAdminDashboardClick = () => {
    if (setCurrentPageAction) setCurrentPageAction("admin-dashboard");
    router.push("/admin/dashboard");
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    if (setCurrentPageAction) setCurrentPageAction("settings");
    router.push("/admin/settings");
    setIsMenuOpen(false);
  };

  const handleAboutClick = () => {
    if (setCurrentPageAction) setCurrentPageAction("about");
    router.push("/about");
    setIsMenuOpen(false);
  };

  const handleContactClick = () => {
    if (setCurrentPageAction) setCurrentPageAction("contact");
    router.push("/contact");
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    if (setCurrentPageAction) setCurrentPageAction("login");
    router.push("/login");
    setIsMenuOpen(false);
  };

  // Check if current page matches the nav item
  const isActive = (page: string) => currentPage === page;

  const navLinkClass = (page: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] ${
      isActive(page)
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
        : darkMode
        ? "text-gray-300 hover:text-gray-100 hover:bg-gray-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  const handleLogoClick = () => {
    if (isAuthenticated) {
      if (isAdmin) {
        handleAdminDashboardClick();
      } else {
        handleProfileClick();
      }
    } else {
      handleLoginClick();
    }
  };

  return (
    <nav
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        width: "100%",
      }}
      className={`shadow-lg border-b transition-colors duration-200 ${
        darkMode ? "border-gray-600" : "border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              JobTracker
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-4">
            {isAdmin ? (
              <>
                <button
                  onClick={handleAdminDashboardClick}
                  className={navLinkClass("admin-dashboard")}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin Dashboard
                </button>
                <button
                  onClick={handleSettingsClick}
                  className={navLinkClass("settings")}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleAboutClick}
                  className={navLinkClass("about")}
                >
                  <Info className="w-4 h-4 inline mr-2" />
                  About
                </button>
                <button
                  onClick={handleContactClick}
                  className={navLinkClass("contact")}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Contact
                </button>
              </>
            ) : (isAuthenticated && (isRegularUser || !role)) ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className={navLinkClass("profile")}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Profile
                </button>
                <button
                  onClick={handleDashboardClick}
                  className={navLinkClass("dashboard")}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={handleAboutClick}
                  className={navLinkClass("about")}
                >
                  <Info className="w-4 h-4 inline mr-2" />
                  About
                </button>
                <button
                  onClick={handleContactClick}
                  className={navLinkClass("contact")}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Contact
                </button>
              </>
            ) : null}
          </div>

          {/* Right Side: Mobile Menu + Theme + User */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200 hover:scale-110"
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Dark Mode
              </span>
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                className={`${
                  darkMode ? "bg-blue-600" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Toggle Dark Mode</span>
                <span
                  className={`${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>

            {/* User Info and Auth */}
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <User
                    className={`w-5 h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  {isAdmin && <Shield className="w-4 h-4 text-red-500" />}
                </div>
                <button
                  onClick={onLogoutAction}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    darkMode
                      ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      : "text-red-600 hover:text-red-800 hover:bg-red-50"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentPage === "login"
                    ? "bg-blue-600 text-white"
                    : darkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col space-y-2 pt-4 pb-4 border-t border-gray-300 dark:border-gray-700 animate-fade-in">
            {isAdmin ? (
              <>
                <button
                  onClick={handleAdminDashboardClick}
                  className={navLinkClass("admin-dashboard")}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin Dashboard
                </button>
                <button
                  onClick={handleSettingsClick}
                  className={navLinkClass("settings")}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleAboutClick}
                  className={navLinkClass("about")}
                >
                  <Info className="w-4 h-4 inline mr-2" />
                  About
                </button>
                <button
                  onClick={handleContactClick}
                  className={navLinkClass("contact")}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Contact
                </button>
              </>
            ) : (isAuthenticated && (isRegularUser || !role)) ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className={navLinkClass("profile")}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Profile
                </button>
                <button
                  onClick={handleDashboardClick}
                  className={navLinkClass("dashboard")}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={handleAboutClick}
                  className={navLinkClass("about")}
                >
                  <Info className="w-4 h-4 inline mr-2" />
                  About
                </button>
                <button
                  onClick={handleContactClick}
                  className={navLinkClass("contact")}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Contact
                </button>
              </>
            ) : null}
            {user && (
              <button
                onClick={() => {
                  onLogoutAction();
                  setIsMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  darkMode
                    ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    : "text-red-600 hover:text-red-800 hover:bg-red-50"
                }`}
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Logout
              </button>
            )}
            {!user && (
              <button
                onClick={handleLoginClick}
                className={`text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentPage === "login"
                    ? "bg-blue-600 text-white"
                    : darkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}