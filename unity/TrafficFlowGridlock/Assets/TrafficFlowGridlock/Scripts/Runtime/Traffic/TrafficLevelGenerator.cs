using System.Collections.Generic;
using TrafficFlowGridlock.Progression;
using UnityEngine;

namespace TrafficFlowGridlock.Traffic
{
    public class TrafficLevelGenerator
    {
        readonly int seed;
        readonly int width;
        readonly int height;
        System.Random rng;

        public TrafficLevelGenerator(int seed, int width, int height)
        {
            this.seed = seed;
            this.width = width;
            this.height = height;
            rng = new System.Random(seed);
        }

        public RoadGraph Generate(RuntimeLevelInfo info, out List<VehicleSpawn> spawns, out List<Vector2Int> exits, out List<Vector2Int> parking)
        {
            spawns = new List<VehicleSpawn>();
            exits = new List<Vector2Int>();
            parking = new List<Vector2Int>();

            var tiles = new RoadTile[width * height];
            for (int i = 0; i < tiles.Length; i++) tiles[i] = new RoadTile { Kind = TileKind.Grass };

            int midX = width / 2;
            int midY = height / 2;

            for (int x = 1; x < width - 1; x++) MarkRoad(tiles, x, midY, new[] { TrafficDirection.E, TrafficDirection.W }, TileKind.Road);
            for (int y = 1; y < height - 1; y++) MarkRoad(tiles, midX, y, new[] { TrafficDirection.N, TrafficDirection.S }, TileKind.Road);

            if (info.DynamicRoads)
            {
                int ringY = midY + (rng.Next(2) == 0 ? 2 : -2);
                if (ringY > 1 && ringY < height - 2)
                {
                    for (int x = 2; x < width - 2; x++) MarkRoad(tiles, x, ringY, new[] { TrafficDirection.E, TrafficDirection.W }, TileKind.Road);
                    MarkRoad(tiles, midX, ringY, new[] { TrafficDirection.N, TrafficDirection.S, TrafficDirection.E, TrafficDirection.W }, TileKind.Intersection);
                }
            }

            exits.Add(new Vector2Int(width - 1, midY));
            exits.Add(new Vector2Int(0, midY));
            if (info.Bridges) exits.Add(new Vector2Int(midX, 0));
            if (info.Tunnels) exits.Add(new Vector2Int(midX, height - 1));

            foreach (var ex in exits)
            {
                var dir = ex.x == 0 ? TrafficDirection.W : ex.x == width - 1 ? TrafficDirection.E : ex.y == 0 ? TrafficDirection.N : TrafficDirection.S;
                MarkRoad(tiles, ex.x, ex.y, new[] { Opposite(dir) }, TileKind.Exit);
            }

            var parkingCandidates = new List<Vector2Int>
            {
                new(midX - 2, midY - 2), new(midX + 2, midY - 2),
                new(midX - 2, midY + 2), new(midX + 2, midY + 2)
            };
            Shuffle(parkingCandidates);
            foreach (var p in parkingCandidates)
            {
                if (parking.Count >= info.ParkingSlots) break;
                if (p.x <= 0 || p.y <= 0 || p.x >= width - 1 || p.y >= height - 1) continue;
                MarkRoad(tiles, p.x, p.y, new[] { TrafficDirection.N, TrafficDirection.S, TrafficDirection.E, TrafficDirection.W }, TileKind.Parking);
                parking.Add(p);
            }

            for (int y = 0; y < height; y++)
            for (int x = 0; x < width; x++)
            {
                int idx = y * width + x;
                if (tiles[idx].Kind == TileKind.Road && tiles[idx].Links.Count > 2)
                    tiles[idx].Kind = TileKind.Intersection;
            }

            var graph = new RoadGraph(width, height, tiles);
            var roadCells = new List<Vector2Int>();
            for (int y = 0; y < height; y++)
            for (int x = 0; x < width; x++)
            {
                var k = tiles[y * width + x].Kind;
                if (k == TileKind.Road || k == TileKind.Intersection) roadCells.Add(new Vector2Int(x, y));
            }

            Shuffle(roadCells);
            int count = Mathf.Min(info.VehicleCount, roadCells.Count);
            for (int i = 0; i < count; i++)
            {
                var cell = roadCells[i];
                var tile = tiles[cell.y * width + cell.x];
                var dir = tile.Links[rng.Next(tile.Links.Count)];
                bool useParking = i % 3 == 0 && parking.Count > 0;
                var goals = useParking ? parking : exits;
                var route = graph.BuildRoute(cell, dir, useParking, goals);
                if (route.Count < 2) continue;

                spawns.Add(new VehicleSpawn
                {
                    Id = i + 1,
                    Grid = cell,
                    Direction = dir,
                    Kind = PickKind(info, i, count),
                    TargetParking = useParking,
                    Route = route
                });
            }

            return graph;
        }

        VehicleKind PickKind(RuntimeLevelInfo info, int index, int total)
        {
            if (info.MysteryVehicles && index == total - 1) return VehicleKind.Tow;
            var kinds = new[] { VehicleKind.Car, VehicleKind.Taxi, VehicleKind.Van, VehicleKind.Bus };
            return kinds[rng.Next(kinds.Length)];
        }

        void MarkRoad(RoadTile[] tiles, int x, int y, TrafficDirection[] links, TileKind kind)
        {
            int idx = y * width + x;
            var t = tiles[idx];
            foreach (var l in links) if (!t.Links.Contains(l)) t.Links.Add(l);
            if (t.Kind == TileKind.Grass) t.Kind = kind;
        }

        void Shuffle<T>(List<T> list)
        {
            for (int i = list.Count - 1; i > 0; i--)
            {
                int j = rng.Next(i + 1);
                (list[i], list[j]) = (list[j], list[i]);
            }
        }

        static TrafficDirection Opposite(TrafficDirection d) => d switch
        {
            TrafficDirection.N => TrafficDirection.S,
            TrafficDirection.S => TrafficDirection.N,
            TrafficDirection.E => TrafficDirection.W,
            _ => TrafficDirection.E
        };
    }
}
