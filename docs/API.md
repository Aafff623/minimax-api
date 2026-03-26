# MiniMax Visual Tool - API Documentation

## Overview

MiniMax Visual Tool interacts with MiniMax API to provide AI-powered content generation. All API calls are made directly from the browser (no BFF layer).

### Base URL

```
https://api.minimaxi.com
```

### Authentication

All API requests require an API Key passed via the `Authorization` header:

```
Authorization: Bearer ${API_KEY}
```

### Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
```

### Task-Based APIs

Content generation APIs (speech, image, video, music) use an async task model:

1. Submit task -> Returns `task_id`
2. Poll task status -> `GET /v1/tasks/{task_id}`
3. Fetch result when complete -> `file_id` or `url`

---

## Speech Module

### Async Speech Synthesis

```http
POST https://api.minimaxi.com/v1/t2a_async_v2
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| model | string | Yes | `speech-2.8-hd`, `speech-2.8-turbo`, `speech-2.6-hd`, `speech-2.6-turbo`, `speech-02-hd`, `speech-02-turbo` |
| text | string | Yes* | Text to synthesize (*or `file_id`) |
| file_id | string | Yes* | File ID for long text (*or `text`) |
| voice_id | string | Yes | Voice ID from the 327-voice library |
| speed | float | No | 0.5-2.0, default 1.0 |
| pitch | int | No | -12 to 12, default 0 |
| vol | float | No | 0-2.0, default 1.0 |
| audio_sample_rate | int | No | 32000, 16000, 8000, default 32000 |
| bitrate | int | No | 128000, 64000, 32000, default 128000 |
| format | string | No | `mp3`, `wav`, `flac`, default `mp3` |
| return_timestamps | bool | No | Include timestamps, default false |
| sound_effects | string | No | `spacious_echo`, `cave_echo`, `church_ambience`, `robot`, `chipmunk` |

**Response:**

```json
{
  "task_id": "task_xxxxx",
  "status": "Pending"
}
```

### Sync Speech Synthesis (WebSocket)

```http
WSS://api.minimaxi.com/ws/v1/t2a_v2
```

**Connection Flow:**

1. Connect with `Authorization` header
2. Send JSON configuration:

```json
{
  "model": "speech-2.8-turbo",
  "voice_id": "zh-CN-Female-1",
  "speed": 1.0,
  "pitch": 0,
  "vol": 1.0,
  "format": "mp3"
}
```

3. Send text chunks:

```json
{
  "type": "text",
  "text": "Hello world"
}
```

4. Receive audio stream chunks:

```json
{
  "type": "audio",
  "data": "<base64_audio_data>"
}
```

5. Send completion:

```json
{
  "type": "done"
}
```

### Voice Cloning

```http
POST https://api.minimaxi.com/v1/voice_clone
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| audio_file | file | Yes | Audio file (mp3/m4a/wav), 10s-5min, <=20MB |
| reference_audio | file | No | Reference audio (<8s, <=20MB) |
| custom_voice_name | string | No | Name for the custom voice |

**Response:**

```json
{
  "custom_voice_id": "cv_xxxxx",
  "custom_voice_name": "My Voice"
}
```

---

## Image Module

### Image Generation

```http
POST https://api.minimaxi.com/v1/image_generation
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| model | string | Yes | `image-01` (fixed) |
| prompt | string | Yes | Image description |
| resolution | string | No | `1K`, `2K`, default `1K` |
| num_images | int | No | 1-4, default 1 |

**Response:**

```json
{
  "task_id": "task_xxxxx",
  "status": "Pending"
}
```

---

## Video Module

### Video Generation

```http
POST https://api.minimaxi.com.com/v1/video_generation
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| model | string | Yes | `video-01` (fixed) |
| prompt | string | Yes | Video description |
| input_image | string | No* | Image URL/Base64 for I2V mode (*required for I2V) |
| subject_reference | string | No* | Subject ID for S2V mode (*required for S2V) |
| template_id | string | No | Template ID for template mode |
| resolution | string | No | `1080p`, default `1080p` |
| fps | int | No | 24 (fixed) |

**Template IDs:**

| ID | Name |
|----|------|
| `fixed-video-01` | Classic |
| `anime-waifu` | Anime Waifu |
| `anime-warema` | Anime Doll |
| `live-action` | Live Action |
| `scripted-video` | Scripted |
| `virtual-avatar` | Virtual Avatar |
| `portrait-video` | Portrait |
| `character-animation` | Character Animation |
| `product-showcase` | Product Showcase |
| `scene-animation` | Scene Animation |
| `custom-template` | Custom |

---

## Music Module

### Lyrics Generation

```http
POST https://api.minimaxi.com/v1/lyrics_generation
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| prompt | string | Yes | Theme/topic for lyrics |
| music_style | string | No | Music style tags |
| structure | string | No | Structure markers |

### Music Generation

```http
POST https://api.minimaxi.com/v1/music_generation
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| model | string | Yes | `music-01` (fixed) |
| lyrics | string | Yes | LRC format with timestamps |
| music_style | string | Yes | Style tags (1-3 required) |

**Style Tags:**

| Category | Options |
|----------|---------|
| Genre | Pop, Rock, Jazz, Classical, Electronic, Hip-Hop, R&B, Country, Folk, Blues, Metal, Punk, Reggae, Soul, Ambient |
| Mood | Happy, Sad, Energetic, Calm, Romantic, Aggressive, Melancholic, Uplifting, Nostalgic, Dreamy, Tense, Serene |
| Scene | Party, Chill, Workout, Study, Sleep, Romance, RoadTrip, Meditation, Gaming, Cooking |

---

## Chat Module

### Chat Completion

```http
POST https://api.minimaxi.com/v1/text/chatcompletion_v2
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| model | string | Yes | `M2.7-highspeed` |
| messages | array | Yes | Message history |
| stream | bool | No | Enable streaming, default false |

**Message Format:**

```json
{
  "role": "user" | "assistant",
  "content": "Message content"
}
```

---

## Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_API_KEY` | API key is invalid or expired |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `QUOTA_EXCEEDED` | Daily quota exceeded |
| `INVALID_PARAMETER` | Parameter validation failed |
| `TASK_FAILED` | Generation task failed |
| `NETWORK_ERROR` | Network connectivity issue |
| `SERVER_ERROR` | MiniMax server error |

### Handling Strategy

```typescript
async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  }
  catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      // Wait and retry
      await delay(5000)
      return handleApiCall(fn)
    }
    if (error.code === 'QUOTA_EXCEEDED') {
      // Show user quota exceeded message
      throw new Error('Daily quota exceeded. Please try again tomorrow.')
    }
    throw error
  }
}
```

---

## Rate Limits

| Module | Limit |
|--------|-------|
| Chat (M2.7) | 30,000 requests / 5 hours |
| Speech | 50,000 characters / day |
| Image | 800 images / day |
| Video (Fast) | 5 videos / day |
| Video (Standard) | 5 videos / day |
| Music | 15 songs / day |
