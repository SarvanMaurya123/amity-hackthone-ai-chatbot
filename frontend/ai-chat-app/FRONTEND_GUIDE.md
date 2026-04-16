# Luminous AI - Frontend Documentation

## 🎨 Overview

This is an enhanced Next.js frontend for Luminous AI, featuring a professional landing page and an advanced chat dashboard with real-time streaming capabilities.

## 📁 Project Structure

```
src/app/
├── (landing)/
│   ├── layout.tsx          # Landing page layout
│   └── page.tsx            # Landing page (homepage)
├── (dashboard)/
│   ├── layout.tsx          # Dashboard layout (includes Sidebar & Header)
│   ├── chat/
│   │   └── page.tsx        # Chat dashboard page
│   └── settings/
│       └── page.tsx        # Settings page
├── components/
│   ├── ChatArea.tsx        # Main chat display with welcome screen
│   ├── ChatInput.tsx       # Enhanced input with suggestions
│   ├── Header.tsx          # Top navigation bar
│   ├── MessageBubble.tsx   # Message display with formatting
│   └── Sidebar.tsx         # Navigation sidebar
├── lib/
│   └── services/chat-service.ts # Backend chat API integration
├── store/
│   ├── chatStore.ts        # Zustand store for chat state
│   └── settingsStore.ts    # Settings state management
├── layout.tsx              # Root layout
└── page.tsx                # Root redirect page
```

## 🚀 Key Features

### Landing Page (`/`)
- **Hero Section**: Eye-catching introduction with animated gradients
- **Feature Showcase**: Highlights of AI capabilities with icons
- **Call-to-Action**: Clear navigation to get started
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Smooth transitions using Framer Motion

### Chat Dashboard (`/chat`)
- **Enhanced Welcome Screen**: Beautiful onboarding experience with suggestions
- **Backend AI Integration**: Assistant responses come from the backend AI API
- **Markdown Support**: Full markdown rendering with syntax highlighting
- **Quick Actions**: One-click buttons for common tasks (Summarize, Explain, etc.)
- **Message Statistics**: Real-time conversation metrics
- **Responsive Layout**: Works seamlessly on desktop and mobile

### Settings Page (`/settings`)
- **User Statistics**: Conversation count, message count, and analytics
- **Preferences**: Theme, sound effects, and auto-save settings
- **Privacy & Security**: Session security info and data usage controls
- **Danger Zone**: Clear all conversations and logout options
- **Beautiful UI**: Modern card-based design with smooth interactions

### Enhanced Components

#### ChatInput
- Auto-resizing textarea
- Smart suggestions based on context
- Voice command placeholder
- Streaming status indicator
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

#### MessageBubble
- Syntax-highlighted code blocks
- Copy functionality for code
- Thumbs up/down for feedback
- Markdown support with GitHub Flavored Markdown
- Streaming animation cursor
- Typing indicator with animated dots

#### Sidebar
- Conversation history with categorization
- Pin/unpin conversations
- Delete conversation option
- Quick new chat button
- User profile section
- Navigation to different sections

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
cd frontend/ai-chat-app
pnpm install
```

### Environment Setup

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Route Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Landing Page | Public landing page with onboarding |
| `/chat` | Chat Dashboard | Main chat interface |
| `/settings` | Settings | User preferences and configuration |
| `/collections` | Library | (Placeholder for collections) |
| `/integrations` | Integrations | (Placeholder for integrations) |

## 🎯 Core Technologies

- **Framework**: Next.js 16.x with TypeScript
- **State Management**: Zustand 5.x
- **Styling**: Tailwind CSS 4.x
- **Animations**: Framer Motion 12.x
- **Markdown**: React Markdown with GitHub Flavored Markdown
- **Code Highlighting**: React Syntax Highlighter
- **Icons**: Lucide React & Material Design Icons
- **AI**: Google Generative AI (@google/generative-ai)

## 🎨 Design System

### Colors
- **Primary**: `#ba9eff` (Purple)
- **Secondary**: `#8455ef` (Deep Purple)
- **Background**: `#060e20` (Dark Blue)
- **Surface**: `#192540` (Slate Blue)

### Typography
- **Headlines**: Manrope (custom header font)
- **Body**: Geist Sans (default font)
- **Mono**: Geist Mono (code blocks)

## 🌐 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

Sidebar hides on mobile and becomes overlay with hamburger menu toggle.

## 🔒 State Management

### Chat Store (Zustand)
```typescript
- conversations: Conversation[]
- activeConversationId: string | null
- isStreaming: boolean
- sidebarOpen: boolean
// Methods: createConversation, addMessage, deleteConversation, etc.
```

### Settings Store
- User preferences
- Theme selection
- Notification settings

## 📡 API Integration

### Backend Chat API
- Real-time response streaming
- Context-aware generation
- Error handling and fallbacks
- Message history support

## 🎭 Animation Features

- **Page Transitions**: Smooth content fade-in
- **Button Interactions**: Hover scales and active states
- **Floating Elements**: Continuous subtle animations
- **Gradient Animations**: Animated background gradients
- **Loading States**: Pulsing indicators and skeleton screens

## 🔧 Configuration

### Next.js Config
- TypeScript strict mode enabled
- Optimal image optimization
- Font optimization with Google Fonts

### Tailwind Config
- Custom color palette
- Extended shadows and effects
- Custom animations

## 📊 Performance Optimizations

- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Next.js Image component
- **CSS Optimization**: Tailwind CSS tree-shaking
- **Font Optimization**: Google Fonts optimization
- **Lazy Loading**: Dynamic imports for heavy components

## 🧪 Testing

Tests can be added using Jest and React Testing Library.

## 📝 Contributing

When adding new features:
1. Follow the existing component structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Ensure responsive design
5. Add animations using Framer Motion

## 🚀 Deployment

### Building
```bash
pnpm build
```

### Production Run
```bash
pnpm start
```

### Docker (Optional)
```bash
docker build -t luminous-ai-frontend .
docker run -p 3000:3000 luminous-ai-frontend
```

## 🐛 Troubleshooting

### Issue: API Key not working
- Check `.env.local` is properly configured
- Verify the backend API is running and reachable
- Check API key has correct permissions

### Issue: Streaming not working
- Verify network connection
- Check browser console for errors
- Ensure the backend has a valid `MISTRAL_API_KEY`

### Issue: Styles not applying
- Clear cache: `rm -rf .next`
- Rebuild Tailwind: `pnpm build`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Google Generative AI](https://ai.google.dev/)

## 📄 License

This project is part of the ML Hackathon initiative.

## 🤝 Support

For issues or questions, please reach out to the development team.
