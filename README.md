# Traffic Flow: Gridlock

**TRAFFIC FLOW: GRIDLOCK** — traffic-flow puzzle game (1000 levels, 100 worlds).

## Web app (ready to run)

```bash
npm install
npm run dev      # development
npm run build    # production compile
npm run preview  # serve dist/
```

Open `http://localhost:5173` — full UI flow, gameplay, daily/endless modes, progression in `localStorage`.

## Unity project (mobile / 3D)

Path: [`unity/TrafficFlowGridlock`](unity/TrafficFlowGridlock)

1. Open in **Unity 6.3 LTS** (or Unity 6.0+).
2. **Traffic Flow → Resolve P0 - Build Canonical Production Project**
3. **Traffic Flow → Resolve P0 - Validate Canonical Project**
4. Play from `Assets/TrafficFlowGridlock/Scenes/Home.unity`.

See [unity/TrafficFlowGridlock/README.md](unity/TrafficFlowGridlock/README.md) for player builds.

## Level scale

| | Worlds | Levels / world | Total |
|---|--------|----------------|-------|
| Campaign | 100 | 10 | **1000** |

Level parameters (seed, moves, parking, flags) use the same formulas in web and Unity.
