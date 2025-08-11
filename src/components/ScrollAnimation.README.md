# ScrollAnimation Component

A performant Astro component that applies animations to elements when they scroll into view using the Intersection Observer API.

## Features

- 🚀 Performant - Uses Intersection Observer API for efficient scroll detection
- 🎨 Flexible - Accepts any Tailwind CSS animation classes
- ⏱️ Configurable delays - Add delays to create staggered animations
- 🎯 Custom thresholds - Control when animations trigger
- 🔄 Repeat or once - Choose whether animations repeat on scroll
- ♿ Accessible - Respects `prefers-reduced-motion` preferences
- 📱 Responsive - Works on all devices and screen sizes

## Usage

```astro
---
import ScrollAnimation from '../components/ScrollAnimation.astro';
---

<ScrollAnimation animation="animate-fade-up" delay={200}>
  <div class="card">
    <h2>This will fade in from bottom</h2>
    <p>With a 200ms delay</p>
  </div>
</ScrollAnimation>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | `string` | required | The animation class(es) to apply (e.g., "animate-fade-up") |
| `delay` | `number` | `0` | Delay in milliseconds before animation starts |
| `threshold` | `number` | `0.1` | How much of the element should be visible before triggering (0-1) |
| `triggerOnce` | `boolean` | `true` | Whether animation should only trigger once |
| `class` | `string` | `""` | Additional CSS classes for the wrapper |

## Available Animations

The component works with any CSS animation classes. Common animations included in `animations.css`:

- `animate-fade` - Simple fade in
- `animate-fade-up` - Fade in from bottom
- `animate-fade-down` - Fade in from top
- `animate-fade-left` - Fade in from left
- `animate-fade-right` - Fade in from right
- `animate-scale` - Scale up with fade
- `animate-scale-up` - Stronger scale effect
- `animate-rotate` - Rotate in with fade
- `animate-slide-up` - Slide up from bottom
- `animate-bounce-in` - Bounce in effect

## Examples

### Basic Fade In
```astro
<ScrollAnimation animation="animate-fade">
  <p>This text will fade in</p>
</ScrollAnimation>
```

### Staggered Cards
```astro
{cards.map((card, index) => (
  <ScrollAnimation 
    animation="animate-fade-up" 
    delay={index * 100}
  >
    <Card {...card} />
  </ScrollAnimation>
))}
```

### Custom Threshold
```astro
<ScrollAnimation 
  animation="animate-scale" 
  threshold={0.5}
>
  <div>Animates when 50% visible</div>
</ScrollAnimation>
```

### Repeating Animation
```astro
<ScrollAnimation 
  animation="animate-fade" 
  triggerOnce={false}
>
  <div>Animates every time it enters viewport</div>
</ScrollAnimation>
```

### Multiple Animations
```astro
<ScrollAnimation animation="animate-fade-up animate-scale">
  <div>Combines fade up and scale animations</div>
</ScrollAnimation>
```

## Performance Considerations

1. The component uses `will-change` CSS property for smooth animations
2. Elements are automatically unobserved after animation (when `triggerOnce` is true)
3. Supports dynamic content with MutationObserver
4. Minimal DOM manipulation for best performance

## Accessibility

The component automatically detects and respects the user's `prefers-reduced-motion` setting. When reduced motion is preferred:
- All animations are disabled
- Elements appear immediately without animation
- Ensures content is accessible to all users

## Browser Support

Works in all modern browsers that support:
- Intersection Observer API
- CSS animations
- ES6+ JavaScript

For older browsers, consider adding polyfills or the elements will appear without animation.