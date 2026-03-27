# MiniMax API 规范文档 - 语音模块

> **版本**: v1.0
> **更新日期**: 2026-03-27
> **模块**: 语音合成 / 语音克隆 / 音色设计

---

## 1. 语音 API 端点

| 功能 | 端点 | 方法 | 说明 |
|------|------|------|------|
| T2A 同步 HTTP | `/v1/t2a_v2` | POST | 实时返回音频 |
| T2A 同步 WebSocket | `wss://api.minimaxi.com/ws/v1/t2a_v2` | WebSocket | 流式音频 |
| T2A 异步 | `/v1/t2a_async_v2` | POST | 提交任务 |
| T2A 异步查询 | `/v1/query/t2a_async_query_v2` | GET | 查询任务状态 |
| 语音克隆创建 | `/v1/voice_clone/create` | POST | 创建克隆任务 |
| 语音克隆列表 | `/v1/voice_clone/list` | GET | 获取克隆列表 |
| 语音克隆状态 | `/v1/voice_clone/status` | GET | 查询克隆状态 |
| 音色查询 | `/v1/get_voice` | POST | 查询可用音色 |
| 音色设计 | `/v1/voice_design` | POST | AI 设计音色 |
| 文件上传 | `/v1/files/upload` | POST | 克隆/设计音频 |

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
  "file_id": "file-xxx",   // 成功后可用来获取音频
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

## 10. 音色查询 (Get Voice)

### 10.1 接口

```typescript
POST https://api.minimaxi.com/v1/get_voice
```

### 10.2 请求格式

```typescript
{
  "model": "speech-2.8-hd",
  "language": "zh-CN"  // 可选，筛选语言
}

// 响应
{
  "data": {
    "voices": [
      {
        "voice_id": "zh-CN-Female-1",
        "name": "Suki",
        "language": "zh-CN",
        "gender": "female",
        "preview_url": "https://..."
      }
    ]
  }
}
```

---

## 11. 错误码

### 11.1 API 错误响应

```typescript
{
  "error": {
    "code": 1001,
    "message": "API key 无效或已过期",
    "param": null
  }
}
```

### 11.2 常见错误码

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

## 12. 速率限制

| 接口 | 限制 |
|------|------|
| 文本对话 | 30,000 次/5小时 |
| T2A 同步 | 50,000 字符/天 |
| T2A 异步 | 50,000 字符/天 |

---

## 13. 集成最佳实践

### 13.1 语音合成流程

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

### 13.2 轮询实现

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

### 13.3 音频播放

```typescript
const audio = new Audio(url)
audio.volume = 0.8
audio.play().catch(console.error)

audio.addEventListener('ended', () => {
  // 播放完成
})
```

---

> **最后更新**: 2026-03-27
> **维护者**: 开发团队
> **变更记录**: 拆分为独立模块文档
