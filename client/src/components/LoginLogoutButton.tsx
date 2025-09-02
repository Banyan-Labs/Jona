// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";
// import { signout } from "@/lib/auth-actions";

// const LoginButton = () => {
//   const [user, setUser] = useState<any>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchUser = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       setUser(user);
//     };
//     fetchUser();
//   }, []);

//   return user ? (
//     <button
//       onClick={() => {
//         signout();
//         setUser(null);
//       }}
//       className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//     >
//       Log out
//     </button>
//   ) : (
//     <button
//       onClick={() => {
//         router.push("/login");
//       }}
//       className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//     >
//       Login
//     </button>
//   );
// };

// export default LoginButton;