# FixMyFinance — Parsing Diagnostics + Dedupe Improvements

## Summary

Improve trustworthiness and debuggability of PDF parsing by:

- Adding a parsing diagnostics payload that explains what was extracted and why confidence is low/high.
- Hardening transaction deduplication to reduce accidental merges and accidental duplicates.

This is a backend-first change, with minimal frontend changes required to preserve backward compatibility.

## Goals

- Make it obvious when and why the parser is failing (or low-confidence) without reading server logs.
- Reduce duplicate transactions produced across pages and/or extraction modes (table + text fallback).
- Avoid incorrectly deduping legitimately distinct transactions.
- Preserve current UX: upload → processing → insights continues to work.

## Non-Goals

- Full parser rewrite or support for every bank format.
- Introducing a database or external persistence.
- Building a detailed “debug screen” in the UI (optional later).

## Current State (Observed)

- Extraction merges results from table parsing and text fallback and dedupes using `(date, desc, amount)`.
  - Risk: small description differences create duplicates; identical amounts on same date can be different purchases and get merged.
- Parsing confidence is mostly inferred from transaction count and inferred income, not from extraction signals.

## Proposed Backend Changes

### 1) Add `parsingDiagnostics` to the analysis payload

Add a new top-level field to `compute_insights()` return value:

```json
{
  "parsingDiagnostics": {
    "pages": 8,
    "tablesDetected": 12,
    "tablesParsed": 5,
    "modeCounts": { "Card": 123, "Bank": 0, "Text": 12 },
    "dedupeDropped": 7,
    "rejectedRows": {
      "missing_date": 10,
      "missing_amount": 4,
      "non_positive_amount": 3
    },
    "warnings": [
      "Text fallback was used on 3 pages (no tables parsed)."
    ]
  }
}
```

Notes:
- Keep the shape stable and small; values are counts + short warnings.
- If diagnostics cannot be computed (unexpected extraction error), return an empty object and include a warning.

### 2) Improve dedupe strategy

Replace the current dedupe key `(date, desc, amount)` with a more stable derived key:

- Normalize `date` to the existing normalized format (already done).
- Normalize `desc` for keying:
  - uppercase
  - collapse whitespace
  - strip non-informative punctuation
- Include `type` (credit/debit) in the key.
- Include a merchant grouping token when available:
  - `extract_merchant_key(desc)` provides a stable grouping token.

Example key:

```text
date|type|amount|merchant_key|desc_norm_prefix
```

Where `desc_norm_prefix` is a short prefix (e.g., first 20 chars) to prevent merging different merchants that share a token.

### 3) Use diagnostics to set parsing confidence

Extend parsing confidence logic to incorporate diagnostics:

- Low confidence if:
  - high rejected row counts relative to accepted, or
  - heavy reliance on text fallback pages, or
  - unusually high dedupe drop count.
- Keep existing heuristics (transaction count and inferred income) but combine with diagnostics signals.

## Frontend Changes (Compatibility)

- No breaking changes: `parsingDiagnostics` is additive.
- Later UI enhancement (optional): show a small “Data quality details” expandable section on Insights when confidence is medium/low.

## Acceptance Criteria

- Uploading a statement still produces a report and the UI does not crash if `parsingDiagnostics` is absent.
- The API returns `parsingDiagnostics` for:
  - normal parse (`done`)
  - empty/low-confidence payloads.
- Duplicate transactions across pages decrease for statements that currently double-count.
- Transactions that are distinct but share the same amount and date are less likely to be incorrectly merged than the current approach.

## Testing Plan

- Add a small set of unit-like tests for:
  - `desc` normalization function (deterministic)
  - dedupe key generation
  - diagnostics aggregation counters (given synthetic page outputs)
- Add a smoke test that runs against `Test Pdf.pdf` and prints diagnostics counts.

