using TrafficFlowGridlock.Core;
using UnityEngine;
using UnityEngine.UI;

namespace TrafficFlowGridlock.UI
{
    public class HomeScreenRuntime : MonoBehaviour
    {
        public Text titleText;

        void Start()
        {
            if (titleText != null) titleText.text = GameConstants.ProductName;
        }

        public void OnPlayWorldMap() => ScreenRouter.Load(ScreenRouter.WorldMap);
        public void OnLevelSelect() => ScreenRouter.Load(ScreenRouter.LevelSelect);
        public void OnDaily() => ScreenRouter.Load(ScreenRouter.DailyChallenge);
        public void OnEndless() => ScreenRouter.Load(ScreenRouter.Endless);
        public void OnSettings() => ScreenRouter.Load(ScreenRouter.Settings);
    }
}
