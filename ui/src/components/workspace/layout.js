const GALLERY_MIN_HEIGHT = 176;
const GALLERY_MAX_HEIGHT = 440;
const PROMPT_MIN_HEIGHT = 168;
const PROMPT_MAX_HEIGHT = 420;
const PREVIEW_MIN_HEIGHT = 220;
const STACK_GAP = 12;
const RESIZE_CHROME_HEIGHT = 18;
const DOCK_SECTION_IDS = ["gallery", "prompt"];

function clampHeight(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function clampGalleryHeight(value) {
  return clampHeight(value, GALLERY_MIN_HEIGHT, GALLERY_MAX_HEIGHT);
}

export function clampPromptHeight(value) {
  return clampHeight(value, PROMPT_MIN_HEIGHT, PROMPT_MAX_HEIGHT);
}

export function measureUsableStackHeight(element) {
  const computedStyle = window.getComputedStyle(element);
  const verticalPadding =
    Number.parseFloat(computedStyle.paddingTop || "0") +
    Number.parseFloat(computedStyle.paddingBottom || "0");

  return Math.max(0, element.clientHeight - verticalPadding);
}

export function resolveDockHeights(
  containerHeight,
  sectionOrder,
  storedHeights,
) {
  const dockIds = sectionOrder.filter((id) => id !== "preview");

  if (!containerHeight || !dockIds.length) {
    return storedHeights;
  }

  const minimumHeights = {
    gallery: GALLERY_MIN_HEIGHT,
    prompt: PROMPT_MIN_HEIGHT,
  };
  const availableDockHeight =
    containerHeight -
    STACK_GAP * Math.max(sectionOrder.length - 1, 0) -
    RESIZE_CHROME_HEIGHT * dockIds.length -
    PREVIEW_MIN_HEIGHT;
  const desiredDockHeight = dockIds.reduce(
    (sum, id) => sum + storedHeights[id],
    0,
  );

  if (availableDockHeight >= desiredDockHeight) {
    return storedHeights;
  }

  const reducedHeights = { ...storedHeights };
  const totalSlack = dockIds.reduce(
    (sum, id) => sum + Math.max(0, storedHeights[id] - minimumHeights[id]),
    0,
  );
  const shortage = desiredDockHeight - Math.max(availableDockHeight, 0);

  if (totalSlack <= 0 || shortage >= totalSlack) {
    dockIds.forEach((id) => {
      reducedHeights[id] = minimumHeights[id];
    });
    return reducedHeights;
  }

  let remainingShortage = shortage;
  dockIds.forEach((id, index) => {
    const slack = Math.max(0, storedHeights[id] - minimumHeights[id]);
    const reduction =
      index === dockIds.length - 1
        ? remainingShortage
        : Math.min(
            remainingShortage,
            Math.round((shortage * slack) / totalSlack),
          );

    reducedHeights[id] = Math.max(
      minimumHeights[id],
      storedHeights[id] - reduction,
    );
    remainingShortage -= reduction;
  });

  return reducedHeights;
}

export { DOCK_SECTION_IDS, RESIZE_CHROME_HEIGHT };
