# TODO

# This is a wishlist for features. If you want to contribute please feel free to build these

- Explore speech follow that uses slide text, not just manual cues.
- Explore user defined themes
- Explore adding a central deck control where one will be able to navigate multiple decks
  This will make calliope canvas repo a central presentation system.
  You can create a new presentation, edit one, borrow elements from another presentation without having to clone the repo again
- Make calliope canvas package. Running cc init should create this presentation system locally. Install once, use anywhere
- Integrate with google slides/apple keynote to make it easy to share with non engineers
- Add a claude.md and agents.md and guidelines for creating good presentations
- Keep a single speaker notes window: clicking the notes button again should focus the existing window instead of opening another
- Add a timer to speaker notes: elapsed time, current clock, and an optional per-slide time budget that warns when over
- Put the current slide in the URL (e.g. `#/3`) so reloads keep your place and single slides can be shared
- Add a blank screen key (B) to black out the deck and bring attention back to the speaker
- Add jump to slide: type a number and press Enter, or press O for a grid overview of all slides
- Add PDF export with a print layout of one slide per page
- Match voice commands at the end of a sentence (e.g. "okay, next slide please")
- Add a linter and a test runner (each new dependency needs a security audit first)
- Announce slide changes to screen readers (e.g. "Slide 2 of 5: Pricing") via a visually hidden live region, so nothing appears on projectors
