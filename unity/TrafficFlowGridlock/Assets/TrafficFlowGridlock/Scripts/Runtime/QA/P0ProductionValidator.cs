using System.Collections.Generic;
using TrafficFlowGridlock.Core;
using TrafficFlowGridlock.Progression;

namespace TrafficFlowGridlock.QA
{
    public readonly struct LevelValidationResult
    {
        public readonly int LevelId;
        public readonly bool Valid;
        public readonly string Message;

        public LevelValidationResult(int id, bool valid, string message)
        {
            LevelId = id;
            Valid = valid;
            Message = message;
        }
    }

    public static class P0ProductionValidator
    {
        public static IReadOnlyList<LevelValidationResult> ValidateAll()
        {
            var results = new List<LevelValidationResult>();
            var catalog = new RuntimeLevelCatalog();
            for (int id = 1; id <= catalog.TotalLevels; id++)
            {
                var info = catalog.Get(id);
                bool valid = info.VehicleCount >= 4 && info.VehicleCount <= 40
                    && info.MoveLimit > 0 && info.ParkingSlots > 0 && info.Seed != 0;
                results.Add(new LevelValidationResult(id, valid, valid ? "OK" : "Invalid level configuration"));
            }
            return results;
        }
    }
}
