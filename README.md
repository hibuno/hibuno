# Hello, I'm Muhibbudin Suretno 👋

A passionate developer with nine years of experience transforming ideas into functional, elegant code. My technical toolkit spans JavaScript, TypeScript, CSS, HTML, and extends to PHP, Go, and Shell scripting, allowing me to craft versatile solutions across front-end and back-end technologies.

My GitHub journey is a testament to continuous learning and creative problem-solving. Each repository represents a unique challenge conquered, a problem solved, or an innovative concept brought to life. From intricate web applications to streamlined scripts, I'm committed to writing clean, efficient code that makes a difference.

> The nickname **"hibuno"** is a playful abbreviation derived from my full name "Mu*hib*budin S*u*ret*no*". Since **"hibuno"** could be a name or non-Japanese word, it might also be transliterated as **ヒブノ** in katakana, which is commonly used for names and borrowed words. It doesn't inherently carry a meaning but is used phonetically.

Always eager to collaborate and push technological boundaries, I'm here to turn concepts into reality.

_Coding is not just my profession—it's my passion._

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Editor**: TipTap rich text editor
- **File Storage**: UploadThing (images & videos)
- **Analytics**: Vercel Analytics

## File Uploads

This project uses [UploadThing](https://uploadthing.com) for file storage. Images and videos uploaded through the editor are stored securely in the cloud.

### Supported uploads:

- **Images**: Up to 4MB, max 10 files per upload
- **Videos**: Up to 64MB, max 5 files per upload

### Setup

1. Create an account at [uploadthing.com](https://uploadthing.com)
2. Create a new app and get your token
3. Add `UPLOADTHING_TOKEN` to your `.env` file

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun build
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_NODE_ENV=local
ACCESS_KEY=your-random-access-key
UPLOADTHING_TOKEN=your-uploadthing-token
```
