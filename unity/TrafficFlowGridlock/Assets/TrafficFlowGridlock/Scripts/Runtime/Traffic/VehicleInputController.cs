using UnityEngine;

namespace TrafficFlowGridlock.Traffic
{
    public class VehicleInputController : MonoBehaviour
    {
        public TrafficBoardRuntime board;
        public Camera worldCamera;

        void Update()
        {
            if (board == null) return;
            if (!Input.GetMouseButtonDown(0)) return;
            var cam = worldCamera != null ? worldCamera : Camera.main;
            if (cam == null) return;
            var ray = cam.ScreenPointToRay(Input.mousePosition);
            if (!Physics.Raycast(ray, out var hit, 200f)) return;
            var vehicle = hit.collider.GetComponent<VehicleRuntime>();
            if (vehicle != null) board.TryDispatch(vehicle);
        }
    }
}
