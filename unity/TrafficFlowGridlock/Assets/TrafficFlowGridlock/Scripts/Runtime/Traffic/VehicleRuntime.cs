using System.Collections.Generic;
using UnityEngine;

namespace TrafficFlowGridlock.Traffic
{
    public class VehicleRuntime : MonoBehaviour
    {
        public int Id;
        public VehicleKind Kind;
        public Vector2Int Grid;
        public TrafficDirection Direction;
        public List<Vector2Int> Route = new();
        public bool Gone;
        public bool TargetParking;

        public void Initialize(VehicleSpawn spawn)
        {
            Id = spawn.Id;
            Kind = spawn.Kind;
            Grid = spawn.Grid;
            Direction = spawn.Direction;
            Route = new List<Vector2Int>(spawn.Route);
            TargetParking = spawn.TargetParking;
            Gone = false;
            name = $"Vehicle_{Id}_{Kind}";
        }
    }
}
