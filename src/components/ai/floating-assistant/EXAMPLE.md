# Usage Example

## Basic Integration

### 1. Add to Astro Layout

```astro
---
// src/layouts/Layout.astro
import { ViewTransitions } from 'astro:transitions';
import { FloatingAIAssistant } from '@/components/ai/floating-assistant';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="Square AI" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    <ViewTransitions />
  </head>
  <body>
    <slot />

    <!-- Add the floating assistant -->
    <FloatingAIAssistant client:only="react" />
  </body>
</html>
```

### 2. Create API Endpoint

Create a chat API endpoint at `src/pages/api/chat.ts`:

```typescript
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages } = await request.json();

    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      messages,
      system: `You are Square AI, a helpful AI assistant for Square AI company.
      You help users learn about AI services, solutions, and how AI can benefit their business.
      Be friendly, professional, and concise in your responses.`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 3. Environment Variables

Add your API key to `.env`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Advanced Usage

### Programmatic Control

```tsx
import { useFloatingAssistant } from '@/components/ai/floating-assistant';

function NavigationButton() {
  const { openAssistant } = useFloatingAssistant();

  return (
    <button onClick={openAssistant}>
      Ask AI
    </button>
  );
}
```

### Custom Position

```astro
<FloatingAIAssistant
  client:only="react"
  defaultPosition={{ x: 100, y: -100 }}
  defaultCollapsed={false}
/>
```

## Customization Examples

### Update Quick Suggestions

In `floating-ai-assistant.tsx`:

```tsx
const QUICK_SUGGESTIONS = [
  "What AI services do you offer?",
  "How much does it cost?",
  "Can I schedule a demo?",
];
```

### Change Logo

Replace `components/square-ai-logo.tsx` with your own component:

```tsx
export function SquareAILogo({ size = 32 }: { size?: number }) {
  return (
    <img src="/your-logo.png" alt="Your Brand" width={size} height={size} />
  );
}
```

### Update Theme Colors

Search and replace these gradient classes throughout the components:

- `from-purple-500 via-blue-500 to-cyan-500` → Your brand gradient
- `from-purple-500 to-blue-500` → Your brand gradient (short)

Example:
```tsx
// Replace in assistant-trigger.tsx
className="bg-linear-to-br from-red-500 via-orange-500 to-yellow-500"
```

## Integration with Other Frameworks

### Next.js

```tsx
// app/layout.tsx
import { FloatingAIAssistant } from '@/components/ai/floating-assistant';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <FloatingAIAssistant />
      </body>
    </html>
  );
}
```

### Plain React

```tsx
// App.tsx
import { FloatingAIAssistant } from './components/ai/floating-assistant';

function App() {
  return (
    <div className="app">
      <h1>My App</h1>
      <FloatingAIAssistant />
    </div>
  );
}
```

## Testing

Test the assistant by:

1. Click the floating button to open
2. Try the quick suggestions
3. Type a custom message
4. Test dragging (desktop only)
5. Toggle sound effects
6. Test on mobile

## Deployment Notes

### Vercel

Ensure you have:
- Environment variables set in Vercel dashboard
- API routes are properly deployed
- Sound files in `public/sounds/` directory

### Other Platforms

- Make sure server-side rendering is configured for API routes
- Verify static assets (sound files) are served correctly
- Test localStorage functionality
