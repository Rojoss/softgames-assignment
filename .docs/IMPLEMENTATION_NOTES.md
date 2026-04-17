# Implementation Notes

This file explains the main choices in the project without going too deep. The goal was to keep the assignment simple, readable, and extendable by making it easy to maintain.

## Project decisions

### Layout and scaling

- The game is built around a fixed `1920x1080` virtual viewport and the whole stage is scaled to fit.
- I went with this instead of scene-by-scene responsive layouts because it kept positioning predictable and let me focus on the assignment itself.
- The tradeoff is that the game is really designed for desktop and landscape screens, not portrait mobile.

### Fullscreen

- Fullscreen is handled as best-effort.
- The app requests fullscreen on startup and tries again on the first click, but browsers often block fullscreen until there is user interaction.
- Because of that, failed fullscreen requests are treated as normal and the app just keeps running.

### Custom systems

- I implemented the scene flow, tweening, particles, FPS display, pause handling, and event bus in the codebase instead of using extra runtime libraries.
- That was mostly to keep the project small and to show the implementation clearly.
- These systems are intentionally small in scope and only do what this assignment needs.

### Assets and scene lifetime

- Assets are split per scene and loaded on demand, while the remaining scenes are preloaded in the background.
- Each playable scene has its own sprite sheet. That is slightly more setup up front, but it keeps asset access clean and scales better if the project grows.
- Scenes are recreated on every transition instead of being kept alive. That keeps state local to the scene and avoids stale listeners or hidden cross-scene state.

### App-wide behavior

- FPS is shown in the top-left corner for the whole app.
- The game pauses when the tab is hidden or the window loses focus, then resumes when focus returns.
- Tween updates follow the same pause and resume flow so animations do not drift while the app is inactive.

## Task notes

### Ace of Shadows

- The `144` sprites are made from two full card decks plus a third deck with only `A` through `10`.
- The left pile only shows a small visible subset of the stack. All cards still exist, but compressing the pile made it much easier to read visually.
- The right pile keeps the landed card positions so the destination stack feels like it is really building up over time.
- A card moves every second, and each move takes exactly `2s` as required by the assignment. That means multiple cards can be in flight at the same time.
- The newly revealed top card flips open with a short delay so the dealing motion reads more clearly.

### Magic Words

- The text-and-emoji rendering is done entirely in Pixi instead of mixing Pixi with DOM overlays.
- Avatars and emoji are loaded at runtime because they come from remote URLs in the API response.
- If avatar data is missing, a fallback avatar is used so the dialogue still works.
- If an emoji placeholder is unknown, it is removed instead of showing broken placeholder text.
- Text inside `*...*` is treated as bold because one API line used that format so I assumed that it should be bold.
- Dialogue advances one tap at a time, clears after the last line, and restarts on the next tap.

### Phoenix Flame

- The effect is built around the hard limit of `10` sprites on screen at once.
- To still make it feel like fire, the implementation leans on pooled particles, additive blending, color transitions, and a few different spawn profiles.
- The main tradeoff here is density versus clarity: I prioritized staying within the sprite budget and keeping the system clean over making the flame more detailed.
- Normally I would have liked to work with an artist for this to try do more with sprite variations.

## Architecture

### App composition

- `App` is the composition root. It wires together asset loading, scene management, tweening, pause handling, scaling, and FPS reporting.
- That keeps scene classes focused on scene-specific behavior instead of startup plumbing.

### Shared tween manager

- `TweenManager` is created in `App` and exposed as a shared instance.
- I used a shared instance here because animation code appears in several scene objects and full dependency injection everywhere felt too heavy for this project.
- Even with that shortcut, the manager stays narrow in scope and is cleared on scene changes.

### Event bus

- A small event bus is used for pause and resume, scene lifecycle events, and FPS updates.
- The point was not to build a big messaging system, only to reduce direct coupling between a few app-wide services.
