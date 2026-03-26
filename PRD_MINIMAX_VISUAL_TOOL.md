# MiniMax 可视化工具 - 产品需求文档 (PRD)

> **文档版本**: v1.0
> **更新日期**: 2026-03-26
> **作者**: MiniMax Ultra 可视化工具开发组

---

## 目录

1. [Executive Summary](#1-executive-summary)
2. [产品概述](#2-产品概述)
3. [功能规格 - 语音模块](#3-功能规格---语音模块)
4. [功能规格 - 图片模块](#4-功能规格---图片模块)
5. [功能规格 - 视频模块](#5-功能规格---视频模块)
6. [功能规格 - 音乐模块](#6-功能规格---音乐模块)
7. [功能规格 - AI对话模块](#7-功能规格---ai对话模块)
8. [UI设计规范](#8-ui设计规范)
9. [技术架构](#9-技术架构)
10. [开发计划](#10-开发计划)
11. [附录](#11-附录)

---

## 1. Executive Summary

### 1.1 背景

MiniMax Ultra 用户享有独家API调用权益，但官方仅提供API接口，缺乏可视化操作界面。本项目旨在为MiniMax Ultra用户打造一个一站式Web可视化工具，涵盖**语音合成**、**图片生成**、**视频生成**、**音乐创作**、**AI对话**五大模块。

### 1.2 核心价值

| 价值点 | 说明 |
|--------|------|
| **零门槛** | 无需编写代码，直接通过Web界面调用MiniMax高级AI能力 |
| **全功能** | 覆盖语音、图片、视频、音乐、AI对话六大能力 |
| **可视化** | 所见即所得的参数调节，实时预览生成结果 |
| **可扩展** | 模块化架构，支持后续功能扩展 |
| **AI增强** | 内置AI对话助手，可评价和反馈生成内容，提升创作质量 |

### 1.3 Ultra权益额度 (每日)

| AI能力 | 模型 | Ultra额度 |
|--------|------|----------|
| 对话 | M2.7-highspeed | 30,000次/5小时 |
| 语音 | Speech 2.8 | 50,000字符 |
| **图片** | **image-01** | **800张** |
| 视频(快速) | Hailuo-2.3-Fast 768P 6s | 5个 |
| 视频(标准) | Hailuo-2.3 768P 6s | 5个 |
| 音乐 | Music-2.5 | 15首(≤5分钟/首) |

### 1.4 技术亮点

- **语音**: 支持异步/同步两种合成模式，327种系统音色，音色克隆
- **图片**: image-01高质量图像生成，支持多种风格和尺寸
- **视频**: 4种生成模式(text-to-video, image-to-video, subject-to-video, subject-reference)，11种预设模板
- **音乐**: 支持歌词编辑 + 风格标签，15+音乐风格可选
- **AI对话**: M2.7模型，可对生成内容进行评价、反馈、增强指导

---

## 2. 产品概述

### 2.1 用户画像

| 角色 | 需求场景 |
|------|----------|
| 内容创作者 | 快速生成配音、视频片段、BGM |
| 自媒体从业者 | 批量制作短视频素材 |
| 企业用户 | 产品介绍视频、营销音频 |
| 开发者 | 快速验证API能力，原型开发 |

### 2.2 功能架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      MiniMax Visual Tool                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │  🎤 语音模块 │ │  🖼️ 图片模块 │ │  🎬 视频模块 │              │
│  │             │ │             │ │             │              │
│  │ · 异步合成  │ │ · 文生图    │ │ · T2V文生视频│              │
│  │ · 同步合成  │ │ · 风格选择  │ │ · I2V图生视频│              │
│  │ · 音色克隆  │ │ · 尺寸选择  │ │ · S2V主体驱动│              │
│  │ · 327音色  │ │ · 质量控制  │ │ · 模板模式   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │  🎵 音乐模块 │ │  💬 AI对话模块│ │  📊 历史模块 │              │
│  │             │ │             │ │             │              │
│  │ · 歌词生成  │ │ · 智能对话  │ │ · 任务列表  │              │
│  │ · 音乐生成  │ │ · 内容评价  │ │ · 状态追踪  │              │
│  │ · 风格标签  │ │ · 反馈增强  │ │ · 收藏夹   │              │
│  │ · 音乐预览  │ │ · 创作指导  │ │ · 搜索筛选  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐                               │
│  │  👤 用户中心 │ │  ⚙️ 设置中心 │                               │
│  │             │ │             │                               │
│  │ · API Key   │ │ · 主题切换  │                               │
│  │ · 额度查询  │ │ · 语言设置  │                               │
│  │ · 使用统计  │ │ · 快捷键   │                               │
│  └─────────────┘ └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 页面结构

```
/                           # 首页 - 功能入口
├── /speech                # 语音合成
│   ├── /speech/async     # 异步合成
│   ├── /speech/stream    # 同步合成(流式)
│   └── /speech/clone     # 音色克隆
├── /image                # 图片生成 ⬅️ 新增
│   ├── /image/generate   # 文生图
│   └── /image/gallery    # 图片画廊
├── /video                # 视频生成
│   ├── /video/t2v        # 文生视频
│   ├── /video/i2v        # 图生视频
│   ├── /video/s2v        # 主体驱动
│   └── /video/template   # 模板模式
├── /music               # 音乐创作
│   ├── /music/lyrics     # 歌词编辑
│   └── /music/generate   # 音乐生成
├── /chat                # AI对话 ⬅️ 新增
│   └── /chat             # 主对话页
├── /history             # 历史记录
├── /settings            # 设置中心
└── /dashboard           # 用户仪表盘
```

---

## 3. 功能规格 - 语音模块

### 3.1 功能清单

| 功能 | 端点 | 描述 |
|------|------|------|
| 异步语音合成 | `POST /v1/t2a_async_v2` | 长文本配音，批量处理，10万字符限制 |
| 同步语音合成 | `WebSocket /ws/v1/t2a_v2` | 实时流式输出，1万字符限制 |
| 音色克隆 | `POST /v1/voice_clone` | 自定义音色创建，10秒-5分钟音频 |

### 3.2 API参数对照表

#### 3.2.1 异步语音合成

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `text` | string | - | - | 否 | TextArea |
| `file_id` | string | - | - | 否 | FileUpload |
| `model` | string | 见下方模型列表 | - | 是 | Select |
| `voice_id` | string | 327种系统音色 | - | 是 | VoiceSelector |
| `speed` | float | 0.5-2.0 | 1.0 | 否 | Slider |
| `pitch` | int | -12-12 | 0 | 否 | Slider |
| `vol` | float | 0-2.0 | 1.0 | 否 | Slider |
| `audio_sample_rate` | int | 32000, 16000, 8000 | 32000 | 否 | Select |
| `bitrate` | int | 128000, 64000, 32000 | 128000 | 否 | Select |
| `format` | string | mp3, wav, flac | mp3 | 否 | RadioGroup |
| `return_timestamps` | bool | true/false | false | 否 | Switch |
| `pronunciation_dict` | object | - | - | 否 | DictEditor |
| `sound_effects` | string | 见下方特效列表 | - | 否 | Select |

**模型枚举**:
```
speech-2.8-hd      # 高清模型，2.8版本
speech-2.6-hd      # 高清模型，2.6版本
speech-2.8-turbo   # 加速模型，2.8版本
speech-2.6-turbo   # 加速模型，2.6版本
speech-02-hd       # 高清模型，02版本
speech-02-turbo    # 加速模型，02版本
```

**声音特效**:
```
spacious_echo       # 空旷回声
cave_echo           # 洞穴回声
church_ambience     # 教堂环境音
robot               # 机器人
chipmunk            # 花栗鼠（变高音调）
```

#### 3.2.2 音色克隆

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `audio_file` | file | mp3/m4a/wav, 10秒-5分钟, ≤20MB | - | 是 | AudioUploader |
| `reference_audio` | file | mp3/m4a/wav, <8秒, ≤20MB | - | 否 | AudioUploader |
| `custom_voice_name` | string | - | - | 否 | Input |

### 3.3 音色库 (327种音色)

| 语言分类 | 数量 | 示例ID |
|---------|------|--------|
| 中文（普通话） | 58种 | zh-CN-Female-1, zh-CN-Male-Ben |
| 粤语 | 6种 | yue-CN-Female-1 |
| 英文 | 16种 | en-US-Female-SantaClaus |
| 日文 | 15种 | ja-JP-Female-1 |
| 韩文 | 48种 | ko-KR-Female-1 |
| 西班牙文 | 30种 | es-ES-Female-1 |
| 葡萄牙文 | 38种 | pt-BR-Female-1 |
| 其他(34种语言) | 116种 | - |

**总计**: 327种系统音色，覆盖40种语言

### 3.4 工作流程

#### 异步语音合成流程
```
[文本输入] → [模型选择] → [音色选择] → [参数调节] → [提交任务]
      │                                              │
      ▼                                              ▼
[获取task_id]                              [轮询任务状态]
      │                                      │ Pending → 继续等待
      └─────────── ← ─ ─ ─ ─ ─ ─ ─ ─ → [Processing → Success]
                                                      │
                                                      ▼
                                               [获取file_id]
                                                      │
                                                      ▼
                                              [下载音频文件(9小时有效)]
```

#### 同步语音合成流程 (WebSocket)
```
[建立连接] → [发送开始指令] → [流式发送文本] → [接收音频流] → [实时播放/保存]
```

#### 音色克隆流程
```
[上传克隆音频(10秒-5分钟)] → [上传参考音频(可选,<8秒)] → [提交克隆]
         │                                              │
         └─────────────────── ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ──┘
                                [获取custom_voice_id]
                                          │
                                          ▼
                                  [试听预览音色]
                                          │
                                          ▼
                              [跳转语音合成并自动选择该音色]
```

### 3.5 技术限制

| 限制项 | 异步合成 | 同步合成 |
|--------|---------|---------|
| 文本限制 | 100,000字符 | 10,000字符 |
| 实时性 | 非实时(轮询) | 实时流式 |
| 下载有效期 | 9小时 | 不适用 |
| 播放器依赖 | 无 | mpv |
| 轮询间隔建议 | 3-5秒 | - |

---

## 4. 功能规格 - 视频模块

### 4.1 功能清单

| 模式 | 端点 | 描述 |
|------|------|------|
| T2V 文生视频 | `POST /v1/video_generation` | 文本描述生成视频 |
| I2V 图生视频 | `POST /v1/video_generation` | 图片+描述生成视频 |
| S2V 主体驱动 | `POST /v1/video_generation` | 主体ID+描述生成视频 |
| Subject Ref | `POST /v1/video_generation` | 参考图保持主体一致性 |
| 模板模式 | `POST /v1/video_generation` | 预设模板快速生成 |

### 4.2 API参数对照表

#### 4.2.1 文生视频 (T2V)

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `model` | string | video-01 | video-01 | 是 | Select(固定) |
| `prompt` | string | - | - | 是 | TextArea |
| `duration` | int | 6 | 6 | 否 | Hidden(固定6秒) |
| `resolution` | string | 1080p | 1080p | 否 | Select |
| `fps` | int | 24 | 24 | 否 | Hidden |

#### 4.2.2 图生视频 (I2V)

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `model` | string | video-01 | video-01 | 是 | Select(固定) |
| `prompt` | string | - | - | 是 | TextArea |
| `input_image` | file | 图片URL/Base64 | - | 是 | ImageUploader |
| `resolution` | string | 1080p | 1080p | 否 | Select |

#### 4.2.3 主体驱动 (S2V)

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `model` | string | video-01 | video-01 | 是 | Select(固定) |
| `subject_reference` | string | subject_id | - | 是 | SubjectSelector |
| `prompt` | string | - | - | 是 | TextArea |

#### 4.2.4 模板模式

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `model` | string | video-01 | video-01 | 是 | Select(固定) |
| `template_id` | string | 见模板列表 | - | 是 | TemplateSelector |
| `template_params` | object | 模板特定 | - | 是 | DynamicForm |

### 4.3 模板ID清单 (11个)

| 模板ID | 名称 | 适用场景 |
|--------|------|----------|
| `fixed-video-01` | 经典模板 | 通用场景 |
| `anime-waifu` | 动漫女友 | 二次元角色 |
| `anime-warema` | 动漫娃娃 | 卡通风格 |
| `live-action` | 真人风格 | 写实风格 |
| `scripted-video` | 脚本控制 | 精确控制 |
| `virtual-avatar` | 虚拟人 | 数字人 |
| `portrait-video` | 肖像视频 | 人像为主 |
| `character-animation` | 角色动画 | 游戏/动画角色 |
| `product-showcase` | 产品展示 | 电商/产品 |
| `scene-animation` | 场景动画 | 背景/风景 |
| `custom-template` | 自定义模板 | 用户模板 |

### 4.4 Prompt写作指南

**基础公式**:
```
[主体] + [动作/表情] + [场景] + [风格] + [镜头语言]
```

**示例**:
```
# 正面示例
"一位年轻女性穿着白色连衣裙，站在海边，金色的阳光洒在她身上，微风吹起裙摆，电影级画面，景深效果"

# 改进版本
"20多岁女性，长发，白色连衣裙，站在金色沙滩上，海风吹起头发和裙摆，夕阳侧光，浅景深，4K电影感"
```

**反面示例 (避免)**:
- 过于简短的描述
- 矛盾的元素
- 模糊的主体指代

### 4.5 工作流程

#### 视频生成异步流程
```
[选择生成模式] → [输入Prompt/上传素材] → [选择模板(可选)] → [设置参数] → [提交任务]
                                                                        │
                                                                        ▼
                                                           [获取task_id，进入轮询]
                                                                        │
                                          ┌───────────────────────────────┘
                                          ▼
                              [轮询任务状态 (Pending → Processing)]
                                          │
                                          ▼
                              [任务完成，获取video_url]
                                          │
                                          ▼
                              [视频预览 / 下载 (有效期24小时)]
```

### 4.6 技术限制

| 限制项 | 值 |
|--------|-----|
| 视频时长 | **6秒固定** |
| 输出分辨率 | 1080P |
| 输出格式 | mp4 |
| Prompt长度 | 无明确限制，建议<500字 |
| 主体参考图 | ≤10MB |
| 轮询建议间隔 | 5-10秒 |

---

## 5. 功能规格 - 音乐模块

### 5.1 功能清单

| 功能 | 端点 | 描述 |
|------|------|------|
| 歌词生成 | `POST /v1/lyrics_generation` | AI辅助歌词创作 |
| 音乐生成 | `POST /v1/music_generation` | 歌词+风格标签生成音乐 |

### 5.2 API参数对照表

#### 5.2.1 歌词生成

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `prompt` | string | - | - | 是 | TextArea |
| `music_style` | string | - | - | 否 | StyleSelector |
| `structure` | string | 见结构标记 | - | 否 | StructureSelector |

#### 5.2.2 音乐生成

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `lyrics` | string | LRC格式 | - | 是 | LyricsEditor |
| `music_style` | string | 见风格标签 | - | 是 | MultiStyleSelector |
| `model` | string | music-01 | music-01 | 是 | Select(固定) |

### 5.3 风格标签系统

#### 音乐风格 (15+种)
```
Pop              # 流行
Rock             # 摇滚
Jazz             # 爵士
Classical         # 古典
Electronic       # 电子
Hip-Hop          # 嘻哈
R&B              # 节奏布鲁斯
Country          # 乡村
Folk             # 民谣
Blues            # 蓝调
Metal            # 金属
Punk             # 朋克
Reggae           # 雷鬼
Soul             # 灵魂乐
Ambient          # 环境音乐
```

#### 情感标签 (12+种)
```
Happy            # 快乐
Sad              # 悲伤
Energetic        # 充满能量
Calm             # 平静
Romantic         # 浪漫
Aggressive       # 激烈
Melancholic      # 忧郁
Uplifting        # 振奋
Nostalgic        # 怀旧
Dreamy           # 梦幻
Tense            # 紧张
Serene           # 安详
```

#### 场景标签 (10+种)
```
Party            # 派对
Chill            # 休闲
Workout          # 健身
Study            # 学习
Sleep            # 睡眠
Romance          # 约会
RoadTrip         # 公路旅行
Meditation       # 冥想
Gaming           # 游戏
Cooking          # 烹饪
```

### 5.4 歌词格式规范 (LRC)

**结构标记**:
```
[verse]     # 主歌
[chorus]    # 副歌/高潮
[pre-chorus] # 前副歌
[bridge]    # 桥段
[outro]     # 结尾
[intro]     # 前奏
[hook]      # 记忆点
```

**时间戳格式**:
```
[00:12.34]歌词内容
[00:15.67]第二句歌词
```

**示例**:
```
[verse]
[00:05.00]月光洒在窗台上
[00:08.50]思念随风飘向远方
[00:12.00]回忆像部电影
[00:15.50]循环播放着你的脸

[chorus]
[00:20.00]时间它慢慢走
[00:23.50]带不走我的温柔
[00:27.00]在这漫长的夜
[00:30.50]我在这里守候
```

### 5.5 工作流程

#### 音乐生成流程
```
[创建新音乐] → [选择生成方式]
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    [歌词生成模式]           [直接编辑模式]
          │                       │
          ▼                       ▼
    [输入主题/风格]        [编辑LRC歌词]
          │                       │
          ▼                       ▼
    [AI生成歌词]          [设置风格标签]
          │                       │
          └───────────┬───────────┘
                      ▼
              [多风格标签选择]
                      │
                      ▼
              [生成音乐任务]
                      │
                      ▼
              [轮询任务状态]
                      │
                      ▼
              [获取music_url]
                      │
                      ▼
              [音频预览/下载]
```

### 5.6 技术限制

| 限制项 | 值 |
|--------|-----|
| 歌词格式 | LRC带时间戳 |
| 风格标签 | 至少1个，最多3个 |
| 音乐时长 | 待确认(通常3-4分钟) |
| 输出格式 | mp3 |
| 生成时间 | 30秒-2分钟 |

---

## 4. 功能规格 - 图片模块

### 4.1 功能清单

| 功能 | 端点 | 描述 |
|------|------|------|
| 文生图 | `POST /v1/image_generation` | 文本描述生成高质量图片 |

### 4.2 API参数对照表

| 参数名 | 类型 | 取值范围 | 默认值 | 必填 | UI控件 |
|-------|------|---------|-------|-----|-------|
| `model` | string | image-01 | image-01 | 是 | Select(固定) |
| `prompt` | string | - | - | 是 | TextArea |
| `resolution` | string | 1K, 2K | 1K | 否 | Select |
| `num_images` | int | 1-4 | 1 | 否 | Stepper |

### 4.3 风格选项

| 风格 | 说明 |
|------|------|
| General | 通用风格 |
| Realistic | 写实风格 |
| Anime | 动漫风格 |
| Logo | Logo设计 |
| Product | 产品展示 |

### 4.4 工作流程

```
[输入Prompt] → [选择风格] → [设置尺寸/数量] → [生成任务]
                                                       │
                                                       ▼
                                              [获取task_id]
                                                       │
                                                       ▼
                                              [轮询任务状态]
                                                       │
                                                       ▼
                                              [获取图片URL]
                                                       │
                                                       ▼
                                              [画廊展示/下载]
```

### 4.5 技术限制

| 限制项 | 值 |
|--------|-----|
| Ultra每日额度 | 800张 |
| 同时生成数量 | 1-4张 |
| 输出分辨率 | 1K, 2K |
| 输出格式 | PNG/JPG |

---

## 7. 功能规格 - AI对话模块

### 7.1 功能清单

| 功能 | 端点 | 描述 |
|------|------|------|
| 智能对话 | `POST /v1/text/chatcompletion_v2` | M2.7大模型对话 |
| 内容评价 | (内置) | 评价生成内容的质量 |
| 反馈增强 | (内置) | 提供改进建议和优化方向 |

### 7.2 AI对话核心能力

#### 7.2.1 基础对话
- **模型**: M2.7-highspeed
- **上下文窗口**: 支持多轮对话
- **请求限制**: 30,000次/5小时(Ultra)

#### 7.2.2 内容评价系统
当用户在创作模块（语音/图片/视频/音乐）生成内容后，可一键发送给AI对话助手进行评价：

| 评价维度 | 说明 |
|---------|------|
| 整体质量 | 1-10分评分 |
| 技术评估 | 画质、音质、流畅度等专业指标 |
| 改进建议 | 具体可操作的优化方向 |
| 创作指导 | 如何更好地使用工具 |

#### 7.2.3 反馈增强流程

```
[用户生成内容]
        │
        ▼
[一键发送给AI助手]
        │
        ▼
[AI分析内容]
        │
        ├──→ 质量评分 (1-10)
        ├──→ 优点总结
        ├──→ 改进建议
        └──→ 优化后的Prompt/参数建议
        │
        ▼
[用户决定是否按建议优化]
        │
        ├── 是 → [应用建议，重新生成]
        └── 否 → [保持原样或手动调整]
```

### 7.3 对话界面设计

```
┌─────────────────────────────────────────────────────────────────┐
│  💬 AI创作助手                                              [清空] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🤖 助手                                                   │  │
│  │ 你好！我是你的AI创作助手。我可以帮助你：                        │  │
│  │                                                          │  │
│  │ • 评价你生成的语音、图片、视频、音乐                          │  │
│  │ • 提供具体的改进建议和优化方向                                 │  │
│  │ • 回答关于MiniMax工具使用的任何问题                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 用户                                                   │  │
│  │ 请评价一下我生成的这段语音：                                  │  │
│  │ [音频文件: voice_001.mp3]                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🤖 助手                                                   │  │
│  │ 已收到你的语音文件，让我分析一下：                            │  │
│  │                                                          │  │
│  │ 📊 **质量评分: 8/10**                                     │  │
│  │                                                          │  │
│  │ ✅ **优点:**                                               │  │
│  │ • 音色清晰，自然度高                                        │  │
│  │ • 语速适中，停顿合理                                        │  │
│  │ • 情感表达较为丰富                                          │  │
│  │                                                          │  │
│  │ ⚠️ **可改进的地方:**                                       │  │
│  │ • 高音部分有轻微失真，建议降低音调                           │  │
│  │ • 第15-20秒处语速稍快，可适当减速                           │  │
│  │                                                          │  │
│  │ 💡 **优化建议:**                                           │  │
│  │ • 将pitch从2调整为-1                                      │  │
│  │ • speed从1.0调整为0.9                                     │  │
│  │ • 建议使用speech-2.8-hd模型获得更高清晰度                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [📎] [输入消息...                          ] [发送]             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  快捷指令: [评价语音] [评价图片] [评价视频] [评价音乐] [使用帮助]  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 内置快捷指令

| 指令 | 触发条件 | AI行为 |
|------|---------|--------|
| `评价语音` | 用户发送音频 | 分析音质、语调、情感，给出改进建议 |
| `评价图片` | 用户发送图片 | 分析构图、色彩、细节，给出优化Prompt |
| `评价视频` | 用户发送视频 | 分析流畅度、内容相关性、视觉效果 |
| `评价音乐` | 用户发送音乐 | 分析旋律、节奏、情感表达 |
| `使用帮助` | 用户请求帮助 | 提供工具使用指导和最佳实践 |

### 7.5 技术限制

| 限制项 | 值 |
|--------|-----|
| 模型 | M2.7-highspeed |
| 请求限制 | 30,000次/5小时 |
| 上下文窗口 | 支持多轮对话 |
| 支持内容类型 | 语音/图片/视频/音乐 + 文本 |

---

## 8. UI设计规范

### 8.1 设计系统

#### 色彩系统
```
Primary:        #6366F1 (Indigo-500)
Primary Dark:   #4F46E5 (Indigo-600)
Secondary:      #8B5CF6 (Violet-500)
Accent:         #F59E0B (Amber-500)
Success:        #10B981 (Emerald-500)
Warning:        #F59E0B (Amber-500)
Error:          #EF4444 (Red-500)

Background:     #0F172A (Slate-900)
Surface:        #1E293B (Slate-800)
Border:         #334155 (Slate-700)
Text Primary:   #F8FAFC (Slate-50)
Text Secondary: #94A3B8 (Slate-400)
```

#### 字体系统
```
Font Family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Heading XL:  32px / 700 / 1.2
Heading L:   24px / 600 / 1.3
Heading M:   20px / 600 / 1.4
Heading S:   16px / 600 / 1.4
Body:        14px / 400 / 1.5
Caption:     12px / 400 / 1.4
Mono:        "JetBrains Mono", "Fira Code", monospace
```

#### 间距系统
```
xs:   4px
sm:   8px
md:   16px
lg:   24px
xl:   32px
2xl:  48px
3xl:  64px
```

#### 圆角系统
```
sm:   4px
md:   8px
lg:   12px
xl:   16px
full: 9999px
```

### 8.2 组件规范

#### 8.2.1 输入控件

**TextArea (文本输入)**
- 最小高度: 120px
- 最大高度: 400px
- 行数显示: 根据内容自动扩展
- 占位符: 灰色提示文字
- 字符计数: 右下角显示

**Slider (滑块)**
- 轨道高度: 4px
- 滑块尺寸: 16px
- 已填充颜色: Primary
- 拖动时显示当前值气泡

**Select (下拉选择)**
- 高度: 40px
- 边框圆角: 8px
- 展开动画: 150ms ease-out
- 搜索: 超过10项显示搜索框

**Switch (开关)**
- 宽度: 44px
- 高度: 24px
- 开启颜色: Primary
- 过渡动画: 200ms

**AudioUploader (音频上传)**
- 拖拽区域: 虚线边框
- 支持格式标签: mp3/m4a/wav
- 上传进度: 环形进度条
- 音频预览: 上传后显示波形图

**ImageUploader (图片上传)**
- 拖拽区域: 虚线边框
- 支持格式: jpg/png/webp
- 预览: 缩略图网格
- 删除: 右上角X按钮

### 8.3 页面布局

#### 8.3.1 三栏布局 (语音/视频/音乐)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Logo + 导航标签 + 用户菜单                               │
├────────────┬────────────────────────────────┬─────────────────┤
│            │                                │                 │
│  Sidebar   │       Main Content            │   Config       │
│  (240px)   │       (flex-1)                │   Panel        │
│            │                                │   (320px)      │
│  · 功能导航 │  · 输入区域                    │                 │
│  · 快速入口│  · 预览区域                    │  · 参数配置    │
│  · 历史记录│  · 结果展示                    │  · 参数预设    │
│            │                                │  · 保存配置    │
│            │                                │                 │
├────────────┴────────────────────────────────┴─────────────────┤
│ Footer: 状态栏 + 快捷键提示                                    │
└─────────────────────────────────────────────────────────────────┘
```

#### 8.3.2 任务列表布局

```
┌─────────────────────────────────────────────────────────────────┐
│ 标题栏: "任务历史" + 筛选标签 + 搜索框 + 新建按钮              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │  卡片1  │ │  卡片2  │ │  卡片3  │ │  卡片4  │   ...       │
│  │         │ │         │ │         │ │         │              │
│  │ 🎵 语音 │ │ 🎬 视频 │ │ 🎵 音乐 │ │ 🎵 语音 │              │
│  │ 状态:成功│ │ 状态:进行│ │ 状态:成功│ │ 状态:失败│              │
│  │ 时间:刚刚│ │ 时间:5分钟│ │ 时间:1小时│ │ 时间:2小时│              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
├─────────────────────────────────────────────────────────────────┤
│ 分页: < 1 2 3 ... 10 >                    显示 1-20 / 共 156   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 状态设计

#### 任务状态

| 状态 | 图标 | 颜色 | 说明 |
|------|------|------|------|
| Pending | ⏳ | #F59E0B | 排队中 |
| Processing | 🔄 | #3B82F6 | 处理中 |
| Success | ✅ | #10B981 | 已完成 |
| Failed | ❌ | #EF4444 | 失败 |

#### 加载状态
- 骨架屏: 任务列表/卡片加载
- 环形进度: 文件上传
- 脉冲动画: 生成中状态
- 进度条: 大文件上传

#### 空状态
- 图标: 大尺寸灰色图标
- 文案: 明确告诉用户做什么
- CTA: 主按钮引导操作

### 8.5 响应式断点

```
Mobile:   < 640px    (单栏布局，底部导航)
Tablet:   640-1024px (两栏布局，折叠侧边栏)
Desktop:  1024-1440px (三栏布局)
Wide:     > 1440px   (三栏布局，更宽配置面板)
```

---

## 9. 技术架构

### 9.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端框架 | React 18 + TypeScript | 组件化，类型安全 |
| 状态管理 | Zustand | 轻量，够用 |
| UI组件库 | Radix UI + Tailwind CSS | 无样式Headless组件 |
| 路由 | React Router v6 | SPA路由 |
| HTTP客户端 | Axios | 请求拦截，统一错误处理 |
| WebSocket | 原生WebSocket API | 同步语音合成 |
| 样式 | Tailwind CSS + CSS Variables | 主题切换支持 |
| 构建工具 | Vite | 快速HMR |
| 后端 | Next.js (API Routes) | BFF层 |
| 部署 | Vercel | 边缘部署 |

### 9.2 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   React     │  │   Zustand   │  │  Tailwind   │            │
│  │   SPA       │  │   Store     │  │   CSS       │            │
│  └──────┬──────┘  └─────────────┘  └─────────────┘            │
│         │                                                      │
│         │ HTTP/WebSocket                                      │
└─────────┼─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js BFF Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  API Routes │  │  Auth      │  │  Rate Limit │            │
│  │  /api/*    │  │  Middleware │  │  限流控制   │            │
│  └──────┬──────┘  └─────────────┘  └─────────────┘            │
│         │                                                      │
│         │ HTTP/HTTPS                                          │
└─────────┼─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MiniMax API                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  /v1/t2a_* │  │  /v1/video* │  │  /v1/music* │            │
│  │  语音合成   │  │  视频生成   │  │  音乐生成   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 核心模块设计

#### 9.3.1 API服务层

```typescript
// services/api/minimax.ts
interface MiniMaxConfig {
  apiKey: string;
  baseURL: string;
}

// 语音合成服务
class SpeechService {
  constructor(config: MiniMaxConfig);
  async createAsyncTask(params: SpeechAsyncParams): Promise<TaskResponse>;
  async pollTaskStatus(taskId: string): Promise<TaskStatus>;
  createWebSocket(params: SpeechStreamParams): WebSocket;
}

// 视频生成服务
class VideoService {
  constructor(config: MiniMaxConfig);
  async generateT2V(params: T2VParams): Promise<TaskResponse>;
  async generateI2V(params: I2VParams): Promise<TaskResponse>;
  async generateS2V(params: S2VParams): Promise<TaskResponse>;
  async pollTaskStatus(taskId: string): Promise<TaskStatus>;
}

// 音乐生成服务
class MusicService {
  constructor(config: MiniMaxConfig);
  async generateLyrics(params: LyricsParams): Promise<LyricsResponse>;
  async generateMusic(params: MusicParams): Promise<TaskResponse>;
  async pollTaskStatus(taskId: string): Promise<TaskStatus>;
}
```

#### 9.3.2 状态管理

```typescript
// stores/taskStore.ts
interface TaskState {
  tasks: Task[];
  addTask(task: Task): void;
  updateTask(id: string, updates: Partial<Task>): void;
  removeTask(id: string): void;
}

// stores/configStore.ts
interface ConfigState {
  apiKey: string;
  theme: 'light' | 'dark';
  defaultModel: string;
  updateConfig(updates: Partial<ConfigState>): void;
}
```

### 9.4 目录结构

```
minimax-visual-tool/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── speech/
│   │   ├── page.tsx
│   │   ├── async/page.tsx
│   │   ├── stream/page.tsx
│   │   └── clone/page.tsx
│   ├── video/
│   │   ├── page.tsx
│   │   ├── t2v/page.tsx
│   │   ├── i2v/page.tsx
│   │   ├── s2v/page.tsx
│   │   └── template/page.tsx
│   ├── music/
│   │   ├── page.tsx
│   │   ├── lyrics/page.tsx
│   │   └── generate/page.tsx
│   ├── history/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── components/
│   ├── ui/              # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/           # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── config-panel.tsx
│   ├── speech/           # Speech module components
│   │   ├── voice-selector.tsx
│   │   ├── audio-uploader.tsx
│   │   ├── audio-player.tsx
│   │   └── ...
│   ├── video/            # Video module components
│   │   ├── prompt-editor.tsx
│   │   ├── image-uploader.tsx
│   │   ├── template-selector.tsx
│   │   └── ...
│   └── music/            # Music module components
│       ├── lyrics-editor.tsx
│       ├── style-selector.tsx
│       └── ...
├── services/
│   ├── api/
│   │   └── minimax.ts
│   └── storage/
│       └── local.ts
├── stores/
│   ├── taskStore.ts
│   └── configStore.ts
├── hooks/
│   ├── useTask.ts
│   ├── usePolling.ts
│   └── useWebSocket.ts
├── lib/
│   ├── utils.ts
│   └── constants.ts
└── types/
    ├── speech.ts
    ├── video.ts
    └── music.ts
```

---

## 10. 开发计划

### 10.1 阶段划分

#### Phase 1: 基础框架 (Week 1-2)
- [ ] 项目初始化 (Vite + React + TypeScript + Next.js)
- [ ] UI组件库搭建 (Radix UI + Tailwind)
- [ ] 布局组件开发 (Header, Sidebar, ConfigPanel)
- [ ] 路由配置
- [ ] 主题切换功能
- [ ] AI对话基础框架

#### Phase 2: 语音模块 (Week 3-4)
- [ ] API服务层封装
- [ ] 音色选择器组件
- [ ] 异步合成页面
- [ ] 同步合成页面 (WebSocket)
- [ ] 音色克隆页面
- [ ] 任务轮询逻辑

#### Phase 3: 图片模块 (Week 4-5) ⬅️ 新增
- [ ] 图片生成API对接 (image-01)
- [ ] Prompt编辑器增强
- [ ] 风格选择器
- [ ] 图片画廊页面
- [ ] 1K/2K分辨率切换

#### Phase 4: 视频模块 (Week 5-6)
- [ ] 视频生成API对接
- [ ] Prompt编辑器
- [ ] 图片上传组件
- [ ] T2V文生视频页面
- [ ] I2V图生视频页面
- [ ] S2V主体驱动页面
- [ ] 模板选择器
- [ ] 视频预览播放器

#### Phase 5: 音乐模块 (Week 7-8)
- [ ] 歌词生成API对接
- [ ] 音乐生成API对接
- [ ] LRC歌词编辑器
- [ ] 风格标签选择器
- [ ] 歌词生成页面
- [ ] 音乐生成页面
- [ ] 音频波形预览

#### Phase 6: AI对话增强 (Week 8-9) ⬅️ 新增
- [ ] 内容评价系统集成
- [ ] 快捷指令面板
- [ ] 生成内容一键发送AI
- [ ] 多模态内容分析
- [ ] 改进建议应用

#### Phase 7: 历史与设置 (Week 9-10)
- [ ] 任务历史页面
- [ ] 本地存储 (localStorage/IndexedDB)
- [ ] API Key配置 + 额度查询
- [ ] 用户仪表盘
- [ ] 响应式适配

#### Phase 8: 优化与测试 (Week 10-12)
- [ ] 错误处理优化
- [ ] 加载状态优化
- [ ] E2E测试
- [ ] 性能优化
- [ ] 全模块联调

### 10.2 里程碑

| 里程碑 | 交付内容 | 时间 |
|--------|---------|------|
| M1 | 基础框架 + AI对话 + 语音模块上线 | Week 4 |
| M2 | 图片模块上线 | Week 5 |
| M3 | 视频模块上线 | Week 6 |
| M4 | 音乐模块上线 | Week 8 |
| M5 | AI内容评价系统 + 全功能发布 | Week 10 |
| M6 | 测试完成，Production Ready | Week 12 |

---

## 11. 附录

### 11.1 MiniMax API端点汇总

| 功能 | 方法 | 端点 |
|------|------|------|
| 对话 | POST | `/v1/text/chatcompletion_v2` |
| 异步语音合成 | POST | `/v1/t2a_async_v2` |
| 同步语音合成 | WS | `wss://api.minimaxi.com/ws/v1/t2a_v2` |
| 音色克隆 | POST | `/v1/voice_clone` |
| **图片生成** | POST | `/v1/image_generation` |
| 视频生成 | POST | `/v1/video_generation` |
| 歌词生成 | POST | `/v1/lyrics_generation` |
| 音乐生成 | POST | `/v1/music_generation` |

### 11.2 技术限制汇总

| 模块 | 限制项 | 值 |
|------|--------|-----|
| AI对话 | 请求限制 | 30,000次/5小时 |
| 语音-异步 | 文本长度 | 100,000字符 |
| 语音-同步 | 文本长度 | 10,000字符 |
| 语音-克隆 | 音频时长 | 10秒-5分钟 |
| 语音-克隆 | 音频大小 | ≤20MB |
| 语音 | 下载URL有效期 | 9小时 |
| **图片** | **每日额度** | **800张(Ultra)** |
| **图片** | **同时生成** | **1-4张** |
| **图片** | **分辨率** | **1K, 2K** |
| 视频 | 时长 | 6秒固定 |
| 视频 | 分辨率 | 1080P |
| 音乐 | 风格标签 | 最少1个，最多3个 |

### 11.3 参考资源

- [MiniMax API文档](https://platform.minimaxi.com/docs)
- [MiniMax控制台](https://platform.minimaxi.com)
- UI原型图 (见用户提供的3张参考图)

---

**文档结束**
