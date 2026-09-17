using System.Collections.Generic;
using UnityEngine;

namespace TrafficFlowGridlock.Traffic
{
    public class RoadGraph
    {
        public int Width { get; }
        public int Height { get; }
        readonly RoadTile[] tiles;

        public RoadGraph(int width, int height, RoadTile[] tiles)
        {
            Width = width;
            Height = height;
            this.tiles = tiles;
        }

        public int Count => tiles.Length;

        public RoadTile Get(Vector2Int grid)
        {
            if (grid.x < 0 || grid.y < 0 || grid.x >= Width || grid.y >= Height) return null;
            return tiles[grid.y * Width + grid.x];
        }

        public List<Vector2Int> BuildRoute(Vector2Int start, TrafficDirection startDir, bool parking, List<Vector2Int> goals, int maxSteps = 256)
        {
            if (goals == null || goals.Count == 0) return new List<Vector2Int> { start };

            var queue = new Queue<(Vector2Int pos, TrafficDirection dir, List<Vector2Int> path)>();
            var seen = new HashSet<string>();
            queue.Enqueue((start, startDir, new List<Vector2Int> { start }));

            while (queue.Count > 0)
            {
                var cur = queue.Dequeue();
                var key = $"{cur.pos.x},{cur.pos.y},{cur.dir},{cur.path.Count}";
                if (seen.Contains(key)) continue;
                seen.Add(key);

                foreach (var goal in goals)
                {
                    if (cur.pos == goal && cur.path.Count > 1)
                        return cur.path;
                }

                if (cur.path.Count >= maxSteps) continue;

                var tile = Get(cur.pos);
                if (tile == null || tile.Links.Count == 0) continue;

                foreach (var nextDir in tile.Links)
                {
                    if (!CanEnter(tile, cur.dir, nextDir)) continue;
                    var delta = Delta(nextDir);
                    var next = new Vector2Int(cur.pos.x + delta.x, cur.pos.y + delta.y);
                    var nextTile = Get(next);
                    if (nextTile == null || nextTile.Kind == TileKind.Grass) continue;
                    var path = new List<Vector2Int>(cur.path) { next };
                    queue.Enqueue((next, nextDir, path));
                }
            }

            return new List<Vector2Int> { start };
        }

        static bool CanEnter(RoadTile tile, TrafficDirection from, TrafficDirection to)
        {
            if (!tile.Links.Contains(to)) return false;
            if (tile.Kind == TileKind.Intersection || tile.Kind == TileKind.Parking) return true;
            return Opposite(to) == from || tile.Links.Count <= 2;
        }

        static TrafficDirection Opposite(TrafficDirection d) => d switch
        {
            TrafficDirection.N => TrafficDirection.S,
            TrafficDirection.S => TrafficDirection.N,
            TrafficDirection.E => TrafficDirection.W,
            _ => TrafficDirection.E
        };

        static Vector2Int Delta(TrafficDirection d) => d switch
        {
            TrafficDirection.N => new Vector2Int(0, -1),
            TrafficDirection.S => new Vector2Int(0, 1),
            TrafficDirection.E => new Vector2Int(1, 0),
            _ => new Vector2Int(-1, 0)
        };
    }
}
