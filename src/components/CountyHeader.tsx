
import React from "react";

const CountyHeader = () => (
  <header className="w-full flex items-center bg-black py-3 px-6">
    <img
      src="/lovable-uploads/00cc8120-039e-4419-8b2b-e07e69d6fdd8.png"
      alt="Nakuru County Logo"
      className="h-16 w-auto mr-6 rounded"
    />
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-[#fd3572] tracking-wide">
        NAKURU COUNTY
      </h1>
      <p className="text-md text-[#fd3572] font-semibold tracking-widest uppercase">
        County of Unlimited Opportunities
      </p>
    </div>
  </header>
);

export default CountyHeader;
