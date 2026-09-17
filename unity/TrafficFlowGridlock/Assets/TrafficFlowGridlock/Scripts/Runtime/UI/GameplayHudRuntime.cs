using TrafficFlowGridlock.Progression;
using TrafficFlowGridlock.Traffic;
using UnityEngine;
using UnityEngine.UI;

namespace TrafficFlowGridlock.UI
{
    public class GameplayHudRuntime : MonoBehaviour
    {
        public Text scoreText;
        public Text movesText;
        public Text comboText;
        public Text remainingText;
        public Text statusText;

        TrafficBoardRuntime board;
        RuntimeLevelInfo info;

        public void Bind(TrafficBoardRuntime b, RuntimeLevelInfo level)
        {
            board = b;
            info = level;
            Refresh();
        }

        void Update() => Refresh();

        public void SetStatus(string msg)
        {
            if (statusText != null) statusText.text = msg;
        }

        void Refresh()
        {
            if (board == null || info == null) return;
            if (scoreText != null) scoreText.text = board.Score.ToString();
            if (movesText != null) movesText.text = $"{board.Moves}/{info.MoveLimit}";
            if (comboText != null) comboText.text = $"x{board.Combo}";
            if (remainingText != null) remainingText.text = board.RemainingVehicles.ToString();
        }

        public void OnTow() => board?.TowRemoveOne();
        public void OnHome() => ScreenRouter.Load(ScreenRouter.Home);
    }
}
