using TrafficFlowGridlock.Progression;
using TrafficFlowGridlock.Traffic;
using TrafficFlowGridlock.UI;
using UnityEngine;

namespace TrafficFlowGridlock.Flow
{
    public class GameplaySceneEntry : MonoBehaviour
    {
        public TrafficBoardRuntime board;
        public GameplayHudRuntime hud;

        readonly RuntimeLevelCatalog catalog = new();
        RuntimeLevelInfo activeInfo;

        void Start()
        {
            Application.targetFrameRate = Core.GameConstants.TargetFrameRate;
            activeInfo = catalog.Get(Mathf.Clamp(GameLaunchContext.SelectedLevelId, 1, catalog.TotalLevels));
            board.OnLevelComplete.AddListener(OnWin);
            board.OnLevelFailed.AddListener(OnFail);
            board.OnStatus.AddListener(msg => hud?.SetStatus(msg));
            board.LoadLevel(activeInfo);
            hud?.Bind(board, activeInfo);
        }

        void OnWin()
        {
            GameLaunchContext.LastScore = board.Score;
            GameLaunchContext.LastMoves = board.Moves;
            float ratio = (float)board.Moves / activeInfo.MoveLimit;
            GameLaunchContext.LastStars = ratio <= 0.55f ? 3 : ratio <= 0.8f ? 2 : 1;
            ScreenRouter.Load(ScreenRouter.LevelComplete);
        }

        void OnFail() => ScreenRouter.Load(ScreenRouter.LevelFailed);
    }
}
