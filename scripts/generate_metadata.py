#!/usr/bin/env python3
"""
YouTube Shorts High-CTR Viral Metadata Generator
Generates Title, 5-part Description, Hashtags, SEO Tags, and Pinned Comment
following the YouTube algorithm & RightClips standards.
"""

import argparse
import json
import os
import re
import sys

def sanitize_slug(name: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9_-]', '_', name.strip().lower())
    return re.sub(r'_+', '_', s).strip('_')

def generate_viral_title(topic: str) -> str:
    clean_topic = topic.strip().title()
    # High-converting hook patterns
    hooks = [
        f"Why {clean_topic} Actually Works 🧠 #Shorts",
        f"The Hidden Truth Behind {clean_topic} ⚡ #Shorts",
        f"What Nobody Tells You About {clean_topic} 🚀 #Shorts",
        f"Why You Struggle With {clean_topic} (And The Fix) 💡 #Shorts",
        f"The Real Secret Behind {clean_topic} 🧠 #Shorts",
    ]
    # Pick a strong title under 90 characters
    for h in hooks:
        if len(h) <= 90:
            return h
    return f"{clean_topic} In 30 Seconds 🧠 #Shorts"

def generate_5part_description(topic: str, script_text: str = "") -> str:
    clean_topic = topic.strip().title()
    topic_tag = re.sub(r'[^a-zA-Z0-9]', '', clean_topic)

    # Part 1: Hook / Tension
    part1 = f"Have you ever noticed how {clean_topic.lower()} completely shifts how your mind operates? Most people misunderstand the core mechanism and end up burning out."

    # Part 2: Insight / Reframe
    if script_text and len(script_text.strip()) > 30:
        first_few = " ".join(script_text.strip().split()[:25]) + "..."
        part2 = f"Here is the counterintuitive reality: {first_few}"
    else:
        part2 = f"The secret isn't pushing harder—it's understanding the exact balance between stimulus and recovery. When you calibrate the system, momentum takes over."

    # Part 3: Key Takeaway
    part3 = f"🔑 Key Takeaway: Real progress doesn't come from brute force. It comes from intentional tension followed by deliberate restoration."

    # Part 4: Closing Wisdom
    part4 = f"Start small today. Protect your focus, honor your rhythm, and watch your capacity compound. 🌱"

    # Part 5: Hashtags
    part5 = f"#Shorts #{topic_tag} #Psychology #Productivity #Mindset #SelfImprovement #PersonalGrowth #Neuroscience #Focus #LifeHacks"

    return f"{part1}\n\n{part2}\n\n{part3}\n\n{part4}\n\n{part5}"

def generate_tags(topic: str) -> list[str]:
    clean_topic = topic.strip().title()
    base = [
        "Shorts",
        "YouTube Shorts",
        clean_topic,
        f"{clean_topic} Explained",
        f"How {clean_topic} Works",
        "Productivity",
        "Mindset",
        "Psychology",
        "Personal Growth",
        "Self Improvement",
        "Mental Health",
        "Focus",
        "Daily Habits",
        "Life Hacks",
    ]
    # Deduplicate while preserving order
    seen = set()
    result = []
    for t in base:
        if t.lower() not in seen:
            seen.add(t.lower())
            result.append(t)
    return result

def generate_pinned_comment(topic: str) -> str:
    clean_topic = topic.strip().title()
    return f"📌 Question for you: What's your biggest obstacle when dealing with {clean_topic.lower()}? Drop your thought below 👇"

def build_metadata_package(topic: str, script_text: str = "", slug: str = "", category_id: str = "28") -> dict:
    if not slug:
        slug = sanitize_slug(topic)

    title = generate_viral_title(topic)
    description = generate_5part_description(topic, script_text)
    tags = generate_tags(topic)
    pinned_comment = generate_pinned_comment(topic)

    return {
        "slug": slug,
        "topic": topic.strip().title(),
        "title": title,
        "description": description,
        "tags": tags,
        "pinnedComment": pinned_comment,
        "categoryId": category_id,
        "privacyStatus": "public",
    }

def main():
    parser = argparse.ArgumentParser(description="YouTube Shorts Viral Metadata Generator")
    parser.add_argument("--topic", required=True, help="Topic of the video (e.g. 'Good vs Bad Stress')")
    parser.add_argument("--script", default="", help="Script or summary text")
    parser.add_argument("--slug", default="", help="Optional slug/filename (e.g. 'good_vs_bad_stress')")
    parser.add_argument("--category", default="28", help="YouTube Category ID (default: 28 for Tech/Science, 27 for Education)")
    parser.add_argument("--output", default="", help="Custom output json path")
    args = parser.parse_args()

    meta = build_metadata_package(args.topic, args.script, args.slug, args.category)
    slug = meta["slug"]

    # Target save paths
    out_dir = os.path.abspath("out")
    projects_dir = os.path.abspath("src/projects")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(projects_dir, exist_ok=True)

    out_file = args.output if args.output else os.path.join(out_dir, f"{slug}.json")
    proj_meta_file = os.path.join(projects_dir, f"{slug}.meta.json")

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    with open(proj_meta_file, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    print(f"✅ Generated YouTube Shorts metadata for: [{meta['topic']}]")
    print(f"📌 Title: {meta['title']}")
    print(f"📁 Saved to: {out_file}")
    print(f"📁 Mirrored to: {proj_meta_file}")

if __name__ == "__main__":
    main()
