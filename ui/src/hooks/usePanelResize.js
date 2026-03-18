export function usePanelResize({
  leftSidebarWidth,
  rightSidebarWidth,
  setLeftSidebarWidth,
  setRightSidebarWidth,
  minSidebarWidth = 220,
  maxSidebarWidth = 520,
}) {
  const clampSidebarWidth = (value) =>
    Math.min(maxSidebarWidth, Math.max(minSidebarWidth, value));

  const startResize = (side) => (event) => {
    event.preventDefault();

    const startX = event.clientX;
    const initialWidth = side === "left" ? leftSidebarWidth : rightSidebarWidth;

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;

      if (side === "left") {
        setLeftSidebarWidth(clampSidebarWidth(initialWidth + delta));
        return;
      }

      setRightSidebarWidth(clampSidebarWidth(initialWidth - delta));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { startResize };
}
