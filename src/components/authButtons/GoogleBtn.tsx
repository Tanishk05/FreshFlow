"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion"; // 1. Import motion

// A simple, inline Google Icon SVG
const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.5H18.44C18.15 15.99 17.3 17.22 16.07 18.07V20.72H19.91C21.67 19.16 22.56 16.93 22.56 14.25V12.25Z"
      fill="#4285F4"
    />
    <path
      d="M12 23C14.97 23 17.45 22.04 19.28 20.72L16.07 18.07C15.01 18.79 13.62 19.25 12 19.25C9.08 19.25 6.6 17.36 5.64 14.8H2.18V17.54C3.76 20.73 7.55 23 12 23Z"
      fill="#34A853"
    />
    <path
      d="M5.64 14.8C5.43 14.22 5.31 13.61 5.31 13C5.31 12.39 5.43 11.78 5.64 11.2L5.64 11.2H2.18C1.47 12.4 1 13.7 1 15C1 16.3 1.47 17.6 2.18 18.76L5.64 14.8Z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.75C13.74 5.75 15.22 6.36 16.31 7.38L19.36 4.31C17.45 2.5 14.97 1 12 1C7.55 1 3.76 3.27 2.18 6.46L5.64 8.8C6.6 6.34 9.08 4.75 12 4.75L12 5.75Z"
      fill="#EA4335"
    />
  </svg>
);

export default function GoogleBtn() {
  return (
    // 2. Use motion.button for animations
    <motion.button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      // 3. Add extensive styling for a professional look
      className="
        w-full                   
        flex items-center justify-center gap-3
        mt-4  
        py-2.5 px-4              
        rounded-full            
        font-medium              
        text-gray-800           
        bg-white                 
        border border-gray-300   
        transition-colors        
        hover:bg-gray-50         
        dark:bg-gray-800         
        dark:border-gray-700
        dark:text-gray-200
        dark:hover:bg-gray-700
      "
      // 4. Add the same motion properties as your other buttons
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 5. Use the new Google Icon */}
      <GoogleIcon />
      Continue with Google
    </motion.button>
  );
}
