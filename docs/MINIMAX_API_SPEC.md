# MiniMax API 规范文档

> **版本**: v1.0
> **更新日期**: 2026-03-27
> **用途**: 后续开发 Agent 的 API 参考标准

---

## 1. API 基础信息

### 1.1 端点汇总

| 功能 | 端点 | 方法 | 说明 |
|------|------|------|------|
| 文本对话 | `/v1/text/chatcompletion_v2` | POST | 支持流式 |
| T2A 同步 HTTP | `/v1/t2a_v2` | POST | 实时返回音频 |
| T2A 同步 WebSocket | `wss://api.minimaxi.com/ws/v1/t2a_v2` | WebSocket | 流式音频 |
| T2A 异步 | `/v1/t2a_async_v2` | POST | 提交任务 |
| T2A 异步查询 | `/v1/query/t2a_async_query_v2` | GET | 查询任务状态 |
| 语音克隆创建 | `/v1/voice_clone/create` | POST | 创建克隆任务 |
| 语音克隆列表 | `/v1/voice_clone/list` | GET | 获取克隆列表 |
| 语音克隆状态 | `/v1/voice_clone/status` | GET | 查询克隆状态 |
| 音色查询 | `/v1/get_voice` | POST | 查询可用音色 |
| 视频生成 | `/v1/video_generation` | POST | 生成视频 |

### 1.2 模型列表

| 模型 | 说明 | 适用场景 |
|------|------|---------|
| `MiniMax-M2.7` | 旗舰模型，支持 Function Call | AI 对话 |
| `MiniMax-M2.5` | 高性能模型 | AI 对话 |
| `MiniMax-M2.1` | 轻量模型 | AI 对话 |
| `MiniMax-M2` | 基础模型 | AI 对话 |
| `speech-2.8-hd` | 高清语音合成 | T2A |
| `speech-2.8-turbo` | 快速语音合成 | T2A |
| `speech-2.6-hd` | 标准语音合成 | T2A |
| `speech-2.6-turbo` | 快速标准合成 | T2A |
| `speech-2-hd` | 基础高清 | T2A |
| `speech-2` | 基础版 | T2A |
| `image-01` | 图片生成 | I2I |
| `video-01` | 视频生成 | T2V |
| `MiniMax-Hailuo-02` | 视频生成 | T2V/I2V/S2V |
| `music-2.5` | 音乐生成 | L2A |

### 1.3 认证

```typescript
Header: "Authorization: Bearer $MINIMAX_API_KEY"
```

---

## 2. 文本对话 API

### 2.1 请求格式

```typescript
POST https://api.minimaxi.com/v1/text/chatcompletion_v2

{
  "model": "MiniMax-M2.7",
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "stream": false,        // true: 流式响应
  "max_tokens": 1024,
  "temperature": 0.7,
  "tools": [...]          // 可选，Function Calling
}
```

### 2.2 响应格式

```typescript
// 非流式
{
  "id": "gen-xxx",
  "choices": [{
    "message": { "role": "assistant", "content": "你好！" },
    "finish_reason": "stop"
  }],
  "usage": { "prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30 }
}

// 流式
// data: {"choices": [{"delta": {"content": "你"}}]}
// data: {"choices": [{"delta": {"content": "好"}}]}
// data: [DONE]
```

---

## 3. T2A 同步 HTTP

### 3.1 请求格式

```typescript
POST https://api.minimaxi.com/v1/t2a_v2

{
  "model": "speech-2.8-hd",
  "text": "你好，今天天气真不错",
  "voice_id": "zh-CN-Female-1",
  "emotion": "happy",           // 可选情感标签
  "language": "zh-CN",           // auto 或具体语言
  "stream": false,
  "output_format": "mp3",
  "sample_rate": 32000,
  "pitch": 0,                  // -10 ~ 10
  "intensity": 1,              // 0.5 ~ 2.0
  "timbre": "bright",          // bright, warm, dark
  "speed": 1.0,               // 0.5 ~ 2.0
  "volume": 1.0,              // 0 ~ 1
  "sound_effect": null,        // 可选音效
  "audio_setting": {
    "spacial_room_size": 0,    // 0 ~ 1.5
    "brightness": 0,
    "reverb_mix": 0
  }
}
```

### 3.2 情感标签

| 标签 | 效果 |
|------|------|
| `happy` | 开心愉悦 |
| `sad` | 悲伤难过 |
| `angry` | 生气愤怒 |
| `fearful` | 恐惧害怕 |
| `disgusted` | 厌恶反感 |
| `surprised` | 惊讶惊喜 |
| `calm` | 平静安详 |
| `fluent` | 流畅自然 |
| `whisper` | 轻声低语 |

### 3.3 音效标签

| 标签 | 效果 |
|------|------|
| `spacious_echo` | 空旷回声 |
| `auditorium_echo` | 礼堂回声 |
| `lofi_telephone` | 电话失真 |
| `robotic` | 机器人声 |

---

## 4. T2A 同步 WebSocket

### 4.1 连接

```
wss://api.minimaxi.com/ws/v1/t2a_v2
```

### 4.2 消息格式

```typescript
// 客户端 → 服务端

// 1. 开始任务
{
  "event": "task_start",
  "params": {
    "model": "speech-2.8-hd",
    "text": "你好",
    "voice_id": "zh-CN-Female-1",
    "emotion": "happy",
    "language": "zh-CN",
    "output_format": "mp3",
    "sample_rate": 32000
  }
}

// 2. 继续任务（增量文本）
{
  "event": "task_continue",
  "params": {
    "text": "，今天很开心"
  }
}

// 3. 结束任务
{
  "event": "task_finish"
}

// 4. 中止任务
{
  "event": "task_cancel"
}
```

### 4.3 服务端响应

```typescript
// 1. 任务开始
{ "event": "task_start", "task_id": "gen-xxx" }

// 2. 音频块（base64）
{ "event": "audio", "data": "base64_audio_chunk..." }

// 3. 任务完成
{ "event": "task_finish", "task_id": "gen-xxx" }

// 4. 错误
{ "event": "error", "message": "..." }
```

---

## 5. T2A 异步

### 5.1 提交任务

```typescript
POST https://api.minimaxi.com/v1/t2a_async_v2

{
  "model": "speech-2.8-hd",
  "text": "这是一段很长的文本，需要异步处理",
  "voice_id": "zh-CN-Female-1",
  "emotion": "calm",
  "language": "zh-CN",
  "output_format": "mp3"
}

// 响应
{
  "task_id": "task-xxx",
  "status": "pending"
}
```

### 5.2 查询任务状态

```typescript
GET https://api.minimaxi.com/v1/query/t2a_async_query_v2?task_id=task-xxx

// 响应
{
  "task_id": "task-xxx",
  "status": "success",      // pending, success, failed
  "file_id": "file-xxx",    // 成功后可用来获取音频
  "audio_url": "https://..." // 直链（部分接口返回）
}
```

### 5.3 获取音频文件

```typescript
GET https://api.minimaxi.com/v1/files/{file_id}

// 或专用接口
GET https://api.minimaxi.com/v1/t2a_v2/file?file_id=xxx
```

---

## 6. 音色库

### 6.1 语音 ID 列表

MiniMax 提供 327 种音色，覆盖多种语言和风格：

#### 中文音色 (zh-CN)

| Voice ID | 风格 | 性别 |
|----------|------|------|
| `zh-CN-Female-1` | 甜美可爱 | 女 |
| `zh-CN-Female-2` | 温柔知性 | 女 |
| `zh-CN-Female-3` | 活泼俏皮 | 女 |
| `zh-CN-Female-4` | 轻柔软萌 | 女 |
| `zh-CN-Female-5` | 成熟御姐 | 女 |
| `zh-CN-Male-1` | 阳光活力 | 男 |
| `zh-CN-Male-2` | 磁性低沉 | 男 |
| `zh-CN-Male-3` | 清朗少年 | 男 |

#### 英文音色 (en-US)

| Voice ID | 风格 | 性别 |
|----------|------|------|
| `en-US-Female-1` | 优雅知性 | 女 |
| `en-US-Female-2` | 活泼开朗 | 女 |
| `en-US-Female-3` | 温柔亲切 | 女 |
| `en-US-Male-1` | 磁性低沉 | 男 |
| `en-US-Male-2` | 阳光活力 | 男 |

#### 日文音色 (ja-JP)

| Voice ID | 风格 | 性别 |
|----------|------|------|
| `ja-JP-Female-1` | 甜美清新 | 女 |
| `ja-JP-Female-2` | 温柔治愈 | 女 |
| `ja-JP-Male-1` | 阳光少年 | 男 |

#### 韩文音色 (ko-KR)

| Voice ID | 风格 | 性别 |
|----------|------|------|
| `ko-KR-Female-1` | 俏皮可爱 | 女 |
| `ko-KR-Female-2` | 温柔姐姐 | 女 |

### 6.2 音色选择建议

| 场景 | 推荐音色 |
|------|---------|
| AI 助手 | `zh-CN-Female-4` (轻柔软萌) |
| 播客旁白 | `en-US-Female-1` (优雅知性) |
| 游戏角色 | `zh-CN-Male-1` (阳光活力) |
| 儿童内容 | `zh-CN-Female-1` (甜美可爱) |
| 客服场景 | `zh-CN-Female-2` (温柔知性) |

---

## 7. 语音克隆

### 7.1 文件上传

```typescript
POST https://api.minimaxi.com/v1/files/upload
Content-Type: multipart/form-data

FormData: {
  "purpose": "voice_clone" | "prompt_audio",
  "file": <audio_file>
}

// 响应
{
  "file": {
    "file_id": 123456789,
    "bytes": 5896337,
    "created_at": 1700469398,
    "filename": "复刻音频.mp3",
    "purpose": "voice_clone"
  },
  "base_resp": { "status_code": 0, "status_msg": "success" }
}
```

### 7.2 音频规格

| 用途 | 格式 | 时长 | 大小 |
|------|------|------|------|
| 音色克隆 | mp3, m4a, wav | 10秒 ~ 5分钟 | ≤ 20MB |
| 示例音频 | mp3, m4a, wav | < 8秒 | ≤ 20MB |

### 7.3 音色快速复刻

```typescript
POST https://api.minimaxi.com/v1/voice_clone

{
  "file_id": 123456789,           // 上传音频的 file_id
  "voice_id": "my_custom_voice", // 8-256 字符，首字母英文字母
  "clone_prompt": {               // 可选，增强相似度
    "prompt_audio": 987654321,     // 示例音频 file_id
    "prompt_text": "This voice sounds natural."
  },
  "text": "试听文本，限1000字符",  // 可选，生成试听音频
  "model": "speech-2.8-hd",       // 配合 text 使用
  "language_boost": "Chinese",     // 可选，增强方言/小语种
  "need_noise_reduction": false,   // 降噪
  "need_volume_normalization": false, // 音量归一化
  "aigc_watermark": false
}

// 响应
{
  "input_sensitive": { "type": 0 },
  "demo_audio": "https://...",     // 试听音频链接
  "base_resp": { "status_code": 0 }
}
```

### 7.4 克隆音色使用

```typescript
{
  "model": "speech-2.8-hd",
  "text": "使用我的克隆音色",
  "voice_id": "my_custom_voice"   // 直接使用自定义 voice_id
}
```

---

## 8. 音色设计 (Voice Design)

### 8.1 接口

```typescript
POST https://api.minimaxi.com/v1/voice_design
```

### 8.2 请求格式

```typescript
{
  "prompt": "讲述悬疑故事的播音员，声音低沉富有磁性，语速时快时慢，营造紧张神秘的氛围。",
  "preview_text": "夜深了，古屋里只有他一人...",
  "voice_id": "custom_voice_001",  // 可选，不传则自动生成
  "aigc_watermark": false
}

// 响应
{
  "voice_id": "ttv-voice-2025060717322425-xxxxxxxx",
  "trial_audio": "hex编码音频",
  "base_resp": { "status_code": 0, "status_msg": "success" }
}
```

### 8.3 音色描述 Prompt 技巧

| 风格 | Prompt 示例 |
|------|------------|
| 播音员 | 讲述悬疑故事的播音员，声音低沉富有磁性，语速时快时慢 |
| 温柔女声 | 温柔的邻家姐姐，声音甜美亲切，带有淡淡的笑意 |
| 元气少女 | 活泼开朗的元气少女，声音清脆明亮，充满活力 |
| 磁性男声 | 磁性低沉的绅士男声，成熟稳重，语速适中 |

---

## 9. 语气词标签

仅 `speech-2.8-hd` / `speech-2.8-turbo` 支持：

| 标签 | 效果 |
|------|------|
| `(laughs)` | 笑声 |
| `(chuckle)` | 轻笑 |
| `(coughs)` | 咳嗽 |
| `(clear-throat)` | 清嗓子 |
| `(groans)` | 呻吟 |
| `(breath)` | 正常换气 |
| `(pant)` | 喘气 |
| `(inhale)` | 吸气 |
| `(exhale)` | 呼气 |
| `(gasps)` | 倒吸气 |
| `(sniffs)` | 吸鼻子 |
| `(sighs)` | 叹气 |
| `(snorts)` | 喷鼻息 |
| `(burps)` | 打嗝 |
| `(lip-smacking)` | 咂嘴 |
| `(humming)` | 哼唱 |
| `(hissing)` | 嘶嘶声 |
| `(emm)` | 嗯 |
| `(whistles)` | 口哨 |
| `(sneezes)` | 喷嚏 |
| `(crying)` | 抽泣 |
| `(applause)` | 鼓掌 |

---

## 10. 错误码

### 10.1 API 错误响应

```typescript
{
  "error": {
    "code": 1001,
    "message": "API key 无效或已过期",
    "param": null
  }
}
```

### 10.2 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|---------|
| 1001 | 认证失败 | 检查 API Key |
| 1002 | 余额不足 | 充值账户 |
| 1003 | 频率超限 | 降低请求频率 |
| 2001 | 文本过长 | 缩短文本 |
| 2002 | 模型不支持 | 换用支持的模型 |
| 2003 | 无效的 voice_id | 检查音色 ID |
| 3001 | 异步任务超时 | 重试提交 |
| 3002 | 异步任务失败 | 查看具体原因 |
| 4001 | 文件格式不支持 | 换用支持的格式 |
| 4002 | 文件过大 | 压缩或分割文件 |

---

## 11. 速率限制

| 接口 | 限制 |
|------|------|
| 文本对话 | 30,000 次/5小时 |
| T2A 同步 | 50,000 字符/天 |
| T2A 异步 | 50,000 字符/天 |
| 图片生成 | 800 张/天 |
| 视频生成 | 10 个/天 |
| 音乐生成 | 15 首/天 |

---

## 12. 集成最佳实践

### 12.1 语音合成流程

```
用户输入文本
    ↓
选择音色 + 情感
    ↓
调用 T2A 同步/异步
    ↓
[异步模式] 轮询任务状态 (每 2s)
    ↓
获取音频 URL
    ↓
HTML5 Audio 播放
```

### 12.2 轮询实现

```typescript
const POLL_INTERVAL = 2000 // ms
const MAX_POLL_ATTEMPTS = 150

async function pollStatus(taskId: string): Promise<string | null> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const res = await getTaskStatus(taskId)
    if (res.status === 'success') return res.file_id
    if (res.status === 'failed') throw new Error('Task failed')
    await sleep(POLL_INTERVAL)
  }
  throw new Error('Polling timeout')
}
```

### 12.3 音频播放

```typescript
const audio = new Audio(url)
audio.volume = 0.8
audio.play().catch(console.error)

audio.addEventListener('ended', () => {
  // 播放完成
})
```

---

## 13. 音色查询 (Get Voice)

### 13.1 接口

```typescript
POST https://api.minimaxi.com/v1/get_voice
```

### 13.2 请求格式

```typescript
{
  "voice_type": "system" | "voice_cloning" | "voice_generation" | "all"
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `voice_type` | string | 查询类型 |

**voice_type 选项：**
| 类型 | 说明 |
|------|------|
| `system` | 系统预置音色 |
| `voice_cloning` | 用户克隆的音色 |
| `voice_generation` | 语音设计生成的音色 |
| `all` | 所有音色 |

### 13.3 响应格式

```typescript
{
  "system_voice": [
    {
      "voice_id": "zh-CN-Female-1",
      "voice_name": "晓晓",
      "description": "甜美可爱，清晰自然",
      "created_time": 1700000000
    },
    // ... 更多系统音色
  ],
  "voice_cloning": [
    {
      "voice_id": "my_custom_voice",
      "voice_name": "我的克隆音色",
      "description": "克隆自音频",
      "created_time": 1700000000
    }
  ],
  "voice_generation": [
    {
      "voice_id": "ttv-voice-2025060717322425-xxxxxxxx",
      "voice_name": "设计的音色",
      "description": "通过语音设计API生成",
      "created_time": 1700000000
    }
  ],
  "base_resp": { "status_code": 0, "status_msg": "success" }
}
```

### 13.4 音色类别说明

| 类别 | 来源 | 使用方式 |
|------|------|---------|
| `system_voice` | MiniMax 官方提供 | 直接使用 voice_id |
| `voice_cloning` | 用户上传音频克隆 | 直接使用自定义 voice_id |
| `voice_generation` | 语音设计 API 生成 | 直接使用生成的 voice_id |

---

## 15. 开发 Agent 快速参考

### 15.1 快速调用模板

```typescript
// 文本对话
const chat = await fetch('/v1/text/chatcompletion_v2', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({ model: 'MiniMax-M2.7', messages, stream: false })
})

// T2A 语音合成
const tts = await fetch('/v1/t2a_v2', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({
    model: 'speech-2.8-hd',
    text: '你好',
    voice_id: 'zh-CN-Female-1',
    emotion: 'happy'
  })
})

// T2A 异步任务
const task = await fetch('/v1/t2a_async_v2', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({ model: 'speech-2.8-hd', text, voice_id })
})
const { task_id } = await task.json()
```

### 15.2 状态管理集成

```typescript
// stores/voice.ts
export const useVoiceStore = defineStore('voice', () => {
  const currentVoiceId = ref('zh-CN-Female-1')
  const currentEmotion = ref('calm')

  function speak(text: string) {
    return fetchT2A({ text, voice_id: currentVoiceId.value, emotion: currentEmotion.value })
  }

  return { currentVoiceId, currentEmotion, speak }
})
```

---

## 16. 视频生成 (Video Generation)

### 16.1 接口

```typescript
POST https://api.minimaxi.com/v1/video_generation
```

### 16.2 请求格式

```typescript
{
  "model": "MiniMax-Hailuo-02",        // 必填，模型名称
  "last_frame_image": "https://...",   // 必填，尾帧图片 URL
  "prompt": "视频描述文字",              // 可选，视频内容描述
  "first_frame_image": "https://...",  // 可选，首帧图片 URL
  "duration": 6,                       // 可选，视频时长(秒)，默认6秒，768P可设置10秒
  "resolution": "768P",                // 可选，768P(默认) 或 1080P
  "callback_url": "https://...",        // 可选，任务完成回调地址
  "aigc_watermark": false              // 可选，是否添加水印
}
```

### 16.3 请求参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称，固定为 `MiniMax-Hailuo-02` |
| `last_frame_image` | string | 是 | 尾帧图片 URL，作为视频生成的基础 |
| `prompt` | string | 否 | 视频内容描述，提示词 |
| `first_frame_image` | string | 否 | 首帧图片 URL，用于图生视频模式 |
| `duration` | number | 否 | 视频时长，默认 6 秒，768P 可设置 10 秒 |
| `resolution` | string | 否 | 分辨率，`768P`(默认) 或 `1080P` |
| `callback_url` | string | 否 | 任务完成后的回调通知地址 |
| `aigc_watermark` | boolean | 否 | 是否添加 AIGC 水印，默认 false |

### 16.4 视频时长与分辨率

| 分辨率 | 支持时长 |
|--------|----------|
| 768P | 6 秒 / 10 秒 |
| 1080P | 仅支持 6 秒 |

### 16.5 镜头控制命令

在 `prompt` 中使用以下命令控制镜头运动：

| 命令 | 说明 |
|------|------|
| `[左移]` | 镜头向左移动 |
| `[右移]` | 镜头向右移动 |
| `[左摇]` | 镜头向左摇动 |
| `[右摇]` | 镜头向右摇动 |
| `[推进]` | 镜头向前推进 |
| `[拉远]` | 镜头向后拉远 |
| `[上升]` | 镜头向上升起 |
| `[下降]` | 镜头向下降落 |
| `[上摇]` | 镜头向上摇动 |
| `[下摇]` | 镜头向下摇动 |
| `[变焦推近]` | 镜头变焦推近 |
| `[变焦拉远]` | 镜头变焦拉远 |
| `[晃动]` | 镜头晃动效果 |
| `[跟随]` | 镜头跟随主体 |
| `[固定]` | 镜头固定不动 |

**示例 Prompt：**
```
一只小猫在草地上玩耍，[推进]镜头靠近，[跟随]小猫的动作，[右移]展示更多场景
```

### 16.6 图片规格要求

| 要求 | 规格 |
|------|------|
| 格式 | JPG / JPEG / PNG / WebP |
| 大小 | < 20MB |
| 短边 | > 300px |
| 长宽比 | 2:5 ~ 5:2 |

### 16.7 响应格式

```typescript
// 成功响应
{
  "task_id": "video-xxx",           // 任务 ID
  "status": "pending"                // 任务状态
}

// 完整响应结构
{
  "id": "gen-xxx",
  "task_id": "video-xxx",
  "status": "pending" | "processing" | "success" | "failed",
  "video_url": "https://...",       // 成功后返回视频 URL
  "cover_url": "https://...",       // 视频封面 URL
  "metadata": {
    "duration": 6,
    "resolution": "768P",
    "model": "MiniMax-Hailuo-02"
  }
}
```

### 16.8 查询任务状态

```typescript
GET https://api.minimaxi.com/v1/video_generation?task_id=video-xxx

// 响应
{
  "task_id": "video-xxx",
  "status": "success",              // pending / processing / success / failed
  "video_url": "https://...",       // 成功时返回
  "cover_url": "https://...",       // 成功时返回
}
```

---

## 17. MCP 工具文档

### 17.1 概述

MiniMax MCP (Model Context Protocol) 文档平台 (https://platform.minimaxi.com/docs/mcp) 提供了**完整的 API 规范搜索功能**，覆盖所有 MiniMax API 端点。

### 17.2 MCP 覆盖范围

| 模块 | MCP 搜索关键词 | 说明 |
|------|---------------|------|
| 视频生成 | `T2V`, `I2V`, `S2V`, `FL2V`, `Hailuo` | 文生视频/图生视频/主体驱动/FL工作室 |
| 音乐生成 | `Music`, `L2A`, `歌词` | Music-2.5 API |
| 图片生成 | `T2I`, `I2I`, `image-01` | 文生图/图生图 |
| 语音合成 | `T2A`, `speech`, `语音` | 文本转语音 |
| 语音克隆 | `voice_clone`, `克隆` | 音色克隆 |
| AI 对话 | `chat`, `M2.7`, `text` | 文本对话 |
| Function Call | `tools`, `function` | 函数调用 |

### 17.3 使用方式

1. **网页搜索**: 访问 https://platform.minimaxi.com/docs/mcp
2. **关键词检索**: 输入如 `T2V video generation` 获取详细 API 文档
3. **参数查询**: 支持查询各接口的请求/响应参数、示例代码

### 17.4 与本文档的关系

| 文档 | 用途 | 更新频率 |
|------|------|---------|
| 本文档 (MINIMAX_API_SPEC.md) | 项目开发的标准参考 | 手动更新 |
| MCP 官方文档 | 最新 API 规范查询 | 自动同步 |

> **建议**: 开发过程中遇到 API 参数疑问，先访问 MCP 文档搜索确认最新参数。

---

> **最后更新**: 2026-03-27
> **维护者**: 开发团队
> **变更记录**: 更新 MCP 工具文档章节 (Section 17)
