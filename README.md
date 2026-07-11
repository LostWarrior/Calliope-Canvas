# Calliope-Canvas

***Your slides are code. Your code is art.***

<img src="images/cover.png" alt="Calliope Canvas Cover" />

**Tired of fighting with Google Slides or Keynote?** 

If you're someone who dreads the phrase "just use this template," Calliope Canvas is your solution.

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

### Voice Controls

Voice now asks for microphone permission when the deck loads and arms speech recognition immediately after permission is granted. Use commands like:

- `Next Slide`
- `Next Slide Please`
- `Let's go back`
- `Previous Slide Please`
- `Start Animation`
- `Stop Animation`
- `Zoom In`
- `Zoom Out`

### Speaker Notes

Slides can include optional speaker notes alongside the rendered slide component:

```tsx
const slides = [
  {
    content: <TitleSlide />,
    notes: [
      'Welcome the audience and introduce the topic.',
      '[Mention what the audience should expect next.]',
    ],
    title: 'Title slide',
  },
];
```

Text wrapped in square brackets is italicized automatically in the speaker-notes window.

Use the `Notes` button in the footer to open a synced speaker-notes window. You can also open it directly with `?speaker-notes=1`.
The speaker-notes window has its own previous and next buttons, which keep the main deck in sync.

### Themes

Use the theme selector in the footer to switch between `Dark`, `Light`, and `Contrast`. The selected theme is saved in local storage and syncs with an open speaker-notes window.

Slides should use semantic theme utilities instead of fixed palettes:

```tsx
<section className="bg-canvas text-text">
  <p className="text-muted">Your text here</p>
  <button className="bg-primary text-canvas">Action</button>
</section>
```

Available semantic utilities include `canvas`, `surface`, `elevated`, `text`, `muted`, `border`, `primary`, `secondary`, `accent`, `danger`, and `focus`. Extend theme values in `index.css`; Tailwind maps those CSS variables in `tailwind.config.js`.

### Keyboard Help Menu

Calliope Canvas also includes a built-in help menu that displays all available keyboard shortcuts and voice commands. 
You can access this menu at any time while viewing the deck by pressing the `shift` + `?` keys on your keyboard. Press `shift` + `?` or `Esc` to close it.

![Keyboard Help Menu](images/help-menu.png)
### Preview

```bash
npm run preview
```

That's it! 

Your app will be available at http://localhost:3000


## Structure

```                                                                                                                    
Calliope-Canvas/                                                                                                       
│                                                                                                                      
├── 📂 components/                                                                  
│   ├── Footer.tsx                                                                        
│   └── Icons.tsx                                                                       
│                                                                                                                      
├── 📂 slides/                  # Add your slides here                                                                  
│   └── TitleSlide.tsx                                                                  
│                                                                                                                      
├── 📂 images/                  # Add your images here                                                                       
│   ├── cover.png                                                                           
│   └── logo-on-black.png                                                                           
│                                                                                                                      
├── 📂 node_modules/                                                                    
│                                                                                                                      
├── 📄 App.tsx                                                                           
├── 📄 index.tsx                                                                            
├── 📄 index.html                                                                                       
├── 📄 types.ts                                                                    
├── 📄 metadata.json                                                                              
│                                                                                                                      
├── ⚙️ package.json                                                                              
├── ⚙️ package-lock.json                                                                     
├── ⚙️ tsconfig.json                                                                  
├── ⚙️ vite.config.ts                                                                    
├── ⚙️ .gitignore                                                                                
│                                                                                                                      
└── 📖 README.md                                                                              
```
## Contributing

All contributions are welcome! Please open an issue or submit a pull request.
