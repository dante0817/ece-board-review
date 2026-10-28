#!/usr/bin/env python3
"""Safely integrate the GitHub Physics Batch 1 branch ZIP into a newer AEM ZIP.

Inputs:
  1. Latest user's BSECE_AEM-expanded source ZIP (authoritative).
  2. Downloaded source ZIP of feature/physics-batch1-geas-20261028.

All-or-nothing: output is only published after all exact patch checks pass.
The baseline is never overwritten. Uses Python standard library only.
Does not replace existing lessons, questions, mathematics, AEM or calculator code.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import io
import json
import os
from pathlib import PurePosixPath, Path
import re
import sys
import tempfile
import zipfile

FEATURES = (
    "src/features/physics/physicsCurriculum.ts",
    "src/features/physics/PhysicsScreen.tsx",
    "scripts/validatePhysicsBatch1.ts",
)
APP = "src/App.tsx"
CONTEXT = "src/context/ReviewContext.tsx"
BOARD = "src/components/BoardSubjectScreen.tsx"
SIDEBAR = "src/components/Sidebar.tsx"
TARGETS = (APP, CONTEXT, BOARD, SIDEBAR)
TAG = "PHYSICS_BATCH1_MERGE_REPORT.json"

def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def inspect_zip(z: zipfile.ZipFile, label: str):
    found = {}
    for info in z.infolist():
        name = info.filename.replace("\\", "/")
        p = PurePosixPath(name)
        if name.startswith("/") or ".." in p.parts or not name.strip() or re.match(r"^[a-zA-Z]:", name):
            raise ValueError(f"{label}: unsafe archive path: {info.filename!r}")
        if (info.external_attr >> 16) & 0o170000 == 0o120000:
            raise ValueError(f"{label}: symlink entry not permitted: {name}")
        if name in found:
            raise ValueError(f"{label}: duplicate ZIP entry: {name}")
        found[name] = info
    if z.testzip() is not None:
        raise ValueError(f"{label}: ZIP checksum verification failed")
    return found

def find_root(entries: dict[str, zipfile.ZipInfo], label: str) -> str:
    paths = [name for name in entries if name.endswith("src/App.tsx") and not entries[name].is_dir()]
    if len(paths) != 1:
        raise ValueError(f"{label}: expected one src/App.tsx, found {len(paths)}")
    return paths[0][:-len("src/App.tsx")]

def expect_replace(text: str, old: str, new: str, label: str) -> str:
    n = text.count(old)
    if n != 1:
        raise ValueError(f"{label}: expected exact unique source anchor, observed {n}. No ZIP created.")
    return text.replace(old, new, 1)

def app_patch(s: str) -> str:
    label = APP
    if "import { PhysicsScreen }" not in s:
        a = "import { ProbabilityStatisticsScreen } from './features/probability-statistics/ProbabilityStatisticsScreen';"
        s = expect_replace(s, a, a + "\nimport { PhysicsScreen } from './features/physics/PhysicsScreen';", label)
    if "'physics'," not in s:
        s = expect_replace(s, "    'geas',\n    'electronics',", "    'geas',\n    'physics',\n    'electronics',", label)
    if "currentScreen === 'physics' && <PhysicsScreen />" not in s:
        a = '''{currentScreen === 'geas' && <BoardSubjectScreen category="geas" />}'''
        s = expect_replace(s, a, a + "\n      {currentScreen === 'physics' && <PhysicsScreen />}", label)
    return s

def context_patch(s: str) -> str:
    if "| 'physics'" not in s:
        s = expect_replace(s, "  | 'geas'\n  | 'electronics'", "  | 'geas'\n  | 'physics'\n  | 'electronics'", CONTEXT)
    return s

def board_patch(s: str) -> str:
    if "PHYSICS_NAV_COURSE_KEY" not in s:
        a = "import { BOARD_EXPANSION_QUESTIONS } from '../data/boardExpansionQuestions';"
        s = expect_replace(s, a, a + "\nimport { PHYSICS_NAV_COURSE_KEY } from '../features/physics/physicsCurriculum';", BOARD)

    if "name: 'Physics 2'" not in s:
        lines = s.splitlines(keepends=True)
        index = [i for i,line in enumerate(lines) if "name: 'Physics for Engineers'" in line]
        if len(index) != 1:
            raise ValueError(f"{BOARD}: Physics for Engineers anchor ambiguous ({len(index)} occurrences)")
        i = index[0]
        indentation = re.match(r"^(\s*)", lines[i]).group(1)
        lines.insert(i + 1, indentation + "{ name: 'Physics 2', topics: 4, completed: 0, status: 'Not Started' },\n")
        s = "".join(lines)

    if "window.sessionStorage.setItem(PHYSICS_NAV_COURSE_KEY" not in s:
        original = "onClick={() => handleStart(m.name)}"
        replacement = """onClick={() => {
                      if (category==='geas' && (m.name==='Physics for Engineers'||m.name==='Physics 2')) {
                        try {
                          window.sessionStorage.setItem(PHYSICS_NAV_COURSE_KEY,m.name==='Physics 2'?'geas-physics2':'geas-physics');
                        } catch { /* nonessential course navigation hint */ }
                        setCurrentScreen('physics');
                      } else handleStart(m.name);
                    }}"""
        s = expect_replace(s, original, replacement, BOARD)
    if "disabled={!(category==='geas'" not in s:
        old = "disabled={!allTopics.some(t => t.name.toLowerCase()===m.name.toLowerCase())}"
        new = "disabled={!(category==='geas' && (m.name==='Physics for Engineers'||m.name==='Physics 2')) && !allTopics.some(t => t.name.toLowerCase()===m.name.toLowerCase())}"
        s = expect_replace(s, old, new, BOARD)
    if "'Open Physics' : 'Unavailable'" not in s:
        old = "<span>{'Unavailable'}</span>"
        new = "<span>{category==='geas' && (m.name==='Physics for Engineers'||m.name==='Physics 2') ? 'Open Physics' : 'Unavailable'}</span>"
        s = expect_replace(s, old, new, BOARD)
    if "'Curriculum available' : 'Content not yet available'" not in s:
        old = "{'Content not yet available'}"
        new = "{category==='geas' && (m.name==='Physics for Engineers'||m.name==='Physics 2') ? 'Curriculum available' : 'Content not yet available'}"
        s = expect_replace(s, old, new, BOARD)
    return s

def sidebar_patch(s: str) -> str:
    if "currentScreen === 'geas' || currentScreen === 'physics'" not in s:
        s = expect_replace(s, "className={navItem(currentScreen === 'geas')}",
            "className={navItem(currentScreen === 'geas' || currentScreen === 'physics')}", SIDEBAR)
    return s

PATCHES = {APP: app_patch, CONTEXT: context_patch, BOARD: board_patch, SIDEBAR: sidebar_patch}

def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--baseline", type=Path, required=True, help="Latest AEM-expanded ZIP")
    p.add_argument("--feature", type=Path, required=True, help="GitHub Physics Batch 1 branch ZIP")
    p.add_argument("--output", type=Path, required=True, help="New integrated ZIP; must not exist")
    args = p.parse_args()
    if not args.baseline.is_file() or not args.feature.is_file():
        p.error("Both --baseline and --feature must be existing ZIP files")
    if args.output.exists():
        p.error("Output already exists. Refusing to overwrite files.")
    if args.output.resolve() in (args.baseline.resolve(), args.feature.resolve()):
        p.error("Output must be distinct from both inputs.")
    if args.output.parent.resolve() != args.baseline.parent.resolve():
        print("Note: output and baseline are in different directories", file=sys.stderr)

    with zipfile.ZipFile(args.baseline, "r") as base, zipfile.ZipFile(args.feature, "r") as feature:
        original = inspect_zip(base, "baseline")
        addition = inspect_zip(feature, "feature")
        base_root = find_root(original, "baseline")
        feature_root = find_root(addition, "feature")
        modified: dict[str,bytes] = {}
        added: dict[str,bytes] = {}
        for path, function in PATCHES.items():
            base_name = base_root + path
            if base_name not in original:
                raise ValueError(f"Baseline has no required file: {path}")
            old_data = base.read(base_name)
            try:
                original_text = old_data.decode("utf-8")
            except UnicodeDecodeError:
                raise ValueError(f"Baseline file isn't UTF-8: {path}")
            patched = function(original_text)
            if patched == original_text:
                raise ValueError(f"Expected a new change to {path}; baseline may already include Batch 1.")
            modified[base_name] = patched.encode("utf-8")
        for path in FEATURES:
            feature_name = feature_root + path
            dest = base_root + path
            if feature_name not in addition:
                raise ValueError(f"Feature branch has no file: {path}")
            if dest in original:
                raise ValueError(f"Baseline already defines {path}; refusing to overwrite.")
            added[dest] = feature.read(feature_name)

        report = {
            "status": "source-merge-prepared",
            "baseline_sha256": digest(args.baseline),
            "feature_sha256": digest(args.feature),
            "source_baseline": str(args.baseline.name),
            "changed_files": [key[len(base_root):] for key in modified],
            "added_files": [key[len(base_root):] for key in added],
            "assurance": "ZIP contents merged without replacing unrelated files; runtime/build validation still required",
            "next_commands": [
                "npm ci",
                "npx tsx scripts/validatePhysicsBatch1.ts",
                "npm run lint",
                "npm run build",
            ],
        }
        manifest_name = base_root + TAG
        if manifest_name in original:
            raise ValueError("Merge report filename already exists in baseline; refusing overwrite.")
        args.output.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(prefix="physics-merge-", suffix=".zip", dir=args.output.parent)
        os.close(fd)
        try:
            with zipfile.ZipFile(tmp,"w") as out:
                for info in base.infolist():
                    # Retain all original files and metadata unless in the bounded modification map.
                    out.writestr(copy.copy(info), modified.get(info.filename, base.read(info)))
                for name,data in added.items():
                    out.writestr(name,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
                out.writestr(manifest_name,json.dumps(report,indent=2)+"\n",compress_type=zipfile.ZIP_DEFLATED)
            with zipfile.ZipFile(tmp) as out:
                entries = inspect_zip(out,"merged")
                expected=set(original)|set(added)|{manifest_name}
                if set(entries)!=expected:
                    raise ValueError("Unexpected output archive file inventory")
                for name,info in original.items():
                    if name not in modified and out.read(name)!=base.read(name):
                        raise ValueError(f"Unexpected change to unaffected source: {name}")
            os.replace(tmp,args.output)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
    print(f"PASS: {args.output}")
    print(f"Updated {len(modified)} existing source files, added {len(added)} Physics files; all unrelated content bytes preserved.")
    print("Next: extract merged source and run listed npm checks before treating it as a release.")

if __name__=="__main__":
    try:
        main()
    except (ValueError, OSError, zipfile.BadZipFile) as exc:
        print(f"MERGE BLOCKED: {exc}",file=sys.stderr)
        sys.exit(2)
