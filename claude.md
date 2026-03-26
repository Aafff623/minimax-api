# MiniMax Visual Tool - 项目指南

> **项目版本**: v1.0
> **更新日期**: 2026-03-26
> **技术栈**: Vue 3 + Vite + TypeScript + Pinia + UnoCSS + Element Plus

---

## 1. 项目概述

MiniMax Ultra 用户专属 Web 可视化工具，涵盖 6 大 AI 模块：
- 🎤 **语音合成** (Speech 2.8 - 50,000字符/天)
- 🖼️ **图片生成** (image-01 - 800张/天)
- 🎬 **视频生成** (Hailuo - 10个/天)
- 🎵 **音乐创作** (Music-2.5 - 15首/天)
- 💬 **AI 对话** (M2.7 - 30,000次/5小时)
- 👤 **音色克隆** (语音自定义)

**架构模式**: 纯前端 SPA (用户自带 API Key，无 BFF 层)

---

## 2. 目录结构

```
minimax-api/
├── src/
│   ├── api/                 # API 调用层
│   │   ├── voice.ts
│   │   ├── image.ts
│   │   ├── video.ts
│   │   ├── music.ts
│   │   └── chat.ts
│   ├── components/          # 组件
│   │   ├── common/          # 公共组件
│   │   ├── voice/           # 语音模块
│   │   ├── image/           # 图片模块
│   │   ├── video/           # 视频模块
│   │   ├── music/           # 音乐模块
│   │   ├── chat/            # AI 对话模块
│   │   └── history/         # 历史模块
│   ├── composables/         # 组合式函数
│   │   ├── useVoicePolling.ts
│   │   ├── useWebSocket.ts
│   │   └── ...
│   ├── stores/              # Pinia 状态
│   │   ├── voice.ts
│   │   ├── image.ts
│   │   ├── video.ts
│   │   ├── music.ts
│   │   ├── chat.ts
│   │   └── history.ts
│   ├── utils/              # 工具函数
│   │   ├── db.ts           # IndexedDB
│   │   └── ...
│   └── views/              # 页面
│       ├── VoiceView.vue
│       ├── ImageView.vue
│       ├── VideoView.vue
│       ├── MusicView.vue
│       ├── ChatView.vue
│       └── HistoryView.vue
├── tests/                  # 单元测试
├── e2e/                    # E2E 测试
└── docs/                   # 文档
```

---

## 3. Phase 执行矩阵

### Phase 0: 项目初始化 (Week 1)
**目标**: 搭建可运行框架

| Agent | 任务 | 产出 |
|-------|------|------|
| Agent-1 | 框架搭建 | `package.json`, `vite.config.ts`, `tsconfig.json`, ESLint, UnoCSS, Pinia, Vue Router |
| Agent-2 | 公共组件 | Button, Input, Select, Card, Dialog, Loading, Toast 组件 |
| Agent-3 | 类型定义 | `types/index.ts`, API 响应类型, Props 类型 |

**验收标准**: `pnpm dev` 可启动，显示空白但完整的页面框架

---

### Phase 1: 语音模块 (Week 2-3)
**目标**: 语音合成 + 音色克隆可用

| Agent | 任务 | 产出 |
|-------|------|------|
| Agent-1 | 异步语音合成 | 文本输入 → API 调用 → 轮询任务 → 音频播放 |
| Agent-2 | 同步语音 + 克隆 | WebSocket 流式响应, 327音色选择器, 音色克隆 |

**验收标准**: 可合成语音并播放，可进行音色克隆

---

### Phase 2: 图片模块 (Week 3-4)
**目标**: image-01 图片生成可用

| Agent | 任务 | 产出 |
|-------|------|------|
| Agent-1 | 文生图 | 提示词 → image-01 API → 轮询 → 显示图片 |
| Agent-2 | 图片管理 | 画廊视图, 详情弹窗, 下载/收藏 |

**验收标准**: 可生成 1:1/16:9/9:16 尺寸图片，可浏览/下载

---

### Phase 3: 视频模块 (Week 4-5)
**目标**: 视频生成可用

| Agent | 任务 | 产出 |
|-------|------|------|
| Agent-1 | 视频生成 | T2V/I2V/S2V 模式, 11种模板, 任务轮询 |
| Agent-2 | 视频预览 | 播放器, 封面提取, 画廊, 下载 |

**验收标准**: 可生成 6s 视频并播放，可下载

---

### Phase 4: 音乐模块 (Week 5-6)
**目标**: 音乐创作可用

| Agent | 任务 | 产出 |
|-------|------|------|
| Agent-1 | 音乐生成 | 歌词编辑, 风格标签, Music-2.5 API |
| Agent-2 | 歌词编辑 | 格式化, 时间戳, AI 歌词辅助 |

**验收标准**: 可生成带歌词音乐，可预览波形

---

### Phase 5: AI 对话 + 历史 (Week 6-7)
**目标**: AI 评价反馈 + 历史记录

| Agent | 任务 | 产出 |
|-------|------|------|
| Agent-1 | AI 对话 | M2.7 流式对话, 内容评价, 反馈增强 |
| Agent-2 | 历史模块 | IndexedDB, 搜索, 收藏, 筛选 |

**验收标准**: 可对生成内容进行 AI 评价，可搜索历史记录

---

### Phase 6: 测试 + 优化 (Week 8-10)
**目标**: 全模块集成 + 质量达标

| Agent | 任务 | 产出 |
|-------|------|------|
| Agent-1 | 单元测试 | API Mock, Store 测试, 组件测试, 80%+ 覆盖率 |
| Agent-2 | E2E 测试 | 5大模块完整流程测试 |
| Agent-3 | 性能优化 | 懒加载, 内存优化, IndexedDB 分页 |

**验收标准**: 所有测试通过， Lighthouse 性能 > 90

---

### Phase 7: 部署上线 (Week 11-12)
**目标**: 生产可用

| Agent | 任务 | 产出 |
|-------|------|------|
| Agent-1 | CI/CD | GitHub Actions, Vercel 部署 |
| Agent-2 | 文档 | README, API 文档, 用户手册 |

**验收标准**: 线上可访问，有完整文档

---

## 4. Task 任务列表

### Phase 0 Tasks
- [ ] `task-0-1`: 初始化 Vite + Vue3 项目
- [ ] `task-0-2`: 配置 TypeScript strict mode
- [ ] `task-0-3`: 配置 ESLint (antfu)
- [ ] `task-0-4`: 配置 UnoCSS
- [ ] `task-0-5`: 配置 Pinia Store
- [ ] `task-0-6`: 配置 Vue Router
- [ ] `task-0-7`: 开发公共组件 (Button/Input/Select/Card/Dialog/Loading/Toast)
- [ ] `task-0-8`: 定义类型系统 (types/index.ts)

### Phase 1 Tasks
- [ ] `task-1-1`: 异步语音合成 UI + API
- [ ] `task-1-2`: 任务轮询逻辑
- [ ] `task-1-3`: 音频播放器组件
- [ ] `task-1-4`: WebSocket 流式语音
- [ ] `task-1-5`: 音色克隆 UI + API
- [ ] `task-1-6`: 327 音色选择器
- [ ] `task-1-7`: 语音 Store 状态管理

### Phase 2 Tasks
- [ ] `task-2-1`: 文生图 UI + API
- [ ] `task-2-2`: 风格选择器
- [ ] `task-2-3`: 尺寸/质量配置
- [ ] `task-2-4`: 图片画廊组件
- [ ] `task-2-5`: 图片详情弹窗
- [ ] `task-2-6`: 下载/收藏功能
- [ ] `task-2-7`: 图片 Store

### Phase 3 Tasks
- [ ] `task-3-1`: T2V 文生视频
- [ ] `task-3-2`: I2V 图生视频
- [ ] `task-3-3`: S2V 主体驱动
- [ ] `task-3-4`: 11 种模板选择器
- [ ] `task-3-5`: 视频播放器
- [ ] `task-3-6`: 视频画廊
- [ ] `task-3-7`: 视频 Store

### Phase 4 Tasks
- [ ] `task-4-1`: 歌词编辑器
- [ ] `task-4-2`: 风格标签选择
- [ ] `task-4-3`: Music-2.5 API
- [ ] `task-4-4`: 音乐播放器 + 波形
- [ ] `task-4-5`: 歌词时间戳
- [ ] `task-4-6`: AI 歌词辅助
- [ ] `task-4-7`: 音乐 Store

### Phase 5 Tasks
- [ ] `task-5-1`: M2.7 对话窗口
- [ ] `task-5-2`: 流式响应
- [ ] `task-5-3`: 内容评价接口
- [ ] `task-5-4`: 反馈增强
- [ ] `task-5-5`: IndexedDB 历史
- [ ] `task-5-6`: 搜索筛选
- [ ] `task-5-7`: 收藏夹
- [ ] `task-5-8`: AI 建议

### Phase 6 Tasks
- [ ] `task-6-1`: API Mock
- [ ] `task-6-2`: 单元测试 (80%+)
- [ ] `task-6-3`: E2E 测试
- [ ] `task-6-4`: 路由懒加载
- [ ] `task-6-5`: 组件懒加载
- [ ] `task-6-6`: IndexedDB 优化

### Phase 7 Tasks
- [ ] `task-7-1`: GitHub Actions CI/CD
- [ ] `task-7-2`: Vercel 部署
- [ ] `task-7-3`: README
- [ ] `task-7-4`: API 文档
- [ ] `task-7-5`: 用户手册

---

## 5. 并行 Agent 执行规则

### Agent 命名规范
- `frontend-core`: 核心业务逻辑
- `frontend-ui`: UI 组件开发
- `backend-api`: API 调用封装
- `tester`: 测试编写

### 并行执行原则
1. **Phase 0**: 3 个 Agent 并行 (框架 + 组件 + 类型)
2. **Phase 1-5**: 2 个 Agent 并行 (核心功能 + UI)
3. **Phase 6**: 3 个 Agent 并行 (单元测试 + E2E + 优化)
4. **Phase 7**: 2 个 Agent 并行 (部署 + 文档)

### 任务分配
- 每个 Agent 完成当前任务后，检查 TaskList 认领下一个可用任务
- 跨 Agent 依赖需在 Task 描述中明确标注 `blockedBy`
- 完成一个 Phase 后集体 review

---

## 6. 技术规范

### antfu Skill 强制调用
**所有前端 Vue 项目必须先调用 antfu skill**

```markdown
# 任务开始时
使用 antfu skill 的规范创建...

# 或在描述中包含
"Vue 项目必须使用 antfu 规范"
```

### 代码规范
- `<script setup lang="ts">` 语法
- `shallowRef()` 优先于 `ref()`
- UnoCSS 原子化样式
- 组件 < 400 行
- 函数 < 50 行

### 测试要求
- 覆盖率 >= 80%
- RED → GREEN → REFACTOR 流程
- 每个 API 必须有 Mock 测试

---

## 7. 里程碑

| 日期 | 里程碑 |
|------|--------|
| 2026-03-27 | Phase 0 完成 |
| 2026-04-10 | Phase 1+2 完成 |
| 2026-04-24 | Phase 3+4 完成 |
| 2026-05-08 | Phase 5 完成 |
| 2026-05-29 | Phase 6 完成 |
| 2026-06-12 | Phase 7 完成，线上发布 |

---

## 8. 参考文档

- [PRD](./PRD_MINIMAX_VISUAL_TOOL.md) - 产品需求文档
- [VOICE_SPEC](./VOICE_MODULE_SPEC.md) - 语音模块详细规格
- [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md) - 详细实施计划
