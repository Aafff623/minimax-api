# MiniMax API 规范文档 - 图片模块

> **版本**: v1.0
> **更新日期**: 2026-03-27
> **模块**: 图片生成 (image-01)

---

## 1. 图片生成 API

### 1.1 接口

```typescript
POST https://api.minimaxi.com/v1/image_generation
```

### 1.2 请求格式

```typescript
{
  "model": "image-01",                    // 必填，模型名称
  "prompt": "A man in a white t-shirt...", // 必填，图片描述，最大 1500 字符
  "aspect_ratio": "16:9",                  // 可选，长宽比，默认 1:1
  "width": 1024,                           // 可选，图片宽度 (px)，与 height 同时设置
  "height": 1024,                          // 可选，图片高度 (px)，与 width 同时设置
  "response_format": "url",                 // 可选，url 或 base64，默认 url
  "seed": 12345,                           // 可选，随机种子，用于复现
  "n": 1,                                  // 可选，生成数量，1-9，默认 1
  "prompt_optimizer": false                // 可选，自动优化 prompt，默认 false
}
```

### 1.3 请求参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称，固定为 `image-01` |
| `prompt` | string | 是 | 图片描述文本，最大 1500 字符 |
| `aspect_ratio` | string | 否 | 长宽比，默认 `1:1` |
| `width` | integer | 否 | 图片宽度，512-2048，需能被 8 整除 |
| `height` | integer | 否 | 图片高度，512-2048，需能被 8 整除 |
| `response_format` | string | 否 | 返回格式，`url` 或 `base64`，默认 `url` |
| `seed` | integer | 否 | 随机种子，用于复现相同图片 |
| `n` | integer | 否 | 生成数量，1-9，默认 1 |
| `prompt_optimizer` | boolean | 否 | 自动优化 prompt，默认 false |

### 1.4 长宽比选项

| aspect_ratio | 说明 |
|-------------|------|
| `1:1` | 正方形（默认） |
| `16:9` | 宽屏 |
| `4:3` | 标准比例 |
| `3:2` | 摄影比例 |
| `2:3` | 竖屏比例 |
| `3:4` | 竖屏比例 |
| `9:16` | 手机竖屏 |
| `21:9` | 超宽屏 |

---

## 2. 响应格式

### 2.1 成功响应

```typescript
{
  "code": "200",
  "msg": "Success",
  "data": {
    "items": [
      {
        "url": "https://example.com/image.png",  // response_format=url 时
        "base64": "iVBORw0KGgoAAAANSUhEUgAA..."  // response_format=base64 时
      }
    ]
  }
}
```

### 2.2 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | string | 响应码，200 表示成功 |
| `msg` | string | 响应消息 |
| `data.items` | array | 图片数组 |
| `data.items[].url` | string | 图片 URL（仅 url 格式） |
| `data.items[].base64` | string | Base64 编码图片（仅 base64 格式） |

---

## 3. 尺寸规格

### 3.1 预设尺寸 (通过 aspect_ratio)

| 长宽比 | 默认尺寸 | 适用场景 |
|--------|---------|---------|
| `1:1` | 1024x1024 | 头像、图标 |
| `16:9` | 1280x720 | 横版banner |
| `9:16` | 720x1280 | 手机壁纸 |
| `21:9` | 1680x720 |  ultrawide |

### 3.2 自定义尺寸

通过 `width` 和 `height` 自定义尺寸：
- 范围：512 - 2048 px
- 必须能被 8 整除
- `aspect_ratio` 优先级高于 `width/height`

---

## 4. 图片质量与优化

### 4.1 Prompt 优化

启用 `prompt_optimizer: true` 可自动优化描述词：

```typescript
{
  "model": "image-01",
  "prompt": "A beautiful sunset over the ocean",
  "prompt_optimizer": true
}
```

### 4.2 种子复现

使用相同 `seed` 可复现相似图片：

```typescript
// 第一次生成
{ "prompt": "...", "seed": 42 }

// 第二次生成（相同 seed）
{ "prompt": "...", "seed": 42 }  // 相似但不完全相同
```

### 4.3 批量生成

通过 `n` 参数一次生成多张：

```typescript
{
  "prompt": "A cat sitting on a windowsill",
  "n": 4  // 生成 4 张
}
```

---

## 5. 速率限制

| 限制 | 数量 |
|------|------|
| 图片生成 | 800 张/天 |

---

## 6. 错误处理

### 6.1 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|---------|
| 1001 | 认证失败 | 检查 API Key |
| 1002 | 余额不足 | 充值账户 |
| 2001 | 参数错误 | 检查 prompt 长度和格式 |
| 2002 | 模型不支持 | 使用 `image-01` |
| 4001 | prompt 过长 | 缩短至 1500 字符以内 |
| 4002 | 尺寸超出范围 | 确保 512-2048 且被 8 整除 |
| 4003 | n 超出范围 | 确保 1-9 |

### 6.2 错误响应格式

```typescript
{
  "code": "4001",
  "msg": "Invalid parameter: prompt too long",
  "data": null
}
```

---

## 7. 集成最佳实践

### 7.1 图片生成流程

```
用户输入描述
    ↓
选择尺寸/比例
    ↓
[可选] 启用 prompt 优化
    ↓
调用图片生成 API
    ↓
获取图片 URL/base64
    ↓
前端展示/下载
```

### 7.2 Prompt 编写技巧

1. **风格明确**：如 "photorealistic", "oil painting", "anime style"
2. **细节丰富**：主体、背景、光线、氛围
3. **避免歧义**：使用明确的描述词
4. **中英混合**：可使用中文描述

### 7.3 图片缓存策略

- `url` 格式：URL 有时效性，建议即时使用或本地缓存
- `base64` 格式：可持久存储，适合离线使用

---

## 8. 使用场景示例

### 8.1 头像生成

```typescript
{
  "model": "image-01",
  "prompt": "A professional headshot photo, smiling, natural lighting, blue background",
  "aspect_ratio": "1:1",
  "n": 4
}
```

### 8.2 横版 Banner

```typescript
{
  "model": "image-01",
  "prompt": "Futuristic cityscape at sunset, cyberpunk style, highly detailed",
  "aspect_ratio": "16:9"
}
```

### 8.3 手机壁纸

```typescript
{
  "model": "image-01",
  "prompt": "Ethereal fantasy landscape, mountains and clouds, soft lighting",
  "aspect_ratio": "9:16"
}
```

---

> **最后更新**: 2026-03-27
> **维护者**: 开发团队
> **变更记录**: 拆分为独立模块文档
