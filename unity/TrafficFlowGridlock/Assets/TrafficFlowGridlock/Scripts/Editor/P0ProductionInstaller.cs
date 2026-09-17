#if UNITY_EDITOR
using System.Collections.Generic;
using System.IO;
using TrafficFlowGridlock.Core;
using TrafficFlowGridlock.Flow;
using TrafficFlowGridlock.Levels;
using TrafficFlowGridlock.Progression;
using TrafficFlowGridlock.QA;
using TrafficFlowGridlock.Traffic;
using TrafficFlowGridlock.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using UnityEngine.UI;

namespace TrafficFlowGridlock.EditorTools
{
    public static class P0ProductionInstaller
    {
        const string Root = "Assets/TrafficFlowGridlock";
        const string SceneRoot = Root + "/Scenes";
        const string LevelRoot = Root + "/Levels/Worlds";
        const string ResourceRoot = "Assets/Resources";

        [MenuItem("Traffic Flow/Resolve P0 - Build Canonical Production Project")]
        public static void Build()
        {
            EnsureFolder(Root);
            EnsureFolder(SceneRoot);
            EnsureFolder(LevelRoot);
            EnsureFolder(ResourceRoot);
            BuildLevelAssets();
            BuildScenes();
            BuildSettings();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Validate();
            Debug.Log($"TRAFFIC FLOW: GRIDLOCK P0 resolved: {GameConstants.TotalLevels} level assets, scenes, and build settings installed.");
        }

        [MenuItem("Traffic Flow/Resolve P0 - Validate Canonical Project")]
        public static void Validate()
        {
            int errors = 0;
            var results = P0ProductionValidator.ValidateAll();
            foreach (var r in results)
            {
                if (!r.Valid)
                {
                    errors++;
                    Debug.LogError($"Level {r.LevelId}: {r.Message}");
                }
            }

            if (results.Count != GameConstants.TotalLevels)
            {
                errors++;
                Debug.LogError($"Expected {GameConstants.TotalLevels} levels, found {results.Count}.");
            }

            foreach (var id in SceneNames())
            {
                if (!File.Exists($"{SceneRoot}/{id}.unity"))
                {
                    errors++;
                    Debug.LogError($"Missing scene: {id}");
                }
            }

            Debug.Log(errors == 0
                ? "TRAFFIC FLOW: GRIDLOCK P0 validation PASSED."
                : $"TRAFFIC FLOW: GRIDLOCK P0 validation FAILED with {errors} error(s).");
        }

        static IEnumerable<string> SceneNames() => new[]
        {
            "Home", "WorldMap", "LevelSelect", "Gameplay", "LevelComplete", "LevelFailed",
            "DailyChallenge", "Endless", "Achievements", "Leaderboard", "Settings"
        };

        static void BuildLevelAssets()
        {
            var catalogPath = ResourceRoot + "/LevelCatalog.asset";
            var catalog = AssetDatabase.LoadAssetAtPath<LevelCatalog>(catalogPath);
            if (catalog == null)
            {
                catalog = ScriptableObject.CreateInstance<LevelCatalog>();
                AssetDatabase.CreateAsset(catalog, catalogPath);
            }

            var so = new SerializedObject(catalog);
            var list = so.FindProperty("levels");
            list.arraySize = GameConstants.TotalLevels;

            for (int id = 1; id <= GameConstants.TotalLevels; id++)
            {
                int world = (id - 1) / GameConstants.LevelsPerWorld;
                int wl = ((id - 1) % GameConstants.LevelsPerWorld) + 1;
                string folder = $"{LevelRoot}/World{world + 1:000}";
                EnsureFolder(folder);
                string path = $"{folder}/Level_{id:0000}.asset";
                var level = AssetDatabase.LoadAssetAtPath<LevelDefinition>(path);
                if (level == null)
                {
                    level = ScriptableObject.CreateInstance<LevelDefinition>();
                    AssetDatabase.CreateAsset(level, path);
                }

                level.levelId = id;
                level.theme = WorldDefinitions.GetTheme(world);
                level.vehicleCount = Mathf.Clamp(6 + world * 2 + wl, 7, 36);
                level.moveLimit = Mathf.Clamp(18 + world * 3 + wl * 2, 20, 90);
                level.parkingSlots = Mathf.Clamp(2 + world / 2, 2, 8);
                level.seed = 7919 + id * 104729;
                level.dynamicRoads = world >= 1 && wl >= 4;
                level.trafficLights = world >= 1 && wl >= 7;
                level.bridges = world >= 3;
                level.tunnels = world >= 3;
                level.mysteryVehicles = world >= 2 && wl >= 5;
                level.baseScore = 1000 + world * 300 + wl * 75;
                level.perfectFlowBonus = 500 + world * 100;
                EditorUtility.SetDirty(level);
                list.GetArrayElementAtIndex(id - 1).objectReferenceValue = level;
            }

            so.ApplyModifiedPropertiesWithoutUndo();
            EditorUtility.SetDirty(catalog);
        }

        static void BuildScenes()
        {
            CreateHome();
            CreateSimple("WorldMap", typeof(HomeScreenRuntime));
            CreateLevelSelect();
            CreateGameplay();
            CreateSimple("LevelComplete", typeof(HomeScreenRuntime));
            CreateSimple("LevelFailed", typeof(HomeScreenRuntime));
            CreateSimple("DailyChallenge", typeof(HomeScreenRuntime));
            CreateSimple("Endless", typeof(HomeScreenRuntime));
            CreateSimple("Achievements", typeof(HomeScreenRuntime));
            CreateSimple("Leaderboard", typeof(HomeScreenRuntime));
            CreateSimple("Settings", typeof(HomeScreenRuntime));

            var build = new List<EditorBuildSettingsScene>();
            foreach (var n in SceneNames())
                build.Add(new EditorBuildSettingsScene($"{SceneRoot}/{n}.unity", true));
            EditorBuildSettings.scenes = build.ToArray();
        }

        static void CreateHome()
        {
            var scene = New("Home");
            var canvas = CreateCanvas("Home Canvas");
            var title = CreateText(canvas.transform, "Title", GameConstants.ProductName, 36);
            title.GetComponent<RectTransform>().anchoredPosition = new Vector2(0, 200);
            var host = new GameObject("Home Screen", typeof(HomeScreenRuntime));
            host.GetComponent<HomeScreenRuntime>().titleText = title;
            AddEventSystem();
            Save(scene, "Home");
        }

        static void CreateLevelSelect()
        {
            var scene = New("LevelSelect");
            var canvas = CreateCanvas("Level Select");
            var header = CreateText(canvas.transform, "Header", "Level Select", 28);
            header.GetComponent<RectTransform>().anchoredPosition = new Vector2(0, 260);
            var scroll = new GameObject("Scroll", typeof(RectTransform), typeof(ScrollRect));
            scroll.transform.SetParent(canvas.transform, false);
            var content = new GameObject("Content", typeof(RectTransform), typeof(GridLayoutGroup));
            content.transform.SetParent(scroll.transform, false);
            var grid = content.GetComponent<GridLayoutGroup>();
            grid.cellSize = new Vector2(80, 80);
            grid.spacing = new Vector2(8, 8);
            var selector = new GameObject("Level Select", typeof(LevelSelectRuntime));
            selector.GetComponent<LevelSelectRuntime>().buttonRoot = content.transform;
            selector.GetComponent<LevelSelectRuntime>().headerText = header;
            AddEventSystem();
            Save(scene, "LevelSelect");
        }

        static void CreateGameplay()
        {
            var scene = New("Gameplay");
            var boardGo = new GameObject("Traffic Board", typeof(TrafficBoardRuntime));
            var board = boardGo.GetComponent<TrafficBoardRuntime>();
            var input = boardGo.AddComponent<VehicleInputController>();
            input.board = board;
            var cam = new GameObject("Main Camera", typeof(Camera));
            cam.transform.position = new Vector3(0, 12, -6);
            cam.transform.rotation = Quaternion.Euler(55, 0, 0);
            input.worldCamera = cam.GetComponent<Camera>();
            var entry = boardGo.AddComponent<GameplaySceneEntry>();
            entry.board = board;
            var canvas = CreateCanvas("HUD");
            var hud = canvas.AddComponent<GameplayHudRuntime>();
            hud.scoreText = CreateText(canvas.transform, "Score", "0", 20);
            hud.movesText = CreateText(canvas.transform, "Moves", "0", 20);
            hud.comboText = CreateText(canvas.transform, "Combo", "x0", 20);
            hud.remainingText = CreateText(canvas.transform, "Remaining", "0", 20);
            hud.statusText = CreateText(canvas.transform, "Status", "", 18);
            entry.hud = hud;
            AddEventSystem();
            Save(scene, "Gameplay");
        }

        static void CreateSimple(string name, System.Type hostType)
        {
            var scene = New(name);
            var canvas = CreateCanvas(name);
            CreateText(canvas.transform, "Label", name, 32);
            new GameObject(name + " Screen", hostType);
            AddEventSystem();
            Save(scene, name);
        }

        static GameObject CreateCanvas(string name)
        {
            var go = new GameObject(name, typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            var canvas = go.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = go.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 1920);
            scaler.matchWidthOrHeight = 0.5f;
            return go;
        }

        static Text CreateText(Transform parent, string name, string value, int size)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var text = go.GetComponent<Text>();
            text.text = value;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = size;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = Color.white;
            return text;
        }

        static void AddEventSystem()
        {
            if (Object.FindObjectOfType<EventSystem>() != null) return;
            new GameObject("EventSystem", typeof(EventSystem), typeof(InputSystemUIInputModule));
        }

        static void BuildSettings()
        {
            PlayerSettings.companyName = "NAAM";
            PlayerSettings.productName = GameConstants.ProductName;
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
            PlayerSettings.bundleVersion = "1.0.0";
        }

        static UnityEngine.SceneManagement.Scene New(string name) =>
            EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

        static void Save(UnityEngine.SceneManagement.Scene scene, string name) =>
            EditorSceneManager.SaveScene(scene, $"{SceneRoot}/{name}.unity");

        static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            var parts = path.Split('/');
            string current = parts[0];
            for (int i = 1; i < parts.Length; i++)
            {
                string next = current + "/" + parts[i];
                if (!AssetDatabase.IsValidFolder(next)) AssetDatabase.CreateFolder(current, parts[i]);
                current = next;
            }
        }
    }
}
#endif
