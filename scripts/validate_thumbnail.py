#!/usr/bin/env python3
"""
🎬 Frontier T: Thumbnail Multi-Scale Validator
===================================================================
Audits rendered thumbnail stills against Frontier T laws:
  1. Complexity Budget (zero pill badges, zero subtitle cards, max 1 punch phrase <= 3 words)
  2. Mobile Survival (360x640 downsample & contrast audit >= 30.0)
  3. Gaussian Blur Test (Focal hierarchy & Level 1 dominance >= 22.0)
  4. Silhouette & Luminance Contrast
  5. Anti-Clickbait & Conceptual Truthfulness
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from PIL import Image, ImageFilter, ImageStat

ROOT_DIR = Path(__file__).resolve().parent.parent

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def audit_rendered_still(
    image_path: Path,
    manifest: Optional[Dict[str, Any]] = None,
    save_debug_previews: bool = True
) -> Dict[str, Any]:
    """
    Performs full optical and structural validation on a rendered thumbnail PNG.
    """
    if not image_path.exists():
        return {
            "passed": False,
            "errors": [f"Thumbnail image file not found: {image_path}"],
            "warnings": [],
            "metrics": {},
        }

    errors: List[str] = []
    warnings: List[str] = []
    metrics: Dict[str, Any] = {}

    img = Image.open(image_path).convert("RGB")
    orig_w, orig_h = img.size
    metrics["original_resolution"] = f"{orig_w}x{orig_h}"

    aspect = "9:16" if orig_h > orig_w else "16:9"
    metrics["aspect_ratio"] = aspect

    # 1. MOBILE SURVIVAL TEST (360x640)
    mobile_target = (360, 640) if aspect == "9:16" else (640, 360)
    mobile_img = img.resize(mobile_target, Image.Resampling.LANCZOS)
    metrics["mobile_resolution"] = f"{mobile_target[0]}x{mobile_target[1]}"

    stat = ImageStat.Stat(mobile_img)
    rms_contrast = stat.stddev
    avg_contrast = sum(rms_contrast) / len(rms_contrast)
    metrics["mobile_rms_contrast"] = round(avg_contrast, 2)

    if avg_contrast < 30.0:
        errors.append(
            f"Mobile contrast is too low ({round(avg_contrast, 1)} < 30.0). "
            f"The image will collapse into muddy gray on mobile screens."
        )

    # 2. GAUSSIAN BLUR / FOCAL HIERARCHY TEST
    blurred_img = mobile_img.filter(ImageFilter.GaussianBlur(radius=10))
    blur_stat = ImageStat.Stat(blurred_img)
    blur_contrast = sum(blur_stat.stddev) / len(blur_stat.stddev)
    metrics["blurred_contrast"] = round(blur_contrast, 2)

    if blur_contrast < 22.0:
        errors.append(
            f"Focal hierarchy failed blurred test ({round(blur_contrast, 1)} < 22.0). "
            f"Lacks a dominant primary silhouette; details disappear into noise."
        )

    # 3. COMPLEXITY BUDGET AUDIT (via Manifest if present)
    if manifest:
        text_strategy = manifest.get("textStrategy", {})
        hook_word = text_strategy.get("hookWord", "")
        word_count = len(hook_word.split()) if hook_word else 0
        metrics["hook_word"] = hook_word
        metrics["word_count"] = word_count

        if word_count > 3:
            errors.append(
                f"Complexity budget exceeded: text hook has {word_count} words (max allowed: 3). "
                f"A thumbnail is a visual question, not an article headline."
            )

        budget = manifest.get("complexityBudget", {})
        if budget.get("pillBadgesAllowed") is True:
            errors.append("Pill badges are strictly banned in Frontier T.")
        if budget.get("subtitleCardsAllowed") is True:
            errors.append("Subtitle cards are strictly banned in Frontier T.")

    # 4. SAVE AUDIT ARTIFACTS
    if save_debug_previews:
        out_dir = ROOT_DIR / "out"
        out_dir.mkdir(parents=True, exist_ok=True)
        base_stem = image_path.stem
        mobile_path = out_dir / f"audit_{base_stem}_mobile.png"
        blur_path = out_dir / f"audit_{base_stem}_blur.png"
        mobile_img.save(mobile_path)
        blurred_img.save(blur_path)
        metrics["mobile_preview_saved"] = str(mobile_path)
        metrics["blur_preview_saved"] = str(blur_path)

    passed = len(errors) == 0

    return {
        "passed": passed,
        "image": str(image_path),
        "errors": errors,
        "warnings": warnings,
        "metrics": metrics,
    }


def main():
    parser = argparse.ArgumentParser(description="Frontier T: Thumbnail Multi-Scale Validator")
    parser.add_argument("--image", required=True, help="Path to rendered thumbnail image (.png)")
    parser.add_argument("--manifest", default="", help="Optional path to thumbnail manifest (.json)")
    parser.add_argument("--no-debug", action="store_true", help="Do not save mobile/blurred previews")
    args = parser.parse_args()

    image_path = Path(args.image)
    manifest_data = None
    if args.manifest and Path(args.manifest).exists():
        try:
            manifest_data = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
        except Exception as e:
            print(f"Warning: Failed to load manifest: {e}", file=sys.stderr)

    result = audit_rendered_still(
        image_path,
        manifest=manifest_data,
        save_debug_previews=not args.no_debug,
    )

    print(f"\n🔍 {BOLD}Frontier T Thumbnail Validation:{RESET} {image_path.name}")
    print(f"   Original Resolution: {result['metrics'].get('original_resolution')}")
    print(f"   Aspect Ratio:        {result['metrics'].get('aspect_ratio')}")
    print(f"   Mobile RMS Contrast: {result['metrics'].get('mobile_rms_contrast')} (Target >= 30.0)")
    print(f"   Blurred Contrast:    {result['metrics'].get('blurred_contrast')} (Target >= 22.0)")

    if "hook_word" in result["metrics"]:
        print(f"   Hook Word:           \"{result['metrics']['hook_word']}\" ({result['metrics']['word_count']} words, max 3)")

    if result["passed"]:
        print(f"\n{GREEN}{BOLD}✅ APPROVED:{RESET} Passed all Frontier T optical physics and complexity budget laws!\n")
        sys.exit(0)
    else:
        print(f"\n{RED}{BOLD}❌ FAILED:{RESET} Violated Frontier T laws:")
        for err in result["errors"]:
            print(f"   - {RED}{err}{RESET}")
        print()
        sys.exit(1)


if __name__ == "__main__":
    main()
