# 🎬 Automated Video Generation CLI

This CLI tool automatically generates professional video with sliding images, background music, and captions.

## 🚀 Features

- **Automatic Transcription**: Converts audio to captions using Whisper
- **Background Music**: Randomly selects background music at 15% volume
- **Sliding Animations**: Professional slide-up/fade-in and slide-down/fade-out effects
- **Professional Styling**: Glass morphism effects, elegant typography, and sophisticated design
- **Vertical Format**: Optimized for video (1080x1920)
- **Customizable**: Full control over colors, fonts, timing, and animations

## 📋 Requirements

- Node.js and npm
- FFmpeg (for audio processing)
- All project dependencies installed (`npm install`)

## 🎯 Quick Start

### 1. Basic Usage

```bash
npm run generate-video '{"audioPath": "/path/to/audio.wav", "mediaUrls": ["/path/to/image1.jpg", "/path/to/image2.jpg"], "titleText": "My Video"}'
```

### 2. View Usage Examples

```bash
npm run usage
```

### 3. Run Example

```bash
npm run example
```

## 📝 JSON Input Format

### Required Fields

```json
{
 "audioPath": "/path/to/your/audio.wav",
 "mediaUrls": [
  "/path/to/image1.jpg",
  "/path/to/image2.jpg",
  "/path/to/image3.jpg"
 ],
 "titleText": "Your Video Title"
}
```

### Optional Fields (with defaults)

```json
{
 "outputPath": "./generated-video-{timestamp}.mp4",
 "speechStartsAtSecond": 0,
 "titleColor": "#FFFFFF",
 "titleFontSize": 52,
 "backgroundColor": "#0a0a0a",
 "captionsTextColor": "#F8F9FA",
 "onlyDisplayCurrentSentence": true,
 "transitionDurationInSeconds": 0.8,
 "mediaFitMode": "cover",
 "audioOffsetInSeconds": 0
}
```

## 🎨 Customization Options

### Visual Settings

- `backgroundColor`: Background color (hex code)
- `titleColor`: Title text color
- `titleFontSize`: Title font size (20-100)
- `captionsTextColor`: Caption text color

### Animation Settings

- `transitionDurationInSeconds`: How long transitions take (0.1-2.0)
- `mediaFitMode`: How images fit ("cover", "contain", "fill")

### Audio Settings

- `speechStartsAtSecond`: When speech begins (helps with transcription)
- `audioOffsetInSeconds`: Audio start offset

## 🔄 Workflow

1. **Asset Preparation**: Copies and processes input files
2. **Audio Transcription**: Generates captions using Whisper AI
3. **Background Music**: Randomly selects from available tracks
4. **Video Rendering**: Creates the final video with Remotion
5. **Cleanup**: Removes temporary files
6. **Output**: Returns the path to the generated video

## 📁 File Structure

```
public/
├── backsounds/          # Background music files
│   ├── backsound-1.mp3
│   └── backsound-2.mp3
├── audio.wav           # Your audio file
└── sample-image-*.svg  # Sample images

src/
├── Video/          # Video component
├── helpers/            # Utility functions
└── Root.tsx           # Remotion composition

generate-video.ts       # Main CLI program
example-usage.ts        # Usage examples
```

## 🎵 Background Music

The system automatically selects background music from the `public/backsounds/` directory:

- Volume is set to 15% to ensure narration clarity
- Random selection for variety
- Add your own MP3 files to this directory

## 🎬 Output

The CLI returns only the path to the generated video file:

```bash
/absolute/path/to/your/generated-video.mp4
```

This makes it easy to integrate into other scripts or workflows.

## 🛠️ Advanced Usage

### Programmatic Usage

```typescript
import { generateVideo } from "./generate-video";

const config = {
 audioPath: "/path/to/audio.wav",
 mediaUrls: ["/path/to/image1.jpg"],
 titleText: "My Video",
};

const outputPath = await generateVideo(JSON.stringify(config));
console.log(`Video created: ${outputPath}`);
```

### Batch Processing

```bash
# Process multiple videos
for config in config1.json config2.json config3.json; do
  npm run generate-video "$(cat $config)"
done
```

## 🎯 Tips

1. **Audio Quality**: Use high-quality audio files for better transcription
2. **Image Resolution**: Use high-resolution images for better quality
3. **Speech Timing**: Set `speechStartsAtSecond` to skip intro music/noise
4. **File Paths**: Use absolute paths to avoid issues
5. **Output Directory**: Ensure the output directory exists

## 🐛 Troubleshooting

- **FFmpeg not found**: Install FFmpeg on your system
- **Transcription fails**: Check audio file format and quality
- **Rendering fails**: Ensure all image paths are valid
- **Permission errors**: Check file permissions and output directory

## 📄 License

Same as the main project license.
