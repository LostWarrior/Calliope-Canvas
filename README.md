# Calliope-Canvas

***Your slides are code. Your code is art.***

<img src="images/cover.png" alt="Calliope Canvas Cover" />

**Tired of fighting with Google Slides or Keynote?** 

If you're an engineer who dreads the phrase "just use this template," Calliope Canvas is your solution.

We believe that if your stack uses code, your presentations should too. This app fixes the pain of building slides and transforms it into a fluid, component-driven development process. You get to write your slides in React and TypeScript, unlocking the ability to build literally any custom animation, complex interactive element, or breathtaking pizzazz you can dream up.

**Version control for your slides**

Because your slides are just simple, modular code, they integrate perfectly with Git. This means collaboration is easy, design changes are straightforward to review, and if a stakeholder asks you to revert to last month’s version, you can do it without breaking a sweat.

**No more templates**

Stop wrestling with outdated software. Start building unforgettable decks on a powerful, version-controlled codebase designed for technical elegance and visual impact.


## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```
### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

That's it! 

Your app will be available at http://localhost:3000


## Structure

```                                                                                                                    │
│ Calliope-Canvas/                                                                                                       │
│ │                                                                                                                      │
│ ├── 📂 components/              # Add your own reusable React Components                                                            │
│ │   ├── Footer.tsx             # Application footer component                                                          │
│ │   └── Icons.tsx              # Icon library and components                                                           │
│ │                                                                                                                      │
│ ├── 📂 slides/                  # Add your own Presentation Slides                                                                  │
│ │   └── TitleSlide.tsx         # Default title slide component                                                           │
│ │                                                                                                                      │
│ ├── 📂 images/                  # Add your own static assets                                                                        │
│ │   ├── cover.png                                                                           │
│ │   └── logo-on-black.png                                                                           │
│ │                                                                                                                      │
│ ├── 📂 node_modules/                                                                    │
│ │                                                                                                                      │
│ ├── 📄 App.tsx                  # Main Application Component                                                           │
│ ├── 📄 index.tsx                # Application Entry Point                                                              │
│ ├── 📄 index.html               # HTML Template                                                                        │
│ ├── 📄 types.ts                 # Global TypeScript Definitions                                                        │
│ ├── 📄 metadata.json            # Project Metadata                                                                     │
│ │                                                                                                                      │
│ ├── ⚙️ package.json             # NPM Configuration                                                                    │
│ ├── ⚙️ package-lock.json        # Dependency Lock File                                                                 │
│ ├── ⚙️ tsconfig.json            # TypeScript Configuration                                                             │
│ ├── ⚙️ vite.config.ts           # Vite Build Configuration                                                             │
│ ├── ⚙️ .gitignore               # Git Ignore Rules                                                                     │
│ │                                                                                                                      │
│ └── 📖 README.md                # Project Documentation                                                                │
│ ```


## Contributing

All contributions are welcome! Please open an issue or submit a pull request.