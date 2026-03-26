# MiniMax Visual Tool

> MiniMax Ultra 用户专属 Web 可视化工具，一站式调用语音合成、图片生成、视频生成、音乐创作、AI 对话五大 AI 能力。

## Features

| Module | Description | Model |
|--------|-------------|-------|
| Speech | 语音合成，支持异步/同步/音色克隆 | Speech 2.8 |
| Image | 高质量图片生成 | image-01 |
| Video | 视频生成，支持 T2V/I2V/S2V | Hailuo |
| Music | 音乐创作，支持歌词编辑 | Music-2.5 |
| Chat | AI 对话，内容评价与反馈增强 | M2.7 |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3 + Composition API |
| Build | Vite |
| Language | TypeScript (strict mode) |
| State | Pinia |
| Router | Vue Router |
| Styling | UnoCSS (Atomic CSS) |
| Components | Element Plus |
| Linting | ESLint (antfu config) |

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- MiniMax API Key (from [MiniMax Console](https://platform.minimaxi.com))

### Installation

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Configuration

1. Open the app and navigate to Settings
2. Enter your MiniMax API Key
3. Configure your preferred defaults

## Project Structure

```
minimax-api/
├── src/
│   ├── api/                 # API call layer
│   │   ├── voice.ts         # Speech synthesis
│   │   ├── voiceClone.ts    # Voice cloning
│   │   ├── image.ts         # Image generation
│   │   ├── video.ts         # Video generation
│   │   ├── music.ts         # Music generation
│   │   └── chat.ts          # AI chat
│   ├── components/           # UI components
│   │   ├── common/          # Base components
│   │   ├── voice/           # Speech module
│   │   ├── image/           # Image module
│   │   ├── video/           # Video module
│   │   ├── music/           # Music module
│   │   ├── chat/            # Chat module
│   │   └── history/         # History module
│   ├── composables/         # Composables
│   │   ├── useVoiceAsync.ts
│   │   ├── useVoiceStream.ts
│   │   ├── useImageAsync.ts
│   │   ├── useVideoAsync.ts
│   │   ├── useMusicAsync.ts
│   │   └── useChatStream.ts
│   ├── stores/               # Pinia stores
│   │   ├── voice.ts
│   │   ├── image.ts
│   │   ├── video.ts
│   │   ├── music.ts
│   │   ├── chat.ts
│   │   └── history.ts
│   ├── views/               # Page views
│   │   ├── VoiceView.vue
│   │   ├── ImageView.vue
│   │   ├── VideoView.vue
│   │   ├── MusicView.vue
│   │   ├── ChatView.vue
│   │   └── HistoryView.vue
│   └── router/              # Vue Router
├── tests/                   # Unit tests
├── e2e/                    # E2E tests
└── docs/                   # Documentation
```

## API Configuration

### Environment Variables

Create a `.env` file (optional, UI configuration is preferred):

```env
VITE_API_BASE_URL=https://api.minimaxi.com
```

### Getting Your API Key

1. Visit [MiniMax Console](https://platform.minimaxi.com)
2. Navigate to API Keys section
3. Create a new API Key
4. Enter the key in the app Settings

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Type check + build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm test` | Run all tests |
| `pnpm test:unit` | Run unit tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm test:e2e:ui` | Run E2E with UI |

### Code Style

- Single responsibility: one file, one purpose
- Explicit return types where possible
- `<script setup lang="ts">` syntax
- `shallowRef()` over `ref()` when appropriate
- Components < 400 lines
- Functions < 50 lines

## Documentation

- [API Documentation](./docs/API.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Product Requirements](./PRD_MINIMAX_VISUAL_TOOL.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)

## License

Private project - All rights reserved
