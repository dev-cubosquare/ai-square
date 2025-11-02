# Square AI Floating Assistant

A beautiful, draggable floating AI assistant component with sound effects, animations, and real-time chat capabilities. Built with React, Framer Motion, and the Vercel AI SDK.

## Features

- 🎨 **Beautiful Design**: Gradient accents, smooth animations, and modern UI
- 🎭 **Draggable Interface**: Drag and position the assistant anywhere on screen
- 🔊 **Sound Effects**: Audio feedback for messages (with mute toggle)
- 📱 **Responsive**: Works on mobile and desktop
- 💾 **Persistent State**: Remembers position and collapsed state
- ⚡ **Real-time Chat**: Powered by Vercel AI SDK
- 🎯 **Quick Suggestions**: Pre-defined prompts for faster interaction
- 🌓 **Theme Support**: Works with light and dark modes

## Installation

This component is self-contained in the `floating-assistant` directory. Simply copy the entire directory to your project:

```bash
cp -r src/components/ai/floating-assistant your-project/src/components/ai/
```

### Dependencies

Make sure you have these dependencies installed:

```bash
npm install @ai-sdk/react ai motion lucide-react class-variance-authority
npm install @radix-ui/react-scroll-area @radix-ui/react-avatar
npm install use-stick-to-bottom react-markdown remark-gfm
```

### Sound Files

Copy the sound files to your public directory:

```bash
cp -r public/sounds your-project/public/
```

Required sound files:
- `public/sounds/woosh.wav` - Send message sound
- `public/sounds/soap-bubble.wav` - Receive message sound

## Usage

### Basic Setup

1. **Import the component** in your Astro layout or React component:

```tsx
import { FloatingAIAssistant } from '@/components/ai/floating-assistant';
```

2. **Add it to your layout** (must be used as a client component):

```astro
---
// src/layouts/Layout.astro
import FloatingAIAssistant from '@/components/ai/floating-assistant';
---

<html>
  <body>
    <slot />
    <FloatingAIAssistant client:only="react" />
  </body>
</html>
```

3. **Set up your API endpoint** (optional, defaults to `/api/chat`):

The assistant uses the Vercel AI SDK's `useChat` hook. You'll need to create an API endpoint that handles chat requests.

Example API route (`src/pages/api/chat.ts`):

```typescript
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const POST = async ({ request }: { request: Request }) => {
  const { messages } = await request.json();

  const result = await streamText({
    model: google('gemini-2.0-flash-exp'),
    messages,
    system: 'You are Square AI, a helpful AI assistant.',
  });

  return result.toDataStreamResponse();
};
```

### Configuration Options

```tsx
<FloatingAIAssistant
  // Start collapsed or expanded (default: true)
  defaultCollapsed={true}

  // Enable/disable dragging (default: true, auto-disabled on mobile)
  draggable={true}

  // Initial position (default: centered bottom)
  defaultPosition={{ x: 0, y: 0 }}
/>
```

### Customization

#### Quick Suggestions

Edit the `QUICK_SUGGESTIONS` array in `floating-ai-assistant.tsx`:

```tsx
const QUICK_SUGGESTIONS = [
  "What services does Square AI offer?",
  "How can AI help my business?",
  "Tell me about your solutions.",
];
```

#### Logo

Replace the logo by editing `components/square-ai-logo.tsx` or providing your own SVG/image component.

#### Branding

Update these strings throughout the components:
- "Square AI" → Your brand name
- "Square AI Assistant" → Your assistant name
- Tooltip message in `assistant-trigger.tsx`

#### Colors & Styling

The assistant uses Tailwind CSS classes with gradients:
- Primary gradient: `from-purple-500 via-blue-500 to-cyan-500`
- Update these classes throughout the components to match your brand

### Using the Context

Access assistant state from anywhere in your app:

```tsx
import { useFloatingAssistant } from '@/components/ai/floating-assistant';

function MyComponent() {
  const {
    messages,
    sendMessage,
    status,
    openAssistant,
    closeAssistant,
    toggleAssistant,
    isAssistantOpen,
    isMuted,
    toggleMuted,
  } = useFloatingAssistant();

  return (
    <button onClick={openAssistant}>
      Open AI Assistant
    </button>
  );
}
```

## File Structure

```
floating-assistant/
├── README.md                          # This file
├── index.ts                           # Barrel exports
├── floating-ai-assistant.tsx          # Main component
├── floating-assistant-context.tsx     # React context
├── use-floating-assistant-state.ts    # State management hook
├── assistant-trigger.tsx              # Floating button
├── assistant-panel.tsx                # Chat panel
├── assistant-tooltip.tsx              # Hover tooltip
├── assistant-sound-toggle.tsx         # Mute button
├── assistant-message-list.tsx         # Message list
├── assistant-message-bubble.tsx       # Message bubbles
├── components/
│   ├── square-ai-logo.tsx            # Logo SVG
│   ├── response.tsx                  # Markdown renderer
│   ├── message.tsx                   # Message wrapper
│   ├── loader.tsx                    # Loading spinner
│   ├── suggestion.tsx                # Suggestion chips
│   ├── scroll-area.tsx               # Scrollable area
│   ├── popup-header.tsx              # Panel header
│   └── prompt-input-simple.tsx       # Input field
└── utils/
    └── message-builder.ts            # Message utilities
```

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Troubleshooting

### Sound files not playing

1. Ensure sound files are in `public/sounds/`
2. Check browser console for 404 errors
3. Try clicking the page first (browsers require user interaction for audio)

### Assistant not appearing

1. Make sure you're using `client:only="react"` in Astro
2. Check that all dependencies are installed
3. Verify the component is imported correctly

### Position not persisting

The component uses `localStorage`. Ensure:
1. LocalStorage is enabled
2. Your site is not in incognito/private mode

## License

This component is part of the Square AI project. Feel free to use and modify as needed.

## Credits

Based on the Zarrx AI floating assistant pattern, adapted for Square AI.
