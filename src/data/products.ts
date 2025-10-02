export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: string; // Lucide icon name or image path
  landingPageUrl: string; // External domain URL
  category: 'ai-assistant' | 'automation' | 'analytics' | 'creative' | 'communication' | 'recruitment' | 'other';
  tags: string[];
  status: 'live' | 'beta' | 'coming-soon';
  featured?: boolean;
  features?: string[];
}

export const products: Product[] = [
  {
    id: 'ai-chat-assistant',
    name: 'AI Chat Assistant',
    description: 'Intelligent conversational AI that understands context and provides human-like responses.',
    longDescription: 'Our AI Chat Assistant uses advanced natural language processing to deliver contextual, accurate responses. Perfect for customer support, internal knowledge bases, and interactive experiences.',
    icon: 'MessageSquare',
    landingPageUrl: 'https://chat-assistant.example.com',
    category: 'ai-assistant',
    tags: ['NLP', 'Chatbot', 'Customer Support'],
    status: 'live',
    featured: true,
    features: [
      'Context-aware conversations',
      'Multi-language support',
      'Custom training on your data',
      'API integration ready'
    ]
  },
  {
    id: 'ai-recruit',
    name: 'AI Recruit',
    description: 'Streamline your hiring process with AI-powered recruitment automation.',
    longDescription: 'Transform recruitment with intelligent candidate screening, automated interviews, and data-driven hiring decisions. AI Recruit helps you find the perfect candidates faster.',
    icon: 'Users',
    landingPageUrl: 'https://ai-recruit.example.com',
    category: 'recruitment',
    tags: ['Recruitment', 'HR', 'Hiring', 'Screening'],
    status: 'live',
    featured: true,
    features: [
      'Automated resume screening',
      'AI-powered candidate matching',
      'Video interview analysis',
      'Bias reduction algorithms',
      'Integration with ATS systems'
    ]
  },
  {
    id: 'ai-calling-agent',
    name: 'AI Calling Agent',
    description: 'Automated voice calling agent for customer outreach and support.',
    longDescription: 'Deploy intelligent voice agents that can handle calls at scale. Perfect for customer support, sales outreach, appointment scheduling, and follow-ups.',
    icon: 'Phone',
    landingPageUrl: 'https://calling-agent.example.com',
    category: 'communication',
    tags: ['Voice AI', 'Calling', 'Automation', 'Customer Support'],
    status: 'live',
    featured: true,
    features: [
      'Natural voice conversations',
      'Multi-language support',
      'Call scheduling & routing',
      'Real-time transcription',
      'CRM integration'
    ]
  },
  {
    id: 'ai-messaging-bot',
    name: 'AI Messaging Bot',
    description: 'Deploy AI chatbots on WhatsApp, Telegram, and other messaging platforms.',
    longDescription: 'Connect with customers where they are. Our AI Messaging Bot works seamlessly across WhatsApp, Telegram, SMS, and any platform with API access.',
    icon: 'MessageCircle',
    landingPageUrl: 'https://messaging-bot.example.com',
    category: 'communication',
    tags: ['WhatsApp', 'Telegram', 'Messaging', 'Chatbot', 'API'],
    status: 'live',
    featured: true,
    features: [
      'Multi-platform support (WhatsApp, Telegram, SMS)',
      'Rich media responses',
      'API integration for any messaging app',
      'Automated responses 24/7',
      'Analytics & insights'
    ]
  },
  {
    id: 'document-analyzer',
    name: 'Document Analyzer',
    description: 'Extract insights from documents with advanced AI-powered analysis.',
    longDescription: 'Transform unstructured documents into actionable insights. Our Document Analyzer processes PDFs, images, and text to extract key information automatically.',
    icon: 'FileText',
    landingPageUrl: 'https://doc-analyzer.example.com',
    category: 'analytics',
    tags: ['OCR', 'Data Extraction', 'Analysis'],
    status: 'live',
    features: [
      'OCR for scanned documents',
      'Entity recognition',
      'Summary generation',
      'Batch processing'
    ]
  },
  {
    id: 'content-generator',
    name: 'AI Content Generator',
    description: 'Create high-quality content with AI-powered writing assistance.',
    longDescription: 'Generate blog posts, marketing copy, social media content, and more with our intelligent content creation platform.',
    icon: 'Sparkles',
    landingPageUrl: 'https://content-gen.example.com',
    category: 'creative',
    tags: ['Content Creation', 'Copywriting', 'Marketing'],
    status: 'live',
    features: [
      'Multiple content formats',
      'SEO optimization',
      'Brand voice customization',
      'Plagiarism check'
    ]
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation AI',
    description: 'Automate repetitive tasks with intelligent workflow orchestration.',
    longDescription: 'Streamline your operations with AI-driven automation. Connect your tools, set rules, and let AI handle the rest.',
    icon: 'Workflow',
    landingPageUrl: 'https://workflow-ai.example.com',
    category: 'automation',
    tags: ['Automation', 'Integration', 'Productivity'],
    status: 'beta',
    features: [
      'No-code automation builder',
      '500+ integrations',
      'Smart triggers and actions',
      'Advanced analytics'
    ]
  },
  {
    id: 'image-enhancer',
    name: 'AI Image Enhancer',
    description: 'Enhance and upscale images using advanced AI algorithms.',
    icon: 'Image',
    landingPageUrl: 'https://image-enhance.example.com',
    category: 'creative',
    tags: ['Image Processing', 'Enhancement', 'Upscaling'],
    status: 'live',
    features: [
      '4K upscaling',
      'Noise reduction',
      'Color correction',
      'Batch processing'
    ]
  },
  {
    id: 'voice-synthesis',
    name: 'Voice Synthesis AI',
    description: 'Generate natural-sounding voice from text with neural networks.',
    icon: 'Mic',
    landingPageUrl: 'https://voice-ai.example.com',
    category: 'creative',
    tags: ['TTS', 'Voice', 'Audio'],
    status: 'coming-soon',
    features: [
      'Multiple voice options',
      'Emotion control',
      'Custom voice cloning',
      'Multi-language support'
    ]
  }
];

export const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'ai-assistant', label: 'AI Assistants' },
  { id: 'recruitment', label: 'Recruitment' },
  { id: 'communication', label: 'Communication' },
  { id: 'automation', label: 'Automation' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'creative', label: 'Creative Tools' },
  { id: 'other', label: 'Other' }
] as const;

export const statusLabels = {
  'live': 'Live',
  'beta': 'Beta',
  'coming-soon': 'Coming Soon'
} as const;
