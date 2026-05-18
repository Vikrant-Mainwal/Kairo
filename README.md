# Kairo — AI Inference Playground

Kairo is a modern AI playground and model comparison platform built with **React, TypeScript, and Tailwind CSS**.

It allows developers to:
- Stream AI responses in real time
- Compare model outputs side-by-side
- Visualize token-level differences
- Measure live inference metrics
- Use voice input for prompts

Designed with a clean developer-first experience inspired by modern AI interfaces.

---

# Features

## AI Playground
- Real-time token streaming
- Prompt + system prompt support
- Abort streaming instantly
- Retry support with preserved partial output
- Sample prompts for quick testing

---

## Token-Level Diff Viewer
- Side-by-side output comparison
- Custom-built LCS diff algorithm
- No external diff libraries used
- Highlights:
  - Added tokens
  - Removed tokens
  - Unchanged tokens
- Similarity statistics

---

## Audio Input
- Voice recording support
- MediaRecorder API integration
- Speech-to-text workflow
- Toggle between text and voice modes

---

## Live Metrics
- Tokens generated
- Tokens per second (TPS)
- Streaming latency
- Elapsed response time

---

## Modern UI
- Fully responsive layout
- Dark theme
- Smooth animations
- Collapsible sidebar
- Accessible components

---

# Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| MediaRecorder API | Voice Input |
| Fetch + ReadableStream | Streaming |

---

# Project Structure

```bash
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── playground/         # Playground & streaming UI
│   ├── diff-view/          # Token diff visualization
│   ├── metrics/            # Metrics dashboard
│   ├── layout/             # Sidebar & layout
│   └── sections/           # App sections
│
├── hooks/
│   ├── useStreaming.ts
│   ├── useMetrics.ts
│   └── useAudioRecorder.ts
│
├── services/
│   └── models.ts
│
├── utils/
│   ├── diff.ts
│   ├── tokenizer.ts
│   └── cn.ts
│
├── types/
│   └── index.ts
│
└── pages/
```

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/Vikrant-Mainwal/Kairo.git
```

---

## 2. Navigate into the project

```bash
cd Kairo
```

---

## 3️. Install dependencies

```bash
npm install
```

---

## 4️. Start development server

```bash
npm run dev
```

App runs on:

```bash
http://localhost:5173
```

---

# Production Build

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# Core Diff Algorithm

Kairo uses a custom **Longest Common Subsequence (LCS)** based token diffing algorithm.

Unlike line-based diffing, token-level comparison works better for AI-generated responses where even small wording changes matter.

---

## Algorithm Steps

1. Tokenize both responses
2. Build LCS matrix
3. Backtrack matrix
4. Mark:
   - Added tokens
   - Removed tokens
   - Common tokens

---

## Time Complexity

```text
O(n × m)
```

Where:
- `n` = tokens in response A
- `m` = tokens in response B

---

# Streaming Architecture

Kairo streams responses using:

- Fetch API
- ReadableStream
- TextDecoder
- AbortController

This enables:
- Real-time token rendering
- Partial response preservation
- Instant cancellation
- Smooth UX

---

# Accessibility

Kairo follows accessibility best practices:

- `aria-live` for streamed outputs
- `aria-label` on controls
- `focus-visible` states
- Keyboard navigation support
- Accessible toggle buttons
- Color + text indicators for diffs

---

# ⚠️ Error Handling

| Scenario | Behaviour |
|---|---|
| Network Failure | Shows retry option |
| Stream Abort | Preserves partial output |
| API Error | Displays server message |
| Partial Responses | Never cleared on failure |

---

# 🌐 Deployment

## Vercel

```bash
npm run build
```

Push to GitHub and import the repo into Vercel.

---

# 🔑 Environment Variables

Create a `.env` file:

```env
VITE_API_KEY=your_api_key
```

---

# 🎯 Future Improvements

- Multi-model comparison
- Chat history persistence
- Export diff reports
- Real AI API integrations
- Team collaboration
- Advanced analytics

---

# 👨‍💻 Author

## Vikrant Mainwal

- GitHub: https://github.com/Vikrant-Mainwal

---

# 📄 License

MIT License

---

# ⭐ Support

If you like this project, consider giving it a star on GitHub ⭐
