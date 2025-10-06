"use client";

interface SocialMediaInfoProps {
 socialMedias: string[];
}

export function SocialMediaInfo({ socialMedias }: SocialMediaInfoProps) {
 const getSocialIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes("twitter") || platformLower.includes("x.com")) {
   return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
     <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
   );
  } else if (platformLower.includes("discord")) {
   return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
     <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0787.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0787-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0003 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
    </svg>
   );
  } else if (platformLower.includes("linkedin")) {
   return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
   );
  } else if (platformLower.includes("youtube")) {
   return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
     <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
   );
  } else {
   return (
    <svg
     className="w-4 h-4"
     fill="none"
     stroke="currentColor"
     viewBox="0 0 24 24"
    >
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
     />
    </svg>
   );
  }
 };

 return (
  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-800 dark:to-indigo-700 rounded-lg border border-blue-200 dark:border-blue-600">
   <span className="text-sm font-medium text-blue-700 dark:text-blue-300 mr-2">
    Follow:
   </span>
   {socialMedias.map((social, index) => (
    <a
     key={index}
     href={social.startsWith("http") ? social : `https://${social}`}
     target="_blank"
     rel="noopener noreferrer"
     className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-900 rounded-full border border-blue-200 dark:border-blue-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group"
    >
     <div className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
      {getSocialIcon(social)}
     </div>
    </a>
   ))}
  </div>
 );
}
