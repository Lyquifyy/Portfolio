# Portfolio Setup Guide

## Environment Variables Setup

This portfolio uses EmailJS for the contact form. To set it up:

### 1. Create EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Create an email service (Gmail, Outlook, etc.)
4. Create an email template
5. Get your credentials

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your EmailJS credentials in `.env`:
   ```
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
   ```

3. **IMPORTANT**: Never commit the `.env` file to version control!

### 3. EmailJS Domain Restrictions (Recommended)
For security, restrict your EmailJS public key to specific domains:

1. Go to EmailJS Dashboard > Account > Security
2. Add allowed domains:
   - `localhost` (for development)
   - `lyquifyy.github.io` (for production)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure

```
src/
├── components/         # React components
│   ├── BackToTop.js   # Back to top button
│   ├── ContactForm.js # Contact form with EmailJS
│   ├── Header.js      # Navigation header
│   ├── IntroScreen.js # Landing intro animation
│   ├── Modal.js       # Modal for project/experience details
│   └── Notification.js # Toast notifications
├── data/              # Data files
│   ├── projects.js    # Project data
│   ├── experiences.js # Work experience data
│   └── ideas.js       # Future project ideas
├── images/            # Image assets
├── App.js             # Main application component
├── App.css            # Application styles
└── index.js           # Entry point
```

## Features

- ✅ Responsive design with mobile hamburger menu
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ SEO optimized with meta tags
- ✅ Contact form with EmailJS integration
- ✅ Modular component architecture
- ✅ Environment variable support
- ✅ Back to top button
- ✅ Toast notifications
- ✅ GitHub and LinkedIn links

## Security Notes

1. API keys are stored in environment variables
2. `.env` file is gitignored
3. Set up domain restrictions in EmailJS dashboard
4. Never expose credentials in client-side code

## Customization

### Update Personal Information
- Edit `src/data/projects.js` for projects
- Edit `src/data/experiences.js` for work experience
- Edit `src/data/ideas.js` for future ideas
- Update GitHub username in `src/components/Header.js`
- Update LinkedIn URL in `src/components/Header.js`

### Update Styling
- Main styles: `src/App.css`
- Color scheme uses `#1e90ff` (dodger blue) as primary color
- Modify CSS variables for easy theme changes

## Troubleshooting

### Contact form not working
- Check `.env` file has correct EmailJS credentials
- Verify EmailJS service is active
- Check browser console for errors
- Ensure domain is allowed in EmailJS security settings

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Check Node version: requires Node 14+

## Deployment

This portfolio is configured for GitHub Pages:

1. Update `homepage` in `package.json` with your GitHub Pages URL
2. Run `npm run deploy`
3. Enable GitHub Pages in repository settings
