# 20/10 · 10B4 — V20 REPLY MOMENT

V20 keeps the stable V18/V19 letter experience and rebuilds the moment after a letter is finished.

## Changes
- Removed the 10B4 tree completely.
- Removed tree/localStorage progression logic.
- Fixed the letter footer so the signature never sits on top of the final paragraph.
- Separated `10B4` metadata from the close button.
- After the last typed character, a clear **Đọc xong rồi ♡** interaction panel appears outside the paper.
- The panel exposes **Mở một điều nhỏ nữa** and all three reply reactions immediately, instead of hiding the reply behind a tiny corner button.
- The paper remains a clean screenshot-ready block; the interaction panel never covers the letter text.
- Mobile layout keeps the paper and the interaction panel within the viewport as much as possible, without requiring a second scroll just to discover the reaction.
- Existing typing, sound, search, heart burst and performance behavior are preserved.

## Files
- `index.html`
- `style.css`
- `app.js`
- `data.js`
- `README.md`

Deploy the five files together at the root of a GitHub Pages repository.
