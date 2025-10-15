export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  readingTime: number; // in minutes
  tags: string[];
  productIds?: string[]; // Related products
  featured?: boolean;
  // Lexical editor content
  content: string; // JSON stringified Lexical editor state
}

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'future-of-customer-support-ai',
    title: 'The Future of Customer Support: How AI is Transforming Service Delivery',
    excerpt: 'Explore how artificial intelligence is revolutionizing customer support operations, reducing costs, and improving satisfaction scores across industries.',
    category: 'AI Insights',
    publishedAt: '2025-10-01',
    author: {
      name: 'Sarah Mitchell',
      role: 'AI Solutions Architect'
    },
    readingTime: 8,
    tags: ['AI', 'Customer Support', 'Automation', 'Technology Trends'],
    productIds: ['ai-chat-assistant', 'ai-messaging-bot'],
    featured: true,
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Customer support is undergoing a massive transformation thanks to artificial intelligence...'
              }
            ]
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'The Evolution of Customer Support' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Traditional customer support models are being challenged by new AI-powered solutions that offer 24/7 availability, instant responses, and personalized experiences at scale.'
              }
            ]
          }
        ]
      }
    })
  },
  {
    id: 'blog-2',
    slug: 'ai-recruitment-best-practices',
    title: '10 Best Practices for Implementing AI in Your Recruitment Process',
    excerpt: 'A comprehensive guide to integrating AI-powered recruitment tools while maintaining human touch and reducing bias in hiring.',
    category: 'HR & Recruitment',
    publishedAt: '2025-09-25',
    author: {
      name: 'Marcus Chen',
      role: 'HR Tech Consultant'
    },
    readingTime: 12,
    tags: ['Recruitment', 'AI', 'HR Technology', 'Best Practices'],
    productIds: ['ai-recruit'],
    featured: true,
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Implementing AI in recruitment requires careful planning and strategy...'
              }
            ]
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '1. Start with Clear Objectives' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Before implementing any AI recruitment tool, define what success looks like for your organization.'
              }
            ]
          }
        ]
      }
    })
  },
  {
    id: 'blog-3',
    slug: 'voice-ai-sales-outreach',
    title: 'How Voice AI is Revolutionizing Sales Outreach and Lead Qualification',
    excerpt: 'Discover how AI-powered calling agents are helping sales teams scale their outreach while maintaining quality conversations.',
    category: 'Sales & Marketing',
    publishedAt: '2025-09-18',
    author: {
      name: 'Emily Rodriguez',
      role: 'Sales Technology Expert'
    },
    readingTime: 10,
    tags: ['Sales', 'Voice AI', 'Lead Generation', 'Automation'],
    productIds: ['ai-calling-agent'],
    featured: true,
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Voice AI technology has reached a point where it can conduct natural, effective sales conversations at scale...'
              }
            ]
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'The Scale Challenge in Sales' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Sales teams face a constant challenge: how to reach more prospects without sacrificing conversation quality.'
              }
            ]
          }
        ]
      }
    })
  },
  {
    id: 'blog-4',
    slug: 'messaging-automation-whatsapp-business',
    title: 'WhatsApp Business Automation: A Complete Guide for 2025',
    excerpt: 'Learn how to leverage AI-powered WhatsApp automation to enhance customer engagement and drive business growth.',
    category: 'Messaging & Communication',
    publishedAt: '2025-09-10',
    author: {
      name: 'David Kim',
      role: 'Messaging Solutions Architect'
    },
    readingTime: 15,
    tags: ['WhatsApp', 'Messaging', 'Automation', 'Customer Engagement'],
    productIds: ['ai-messaging-bot'],
    featured: true,
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'WhatsApp has become an essential business communication channel with over 2 billion users worldwide...'
              }
            ]
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Why WhatsApp Business Automation?' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Customers expect instant responses, and WhatsApp automation makes this possible at scale.'
              }
            ]
          }
        ]
      }
    })
  },
  {
    id: 'blog-5',
    slug: 'ai-ethics-business-implementation',
    title: 'AI Ethics in Business: Building Trust in Your AI Implementation',
    excerpt: 'Understanding the ethical considerations and best practices for implementing AI solutions responsibly in business operations.',
    category: 'AI Insights',
    publishedAt: '2025-09-05',
    author: {
      name: 'Dr. Jennifer Adams',
      role: 'AI Ethics Specialist'
    },
    readingTime: 14,
    tags: ['AI Ethics', 'Business Strategy', 'Compliance', 'Trust'],
    featured: false,
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'As AI becomes more prevalent in business operations, ethical considerations are paramount...'
              }
            ]
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'The Importance of AI Ethics' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Ethical AI implementation builds trust with customers and ensures long-term success.'
              }
            ]
          }
        ]
      }
    })
  },
  {
    id: 'blog-6',
    slug: 'roi-ai-automation-calculate',
    title: 'Calculating ROI on AI Automation: A Framework for Decision Makers',
    excerpt: 'A practical guide to measuring and maximizing return on investment when implementing AI automation solutions.',
    category: 'Business Strategy',
    publishedAt: '2025-08-28',
    author: {
      name: 'Robert Thompson',
      role: 'Business Strategy Consultant'
    },
    readingTime: 11,
    tags: ['ROI', 'Business Strategy', 'AI Investment', 'Metrics'],
    featured: false,
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Understanding the ROI of AI automation is crucial for making informed investment decisions...'
              }
            ]
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Key Metrics to Track' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Learn which metrics matter most when evaluating AI automation investments.'
              }
            ]
          }
        ]
      }
    })
  }
];

export const blogCategories = [
  { id: 'all', label: 'All Posts' },
  { id: 'ai-insights', label: 'AI Insights' },
  { id: 'hr-recruitment', label: 'HR & Recruitment' },
  { id: 'sales-marketing', label: 'Sales & Marketing' },
  { id: 'messaging-communication', label: 'Messaging & Communication' },
  { id: 'business-strategy', label: 'Business Strategy' },
  { id: 'tutorials', label: 'Tutorials' }
] as const;
