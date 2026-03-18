# UI Manual Checklist

Use this after layout or interaction changes in `ui/src`.

## Test Setup

1. Launch the app from the repo root with `python dev.py`.
2. Use the app in these window sizes:
   - `1600x900`
   - `1280x800`
   - `1100x720`
3. At each size, record only clear pass/fail results.
4. When something fails, note the exact size, section, and action that caused it.

## Workspace Layout

Pass if all of these stay true at every test size:

1. Preview is the most visually dominant panel.
2. The full shell fits in the window without bottom clipping.
3. Gallery scrolls inside its own panel instead of increasing page height.
4. Prompt panel stays fully usable and its action rail remains aligned.
5. Left, center, and right columns remain balanced instead of collapsing hard to the left.
6. Resize handles are visible before hover and easy to target.

## Drag And Resize

Pass if all of these stay true at every test size:

1. Gallery and Prompt can reorder.
2. Preview does not move.
3. Drag only begins when clearly intended from the grip area.
4. Resize handles adjust panel height without fighting scroll or text selection.
5. Gallery can shrink to roughly one visible row of thumbnails but not disappear.
6. Prompt can shrink without hiding the Generate control.

## Persistence

Pass if all of these stay true after a refresh or relaunch:

1. Dock order is preserved.
2. Gallery height is preserved.
3. Prompt height is preserved.
4. Sidebar section order and collapse state are preserved.

## Content States

Check these with both empty and populated content when possible:

1. Empty gallery state reads cleanly and does not distort layout.
2. Selected gallery item is immediately obvious.
3. Long prompts remain readable without breaking the panel.
4. Non-image or non-previewable results still render sensibly in the gallery list.
5. Timestamp, label, and selection affordances remain legible at smaller sizes.

## Report Format

Use this format when reporting issues back:

```text
- Fail: 1100x720 / workspace / gallery resize
	Result: bottom of prompt panel clips out of view after shrinking gallery twice.

- Fail: 1280x800 / drag / prompt reorder
	Result: prompt starts dragging while trying to select text near the grip.
```

If every item passes, report: `Manual QA passed at 1600x900, 1280x800, and 1100x720.`
