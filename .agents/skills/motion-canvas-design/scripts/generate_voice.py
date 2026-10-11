#!/usr/bin/env python3
"""
Microsoft Edge Neural Voiceover Generator for Motion Canvas.
Default Voice: en-US-AvaMultilingualNeural
Generates synchronized MP3 audio and millisecond-accurate JSON cue markers.
"""

import sys
import os
import argparse
import asyncio
import json

try:
    import edge_tts
except ImportError:
    print("Error: edge-tts is not installed. Install with `pip install edge-tts`", file=sys.stderr)
    sys.exit(1)

DEFAULT_VOICE = "en-US-AvaMultilingualNeural"
DEFAULT_AUDIO_OUT = "src/audio.mp3"
DEFAULT_CUES_OUT = "src/voice_cues.json"

async def generate_voice(
    text: str,
    voice: str = DEFAULT_VOICE,
    audio_out: str = DEFAULT_AUDIO_OUT,
    cues_out: str = DEFAULT_CUES_OUT,
    rate: str = "+0%",
    pitch: str = "+0Hz",
) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(audio_out)), exist_ok=True)
    if cues_out:
        os.makedirs(os.path.dirname(os.path.abspath(cues_out)), exist_ok=True)

    print(f"🎙️  Synthesizing Voiceover...")
    print(f"   Voice: {voice}")
    print(f"   Output: {audio_out}")

    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    cues = []
    total_audio_bytes = 0

    with open(audio_out, "wb") as f_audio:
        async for chunk in communicate.stream():
            chunk_type = chunk["type"]
            if chunk_type == "audio":
                f_audio.write(chunk["data"])
                total_audio_bytes += len(chunk["data"])
            elif chunk_type == "SentenceBoundary":
                start_sec = round(chunk["offset"] / 10_000_000, 3)
                duration_sec = round(chunk["duration"] / 10_000_000, 3)
                end_sec = round(start_sec + duration_sec, 3)
                cues.append({
                    "text": chunk["text"],
                    "start": start_sec,
                    "duration": duration_sec,
                    "end": end_sec,
                })

    total_duration = cues[-1]["end"] if cues else 0.0

    if cues_out:
        cue_data = {
            "voice": voice,
            "total_duration": total_duration,
            "cues": cues,
        }
        with open(cues_out, "w", encoding="utf-8") as f_cues:
            json.dump(cue_data, f_cues, indent=2, ensure_ascii=False)
        print(f"   Cues:   {cues_out} ({len(cues)} segments)")

    print(f"✨ Synthesis Complete! Audio duration: ~{total_duration:.2f}s ({total_audio_bytes} bytes)\n")

def main():
    parser = argparse.ArgumentParser(
        description="Generate Microsoft Edge Neural Voiceover for Motion Canvas."
    )
    parser.add_argument(
        "text_input",
        nargs="?",
        help="Text to synthesize (or omit if using --file)",
    )
    parser.add_argument(
        "-f", "--file",
        dest="file_input",
        help="Path to text or markdown script file to synthesize",
    )
    parser.add_argument(
        "-v", "--voice",
        default=DEFAULT_VOICE,
        help=f"Edge TTS voice name (default: {DEFAULT_VOICE})",
    )
    parser.add_argument(
        "-o", "--output",
        default=DEFAULT_AUDIO_OUT,
        help=f"Destination audio path (default: {DEFAULT_AUDIO_OUT})",
    )
    parser.add_argument(
        "-c", "--cues",
        default=DEFAULT_CUES_OUT,
        help=f"Destination cue JSON path (default: {DEFAULT_CUES_OUT})",
    )
    parser.add_argument(
        "--rate",
        default="+0%",
        help="Speech rate modifier e.g. +10%% or -5%% (default: +0%%)",
    )
    parser.add_argument(
        "--pitch",
        default="+0Hz",
        help="Speech pitch modifier e.g. +5Hz (default: +0Hz)",
    )

    args = parser.parse_args()

    if args.file_input:
        with open(args.file_input, "r", encoding="utf-8") as f:
            text = f.read().strip()
    elif args.text_input:
        text = args.text_input.strip()
    else:
        parser.print_help()
        sys.exit(1)

    if not text:
        print("Error: Input text is empty.", file=sys.stderr)
        sys.exit(1)

    asyncio.run(
        generate_voice(
            text=text,
            voice=args.voice,
            audio_out=args.output,
            cues_out=args.cues,
            rate=args.rate,
            pitch=args.pitch,
        )
    )

if __name__ == "__main__":
    main()
