import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthUserProvider } from "@/context/AuthUserContext";
import AppShellAuth from "@/components/AppShellAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Job Scraper",
  description: "Job scraping application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthUserProvider>
            <AppShellAuth>{children}</AppShellAuth>
          </AuthUserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// import "./globals.css"; // Make sure this import is here
// import { Inter } from "next/font/google";
// import { ThemeProvider } from "@/context/ThemeContext";
// import { AuthUserProvider } from "@/context/AuthUserContext";
// // import Navbar from "@/components/navbar/Navbar";
// import AppShellAuth from "@/components/AppShellAuth";
// import type { AuthUser } from "@/types/index";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Job Scraper",
//   description: "Job scraping application",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <ThemeProvider>
//           <AuthUserProvider>
//             <AppShellAuth>{children}</AppShellAuth>
//           </AuthUserProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
