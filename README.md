# Nutricraft Labs - Landing Page

A modern, high-performance landing page for Nutricraft Labs - a premium supplement manufacturing and private label solutions provider.

## 🚀 Features

- **Modern Design**: Clean, professional design with mint green theme
- **Fully Responsive**: Mobile-first approach with responsive design for all devices
- **SEO Optimized**: Built-in SEO with meta tags, structured data, and sitemap
- **Interactive Tools**: MOQ calculator, lead time estimator, and cost savings calculator
- **Performance Optimized**: Fast loading with Astro.js and optimized assets
- **Accessibility**: WCAG compliant with semantic HTML and proper ARIA labels

## 📋 Sections

1. **Hero Section** - Eye-catching introduction with trust badges
2. **Services** - Comprehensive list of 8 core services
3. **Manufacturing Capabilities** - Product formats, MOQs, and facility info
4. **Product Showcase** - Animated product demonstration
5. **Certifications** - Display of all compliance and quality certifications
6. **About Us** - Company story and statistics
7. **Why Choose Us** - Key differentiators and benefits
8. **Testimonials** - Client success stories
9. **Interactive Tools** - Calculators for business planning
10. **Contact Form** - Lead generation form

## 🛠️ Tech Stack

- **Framework**: [Astro.js](https://astro.build) v5.12.9
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v3.4.0
- **SEO**: astro-seo v0.8.4
- **Language**: TypeScript
- **Deployment**: Cloudflare Pages ready

## 📦 Project Structure

```
/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/          # Public images
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ServiceCard.astro
│   │   ├── TestimonialCard.astro
│   │   ├── MOQCalculator.astro
│   │   ├── LeadTimeEstimator.astro
│   │   ├── CostSavingsCalculator.astro
│   │   └── ProductShowcase.astro
│   ├── data/           # Data files
│   │   ├── services.js
│   │   ├── certifications.js
│   │   ├── manufacturing.js
│   │   └── testimonials.js
│   ├── layouts/        # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/          # Route pages
│   │   ├── index.astro
│   │   └── sitemap.xml.js
│   └── styles/         # Global styles
│       ├── global.css
│       └── tailwind.css
├── astro.config.mjs    # Astro configuration
├── tailwind.config.mjs # Tailwind configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/nutricraft-labs.git
cd nutricraft-labs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser

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
- Primary: Mint green (#00c16e)
- Mint shades: 50-900
- Gray shades: 50-900

### Content

- **Services**: Edit `src/data/services.js`
- **Certifications**: Edit `src/data/certifications.js`
- **Manufacturing**: Edit `src/data/manufacturing.js`
- **Testimonials**: Edit `src/data/testimonials.js`

### Images

Place images in:
- `public/images/` for static images
- `src/assets/` for images that need processing

## 📱 Responsive Design

The site is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔍 SEO

SEO features include:
- Meta tags and Open Graph tags
- Structured data (Schema.org)
- XML sitemap at `/sitemap.xml`
- Robots.txt configuration
- Semantic HTML structure

## 🚀 Deployment

### Cloudflare Pages

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` directory to Cloudflare Pages

3. Set the build command: `npm run build`
4. Set the output directory: `dist`

## 📝 Environment Variables

Create a `.env` file for any environment-specific variables:

```env
PUBLIC_SITE_URL=https://thewellnessdrop.com
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

For support, email hello@thewellnessdrop.com or visit our website.

---

Built with ❤️ using Astro.js and Tailwind CSS