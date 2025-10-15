export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  client: {
    name: string;
    industry: string;
    logo?: string;
  };
  coverImage?: string;
  publishedAt: string;
  author?: {
    name: string;
    avatar?: string;
  };
  metrics?: {
    label: string;
    value: string;
    description?: string;
  }[];
  tags: string[];
  productIds?: string[]; // Related products
  testimonialIds?: string[]; // Related testimonials to show
  // Lexical editor content
  content: string; // JSON stringified Lexical editor state
  featured?: boolean;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'case-study-1',
    slug: 'techcorp-customer-support-transformation',
    title: 'How TechCorp Transformed Customer Support with AI Chat Assistant',
    excerpt: 'TechCorp reduced response time by 80% and increased customer satisfaction scores by 45% using AI Square\'s AI Chat Assistant.',
    category: 'Customer Support',
    client: {
      name: 'TechCorp Solutions',
      industry: 'Technology',
    },
    publishedAt: '2025-09-15',
    metrics: [
      {
        label: 'Response Time',
        value: '80%',
        description: 'Reduction in average response time'
      },
      {
        label: 'Customer Satisfaction',
        value: '45%',
        description: 'Increase in CSAT scores'
      },
      {
        label: 'Cost Savings',
        value: '$2.5M',
        description: 'Annual operational cost reduction'
      }
    ],
    tags: ['AI Chat', 'Customer Support', 'Automation'],
    productIds: ['ai-chat-assistant'],
    testimonialIds: ['testimonial-1'],
    // This will be replaced with actual Lexical editor JSON output
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'The Challenge' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'TechCorp was struggling with long response times and increasing customer support costs...'
              }
            ]
          }
        ]
      }
    }),
    featured: true
  },
  {
    id: 'case-study-2',
    slug: 'global-enterprises-recruitment-revolution',
    title: 'Global Enterprises Reduces Time-to-Hire by 60% with AI Recruit',
    excerpt: 'Learn how Global Enterprises streamlined their hiring process and improved candidate quality using AI-powered recruitment.',
    category: 'Recruitment',
    client: {
      name: 'Global Enterprises Inc',
      industry: 'Finance',
    },
    publishedAt: '2025-08-22',
    metrics: [
      {
        label: 'Time-to-Hire',
        value: '60%',
        description: 'Reduction in hiring timeline'
      },
      {
        label: 'Candidate Quality',
        value: '35%',
        description: 'Improvement in quality of hire metrics'
      },
      {
        label: 'Recruiter Efficiency',
        value: '3x',
        description: 'Increase in interviews per recruiter'
      }
    ],
    tags: ['Recruitment', 'HR Tech', 'Hiring'],
    productIds: ['ai-recruit'],
    testimonialIds: ['testimonial-2'],
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'The Challenge' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Global Enterprises needed to scale their hiring while maintaining quality standards...'
              }
            ]
          }
        ]
      }
    }),
    featured: true
  },
  {
    id: 'case-study-3',
    slug: 'growthhub-sales-outreach-success',
    title: 'GrowthHub Scales Sales Outreach with AI Calling Agent',
    excerpt: 'GrowthHub increased qualified leads by 200% while reducing outreach costs using AI-powered calling automation.',
    category: 'Sales',
    client: {
      name: 'GrowthHub',
      industry: 'SaaS',
    },
    publishedAt: '2025-07-10',
    metrics: [
      {
        label: 'Qualified Leads',
        value: '200%',
        description: 'Increase in qualified opportunities'
      },
      {
        label: 'Call Volume',
        value: '10x',
        description: 'More calls handled daily'
      },
      {
        label: 'Cost per Lead',
        value: '65%',
        description: 'Reduction in acquisition cost'
      }
    ],
    tags: ['Sales', 'AI Calling', 'Lead Generation'],
    productIds: ['ai-calling-agent'],
    testimonialIds: ['testimonial-3'],
    content: JSON.stringify({
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'The Challenge' }]
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'GrowthHub needed to scale their sales outreach without hiring more SDRs...'
              }
            ]
          }
        ]
      }
    }),
    featured: true
  }
];

export const caseStudyCategories = [
  { id: 'all', label: 'All Case Studies' },
  { id: 'customer-support', label: 'Customer Support' },
  { id: 'recruitment', label: 'Recruitment' },
  { id: 'sales', label: 'Sales' },
  { id: 'automation', label: 'Automation' },
  { id: 'analytics', label: 'Analytics' }
] as const;
