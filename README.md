
# Bold Routes Partners

A comprehensive React + Vite web application for Bold Routes Partners, enabling small & medium brokerages to close deals under Bold Routes' name for bigger commissions.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   - Navigate to the URL shown in your terminal (typically `http://localhost:5173`)

## 📋 Features

### 🏠 Home Page
- Hero section with company value proposition
- Featured developer partners showcase
- Call-to-action buttons for key features

### 🏢 Inventory Management
- Real estate inventory table with project details
- Developer contact information with Call/WhatsApp buttons
- Area and project filtering capabilities

### 🚀 New Launches
- Card-based grid view of property launches
- Search functionality by project, developer, or area
- Filter by upcoming/active launches based on dates
- Direct contact options for each project

### 💰 Commission Rates & Calculator
- Commission rates table for all developer partners
- Interactive calculator to compute earnings
- Real-time commission calculation with Egyptian Pound formatting

### 📝 Deal Closing Form
- Comprehensive form for submitting closed deals
- File upload support for attachments
- Form validation with phone number and deal value validation
- Success confirmation with next steps

### 🤝 Partner Application
- Lead capture form for potential partners
- Company details and registration status
- WhatsApp integration for follow-up contact

### 📊 Submissions Dashboard
- Two-tab interface for applications and deals
- CSV export functionality for data management
- Protected route requiring mock authentication

### ℹ️ About Page
- How-it-works process explanation
- Benefits and contact information
- Multi-channel contact options

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom brand colors
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Icons**: Lucide React
- **Data Persistence**: LocalStorage

## 🎨 UI/UX & Theming

This application uses a **strictly monochrome design system** (black/white/gray only) with mobile-first responsive design and full accessibility compliance.

### Design Tokens
The app uses CSS custom properties for consistent theming:

```css
:root {
  /* Light theme (default) */
  --brand-bg: #ffffff;
  --brand-fg: #0a0a0a;
  --brand-muted: #f5f5f5;
  --brand-border: #e5e5e5;
  --brand-card: #ffffff;
  --brand-overlay: rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] {
  /* Dark theme */
  --brand-bg: #0a0a0a;
  --brand-fg: #fafafa;
  --brand-muted: #171717;
  --brand-border: #262626;
  --brand-card: #171717;
  --brand-overlay: rgba(255, 255, 255, 0.05);
}
```

### Theme Switching
To enable dark mode, add the data attribute to the root element:
```javascript
// Enable dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Disable dark mode (return to light)
document.documentElement.removeAttribute('data-theme');
```

### Brand Guidelines
- **No colored accents**: Everything must be black, white, or gray variants
- **Typography**: Inter font with system fallbacks
- **Spacing**: 4px/8px incremental spacing scale
- **Shadows**: Subtle black shadows with opacity
- **Focus states**: High-contrast 2px outlines

### Component Classes
Use these utility classes for consistent styling:

```css
/* Typography */
.h1, .h2, .h3          /* Heading styles */
.lead                   /* Large body text */
.muted                  /* Secondary text */

/* Buttons */
.btn-primary           /* Main action button */
.btn-secondary         /* Secondary action button */
.btn-ghost             /* Minimal button */

/* Forms */
.form-field            /* Field container */
.form-label            /* Field label */
.form-input            /* Input styling */
.form-error            /* Error message */

/* Layout */
.card                  /* Card container */
.card-elevated         /* Card with shadow */
.section               /* Page section */
.container-mobile      /* Mobile-first container */
```

### Responsive Breakpoints
```css
sm: 360px   /* Small mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Accessibility Features
- WCAG 2.2 AA compliant contrast ratios
- Keyboard navigation support
- Screen reader friendly markup
- Focus indicators (2px high-contrast outlines)
- Semantic HTML with proper ARIA attributes
- Skip-to-content link for navigation
- 44px minimum touch targets on mobile

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout with nav/footer
│   ├── Nav.tsx         # Navigation component
│   ├── Footer.tsx      # Footer with contact info
│   ├── Card.tsx        # Reusable card component
│   ├── PhoneButtons.tsx # Call/WhatsApp action buttons
│   ├── SearchBar.tsx   # Search input component
│   ├── Tabs.tsx        # Tab navigation component
│   ├── NumberInput.tsx # Numeric input with validation
│   ├── CurrencyInput.tsx # EGP currency input
│   ├── FileDropzone.tsx # File upload component
│   └── Toast.tsx       # Success/error notifications
├── pages/              # Route-based page components
│   ├── Home.tsx        # Landing page
│   ├── Inventory.tsx   # Property inventory
│   ├── Launches.tsx    # New launches with filters
│   ├── Commissions.tsx # Rates and calculator
│   ├── CloseDeal.tsx   # Deal submission form
│   ├── Apply.tsx       # Partner application
│   ├── Submissions.tsx # Dashboard (protected)
│   └── About.tsx       # Information page
├── store/              # Zustand state management
│   ├── auth.ts         # Mock authentication
│   └── data.ts         # Data management and persistence
├── utils/              # Utility functions
│   ├── format.ts       # Currency and date formatting
│   └── phone.ts        # Phone number utilities
├── data/               # Mock JSON data
│   ├── developers.json # Developer information
│   ├── commissions.json # Commission rates
│   ├── launches.json   # Property launches
│   └── inventory.json  # Available inventory
└── styles/
    └── index.css       # Tailwind CSS with custom styles
```

## 💾 Data Management

### Mock Data Files
All mock data is stored in `src/data/` as JSON files:

- **developers.json**: Developer partners with contact info
- **commissions.json**: Commission rates and notes
- **launches.json**: Property launches with dates and pricing
- **inventory.json**: Available property inventory

### LocalStorage Keys
- `brp_partner_applications`: Submitted partner applications
- `brp_closed_deals`: Submitted deal records

## 🔧 Customization

### Editing Mock Data
Update the JSON files in `src/data/` to modify:
- Developer information and contacts
- Commission rates and terms
- Property launches and inventory
- Project details and pricing

### Changing Brand Colors
Update `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#YOUR_PRIMARY_COLOR',
      accent: '#YOUR_ACCENT_COLOR',
    },
  },
}
```

Also update the CSS variables in `src/styles/index.css`:
```css
.text-brand-primary { color: #YOUR_PRIMARY_COLOR; }
.bg-brand-primary { background-color: #YOUR_PRIMARY_COLOR; }
```

### Phone Number Configuration
Update contact information in:
- `src/components/Footer.tsx` (contact phone/email)
- `src/pages/About.tsx` (contact details)

## 🗃️ Local Storage Management

### Viewing Stored Data
Open browser DevTools > Application > Local Storage to view:
- Partner applications
- Closed deals

### Clearing Data
```javascript
// Clear all app data
localStorage.removeItem('brp_partner_applications');
localStorage.removeItem('brp_closed_deals');

// Or clear everything
localStorage.clear();
```

### Resetting for Testing
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Select Local Storage
4. Delete the Bold Routes keys
5. Refresh the page

## 📱 Features Detail

### Authentication
- Mock authentication system using Zustand
- Login/logout toggle for accessing protected routes
- Submissions page requires authentication

### Form Validation
- Phone numbers: 10-15 digits, international format supported
- Deal values: Must be positive numbers
- Required field validation with real-time feedback
- File upload with type and size restrictions

### Phone Integration
- Automatic phone number formatting
- Tel: links for direct calling
- WhatsApp deep links with pre-filled messages
- International number support (+20 for Egypt)

### Commission Calculator
- Real-time calculation as you type
- Egyptian Pound currency formatting
- Developer selection with auto-filled rates
- Input validation and error handling

### File Uploads
- Drag & drop file upload interface
- Multiple file support with previews
- File type restrictions (PDF, JPG, PNG)
- File metadata storage (no backend required)

## 🔒 Security Notes

- All data is stored locally (no backend)
- File uploads store metadata only (not actual files)
- Mock authentication for demonstration only
- Phone numbers are validated but not verified

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Organization
- Components are functional with TypeScript
- Hooks used for state management and side effects
- Form handling with React Hook Form and Zod
- Responsive design with Tailwind CSS utilities

## 📞 Support

For technical support or questions about the application:
- WhatsApp: +201234567890
- Email: info@boldroutes.com

## 📄 License

This project is proprietary software for Bold Routes Partners.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS

