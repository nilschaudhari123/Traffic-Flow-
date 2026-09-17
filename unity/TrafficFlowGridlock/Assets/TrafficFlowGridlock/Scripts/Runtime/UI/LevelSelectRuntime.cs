using TrafficFlowGridlock.Core;
using TrafficFlowGridlock.Flow;
using TrafficFlowGridlock.Progression;
using UnityEngine;
using UnityEngine.UI;

namespace TrafficFlowGridlock.UI
{
    public class LevelSelectRuntime : MonoBehaviour
    {
        public Transform buttonRoot;
        public Text headerText;
        public int worldFilter = -1;
        public int page;
        public int pageSize = 50;

        readonly RuntimeLevelCatalog catalog = new();

        void Start() => Rebuild();

        public void SetWorld(int worldIndex)
        {
            worldFilter = worldIndex;
            page = 0;
            Rebuild();
        }

        public void NextPage()
        {
            page++;
            Rebuild();
        }

        public void PrevPage()
        {
            page = Mathf.Max(0, page - 1);
            Rebuild();
        }

        void Rebuild()
        {
            if (buttonRoot == null) return;
            for (int i = buttonRoot.childCount - 1; i >= 0; i--) Destroy(buttonRoot.GetChild(i).gameObject);

            int start, end;
            if (worldFilter >= 0)
            {
                start = worldFilter * GameConstants.LevelsPerWorld + 1;
                end = start + GameConstants.LevelsPerWorld - 1;
                if (headerText != null) headerText.text = WorldDefinitions.GetName(worldFilter);
            }
            else
            {
                start = page * pageSize + 1;
                end = Mathf.Min(start + pageSize - 1, GameConstants.TotalLevels);
                if (headerText != null) headerText.text = $"Levels {start}-{end}";
            }

            for (int id = start; id <= end; id++)
            {
                var go = new GameObject($"Level_{id}", typeof(RectTransform), typeof(Button), typeof(Text));
                go.transform.SetParent(buttonRoot, false);
                var text = go.GetComponent<Text>();
                text.text = id.ToString();
                text.alignment = TextAnchor.MiddleCenter;
                text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                int levelId = id;
                go.GetComponent<Button>().onClick.AddListener(() => Launch(levelId));
            }
        }

        void Launch(int levelId)
        {
            GameLaunchContext.SelectedLevelId = levelId;
            ScreenRouter.Load(ScreenRouter.Gameplay);
        }

        public void OnBack() => ScreenRouter.Load(ScreenRouter.WorldMap);
    }
}
