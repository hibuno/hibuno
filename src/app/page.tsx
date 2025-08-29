import React from "react";

export default function Home() {
 return (
  <div className="min-h-screen bg-black flex items-center justify-center px-8">
   <div className="max-w-3xl mx-auto text-left animate-fade-in">
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-8 leading-tight tracking-wide font-serif">
     Hello, I&apos;m{" "}
     <span className="font-normal border-b border-gray-400 pb-1">
      Muhibbudin Suretno
     </span>
    </h1>

    <div className="space-y-5 text-gray-300 text-sm md:text-base leading-relaxed font-sans">
     <p className="animate-fade-in-delay-1 tracking-normal">
      A passionate developer with nine years of experience transforming ideas
      into functional, elegant code. My technical toolkit spans JavaScript,
      TypeScript, CSS, HTML, and extends to PHP, Go, and Shell scripting.
     </p>

     <p className="animate-fade-in-delay-2 tracking-normal">
      My GitHub journey reflects continuous learning and creative
      problem-solving. Each repository represents a unique challenge conquered
      or innovative concept brought to life through clean, efficient code.
     </p>

     <p className="animate-fade-in-delay-3 tracking-normal">
      <a
       href="https://github.com/hibuno"
       target="_blank"
       rel="noopener noreferrer"
       className="text-blue-400 hover:text-blue-300 underline decoration-1 underline-offset-2 transition-colors duration-200"
      >
       github.com/hibuno
      </a>
     </p>

     <p className="animate-fade-in-delay-4 text-gray-500 text-xs md:text-sm tracking-normal italic font-serif">
      &quot;Hibuno&quot; is a playful abbreviation of my full name
      &quot;Muhibbudin Suretno&quot;. It might also be transliterated as ヒブノ
      in katakana, commonly used for names and borrowed words, carrying no
      inherent meaning but used phonetically.
     </p>

     <p className="animate-fade-in-delay-5 text-base md:text-lg text-white font-light pt-4 tracking-normal font-serif">
      Always eager to collaborate and push technological boundaries.
     </p>
    </div>
   </div>
  </div>
 );
}
