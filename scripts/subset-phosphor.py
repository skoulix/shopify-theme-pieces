#!/usr/bin/env python3
"""
Subset Phosphor Icons font to only include used icons.
Reduces font size from ~147KB to ~15KB.
"""

import subprocess
import re
import os
import sys

# Add user's Python bin to PATH for pyftsubset
USER_PYTHON_BIN = os.path.expanduser("~/Library/Python/3.13/bin")
os.environ["PATH"] = USER_PYTHON_BIN + ":" + os.environ.get("PATH", "")

# Icons used in the theme
USED_ICONS = [
    # === EXISTING ICONS (53) ===
    # Arrows
    "arrow-counter-clockwise",
    "arrow-left",
    "arrow-right",
    "arrow-up",
    "arrows-counter-clockwise",
    "arrows-out",
    # Carets
    "caret-down",
    "caret-left",
    "caret-right",
    # Shopping
    "bag",
    "gift",
    "package",
    "percent",
    "storefront",
    "tag",
    "truck",
    "wallet",
    # User
    "user",
    "sign-out",
    "key",
    "lock-simple",
    # UI
    "check",
    "check-circle",
    "copy",
    "eye",
    "funnel",
    "list",
    "magnifying-glass",
    "magnifying-glass-plus",
    "minus",
    "plus",
    "squares-four",
    "spinner",
    "circle-notch",
    "trash",
    "x",
    # Media
    "image",
    "play",
    "video-camera",
    # Content
    "article",
    "file-text",
    "folder",
    # Status
    "warning",
    "warning-circle",
    "bell-ringing",
    # Time
    "calendar",
    "clock",
    # Social (existing)
    "facebook-logo",
    "instagram-logo",
    "linkedin-logo",
    "pinterest-logo",
    "tiktok-logo",
    "x-logo",
    "youtube-logo",
    # Communication
    "headset",
    "paper-plane-tilt",
    # Misc
    "fire",
    "heart",
    "house",
    "leaf",
    "lightning",
    "link",
    "ruler",
    "shield-check",
    "sparkle",
    "star",

    # === NEW ICONS (50) ===
    # Navigation
    "globe",
    "map-pin",
    "compass",
    "navigation-arrow",
    # Shopping (new)
    "shopping-cart",
    "credit-card",
    "bank",
    "receipt",
    "barcode",
    "qr-code",
    "coin",
    "money",
    # Communication (new)
    "envelope",
    "phone",
    "chat",
    "chat-dots",
    "whatsapp-logo",
    # Content (new)
    "quotes",
    # Media (new)
    "camera",
    "music-note",
    "pause",
    "stop",
    "microphone",
    # Actions
    "download",
    "upload",
    "share",
    "share-network",
    "bookmark",
    "flag",
    "bell",
    "pencil",
    # Status (new)
    "info",
    "question",
    "hourglass",
    "circle",
    "prohibit",
    # Fashion/Products
    "t-shirt",
    "dress",
    "sneaker",
    "handbag",
    "watch",
    "diamond",
    # UI (new)
    "sliders",
    "sliders-horizontal",
    "gear",
    "dots-three",
    "dots-three-vertical",
    "equals",
    "scales",
    "sidebar",
    # Misc (new)
    "sun",
    "moon",
    "star-half",
    "certificate",
    "crown",
    "globe-simple",
    "star-four",

    # === FEATURES GRID & TEMPLATES ===
    # Features Grid section icons
    "chat-circle",
    "medal",
    "recycle",
    "hand-heart",
    "users",
    "chart-line-up",
    "target",
    "rocket",
    "code",
    "paint-brush",
    "wrench",
    # Template-specific icons
    "mountains",
    "flask",
    "eye-closed",
    "hand-pointing",
    "arrows-clockwise",
]

# Fill icons (use ph-fill class)
USED_FILL_ICONS = [
    "heart",
    "star",
]

# Get directory paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ASSETS_DIR = os.path.join(PROJECT_DIR, "assets")
# Regular font paths
CSS_FILE = os.path.join(PROJECT_DIR, "node_modules/@phosphor-icons/web/src/regular/style.css")
TTF_FILE = os.path.join(PROJECT_DIR, "node_modules/@phosphor-icons/web/src/regular/Phosphor.ttf")
OUTPUT_TTF = os.path.join(ASSETS_DIR, "pieces-Phosphor.ttf")
OUTPUT_WOFF2 = os.path.join(ASSETS_DIR, "pieces-Phosphor.woff2")

# Fill font paths
FILL_CSS_FILE = os.path.join(PROJECT_DIR, "node_modules/@phosphor-icons/web/src/fill/style.css")
FILL_TTF_FILE = os.path.join(PROJECT_DIR, "node_modules/@phosphor-icons/web/src/fill/Phosphor-Fill.ttf")
OUTPUT_FILL_TTF = os.path.join(ASSETS_DIR, "pieces-Phosphor-Fill.ttf")
OUTPUT_FILL_WOFF2 = os.path.join(ASSETS_DIR, "pieces-Phosphor-Fill.woff2")

OUTPUT_CSS = os.path.join(ASSETS_DIR, "phosphor-icons.css.liquid")

def extract_unicode_map(css_file, is_fill=False):
    """Extract icon name to unicode mapping from CSS file."""
    with open(css_file, 'r') as f:
        content = f.read()

    # Pattern differs for regular vs fill
    if is_fill:
        # Pattern: .ph-fill.ph-icon-name:before { content: "\eXXX"; }
        pattern = r'\.ph-fill\.ph-([a-z0-9-]+):before\s*\{\s*content:\s*"\\([a-f0-9]+)"'
    else:
        # Pattern: .ph.ph-icon-name:before { content: "\eXXX"; }
        pattern = r'\.ph\.ph-([a-z0-9-]+):before\s*\{\s*content:\s*"\\([a-f0-9]+)"'

    matches = re.findall(pattern, content, re.IGNORECASE)
    return {name: code for name, code in matches}

def subset_font(icons, css_file, ttf_file, output_ttf, output_woff2, is_fill=False):
    """Subset a font to only include specified icons."""
    font_type = "Fill" if is_fill else "Regular"

    # Extract unicode mapping
    unicode_map = extract_unicode_map(css_file, is_fill)
    print(f"Found {len(unicode_map)} {font_type.lower()} icons in CSS")

    # Get unicode codepoints for used icons
    unicodes = []
    missing = []
    for icon in icons:
        if icon in unicode_map:
            unicodes.append(unicode_map[icon])
        else:
            missing.append(icon)

    if missing:
        print(f"Warning: Missing {font_type.lower()} icons: {missing}")

    if not unicodes:
        print(f"No {font_type.lower()} icons to subset, skipping...")
        return None

    print(f"Subsetting {font_type.lower()} font to {len(unicodes)} glyphs...")

    # Create unicodes string for pyftsubset
    unicode_str = ",".join([f"U+{code.upper()}" for code in unicodes])

    # Subset to TTF
    cmd = [
        "pyftsubset",
        ttf_file,
        f"--unicodes={unicode_str}",
        f"--output-file={output_ttf}",
        "--layout-features=liga",
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error subsetting {font_type.lower()} TTF: {result.stderr}")
        return None

    # Convert to woff2
    cmd_woff2 = [
        "pyftsubset",
        ttf_file,
        f"--unicodes={unicode_str}",
        f"--output-file={output_woff2}",
        "--flavor=woff2",
        "--layout-features=liga",
    ]

    result = subprocess.run(cmd_woff2, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error creating {font_type.lower()} woff2: {result.stderr}")
        return None

    return unicode_map

def main():
    print("Subsetting Phosphor Icons fonts...")
    print(f"Using {len(USED_ICONS)} regular icons + {len(USED_FILL_ICONS)} fill icons")

    # Subset regular font
    print("\n--- Regular Font ---")
    unicode_map = subset_font(
        USED_ICONS, CSS_FILE, TTF_FILE, OUTPUT_TTF, OUTPUT_WOFF2, is_fill=False
    )

    # Subset fill font (if any fill icons)
    fill_unicode_map = None
    if USED_FILL_ICONS:
        print("\n--- Fill Font ---")
        fill_unicode_map = subset_font(
            USED_FILL_ICONS, FILL_CSS_FILE, FILL_TTF_FILE, OUTPUT_FILL_TTF, OUTPUT_FILL_WOFF2, is_fill=True
        )

    # Get file sizes
    original_woff2 = os.path.join(PROJECT_DIR, "node_modules/@phosphor-icons/web/src/regular/Phosphor.woff2")
    original_size = os.path.getsize(original_woff2)
    new_size = os.path.getsize(OUTPUT_WOFF2)

    print(f"\n--- Results ---")
    print(f"Original regular woff2: {original_size / 1024:.1f} KB")
    print(f"Subset regular woff2: {new_size / 1024:.1f} KB")
    print(f"Reduction: {(1 - new_size / original_size) * 100:.1f}%")

    if fill_unicode_map and os.path.exists(OUTPUT_FILL_WOFF2):
        fill_size = os.path.getsize(OUTPUT_FILL_WOFF2)
        print(f"Subset fill woff2: {fill_size / 1024:.1f} KB")

    # Generate subset CSS
    generate_subset_css(unicode_map, fill_unicode_map)

    print(f"\nGenerated files:")
    print(f"  - {OUTPUT_TTF}")
    print(f"  - {OUTPUT_WOFF2}")
    if fill_unicode_map:
        print(f"  - {OUTPUT_FILL_TTF}")
        print(f"  - {OUTPUT_FILL_WOFF2}")
    print(f"  - {OUTPUT_CSS}")
    print("\nDone!")

def generate_subset_css(unicode_map, fill_unicode_map=None):
    """Generate CSS file with only the used icon definitions (Liquid template)."""
    css_content = '''@font-face {
  font-family: "Phosphor";
  src:
    url("{{ 'pieces-Phosphor.woff2' | asset_url }}") format("woff2"),
    url("{{ 'pieces-Phosphor.ttf' | asset_url }}") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.ph {
  font-family: "Phosphor" !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  letter-spacing: 0;
  -webkit-font-feature-settings: "liga";
  -moz-font-feature-settings: "liga";
  font-feature-settings: "liga";
  -webkit-font-variant-ligatures: discretionary-ligatures;
  font-variant-ligatures: discretionary-ligatures;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

'''

    # Add regular icon definitions
    for icon in sorted(USED_ICONS):
        if icon in unicode_map:
            css_content += f'.ph.ph-{icon}:before {{\n  content: "\\{unicode_map[icon]}";\n}}\n'

    # Add fill font if needed
    if fill_unicode_map and USED_FILL_ICONS:
        css_content += '''
@font-face {
  font-family: "Phosphor-Fill";
  src:
    url("{{ 'pieces-Phosphor-Fill.woff2' | asset_url }}") format("woff2"),
    url("{{ 'pieces-Phosphor-Fill.ttf' | asset_url }}") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.ph-fill {
  font-family: "Phosphor-Fill" !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  letter-spacing: 0;
  -webkit-font-feature-settings: "liga";
  -moz-font-feature-settings: "liga";
  font-feature-settings: "liga";
  -webkit-font-variant-ligatures: discretionary-ligatures;
  font-variant-ligatures: discretionary-ligatures;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

'''
        # Add fill icon definitions
        for icon in sorted(USED_FILL_ICONS):
            if icon in fill_unicode_map:
                css_content += f'.ph-fill.ph-{icon}:before {{\n  content: "\\{fill_unicode_map[icon]}";\n}}\n'

    with open(OUTPUT_CSS, 'w') as f:
        f.write(css_content)

if __name__ == "__main__":
    main()
