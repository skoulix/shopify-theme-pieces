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
    "minus",
    "plus",
    "squares-four",
    "spinner",
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
    "gear",
    "dots-three",
    "dots-three-vertical",
    "equals",
    "sidebar",
    # Misc (new)
    "sun",
    "moon",
    "star-half",
    "certificate",
    "crown",
    "globe-simple",
]

# Get directory paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ASSETS_DIR = os.path.join(PROJECT_DIR, "assets")
CSS_FILE = os.path.join(PROJECT_DIR, "node_modules/@phosphor-icons/web/src/regular/style.css")
# Use full font from node_modules for subsetting
TTF_FILE = os.path.join(PROJECT_DIR, "node_modules/@phosphor-icons/web/src/regular/Phosphor.ttf")
OUTPUT_TTF = os.path.join(ASSETS_DIR, "pieces-Phosphor.ttf")
OUTPUT_WOFF2 = os.path.join(ASSETS_DIR, "pieces-Phosphor.woff2")
OUTPUT_CSS = os.path.join(ASSETS_DIR, "phosphor-icons.css")

def extract_unicode_map(css_file):
    """Extract icon name to unicode mapping from CSS file."""
    with open(css_file, 'r') as f:
        content = f.read()

    # Pattern to match: .ph.ph-icon-name:before { content: "\eXXX"; }
    pattern = r'\.ph\.ph-([a-z0-9-]+):before\s*\{\s*content:\s*"\\([a-f0-9]+)"'
    matches = re.findall(pattern, content, re.IGNORECASE)

    return {name: code for name, code in matches}

def main():
    print("Subsetting Phosphor Icons font...")
    print(f"Using {len(USED_ICONS)} icons out of ~1,500")

    # Extract unicode mapping
    unicode_map = extract_unicode_map(CSS_FILE)
    print(f"Found {len(unicode_map)} icons in CSS")

    # Get unicode codepoints for used icons
    unicodes = []
    missing = []
    for icon in USED_ICONS:
        if icon in unicode_map:
            unicodes.append(unicode_map[icon])
        else:
            missing.append(icon)

    if missing:
        print(f"Warning: Missing icons: {missing}")

    print(f"Subsetting to {len(unicodes)} glyphs...")

    # Create unicodes string for pyftsubset
    unicode_str = ",".join([f"U+{code.upper()}" for code in unicodes])

    # Subset the font using pyftsubset
    cmd = [
        "pyftsubset",
        TTF_FILE,
        f"--unicodes={unicode_str}",
        f"--output-file={OUTPUT_TTF}",
        "--layout-features=liga",
    ]

    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return

    # Convert to woff2
    cmd_woff2 = [
        "pyftsubset",
        TTF_FILE,
        f"--unicodes={unicode_str}",
        f"--output-file={OUTPUT_WOFF2}",
        "--flavor=woff2",
        "--layout-features=liga",
    ]

    print(f"Creating woff2...")
    result = subprocess.run(cmd_woff2, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error creating woff2: {result.stderr}")
        return

    # Get file sizes
    original_woff2 = os.path.join(PROJECT_DIR, "node_modules/@phosphor-icons/web/src/regular/Phosphor.woff2")
    original_size = os.path.getsize(original_woff2)
    new_size = os.path.getsize(OUTPUT_WOFF2)

    print(f"\nOriginal woff2: {original_size / 1024:.1f} KB")
    print(f"Subset woff2: {new_size / 1024:.1f} KB")
    print(f"Reduction: {(1 - new_size / original_size) * 100:.1f}%")

    # Generate subset CSS
    generate_subset_css(unicode_map)

    print(f"\nGenerated files:")
    print(f"  - {OUTPUT_TTF}")
    print(f"  - {OUTPUT_WOFF2}")
    print(f"  - {OUTPUT_CSS}")
    print("\nDone!")

def generate_subset_css(unicode_map):
    """Generate CSS file with only the used icon definitions."""
    css_content = '''@font-face {
  font-family: "Phosphor";
  src:
    url("pieces-Phosphor.woff2") format("woff2"),
    url("pieces-Phosphor.ttf") format("truetype");
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

    # Add icon definitions
    for icon in sorted(USED_ICONS):
        if icon in unicode_map:
            css_content += f'.ph.ph-{icon}:before {{\n  content: "\\{unicode_map[icon]}";\n}}\n'

    with open(OUTPUT_CSS, 'w') as f:
        f.write(css_content)

if __name__ == "__main__":
    main()
