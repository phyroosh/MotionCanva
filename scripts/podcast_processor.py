#!/usr/bin/env python3
"""
MotionCanva Podcast Processor & Topic Extractor
Extracts transcript, metadata, and chapters from podcast/video URLs (YouTube)
without downloading video/audio (zero-download captions via youtube-transcript-api / yt-dlp).
Distills high-impact Short/Reel topics and registers them to data/topics_queue.json.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR / "scripts"))

import topic_queue


def extract_youtube_id(url: str) -> Optional[str]:
    """Extracts 11-character YouTube video ID from various URL formats."""
    patterns = [
        r"(?:v=|\/v\/|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})",
        r"^([a-zA-Z0-9_-]{11})$"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def fetch_metadata_ytdlp(url: str) -> Dict[str, Any]:
    """
    Fetches video metadata (title, description, chapters, duration, uploader)
    using yt-dlp --dump-json --skip-download (0 bytes of media downloaded).
    """
    cmd = [
        "yt-dlp",
        "--dump-json",
        "--skip-download",
        "--no-playlist",
        url
    ]
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=35)
        if proc.returncode == 0 and proc.stdout.strip():
            raw = json.loads(proc.stdout.strip().split("\n")[0])
            chapters = []
            if "chapters" in raw and raw["chapters"]:
                for ch in raw["chapters"]:
                    chapters.append({
                        "title": ch.get("title", "").strip(),
                        "start_time": ch.get("start_time", 0),
                        "end_time": ch.get("end_time", 0)
                    })

            return {
                "id": raw.get("id", ""),
                "title": raw.get("title", "Podcast Episode"),
                "uploader": raw.get("uploader", raw.get("channel", "Unknown Creator")),
                "description": raw.get("description", ""),
                "duration": raw.get("duration", 0),
                "chapters": chapters,
                "webpage_url": raw.get("webpage_url", url)
            }
    except Exception as e:
        print(f"[PodcastProcessor] Notice: yt-dlp metadata dump notice: {e}", file=sys.stderr)

    return {
        "id": extract_youtube_id(url) or "",
        "title": "Podcast Episode",
        "uploader": "Unknown Creator",
        "description": "",
        "duration": 0,
        "chapters": [],
        "webpage_url": url
    }


def fetch_transcript_api(video_id: str) -> Optional[List[Dict[str, Any]]]:
    """
    Fast zero-download transcript retrieval using youtube-transcript-api.
    Returns list of dicts: [{'text': ..., 'start': ..., 'duration': ...}, ...]
    """
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        api = YouTubeTranscriptApi()
        transcript = api.fetch(video_id, languages=["en", "en-US", "en-GB"])
        snippets = []
        for item in transcript.snippets:
            snippets.append({
                "text": item.text.replace("\n", " ").strip(),
                "start": item.start,
                "duration": item.duration
            })
        if snippets:
            return snippets
    except Exception as e:
        print(f"[PodcastProcessor] youtube-transcript-api notice: {e}", file=sys.stderr)
    return None


def parse_vtt(vtt_content: str) -> List[Dict[str, Any]]:
    """Simple parser for WebVTT subtitle files downloaded by yt-dlp."""
    snippets = []
    blocks = re.split(r"\n\s*\n", vtt_content)
    time_pat = re.compile(r"(\d{2}:\d{2}(?::\d{2})?\.\d{3})\s*-->\s*(\d{2}:\d{2}(?::\d{2})?\.\d{3})")

    def time_to_sec(t_str: str) -> float:
        parts = t_str.split(":")
        if len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
        elif len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        return 0.0

    for block in blocks:
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        for idx, line in enumerate(lines):
            m = time_pat.search(line)
            if m:
                start = time_to_sec(m.group(1))
                end = time_to_sec(m.group(2))
                text_lines = lines[idx+1:]
                clean_text = " ".join(text_lines)
                clean_text = re.sub(r"<[^>]+>", "", clean_text)  # Remove formatting tags
                clean_text = clean_text.strip()
                if clean_text:
                    snippets.append({
                        "text": clean_text,
                        "start": start,
                        "duration": max(0.1, end - start)
                    })
                break
    return snippets


def fetch_transcript_ytdlp_subs(url: str) -> Optional[List[Dict[str, Any]]]:
    """
    Fallback subtitle extraction using yt-dlp --write-auto-subs --skip-download.
    Zero video/audio download bandwidth.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        out_tpl = os.path.join(tmpdir, "sub_%(id)s.%(ext)s")
        cmd = [
            "yt-dlp",
            "--skip-download",
            "--write-auto-subs",
            "--write-subs",
            "--sub-langs", "en.*,en",
            "--sub-format", "vtt",
            "-o", out_tpl,
            url
        ]
        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=40)
            for p in Path(tmpdir).glob("*.vtt"):
                content = p.read_text(encoding="utf-8", errors="ignore")
                snippets = parse_vtt(content)
                if snippets:
                    return snippets
        except Exception as e:
            print(f"[PodcastProcessor] yt-dlp subtitle fetch notice: {e}", file=sys.stderr)
    return None


def query_gemini_direct(url: str, max_topics: int = 5) -> Optional[List[Dict[str, Any]]]:
    """
    Tier 1 Direct Content Processing:
    Queries Gemini directly using YouTube URL if GEMINI_API_KEY is available.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return None

    try:
        # Check for google-genai
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = (
            f"You are a master motion design script director. Analyze this YouTube video: {url}.\n"
            f"Extract exactly {max_topics} distinct, high-impact, contrarian topics suitable for 30-45s vertical reels.\n"
            f"For each topic, provide a JSON array of objects with keys:\n"
            f"- 'title': punchy topic title (max 7 words)\n"
            f"- 'channel_tag': one of '{{Health}}', '{{Finance}}', '{{Self Improvement}}', '{{Technology}}'\n"
            f"- 'summary': 1-2 sentence core insight\n"
            f"- 'hook_idea': a 20-year veteran zero-second hook (inverted truth or negative constraint)\n"
            f"Respond ONLY with valid JSON."
        )
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt]
        )
        text = response.text.strip()
        # Extract json block
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            data = json.loads(match.group(0))
            if isinstance(data, list) and len(data) > 0:
                print("✨ Successfully extracted topics via direct Gemini video reasoning!")
                return data
    except Exception as e:
        print(f"[PodcastProcessor] Gemini direct access notice: {e}", file=sys.stderr)

    return None


def detect_channel_tag(text: str) -> str:
    lower = text.lower()
    finance_keywords = ["money", "wealth", "invest", "dollar", "portfolio", "stock", "compound", "rich", "income", "capital", "budget", "crypto", "business"]
    health_keywords = ["cortisol", "circadian", "sleep", "melatonin", "dopamine", "neuro", "brain", "gut", "metabolism", "testosterone", "calorie", "fasting", "hormone", "hrv", "stress"]
    tech_keywords = ["quantum", "code", "software", "algorithm", "ai", "hardware", "compute", "model", "server", "latency", "chip", "gpu", "network"]

    fin_score = sum(1 for k in finance_keywords if k in lower)
    health_score = sum(1 for k in health_keywords if k in lower)
    tech_score = sum(1 for k in tech_keywords if k in lower)

    if tech_score > max(fin_score, health_score):
        return "{Technology}"
    if fin_score > health_score and fin_score >= 2:
        return "{Finance}"
    if health_score >= 2:
        return "{Health}"
    return "{Self Improvement}"


def clean_topic_title(raw_title: str) -> str:
    """Refines chapter or topic titles into crisp high-impact headlines."""
    clean = re.sub(r"^\d+[\s:.-]+\d*\s*", "", raw_title)
    clean = re.sub(r"^chapter\s*\d+\s*:?\s*", "", clean, flags=re.IGNORECASE)
    clean = re.sub(r"[#|\[\](){}]", "", clean)
    clean = re.sub(r"\s+", " ", clean).strip()

    words = clean.split()
    if words and words[0].islower():
        clean = clean.title()

    if len(words) == 1:
        clean = f"The {clean} Paradox"

    return clean[:60].strip()


def synthesize_hook_from_text(title: str, text: str, tag: str) -> str:
    """Synthesizes a 20-year veteran zero-second hook based on domain."""
    lower_title = title.lower()
    if "{Health}" in tag or any(k in lower_title for k in ["dopamine", "sleep", "cortisol", "stress", "diet"]):
        return f"The standard advice on {title.lower()} doesn't heal your biology; it triggers rapid receptor burnout."
    elif "{Finance}" in tag or any(k in lower_title for k in ["money", "wealth", "invest"]):
        return f"If you measure wealth by your current bank balance, you are mathematically misunderstanding leverage."
    elif "{Technology}" in tag:
        return f"The real bottleneck in {title.lower()} isn't computing power; it operates in the physical laws of entropy."
    else:
        return f"Most people fail at {title.lower()} because they push harder against the wrong constraint."


def distill_topics_from_transcript(
    metadata: Dict[str, Any],
    snippets: List[Dict[str, Any]],
    max_topics: int = 5
) -> List[Dict[str, Any]]:
    """
    Distills high-impact Short/Reel topics from metadata chapters and timed transcript.
    """
    extracted_topics = []
    seen_titles = set()

    full_transcript = " ".join(s["text"] for s in snippets)
    podcast_title = metadata.get("title", "")
    source_url = metadata.get("webpage_url", "")
    chapters = metadata.get("chapters", [])

    # 1. Distill from Chapters (Editorial gold standard)
    for ch in chapters:
        ch_title = ch.get("title", "").strip()
        if not ch_title or len(ch_title) < 4:
            continue
        lower_ch = ch_title.lower()
        if any(skip in lower_ch for skip in ["intro", "outro", "sponsor", "welcome", "subscribe", "q&a", "wrap up", "conclusion"]):
            continue

        topic_title = clean_topic_title(ch_title)
        if topic_title.lower() in seen_titles:
            continue
        seen_titles.add(topic_title.lower())

        start_t = ch.get("start_time", 0)
        end_t = ch.get("end_time", start_t + 180)
        ch_text = " ".join(s["text"] for s in snippets if start_t <= s.get("start", 0) <= end_t)
        if not ch_text:
            ch_text = full_transcript[:1000]

        tag = detect_channel_tag(topic_title + " " + ch_text[:400])

        summary = f"Deconstructs {topic_title.lower()} and reveals the counterintuitive mechanism driving it."
        if len(ch_text) > 80:
            first_sentence = re.split(r"[.!?]", ch_text)[0].strip()
            if len(first_sentence) > 20:
                summary = first_sentence[:120] + "."

        hook_idea = synthesize_hook_from_text(topic_title, ch_text, tag)

        extracted_topics.append({
            "title": topic_title,
            "channel_tag": tag,
            "full_topic": f"{tag} {topic_title}",
            "summary": summary,
            "hook_idea": hook_idea,
            "source_url": source_url,
            "source_title": podcast_title
        })

        if len(extracted_topics) >= max_topics:
            break

    # 2. If chapters yielded fewer than 3 topics, detect semantic psychological/biological themes
    if len(extracted_topics) < 3:
        theme_detectors = [
            ("The Dopamine Tolerance Trap", "{Health}", ["dopamine", "pleasure", "reward", "motivation", "addiction", "phone"], "How constant micro-stimulation blunts dopamine receptor sensitivity.", "Dopamine detoxing doesn't reset your brain; it was a Silicon Valley myth invented in 2019."),
            ("The 2 AM Cortisol Inversion", "{Health}", ["cortisol", "stress", "sleep", "wake", "circadian", "night"], "Why late-night light exposure flips the natural biological stress curve.", "Zero stress doesn't create peace; it creates biological atrophy and neuro-degeneration."),
            ("The Compounding Leverage Law", "{Finance}", ["compound", "invest", "money", "growth", "wealth", "asset"], "Why linear effort fails to predict exponential compounding returns.", "The top 1% never work harder; they operate strictly on compounding leverage."),
            ("The Attention Defense System", "{Self Improvement}", ["focus", "distraction", "friction", "deep work", "attention"], "Why willpower cannot overcome broken environmental cues without physical friction.", "If you rely on discipline to resist distraction, you are chemically losing the battle."),
            ("The Architecture of Latency", "{Technology}", ["latency", "compute", "network", "cache", "scale", "system"], "How distributed systems collapse under micro-friction and memory bottlenecks.", "A four-millisecond delay in network roundtrip costs 1.6 billion dollars annually.")
        ]

        for title, tag, keywords, default_summary, default_hook in theme_detectors:
            if any(k in full_transcript.lower() for k in keywords):
                if title.lower() not in seen_titles:
                    seen_titles.add(title.lower())
                    extracted_topics.append({
                        "title": title,
                        "channel_tag": tag,
                        "full_topic": f"{tag} {title}",
                        "summary": default_summary,
                        "hook_idea": default_hook,
                        "source_url": source_url,
                        "source_title": podcast_title
                    })
            if len(extracted_topics) >= max_topics:
                break

    # 3. Fallback: Distill primary thesis from video title
    if not extracted_topics and podcast_title:
        base_title = clean_topic_title(podcast_title)
        tag = detect_channel_tag(podcast_title + " " + full_transcript[:500])
        extracted_topics.append({
            "title": base_title,
            "channel_tag": tag,
            "full_topic": f"{tag} {base_title}",
            "summary": f"Key actionable protocol and mental model deconstructed from {podcast_title}.",
            "hook_idea": synthesize_hook_from_text(base_title, full_transcript, tag),
            "source_url": source_url,
            "source_title": podcast_title
        })

    return extracted_topics


def process_podcast(
    url: str,
    store: bool = True,
    max_topics: int = 5
) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    End-to-end podcast processing:
    1. Checks Gemini direct access
    2. Falls back to zero-download metadata & transcripts
    3. Distills high-impact reel topics
    4. Registers topics to data/topics_queue.json if store=True
    """
    print(f"\n🎙️ Processing Podcast Link: {url}")

    # Check Tier 1: Gemini Direct Video Reasoning
    gemini_topics = query_gemini_direct(url, max_topics=max_topics)
    if gemini_topics:
        metadata = fetch_metadata_ytdlp(url)
        formatted_topics = []
        for item in gemini_topics:
            tag = item.get("channel_tag", "{Self Improvement}")
            title = item.get("title", "Untitled Concept")
            formatted_topics.append({
                "title": title,
                "channel_tag": tag,
                "full_topic": f"{tag} {title}",
                "summary": item.get("summary", ""),
                "hook_idea": item.get("hook_idea", ""),
                "source_url": url,
                "source_title": metadata.get("title", "Podcast Episode")
            })
        if store:
            topic_queue.add_topics(formatted_topics)
        return metadata, formatted_topics

    # Tier 2: Zero-Download Metadata & Captions
    print("📡 Fetching video metadata and chapters (0 bytes media download)...")
    metadata = fetch_metadata_ytdlp(url)
    video_id = metadata.get("id") or extract_youtube_id(url)

    print(f"   🎬 Title:    {metadata.get('title')}")
    print(f"   👤 Creator:  {metadata.get('uploader')}")
    print(f"   ⏱️ Duration: {metadata.get('duration')}s | Chapters: {len(metadata.get('chapters', []))}")

    snippets = None
    if video_id:
        print("📝 Fetching timed transcript via YouTube Transcript API...")
        snippets = fetch_transcript_api(video_id)

    if not snippets:
        print("   ⚠️ Transcript API unavailable. Trying subtitle scrape fallback...")
        snippets = fetch_transcript_ytdlp_subs(url)

    if not snippets:
        print("   ℹ️ No automated captions found. Relying on chapters and metadata...")
        snippets = [{"text": metadata.get("description", ""), "start": 0, "duration": 10}]

    print(f"✨ Distilling top {max_topics} High-Retention Reel Topics...")
    topics = distill_topics_from_transcript(metadata, snippets, max_topics=max_topics)

    if store and topics:
        added = topic_queue.add_topics(topics)
        print(f"💾 Stored {len(added)} topics into local persistent queue (data/topics_queue.json).")

    return metadata, topics


def main():
    parser = argparse.ArgumentParser(description="MotionCanva Podcast Processor & Topic Extractor")
    parser.add_argument("--url", type=str, required=True, help="Podcast or YouTube URL")
    parser.add_argument("--max-topics", type=int, default=5, help="Maximum topics to extract")
    parser.add_argument("--store", action="store_true", default=True, help="Store topics into data/topics_queue.json")
    parser.add_argument("--no-store", dest="store", action="store_false", help="Do not store topics into queue")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    args = parser.parse_args()

    metadata, topics = process_podcast(args.url, store=args.store, max_topics=args.max_topics)

    if args.json:
        print(json.dumps({"metadata": metadata, "topics": topics}, indent=2))
    else:
        print("\n=======================================================")
        print(f"🔥 Extracted Reel Topics ({len(topics)} available):")
        print("=======================================================")
        for idx, t in enumerate(topics, 1):
            print(f"\n{idx}. {t['full_topic']}")
            print(f"   💡 Summary: {t['summary']}")
            print(f"   🪝 Hook:    \"{t['hook_idea']}\"")
        print("\n=======================================================")
        print("Ready for interactive selection via ask_question!")


if __name__ == "__main__":
    main()
