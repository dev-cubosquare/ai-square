export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string; // URL to avatar image
  quote: string;
  rating: 5; // 1-5 stars
  productId?: string; // Optional link to specific product
  featured?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Sarah Chen',
    role: 'CTO',
    company: 'TechCorp Solutions',
    quote: 'AI Square transformed our customer support operations. The AI Chat Assistant reduced our response time by 80% and our customers love the instant, accurate responses.',
    rating: 5,
    productId: 'ai-chat-assistant',
    featured: true
  },
  {
    id: 'testimonial-2',
    name: 'Michael Rodriguez',
    role: 'HR Director',
    company: 'Global Enterprises Inc',
    quote: 'AI Recruit revolutionized our hiring process. We reduced time-to-hire by 60% and found better quality candidates. The bias reduction features are game-changing.',
    rating: 5,
    productId: 'ai-recruit',
    featured: true
  },
  {
    id: 'testimonial-3',
    name: 'Emily Watson',
    role: 'Head of Sales',
    company: 'GrowthHub',
    quote: 'The AI Calling Agent handles hundreds of calls daily with natural conversations. It freed up our team to focus on high-value interactions while maintaining excellent customer satisfaction.',
    rating: 5,
    productId: 'ai-calling-agent',
    featured: true
  },
  {
    id: 'testimonial-4',
    name: 'David Kim',
    role: 'Founder & CEO',
    company: 'StartupXYZ',
    quote: 'We integrated the AI Messaging Bot across WhatsApp and Telegram. Our customer engagement increased 3x and we are handling support 24/7 without additional staff.',
    rating: 5,
    productId: 'ai-messaging-bot',
    featured: true
  },
  {
    id: 'testimonial-5',
    name: 'Lisa Anderson',
    role: 'VP of Operations',
    company: 'Enterprise Solutions Ltd',
    quote: 'AI Square\'s products are incredibly reliable and easy to integrate. The support team is responsive and the documentation is comprehensive. Highly recommended!',
    rating: 5,
    featured: true
  },
  {
    id: 'testimonial-6',
    name: 'James Thompson',
    role: 'Product Manager',
    company: 'InnovateTech',
    quote: 'The quality of AI responses is impressive. Our users can\'t tell the difference between AI and human interactions. It\'s been a game changer for scaling our operations.',
    rating: 5,
    featured: true
  },
  {
    id: 'testimonial-7',
    name: 'Rachel Green',
    role: 'Marketing Director',
    company: 'BrandBoost Agency',
    quote: 'Working with AI Square has been seamless. The AI tools integrate perfectly with our existing workflows and have significantly improved our client delivery timelines.',
    rating: 5,
    featured: false
  },
  {
    id: 'testimonial-8',
    name: 'Alex Kumar',
    role: 'Operations Manager',
    company: 'LogisticsPro',
    quote: 'The automation capabilities are outstanding. We\'ve reduced manual work by 70% and our team can focus on strategic initiatives instead of repetitive tasks.',
    rating: 5,
    featured: false
  }
];
