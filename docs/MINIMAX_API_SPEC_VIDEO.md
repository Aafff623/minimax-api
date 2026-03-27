# MiniMax API 规范文档 - 视频模块

> **版本**: v1.0
> **更新日期**: 2026-03-27
> **模块**: 视频生成 (MiniMax-Hailuo-02)

---

## 1. 视频生成 API

### 1.1 接口

```typescript
POST https://api.minimaxi.com/v1/video_generation
```

### 1.2 请求格式

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

### 1.3 请求参数说明

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

### 1.4 视频时长与分辨率

| 分辨率 | 支持时长 |
|--------|----------|
| 768P | 6 秒 / 10 秒 |
| 1080P | 仅支持 6 秒 |

---

## 2. 镜头控制命令

在 `prompt` 中使用以下命令控制镜头运动：

| 命令 | 说明 |
|------|------|
| `[左移]` | 镜头向左移动 |
| `[右移]` | 镜头向右移动 |
| `[推进]` | 镜头向前推进（zoom in） |
| `[拉远]` | 镜头向后拉远（zoom out） |
| `[上升]` | 镜头向上移动 |
| `[下降]` | 镜头向下移动 |
| `[左旋]` | 镜头向左旋转 |
| `[右旋]` | 镜头向右旋转 |
| `[俯仰]` | 镜头上下俯仰 |
| `[航拍]` | 俯视航拍视角 |
| `[仰拍]` | 仰视视角 |
| `[特写]` | 特写镜头 |
| `[全景]` | 全景镜头 |
| `[跟随]` | 跟随主体移动 |
| `[环绕]` | 环绕主体旋转 |

---

## 3. 图片规格要求

### 3.1 图片格式

| 格式 | 支持情况 |
|------|---------|
| JPG/JPEG | ✅ 支持 |
| PNG | ✅ 支持 |
| WebP | ✅ 支持 |

### 3.2 图片限制

| 参数 | 要求 |
|------|------|
| 文件大小 | < 20MB |
| 短边 | > 300px |
| 长宽比 | 2:5 ~ 5:2 |

---

## 4. 视频生成模式

### 4.1 T2V (Text to Video)

仅使用 `last_frame_image` + `prompt` 生成视频

```typescript
{
  "model": "MiniMax-Hailuo-02",
  "last_frame_image": "https://example.com/image.jpg",
  "prompt": "一只猫在草地上奔跑，[推进]镜头逐渐靠近",
  "duration": 6,
  "resolution": "768P"
}
```

### 4.2 I2V (Image to Video)

使用 `first_frame_image` + `last_frame_image` + `prompt` 生成视频

```typescript
{
  "model": "MiniMax-Hailuo-02",
  "first_frame_image": "https://example.com/start.jpg",
  "last_frame_image": "https://example.com/end.jpg",
  "prompt": "人物从左向右行走，[推进]镜头",
  "duration": 6,
  "resolution": "768P"
}
```

### 4.3 S2V (Subject to Video)

使用主体驱动模式，`first_frame_image` 为主体参考

```typescript
{
  "model": "MiniMax-Hailuo-02",
  "first_frame_image": "https://example.com/subject.jpg",
  "last_frame_image": "https://example.com/background.jpg",
  "prompt": "主体在背景下跳舞，[环绕]镜头",
  "duration": 6,
  "resolution": "768P"
}
```

---

## 5. 响应格式

### 5.1 成功响应

```typescript
{
  "code": "200",
  "msg": "Success",
  "data": {
    "task_id": "gen-xxx",
    "status": "pending"
  }
}
```

### 5.2 任务状态查询

```typescript
GET https://api.minimaxi.com/v1/video_generation?task_id=gen-xxx

// 响应
{
  "code": "200",
  "msg": "Success",
  "data": {
    "task_id": "gen-xxx",
    "status": "success",     // pending, success, failed
    "video_url": "https://...",  // 成功时返回
    "cover_url": "https://...",   // 成功时返回
  }
}
```

---

## 6. 速率限制

| 限制 | 数量 |
|------|------|
| 视频生成 | 10 个/天 |

---

## 7. 错误处理

### 7.1 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|---------|
| 1001 | 认证失败 | 检查 API Key |
| 1002 | 余额不足 | 充值账户 |
| 2001 | 参数错误 | 检查请求参数 |
| 4001 | 图片格式不支持 | 使用 JPG/PNG/WebP |
| 4002 | 图片过大 | 压缩至 20MB 以下 |
| 4003 | 图片尺寸不符 | 确保短边 > 300px |
| 5001 | 生成失败 | 重试或联系支持 |

### 7.2 异步轮询实现

```typescript
const POLL_INTERVAL = 3000 // ms
const MAX_POLL_ATTEMPTS = 100

async function pollVideoStatus(taskId: string): Promise<string | null> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const res = await getVideoStatus(taskId)
    if (res.status === 'success') return res.video_url
    if (res.status === 'failed') throw new Error('Video generation failed')
    await sleep(POLL_INTERVAL)
  }
  throw new Error('Polling timeout')
}
```

---

## 8. 集成最佳实践

### 8.1 视频生成流程

```
准备尾帧图片
    ↓
编写视频描述 (prompt)
    ↓
调用视频生成 API
    ↓
获取 task_id
    ↓
轮询任务状态 (每 3s)
    ↓
获取视频 URL
    ↓
视频播放器展示
```

### 8.2 图片准备建议

- 使用清晰、高质量的静态图片
- 确保主体在画面中突出
- 避免过度复杂的背景
- 图片短边建议 720px 以上

### 8.3 Prompt 编写技巧

1. **镜头指令放句尾**：效果更稳定
2. **描述主体动作**：如"人物转身微笑"
3. **控制镜头运动**：善用镜头命令
4. **保持描述简洁**：避免过长的复合句

---

> **最后更新**: 2026-03-27
> **维护者**: 开发团队
> **变更记录**: 拆分为独立模块文档
