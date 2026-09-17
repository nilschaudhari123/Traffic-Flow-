using UnityEngine;

namespace TrafficFlowGridlock.Levels
{
    [CreateAssetMenu(fileName = "LevelDefinition", menuName = "Traffic Flow/Level Definition")]
    public class LevelDefinition : ScriptableObject
    {
        public int levelId;
        public string theme;
        public int vehicleCount = 8;
        public int moveLimit = 24;
        public int parkingSlots = 3;
        public int seed;
        public bool dynamicRoads;
        public bool trafficLights;
        public bool bridges;
        public bool tunnels;
        public bool mysteryVehicles;
        public int baseScore = 1000;
        public int perfectFlowBonus = 500;

        public int EffectiveSeed => seed != 0 ? seed : levelId * 104729 + 7919;
    }
}
