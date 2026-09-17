using UnityEngine;
using UnityEngine.SceneManagement;

namespace TrafficFlowGridlock.UI
{
    public static class ScreenRouter
    {
        public const string Home = "Home";
        public const string WorldMap = "WorldMap";
        public const string LevelSelect = "LevelSelect";
        public const string Gameplay = "Gameplay";
        public const string LevelComplete = "LevelComplete";
        public const string LevelFailed = "LevelFailed";
        public const string DailyChallenge = "DailyChallenge";
        public const string Endless = "Endless";
        public const string Achievements = "Achievements";
        public const string Leaderboard = "Leaderboard";
        public const string Settings = "Settings";

        public static void Load(string sceneName)
        {
            if (SceneManager.GetActiveScene().name == sceneName) return;
            SceneManager.LoadScene(sceneName);
        }
    }
}
