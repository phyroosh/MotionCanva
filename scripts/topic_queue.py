#!/usr/bin/env python3
"""
MotionCanva Topic Queue Manager
Manages local topic storage (data/topics_queue.json) for backlog topics
distilled from podcasts or provided for future Short/Reel production.
"""

import argparse
import datetime
import json
import os
import re
import sys
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
QUEUE_FILE = DATA_DIR / "topics_queue.json"


def ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not QUEUE_FILE.exists():
        initial_data = {
            "version": 1,
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "topics": []
        }
        with open(QUEUE_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_data, f, indent=2, ensure_ascii=False)


def load_queue() -> Dict[str, Any]:
    ensure_data_dir()
    try:
        with open(QUEUE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[TopicQueue] Warning: Error loading {QUEUE_FILE}: {e}", file=sys.stderr)
        return {"version": 1, "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "topics": []}


def save_queue(data: Dict[str, Any]):
    ensure_data_dir()
    data["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def normalize_tag(tag: str) -> str:
    tag = tag.strip()
    if not tag.startswith("{"):
        tag = "{" + tag
    if not tag.endswith("}"):
        tag = tag + "}"
    lower = tag.lower()
    if "self" in lower or "improve" in lower:
        return "{Self Improvement}"
    if "finan" in lower or "wealth" in lower or "money" in lower:
        return "{Finance}"
    if "health" in lower or "bio" in lower or "neuro" in lower:
        return "{Health}"
    if "tech" in lower or "code" in lower or "ai" in lower:
        return "{Technology}"
    return tag


def add_topic(
    title: str,
    channel_tag: str = "{Self Improvement}",
    summary: str = "",
    hook_idea: str = "",
    source_url: str = "",
    source_title: str = ""
) -> Dict[str, Any]:
    queue = load_queue()
    clean_tag = normalize_tag(channel_tag)
    clean_title = re.sub(r"^\{[^}]+\}\s*", "", title).strip()
    full_topic = f"{clean_tag} {clean_title}"

    # Check for existing duplicate by title
    for t in queue.get("topics", []):
        if t.get("title", "").strip().lower() == clean_title.lower():
            if t.get("status") == "pending":
                # Already pending in queue
                return t

    topic_id = f"topic_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    new_entry = {
        "id": topic_id,
        "title": clean_title,
        "channel_tag": clean_tag,
        "full_topic": full_topic,
        "summary": summary.strip(),
        "hook_idea": hook_idea.strip(),
        "source_url": source_url.strip(),
        "source_title": source_title.strip(),
        "status": "pending",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "completed_at": None,
        "project_slug": None
    }
    queue.setdefault("topics", []).append(new_entry)
    save_queue(queue)
    return new_entry


def add_topics(topics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    added = []
    for item in topics:
        entry = add_topic(
            title=item.get("title", ""),
            channel_tag=item.get("channel_tag", item.get("tag", "{Self Improvement}")),
            summary=item.get("summary", ""),
            hook_idea=item.get("hook_idea", ""),
            source_url=item.get("source_url", ""),
            source_title=item.get("source_title", "")
        )
        added.append(entry)
    return added


def get_pending_topics() -> List[Dict[str, Any]]:
    queue = load_queue()
    return [t for t in queue.get("topics", []) if t.get("status") == "pending"]


def get_completed_topics() -> List[Dict[str, Any]]:
    queue = load_queue()
    return [t for t in queue.get("topics", []) if t.get("status") == "completed"]


def mark_topic_in_progress(identifier: str) -> Optional[Dict[str, Any]]:
    queue = load_queue()
    clean_id = identifier.strip().lower()
    for t in queue.get("topics", []):
        if t.get("id", "").lower() == clean_id or t.get("title", "").strip().lower() == clean_id:
            t["status"] = "in_progress"
            save_queue(queue)
            return t
    return None


def complete_topic(identifier: str, project_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
    queue = load_queue()
    clean_id = identifier.strip().lower()
    for t in queue.get("topics", []):
        if (
            t.get("id", "").lower() == clean_id
            or t.get("title", "").strip().lower() == clean_id
            or clean_id in t.get("title", "").strip().lower()
        ):
            t["status"] = "completed"
            t["completed_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            if project_slug:
                t["project_slug"] = project_slug
            save_queue(queue)
            return t
    return None


def remove_topic(identifier: str) -> bool:
    queue = load_queue()
    clean_id = identifier.strip().lower()
    initial_len = len(queue.get("topics", []))
    queue["topics"] = [
        t for t in queue.get("topics", [])
        if t.get("id", "").lower() != clean_id and t.get("title", "").strip().lower() != clean_id
    ]
    if len(queue["topics"]) < initial_len:
        save_queue(queue)
        return True
    return False


def format_topic_for_selection(t: Dict[str, Any]) -> str:
    """Formats a topic entry as a crisp selection string with hook idea."""
    title = t.get("title", "Untitled")
    hook = t.get("hook_idea", "")
    tag = t.get("channel_tag", "")
    summary = t.get("summary", "")
    
    desc = hook if hook else summary
    if len(desc) > 90:
        desc = desc[:87] + "..."
    return f"{title} [{tag}] — {desc}"


def main():
    parser = argparse.ArgumentParser(description="MotionCanva Topic Queue Manager")
    parser.add_argument("--list", action="store_true", help="List all topics (pending & completed)")
    parser.add_argument("--pending", action="store_true", help="List pending topics waiting for reel generation")
    parser.add_argument("--completed", action="store_true", help="List completed topics")
    parser.add_argument("--add", type=str, help="Add a new topic title")
    parser.add_argument("--tag", type=str, default="{Self Improvement}", help="Channel tag for added topic")
    parser.add_argument("--summary", type=str, default="", help="Summary of added topic")
    parser.add_argument("--hook", type=str, default="", help="Hook idea for added topic")
    parser.add_argument("--source", type=str, default="", help="Source podcast URL")
    parser.add_argument("--complete", type=str, help="Mark topic as completed by ID or Title")
    parser.add_argument("--slug", type=str, default=None, help="Generated project slug for completed topic")
    parser.add_argument("--remove", type=str, help="Remove topic by ID or Title")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")

    args = parser.parse_args()

    if args.add:
        entry = add_topic(
            title=args.add,
            channel_tag=args.tag,
            summary=args.summary,
            hook_idea=args.hook,
            source_url=args.source
        )
        if args.json:
            print(json.dumps(entry, indent=2))
        else:
            print(f"✅ Added to Topic Queue: {entry['full_topic']} (ID: {entry['id']})")
        return

    if args.complete:
        res = complete_topic(args.complete, project_slug=args.slug)
        if res:
            if args.json:
                print(json.dumps(res, indent=2))
            else:
                print(f"✅ Topic marked completed: {res['title']} (Slug: {res.get('project_slug', 'N/A')})")
        else:
            print(f"❌ Topic not found matching '{args.complete}'", file=sys.stderr)
            sys.exit(1)
        return

    if args.remove:
        if remove_topic(args.remove):
            print(f"🗑️ Removed topic matching '{args.remove}'")
        else:
            print(f"❌ Topic not found matching '{args.remove}'", file=sys.stderr)
            sys.exit(1)
        return

    if args.pending:
        pending = get_pending_topics()
        if args.json:
            print(json.dumps(pending, indent=2))
        else:
            if not pending:
                print("📭 No pending topics in queue.")
            else:
                print(f"📋 Pending Topics ({len(pending)} available):")
                for idx, t in enumerate(pending, 1):
                    hook_info = f" | Hook: \"{t['hook_idea']}\"" if t.get('hook_idea') else ""
                    print(f"  {idx}. {t['full_topic']}{hook_info} [ID: {t['id']}]")
        return

    if args.completed:
        completed = get_completed_topics()
        if args.json:
            print(json.dumps(completed, indent=2))
        else:
            if not completed:
                print("📭 No completed topics recorded.")
            else:
                print(f"✅ Completed Topics ({len(completed)} total):")
                for idx, t in enumerate(completed, 1):
                    print(f"  {idx}. {t['full_topic']} (Slug: {t.get('project_slug', 'N/A')})")
        return

    # Default to list all
    queue = load_queue()
    if args.json:
        print(json.dumps(queue, indent=2))
    else:
        pending = [t for t in queue.get("topics", []) if t.get("status") == "pending"]
        completed = [t for t in queue.get("topics", []) if t.get("status") == "completed"]
        in_progress = [t for t in queue.get("topics", []) if t.get("status") == "in_progress"]
        print(f"📊 Topic Queue Status ({len(queue.get('topics', []))} total topics):")
        print(f"   ⏳ Pending:     {len(pending)}")
        print(f"   ⚙️ In Progress: {len(in_progress)}")
        print(f"   ✅ Completed:   {len(completed)}")
        if pending:
            print("\nNext Up:")
            for idx, t in enumerate(pending[:5], 1):
                print(f"   {idx}. {t['full_topic']}")


if __name__ == "__main__":
    main()
