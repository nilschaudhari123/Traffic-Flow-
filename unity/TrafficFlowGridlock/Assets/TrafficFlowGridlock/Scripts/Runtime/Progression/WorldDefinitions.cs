using TrafficFlowGridlock.Core;

namespace TrafficFlowGridlock.Progression
{
    public static class WorldDefinitions
    {
        public static readonly string[] Names =
        {
            "Sunny Suburb", "Downtown", "Neon City", "Mountain Highway", "Airport",
            "Harbor", "Desert Highway", "Snow City", "Cyber City", "Mega Gridlock"
        };

        public static readonly string[] Themes =
        {
            "suburb", "downtown", "neon", "mountain", "airport",
            "harbor", "desert", "snow", "cyber", "mega"
        };

        public static int LevelsPerWorld => GameConstants.LevelsPerWorld;

        public static string GetName(int worldIndex)
        {
            if (worldIndex >= 0 && worldIndex < Names.Length) return Names[worldIndex];
            return $"Grid Sector {worldIndex + 1}";
        }

        public static string GetTheme(int worldIndex)
        {
            if (Themes.Length == 0) return "suburb";
            var i = worldIndex % Themes.Length;
            if (i < 0) i += Themes.Length;
            return Themes[i];
        }
    }
}
