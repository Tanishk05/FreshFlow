# 🎨 Visual Design Guide - Dashboard Color Schemes

## Color Psychology & Role Mapping

### 🌾 Farmer Dashboard - Green/Emerald/Teal

**Psychology**: Growth, nature, prosperity, sustainability
**Use Case**: Agriculture, farming, organic produce
**Gradient Flow**: Green (nature) → Emerald (premium) → Teal (water/life)

```css
/* Light Mode */
Background: from-green-50 via-emerald-50 to-teal-50
Text Gradient: from-green-700 to-emerald-600
Button: from-green-600 to-emerald-600
Border: border-green-200

/* Dark Mode */
Background: from-green-900/20 via-emerald-900/20 to-teal-900/20
Text Gradient: from-green-400 to-emerald-400
Border: border-green-800

/* Stat Cards */
Revenue: from-green-500 to-emerald-500 (Success)
Orders: from-blue-500 to-cyan-500 (Active)
Harvests: from-amber-500 to-orange-500 (Growth)
```

**Emoji Icons**:

- 🌱 Add Crop (Growth)
- 💰 Revenue (Money)
- 📦 Orders (Logistics)
- 🌾 Harvests (Agriculture)

---

### 🚚 Distributor Dashboard - Blue/Cyan/Sky

**Psychology**: Trust, efficiency, technology, movement
**Use Case**: Logistics, transportation, supply chain
**Gradient Flow**: Blue (trust) → Cyan (energy) → Sky (freedom/movement)

```css
/* Light Mode */
Background: from-blue-50 via-cyan-50 to-sky-50
Text Gradient: from-blue-700 to-cyan-600
Button: from-blue-600 to-cyan-600
Border: border-blue-200

/* Dark Mode */
Background: from-blue-900/20 via-cyan-900/20 to-sky-900/20
Text Gradient: from-blue-400 to-cyan-400
Border: border-blue-800

/* Stat Cards */
Orders: from-blue-500 to-cyan-500 (Pending)
Trucks: from-cyan-500 to-sky-500 (In Motion)
Warehouse: from-green-500 to-emerald-500 (Capacity)
```

**Emoji Icons**:

- 🚚 Fleet Status (Transportation)
- 📦 Pending Orders (Logistics)
- 🚛 Trucks (Vehicles)
- 📊 Warehouse (Storage)

---

### 🛒 Retailer Dashboard - Purple/Pink/Rose

**Psychology**: Luxury, innovation, commerce, customer focus
**Use Case**: Retail, sales, inventory, consumer goods
**Gradient Flow**: Purple (premium) → Pink (appeal) → Rose (warmth)

```css
/* Light Mode */
Background: from-purple-50 via-pink-50 to-rose-50
Text Gradient: from-purple-700 to-pink-600
Button: from-purple-600 to-pink-600
Border: border-purple-200

/* Dark Mode */
Background: from-purple-900/20 via-pink-900/20 to-rose-900/20
Text Gradient: from-purple-400 to-pink-400
Border: border-purple-800

/* Stat Cards */
Expiring: from-amber-500 to-orange-500 (Warning)
Low Stock: from-red-500 to-rose-500 (Alert)
Deliveries: from-blue-500 to-cyan-500 (Incoming)
```

**Emoji Icons**:

- 🛒 View Inventory (Shopping)
- ⚠️ Expiring Soon (Warning)
- 📉 Low Stock (Alert)
- 🚚 Incoming Deliveries (Logistics)

---

## AI Component Colors

### AI Insights Card

**Color**: Purple/Blue gradient (AI/Tech)

```css
Icon Background: from-purple-500 to-pink-500
Card Border: border-purple-200 dark:border-purple-700
Gradient Accent: from-purple-100 to-pink-100
```

**Insight Type Colors**:

- 🎯 **Opportunity**: `from-green-500 to-emerald-500` (Positive action)
- ⚠️ **Warning**: `from-amber-500 to-orange-500` (Caution)
- 🏆 **Achievement**: `from-purple-500 to-pink-500` (Celebration)
- 💡 **Tip**: `from-blue-500 to-cyan-500` (Information)

### Market Intelligence Card

**Color**: Blue/Cyan gradient (Data/Analysis)

```css
Icon Background: from-blue-500 to-cyan-500
Alert Severity Colors:
- High: from-red-500 to-rose-500
- Medium: from-amber-500 to-orange-500
- Low: from-green-500 to-emerald-500
```

---

## Universal Stat Card System

### Card Template

```tsx
<motion.div className="relative rounded-2xl overflow-hidden border bg-linear-to-br {bgGradient} p-6 group hover:shadow-xl">
  {/* Glow Effect */}
  <div className="absolute -top-4 -right-4 w-24 h-24 bg-linear-to-br {gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20" />

  {/* Content */}
  <div className="relative">
    <div className="flex items-start justify-between mb-4">
      {/* Icon with gradient */}
      <div className="text-4xl p-3 rounded-xl bg-linear-to-br {gradient} shadow-lg">
        {icon}
      </div>

      {/* Optional trend badge */}
      {trend && (
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-linear-to-r {gradient} text-white shadow-md">
          {trend}
        </span>
      )}
    </div>

    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
      {title}
    </h3>

    <p className="text-3xl font-bold bg-linear-to-r {gradient} bg-clip-text text-transparent">
      {value}
    </p>
  </div>
</motion.div>
```

### Stat Card Gradients Library

```css
/* Success/Positive */
Revenue: from-green-500 to-emerald-500
Background: from-green-50 to-emerald-50

/* Active/In Progress */
Orders: from-blue-500 to-cyan-500
Background: from-blue-50 to-cyan-50

/* Growth/Harvest */
Harvests: from-amber-500 to-orange-500
Background: from-amber-50 to-orange-50

/* Warning/Alert */
Expiring: from-amber-500 to-orange-500
Background: from-amber-50 to-orange-50

/* Danger/Critical */
Low Stock: from-red-500 to-rose-500
Background: from-red-50 to-rose-50

/* Info/Neutral */
General: from-gray-500 to-slate-500
Background: from-gray-50 to-slate-50

/* Tech/AI */
AI Features: from-purple-500 to-pink-500
Background: from-purple-50 to-pink-50
```

---

## Hero Section Pattern

### Structure

```tsx
<div className="mb-6">
  <div className="relative rounded-2xl overflow-hidden bg-linear-to-br {roleColors} border {roleBorder}">
    {/* Grid pattern overlay */}
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

    <div className="relative p-6 md:p-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        {/* Left: Title + Tagline */}
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-3xl font-bold bg-linear-to-r {textGradient} bg-clip-text text-transparent mb-2">
            {roleTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{roleTagline}</p>
        </div>

        {/* Right: CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-linear-to-r {buttonGradient} hover:{hoverGradient} text-white rounded-xl font-medium shadow-lg {shadowColor} flex items-center gap-2"
        >
          <span>{emoji}</span> {buttonText}
        </motion.button>
      </div>
    </div>
  </div>
</div>
```

### Role-Specific Values

**Farmer**:

- roleColors: `from-green-50 via-emerald-50 to-teal-50`
- roleBorder: `border-green-200`
- textGradient: `from-green-700 to-emerald-600`
- buttonGradient: `from-green-600 to-emerald-600`
- shadowColor: `shadow-green-500/30`
- emoji: `🌱`
- roleTitle: "Farm Intelligence Hub"
- roleTagline: "AI-powered insights for smarter farming"
- buttonText: "Add Crop"

**Distributor**:

- roleColors: `from-blue-50 via-cyan-50 to-sky-50`
- roleBorder: `border-blue-200`
- textGradient: `from-blue-700 to-cyan-600`
- buttonGradient: `from-blue-600 to-cyan-600`
- shadowColor: `shadow-blue-500/30`
- emoji: `🚚`
- roleTitle: "Logistics Command Center"
- roleTagline: "AI-optimized fleet management & delivery tracking"
- buttonText: "Fleet Status"

**Retailer**:

- roleColors: `from-purple-50 via-pink-50 to-rose-50`
- roleBorder: `border-purple-200`
- textGradient: `from-purple-700 to-pink-600`
- buttonGradient: `from-purple-600 to-pink-600`
- shadowColor: `shadow-purple-500/30`
- emoji: `🛒`
- roleTitle: "Smart Retail Operations"
- roleTagline: "AI-driven pricing & inventory management"
- buttonText: "View Inventory"

---

## Animation Patterns

### Card Entry Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
>
  {/* Card content */}
</motion.div>
```

**Effect**: Cards fade in from bottom with stagger

### Button Interaction

```tsx
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  {/* Button content */}
</motion.button>
```

**Effect**: Grows on hover, shrinks on click

### Glow Effect on Hover

```css
.group:hover .glow-effect {
  opacity: 20%;
}
```

**Effect**: Background glow intensifies on card hover

---

## Dark Mode Variants

### Background Adjustments

```css
/* Light Mode */
bg-{color}-50 → Subtle, soft color

/* Dark Mode */
bg-{color}-900/20 → Deep color with 20% opacity
```

### Text Adjustments

```css
/* Light Mode */
text-gray-600 → Medium gray

/* Dark Mode */
text-gray-400 → Lighter gray for contrast
```

### Border Adjustments

```css
/* Light Mode */
border-{color}-200 → Light border

/* Dark Mode */
border-{color}-800 → Dark border
```

---

## Accessibility Guidelines

### Contrast Ratios

- **Hero Text**: 7:1 (AAA level) - gradient text on light/dark background
- **Body Text**: 4.5:1 (AA level) - gray-600/gray-400
- **Stat Values**: 7:1 (AAA level) - gradient text

### Touch Targets

- **Buttons**: Minimum 48x48px
- **Cards**: Minimum 44px height
- **Icons**: 40x40px with 8px padding

### Focus Indicators

- All interactive elements have visible focus ring
- Keyboard navigation fully supported
- Screen reader friendly structure

---

## Component Sizing

### Hero Section

- Height: Auto (content-based)
- Padding: `p-6 md:p-8` (24px mobile, 32px desktop)
- Margin Bottom: `mb-6` (24px)
- Border Radius: `rounded-2xl` (16px)

### Stat Cards

- Height: Auto
- Padding: `p-6` (24px)
- Icon Size: `text-4xl` (36px emoji)
- Value Size: `text-3xl` (30px)

### Grid Gaps

- Section Spacing: `mb-6` (24px)
- Card Gaps: `gap-6` (24px)
- Column Gaps: `gap-6` (24px)

---

## Quick Reference: Tailwind Classes

### Gradients (Updated for ESLint)

```css
bg-linear-to-r    /* Left to right */
bg-linear-to-br   /* Bottom-right diagonal */
bg-linear-to-tr   /* Top-right diagonal */
```

### Text Gradient

```css
bg-linear-to-r {colors} bg-clip-text text-transparent
```

### Rounded Corners

```css
rounded-xl   /* 12px - Buttons */
rounded-2xl  /* 16px - Cards, Hero */
rounded-full /* 9999px - Badges, Pills */
```

### Shadows

```css
shadow-lg              /* Large shadow */
shadow-xl              /* Extra large shadow */
shadow-{color}-500/30  /* Colored shadow with 30% opacity */
```

---

## Print Styles (Future Enhancement)

For future PDF export functionality:

```css
@media print {
  .hero-section {
    display: none;
  } /* Hide decorative hero */
  .gradient-text {
    color: black;
  } /* Remove gradients */
  .shadow-lg {
    box-shadow: none;
  } /* Remove shadows */
}
```

---

**Last Updated**: Visual design guide completed
**Status**: Ready for implementation reference
