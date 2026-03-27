# MiniMax API 规范文档 - 音乐模块

> **版本**: v1.0
> **更新日期**: 2026-03-27
> **模块**: 音乐生成 (Music-2.0)

---

## 1. 音乐生成 API

### 1.1 接口

```typescript
POST https://api.minimaxi.com/v1/music_generation
```

### 1.2 请求格式

```typescript
{
  "model": "music-2.0",                   // 必填，模型名称
  "prompt": "Indie folk, melancholic...",  // 必填，音乐描述，10-2000 字符
  "lyrics": "[verse]\nStreetlights...",   // 可选，歌词，10-3000 字符
  "stream": false,                        // 可选，是否流式输出，默认 false
  "output_format": "url",                 // 可选，url 或 hex，默认 hex
  "audio_setting": {                      // 可选，音频设置
    "sample_rate": 44100,
    "bitrate": 256000,
    "format": "mp3"
  }
}
```

### 1.3 请求参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称，固定为 `music-2.0` |
| `prompt` | string | 是 | 音乐描述（风格、情绪、场景），10-2000 字符 |
| `lyrics` | string | 否 | 歌词，用 `\n` 换行，可用结构标签 |
| `stream` | boolean | 否 | 是否流式输出，默认 false |
| `output_format` | string | 否 | 输出格式，`url` 或 `hex`，默认 `hex` |
| `audio_setting` | object | 否 | 音频设置 |
| `audio_setting.sample_rate` | integer | 否 | 采样率，如 44100 |
| `audio_setting.bitrate` | integer | 否 | 比特率，如 256000 |
| `audio_setting.format` | string | 否 | 格式，如 mp3 |

### 1.4 Output Format 说明

| 格式 | 说明 | 适用场景 |
|------|------|---------|
| `url` | 返回音频 URL | 立即播放，24小时有效期 |
| `hex` | 返回十六进制音频数据 | 持久存储，需转换 |

> ⚠️ 注意：`url` 链接有效期 24 小时，建议及时下载

---

## 2. 歌词格式

### 2.1 歌词结构标签

| 标签 | 说明 |
|------|------|
| `[Intro]` | 前奏 |
| `[Verse]` | 主歌 |
| `[Pre-Chorus]` | 预副歌 |
| `[Chorus]` | 副歌/高潮 |
| `[Bridge]` | 桥段 |
| `[Outro]` | 尾奏 |
| `[Hook]` | 记忆点 |

### 2.2 歌词示例

```lyrics
[Intro]
(Instrumental intro)

[Verse 1]
Streetlights flicker, the night breeze sighs
Shadows stretch as I walk alone
An old coat wraps my silent sorrow

[Pre-Chorus]
Memories fade like old photographs

[Chorus]
In the rain, I find my way
Dancing alone, night becomes day

[Verse 2]
Coffee shop corners, familiar faces
A stranger's gaze, a fleeting moment

[Chorus]
In the rain, I find my way
Dancing alone, night becomes day

[Outro]
(Fading notes)
```

---

## 3. 响应格式

### 3.1 同步响应 (stream=false)

```typescript
{
  "data": {
    "task_id": "some_task_id",
    "audio_url": "https://api.minimax.io/v1/audio/example.mp3",  // output_format=url
    "hex": "0x..."                                             // output_format=hex
  }
}
```

### 3.2 流式响应 (stream=true)

```typescript
// 首包
{ "event": "task_start", "task_id": "xxx" }

// 音频数据块
{ "event": "audio", "data": "hex_encoded_chunk..." }

// 完成
{ "event": "task_finish", "task_id": "xxx" }
```

---

## 4. 音频设置

### 4.1 采样率选项

| sample_rate | 说明 |
|-------------|------|
| 16000 | 低质量 |
| 24000 | 中等质量 |
| 32000 | 标准质量 |
| 44100 | 高质量（默认） |

### 4.2 比特率选项

| bitrate | 说明 |
|---------|------|
| 32000 | 低 |
| 64000 | 中 |
| 128000 | 高 |
| 256000 | 极高（默认） |

### 4.3 格式选项

| format | 说明 |
|--------|------|
| `mp3` | MP3 格式（默认） |
| `wav` | WAV 格式 |
| `pcm` | PCM 原始数据 |

---

## 5. 音乐风格 Prompt

### 5.1 风格关键词

| 风格 | Prompt 示例 |
|------|------------|
| Pop | Upbeat, catchy melodies, modern production |
| Rock | Electric guitars, powerful drums, energetic |
| Jazz | Smooth saxophone, piano improvisation |
| Classical | Orchestral arrangement, elegant strings |
| Electronic | Synthesizers, beat-driven, futuristic |
| Folk | Acoustic guitars, storytelling lyrics |
| R&B | Soulful vocals, groovy rhythms |
| Hip-Hop | Beat, rap vocals, urban vibes |
| Indie | Lo-fi, indie rock, alternative |
| Lo-Fi | Chill, relaxed, background music |

### 5.2 情绪关键词

| 情绪 | Prompt 示例 |
|------|------------|
| Happy | Joyful, uplifting, sunshine |
| Sad | Melancholic, emotional, rainy day |
| Energetic | Powerful, motivating, workout |
| Calm | Relaxing, peaceful, meditation |
| Romantic | Love, warmth, intimate |
| Dark | Ominous, mysterious, thriller |

### 5.3 场景关键词

| 场景 | Prompt 示例 |
|------|------------|
| 咖啡店 | Coffee shop, chill, study music |
| 夜晚 | Night drive, urban, neon lights |
| 雨天 | Rainy window, cozy, reflection |
| 健身 | Workout, gym, high energy |
| 清晨 | Morning sunrise, fresh, new beginnings |
| 派对 | Dance floor, celebration, club |

---

## 6. 速率限制

| 限制 | 数量 |
|------|------|
| 音乐生成 | 15 首/天 |

---

## 7. 错误处理

### 7.1 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|---------|
| 1001 | 认证失败 | 检查 API Key |
| 1002 | 余额不足 | 充值账户 |
| 2013 | 参数无效 | 检查参数格式和长度 |
| 2049 | 歌词/描述过长 | 缩短文本长度 |

### 7.2 错误响应格式

```typescript
{
  "base_resp": {
    "status_code": 2013,
    "status_msg": "Invalid parameters, check input"
  }
}
```

---

## 8. 集成最佳实践

### 8.1 音乐生成流程

```
编写音乐描述 (prompt)
    ↓
[可选] 添加歌词
    ↓
配置音频参数
    ↓
调用音乐生成 API
    ↓
[异步模式] 轮询任务状态
    ↓
获取音频 URL/hex
    ↓
音频播放器展示
```

### 8.2 Prompt 编写技巧

1. **风格+情绪+场景**：三者结合更精准
   - ✅ "Indie folk, melancholic, perfect for a rainy night"
   - ❌ "folk music"

2. **使用英文描述**：效果更稳定

3. **歌词结构化**：使用标签划分段落

4. **流式优先**：长音频使用 `stream: true`

### 8.3 音频处理 (hex 格式)

```typescript
// Hex 转 Audio
function hexToAudio(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes.buffer
}

// 播放
const buffer = hexToAudio(hexString)
const blob = new Blob([buffer], { type: 'audio/mp3' })
const url = URL.createObjectURL(blob)
const audio = new Audio(url)
audio.play()
```

---

## 9. 使用场景示例

### 9.1 背景音乐 (无歌词)

```typescript
{
  "model": "music-2.0",
  "prompt": "Lo-fi hip hop, chill, relaxed, coffee shop background music, study beats",
  "output_format": "url",
  "audio_setting": {
    "sample_rate": 44100,
    "bitrate": 256000,
    "format": "mp3"
  }
}
```

### 9.2 原创歌曲 (有歌词)

```typescript
{
  "model": "music-2.0",
  "prompt": "Indie folk, melancholic, emotional, singer-songwriter style",
  "lyrics": "[Verse]\nStreetlights flicker, the night breeze sighs\nShadows stretch as I walk alone\n\n[Chorus]\nIn the rain, I find my way\nDancing alone, night becomes day",
  "output_format": "url"
}
```

### 9.3 健身音乐

```typescript
{
  "model": "music-2.0",
  "prompt": "Electronic dance music, high energy, powerful beat, workout motivation, 140 BPM",
  "audio_setting": {
    "sample_rate": 44100,
    "bitrate": 320000,
    "format": "mp3"
  }
}
```

---

> **最后更新**: 2026-03-27
> **维护者**: 开发团队
> **变更记录**: 拆分为独立模块文档
