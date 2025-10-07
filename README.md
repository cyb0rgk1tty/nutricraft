# Nutricraft Labs - Website

A modern, high-performance website for Nutricraft Labs - a premium supplement manufacturing and private label solutions provider.

## 🚀 Features

- **Modern Design**: Clean, professional design with mint green theme
- **Fully Responsive**: Mobile-first approach with responsive design for all devices
- **SEO Optimized**: Built-in SEO with meta tags, structured data, automatic sitemap
- **Content-Rich Blog**: Comprehensive articles (3,000-5,000+ words) with tag filtering
- **Content Collections**: Markdown-based content management for blog and dosage forms
- **Performance Optimized**: Fast loading with Astro.js SSR and optimized assets
- **Accessibility**: WCAG compliant with semantic HTML and proper ARIA labels
- **Dynamic Routes**: Automatic page generation for blog posts, tags, and dosage forms

## 📋 Main Sections

### Marketing Pages
1. **Hero Section** - Eye-catching introduction with trust badges
2. **Services** - 8+ comprehensive service pages (manufacturing, formulation, compliance, etc.)
3. **Dosage Forms** - 9 detailed pages on supplement formats (tablets, capsules, softgels, etc.)
4. **Manufacturing Capabilities** - Product formats, MOQs, and facility info
5. **About Us** - Company story and statistics
6. **Why Choose Us** - Key differentiators and benefits
7. **Testimonials** - Client success stories
8. **Contact Form** - Lead generation with server-side processing

### Blog
9. **Blog Listing** - Main blog page with tag cloud and post cards
10. **Blog Articles** - SEO-optimized long-form content (4,000+ words)
11. **Tag Pages** - Filter blog posts by topic (Manufacturing, Private Label, etc.)
12. **Related Posts** - Tag-based content recommendations

## 🛠️ Tech Stack

- **Framework**: [Astro.js](https://astro.build) v5 with SSR
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v3.4.0
- **Content**: Astro Content Collections with glob loaders
- **Language**: TypeScript (strict mode)
- **Email**: Nodemailer for contact form
- **Analytics**: Google Tag Manager
- **Deployment**: Vercel (SSR adapter)
- **Domain**: https://nutricraftlabs.com

## 📦 Project Structure

```
/
├── public/
│   ├── images/              # Static images (logos, products, etc.)
│   └── robots.txt
├── src/
│   ├── pages/               # Routes (file-based routing)
│   │   ├── index.astro     # Homepage
│   │   ├── blog/           # Blog routes
│   │   │   ├── index.astro          # Blog listing
│   │   │   ├── [slug].astro         # Individual posts
│   │   │   └── tag/[tag].astro      # Tag filter pages
│   │   ├── dosage-forms/   # Product format pages
│   │   │   ├── index.astro
│   │   │   └── [format].astro
│   │   ├── services/       # Service pages
│   │   ├── api/            # API endpoints
│   │   │   └── contact.ts  # Form handling
│   │   └── contact.astro
│   ├── content/            # Content Collections (Markdown)
│   │   ├── blog/          # Blog posts (.md files)
│   │   ├── dosage-forms/  # Dosage form content
│   │   └── config.ts      # Collection schemas
│   ├── components/         # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── BlogCard.astro
│   │   ├── ServiceCard.astro
│   │   └── ScrollAnimation.astro
│   ├── layouts/           # Page layouts
│   │   └── BaseLayout.astro
│   ├── data/             # Structured data
│   │   ├── services.js
│   │   ├── dosage-forms.js
│   │   └── testimonials.js
│   ├── utils/            # Utility functions
│   │   └── slugify.ts    # Tag URL slugification
│   └── styles/           # Global styles
│       └── global.css
├── scripts/              # Image optimization scripts
├── astro.config.mjs     # Astro configuration
├── tailwind.config.mjs  # Tailwind configuration
├── CLAUDE.md            # AI assistant documentation
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/Nutricraft-labs.git
cd Nutricraft-labs
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Add SMTP credentials for contact form
```

4. Start the development server:
```bash
npm run dev -- --host 0.0.0.0
```

5. Open [http://192.168.50.5:4321](http://192.168.50.5:4321) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Customization

### Colors

The color scheme is defined in `tailwind.config.mjs`. Main colors:
- Primary/Mint: #10b981 (green-500)
- Mint shades: 50-900
- Dark shades: 50-900

### Content Management

#### Blog Posts
1. Create `.md` file in `src/content/blog/`
2. Add frontmatter:
```yaml
---
title: "Your Title Here"
description: "SEO description"
pubDate: 2025-09-30
author: "Nutricraft Labs"
tags: ["Manufacturing", "Private Label"]  # Use Title Case
draft: false
---
```
3. Write content in Markdown
4. Publish by setting `draft: false`

#### Services & Data
- **Services**: Edit `src/data/services.js`
- **Dosage Forms**: Edit `src/data/dosage-forms.js`
- **Testimonials**: Edit `src/data/testimonials.js`

### Images

- `public/images/` - Static images (logos, products)
- Optimize with scripts in `scripts/` directory

## 📱 Responsive Design

The site is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔍 SEO

SEO features include:
- Meta tags and Open Graph tags
- **Automatic Sitemap**: Blog posts dynamically added to sitemap
- Robots.txt configuration
- Semantic HTML structure
- Long-form content (3,000-5,000+ words)
- Internal linking structure
- FAQ sections for featured snippets
- Tag-based content organization

## 🚀 Deployment

### Vercel (Current)

The site is deployed on Vercel with SSR enabled:

1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables configured in Vercel dashboard

## 📝 Environment Variables

Create a `.env` file with these variables:

```env
# SMTP Configuration (for contact form)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@nutricraftlabs.com
SMTP_TO=hello@nutricraftlabs.com

# Site Configuration
PUBLIC_SITE_URL=https://nutricraftlabs.com
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For support, email hello@nutricraftlabs.com or visit our website.

---

Built with ❤️ using Astro.js and Tailwind CSS