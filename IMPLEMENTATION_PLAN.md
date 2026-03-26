# MiniMax Visual Tool - 详细实施计划

> **文档版本**: v1.0
> **更新日期**: 2026-03-26
> **架构**: Vue 3 + Vite + TypeScript + Pinia + UnoCSS + Element Plus

---

## 1. 项目阶段总览

| 阶段 | 时间 | 核心交付 | 并行 Agent |
|------|------|----------|-----------|
| **Phase 0** | Week 1 | 项目初始化 + 框架搭建 | 2-3 个 Agent 并行 |
| **Phase 1** | Week 2-3 | 语音模块核心 | 2 个 Agent 并行 |
| **Phase 2** | Week 3-4 | 图片模块核心 | 2 个 Agent 并行 |
| **Phase 3** | Week 4-5 | 视频模块核心 | 2 个 Agent 并行 |
| **Phase 4** | Week 5-6 | 音乐模块核心 | 2 个 Agent 并行 |
| **Phase 5** | Week 6-7 | AI 对话模块 + 历史模块 | 2 个 Agent 并行 |
| **Phase 6** | Week 8-10 | 集成测试 + 优化 | 3 个 Agent 并行 |
| **Phase 7** | Week 11-12 | 部署上线 + 文档 | 1-2 个 Agent |

---

## 2. Phase 0: 项目初始化 (Week 1)

### 2.1 任务分解

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 0 并行任务                          │
├─────────────────────────────────────────────────────────────┤
│  Agent-1: 框架搭建         │  Agent-2: 公共组件          │
│  ───────────────────────   │  ──────────────────────     │
│  · 初始化 Vite + Vue3       │  · Button/Input 组件       │
│  · 配置 TypeScript          │  · Card/Dialog 组件         │
│  · 配置 ESLint (antfu)      │  · Loading/Toast 组件       │
│  · 配置 Pinia Store        │  · API 响应格式封装         │
│  · 配置 UnoCSS              │  · 类型定义 (types.ts)     │
│  · 配置路由 Vue Router      │  · 工具函数 (utils.ts)     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 详细任务清单

#### Agent-1: 前端框架搭建
| 任务 | 依赖 | 产出 |
|------|------|------|
| 初始化 Vite + Vue3 项目 | - | `package.json`, `vite.config.ts` |
| 配置 TypeScript (strict mode) | Vite | `tsconfig.json` |
| 配置 ESLint (antfu) | Node | `.eslintrc.cjs` |
| 配置 UnoCSS | Vite | `uno.config.ts` |
| 配置 Pinia Store | Vue | `stores/` 目录结构 |
| 配置 Vue Router | Vue | `router/` 路由配置 |
| 目录结构规划 | - | `src/` 下各模块目录 |

#### Agent-2: 公共组件开发
| 任务 | 依赖 | 产出 |
|------|------|------|
| Button 组件 | Vue | `components/common/Button.vue` |
| Input 组件 | Vue | `components/common/Input.vue` |
| Select 组件 | Vue | `components/common/Select.vue` |
| Card 组件 | Vue | `components/common/Card.vue` |
| Dialog 组件 | Vue | `components/common/Dialog.vue` |
| Loading 组件 | Vue | `components/common/Loading.vue` |
| Toast 组件 | Vue | `components/common/Toast.vue` |
| API 响应封装 | - | `utils/request.ts` |
| 类型定义 | - | `types/index.ts` |

### 2.3 技术规范 (antfu)

```typescript
// 使用 <script setup lang="ts">
// 显式调用 antfu skill
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})
```

---

## 3. Phase 1: 语音模块 (Week 2-3)

### 3.1 任务分解

```
┌─────────────────────────────────────────────────────────────┐
│                 Phase 1 并行任务                           │
├─────────────────────────────────────────────────────────────┤
│  Agent-1: 异步语音合成      │  Agent-2: 同步语音 + 音色克隆 │
│  ──────────────────────     │  ─────────────────────────   │
│  · 异步合成 UI              │  · WebSocket 连接管理        │
│  · 任务创建 + 轮询          │  · 流式音频播放             │
│  · 音频下载 + 播放          │  · 音色克隆 UI + API        │
│  · 进度状态展示             │  · 327 音色选择器           │
│  · store 状态管理           │  · store 状态管理           │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 详细任务清单

#### Agent-1: 异步语音合成 (speech-t2a-async)

**API 端点**: `POST /v1/t2a_async_v2`

| 任务 | 依赖 | 产出 |
|------|------|------|
| 文本输入组件 | common/Input | `components/voice/TextInput.vue` |
| 模型选择器 | common/Select | `components/voice/ModelSelect.vue` |
| 音色选择器 (327音色) | API 数据 | `components/voice/VoiceSelector.vue` |
| 发音字典配置 | - | `components/voice/PronDictConfig.vue` |
| 异步合成 API 调用 | request utils | `api/voice.ts` |
| 任务轮询逻辑 | - | `composables/useVoicePolling.ts` |
| 音频播放器 | - | `components/voice/AudioPlayer.vue` |
| 语音 Store | Pinia | `stores/voice.ts` |

**API 响应处理**:
```typescript
// 轮询流程
1. POST /v1/t2a_async_v2 → { task_id, status }
2. GET /v1/t2a_async_v2?task_id=xxx → { status, file_id }
3. GET /v1/files?file_id=xxx → { url }
```

#### Agent-2: 同步语音合成 + 音色克隆

**API 端点**: `wss://api.minimaxi.com/ws/v1/t2a_v2`

| 任务 | 依赖 | 产出 |
|------|------|------|
| WebSocket 管理器 | - | `composables/useWebSocket.ts` |
| 流式文本发送组件 | - | `components/voice/StreamingInput.vue` |
| 实时音频播放 | - | `composables/useAudioStream.ts` |
| mpv 播放器检测 | - | `utils/mpvCheck.ts` |
| 音色克隆 UI | - | `components/voice/VoiceClone.vue` |
| 音色克隆 API | - | `api/voiceClone.ts` |
| 克隆任务状态 | - | `composables/useCloneStatus.ts` |

---

## 4. Phase 2: 图片模块 (Week 3-4)

### 4.1 任务分解

```
┌─────────────────────────────────────────────────────────────┐
│                 Phase 2 并行任务                           │
├─────────────────────────────────────────────────────────────┤
│  Agent-1: 文生图功能         │  Agent-2: 图片管理 + 展示  │
│  ──────────────────────       │  ─────────────────────────  │
│  · 文本提示词输入             │  · 图片画廊组件             │
│  · 风格选择器                 │  · 图片详情弹窗             │
│  · 尺寸/质量配置              │  · 下载/复制功能           │
│  · image-01 API               │  · 历史记录集成             │
│  · 生成进度展示                │  · 收藏功能                │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 详细任务清单

#### Agent-1: 文生图功能

**API 端点**: `POST /v1/image`

| 任务 | 依赖 | 产出 |
|------|------|------|
| 提示词编辑器 | common/Input | `components/image/PromptInput.vue` |
| 风格选择器 | - | `components/image/StyleSelect.vue` |
| 尺寸选择器 | - | `components/image/SizeSelect.vue` |
| 质量/数量配置 | - | `components/image/QualityConfig.vue` |
| 图片生成 API | request | `api/image.ts` |
| 任务轮询 | - | `composables/useImagePolling.ts` |
| 生成进度 | - | `components/image/GenerationProgress.vue` |
| 图片 Store | Pinia | `stores/image.ts` |

**image-01 API 参数**:
```typescript
interface ImageRequest {
  model: 'image-01'
  prompt: string
  image_size?: '1:1' | '16:9' | '9:16' | '3:4' | '4:3'
  image_ratio?: string
  num_images?: number  // 1-3
}
```

#### Agent-2: 图片管理

| 任务 | 依赖 | 产出 |
|------|------|------|
| 图片画廊组件 | - | `components/image/ImageGallery.vue` |
| 图片卡片 | - | `components/image/ImageCard.vue` |
| 图片详情弹窗 | common/Dialog | `components/image/ImageDetail.vue` |
| 图片下载 | - | `utils/downloadImage.ts` |
| 复制到剪贴板 | - | `utils/copyImage.ts` |
| 收藏功能 | - | `composables/useFavorites.ts` |
| 历史记录 | IndexedDB | `stores/imageHistory.ts` |

---

## 5. Phase 3: 视频模块 (Week 4-5)

### 5.1 任务分解

```
┌─────────────────────────────────────────────────────────────┐
│                 Phase 3 并行任务                           │
├─────────────────────────────────────────────────────────────┤
│  Agent-1: 视频生成核心         │  Agent-2: 视频预览 + 管理 │
│  ──────────────────────        │  ─────────────────────────  │
│  · T2V 文生视频                │  · 视频播放器组件          │
│  · I2V 图生视频               │  · 视频封面提取           │
│  · S2V 主体驱动               │  · 视频画廊              │
│  · 模板选择器                  │  · 下载功能               │
│  · 视频生成 API                │  · 历史记录               │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 详细任务清单

#### Agent-1: 视频生成

**API 端点**: `POST /v1/video`

| 任务 | 依赖 | 产出 |
|------|------|------|
| 文本转视频 UI | - | `components/video/TextToVideo.vue` |
| 图片转视频 UI | - | `components/video/ImageToVideo.vue` |
| 主体驱动 UI | - | `components/video/SubjectToVideo.vue` |
| 模板选择器 (11模板) | - | `components/video/TemplateSelect.vue` |
| 视频生成 API | request | `api/video.ts` |
| 任务轮询 | - | `composables/useVideoPolling.ts` |
| 视频生成进度 | - | `components/video/VideoProgress.vue` |
| 视频 Store | Pinia | `stores/video.ts` |

**视频模式**:
1. `text-to-video` - 文生视频
2. `image-to-video` - 图生视频
3. `subject-to-video` - 主体驱动
4. `subject-reference` - 主体参考

#### Agent-2: 视频预览管理

| 任务 | 依赖 | 产出 |
|------|------|------|
| 视频播放器 | - | `components/video/VideoPlayer.vue` |
| 封面提取 | - | `utils/extractVideoCover.ts` |
| 视频画廊 | - | `components/video/VideoGallery.vue` |
| 视频卡片 | - | `components/video/VideoCard.vue` |
| 视频下载 | - | `utils/downloadVideo.ts` |
| 历史记录 | IndexedDB | `stores/videoHistory.ts` |

---

## 6. Phase 4: 音乐模块 (Week 5-6)

### 6.1 任务分解

```
┌─────────────────────────────────────────────────────────────┐
│                 Phase 4 并行任务                           │
├─────────────────────────────────────────────────────────────┤
│  Agent-1: 音乐生成核心         │  Agent-2: 歌词编辑器      │
│  ──────────────────────        │  ─────────────────────────  │
│  · 歌词编辑器                  │  · 歌词输入                │
│  · 风格标签选择                │  · 歌词格式化              │
│  · Music-2.5 API               │  · AI 歌词辅助             │
│  · 音频播放                    │  · 歌词同步显示            │
│  · 任务轮询                    │  · 翻译功能                │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 详细任务清单

#### Agent-1: 音乐生成

**API 端点**: `POST /v1/music`

| 任务 | 依赖 | 产出 |
|------|------|------|
| 歌词编辑器 | common/Input | `components/music/LyricsEditor.vue` |
| 风格标签选择 | - | `components/music/StyleTags.vue` |
| 音乐生成 API | request | `api/music.ts` |
| 任务轮询 | - | `composables/useMusicPolling.ts` |
| 音乐播放器 | - | `components/music/MusicPlayer.vue` |
| 波形可视化 | - | `components/music/Waveform.vue` |
| 音乐 Store | Pinia | `stores/music.ts` |

#### Agent-2: 歌词编辑

| 任务 | 依赖 | 产出 |
|------|------|------|
| 歌词输入组件 | - | `components/music/LyricInput.vue` |
| 歌词格式化 | - | `utils/formatLyrics.ts` |
| 歌词时间戳 | - | `components/music/LyricTimestamp.vue` |
| 歌词翻译 | AI API | `composables/useLyricTranslation.ts` |
| 歌词同步 | - | `composables/useLyricSync.ts` |
| AI 歌词生成 | AI 对话 | `composables/useAILyricSuggest.ts` |

---

## 7. Phase 5: AI 对话模块 + 历史模块 (Week 6-7)

### 7.1 任务分解

```
┌─────────────────────────────────────────────────────────────┐
│            Phase 5 并行任务                                 │
├─────────────────────────────────────────────────────────────┤
│  Agent-1: AI 对话核心         │  Agent-2: 历史 + 收藏    │
│  ──────────────────────        │  ─────────────────────────  │
│  · M2.7 对话 UI                │  · IndexedDB 管理         │
│  · 流式响应                    │  · 历史记录列表           │
│  · 内容评价接口                │  · 搜索筛选               │
│  · 反馈增强                    │  · 收藏夹                 │
│  · 创作指导                    │  · 数据导出               │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 详细任务清单

#### Agent-1: AI 对话模块

**API 端点**: `POST /v1/chat`

| 任务 | 依赖 | 产出 |
|------|------|------|
| 对话窗口 | - | `components/chat/ChatWindow.vue` |
| 消息气泡 | - | `components/chat/MessageBubble.vue` |
| 输入框 | common/Input | `components/chat/ChatInput.vue` |
| 流式响应 | - | `composables/useStreamingChat.ts` |
| 内容评价 | - | `composables/useContentEval.ts` |
| 反馈增强 | - | `composables/useFeedback.ts` |
| AI 建议 | - | `composables/useAISuggest.ts` |
| Chat Store | Pinia | `stores/chat.ts` |

**评价反馈流程**:
```typescript
// 用户生成内容后
1. 发送到 AI 对话模块评价
2. 获取评价结果 + 改进建议
3. 用户根据建议调整参数
4. 重新生成
```

#### Agent-2: 历史模块

| 任务 | 依赖 | 产出 |
|------|------|------|
| IndexedDB 封装 | - | `utils/db.ts` |
| 历史记录组件 | - | `components/history/HistoryList.vue` |
| 筛选器 | - | `components/history/FilterBar.vue` |
| 搜索 | - | `composables/useSearch.ts` |
| 收藏夹 | - | `components/history/Favorites.vue` |
| 数据导出 | - | `utils/exportData.ts` |
| 历史 Store | Pinia + IndexedDB | `stores/history.ts` |

---

## 8. Phase 6: 集成测试 + 优化 (Week 8-10)

### 8.1 任务分解

```
┌─────────────────────────────────────────────────────────────┐
│            Phase 6 并行任务                                 │
├─────────────────────────────────────────────────────────────┤
│  Agent-1: 单元测试            │  Agent-2: E2E 测试        │
│  ──────────────────           │  ────────────────────────  │
│  · API 测试                   │  · 语音模块流程            │
│  · Store 测试                 │  · 图片生成流程            │
│  · 组件测试                  │  · 视频生成流程            │
│  · 覆盖率检查                 │  · 音乐生成流程            │
│                               │  · AI 对话流程             │
├─────────────────────────────────────────────────────────────┤
│  Agent-3: 性能优化                                          │
│  ──────────────────                                           │
│  · 懒加载路由                                                │
│  · 组件异步加载                                               │
│  · IndexedDB 优化                                             │
│  · 内存泄漏检查                                               │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 详细任务清单

#### Agent-1: 单元测试 (Vitest)

| 任务 | 依赖 | 产出 |
|------|------|------|
| API Mock | - | `tests/mocks/api.ts` |
| Voice API 测试 | - | `tests/voice.test.ts` |
| Image API 测试 | - | `tests/image.test.ts` |
| Video API 测试 | - | `tests/video.test.ts` |
| Music API 测试 | - | `tests/music.test.ts` |
| Store 测试 | - | `tests/stores/*.test.ts` |
| 工具函数测试 | - | `tests/utils/*.test.ts` |
| 覆盖率报告 | - | `coverage/` |

#### Agent-2: E2E 测试 (Playwright)

| 任务 | 依赖 | 产出 |
|------|------|------|
| 语音合成 E2E | - | `e2e/voice.spec.ts` |
| 图片生成 E2E | - | `e2e/image.spec.ts` |
| 视频生成 E2E | - | `e2e/video.spec.ts` |
| 音乐生成 E2E | - | `e2e/music.spec.ts` |
| AI 对话 E2E | - | `e2e/chat.spec.ts` |
| 历史记录 E2E | - | `e2e/history.spec.ts` |

#### Agent-3: 性能优化

| 任务 | 依赖 | 产出 |
|------|------|------|
| 路由懒加载 | Vue Router | `router/` 动态导入 |
| 组件懒加载 | - | `defineAsyncComponent` |
| 图片压缩 | - | `utils/imageCompress.ts` |
| IndexedDB 分页 | - | `utils/dbPagination.ts` |
| WebSocket 复用 | - | `composables/useWSPool.ts` |
| 内存分析 | Chrome DevTools | 优化报告 |

---

## 9. Phase 7: 部署上线 + 文档 (Week 11-12)

### 9.1 任务分解

| 任务 | Agent | 产出 |
|------|-------|------|
| GitHub Actions CI/CD | Agent-1 | `.github/workflows/` |
| Vercel/Netlify 部署 | Agent-1 | `vercel.json` |
| README 文档 | Agent-2 | `README.md` |
| API 文档 | Agent-2 | `docs/API.md` |
| 用户手册 | Agent-2 | `docs/USER_GUIDE.md` |

### 9.2 CI/CD 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run test
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 10. Agent 并行执行矩阵

| 阶段 | Agent-1 | Agent-2 | Agent-3 |
|------|----------|----------|----------|
| **Phase 0** | 框架搭建 | 公共组件 | - |
| **Phase 1** | 异步语音合成 | 同步语音+克隆 | - |
| **Phase 2** | 文生图 | 图片管理 | - |
| **Phase 3** | 视频生成 | 视频预览 | - |
| **Phase 4** | 音乐生成 | 歌词编辑 | - |
| **Phase 5** | AI 对话 | 历史模块 | - |
| **Phase 6** | 单元测试 | E2E 测试 | 性能优化 |
| **Phase 7** | 部署 CI/CD | 文档 | - |

---

## 11. 技术栈清单

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue | 3.4+ |
| 构建 | Vite | 5.x |
| 语言 | TypeScript | 5.x |
| 状态 | Pinia | 2.x |
| 路由 | Vue Router | 4.x |
| CSS | UnoCSS | 0.58+ |
| UI | Element Plus | 2.x |
| 测试 | Vitest | 1.x |
| E2E | Playwright | 1.x |
| 存储 | IndexedDB | (Dexie.js) |
| 图标 | Iconify | - |

---

## 12. 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| WebSocket mpv 依赖 | HIGH | 降级到异步模式 |
| API 限流 | MEDIUM | 请求队列 + 重试 |
| IndexedDB 容量 | MEDIUM | 分页 + 清理策略 |
| 327 音色加载 | LOW | 虚拟滚动 + 懒加载 |
| 视频大文件 | HIGH | 分片下载 + 进度显示 |

---

## 13. 里程碑

| 周数 | 日期 | 里程碑 |
|------|------|--------|
| Week 1 | 2026-03-27 | Phase 0 完成，框架可运行 |
| Week 3 | 2026-04-10 | Phase 1+2 完成，语音+图片可用 |
| Week 5 | 2026-04-24 | Phase 3+4 完成，视频+音乐可用 |
| Week 7 | 2026-05-08 | Phase 5 完成，AI 对话可用 |
| Week 10 | 2026-05-29 | Phase 6 完成，全模块集成 |
| Week 12 | 2026-06-12 | Phase 7 完成，生产部署 |

---

*文档结束*
