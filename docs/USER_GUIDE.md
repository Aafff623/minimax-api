# MiniMax Visual Tool - User Guide

## Getting Started

### First-Time Setup

1. **Obtain API Key**
   - Visit [MiniMax Console](https://platform.minimaxi.com)
   - Navigate to API Keys
   - Create a new API Key with appropriate permissions

2. **Configure the App**
   - Open the app and click Settings (gear icon)
   - Enter your API Key
   - (Optional) Set default values for your preferences

3. **Verify Connection**
   - Try a simple text-to-speech request
   - If successful, you're ready to go

---

## Speech Module

### Async Speech Synthesis

**Best for:** Long-form content, batch processing, narrated articles

**Steps:**

1. Navigate to Speech > Async
2. Enter your text (up to 100,000 characters)
3. Select a model:
   - `speech-2.8-hd` - High definition, best quality
   - `speech-2.8-turbo` - Faster generation
   - `speech-02-hd` / `speech-02-turbo` - Alternative models
4. Choose a voice from the 327-voice library
5. Adjust parameters:
   - **Speed** - 0.5x to 2.0x
   - **Pitch** - -12 to +12
   - **Volume** - 0 to 2.0
6. Click Generate
7. Wait for processing (poll every 3-5 seconds)
8. Download or play the result

### Sync Speech Synthesis

**Best for:** Real-time applications, interactive experiences

**Steps:**

1. Navigate to Speech > Stream
2. Enter text (up to 10,000 characters)
3. Select model and voice
4. Click Start Streaming
5. Audio plays in real-time as it's generated

### Voice Cloning

**Best for:** Creating consistent brand voice, personalized content

**Steps:**

1. Navigate to Speech > Clone
2. Upload audio sample (10 seconds - 5 minutes)
   - Supported formats: mp3, m4a, wav
   - File size: max 20MB
3. (Optional) Upload reference audio for better quality
4. Name your custom voice
5. Click Clone
6. Wait for processing (typically 1-2 minutes)
7. Preview your custom voice
8. Use it in Async or Stream synthesis

**Tips for Best Results:**
- Use clear audio without background noise
- Include varied emotional tones
- Avoid audio with excessive reverb

---

## Image Module

### Text-to-Image Generation

**Best for:** Illustrations, concept art, marketing visuals

**Steps:**

1. Navigate to Image
2. Enter a detailed prompt describing your desired image
3. Select style:
   - **General** - Versatile, balanced
   - **Realistic** - Photorealistic quality
   - **Anime** - Japanese animation style
   - **Logo** - Clean, simple designs
   - **Product** - Commercial photography style
4. Choose resolution: `1K` or `2K`
5. Set number of images (1-4)
6. Click Generate
7. Wait for processing
8. View results in gallery
9. Click any image for:
   - Full-size view
   - Download
   - Add to favorites

**Prompt Writing Tips:**
- Be specific about subjects, setting, and style
- Include details: lighting, mood, composition
- Example: "A serene Japanese garden at sunset, soft orange light filtering through bamboo, traditional stone lanterns, peaceful atmosphere, cinematic composition"

---

## Video Module

### Text-to-Video (T2V)

**Best for:** Scene visualization, concept demonstrations

**Steps:**

1. Navigate to Video > T2V
2. Enter prompt describing the video scene
3. (Optional) Select template for consistent style
4. Click Generate
5. Wait for processing (5-10 seconds polling)
6. Preview and download

### Image-to-Video (I2V)

**Best for:** Bringing static images to life

**Steps:**

1. Navigate to Video > I2V
2. Upload an image (jpg/png/webp, max 10MB)
3. Enter prompt describing desired motion
4. Click Generate
5. Wait for processing
6. Preview and download

### Subject-to-Video (S2V)

**Best for:** Consistent character animation

**Steps:**

1. Navigate to Video > S2V
2. Select a subject from your saved subjects
3. Enter prompt describing action/motion
4. Click Generate
5. Wait for processing
6. Preview and download

### Template Mode

**Best for:** Quick, professional-looking videos

**Steps:**

1. Navigate to Video > Template
2. Browse available templates
3. Select template that fits your needs
4. Fill in template-specific parameters
5. Click Generate

**Available Templates:**
- Classic - General purpose
- Anime Waifu - Cute anime character
- Anime Warema - Anime doll style
- Live Action - Realistic footage
- Scripted - Precise control
- Virtual Avatar - Digital human
- Portrait - Portrait-focused
- Character Animation - Game/animation character
- Product Showcase - E-commerce
- Scene Animation - Landscapes/backgrounds
- Custom - Your custom template

---

## Music Module

### Creating Music with AI

**Steps:**

1. Navigate to Music
2. Choose creation method:

   **AI Lyrics Generation:**
   - Enter a theme or topic
   - Select preferred music style
   - Click Generate Lyrics
   - Review and edit the generated LRC

   **Manual Lyrics:**
   - Click Lyrics Editor
   - Write your own lyrics
   - Use structure markers: `[verse]`, `[chorus]`, `[bridge]`
   - Add timestamps (auto-sync available)

3. Select style tags:
   - Pick 1-3 genre tags (Pop, Rock, Jazz, etc.)
   - Pick mood tags (Happy, Sad, Energetic, etc.)
   - Pick scene tags (Party, Study, Chill, etc.)

4. Click Generate Music
5. Wait for processing (30 seconds - 2 minutes)
6. Preview with built-in player
7. Download or share

**LRC Format Example:**

```lrc
[verse]
[00:05.00]First line of lyrics
[00:08.50]Second line of lyrics

[chorus]
[00:12.00]This is the chorus
[00:15.50]With more melody
```

### Lyrics Timeline

View and edit lyrics with synchronized playback:
- Click any timestamp to jump to that point
- Drag timestamps to adjust timing
- Split or merge lines

---

## AI Chat Module

### Basic Chat

**Steps:**

1. Navigate to Chat
2. Type your message in the input field
3. Press Enter or click Send
4. View streaming response in real-time

### Content Evaluation

Evaluate any generated content (speech, image, video, music):

**Steps:**

1. Generate content in any module
2. Click the "Send to AI Assistant" button
3. In Chat, view the automatic evaluation:
   - Quality score (1-10)
   - Strengths
   - Areas for improvement
   - Specific suggestions

### Feedback Enhancement

**Steps:**

1. After content evaluation, click "Apply Suggestions"
2. Review suggested parameter adjustments
3. Accept to auto-fill new parameters
4. Regenerate with improved settings

---

## History Module

### Viewing History

1. Navigate to History
2. Browse tasks organized by module
3. Use filters:
   - Module type (Speech/Image/Video/Music)
   - Status (All/Success/Failed/Pending)
   - Date range
4. Search by content/prompt

### Managing History

**Actions:**
- **View Details** - Click any task to see full details
- **Retry** - Re-run a failed task
- **Delete** - Remove task from history
- **Favorite** - Mark important results

### Storage

All history is stored locally via IndexedDB:
- Persists across sessions
- Export/Import available in Settings
- Clear all data option available

---

## Settings

### API Configuration

| Setting | Description |
|---------|-------------|
| API Key | Your MiniMax API key |
| Base URL | API endpoint (default: api.minimaxi.com) |

### Display Preferences

| Setting | Description |
|---------|-------------|
| Theme | Light / Dark / System |
| Language | Interface language |
| Auto-save | Save drafts automatically |

### Data Management

| Action | Description |
|--------|-------------|
| Export Data | Download all history as JSON |
| Import Data | Restore from backup |
| Clear History | Delete all local data |
| Clear Cache | Free up storage space |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Send message |
| `Ctrl + /` | Show shortcuts |
| `Esc` | Close dialog/modal |
| `Tab` | Navigate between inputs |

---

## Troubleshooting

### Common Issues

**"API Key invalid"**
- Verify key is correct
- Check key has required permissions
- Ensure no extra spaces

**"Rate limit exceeded"**
- Wait before retrying
- Check your quota usage in Settings

**"Generation failed"**
- Check input parameters
- Try reducing input length
- Retry with adjusted settings

**"WebSocket connection failed"**
- Check internet connection
- Disable firewall/proxy if needed
- Refresh page and try again

### Performance Tips

- Use async mode for long content
- Close unused browser tabs
- Clear history regularly to maintain speed
- Use favorites to save best results

---

## FAQ

**Q: Is my API key secure?**
A: Yes. Your API key is stored locally in your browser and is never sent to any server except MiniMax's API.

**Q: How is my data handled?**
A: All generated content URLs and your usage history are stored locally. No content is uploaded to external servers.

**Q: Can I use my own voices?**
A: Yes, via the Voice Clone feature. You can create custom voices from audio samples.

**Q: What's the difference between HD and Turbo models?**
A: HD models offer higher quality but slower generation. Turbo models are faster but may have slightly lower quality.

**Q: How do I check my remaining quota?**
A: View your quota usage in Settings > API Configuration.

**Q: Can I export my generated content?**
A: Yes. All generated content can be downloaded directly from the gallery or history views.

**Q: What formats are supported?**
A: Audio: mp3, wav, flac | Images: png, jpg, webp | Video: mp4

**Q: How do I report issues?**
A: Check the GitHub issues page for known issues and updates.
