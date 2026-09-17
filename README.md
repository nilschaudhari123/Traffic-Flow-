# Traffic Flow: Gridlock

Runnable web implementation of the **TRAFFIC FLOW: GRIDLOCK** P0 scope from the shared ChatGPT production plan:

- Home → World Map → Level Select (100 levels, 10 worlds) → Gameplay → Complete/Failed
- Daily Challenge, Endless Gridlock, Shop, Achievements, Leaderboard, Settings
- Deterministic level seeds, move limits, parking slots, combo scoring, tow power-up
- Progress saved in `localStorage`

The original ChatGPT thread targeted a **Unity 6.3 LTS** mobile project; this repository delivers a browser-playable version with the same progression rules and screen flow so you can run and test immediately.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Unity project note

To use the full Unity package described in the chat (3D presentation, platform IAP/ads, editor validators), download the zip from that conversation and open it in Unity 6.3 LTS, then run:

- **Traffic Flow → Resolve P0 - Build Canonical Production Project**
- **Traffic Flow → Resolve P0 - Validate Canonical Project**
