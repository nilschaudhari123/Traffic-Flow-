using System.Collections.Generic;
using UnityEngine;

namespace TrafficFlowGridlock.Levels
{
    [CreateAssetMenu(fileName = "LevelCatalog", menuName = "Traffic Flow/Level Catalog")]
    public class LevelCatalog : ScriptableObject
    {
        public List<LevelDefinition> levels = new();

        public bool TryGet(int levelId, out LevelDefinition definition)
        {
            definition = levels.Find(l => l != null && l.levelId == levelId);
            return definition != null;
        }
    }
}
