#!/usr/bin/env python3
"""Validate life-progress-rpg documentation and safety invariants."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


REQUIRED_FILES = (
    "AGENTS.md",
    "package.json",
    "docs/README.md",
    "docs/planning/milestone-v1.md",
    "docs/planning/ai-implementation-loop.md",
    "docs/design/quality-bar.md",
    "docs/design/content-strategy.md",
    "docs/tech/architecture.md",
    "docs/tech/code-structure.md",
    "docs/tech/database.md",
    "docs/tech/ai-design.md",
)

REQUIRED_SCRIPTS = ("build", "lint", "test")

IGNORED_DIRS = {".git", "node_modules", "dist", "coverage"}

SECRET_PATTERNS = (
    (
        "browser provider secret",
        re.compile(r"\bVITE_[A-Z0-9_]*(?:API_KEY|SECRET|TOKEN)\s*="),
    ),
    (
        "probable committed provider key",
        re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    ),
)

SOURCE_RISK_PATTERNS = (
    (
        "direct AI provider call from frontend",
        re.compile(r"https?://(?:api\.)?(?:openai\.com|anthropic\.com)"),
    ),
    (
        "UTC truncation used as a local date",
        re.compile(
            r"(?:toISOString\(\)\.split\(['\"]T['\"]\)\[0\]|"
            r"toISOString\(\)\.slice\(0,\s*10\))"
        ),
    ),
)

MARKDOWN_LINK_RE = re.compile(r"\]\(([^)]+)\)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate project rules, Markdown links, scripts, and secret risks."
    )
    parser.add_argument(
        "--root",
        type=Path,
        help="Repository root. Defaults to the nearest parent containing AGENTS.md.",
    )
    return parser.parse_args()


def find_root(explicit: Path | None) -> Path:
    if explicit:
        return explicit.resolve()

    for candidate in (Path.cwd(), *Path.cwd().parents):
        if (candidate / "AGENTS.md").is_file() and (
            candidate / "package.json"
        ).is_file():
            return candidate.resolve()

    skill_file = Path(__file__).resolve()
    for candidate in skill_file.parents:
        if (candidate / "AGENTS.md").is_file() and (
            candidate / "package.json"
        ).is_file():
            return candidate.resolve()

    raise RuntimeError("Could not locate repository root")


def iter_files(root: Path, suffixes: set[str]) -> list[Path]:
    result: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in IGNORED_DIRS for part in path.relative_to(root).parts):
            continue
        if path.suffix.lower() in suffixes or path.name.startswith(".env"):
            result.append(path)
    return result


def validate_required(root: Path, errors: list[str]) -> None:
    for relative in REQUIRED_FILES:
        if not (root / relative).is_file():
            errors.append(f"missing required file: {relative}")


def validate_package(root: Path, errors: list[str]) -> None:
    try:
        package = json.loads((root / "package.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"invalid package.json: {exc}")
        return

    scripts = package.get("scripts", {})
    for name in REQUIRED_SCRIPTS:
        if name not in scripts:
            errors.append(f"missing package script: {name}")


def validate_markdown(root: Path, errors: list[str]) -> int:
    markdown_files = iter_files(root, {".md"})

    for path in markdown_files:
        text = path.read_text(encoding="utf-8")
        relative = path.relative_to(root)

        if text.count("```") % 2:
            errors.append(f"unbalanced code fence: {relative}")

        for raw_target in MARKDOWN_LINK_RE.findall(text):
            if raw_target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            target = raw_target.split("#", 1)[0].split("?", 1)[0]
            if not target:
                continue
            resolved = (path.parent / target).resolve()
            if not resolved.exists():
                errors.append(
                    f"broken Markdown link: {relative} -> {raw_target}"
                )

    return len(markdown_files)


def validate_secrets(root: Path, errors: list[str]) -> int:
    candidates = iter_files(
        root,
        {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".env"},
    )

    for path in candidates:
        text = path.read_text(encoding="utf-8", errors="replace")
        relative = path.relative_to(root)
        for label, pattern in SECRET_PATTERNS:
            if pattern.search(text):
                errors.append(f"{label}: {relative}")

    return len(candidates)


def validate_source_risks(root: Path, errors: list[str]) -> int:
    source_root = root / "src"
    if not source_root.exists():
        return 0

    candidates = iter_files(source_root, {".ts", ".tsx", ".js", ".jsx"})
    for path in candidates:
        text = path.read_text(encoding="utf-8", errors="replace")
        relative = path.relative_to(root)
        for label, pattern in SOURCE_RISK_PATTERNS:
            if pattern.search(text):
                errors.append(f"{label}: {relative}")

    return len(candidates)


def main() -> int:
    args = parse_args()
    try:
        root = find_root(args.root)
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    errors: list[str] = []
    validate_required(root, errors)
    validate_package(root, errors)
    markdown_count = validate_markdown(root, errors)
    scanned_count = validate_secrets(root, errors)
    source_count = validate_source_risks(root, errors)

    print(f"root={root}")
    print(
        "checked "
        f"markdown={markdown_count} "
        f"secret_candidates={scanned_count} "
        f"source_files={source_count}"
    )

    if errors:
        print(f"FAILED errors={len(errors)}")
        for error in errors:
            print(f"- {error}")
        return 1

    print("PASS project validation")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
