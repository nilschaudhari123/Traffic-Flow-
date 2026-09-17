using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TrafficFlowGridlock.Progression;
using UnityEngine;
using UnityEngine.Events;

namespace TrafficFlowGridlock.Traffic
{
    public class TrafficBoardRuntime : MonoBehaviour
    {
        [Header("Board")]
        public int width = 9;
        public int height = 11;
        public float cellSize = 1f;

        public int Score { get; private set; }
        public int Combo { get; private set; }
        public int Moves { get; private set; }
        public int RemainingVehicles { get; private set; }

        public UnityEvent OnLevelComplete = new();
        public UnityEvent OnLevelFailed = new();
        public UnityEvent<string> OnStatus = new();

        RuntimeLevelInfo levelInfo;
        RoadGraph graph;
        readonly List<VehicleRuntime> vehicles = new();
        Transform vehicleRoot;

        public void LoadLevel(RuntimeLevelInfo info)
        {
            levelInfo = info;
            Score = 0;
            Combo = 0;
            Moves = 0;
            ClearBoard();

            var generator = new TrafficLevelGenerator(info.Seed, width, height);
            graph = generator.Generate(info, out var spawns, out _, out _);

            vehicleRoot = new GameObject("Vehicles").transform;
            vehicleRoot.SetParent(transform, false);

            foreach (var spawn in spawns)
            {
                var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
                go.transform.SetParent(vehicleRoot, false);
                go.transform.localScale = new Vector3(0.7f, 0.35f, spawn.Kind == VehicleKind.Bus ? 1.2f : 0.7f);
                go.transform.position = GridToWorld(spawn.Grid);
                var vr = go.AddComponent<VehicleRuntime>();
                vr.Initialize(spawn);
                vehicles.Add(vr);
            }

            RemainingVehicles = vehicles.Count(v => !v.Gone);
            OnStatus?.Invoke("Tap a vehicle to build the flow.");
        }

        void ClearBoard()
        {
            vehicles.Clear();
            if (vehicleRoot != null) Destroy(vehicleRoot.gameObject);
        }

        Vector3 GridToWorld(Vector2Int g) => new((g.x - width / 2f) * cellSize, 0.2f, (g.y - height / 2f) * cellSize);

        public void TryDispatch(VehicleRuntime vehicle)
        {
            if (vehicle == null || vehicle.Gone || levelInfo == null) return;
            if (!CanDispatch(vehicle))
            {
                Combo = 0;
                OnStatus?.Invoke("Route blocked — clear the lane first.");
                return;
            }

            var routeIndex = vehicle.Route.FindIndex(p => p == vehicle.Grid);
            if (routeIndex < 0) return;

            bool cleared = false;
            for (int i = routeIndex + 1; i < vehicle.Route.Count; i++)
            {
                var cell = vehicle.Route[i];
                if (IsBlocked(cell, vehicle)) break;
                vehicle.Grid = cell;
                vehicle.transform.position = GridToWorld(cell);
                Score += 25;
                var tile = graph.Get(cell);
                if (tile != null && (tile.Kind == TileKind.Exit || tile.Kind == TileKind.Parking))
                {
                    vehicle.Gone = true;
                    vehicle.gameObject.SetActive(false);
                    cleared = true;
                    break;
                }
            }

            Moves++;
            if (cleared)
            {
                Combo++;
                Score += 50 + Combo * 15;
                RemainingVehicles = vehicles.Count(v => !v.Gone);
                OnStatus?.Invoke("Flow released!");
            }
            else OnStatus?.Invoke("Vehicle advanced.");

            CheckComplete();
        }

        void CheckComplete()
        {
            RemainingVehicles = vehicles.Count(v => !v.Gone);
            if (Moves > levelInfo.MoveLimit)
            {
                OnStatus?.Invoke("Move limit reached.");
                OnLevelFailed?.Invoke();
                return;
            }

            if (RemainingVehicles == 0)
            {
                Score += levelInfo.BaseScore;
                if (Combo >= 3) Score += levelInfo.PerfectFlowBonus;
                OnStatus?.Invoke("Flow complete!");
                OnLevelComplete?.Invoke();
                return;
            }

            if (!AnyMovable())
            {
                OnStatus?.Invoke("Gridlock! Use a tow power-up or retry.");
            }
        }

        public void TowRemoveOne()
        {
            var target = vehicles.FirstOrDefault(v => !v.Gone);
            if (target == null) return;
            target.Gone = true;
            target.gameObject.SetActive(false);
            Combo = 0;
            Score += 40;
            RemainingVehicles = vehicles.Count(v => !v.Gone);
            OnStatus?.Invoke("Tow truck cleared a vehicle.");
            CheckComplete();
        }

        bool AnyMovable() => vehicles.Any(v => !v.Gone && CanDispatch(v));

        bool CanDispatch(VehicleRuntime vehicle)
        {
            var routeIndex = vehicle.Route.FindIndex(p => p == vehicle.Grid);
            if (routeIndex < 0) return false;
            for (int i = routeIndex + 1; i < vehicle.Route.Count; i++)
            {
                if (IsBlocked(vehicle.Route[i], vehicle)) return false;
            }
            return true;
        }

        bool IsBlocked(Vector2Int cell, VehicleRuntime self)
        {
            return vehicles.Any(v => !v.Gone && v != self && v.Grid == cell);
        }

        public IEnumerator ResumeFlowAfter(float seconds)
        {
            yield return new WaitForSeconds(seconds);
        }
    }
}
