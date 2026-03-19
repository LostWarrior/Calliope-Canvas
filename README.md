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
