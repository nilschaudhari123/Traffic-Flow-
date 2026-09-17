# TRAFFIC FLOW: GRIDLOCK (Unity)

Unity **6** project (6000.0.x LTS line — open with Unity 6.3 LTS or newer 6.x).

## Content scale

- **1000 levels** = 100 worlds × 10 levels per world
- Matches the web build and ChatGPT P0 `LevelDefinition` formulas

## First-time setup

1. Open `unity/TrafficFlowGridlock` in Unity Hub.
2. Run menu: **Traffic Flow → Resolve P0 - Build Canonical Production Project**
   - Generates `1000` `LevelDefinition` assets under `Assets/TrafficFlowGridlock/Levels/Worlds/`
   - Populates `Assets/Resources/LevelCatalog.asset`
   - Creates canonical scenes (Home, WorldMap, LevelSelect, Gameplay, …)
3. Run menu: **Traffic Flow → Resolve P0 - Validate Canonical Project**
4. Open scene `Assets/TrafficFlowGridlock/Scenes/Home.unity` and press Play.

## Compile / build players

- **Android / iOS / Standalone:** File → Build Settings → select platform → Build.
- CI: use [Unity Builder](https://github.com/game-ci/unity-builder) with this project path.

## Scripts layout

| Area | Purpose |
|------|---------|
| `Runtime/Traffic` | Board, vehicles, level generator, input |
| `Runtime/Progression` | 1000-level catalog + world definitions |
| `Runtime/UI` | Screen routing, HUD, level select pagination |
| `Editor/P0ProductionInstaller.cs` | One-click content + scenes |

## External production (not in repo)

AdMob, IAP product IDs, signing, Game Center / Play Games IDs must be configured in your developer accounts before store release.
