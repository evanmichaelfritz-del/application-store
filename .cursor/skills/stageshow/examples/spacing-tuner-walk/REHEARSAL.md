# Spacing tuner walkthrough

Gold copied: none. The scene is the store's `SpacingTuner` layout (`computeScene`, `frameAt`, tokens), drawn in the stage at the card's 1440×1080 design, scaled into 1280×800.

Changed: a cursor points at each chip while that variable's real clock runs (sidebar, padding, row gap, column gap, card padding), then the layout springs back at 9.1s, the same revert the tuner already does.

Not checked: phone width. The store calls phone widths a known gap. Chips are not buttons, matching the store mount (`interactive` defaults off).
