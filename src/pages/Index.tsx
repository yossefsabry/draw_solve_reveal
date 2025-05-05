
import React from "react";
import Header from "@/components/Header";
import DrawingCanvas from "@/components/drawing/DrawingCanvas";

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow overflow-hidden">
        <DrawingCanvas className="h-full" />
      </main>
    </div>
  );
};

export default Index;
