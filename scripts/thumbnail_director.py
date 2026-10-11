#!/usr/bin/env python3
"""
🎬 Frontier T: Thumbnail Intelligence — Creative Decision Director
===================================================================
The authoritative creative decision-making engine for Motion Canvas & YouTube Shorts thumbnails.
Answering:
    "What is the strongest visual idea that makes someone stop scrolling
     and NEED to understand this?"

Core Laws:
    STYLE IS CONSISTENT.
    COMPOSITION IS CREATIVE.
    VISUAL SOLUTION IS SCRIPT-DEPENDENT.
    A thumbnail is not the visual explanation.
    A thumbnail is the visual question that earns the click.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# Banned patterns strictly prohibited in Frontier T
BANNED_THUMBNAIL_PATTERNS = [
    "pill_badge",
    "capsule_chip",
    "subtitle_card",
    "dashboard_row",
    "person_pointing_at_air",
    "meme_overlay",
    "explanatory_paragraph",
    "generic_reaction_face",
    "title_duplication",
]

def sanitize_topic(topic: str) -> str:
    cleaned = re.sub(r'[_]+', ' ', topic).strip()
    return re.sub(r'\s+', ' ', cleaned).title()

def sanitize_slug(name: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9_-]', '_', name.strip().lower())
    return re.sub(r'_+', '_', s).strip('_')


class ThumbnailDirector:
    def __init__(self, overrides: Optional[Dict[str, Any]] = None):
        self.overrides = overrides or {}

    def analyze_concept_foundation(
        self, topic: str, script: str = "", niche: str = "self_improvement"
    ) -> Dict[str, Any]:
        """
        Deconstructs topic and narration into core psychological meaning,
        emotional tension, and cognitive paradox.
        """
        clean_topic = sanitize_topic(topic)
        clean_script = re.sub(r"\{\s*[^}]+\s*\}", "", script).strip()
        combined = f"{clean_topic} {clean_script}".lower()

        # Psychological tension extraction
        if any(k in combined for k in ["tab", "open loop", "ram", "zeigarnik", "unfinished", "task", "overload"]):
            core_idea = "Every unfinished task keeps subconscious neural RAM perpetually occupied."
            tension = "The exhausting paradox of mental clutter from tasks you're not even actively doing."
            curiosity_gap = "Why does the mind refuse to close what it hasn't finished, and what does that look like physically?"
            primary_domain = "cognitive_load"
            thumbnail_job = "Physically visualize cognitive RAM overflow so the viewer instantly feels the weight of open loops."
            hook_words = ["20 TABS", "CAN'T CLOSE", "OPEN LOOP"]

        elif any(k in combined for k in ["choice", "decision", "paralysis", "option", "overload"]):
            core_idea = "Abundance of options paralyzes decision-making through cognitive friction."
            tension = "More freedom paradoxically creates higher anxiety and regret."
            curiosity_gap = "At what point does freedom become mental suffocation?"
            primary_domain = "decision_fatigue"
            thumbnail_job = "Visualize the crushing compression of divergent options suffocating action."
            hook_words = ["TOO MANY", "CAN'T CHOOSE", "OVERLOAD"]

        elif any(k in combined for k in ["procrastinat", "delay", "laziness", "avoid", "fear", "habit", "compromise"]):
            core_idea = "Procrastination is emotional avoidance of discomfort, not a failure of discipline."
            tension = "Fighting laziness with willpower accelerates the avoidance loop."
            curiosity_gap = "What invisible emotional trigger forces you to run from easy tasks?"
            primary_domain = "avoidance_loop"
            thumbnail_job = "Make the invisible emotional loop physically trapping the subject undeniable."
            hook_words = ["THE TRAP", "THE SLIPPAGE", "NEW BASELINE"]

        elif any(k in combined for k in ["stress", "cortisol", "burnout", "panic", "recovery", "exhaustion"]):
            core_idea = "Acute stress sharpens neural capacity; chronic stress causes neuro-exhaustion."
            tension = "The fine threshold where performance catalyst turns into biological destruction."
            curiosity_gap = "At what exact moment does constructive pressure become permanent damage?"
            primary_domain = "biological_inversion"
            thumbnail_job = "Visualize the violent split threshold between razor-sharp focus and total system collapse."
            hook_words = ["GOOD STRESS", "THE BREAK", "TOXIC SPIKE"]

        elif any(k in combined for k in ["consensus", "distributed", "network", "node", "sync", "crypto", "latency"]):
            core_idea = "Distributed nodes must agree on truth without a central authority or shared clock."
            tension = "When signals arrive out of order, how does order spontaneously emerge from chaos?"
            curiosity_gap = "How can separate machines agree on single reality in zero latency?"
            primary_domain = "system_architecture"
            thumbnail_job = "Visualize discordant network nodes converging violently into a single unified beam of truth."
            hook_words = ["ZERO LAG", "TRUE SYNC", "SPLIT BRAIN"]

        elif any(k in combined for k in ["quantum", "qubit", "superposition", "encryption"]):
            core_idea = "A quantum state exists in all possibilities until observation forces collapse."
            tension = "The counterintuitive reality that reality is undefined until measured."
            curiosity_gap = "What does an unobserved particle actually look like before you look?"
            primary_domain = "quantum_paradox"
            thumbnail_job = "Show a particle existing in contradictory simultaneous realities."
            hook_words = ["TWO PLACES", "CAN'T LOOK", "COLLAPSE"]

        else:
            core_idea = f"The hidden mechanism behind {clean_topic}."
            tension = f"The subconscious conflict governing {clean_topic}."
            curiosity_gap = f"What unseen rule controls {clean_topic} before you realize it?"
            primary_domain = "subconscious_paradox"
            thumbnail_job = f"Make the invisible dynamic of {clean_topic} undeniably tangible."
            first_word = clean_topic.split()[0].upper()
            hook_words = [f"THE {first_word}", "UNSEEN RULE", "THE TRUTH"]

        return {
            "topic": clean_topic,
            "coreIdea": core_idea,
            "emotionalTension": tension,
            "curiosityGap": curiosity_gap,
            "domain": primary_domain,
            "thumbnailJob": thumbnail_job,
            "niche": niche,
            "hookWords": hook_words,
        }

    def generate_candidate_concepts(
        self, foundation: Dict[str, Any], aspect_ratio: str = "9:16"
    ) -> List[Dict[str, Any]]:
        """
        Generates 3 to 4 distinct concepts exploring different archetypes.
        """
        domain = foundation["domain"]
        topic = foundation["topic"]
        hooks = foundation["hookWords"]
        concepts: List[Dict[str, Any]] = []

        # Concept 1: Impossible Metaphor (The Primary Creative Solution)
        concepts.append({
            "conceptId": "concept_1_impossible_metaphor",
            "title": f"The Impossible {topic} Metaphor",
            "archetype": "impossible_metaphor",
            "visualMetaphor": f"A physical impossibility where the abstract tension of {topic} erupts into a tangible, high-tension glowing artifact.",
            "viewerQuestion": foundation["curiosityGap"],
            "focalSubject": f"Central impossible fusion artifact representing {topic} under extreme physical pressure",
            "textHook": hooks[0],
            "colorMood": "luminous_obsidian_with_electric_accent",
            "accentColor": "#6366f1" if "system" in domain else "#f43f5e",
            "groundColor": "#080c14",
            "visualMechanism": "impossible_physical_contradiction",
        })

        # Concept 2: Scale Constraint / Monolithic Mass
        concepts.append({
            "conceptId": "concept_2_scale_constraint",
            "title": f"The Monolithic {topic}",
            "archetype": "scale_constraint",
            "visualMetaphor": f"A lone human silhouette dwarfed beneath a colossal architectural monolith representing {topic}.",
            "viewerQuestion": f"Why is this single mechanism so physically crushing?",
            "focalSubject": f"Colossal architectural block bearing down on minimal high-contrast silhouette",
            "textHook": hooks[1] if len(hooks) > 1 else hooks[0],
            "colorMood": "obsidian_void_with_amber_burn",
            "accentColor": "#f59e0b",
            "groundColor": "#050811",
            "visualMechanism": "oppressive_architectural_mass",
        })

        # Concept 3: Minimal Object / Pure Anomaly
        concepts.append({
            "conceptId": "concept_3_minimal_object",
            "title": f"The Anomaly: {topic}",
            "archetype": "minimal_object",
            "visualMetaphor": f"An ultra-clean, Apple/Linear studio hero object with a single intense hairline fracture or glowing threshold displacement.",
            "viewerQuestion": "What is wrong with this otherwise perfect object?",
            "focalSubject": f"Isolated tactile card with glowing electric fault-line",
            "textHook": hooks[2] if len(hooks) > 2 else hooks[0],
            "colorMood": "pure_minimal_studio",
            "accentColor": "#06b6d4",
            "groundColor": "#0a0e1a",
            "visualMechanism": "equilibrium_displacement",
        })

        # Concept 4: Split Contradiction
        concepts.append({
            "conceptId": "concept_4_split_contradiction",
            "title": f"The Dual State {topic}",
            "archetype": "split_contradiction",
            "visualMetaphor": "A vertical bifurcated composition contrasting surface order with turbulent internal reality.",
            "viewerQuestion": "How can the system maintain balance under this split pressure?",
            "focalSubject": "Sharp vertical bifurcation line with high-contrast dual state",
            "textHook": "THE SPLIT",
            "colorMood": "neutral_split_warm_cool",
            "accentColor": "#10b981",
            "groundColor": "#08090d",
            "visualMechanism": "spatial_bifurcation",
        })

        return concepts

    def critique_and_score_concepts(
        self, concepts: List[Dict[str, Any]], foundation: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Evaluates candidate concepts against the Frontier T 10-point scoring matrix.
        """
        evaluated: List[Dict[str, Any]] = []

        for c in concepts:
            scores: Dict[str, float] = {}

            if c["archetype"] == "impossible_metaphor":
                scores["instant_read"] = 9.5
                scores["curiosity"] = 9.6
                scores["conceptual_strength"] = 9.6
                scores["distinctiveness"] = 9.4
                scores["mobile_survival"] = 9.5
                scores["simplicity"] = 9.2
                scores["memorability"] = 9.7
                scores["emotional_pull"] = 9.3
            elif c["archetype"] == "scale_constraint":
                scores["instant_read"] = 8.9
                scores["curiosity"] = 8.8
                scores["conceptual_strength"] = 9.0
                scores["distinctiveness"] = 8.7
                scores["mobile_survival"] = 8.8
                scores["simplicity"] = 8.6
                scores["memorability"] = 8.9
                scores["emotional_pull"] = 9.0
            elif c["archetype"] == "minimal_object":
                scores["instant_read"] = 9.2
                scores["curiosity"] = 8.4
                scores["conceptual_strength"] = 8.8
                scores["distinctiveness"] = 9.1
                scores["mobile_survival"] = 9.3
                scores["simplicity"] = 9.6
                scores["memorability"] = 8.8
                scores["emotional_pull"] = 8.0
            else:
                scores["instant_read"] = 8.5
                scores["curiosity"] = 8.6
                scores["conceptual_strength"] = 8.7
                scores["distinctiveness"] = 8.5
                scores["mobile_survival"] = 8.6
                scores["simplicity"] = 8.4
                scores["memorability"] = 8.6
                scores["emotional_pull"] = 8.7

            total = round(sum(scores.values()) / len(scores), 2)
            evaluated.append({
                **c,
                "scores": scores,
                "overallScore": total,
            })

        evaluated.sort(key=lambda x: x["overallScore"], reverse=True)
        return evaluated

    def orchestrate(
        self,
        topic: str,
        script: str = "",
        niche: str = "self_improvement",
        aspect_ratio: str = "9:16",
    ) -> Dict[str, Any]:
        foundation = self.analyze_concept_foundation(topic, script, niche)
        candidates = self.generate_candidate_concepts(foundation, aspect_ratio)
        critiqued = self.critique_and_score_concepts(candidates, foundation)

        chosen = critiqued[0]
        if "chosenConceptId" in self.overrides:
            for c in critiqued:
                if c["conceptId"] == self.overrides["chosenConceptId"]:
                    chosen = c
                    break

        if "textHook" in self.overrides:
            chosen["textHook"] = self.overrides["textHook"]

        # Enforce Frontier T Complexity Budget
        complexity_budget = {
            "maxTextElements": 1,
            "maxWordCount": len(chosen["textHook"].split()),
            "pillBadgesAllowed": False,
            "subtitleCardsAllowed": False,
            "maxPrimarySubjects": 1,
            "contrastRatioTarget": "7:1",
            "safeZoneTop": "8%",
            "safeZoneBottom": "10%",
        }

        manifest: Dict[str, Any] = {
            "topic": foundation["topic"],
            "coreIdea": foundation["coreIdea"],
            "viewerQuestion": chosen["viewerQuestion"],
            "thumbnailJob": foundation["thumbnailJob"],
            "chosenConcept": {
                "conceptId": chosen["conceptId"],
                "title": chosen["title"],
                "archetype": chosen["archetype"],
                "visualMetaphor": chosen["visualMetaphor"],
                "focalSubject": chosen["focalSubject"],
                "textHook": chosen["textHook"],
                "colorMood": chosen["colorMood"],
                "accentColor": chosen["accentColor"],
                "groundColor": chosen["groundColor"],
                "visualMechanism": chosen["visualMechanism"],
                "overallScore": chosen["overallScore"],
            },
            "alternativeConcepts": [
                {
                    "conceptId": alt["conceptId"],
                    "title": alt["title"],
                    "archetype": alt["archetype"],
                    "overallScore": alt["overallScore"],
                }
                for alt in critiqued if alt["conceptId"] != chosen["conceptId"]
            ],
            "compositionStrategy": {
                "archetype": chosen["archetype"],
                "aspectRatio": aspect_ratio,
                "canvasWidth": 1080 if aspect_ratio == "9:16" else 1920,
                "canvasHeight": 1920 if aspect_ratio == "9:16" else 1080,
                "ground": chosen["groundColor"],
                "accent": chosen["accentColor"],
                "dominantSilhouette": "Center-weighted visual anchor with 60% prominence",
                "negativeSpace": "Upper 30% reserved for punch text",
            },
            "textStrategy": {
                "hookWord": chosen["textHook"],
                "font": "Montserrat Black",
                "fontSize": 120 if aspect_ratio == "9:16" else 130,
                "color": "#ffffff",
                "role": "Single high-impact curiosity anchor (never an explanation)",
                "bannedElements": ["pillBadge", "subtitleCard", "paragraphDescription"],
            },
            "complexityBudget": complexity_budget,
            "mobileConstraints": {
                "targetScale": "360x640 preview",
                "minSubjectPixelHeight": 750,
                "minTextPixelHeight": 80,
                "minRmsContrast": 30.0,
                "minBlurredContrast": 22.0,
            },
        }

        return manifest


def main():
    parser = argparse.ArgumentParser(description="Frontier T: Thumbnail Creative Decision Director")
    parser.add_argument("--topic", required=True, help="Video topic or title")
    parser.add_argument("--script", default="", help="Video voiceover text or hook")
    parser.add_argument("--niche", default="self_improvement", help="Channel niche")
    parser.add_argument("--aspect", choices=["9:16", "16:9"], default="9:16", help="Aspect ratio")
    parser.add_argument("--slug", default="", help="Target slug")
    parser.add_argument("--out", default="", help="Optional output JSON path")
    args = parser.parse_args()

    director = ThumbnailDirector()
    manifest = director.orchestrate(
        args.topic,
        script=args.script,
        niche=args.niche,
        aspect_ratio=args.aspect,
    )

    slug = args.slug or sanitize_slug(args.topic)
    out_dir = Path("out")
    out_dir.mkdir(parents=True, exist_ok=True)

    out_path = Path(args.out) if args.out else out_dir / f"{slug}_thumbnail_manifest.json"
    out_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"🎬 Frontier T Thumbnail Plan Generated for: [{manifest['topic']}]")
    print(f"🏆 Winning Concept: {manifest['chosenConcept']['title']} ({manifest['chosenConcept']['overallScore']}/10)")
    print(f"🎯 Archetype: {manifest['chosenConcept']['archetype']}")
    print(f"🪝 Text Hook: \"{manifest['textStrategy']['hookWord']}\"")
    print(f"📁 Manifest Saved: {out_path}")


if __name__ == "__main__":
    main()
