# Video Generator

The Video Generator is a comprehensive system that converts blog posts into engaging videos using AI-powered narration and text-to-speech technology.

## Features

- **AI Narration Generation**: Uses OpenRouter API to convert article content into engaging 1.5-minute narration scripts
- **Text-to-Speech**: Integrates with ElevenLabs API for high-quality voice synthesis
- **Asset Extraction**: Automatically extracts images and videos from article content
- **Video Generation**: Executes external video generation programs on the server
- **Step-by-Step Workflow**: Guided 4-step process for easy video creation
- **Form Validation**: Comprehensive validation and error handling
- **Responsive UI**: Modern, accessible interface built with React and Tailwind CSS

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# OpenRouter API for AI narration generation
OPENROUTER_API_KEY=your_openrouter_api_key_here

# ElevenLabs API for text-to-speech
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Application URL (for OpenRouter API headers)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. API Keys Setup

#### OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account and navigate to "API Keys"
3. Generate a new API key
4. Add it to your `.env.local` file as `OPENROUTER_API_KEY`

#### ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Create an account and go to your profile
3. Navigate to "API Keys" section
4. Generate a new API key
5. Add it to your `.env.local` file as `ELEVENLABS_API_KEY`

### 3. Video Generation Dependencies

For the video generation to work properly, you'll need:

- **FFmpeg**: For video processing and creation
- **ImageMagick**: For image manipulation (optional)
- **Bash**: For script execution

Install on macOS:

```bash
brew install ffmpeg imagemagick
```

Install on Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install ffmpeg imagemagick
```

## Usage

### Accessing the Video Generator

1. Navigate to any blog post
2. Go to the admin edit page: `/admin/edit/[slug]`
3. Click on the "Video Generator" button or navigate to `/admin/video/[slug]`

### Video Generation Process

The video generator follows a 4-step process:

1. **Setup**:

   - Enter video title
   - Choose narration style (engaging, professional, casual, dramatic, educational)
   - Review extracted assets from the article

2. **Narration**:

   - AI generates a 1.5-minute narration script from your article
   - Uses OpenRouter API with Claude for high-quality narrative generation
   - Target: ~150 words for optimal pacing

3. **Audio**:

   - Convert narration to speech using ElevenLabs
   - Choose from multiple voice options
   - Customize voice settings (stability, similarity boost, style)

4. **Video**:
   - Execute external video generation program
   - Combines audio with article assets
   - Creates final video file

### Supported Asset Types

The system automatically extracts:

- **Images**: `![alt text](image-url)`
- **Videos**: `<video src="video-url"></video>`
- **Links**: `[text](url)` (converted to visual elements)

## API Endpoints

### Generate Narration

```http
POST /api/admin/video/generate-narration
Content-Type: application/json

{
  "content": "Article content...",
  "style": "engaging"
}
```

**Response:**

```json
{
 "narration": "Generated narration script...",
 "wordCount": 150,
 "style": "engaging"
}
```

### Generate Audio

```http
POST /api/admin/video/generate-audio
Content-Type: application/json

{
  "text": "Narration script...",
  "voiceSettings": {
    "voiceId": "21m00Tcm4TlvDq8ikWAM",
    "model": "eleven_monolingual_v1",
    "voiceSettings": {
      "stability": 0.5,
      "similarity_boost": 0.5,
      "style": 0.0,
      "use_speaker_boost": true
    }
  }
}
```

**Response:**

```json
{
 "audioUrl": "data:audio/mpeg;base64,...",
 "format": "mp3",
 "size": 12345,
 "voiceId": "21m00Tcm4TlvDq8ikWAM",
 "model": "eleven_monolingual_v1"
}
```

### Generate Video

```http
POST /api/admin/video/generate-video
Content-Type: application/json

{
  "title": "Video Title",
  "audioUrl": "data:audio/mpeg;base64,...",
  "assets": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg",
      "alt": "Image description"
    }
  ],
  "postSlug": "post-slug"
}
```

**Response:**

```json
{
 "videoUrl": "/videos/video_123.mp4",
 "videoId": "video_123",
 "title": "Video Title",
 "status": "completed",
 "generationLog": "Generation log..."
}
```

## Voice Options

ElevenLabs provides multiple voice options:

- **Rachel** (Default): `21m00Tcm4TlvDq8ikWAM`
- **Domi**: `AZnzlk1XvdvUeBnXmlld`
- **Bella**: `EXAVITQu4vr4xnSDxMaL`
- **Antoni**: `ErXwobaYiN019PkySvjV`
- **Arnold**: `VR6AewLTigWG4xSOukaG`
- **Adam**: `pNInz6obpgDQGcFmaJgB`
- **Sam**: `yoZ06aMxZJJ28mfd3POQ`

## Narration Styles

- **Engaging**: Conversational and compelling for general audiences
- **Professional**: Formal and business-appropriate tone
- **Casual**: Friendly and approachable style
- **Dramatic**: Expressive with emphasis and pauses
- **Educational**: Clear and instructional approach

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors**: Form validation with user-friendly messages
- **API Errors**: Proper error responses from external services
- **Network Issues**: Retry mechanisms and fallback options
- **File Processing**: Error handling for asset extraction and processing

## Troubleshooting

### Common Issues

1. **"OpenRouter API key not configured"**

   - Ensure `OPENROUTER_API_KEY` is set in `.env.local`
   - Verify the API key is valid and has credits

2. **"ElevenLabs API key not configured"**

   - Ensure `ELEVENLABS_API_KEY` is set in `.env.local`
   - Verify the API key has proper permissions

3. **"Video generation failed"**

   - Check if FFmpeg is installed and accessible
   - Verify file permissions for video output directory
   - Check server logs for detailed error messages

4. **"No assets found"**
   - Ensure article contains images or videos in proper markdown format
   - Check if image URLs are accessible

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=video-generator:*
```

## Security Considerations

- API keys are stored securely in environment variables
- Input validation prevents malicious content
- File upload restrictions for security
- Rate limiting on API endpoints (recommended)

## Performance Optimization

- Audio files are cached to avoid regeneration
- Video generation runs asynchronously
- Asset optimization for faster processing
- Progress tracking for long-running operations

## Future Enhancements

- Batch video generation
- Custom video templates
- Advanced asset management
- Video editing capabilities
- Social media optimization
- Analytics integration
