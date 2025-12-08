#!/usr/bin/env python3
"""
Subset Phosphor Icons font to only include used icons.
Reduces font size from ~147KB to ~15KB.
"""

import subprocess
import re
import os

# Icons used in the theme
USED_ICONS = [
    "arrow-counter-clockwise",
    "arrow-left",
    "arrow-right",
    "arrow-up",
    "arrows-counter-clockwise",
    "arrows-out",
    "article",
    "bag",
    "caret-down",
    "caret-left",
    "caret-right",
    "check",
    "check-circle",
    "copy",
    "facebook-logo",
    "file-text",
    "folder",
    "funnel",
    "gift",
    "headset",
    "house",
    "image",
    "instagram-logo",
    "key",
    "leaf",
    "link",
    "linkedin-logo",
    "list",
    "lock-simple",
    "magnifying-glass",
    "minus",
    "package",
    "paper-plane-tilt",
    "pinterest-logo",
    "play",
    "plus",
    "shield-check",
    "spinner",
    "squares-four",
    "star",
    "storefront",
    "tag",
    "tiktok-logo",
    "trash",
    "truck",
    "user",
    "video-camera",
    "wallet",
    "warning",
    "warning-circle",
    "x",
    "x-logo",
    "youtube-logo",
]

# Get directory paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "assets")
CSS_FILE = os.path.join(ASSETS_DIR, "phosphor-icons.css")
TTF_FILE = os.path.join(ASSETS_DIR, "pieces-Phosphor.ttf")
OUTPUT_TTF = os.path.join(ASSETS_DIR, "pieces-Phosphor-subset.ttf")
OUTPUT_WOFF2 = os.path.join(ASSETS_DIR, "pieces-Phosphor-subset.woff2")
OUTPUT_CSS = os.path.join(ASSETS_DIR, "phosphor-icons-subset.css")

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
    original_size = os.path.getsize(os.path.join(ASSETS_DIR, "pieces-Phosphor.woff2"))
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
    print("\nDone! Replace the original files with the subset versions.")

def generate_subset_css(unicode_map):
    """Generate CSS file with only the used icon definitions."""
    css_content = '''@font-face {
  font-family: "Phosphor";
  src:
    url("pieces-Phosphor-subset.woff2") format("woff2"),
    url("pieces-Phosphor-subset.ttf") format("truetype");
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
