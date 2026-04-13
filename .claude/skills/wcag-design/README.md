# wcag-design

> Build accessible, production-grade interfaces that conform to **WCAG 2.2 AA** standards — without sacrificing design quality.

This skill gives AI agents comprehensive knowledge of W3C Web Accessibility Initiative (WAI) guidelines, ARIA patterns, and accessible frontend design principles. It covers every WCAG 2.2 success criterion, implementation techniques, testing workflows, and aesthetic strategies to make accessibility a feature of your UI — not an afterthought.

---

## Install

```bash
# Via skills CLI (recommended)
npx skills add alexsnchz/skills --skill wcag-design

# Or install the full collection
npx skills add alexsnchz/skills
```

Works with: **Claude Code**, **Cursor**, **Windsurf**, **OpenCode**, **Copilot**, and [40+ other agents](https://skills.sh).

---

## When to Use This Skill

Invoke `wcag-design` when you need to:

- Build any UI component, page, dashboard, or app that must meet WCAG 2.2 AA (or higher)
- Audit an existing interface for accessibility issues and fix them
- Implement accessible versions of complex interactive components (modals, tabs, comboboxes, sliders, accordions)
- Design a color system that passes contrast requirements while remaining visually distinctive
- Write semantic HTML and WAI-ARIA markup correctly
- Add keyboard navigation, focus management, or screen reader support
- Meet legal requirements: ADA, Section 508, EN 301 549 (EU), AODA (Canada), Equality Act (UK)
- Generate accessible React, Next.js, HTML/CSS, or vanilla JS code
- Create or review accessible forms with proper labeling, validation, and error handling

---

## What's Inside

The skill is a single `SKILL.md` file (~1,200 lines) organized into 9 parts:

| Part | Contents |
|------|----------|
| **1 – WCAG Fundamentals** | History (1.0→2.2→3.0), version compatibility, what WCAG is |
| **2 – POUR Principles** | Perceivable, Operable, Understandable, Robust — in depth |
| **3 – Conformance Levels** | A, AA, AAA criteria counts and legal significance |
| **4 – Full Criterion Reference** | All 87 WCAG 2.2 success criteria, organized by principle and guideline |
| **5 – Implementation Reference** | Contrast rules, semantic HTML, ARIA, keyboard patterns, component recipes |
| **6 – Accessible Design System** | Color systems, typography scale, focus indicators, spacing, motion |
| **7 – Testing Checklist** | Quick audit, standard WCAG AA audit, screen reader testing |
| **8 – Legal Context** | ADA, Section 508, EN 301 549, AODA, Equality Act mapping table |
| **9 – Tools & Resources** | axe, WAVE, Lighthouse, NVDA, VoiceOver, curated links |

---

## Core Capabilities

### Complete WCAG 2.2 Reference

All 87 success criteria, including the 9 new criteria introduced in WCAG 2.2 (marked ⭐):

- `2.4.11` Focus Not Obscured (Minimum) — AA
- `2.4.12` Focus Not Obscured (Enhanced) — AAA
- `2.4.13` Focus Appearance — AAA
- `2.5.7` Dragging Movements — AA
- `2.5.8` Target Size Minimum (24×24px) — AA
- `3.2.6` Consistent Help — A
- `3.3.7` Redundant Entry — A
- `3.3.8` Accessible Authentication (Minimum) — AA
- `3.3.9` Accessible Authentication (Enhanced) — AAA

### WAI-ARIA Patterns

Complete reference for all ARIA landmark roles, widget roles, live region roles, and the most-used properties and states (`aria-expanded`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-invalid`, etc.). Includes the **First Rule of ARIA**: use native HTML first.

### Keyboard Navigation

Full keyboard interaction patterns for every standard component type, focus trap implementation for modals, skip navigation links, and the distinction between `:focus` and `:focus-visible`.

### Accessible Component Recipes

Ready-to-use, copy-paste patterns for:

- **Modals / Dialogs** — using the native `<dialog>` element with `showModal()` + focus management
- **Accordions** — `aria-expanded`, `aria-controls`, `hidden` attribute
- **Tabs** — `role="tablist"`, `role="tab"`, `aria-selected`, arrow key navigation
- **Combobox / Autocomplete** — `role="combobox"`, `aria-haspopup`, keyboard pattern
- **Alert / Status messages** — `role="alert"` vs `role="status"`, `aria-live` regions
- **Forms** — labels, `aria-required`, `aria-invalid`, `aria-describedby`, `<fieldset>/<legend>`

### Design System Integration

CSS custom properties for accessible color palettes (HSL-based for easy contrast math), typography scales, responsive touch targets, and `prefers-reduced-motion` / `prefers-color-scheme` integration patterns.

---

## Example Prompts

Once the skill is installed, you can use prompts like these with your AI agent:

```
Build an accessible modal dialog component in React that traps focus,
announces its title to screen readers, and closes on Escape.
```

```
Review this form and fix all WCAG 2.2 AA issues: missing labels,
poor contrast, no error messages, and keyboard traps.
```

```
Create a dark-mode color palette that passes 4.5:1 contrast ratio
for body text and 3:1 for large text and UI components.
```

```
Implement a fully accessible tab interface using only HTML and
vanilla JS with proper ARIA roles and keyboard navigation.
```

```
Audit this landing page against WCAG 2.2 AA and give me a
prioritized list of issues to fix.
```

```
Add prefers-reduced-motion support to all CSS animations and
transitions in this codebase.
```

---

## Example Output

When building an accessible modal, the skill produces patterns like:

```html
<dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
  id="confirm-modal"
>
  <h2 id="modal-title">Confirm deletion</h2>
  <p id="modal-desc">This action cannot be undone. Are you sure?</p>
  <button type="button" autofocus>Cancel</button>
  <button type="button">Delete</button>
</dialog>
```

```javascript
const modal = document.getElementById('confirm-modal');
const trigger = document.getElementById('delete-btn');

trigger.addEventListener('click', () => modal.showModal());
modal.addEventListener('close', () => trigger.focus()); // Always restore focus
```

```css
/* WCAG 2.4.7 compliant focus indicator — never hidden */
:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Respect user motion preferences (WCAG 2.3.3) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Contrast Ratio Quick Reference

| Context | AA (Required) | AAA (Enhanced) |
|---------|:---:|:---:|
| Normal text (< 18px or < 14px bold) | **4.5:1** | **7:1** |
| Large text (≥ 18px or ≥ 14px bold) | **3:1** | **4.5:1** |
| UI components & graphical elements | **3:1** | **3:1** |
| Placeholder text | **4.5:1** | — |
| Disabled / decorative elements | Exempt | Exempt |

---

## The 15 Non-Negotiable WCAG 2.2 AA Rules

No matter what you're building, these always apply:

1. **Contrast** — 4.5:1 normal text, 3:1 large text and UI components
2. **Alt text** — every informative image has descriptive alt; decorative uses `alt=""`
3. **Keyboard** — 100% of functionality reachable and operable by keyboard
4. **Focus visible** — visible focus indicator, never removed without replacement
5. **Labels** — every form input has an associated visible `<label>`
6. **Errors** — identified in text, not color alone; suggestions provided
7. **Headings** — logical hierarchy, no skipped levels (h1→h2→h3)
8. **Language** — `<html lang="en">` always set; content changes marked
9. **Semantic HTML** — use `<button>`, `<nav>`, `<main>` — not `<div>` substitutes
10. **No color-only info** — color never the sole means to convey information
11. **Reflow** — content usable at 320px wide without horizontal scrolling
12. **Touch targets** — interactive elements ≥ 24×24 CSS pixels with adequate spacing
13. **Focus not obscured** — sticky headers/footers don't hide focused elements
14. **Status messages** — dynamic status/error messages announced to screen readers
15. **Consistent help** — help mechanisms in the same location across pages

---

## Legal Compliance Reference

| Law / Standard | Jurisdiction | WCAG Level Required |
|----------------|-------------|---------------------|
| ADA (Americans with Disabilities Act) | USA | WCAG 2.1 AA |
| Section 508 | USA – Federal | WCAG 2.0 AA |
| EN 301 549 | European Union | WCAG 2.1 AA |
| AODA | Ontario, Canada | WCAG 2.0 AA |
| Equality Act 2010 | United Kingdom | WCAG 2.1 AA |
| BITV 2.0 | Germany | WCAG 2.1 AA |

> **Recommended target: WCAG 2.2 AA** — exceeds all major legal requirements and is future-proof against forthcoming regulations.

---

## Standards Coverage

This skill is based directly on the following W3C specifications and authoritative sources:

- [WCAG 2.2 Specification](https://www.w3.org/TR/WCAG22/) — W3C Recommendation
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) — W3C WAI
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/) — W3C WAI
- [WebAIM Articles and Techniques](https://webaim.org/articles/) — WebAIM
- [Deque University](https://dequeuniversity.com/) — Deque Systems
- [The A11Y Project](https://www.a11yproject.com/) — Community resource
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) — MDN Web Docs
- [Inclusive Components](https://inclusive-components.design/) — Heydon Pickering

---

## Compatibility

Works with any AI coding agent that supports the [skills specification](https://skills.sh):

| Agent | Support |
|-------|---------|
| Claude Code | ✅ |
| Cursor | ✅ |
| Windsurf | ✅ |
| OpenCode | ✅ |
| GitHub Copilot | ✅ |
| Aider | ✅ |
| Continue | ✅ |

---

## Skill File Structure

```
wcag-design/
├── SKILL.md      ← Agent instructions + full WCAG reference (required)
└── README.md     ← This file (human-readable documentation)
```

---

## Version

| Field | Value |
|-------|-------|
| Skill version | 1.0.0 |
| WCAG version covered | 2.2 (October 2023) |
| Last updated | March 2026 |
| WCAG 3.0 notes | Included (draft, expected ~2028) |

---

## License

MIT — free to use, fork, and adapt.

---

## Keywords

`wcag` · `accessibility` · `a11y` · `aria` · `wai` · `w3c` · `wcag2` · `wcag22` · `wcag-2.2` ·
`screen-reader` · `keyboard-navigation` · `color-contrast` · `semantic-html` · `inclusive-design` ·
`ada-compliance` · `section-508` · `en-301-549` · `frontend` · `react` · `nextjs` · `html` · `css`
