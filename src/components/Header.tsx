
import React from "react";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  return (
    <header className="border-b py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <div className="bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center rounded-lg mr-3">
          <span className="font-bold text-lg">Σ</span>
        </div>
        <h1 className="font-bold text-xl">Draw & Solve</h1>
      </div>
      
      <ThemeToggle />
    </header>
  );
};

export default Header;
