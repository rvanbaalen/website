---
name: sync-skills
description: |
  Synchronize the website's skills pages with the rvanbaalen/skills marketplace repository.
  Detects new and updated skills by comparing version numbers in marketplace.json against
  the website's content collection YAML files, generates website content from SKILL.md sources,
  and presents everything for user review before writing files.
  Use when the user asks to "sync skills", "update skills page", "check for new skills",
  "refresh skills from marketplace", or invokes /sync-skills.
---

# Sync Skills

Synchronize the skills pages on robinvanbaalen.nl with the rvanbaalen/skills marketplace repository.

## Paths

| What | Path |
|------|------|
| Skills repo | `/Users/robin/Sites/rvanbaalen-skills` |
| Marketplace manifest | `/Users/robin/Sites/rvanbaalen-skills/.claude-plugin/marketplace.json` |
| Plugin content | `/Users/robin/Sites/rvanbaalen-skills/plugins/{name}/` |
| Plugin metadata | `/Users/robin/Sites/rvanbaalen-skills/plugins/{name}/.claude-plugin/plugin.json` |
| Plugin SKILL.md | `/Users/robin/Sites/rvanbaalen-skills/plugins/{name}/skills/{name}/SKILL.md` |
| Website YAML | `src/content/skills/{name}.yaml` |
| Website MDX | `src/pages/skills/{name}.mdx` |

## Phase 1: Fetch & Compare

1. Run `git -C /Users/robin/Sites/rvanbaalen-skills pull` to get the latest.
   - If this fails, report the error and stop.

2. Read `/Users/robin/Sites/rvanbaalen-skills/.claude-plugin/marketplace.json`.
   - Parse the `plugins` array. Each entry has `name`, `version`, `description`, `source`.

3. Read all `.yaml` files in `src/content/skills/` to get current website skill versions.
   - For each, extract the `version` field.

4. Compare to produce three lists:
   - **New skills**: present in marketplace.json but no matching `.yaml` file exists in `src/content/skills/`
   - **Updated skills**: version in marketplace.json differs from version in the `.yaml` file
   - **Unchanged**: versions match — skip these

5. If no new or updated skills found, tell the user "All skills are up to date." and stop.

## Phase 2: Pass 1 — Summary & Scope Confirmation

Present a markdown summary to the user via `AskUserQuestion`. Format it exactly like this:

```
## Skills Sync Summary

### New skills
- `{name}` v{version} — {description}

### Updated skills
- `{name}` {old_version} -> {new_version} — {description}

### Unchanged (skipping)
- `{name}` v{version}

Proceed with all changes, or tell me which skills to skip.
```

Wait for the user's response:
- If they confirm, proceed with all detected changes.
- If they exclude specific skills, remove those from the work list.

## Phase 3: Parallel Content Generation

For each skill that needs work (new or updated), dispatch a **background subagent** using the Agent tool. Launch ALL subagents in a single message so they run in parallel.

Each subagent is a `general-purpose` agent. Its prompt must include all the information it needs to generate both files without reading anything else. Build the prompt by reading the source files first (in the main thread), then passing their contents into the subagent prompt.

### What to read before dispatching (main thread)

For each skill, read these files and include their contents in the subagent prompt:

1. The marketplace.json entry for this plugin (you already have this from Phase 1)
2. The plugin's `.claude-plugin/plugin.json` at `plugins/{name}/.claude-plugin/plugin.json` — this is the **authoritative source for the author**. The `author` object always has a `name` field and may also have a `url` field. Extract both. Do NOT assume the author or copy it from another skill. Different plugins have different authors (e.g., `svg-precision` is authored by `dkyazzentwatwa` and `lottie-animator` by `obeskay`, not Robin van Baalen).
3. The plugin's main SKILL.md at `plugins/{name}/skills/{name}/SKILL.md`
4. For multi-skill plugins (check if `plugins/{name}/skills/` contains multiple subdirectories):
   - Read ALL sub-skill SKILL.md files (just the frontmatter `name` and `description` fields is enough)
5. Check if `plugins/{name}/agents/` directory exists (determines category: agent vs skill)
6. For updates: read the existing `src/pages/skills/{name}.mdx` file

### Subagent prompt template

Use this exact prompt structure for each subagent. Replace all `{placeholders}` with actual values. The subagent should ONLY return text output — no tool calls, no file writes.

```
You are generating website content for a Claude Code skill page. Return ONLY the two file contents below, clearly separated. Do not write any files — just return the text.

## Context

**Plugin name:** {name}
**Version:** {version}
**Marketplace description:** {marketplace_description}
**Author:** {author_name} (MUST come from plugin.json `author.name` field — each plugin may have a different author)
**Author URL:** {author_url or "none"} (from plugin.json `author.url` field, if present)
**Category:** {"agent" if agents/ directory exists, otherwise "skill"}
**Invoke command:** {invoke_command} (use "/{name}:{skill}" for skills, "/{name}" for agents like pm and cofounder)
**Install command:** {name}@rvanbaalen

**Source SKILL.md content:**
{skill_md_content}

{IF MULTI-SKILL PLUGIN}
**Sub-skills:**
{for each sub-skill: "- {sub_skill_name}: {sub_skill_description}"}
{END IF}

{IF UPDATE}
**Existing MDX page to preserve structure from:**
{existing_mdx_content}
{END IF}

## Generate two files

### File 1: {name}.yaml

Generate a YAML file with exactly these fields:
- name: {display_name} (title-cased version of plugin name, e.g. "Commit", "Lottie Animator", "OCR Document Processor")
- description: One-line description (from marketplace.json description, condensed if needed)
- version: "{version}" (quoted string)
- author: {author_name}
- authorUrl: "{author_url}" (only include this field if a URL is present in plugin.json)
- invoke: "{invoke_command}"
- trigger: manual (unless SKILL.md description says it auto-triggers, then use "auto")
- category: {category}
- order: {order} (use {existing_order} for updates, or {next_order} for new skills)

### File 2: {name}.mdx

Generate an MDX file with this exact structure:

Frontmatter:
- layout: ../../layouts/SkillLayout.astro
- name: {display_name}
- description: {short_description}
- version: "{version}"
- author: {author_name}
- authorUrl: "{author_url}" (only include this field if a URL is present in plugin.json)
- invoke: "{invoke_command}"
- install: "{name}@rvanbaalen"
- repo: "rvanbaalen/skills"
- category: "{category}"

Body sections — write concise, direct prose. No filler. Match the tone of a developer portfolio:

1. ## When to use
   Summarize from SKILL.md: when should someone use this? What problems does it solve?

2. ## How it works
   Numbered list of the skill's workflow steps, derived from SKILL.md.

3. {IF skill has multiple modes or notable capabilities}
   ## Modes (or ## Capabilities or ## Sub-skills — pick the right heading)
   Describe modes, capabilities, or sub-skills as appropriate.
   For multi-skill plugins: use a markdown table with columns: Skill, Description, Invoke
   {END IF}

4. {IF UPDATE and existing MDX has sections not covered above}
   Preserve those additional sections (like "## What's new in vX.Y" or "## Getting started")
   Update version references if needed.
   {END IF}

5. ## Invoke
   Code block with invocation example(s).

Return the content in this format:

--- YAML START ---
(yaml content here)
--- YAML END ---

--- MDX START ---
(mdx content here)
--- MDX END ---
```

### Determining order for new skills

Before dispatching, find the highest `order` value across all existing `.yaml` files. New skills get sequential numbers starting from `highest + 1`.

### Determining invoke command

Claude Code resolves slash commands as `/{plugin}:{skill}`. The marketplace name (`rvanbaalen`) is **not** part of the command — it only appears in the install command (`{name}@rvanbaalen`).

- Most plugins ship one skill named after the plugin, so the command is `/{name}:{name}` (e.g. `/commit:commit`, `/lottie-animator:lottie-animator`)
- Agent plugins like `pm` and `cofounder` use the short form `/{name}` (e.g. `/pm`, `/cofounder`)
- Sub-skills of a multi-skill plugin are `/{plugin}:{sub}` (e.g. `/pm:plan`, `/cofounder:spar`)
- If the plugin has an `agents/` directory, it typically uses the short form.

## Phase 4: Pass 2 — Per-Skill Review

As each subagent completes, parse its output to extract the YAML and MDX content (split on the `--- YAML START ---` / `--- MDX START ---` markers).

Present each skill's content to the user via `AskUserQuestion`. Format it like this:

```
## {display_name} ({old_version} -> {new_version})  [or "NEW" for new skills]

### src/content/skills/{name}.yaml

\`\`\`yaml
{generated yaml content}
\`\`\`

### src/pages/skills/{name}.mdx

\`\`\`mdx
{generated mdx content}
\`\`\`

**Approve** this content, or describe what to **Modify**.
```

Handle the user's response:
- **Approve** (or "looks good", "yes", "ok", etc.): mark this skill as approved, move to next.
- **Modify**: the user provides corrections. Apply the corrections to the content and re-present via `AskUserQuestion`. The user can always approve and hand-edit later if the loop isn't converging.

## Phase 5: Write Files

After all skills have been reviewed and approved, write the files:

For each approved skill:
1. Write `src/content/skills/{name}.yaml` with the approved YAML content
2. Write `src/pages/skills/{name}.mdx` with the approved MDX content

After writing all files, tell the user what was written:
```
Done! Updated {N} skill(s):
- {name}: wrote {name}.yaml + {name}.mdx

Run `npm run dev` to preview the changes.
```

## Edge Cases

- **Git pull fails**: Report error, stop. Do not proceed with stale data.
- **No changes detected**: Inform user "All skills are up to date.", stop.
- **Plugin has no SKILL.md**: Use marketplace.json description + plugin.json as sole source. Warn the user in the Pass 2 review that content is limited.
- **Multi-skill plugin**: Read all sub-skill SKILL.md frontmatter. Generate a summary page with a sub-skills table (see the existing pm.mdx and cofounder.mdx pages for the pattern).
- **Skills repo not found**: Error "Skills repo not found at /Users/robin/Sites/rvanbaalen-skills" and stop.
