type Options = {
  target: HTMLElement;
  hitTest: (event: PointerEvent) => string | null;
  onKeyChange: (id: string | null) => void;
  onTouchChange?: (active: boolean) => void;
  eventRoot?: Pick<Window, "addEventListener" | "removeEventListener">;
};

// A mouse can hover or rotate the board; a captured finger slides across its keys.
export function bindKeyboardPointers({
  target,
  hitTest,
  onKeyChange,
  onTouchChange,
  eventRoot = window,
}: Options) {
  let key: string | null = null;
  let touchId: number | null = null;
  let mouseStart: { x: number; y: number } | null = null;
  const isTouch = (event: PointerEvent) =>
    event.pointerType === "touch" || event.pointerType === "pen";

  const select = (id: string | null) => {
    target.style.cursor = id ? "pointer" : "grab";
    if (key === id) return;
    key = id;
    onKeyChange(id);
  };
  const releaseTouch = () => {
    const id = touchId;
    touchId = null;
    if (id === null) return;
    if (target.hasPointerCapture(id)) target.releasePointerCapture(id);
    onTouchChange?.(false);
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || touchId !== null) return;
    if (isTouch(event)) {
      if (!event.isPrimary) return;
      touchId = event.pointerId;
      onTouchChange?.(true);
      target.setPointerCapture(event.pointerId);
      event.preventDefault();
    } else mouseStart = { x: event.clientX, y: event.clientY };
    select(hitTest(event));
  };
  const move = (event: PointerEvent) => {
    if (touchId !== null && event.pointerId !== touchId) return;
    if (isTouch(event)) {
      if (touchId === null) return;
      event.preventDefault();
    } else if (
      mouseStart &&
      Math.hypot(event.clientX - mouseStart.x, event.clientY - mouseStart.y) > 5
    )
      return;
    select(hitTest(event));
  };
  const up = (event: PointerEvent) => {
    if (touchId !== null) {
      if (event.pointerId !== touchId) return;
      releaseTouch();
      select(null);
    }
    mouseStart = null;
  };
  const cancel = (event: PointerEvent) => {
    if (touchId !== null && event.pointerId !== touchId) return;
    releaseTouch();
    mouseStart = null;
    select(null);
  };
  const leave = () => {
    if (touchId === null) select(null);
  };
  const lostCapture = (event: PointerEvent) => {
    if (event.pointerId === touchId) cancel(event);
  };
  const blur = () => {
    releaseTouch();
    mouseStart = null;
    select(null);
  };

  // Capture phase disables OrbitControls before it claims a touch gesture.
  const capture = { capture: true };
  target.addEventListener("pointerdown", down, capture);
  target.addEventListener("pointermove", move, { passive: false });
  target.addEventListener("pointerleave", leave);
  target.addEventListener("lostpointercapture", lostCapture);
  eventRoot.addEventListener("pointerup", up);
  eventRoot.addEventListener("pointercancel", cancel);
  eventRoot.addEventListener("blur", blur);
  return () => {
    target.removeEventListener("pointerdown", down, capture);
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerleave", leave);
    target.removeEventListener("lostpointercapture", lostCapture);
    eventRoot.removeEventListener("pointerup", up);
    eventRoot.removeEventListener("pointercancel", cancel);
    eventRoot.removeEventListener("blur", blur);
    releaseTouch();
  };
}
