using System;
using System.Collections.Generic;
using TrafficFlowGridlock.Core;
using TrafficFlowGridlock.Levels;
using UnityEngine;

namespace TrafficFlowGridlock.Progression
{
    public class RuntimeLevelCatalog
    {
        readonly Dictionary<int, RuntimeLevelInfo> levels = new();

        public int TotalLevels => GameConstants.TotalLevels;

        public RuntimeLevelCatalog()
        {
            var authored = Resources.Load<LevelCatalog>("LevelCatalog");
            for (int id = 1; id <= TotalLevels; id++)
            {
                if (authored != null && authored.TryGet(id, out var definition) && definition != null)
                    levels[id] = FromDefinition(definition);
                else
                    levels[id] = BuildFallback(id);
            }
        }

        public RuntimeLevelInfo Get(int id)
        {
            if (!levels.TryGetValue(id, out var info))
                throw new ArgumentOutOfRangeException(nameof(id), id, "Unknown level.");
            return info;
        }

        static RuntimeLevelInfo FromDefinition(LevelDefinition l)
        {
            int world = Mathf.Clamp((l.levelId - 1) / WorldDefinitions.LevelsPerWorld, 0, GameConstants.TotalWorlds - 1);
            int worldLevel = ((l.levelId - 1) % WorldDefinitions.LevelsPerWorld) + 1;
            return new RuntimeLevelInfo
            {
                LevelId = l.levelId,
                Theme = l.theme,
                WorldIndex = world,
                WorldLevel = worldLevel,
                VehicleCount = l.vehicleCount,
                MoveLimit = l.moveLimit,
                ParkingSlots = l.parkingSlots,
                Seed = l.EffectiveSeed,
                DynamicRoads = l.dynamicRoads,
                TrafficLights = l.trafficLights,
                Bridges = l.bridges,
                Tunnels = l.tunnels,
                MysteryVehicles = l.mysteryVehicles,
                BaseScore = l.baseScore,
                PerfectFlowBonus = l.perfectFlowBonus
            };
        }

        static RuntimeLevelInfo BuildFallback(int id)
        {
            int world = (id - 1) / WorldDefinitions.LevelsPerWorld;
            int worldLevel = ((id - 1) % WorldDefinitions.LevelsPerWorld) + 1;
            return new RuntimeLevelInfo
            {
                LevelId = id,
                Theme = WorldDefinitions.GetTheme(world),
                WorldIndex = world,
                WorldLevel = worldLevel,
                VehicleCount = Mathf.Clamp(6 + world * 2 + worldLevel, 7, 36),
                MoveLimit = Mathf.Clamp(18 + world * 3 + worldLevel * 2, 20, 90),
                ParkingSlots = Mathf.Clamp(2 + world / 2, 2, 8),
                Seed = 7919 + id * 104729,
                DynamicRoads = world >= 1 && worldLevel >= 4,
                TrafficLights = world >= 1 && worldLevel >= 7,
                Bridges = world >= 3,
                Tunnels = world >= 3,
                MysteryVehicles = world >= 2 && worldLevel >= 5,
                BaseScore = 1000 + world * 300 + worldLevel * 75,
                PerfectFlowBonus = 500 + world * 100
            };
        }
    }
}
