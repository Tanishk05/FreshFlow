import React from "react";

export default function Footer() {
  return (
    <footer className="py-12 px-4 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-sm relative z-10 pb-20 md:pb-12">
      <div className="container mx-auto max-w-6xl text-center text-gray-500 dark:text-gray-400">
        <div className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">
          Agridata<span className="text-green-400 dark:text-green-600">.</span>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Agridata. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
