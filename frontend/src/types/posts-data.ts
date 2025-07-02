import { PostInfo } from "../components/blog/PostCard";

// 此处定义 posts 的类别
export const blogCategories = [
  {
    key: 'tech',
    label: '技术',
    slug: 'tech',
    icon: '🛠️',
    order: 1,
  },
  {
    key: 'algorithm',
    label: '算法',
    slug: 'algorithm',
    icon: '算',
    order: 2,
  },
  {
    key: 'math',
    label: '数学',
    slug: 'math',
    icon: '数',
    order: 3,
  },
  {
    key: 'life',
    label: '生活',
    slug: 'life',
    icon: '🌱',
    order: 4,
  },
  {
    key: 'design',
    label: '设计',
    slug: 'design',
    icon: '🎨',
    order: 5,
  },
  {
    key: 'language',
    label: '语言',
    slug: 'language',
    icon: '文',
    order: 6,
  },
  {
    key: 'note',
    label: '记录',
    slug: 'note',
    icon: '📝',
    order: 7,
  }
] as const; // 字面量类型
// 派生 union type
export type BlogCategoryKey = typeof blogCategories[number]['key'];

// 映射表: 用于快速查找
// 例: blogCategoryMap['tech'].label --> "技术"
export const blogCategoryMap: Record<BlogCategoryKey, {
  label: string;
  icon: string;
  slug: string;
}> = blogCategories.reduce((map, cat) => {
  map[cat.key] = {
    label: cat.label,
    icon: cat.icon,
    slug: cat.slug,
  };
  return map;
}, {} as any)

export const posts: PostInfo[] = [
  {
    id: 'deep-dive-mdx',
    title: 'MDX 深度指南',
    cdate: '2025-06-25',
    mdate: '2025-06-25',
    category: 'tech',
    tags: ['React', 'MDX'],
    abstract: '如何在 Vite 中零痛点集成 MDX，并写出交互式文章……',
    hero: true,
  },
  {
    id: 'glassmorphism-css',
    title: '纯 CSS 打造玻璃拟态',
    cdate: '2025-06-24',
    mdate: '2025-06-24',
    tags: ['CSS'],
    category: 'tech',
    abstract: '一步步用 backdrop-filter 做出高斯模糊卡片……',
  },
  // …再放几条
];
