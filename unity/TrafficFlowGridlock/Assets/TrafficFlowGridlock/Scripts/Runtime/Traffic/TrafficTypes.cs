using System.Collections.Generic;
using UnityEngine;

namespace TrafficFlowGridlock.Traffic
{
    public enum TrafficDirection { N, E, S, W }

    public enum VehicleKind { Car, Taxi, Bus, Ambulance, Police, Tow, Van }

    public enum TileKind { Grass, Road, Exit, Parking, Intersection }

    public class RoadTile
    {
        public TileKind Kind;
        public List<TrafficDirection> Links = new();
    }

    public class VehicleSpawn
    {
        public int Id;
        public Vector2Int Grid;
        public TrafficDirection Direction;
        public VehicleKind Kind;
        public bool TargetParking;
        public List<Vector2Int> Route = new();
    }
}
