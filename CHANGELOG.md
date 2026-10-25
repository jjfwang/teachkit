# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release PRs add entries under `Unreleased`, then move them into a new dated
version section when the release ships.

## [Unreleased]

- Gold backfill slice 1 of #1452 (issue #1453, epic #1204): the Phase C assessment family for secondary-science-cells - samples/diagnostics/secondary-science-cells.json (3 doNow plus 2 hinge questions keyed to script cue s6, every distractor coded with the MISCONCEPTIONS[bio-cells] wrongTurn verbatim), samples/worked-examples/secondary-science-cells.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/secondary-science-cells.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new secondary-science-cells STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)

- Gold backfill slice 3 of #1445 (issue #1450, epic #1204): the teaching/assessment-close family for secondary-science-electricity, the final slice - samples/plans/secondary-science-electricity.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s6, every objective delivered), samples/homework/secondary-science-electricity.json (3 of the 5 paired worksheet questions verbatim, q2/q3/q4 deep-equal, variant homework), samples/summatives/secondary-science-electricity.json (unit-level with the secondary-physics-energy sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/secondary-science-electricity.json (model answers verbatim from single worksheet questions q3/q5, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new secondary-science-electricity STEMS entries (the summative directory-equality test follows the extended twenty-six stems). No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for secondary-science-electricity under #1445. (2026-10-25)

- Gold backfill slice 2 of #1445 (issue #1448, epic #1204): the study family for secondary-science-electricity - samples/revision/secondary-science-electricity.json (flashcards verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholding every back and practice answer), samples/organisers/secondary-science-electricity.json (flow entries deep-equal the paired notes mechanismSteps in order plus a frayer keyed to the definition terms and meanings, student sheet withholding every entry), samples/glossary/secondary-science-electricity.json (entries deep-equal the paired notes definitions in notes order, every example verbatim from the notes workedExample or mechanismSteps) and samples/scaffolds/secondary-science-electricity.json (full, partial and minimal sets fading non-increasingly, word-bank terms exact notes definition terms, cloze answers from the same set word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new secondary-science-electricity STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)

- Gold backfill slice 1 of #1445 (issue #1446, epic #1204): the Phase C assessment family for secondary-science-electricity - samples/diagnostics/secondary-science-electricity.json (3 doNow plus 2 hinge questions keyed to script cue s6, every distractor coded with the MISCONCEPTIONS[phys-electricity] wrongTurn verbatim), samples/worked-examples/secondary-science-electricity.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/secondary-science-electricity.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new secondary-science-electricity STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)

- Gold backfill slice 3 of #1438 (issue #1443, epic #1204): the teaching/assessment-close family for secondary-e-probability, the final slice - samples/plans/secondary-e-probability.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s6, every objective delivered), samples/homework/secondary-e-probability.json (3 of the 5 paired worksheet questions verbatim, q2/q3/q4 deep-equal, variant homework), samples/summatives/secondary-e-probability.json (unit-level with the secondary-e-mensuration sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/secondary-e-probability.json (model answers verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new secondary-e-probability STEMS entries (the summative directory-equality test follows the extended twenty-five stems). No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for secondary-e-probability under #1438. (2026-10-25)

- Gold backfill slice 2 of #1438 (issue #1441, epic #1204): the study family for secondary-e-probability - samples/revision/secondary-e-probability.json (flashcards verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholding every back and practice answer), samples/organisers/secondary-e-probability.json (flow entries deep-equal the paired notes mechanismSteps in order plus a frayer keyed to the definition terms and meanings, student sheet withholding every entry), samples/glossary/secondary-e-probability.json (entries deep-equal the paired notes definitions in notes order, every example verbatim from the notes workedExample or mechanismSteps) and samples/scaffolds/secondary-e-probability.json (full, partial and minimal sets fading non-increasingly, word-bank terms exact notes definition terms, cloze answers from the same set word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new secondary-e-probability STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)

### Fixed

- Pack-to-animation manifest pinning (issue #1306, clean-up (ii) of epic #1204): the four gold lesson packs that join to their animations only by differing filenames — primary-math-decimals with primary-math-decimals-place-value, primary-math-percentage with primary-math-percentage-of-quantity, primary-math-ratio with primary-math-ratio-sharing, and primary-science-photosynthesis with primary-science-photosynthesis-intro — now name the paired animation file explicitly in their player/pack-demo.html manifest headers, so the join is data rather than a filename convention. tests/pack-demo-set.test.js gains set-level pins deriving every pack-to-animation pair from the manifest (an explicit pin, else the same-name convention): the four differing pairs must match exactly, every gold pack must resolve to an existing animation file (so a future differing-filename pack without a manifest entry fails), and the only unjoined animation is secondary-math-pythagoras, which has no gold pack at all. No sample files are renamed and the generated lesson-pack manifest is unchanged. (2026-10-24)

- Organisers notes-content model (issue #1279, follow-up to #1277): generateOrganisers no longer resolves the topic misconception bank entry or rejects bank-less topics - SPEC.md's Organisers section and the code now agree that an organisers material is generated from the shared lesson unpack and the topic's paired notes content, so a topic with gold notes but no bank entry can still grow one. generator/build_organisers_prompt.js accepts optional opts.definitions (array of {term, meaning}) and opts.mechanismSteps (array of non-empty strings) on the build_scaffold_prompt.js precedent - absent or empty means none supplied, malformed throws a descriptive buildOrganisersPrompts error - and renders supplied notes content into the author user message; generator/pipeline.js generateOrganisers passes opts.definitions and opts.mechanismSteps through, rejects only on a missing callChat or missing validator (naming generateOrganisers / validateOrganisers), and still names organisers on repair exhaustion. Pinned by tests/organisers.test.js (the no-bank rejection test is replaced by a notes-content generation test; prompt-level pins cover supplied content reaching the author prompt and malformed content throwing). (2026-10-23)

- Pipeline file header comment (issue #1265): the top-of-file header in generator/pipeline.js now says generateLessonPack authors all eleven materials and names the quiz bank last, matching SPEC.md and the generateLessonPack docblock after the issue #1263 fold-in. Comment-only; no behavior change. (2026-10-23)

### Added

- Gold backfill slice 1 of #1438 (issue #1439, epic #1204): the Phase C assessment family for secondary-e-probability - samples/diagnostics/secondary-e-probability.json (3 doNow plus 2 hinge questions keyed to script cue s6, every distractor coded with the MISCONCEPTIONS[e-probability] wrongTurn verbatim), samples/worked-examples/secondary-e-probability.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/secondary-e-probability.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new secondary-e-probability STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 3 of #1431 (issue #1436, epic #1204), the final slice: the teaching/assessment-close family for secondary-e-mensuration - samples/plans/secondary-e-mensuration.json (a 40-minute plan echoing the paired gold script on title/level/subject/topic, minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/secondary-e-mensuration.json (3 of the 5 paired worksheet questions verbatim, q2/q3/q4 deep-equal), samples/summatives/secondary-e-mensuration.json (unit-level with the secondary-e-trigonometry sibling, blueprint 10+10=20=totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/secondary-e-mensuration.json (model answers verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new secondary-e-mensuration STEMS entries (the summative directory-equality sub-test now follows the extended twenty-four stems). No validator, renderer, pipeline or demo changes. This completes #1431 and the eleven-material gold backfill for secondary-e-mensuration. (2026-10-25)
- Gold backfill slice 2 of #1431 (issue #1434, epic #1204): the study family for secondary-e-mensuration - samples/revision/secondary-e-mensuration.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/secondary-e-mensuration.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/secondary-e-mensuration.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/secondary-e-mensuration.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new secondary-e-mensuration STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 1 of #1431 (issue #1432, epic #1204): the Phase C assessment family for secondary-e-mensuration - samples/diagnostics/secondary-e-mensuration.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[e-mensuration] wrongTurn verbatim), samples/worked-examples/secondary-e-mensuration.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/secondary-e-mensuration.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new secondary-e-mensuration STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 1 of #1424 (issue #1425, epic #1204): the Phase C assessment family for secondary-e-trigonometry - samples/diagnostics/secondary-e-trigonometry.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[e-trigonometry] wrongTurn verbatim), samples/worked-examples/secondary-e-trigonometry.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/secondary-e-trigonometry.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new secondary-e-trigonometry STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 2 of #1424 (issue #1427, epic #1204): the study family for secondary-e-trigonometry - samples/revision/secondary-e-trigonometry.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/secondary-e-trigonometry.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/secondary-e-trigonometry.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/secondary-e-trigonometry.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new secondary-e-trigonometry STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 3 of #1424 (issue #1429, epic #1204), the final slice: the teaching/assessment-close family for secondary-e-trigonometry - samples/plans/secondary-e-trigonometry.json (a 40-minute plan echoing the paired gold script on title/level/subject/topic, minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/secondary-e-trigonometry.json (3 of the 5 paired worksheet questions verbatim, q2/q3/q4 deep-equal), samples/summatives/secondary-e-trigonometry.json (unit-level with the secondary-e-algebra sibling, blueprint 10+10=20=totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/secondary-e-trigonometry.json (model answers verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new secondary-e-trigonometry STEMS entries (the summative directory-equality sub-test now follows the extended twenty-three stems). No validator, renderer, pipeline or demo changes. This completes #1424 and the eleven-material gold backfill for secondary-e-trigonometry. (2026-10-25)
- Gold backfill slice 3 of #1417 (issue #1422, epic #1204), the final slice: the teaching/assessment-close family for primary-science-photosynthesis - samples/plans/primary-science-photosynthesis.json (a 40-minute plan echoing the paired gold script on title/level/subject/topic, minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/primary-science-photosynthesis.json (3 of the 5 paired worksheet questions verbatim, q1/q3/q4 deep-equal), samples/summatives/primary-science-photosynthesis.json (unit-level with the primary-science-water-cycle sibling, blueprint 10+10=20=totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-science-photosynthesis.json (model answers verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-science-photosynthesis STEMS entries (the summative directory-equality sub-test now follows the extended twenty-two stems). No validator, renderer, pipeline or demo changes. This completes #1417 and the eleven-material gold backfill for primary-science-photosynthesis. (2026-10-25)
- Gold backfill slice 2 of #1417 (issue #1420, epic #1204): the study family for primary-science-photosynthesis - samples/revision/primary-science-photosynthesis.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-science-photosynthesis.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-science-photosynthesis.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-science-photosynthesis.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-science-photosynthesis STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 1 of #1417 (issue #1418, epic #1204): the Phase C assessment family for primary-science-photosynthesis - samples/diagnostics/primary-science-photosynthesis.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[photosynthesis] wrongTurn verbatim), samples/worked-examples/primary-science-photosynthesis.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-science-photosynthesis.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-science-photosynthesis STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 3 of #1410 (issue #1415, epic #1204), the final slice: the teaching/assessment-close family for primary-science-energy-forms - samples/plans/primary-science-energy-forms.json (a 40-minute plan echoing the paired gold script on title/level/subject/topic, minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/primary-science-energy-forms.json (3 of the 5 paired worksheet questions verbatim, q1/q3/q4 deep-equal), samples/summatives/primary-science-energy-forms.json (unit-level with the primary-science-water-cycle sibling, blueprint 10+10=20=totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-science-energy-forms.json (model answers verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-science-energy-forms STEMS entries (the summative directory-equality sub-test now follows the extended twenty-one stems). No validator, renderer, pipeline or demo changes. This completes #1410 and the eleven-material gold backfill for primary-science-energy-forms. (2026-10-25)
- Gold backfill slice 2 of #1410 (issue #1413, epic #1204): the study family for primary-science-energy-forms - samples/revision/primary-science-energy-forms.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-science-energy-forms.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-science-energy-forms.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-science-energy-forms.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-science-energy-forms STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-25)

- Gold backfill slice 1 of #1410 (issue #1411, epic #1204): the Phase C assessment family for primary-science-energy-forms - samples/diagnostics/primary-science-energy-forms.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[energy-forms] wrongTurn verbatim), samples/worked-examples/primary-science-energy-forms.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-science-energy-forms.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-science-energy-forms STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)

- Gold backfill slice 3 of #1403 (issue #1408, epic #1204), the final slice: the teaching/assessment-close family for primary-science-adaptations - samples/plans/primary-science-adaptations.json (a 40-minute plan echoing the paired gold script on title/level/subject/topic, minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/primary-science-adaptations.json (3 of the 5 paired worksheet questions verbatim, q1/q3/q4 deep-equal), samples/summatives/primary-science-adaptations.json (unit-level with the primary-science-water-cycle sibling, blueprint 10+10=20=totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-science-adaptations.json (model answers verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-science-adaptations STEMS entries (the summative directory-equality sub-test now follows the extended twenty stems). No validator, renderer, pipeline or demo changes. This completes #1403 and the eleven-material gold backfill for primary-science-adaptations. (2026-10-25)
- Gold backfill slice 2 of #1403 (issue #1406, epic #1204): the study family for primary-science-adaptations - samples/revision/primary-science-adaptations.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-science-adaptations.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-science-adaptations.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-science-adaptations.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-science-adaptations STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 1 of #1403 (issue #1404, epic #1204): the Phase C assessment family for primary-science-adaptations — samples/diagnostics/primary-science-adaptations.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[adaptations] wrongTurn verbatim), samples/worked-examples/primary-science-adaptations.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-science-adaptations.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) — derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-science-adaptations STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-25)
- Gold backfill slice 3 of #1396 (issue #1401, epic #1204), the final slice: the teaching/assessment-close family for primary-science-life-cycles - samples/plans/primary-science-life-cycles.json (a 40-minute plan echoing the paired gold script on title/level/subject/topic, minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/primary-science-life-cycles.json (3 of the 5 paired worksheet questions verbatim, q1/q3/q4 deep-equal), samples/summatives/primary-science-life-cycles.json (unit-level with the primary-science-water-cycle sibling, blueprint 10+10=20=totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-science-life-cycles.json (model answers jointly verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-science-life-cycles STEMS entries (the summative directory-equality sub-test now follows the extended nineteen stems). No validator, renderer, pipeline or demo changes. This completes #1396 and the eleven-material gold backfill for primary-science-life-cycles. (2026-10-25)
- Gold backfill slice 2 of #1396 (issue #1399, epic #1204): the study family for primary-science-life-cycles - samples/revision/primary-science-life-cycles.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-science-life-cycles.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-science-life-cycles.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-science-life-cycles.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-science-life-cycles STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)
- Gold backfill slice 1 of #1396 (issue #1397, epic #1204): the Phase C assessment family for primary-science-life-cycles — samples/diagnostics/primary-science-life-cycles.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[life-cycles] wrongTurn verbatim), samples/worked-examples/primary-science-life-cycles.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-science-life-cycles.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) — derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-science-life-cycles STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)
- Gold backfill slice 3 of #1389 (issue #1394, epic #1204), the final slice: the teaching/assessment-close family for primary-science-plant-systems - samples/plans/primary-science-plant-systems.json (a 40-minute plan echoing the paired gold script on title/level/subject/topic, minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/primary-science-plant-systems.json (3 of the 5 paired worksheet questions verbatim, q1/q3/q4 deep-equal), samples/summatives/primary-science-plant-systems.json (unit-level with the primary-science-water-cycle sibling, blueprint 10+10=20=totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-science-plant-systems.json (model answers jointly verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-science-plant-systems STEMS entries (the summative directory-equality sub-test now follows the extended eighteen stems). No validator, renderer, pipeline or demo changes. This completes #1389 and the eleven-material gold backfill for primary-science-plant-systems. (2026-10-24)
- Gold backfill slice 2 of #1389 (issue #1392, epic #1204): the study family for primary-science-plant-systems - samples/revision/primary-science-plant-systems.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-science-plant-systems.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-science-plant-systems.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-science-plant-systems.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-science-plant-systems STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)
- Gold backfill slice 1 of #1389 (issue #1390, epic #1204): the Phase C assessment family for primary-science-plant-systems — samples/diagnostics/primary-science-plant-systems.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[plant-systems] wrongTurn verbatim), samples/worked-examples/primary-science-plant-systems.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-science-plant-systems.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) — derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-science-plant-systems STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)
- Gold backfill slice 3 of #1382 (issue #1387, epic #1204), the final slice: the teaching/assessment-close family for primary-science-human-body-systems - samples/plans/primary-science-human-body-systems.json (a 40-minute plan echoing the paired gold script on title/level/subject/topic, minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/primary-science-human-body-systems.json (3 of the 5 paired worksheet questions verbatim, q1/q3/q4 deep-equal), samples/summatives/primary-science-human-body-systems.json (unit-level with the primary-science-water-cycle sibling, blueprint 10+10=20=totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-science-human-body-systems.json (model answers jointly verbatim from single worksheet questions q3/q4, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-science-human-body-systems STEMS entries (the summative directory-equality sub-test now follows the extended seventeen stems). No validator, renderer, pipeline or demo changes. This completes #1382 and the eleven-material gold backfill for primary-science-human-body-systems. (2026-10-24)
- Gold backfill slice 2 of #1382 (issue #1385, epic #1204): the study family for primary-science-human-body-systems - samples/revision/primary-science-human-body-systems.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-science-human-body-systems.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-science-human-body-systems.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-science-human-body-systems.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-science-human-body-systems STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1382 (issue #1383, epic #1204): the Phase C assessment family for primary-science-human-body-systems — samples/diagnostics/primary-science-human-body-systems.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[human-body-systems] wrongTurn verbatim), samples/worked-examples/primary-science-human-body-systems.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-science-human-body-systems.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) — derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-science-human-body-systems STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1375 (issue #1380, epic #1204): the teaching/assessment-close family for primary-science-forces-magnets, the final slice - samples/plans/primary-science-forces-magnets.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s4, every objective delivered), samples/homework/primary-science-forces-magnets.json (3 of the 5 paired worksheet questions verbatim, variant homework), samples/summatives/primary-science-forces-magnets.json (unit-level with the primary-science-water-cycle sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-science-forces-magnets.json (model answers and creditPoints verbatim from the paired worksheet and exit ticket, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-science-forces-magnets STEMS entries (the summative directory-equality test follows the extended sixteen stems). No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for primary-science-forces-magnets under #1375. (2026-10-24)

- Gold backfill slice 2 of #1375 (issue #1378, epic #1204): the study family for primary-science-forces-magnets - samples/revision/primary-science-forces-magnets.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-science-forces-magnets.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-science-forces-magnets.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-science-forces-magnets.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-science-forces-magnets STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1375 (issue #1376, epic #1204): the Phase C assessment family for primary-science-forces-magnets - samples/diagnostics/primary-science-forces-magnets.json (3 doNow plus 2 hinge questions keyed to script cue s4, every distractor coded with the MISCONCEPTIONS[forces-magnets] wrongTurn verbatim), samples/worked-examples/primary-science-forces-magnets.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-science-forces-magnets.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-science-forces-magnets STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1368 (issue #1373, epic #1204): the teaching/assessment-close family for primary-math-data-graphs, the final slice - samples/plans/primary-math-data-graphs.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s4, every objective delivered), samples/homework/primary-math-data-graphs.json (3 of the 5 paired worksheet questions verbatim, variant homework), samples/summatives/primary-math-data-graphs.json (unit-level with the primary-math-fractions-addition sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-math-data-graphs.json (model answers and creditPoints verbatim from the paired worksheet and exit ticket, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-math-data-graphs STEMS entries (the summative directory-equality test follows the extended fifteen stems). No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for primary-math-data-graphs under #1368. (2026-10-24)

- Gold backfill slice 2 of #1368 (issue #1371, epic #1204): the study family for primary-math-data-graphs - samples/revision/primary-math-data-graphs.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-math-data-graphs.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-math-data-graphs.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-math-data-graphs.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-math-data-graphs STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1368 (issue #1369, epic #1204): the Phase C assessment family for primary-math-data-graphs - samples/diagnostics/primary-math-data-graphs.json (3 doNow plus 2 hinge questions keyed to script cues s4 and s3, every distractor coded with the MISCONCEPTIONS[data-graphs] wrongTurn verbatim), samples/worked-examples/primary-math-data-graphs.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-math-data-graphs.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-math-data-graphs STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1361 (issue #1366, epic #1204): the teaching/assessment-close family for primary-math-model-method, the final slice - samples/plans/primary-math-model-method.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s4, every objective delivered), samples/homework/primary-math-model-method.json (3 of the 5 paired worksheet questions verbatim, variant homework), samples/summatives/primary-math-model-method.json (unit-level with the primary-math-fractions-addition sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-math-model-method.json (model answers and creditPoints verbatim from the paired worksheet and exit ticket, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-math-model-method STEMS entries (the summative directory-equality test follows the extended fourteen stems). No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for primary-math-model-method under #1361. (2026-10-24)


- Gold backfill slice 2 of #1361 (issue #1364, epic #1204): the study family for primary-math-model-method - samples/revision/primary-math-model-method.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-math-model-method.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-math-model-method.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-math-model-method.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-math-model-method STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1361 (issue #1362, epic #1204): the Phase C assessment family for primary-math-model-method - samples/diagnostics/primary-math-model-method.json (3 doNow plus 2 hinge questions keyed to script cues s3 and s4, every distractor coded with the MISCONCEPTIONS[model-method] wrongTurn verbatim), samples/worked-examples/primary-math-model-method.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-math-model-method.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-math-model-method STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1354 (issue #1359, epic #1204): the teaching/assessment-close family for primary-math-rate-speed, the final slice - samples/plans/primary-math-rate-speed.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s4, every objective delivered), samples/homework/primary-math-rate-speed.json (3 of the 5 paired worksheet questions verbatim, variant homework), samples/summatives/primary-math-rate-speed.json (unit-level with the primary-math-fractions-addition sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-math-rate-speed.json (model answers and creditPoints verbatim from the paired worksheet and exit ticket, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-math-rate-speed STEMS entries (the summative directory-equality test follows the extended thirteen stems). No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for primary-math-rate-speed under #1354. (2026-10-24)

- Gold backfill slice 2 of #1354 (issue #1357, epic #1204): the study family for primary-math-rate-speed - samples/revision/primary-math-rate-speed.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-math-rate-speed.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-math-rate-speed.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-math-rate-speed.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-math-rate-speed STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1354 (issue #1355, epic #1204): the Phase C assessment family for primary-math-rate-speed - samples/diagnostics/primary-math-rate-speed.json (3 doNow plus 2 hinge questions keyed to script cues s3 and s4, every distractor coded with the MISCONCEPTIONS[rate-speed] wrongTurn verbatim), samples/worked-examples/primary-math-rate-speed.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-math-rate-speed.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-math-rate-speed STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1347 (issue #1352, epic #1204): the teaching/assessment-close family for primary-math-area-perimeter, the final slice - samples/plans/primary-math-area-perimeter.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s4, every objective delivered), samples/homework/primary-math-area-perimeter.json (3 of the 5 paired worksheet questions verbatim, variant homework), samples/summatives/primary-math-area-perimeter.json (unit-level with the primary-math-fractions-addition sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-math-area-perimeter.json (model answers and creditPoints verbatim from the paired worksheet and exit ticket, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-math-area-perimeter STEMS entries (the summative directory-equality test follows the extended twelve stems). No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for primary-math-area-perimeter under #1347. (2026-10-24)

- Gold backfill slice 2 of #1347 (issue #1350, epic #1204): the study family for primary-math-area-perimeter - samples/revision/primary-math-area-perimeter.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-math-area-perimeter.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-math-area-perimeter.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-math-area-perimeter.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-math-area-perimeter STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1347 (issue #1348, epic #1204): the Phase C assessment family for primary-math-area-perimeter - samples/diagnostics/primary-math-area-perimeter.json (3 doNow plus 2 hinge questions keyed to script cues s3 and s4, every distractor coded with the MISCONCEPTIONS[area-perimeter] wrongTurn verbatim), samples/worked-examples/primary-math-area-perimeter.json (complete plus faded examples derived verbatim from the paired notes workedExample, mechanismSteps and definitions and the paired worksheet) and samples/quiz-banks/primary-math-area-perimeter.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-math-area-perimeter STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1340 (issue #1345, epic #1204): the teaching/assessment-close family for primary-math-ratio, the final slice - samples/plans/primary-math-ratio.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s4, every objective delivered), samples/homework/primary-math-ratio.json (3 of the 5 paired worksheet questions verbatim, variant homework), samples/summatives/primary-math-ratio.json (unit-level with the primary-math-fractions-addition sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-math-ratio.json (model answers and creditPoints verbatim from the paired worksheet and exit ticket, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-math-ratio STEMS entries (the summative directory-equality test follows the extended eleven stems). No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for primary-math-ratio under #1340. (2026-10-24)

- Gold backfill slice 2 of #1340 (issue #1343, epic #1204): the study family for primary-math-ratio - samples/revision/primary-math-ratio.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-math-ratio.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-math-ratio.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-math-ratio.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-math-ratio STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1340 (issue #1341, epic #1204): the Phase C assessment family for primary-math-ratio - samples/diagnostics/primary-math-ratio.json (3 doNow plus 2 hinge questions keyed to script cues s3 and s4, every distractor coded with the MISCONCEPTIONS[ratio] wrongTurn verbatim), samples/worked-examples/primary-math-ratio.json (complete plus faded examples derived verbatim from the paired notes workedExample and mechanismSteps and the paired worksheet) and samples/quiz-banks/primary-math-ratio.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-math-ratio STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1333 (issue #1338, epic #1204): the teaching/assessment-close family for primary-math-percentage - samples/plans/primary-math-percentage.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, script cues s1-s4, every objective delivered), samples/homework/primary-math-percentage.json (3 of the 5 paired worksheet questions verbatim, variant homework), samples/summatives/primary-math-percentage.json (unit-level with the primary-math-fractions-addition sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-math-percentage.json (model answers and creditPoints verbatim from the paired worksheet and exit ticket, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-math-percentage STEMS entries (the summative directory-equality test follows the extended ten stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 2 of #1333 (issue #1336, epic #1204): the study family for primary-math-percentage - samples/revision/primary-math-percentage.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-math-percentage.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-math-percentage.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-math-percentage.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-math-percentage STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1333 (issue #1334, epic #1204): the Phase C assessment family for primary-math-percentage - samples/diagnostics/primary-math-percentage.json (3 doNow plus 2 hinge questions keyed to script cues s3 and s4, every distractor coded with the MISCONCEPTIONS[percentage] wrongTurn verbatim), samples/worked-examples/primary-math-percentage.json (complete plus faded examples derived verbatim from the paired notes workedExample and mechanismSteps and the paired worksheet) and samples/quiz-banks/primary-math-percentage.json (6 items drawn verbatim from the paired worksheet and exit ticket, the opening item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-math-percentage STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1326 (issue #1331, epic #1204): the teaching/assessment-close family for primary-math-decimals, the final slice - samples/plans/primary-math-decimals.json (a 40-minute plan echoing the paired gold script on title, level, subject and topic, activity minutes summing to duration, cues s1-s4, every objective delivered), samples/homework/primary-math-decimals.json (variant homework carrying 3 of the 5 paired worksheet questions verbatim), samples/summatives/primary-math-decimals.json (unit-level with the primary-math-fractions-addition sibling, blueprint rows summing to totalMarks, items and mark schemes summing, moderation unreviewed with review null) and samples/feedback/primary-math-decimals.json (model answers verbatim from the paired worksheet and exit ticket, common errors verbatim from the paired trap surfaces) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new primary-math-decimals STEMS entries; the two rendering assertions on the misconception in the feedback gold test now compare printable.escapeHtml forms (the slice-1 precedent), because the decimals wrongTurn contains a greater-than sign the renderers escape - the verbatim derivation pins stay raw. No validator, renderer, pipeline or demo changes. Merging this slice completes the eleven-material gold backfill for primary-math-decimals under #1326. (2026-10-24)

- Gold backfill slice 2 of #1326 (issue #1329, epic #1204): the study family for primary-math-decimals - samples/revision/primary-math-decimals.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/primary-math-decimals.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/primary-math-decimals.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/primary-math-decimals.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new primary-math-decimals STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1326 (issue #1327, epic #1204): the Phase C assessment family for primary-math-decimals - samples/diagnostics/primary-math-decimals.json (3 doNow plus 2 hinge questions keyed to script cues s3 and s4, every distractor coded with the MISCONCEPTIONS[decimals] wrongTurn verbatim), samples/worked-examples/primary-math-decimals.json (complete plus faded examples derived verbatim from the paired notes workedExample and mechanismSteps and the paired worksheet) and samples/quiz-banks/primary-math-decimals.json (6 items drawn verbatim from the paired worksheet and exit ticket, the comparison item bank-coded) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new primary-math-decimals STEMS entries; the two rendering assertions on the misconception code in the diagnostics and quiz-bank gold tests now compare printable.escapeHtml forms (the glossary/guide gold precedent), because the decimals wrongTurn contains a greater-than sign the renderers escape - the verbatim derivation pins stay raw. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1319 (issue #1324, epic #1204): the teaching/assessment-close family for secondary-science-photosynthesis - samples/plans/secondary-science-photosynthesis.json (a 40-minute lesson plan echoing the paired gold script on title, level, subject and topic, activity minutes summing exactly to the duration, every scriptCue naming a cue in the paired script and every objective delivered by at least one activity), samples/homework/secondary-science-photosynthesis.json (a homework selection of 3 questions copied verbatim from the paired gold worksheet, which carries 5 questions), samples/summatives/secondary-science-photosynthesis.json (a unit test spanning secondary-science-photosynthesis plus secondary-science-bio-nutrition, blueprint rows summing to the total marks, every item mark scheme summing to its item marks, moderation unreviewed with review null, student paper withholding every mark-scheme point text and rubric descriptor while the answer key shows them all) and samples/feedback/secondary-science-photosynthesis.json (model answers derived verbatim from single paired worksheet questions with credit points equal to their source mark schemes, common errors coded to the paired notes trap misconception verbatim, the fix-its student sheet withholding every model answer and corrected working) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new secondary-science-photosynthesis STEMS entries (the lesson-plan gate sub-test stays pinned to the original six gate stems, and the summative directory-equality sub-test follows the extended stems). Merging this slice completes the eleven-material gold backfill for secondary-science-photosynthesis. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 2 of #1319 (issue #1322, epic #1204): the study family for secondary-science-photosynthesis - samples/revision/secondary-science-photosynthesis.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/secondary-science-photosynthesis.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/secondary-science-photosynthesis.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/secondary-science-photosynthesis.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new secondary-science-photosynthesis STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1319 (issue #1320, epic #1204): the Phase C assessment family for secondary-science-photosynthesis - samples/diagnostics/secondary-science-photosynthesis.json (3 doNow plus 2 hinge questions keyed to the s2 and s5 script cues, every distractor coded with the MISCONCEPTIONS[bio-nutrition].facets.photosynthesis wrongTurn verbatim, hinge scriptCues drawn from the paired gold script cues, student sheet withholds misconception codes and rationales), samples/worked-examples/secondary-science-photosynthesis.json (complete and faded examples derived verbatim from the paired notes workedExample and mechanismSteps, at least 2 steps each, student sheet withholds the faded steps and the paired solution) and samples/quiz-banks/secondary-science-photosynthesis.json (6 retrieval items drawn verbatim from the paired worksheet and exit ticket, the oxygen-source item coded to the photosynthesis facet wrongTurn verbatim, student sheet withholds choiceless answers and codes) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new secondary-science-photosynthesis STEMS entries (the two bank-resolving gold tests now pass the stem final token as the misconceptionFor facet hint, so faceted topics pin their own facet verbatim while unfaceted and primary-facet topics resolve exactly as before; word equations use the unicode arrow because the printable renderers HTML-escape the ASCII arrow). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 3 of #1312 (issue #1317, epic #1204): the teaching/assessment-close family for secondary-math-pythagoras - samples/plans/secondary-math-pythagoras.json (a 45-minute lesson plan echoing the paired gold script on title, level, subject and topic, activity minutes summing exactly to the duration, every scriptCue naming a cue in the paired script and every objective delivered by at least one activity), samples/homework/secondary-math-pythagoras.json (a homework selection of 3 questions copied verbatim from the paired gold worksheet, which carries 5 questions), samples/summatives/secondary-math-pythagoras.json (a unit test spanning secondary-math-pythagoras plus secondary-e-trigonometry, blueprint rows summing to the total marks, every item mark scheme summing to its item marks, moderation unreviewed with review null, student paper withholding every mark-scheme point text and rubric descriptor while the answer key shows them all) and samples/feedback/secondary-math-pythagoras.json (model answers derived verbatim from single paired worksheet questions with credit points equal to their source mark schemes, common errors coded to the paired notes trap misconception verbatim, the fix-its student sheet withholding every model answer and corrected working) - derivation pinned verbatim by tests/lesson-plan-gold.test.js, tests/homework.test.js, tests/summative-gold.test.js and tests/feedback-gold.test.js via the new secondary-math-pythagoras STEMS entries (the lesson-plan gate sub-test stays pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 2 of #1312 (issue #1315, epic #1204): the study family for secondary-math-pythagoras - samples/revision/secondary-math-pythagoras.json (flashcards derived verbatim from the paired notes definitions and trap plus quiz-bank items, practice sets drawn only from the paired quiz bank, study sheet withholds every back and practice answer), samples/organisers/secondary-math-pythagoras.json (a flow template whose entries are the paired notes mechanismSteps in order plus a frayer template keyed to the notes definition terms and meanings, student sheet withholds every entry), samples/glossary/secondary-math-pythagoras.json (entries deep-equal the paired notes definitions in notes order, every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and samples/scaffolds/secondary-math-pythagoras.json (full, partial and minimal sets fading non-increasingly, every word-bank term an exact paired notes definition term and every cloze answer from the same set's word bank) - derivation pinned verbatim by tests/revision-gold.test.js, tests/organisers-gold.test.js, tests/glossary-gold.test.js and tests/scaffold-gold.test.js via the new secondary-math-pythagoras STEMS entries (the revision and organisers pack-demo tests stay pinned to the original six gate stems). No validator, renderer, pipeline or demo changes. (2026-10-24)

- Gold backfill slice 1 of #1312 (issue #1313, epic #1204): the Phase C assessment family for secondary-math-pythagoras - samples/diagnostics/secondary-math-pythagoras.json (3 doNow plus 2 hinge questions keyed to the s2 and s4 script cues, every distractor coded with the MISCONCEPTIONS[e-trigonometry] wrongTurn verbatim, hinge scriptCues drawn from the paired gold script cues, student sheet withholds misconception codes and rationales), samples/worked-examples/secondary-math-pythagoras.json (complete and faded examples derived from the paired notes workedExample and mechanismSteps, at least 2 steps each, student sheet withholds the faded steps and the paired solution) and samples/quiz-banks/secondary-math-pythagoras.json (6 retrieval items, the tangent item coded to the bank wrongTurn verbatim, student sheet withholds choiceless answers and codes) - derivation pinned verbatim by tests/diagnostics-gold.test.js, tests/worked-examples-gold.test.js and tests/quiz-bank-gold.test.js via the new secondary-math-pythagoras STEMS entries. No validator, renderer, pipeline or demo changes. (2026-10-24)

- Printable demo adoption (issue #1310): player/printable-demo.html now renders every printable material from its gold water-cycle sample - lesson plan, diagnostics, worked examples, quiz bank, revision, scaffolds, organisers, glossary, feedback, guide, scheme of work, summative and the homework worksheet variant - each fetched and validated before rendering, with student sheets and teacher answer keys (where the renderer provides them) alongside the existing worksheet, exit ticket, notes and script, so the hide-teacher-keys toggle covers every teacher section. tests/printable.test.js pins every new fetch/validate/render triple in validate-before-render order. (2026-10-24)

- The pythagoras gold lesson pack (issue #1308): a gold lesson pack for secondary-math-pythagoras, the only animation that had no pack - deck, worksheet, exit ticket, student notes and teacher script under samples/{decks,worksheets,tickets,notes,scripts}/secondary-math-pythagoras.json, keyed to the animation's four scenes (a right-angled triangle with legs 3 and 4, squares of 9 and 16 on the short sides, the square on the hypotenuse, and 9 + 16 = 25 giving c = 5, with the c = 3 + 4 = 7 trap carried as content) and to the e-trigonometry bank beat in its worksheet, ticket, notes trap, deck practice and exit-ticket slides and script watchFors. player/pack-demo.html gains the pythagoras manifest header, animation/slides/printables sections and a validate-before-render loader block (97 manifest headers, 485 gold references), tests/pack-demo-set.test.js now expects no unjoined animations, and the new tests/gold-pythagoras-pack.test.js pins the envelope, validators, deck structure, bank-keyed questions and notes and script content. (2026-10-24)

- Guide gold gate plus renderers (issue #1304, slice 2 of #1301, completing Phase E3 of epic #1204): six gold guide materials in a new samples/guides/ directory, one per Phase A gate strand under the same filename as the paired gold scheme (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validateGuide-clean with its header (title, level, subject, unitTitle, term) and topics equal to the paired gold scheme verbatim in sequence order, every key idea derived verbatim from a sequenced topic's paired gold notes definitions, every trap's misconception verbatim from a sequenced topic's paired notes trap or the gate topic's paired feedback commonErrors, every parent question and answer verbatim from the gate topic's paired gold quiz bank or exit ticket, and every revision plan dayOffset equal to a practiceSets dayOffset in the gate topic's paired gold revision - pinned by the new tests/guide-gold.test.js (validation, scheme header and sequence echo, key-idea, trap, parent-question and revision derivation computed live from the paired files on disk, and both renderers' content pins). player/printable.js gains renderGuide, the parent sheet in full (header, overview, topics, key ideas, revision plan, traps, and the parent questions with their answers so a parent can check responses at home - nothing withheld), and renderGuideStudent, the student sheet (the same guide with the parent questions but never their answers - it never reads a parentQuestions answer, so no answer can leak to a student), with their printable.d.ts twins and the shared printable options argument. The guide stays standalone: no pack-demo wiring and no lesson-pack fold-in in this slice, and the pack stays at fourteen materials. Merging this slice closes issue #1301 and completes Phase E item 16, the last item of the teaching-materials coverage and quality plan (item 13 remains owner-gated). (2026-10-23)

- Guide core (issue #1302, slice 1 of #1301, Phase E3 of epic #1204): SPEC.md gains a Guide section (one combined unit-level parent/student revision guide - header mirroring the paired scheme of work with topics equal to its sequence in order, overview, at least 2 key ideas {term, explanation} derived verbatim from a sequenced topic's paired notes definitions, at least 1 revision plan entry {dayOffset, focus} with dayOffset equal to a practiceSet dayOffset in the gate topic's paired revision, at least 1 trap {misconception, watchFor} with misconception verbatim from a sequenced topic's paired notes trap or the gate topic's paired feedback commonErrors, and at least 2 parent questions {question, answer} verbatim from the gate topic's paired quiz bank or exit ticket; validator presence and shape only, derivation pinned by the slice-2 gold test; no student data; standalone, never folded into the lesson pack). player/validate.js gains validateGuide with its validate.d.ts twin and the validate-cli export pin. generator/build_guide_prompt.js (plus .d.ts twin) gains buildGuidePrompts on the feedback notes-content model extended to unit level, with caller-supplied paired unit content options (scheme sequence, per-topic notes definitions and traps, gate topic revision, quiz-bank, exit-ticket and feedback content) rendered into the author prompt, and a validating primary-math exemplar derived verbatim from the gold primary-math scheme and the paired fractions notes, quiz bank, revision and exit ticket. generator/pipeline.js gains generateGuide (no unpack, no bank gate, no cache; rejects only on missing callChat or missing validator) with its pipeline.d.ts twin and SIBLINGS wiring, and package.json gains the ./guide-prompt and ./guide exports. Pinned by the new tests/guide.test.js. No gold files, renderer, pack-demo wiring or pack fold-in in this slice. (2026-10-23)

- Feedback lesson-pack fold-in as the fourteenth material (issue #1299, slice 3 of #1294, completing Phase E2 of epic #1204): generateLessonPack now authors a feedback material last in pack order, after organisers - SPEC.md's Lesson pack section, the generator/pipeline.js header and generateLessonPack docblocks, and the generator/pipeline.d.ts pack types all move from thirteen to fourteen materials in the same change, the pack gains a feedback validator resolver entry (validateFeedback), and the feedback job's prompts are built from the pack's OWN authored paired assessment materials (the worksheet questions, exit-ticket questions, quiz-bank items and notes trap authored earlier in the same run), never from caller-supplied options or the misconception bank; no bank resolution and no new failure mode - repair exhaustion names feedback via err.material. The manifest materials list is exactly the fourteen keys in pack order with feedback last. Pinned by tests/pipeline-lesson-pack.test.js (fourteen validate-clean materials, the feedback author call last and carrying the pack-authored worksheet, exit-ticket, quiz-bank and notes-trap content, and a feedback-failure test naming feedback) plus the feedback route in the tests/pack-metadata.test.js stub. Merging this slice closes issue #1294 and completes Phase E item 15. (2026-10-23)

- Feedback gold gate plus renderers (issue #1297, slice 2 of #1294, Phase E2 of epic #1204): six gold feedback materials in a new samples/feedback/ directory, one per Phase A gate strand under the gate topic's notes filename (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validateFeedback-clean with its header echoing the paired gold notes, every model answer derived verbatim from the paired gold worksheet or exit ticket (question prompt and workedSolution or expected answer verbatim, creditPoints equal to the source question's markScheme points texts verbatim or an empty array when it carries none) and every common error's misconception verbatim from the union of the paired files on disk (exit-ticket misconceptions, diagnostics rationale misconceptions, quiz-bank misconceptionCodes, worksheet markScheme commonErrors entries and the paired notes trap) - pinned by the new tests/feedback-gold.test.js (validation, header echo, model-answer and misconception derivation computed from the paired files, and both renderers' content pins). player/printable.js gains renderFeedback, the teacher sheet in full (header, strengths, model answers with every credit point, common errors with example, fix-it prompt and corrected working, and next steps - nothing withheld), and renderFeedbackFixIts, the student-only sheet (header, strengths, and each misconception with its example and fix-it prompt only - it never reads a model answer, a credit point or corrected working, so no answer can leak to a student), with their printable.d.ts twins and the shared printable options argument. The feedback materials stay standalone: no pack-demo wiring and no lesson-pack fold-in in this slice. (2026-10-23)

- Feedback core (issue #1295, slice 1 of #1294, Phase E2 of epic #1204): SPEC.md gains a Feedback section (one combined topic-level material - strengths, at least 2 model answers {question, answer, creditPoints} derived verbatim from the paired worksheet or exit ticket with creditPoints equal to the source markScheme points texts verbatim when present, at least 2 common errors {misconception, example, fixIt {prompt, corrected}} with misconception verbatim from a paired exit-ticket misconception field, diagnostics rationale, quiz-bank misconceptionCode, markScheme commonErrors entry or notes trap, and next steps; validator presence and shape only, derivation pinned by the slice-2 gold test; no student data). player/validate.js gains validateFeedback with its validate.d.ts twin and the validate-cli export pin. generator/build_feedback_prompt.js (plus .d.ts twin) gains buildFeedbackPrompts on the notes-content model with caller-supplied paired assessment content options (exitTicketQuestions, worksheetQuestions, quizItems, notesTrap) rendered into the author prompt, and a validating primary-math fractions exemplar derived verbatim from the gold fractions worksheet and exit ticket. generator/pipeline.js gains generateFeedback (no unpack, no bank gate, no cache; rejects only on missing callChat or missing validator) with its pipeline.d.ts twin and SIBLINGS wiring, and package.json gains the ./feedback-prompt and ./feedback exports. Pinned by the new tests/feedback.test.js. No gold files, renderer, pack-demo wiring or pack fold-in in this slice. (2026-10-23)

- Scheme of work gold gate plus renderScheme (issue #1292, slice 2 of #1289, completing Phase E1 of epic #1204): six gold schemes in a new samples/schemes/ directory, one per Phase A gate strand under the gate topic's notes filename (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validateScheme-clean and sequencing at least 3 topics from its own level and subject track in generator/syllabus.js order, every prerequisite naming an earlier entry and every sequenced topic carrying gold notes under the same slug - pinned by the new tests/scheme-gold.test.js (validation, track order, prerequisite-earlier, resolveSyllabusTopic resolution, gold-notes pairing and full-rendering pins). player/printable.js gains renderScheme, the full term plan (header plus, per sequence entry in order, week, topic, lessons, prerequisites and assessment points - a scheme holds no answers, so nothing is withheld and there is no answer-key renderer), with its printable.d.ts twin and the shared printable options argument. The scheme stays standalone: no pack-demo wiring and no lesson-pack fold-in in this slice. Merging this slice closes issue #1289 and completes Phase E item 14. (2026-10-23)

- Scheme of work core (issue #1290, slice 1 of #1289, Phase E1 of epic #1204): SPEC.md gains a Scheme of work spec - a new standalone unit-level material scheme of work, the term plan that stitches topic lesson packs into a sequence (title, level, subject, unitTitle, term, weeks, plus a sequence of at least 2 entries in teaching order, each with a topic slug, a week within the term, lessons, prerequisites naming only earlier entries, and assessment points referenced by kind - diagnostics, quizBank, summative or review - never by id; teaching order follows the generator/syllabus.js track order and no syllabus text is stored). player/validate.js gains validateScheme enforcing presence and shape plus the prerequisite-earlier and week-within-term structural rules, generator/build_scheme_prompt.js authors schemes against the contract with a validating hand-authored primary-math exemplar sequencing fractions, decimals and percentage in syllabus order, and generator/pipeline.js gains generateScheme on the generateSummative model (direct unit authoring, no shared unpack, no misconception bank gate, no cache; rejects only on a missing callChat or a missing validator naming generateScheme / validateScheme, and names the scheme kind on repair exhaustion); package subpath exports ./scheme-prompt and ./scheme are added, pinned by tests/scheme.test.js. No gold samples, printable renderer, pack-demo wiring or lesson-pack fold-in in this slice - the pack stays at thirteen materials; the gold gate plus renderScheme is slice 2 under issue #1289. (2026-10-23)

- Organisers lesson-pack fold-in (issue #1287, slice 5 of #1276, completing Phase D2 of epic #1204): generateLessonPack now authors a THIRTEENTH material, organisers, appended last after revision - SPEC.md's Lesson pack section, the generator/pipeline.js header and generateLessonPack docblocks, and generator/pipeline.d.ts all move from twelve to thirteen materials in the same change, the pack validators map gains the organisers resolver (resolveOrganisersValidator), and the manifest materials list gains organisers last. One organisers-specific difference from the revision fold-in (#1274): the organisers job runs after the authoring chain rather than inside it, because its prompts are built with the pack's OWN authored notes definitions and mechanismSteps (the notes-content model of #1279 - the job runs last, after the pack's notes exist), not from caller-supplied options and not from the misconception bank; there is no bank resolution and no new failure mode, and repair exhaustion names organisers via err.material like every other material. Glossary stays standalone (no fold-in), as settled at the #1276 decomposition. Pinned by tests/pipeline-lesson-pack.test.js (thirteen validate-clean materials, organisers last in the manifest and as the final author call, the organisers prompt carrying every pack-authored notes definition and mechanism step, and an organisers-failure test naming organisers with err.problems) plus the organisers route in the tests/pack-metadata.test.js stub. (2026-10-23)

- Glossary gold gate (issue #1285, slice 4 of #1276): six gold glossary files in a new samples/glossary/ directory, one per Phase A gate topic under the same filename as the paired gold notes and gold organisers (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validateGlossary-clean and derived verbatim - every entry's term and meaning are a paired notes definition verbatim in the notes definitions order, and every entry's example is drawn verbatim from the paired notes workedExample, one of its mechanismSteps, or one of its objectives - pinned by the new tests/glossary-gold.test.js (validation, header echo, derivation-verbatim and full-rendering pins). player/printable.js gains renderGlossary, the full reference sheet (title/level/subject/topic header plus every entry's term, meaning and example - a glossary is a finished reference, so nothing is withheld and there is no separate key renderer), with its printable.d.ts twin and the shared printable options argument. The glossary stays standalone: no pack-demo wiring and no lesson-pack fold-in in this slice - slice 5 under issue #1276 is the organisers fold-in only. (2026-10-23)

- Glossary core (issue #1283, slice 3 of #1276): SPEC.md gains a Glossary spec - a new standalone sibling material glossary, the finished reference pack for one topic built on the student notes definitions block, carried as the sibling material header (title, level, subject, topic) plus an entries array of at least 3 entries {term, meaning, example}, where term and meaning are a paired notes definition verbatim and the example is grounded in the paired notes content (in gold files drawn verbatim from the paired notes workedExample, one of its mechanismSteps, or one of its objectives). player/validate.js gains validateGlossary enforcing presence and shape only (never derivation), generator/build_glossary_prompt.js authors glossaries against the contract with a validating hand-authored fractions exemplar drawn verbatim from the fractions notes (every term and meaning a notes definition verbatim; every example drawn verbatim from the notes workedExample, mechanismSteps or objectives) and accepts optional definitions, mechanismSteps, workedExample and objectives options on the build_organisers_prompt.js post-#1279 precedent (absent or empty means none supplied, malformed throws a descriptive buildGlossaryPrompts error, supplied content rendered into the author user message), and generator/pipeline.js gains generateGlossary on the corrected notes-content model - it authors from the shared lesson unpack and the topic's paired notes content passed through, rejects only on a missing callChat or a missing validator naming generateGlossary / validateGlossary (no misconception-bank resolution and no no-bank rejection), and still names glossary on repair exhaustion; package subpath exports ./glossary-prompt and ./glossary are added, pinned by tests/glossary.test.js including derivation-verbatim pins on the exemplar against the fractions notes data. No gold samples, printable renderer, pack-demo wiring or lesson-pack fold-in in this slice - the glossary gold gate is slice 4 under issue #1276 and the glossary stays standalone (slice 5 is the organisers fold-in only). (2026-10-23)

- Organisers gold gate (issue #1281, slice 2 of #1276): six gold organisers files in a new samples/organisers/ directory, one per Phase A gate topic under the same filename as the paired gold notes and gold revision (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validateOrganisers-clean and derived verbatim - the flow template's slot entries are the paired notes mechanismSteps in order and the frayer template's slots carry a notes definition term as the label and its meaning as the entry - pinned by the new tests/organisers-gold.test.js (validation, header echo, derivation-verbatim and withholding pins). player/printable.js gains renderOrganisers (the student sheet: template headings, slot labels and studentPrompts only, never reading a slot entry) and renderOrganisersKey (the teacher / self-check key: every slot entry), with printable.d.ts twins and the shared printable options argument. player/pack-demo.html wires the gold organisers files into exactly the six gate packs (thirteenth fetch, chained validateOrganisers, student sheet plus key). No lesson-pack fold-in or glossary in this slice - those are slices 3 to 5 under issue #1276. (2026-10-23)

- Organisers core (issue #1277, slice 1 of #1276): SPEC.md gains an Organisers spec - a new sibling material organisers, the per-topic set of structured templates a student completes while studying the topic (KWL, Frayer, Venn, flow, concept map), carried as the sibling material header (title, level, subject, topic) plus a templates array of at least 2 templates {kind, slots}, each slot {label, entries, studentPrompt} with entries a non-empty array of non-empty strings and studentPrompt optional; slot entries are derived, never free-authored - a flow template's entries are the topic's unpack stages in order and every other template's entries are drawn verbatim from the paired student notes mechanismSteps and definitions. player/validate.js gains validateOrganisers enforcing presence and shape only (never derivation), generator/build_organisers_prompt.js authors organisers against the contract with a validating hand-authored fractions exemplar derived verbatim from the fractions notes (flow entries are the notes mechanismSteps in order; frayer slots carry a notes definition term and its meaning), and generator/pipeline.js gains generateOrganisers, which resolves the topic's misconception bank entry first (the topic verbatim, then its slugified forms, facet carried) and rejects before any LLM call naming organisers when the topic has no bank entry - organisers materials are generated from the bank and never invent misconceptions; package subpath exports ./organisers-prompt and ./organisers are added, pinned by tests/organisers.test.js including derivation-verbatim pins on the exemplar against the fractions notes data. No gold samples, printable renderer, pack-demo wiring, glossary or lesson-pack fold-in in this slice - those are slices 2 to 5 under issue #1276. (2026-10-23)

- Revision lesson-pack fold-in (issue #1274, slice 4 of #1267): the revision material joins the generated lesson pack as its twelfth and last material - SPEC.md's Lesson pack spec moves from eleven materials to twelve (revision appended last in pack order, validating via validateRevision, with the manifest materials list exactly the twelve keys in pack order ending quizBank, revision, and the failure-semantics text noting the revision material is authored from the same shared unpack and the already-resolved misconception bank entry), generateLessonPack gains the revision validator resolver in its validators map (resolveRevisionValidator, already used by generateRevision) and a revision job authored last from the shared unpack through buildRevisionPrompts and validateRevision with the revision repair kind, taking the bank triple from the entry already resolved pre-authoring for diagnostics (no second resolution, no new failure mode - bank-less topics still reject before any authoring naming diagnostics; a revision material that exhausts its repair cap rejects the whole pack with err.material naming revision), the pipeline.js file header and generateLessonPack docblocks move from eleven materials to twelve in the same change, and the pipeline pack types (GenerateLessonPackDeps.validateRevision, LessonPackResult.revision) follow. Pinned by the extended tests/pipeline-lesson-pack.test.js (twelve validate-clean materials, thirteen calls, pack.revision deep-equal to the gold water-cycle revision, the twelve-key manifest materials list, and a revision-failure test) and the revision route added to the tests/pack-metadata.test.js stub. This completes issue #1267 and Phase D1 of epic #1204. (2026-10-23)

- Homework variant (issue #1272, slice 3 of #1267): SPEC.md Worksheet spec gains an optional worksheet-level variant field whose only value is homework, strict when present (an unknown or non-string value is an error; a worksheet without it validates exactly as before; exit tickets do not carry it and validateExitTicket rejects one). player/validate.js enforces the variant strictness in validateWorksheet. player/printable.js renderWorksheet adds a homework header line on the student sheet for a homework worksheet (naming it homework, low-stakes and self-marked), and renderWorksheetAnswerKey serves as the self-mark key under that framing for homework; a standard worksheet renders exactly as before, and answers and explanations appear only in the key, homework or not. Six gold homework sheets in a new samples/homework/ directory, one per Phase A gate topic under the same filename as the paired gold worksheet, each a spaced selection drawn across the paired worksheet with every question prompt pinned verbatim against it by the new tests/homework.test.js (validation, header echo, derivation, variant strictness and rendering pins). No lesson-pack fold-in and no pack-demo wiring - homework never folds in. (2026-10-23)

- Revision gold gate (issue #1270, slice 2 of #1267): six hand-authored gold revision files in a new samples/revision/ directory, one per quiz-bank gate topic under the same filename as the paired gold quiz bank and gold notes (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validateRevision-clean and derived verbatim - definition cards carry a paired notes term and its meaning, the trap card carries the paired notes trap misconception and explanation, quiz-bank cards and every practice-set item carry a paired quiz bank prompt and its answer - pinned by the new tests/revision-gold.test.js (validation, header echo, derivation-verbatim and withholding pins). player/printable.js gains renderRevision (the study sheet: flashcard fronts and practice-set prompts only, never reading a flashcard back or a practice answer) and renderRevisionAnswerKey (the teacher / self-check key: every back and answer), with printable.d.ts twins and the shared printable options argument. player/pack-demo.html wires the gold revision files into exactly the six gate packs (twelfth fetch, chained validateRevision, study sheet plus answer key, revision in the six manifests). No homework variant or lesson-pack fold-in in this slice - those are slices 3 and 4 under issue #1267. (2026-10-23)

- Revision core (issue #1268, slice 1 of #1267): SPEC.md gains a Revision spec - a new sibling material revision, the per-topic study set of flashcards plus spaced-practice sets derived verbatim from the topic's paired quiz bank and student notes (a definition card's front and back are a notes term and its meaning, the trap card's front and back are the notes trap misconception and explanation, quiz-bank cards and practice items carry a quiz bank prompt and its answer), carried as the sibling material header (title, level, subject, topic) plus a flashcards array of at least 4 cards {front, back, source} with source one of quiz-bank, definition or trap, and a practiceSets array of at least 2 sets {dayOffset, items} with dayOffset a positive integer strictly increasing across sets (study offsets only - no dates, no student state) and items a non-empty array of {prompt, answer}. player/validate.js gains validateRevision enforcing presence and shape only (never derivation or bank membership), generator/build_revision_prompt.js authors revision sets against the contract with a validating hand-authored fractions exemplar derived verbatim from the fractions quiz bank items and the fractions notes definitions and trap, and generator/pipeline.js gains generateRevision, which resolves the topic's misconception bank entry first (the topic verbatim, then its slugified forms, facet carried) and rejects before any LLM call naming revision when the topic has no bank entry - revision materials are generated from the bank and never invent misconceptions; package subpath exports ./revision-prompt and ./revision are added, pinned by tests/revision.test.js including derivation-verbatim pins on the exemplar against the fractions quiz bank and notes data. No gold samples, printable renderer, pack-demo wiring, homework variant or lesson-pack fold-in in this slice - those are slices 2, 3 and 4 under issue #1267. (2026-10-23)
- Quiz bank lesson-pack fold-in (issue #1263, slice 5 of #1254): the quiz bank joins the generated lesson pack as its eleventh and last material - SPEC.md's Lesson pack spec moves from ten materials to eleven (quizBank appended last in pack order, validating via validateQuizBank, with the manifest materials list exactly the eleven keys in pack order, and the failure-semantics text noting the quiz bank is authored from the same shared unpack and the already-resolved misconception bank entry), generateLessonPack gains the quizBank validator resolver in its validators map (a missing quizBank validator rejects before any authoring, naming quizBank) and a quizBank job authored last from the shared unpack through buildQuizBankPrompts and validateQuizBank with the quiz-bank repair kind, taking the bank triple from the entry already resolved pre-authoring for diagnostics (no second resolution, no new failure mode; a quiz bank that exhausts its repair cap rejects the whole pack with err.material naming quizBank), and the pipeline pack types (GenerateLessonPackDeps.validateQuizBank, LessonPackResult.quizBank) follow. Pinned by the extended tests/pipeline-lesson-pack.test.js (eleven validate-clean materials, twelve calls, pack.quizBank deep-equal to the gold water-cycle quiz bank, the eleven-key manifest materials list, and a quizBank-failure test) and the quiz bank route added to the tests/pack-metadata.test.js stub. This completes issue #1254 and Phase C of epic #1204. (2026-10-23)
- Summative assessment gold gate (issue #1261, slice 4 of #1254): six hand-authored gold summative units in a new samples/summatives/ directory, one per Phase A gate topic, each unit spanning its gate topic plus at least one same-level, same-subject sibling topic with gold notes, validateSummative-clean (blueprint rows summing to totalMarks, items summing to their blueprint row, mark schemes summing to the item marks) and shipping moderation unreviewed with review null; renderSummative and renderSummativeAnswerKey in player/printable.js (the student paper shows the unit header, duration, total marks, item prompts, command words and item marks, and never reads an item markScheme or the rubric descriptors; the teacher key shows every credit point and the full rubric) with printable.d.ts twins and the shared printable options argument; tests/summative-gold.test.js pins validation, the topic span, the marks sums, the unsigned moderation and the student-paper withholding. No pack-demo wiring or pack fold-in: the summative is a standalone unit-level material and is never folded into a lesson pack. (2026-10-23)
- Summative assessment core (issue #1259, slice 3 of #1254): SPEC.md gains a Summative assessment spec - a new standalone unit-level material, never folded into the lesson pack, carried as a material header (title, level, subject) plus a unit header {unitTitle, topics (at least 2 topic slugs), durationMinutes, totalMarks}, a blueprint of rows {outcomeCode, assessmentObjective, marks, cognitiveLevel} whose marks sum exactly to totalMarks, items {prompt, blueprintRow, commandWord, marks, markScheme} whose marks sum exactly to their blueprint row (every row carrying at least one item) with each mark scheme validated through the Phase A1 checkMarkScheme machinery, a rubric field inside the material {criteria: [{name, levels: [{label, descriptor}]}]}, and moderation reusing the Phase A3 pack metadata states with state approved refused without a review record {reviewer, date} on the material. player/validate.js gains validateSummative (presence/shape plus the two marks-sum checks), generator/build_summative_prompt.js authors assessments against the contract with a validating hand-authored fractions unit exemplar (blueprint 10 + 10 = 20, moderation unreviewed, review null), and generator/pipeline.js gains generateSummative, which authors directly from the unit topics array (no single-topic unpack, no bank resolution) and fails honestly naming summative when repair is exhausted; package subpath exports ./summative-prompt and ./summative are added, pinned by tests/summative.test.js. No gold files, printable renderer, pack-demo wiring or pack fold-in in this slice - the gold gate is slice 4 under issue #1254, and summative has no fold-in slice. (2026-10-23)
- Quiz bank gold gate (issue #1257, slice 2 of #1254): six hand-authored gold quiz banks in a new samples/quiz-banks/ directory, one per Phase A gate topic, each validateQuizBank-clean with its header echoing the paired gold topic and every coded item carrying the topic misconception bank wrongTurn verbatim; renderQuizBank and renderQuizBankAnswerKey in player/printable.js (the student sheet never reads an item answer or misconceptionCode) with printable.d.ts twins and the shared printable options argument; tests/quiz-bank-gold.test.js pins validation, header echo, bank-verbatim codes and student-sheet withholding; pack-demo wiring for the six gate packs only (eleventh fetch, chained validateQuizBank, student sheet plus answer key, quizBank in the six manifests).
- Quiz bank core (issue #1255, slice 1 of #1254): SPEC.md gains a Quiz bank spec - a new sibling material quizBank, the per-topic cumulative formative bank of short retrieval items a teacher draws on across sessions, carried as the diagnostics-mirroring material header (title, level, subject, topic) plus an items array of at least 4 retrieval items, each with a required prompt and a required teacher-key answer, an optional choices array of at least 2 strings, an optional misconceptionCode (the topic misconception bank entry's wrongTurn verbatim when present) and an optional facts-only outcomeCode. player/validate.js gains validateQuizBank enforcing presence and shape only (never bank membership), generator/build_quiz_bank_prompt.js authors banks against the contract with a validating hand-authored fractions exemplar whose coded items carry the fractions bank wrongTurn, and generator/pipeline.js gains generateQuizBank, which resolves the topic's misconception bank entry first (the topic verbatim, then its slugified forms, facet carried) and rejects before any LLM call naming quizBank when the topic has no bank entry - quiz banks are generated from the bank and never invent misconceptions; package subpath exports ./quiz-bank-prompt and ./quiz-bank are added, pinned by tests/quiz-bank.test.js. No gold samples, renderer, pack-demo surface or lesson-pack fold-in in this slice - those are slices 2 and 5 under issue #1254. (2026-10-23)
- Worked-example sets lesson-pack fold-in (issue #1252, slice 3 of #1247): worked-example sets join the generated lesson pack as its tenth and last material - SPEC.md's Lesson pack spec moves from nine materials to ten (workedExamples appended last in pack order, validating via validateWorkedExamples, with the manifest materials list exactly the ten keys in pack order), generateLessonPack gains a workedExamples validator resolver in its validators map (a missing workedExamples validator rejects before any authoring, naming workedExamples) and a workedExamples job authored last from the shared unpack through buildWorkedExamplesPrompts and validateWorkedExamples with the worked-examples repair kind (a workedExamples material that exhausts its repair cap rejects the whole pack with err.material naming workedExamples), taking the shared base fields exactly as generateWorkedExamples does with no bank resolution - the set is authored, not bank-derived - and the pipeline pack types (GenerateLessonPackDeps.validateWorkedExamples, LessonPackResult.workedExamples) follow. Pinned by the extended tests/pipeline-lesson-pack.test.js (ten validate-clean materials, eleven calls, pack.workedExamples deep-equal to the gold water-cycle worked-example set, the ten-key manifest materials list, and a workedExamples-failure test) and the worked-examples route added to the tests/pack-metadata.test.js stub. This completes issue #1247 and Phase C2 of epic #1204. (2026-10-23)
- Worked-example sets gold gate (issue #1250, slice 2 of #1247): six hand-authored gold worked-example sets in a new samples/worked-examples/ directory, one per Phase A gate topic (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validating clean against validateWorkedExamples with a complete annotated example, a faded example whose withheld steps form a suffix, and a paired problem - pinned by the new tests/worked-examples-gold.test.js, which also pins the title / level / subject / topic echo of the paired gold notes and an example-kind slide in each gate topic's gold deck. player/printable.js gains renderWorkedExamples (the student sheet: the complete example in full and the faded example's shown steps only, never reading a withheld step or paired.solution, so teacher-only content cannot leak) and renderWorkedExamplesAnswerKey (the teacher key: the faded example in full with withheld steps marked, plus the paired problem's worked solution), with the matching printable.d.ts types. player/pack-demo.html wires the gold sets into exactly the six subset-gate packs: each fetches samples/worked-examples/<stem>.json as a tenth fetch, validates the set with validateWorkedExamples before rendering it through renderWorkedExamples and renderWorkedExamplesAnswerKey, and lists workedExamples in its pack manifest - pinned by the extended tests/pack-demo.test.js. Slice 3 (the lesson-pack fold-in as the tenth material) remains under issue #1247. (2026-10-23)
- Worked-example sets core (issue #1248, slice 1 of #1247): SPEC.md gains a Worked-example set spec - a new sibling material teaching one topic by example in fading order: a complete example (at least 2 steps, every step carrying text plus a required annotation saying why the step works, and a required self-explanation prompt), a faded example (the same shape with the annotation optional and a required boolean withheld on every step; at least one step shown, at least one withheld, and the withheld steps forming a suffix, with withheld step text and annotations teacher-key only), and a paired example-problem whose required solution is teacher-key only. player/validate.js gains validateWorkedExamples enforcing presence and shape only (the notes material's single workedExample string is unchanged), generator/build_worked_examples_prompt.js authors sets against the contract with a validating hand-authored fractions exemplar, and generator/pipeline.js gains generateWorkedExamples with the generateScaffolds unpack, author and repair semantics; package subpath exports ./worked-examples-prompt and ./worked-examples are added, pinned by tests/worked-examples.test.js. No gold samples, printable renderer, pack-demo surface or lesson-pack fold-in in this slice - those are slices 2 and 3 under issue #1247. (2026-10-23)
- Diagnostics lesson-pack fold-in (issue #1245, slice 3 of #1240): diagnostics join the generated lesson pack as its ninth and last material - SPEC.md's Lesson pack spec moves from eight materials to nine (diagnostics appended last in pack order, validating via validateDiagnostics, with the failure semantics recording the pre-authoring bank rejection), generateLessonPack gains a diagnostics validator resolver in its validators map and a diagnostics job authored last from the shared unpack through buildDiagnosticsPrompts and validateDiagnostics with the diagnostics repair kind (a diagnostics material that exhausts its repair cap rejects the whole pack with err.material naming diagnostics), and the pipeline pack types (GenerateLessonPackDeps.validateDiagnostics, LessonPackResult.diagnostics) follow. The pack job follows generateDiagnostics semantics for the misconception bank: the bank entry is resolved via misconceptionFor (the topic verbatim, then its slugified forms, with the call's facet) and carried into the prompts as bank {wrongTurn, why, correctTurn} plus the facet, and a topic with no bank entry rejects the pack before any authoring with an error naming diagnostics - the pack never invents misconceptions and never silently omits the ninth material. Pinned by the extended tests/pipeline-lesson-pack.test.js (nine validate-clean materials, ten calls, pack.diagnostics deep-equal to the gold water-cycle diagnostics, diagnostics failure and no-bank-entry rejection tests) and the diagnostics route added to the tests/pack-metadata.test.js stub. This completes issue #1240 and Phase C1 of epic #1204. (2026-10-23)
- Diagnostics gold gate (issue #1243, slice 2 of #1240): six hand-authored gold diagnostics materials in a new samples/diagnostics/ directory, one per Phase A1 gate topic (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validating clean against validateDiagnostics with a Do Now of 3 questions and 2 hinge questions, every distractor coded with the topic misconception bank entry's wrongTurn verbatim and every hinge scriptCue drawn from the paired gold teacher script's actual cues - pinned by the new tests/diagnostics-gold.test.js, which also pins the title / level / subject / topic echo of the paired gold notes. player/printable.js gains renderDiagnostics (the student sheet: Do Now and hinge prompts with choice texts only, never reading a misconception code or rationale, so teacher-only content cannot leak) and renderDiagnosticsAnswerKey (the teacher key: the correct answer, the hinge script cue, and every distractor's misconception code with its chose / thinks / reteach rationale), with the matching printable.d.ts types. player/pack-demo.html wires the gold diagnostics into exactly the six subset-gate packs: each fetches samples/diagnostics/<stem>.json as a ninth fetch, validates the diagnostics with validateDiagnostics before rendering them through renderDiagnostics and renderDiagnosticsAnswerKey, and lists diagnostics in its pack manifest - pinned by the extended tests/pack-demo.test.js. Slice 3 (the lesson-pack fold-in as the ninth material) remains under issue #1240. (2026-10-23)
- Diagnostics core (issue #1241, slice 1 of #1240): SPEC.md gains a Diagnostics spec - a generated diagnostics material pairing a prior-knowledge Do Now (2-4 questions) with hinge questions (1-3) for one topic, all multiple-choice on the shared Question shape, where every incorrect choice is coded with the topic misconception bank entry's wrongTurn verbatim (the primary facet's for faceted entries) plus a teacher-only rationale object with exactly the chose, thinks and reteach parts, the correct choice carries neither field, every hinge question carries the scriptCue of the teacher-script segment where the teacher pivots on the answer (scriptCue never appears on Do Now questions), and no rationale part text may appear verbatim in the question prompt or any choice text, so teacher-only wording never leaks onto student-renderable fields. player/validate.js gains validateDiagnostics enforcing every rule (bank-free: code presence and shape only, never bank membership), generator/build_diagnostics_prompt.js authors diagnostics against the contract with a validating hand-authored fractions exemplar built on the fractions bank entry, and generator/pipeline.js gains generateDiagnostics, which resolves the topic's bank entry first and rejects before any LLM call when the topic has none - diagnostics are generated from the bank and never invent misconceptions; package subpath exports ./diagnostics-prompt and ./diagnostics are added, pinned by tests/diagnostics.test.js. No gold samples, renderer or lesson-pack fold-in in this slice - those are slices 2 and 3 under issue #1240. (2026-10-23)
- Materials rubric with reading-age heuristic (issue #1238, slice 2 of #1235): new generator/materials-rubric.js exports scoreMaterial, which scores a teaching material (worksheet, exit ticket, student notes, scaffolds or slide deck) in the animation-rubric shape over student-facing text only - teacher-only text (per-question answer fields, markScheme, workedSolution, deck speaker notes and teacher-script segments including watchFor) is never measured, so scripts extract no student text - across three dimensions (reading age out of 4, student text presence out of 3, and instruction clarity out of 3 for worksheets, exit tickets and scaffolds only), with the reading-age dimension using the Flesch Reading Ease formula 206.835 - 1.015 x (words / sentences) - 84.6 x (syllables / words) and a grade of about (110 - ease) / 10 clamped to 3-18, a heuristic signal for human reviewers and never a gate; extractStudentText and INTERNALS (countSyllables, readingAge) are exported for direct testing, the package gains the ./materials-rubric subpath export, SPEC.md's Accessible variants section records the contract, and tests/materials-rubric.test.js pins the syllable worked words, one hand-computed reading-age fixture per band, per-kind extraction, teacher-text exclusion traps and every dimension branch. This completes issue #1235 (Phase B3). (2026-10-23)
- Accessible printable variants (issue #1236, slice 1 of #1235): all nine printable renderers in player/printable.js (renderWorksheet, renderWorksheetAnswerKey, renderExitTicket, renderExitTicketAnswerKey, renderNotes, renderScript, renderLessonPlan, renderScaffolds, renderScaffoldsAnswerKey) gain an optional options argument with three boolean fields - enlargedPrint appends the pr-enlarged class to the sheet section and player/printable.css renders the title at 32px with body text about 25 percent larger at line-height 1.7, unclutteredLayout appends the pr-uncluttered class after pr-enlarged and the stylesheet drops the decorative sheet and trap-box framing and widens question and segment spacing to 36px without removing any content, and chunkInstructions renders the spec instructions as a pr-instructions-chunked list with one pr-instruction item per sentence (splitting only on a terminator followed by whitespace and an uppercase letter or digit, so decimals and abbreviations never split, each sentence escaped individually) instead of the single pr-instructions paragraph - with SPEC.md gaining an Accessible variants section and printable.d.ts the PrintableOptions type; with no options or every option off the rendering is byte-identical to the un-optioned rendering, pinned by full-string pins and branch tests in tests/printable.test.js. Slice 2 (materials rubric and reading-age) remains under issue #1235. (2026-10-23)
- Scaffold gold gate (issue #1233, slice 2 of #1230): six hand-authored gold scaffolds materials in a new samples/scaffolds/ directory, one per Phase A1 gate topic (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validating clean against validateScaffolds, echoing its paired gold student notes on title, level, subject and topic, drawing every word-bank term verbatim from that notes file's definitions, taking every cloze answer from the same set's word bank, and fading in three sets (full, partial, minimal) with non-increasing counts of word-bank terms, starters, frames and cloze answers - pinned by the new tests/scaffold-gold.test.js. player/printable.js gains renderScaffolds (the student sheet: set level labels, word bank, starters, frames and cloze text, and never reads cloze answers, so no answer can leak) and renderScaffoldsAnswerKey (the teacher key rendering every cloze answer), with the matching printable.d.ts types. The scaffolds also join the generated lesson pack as its eighth material: SPEC.md's Lesson pack spec moves from seven materials to eight (scaffolds appended last in pack order), generateLessonPack authors the scaffolds from the shared unpack through buildScaffoldPrompts and validateScaffolds with the scaffolds repair kind (a failing scaffolds material rejects the pack with err.material naming scaffolds), the manifest materials list gains scaffolds, and the pipeline pack types follow - pinned by the extended tests/pipeline-lesson-pack.test.js and tests/printable.test.js. player/pack-demo.html wires the gold scaffolds into exactly the six subset-gate packs: each fetches samples/scaffolds/<stem>.json as an eighth fetch, validates the scaffolds with validateScaffolds before rendering them through renderScaffolds and renderScaffoldsAnswerKey, and lists scaffolds in its pack manifest - pinned by the extended tests/pack-demo.test.js. This completes the Phase B2 subset gate: issue #1230 closes with this slice; the 70-topic backfill stays a follow-on under epic #1204. (2026-10-23)

- Scaffolds core (issue #1231, slice 1 of #1230): SPEC.md gains a Scaffolds spec - the fading language support paired with the student notes, carried as an ordered sets array in strictly fading order (full, then partial, then minimal; at least two sets, no level repeated or rising), each set with its own word bank (term plus a short learner-facing gloss, terms drawn from the paired notes definitions), sentence starters, sentence frames carrying the ___ gap marker, and cloze items built from the notes mechanism steps whose ordered answers are each a word-bank term of the same set and stay teacher-key only; the counts of word-bank terms, starters, frames and cloze gaps must be non-increasing along the sequence. player/validate.js gains validateScaffolds enforcing every rule, generator/build_scaffold_prompt.js authors scaffolds against the contract with a validating water-cycle exemplar and teaches the derivation from the paired notes definitions and mechanism steps, and generator/pipeline.js gains generateScaffolds with the generateLessonPlan unpack, author and repair semantics; package subpath exports ./scaffold-prompt and ./scaffolds are added, pinned by tests/scaffold.test.js. No gold samples, renderer or pack-demo surface in this slice - those are slice 2 under issue #1230. (2026-10-23)

- Tiered worksheet gold retrofit (issue #1228, slice 2 of #1225): worksheet questions gain an optional objective field in SPEC.md - the id of the lesson-plan objective the question serves, a coverage key that is never rendered - validated strict when present by validateWorksheet (a non-string or empty objective is an error), worksheets only, so exit-ticket validation is unchanged. The six Phase A gate-topic gold worksheets (fractions, water-cycle, e-algebra, phys-energy, differentiation, cell-bio) are retrofitted: every pre-existing question gains tier, difficulty and objective with its content unchanged, and new gold-standard questions (marks, mark schemes summing to the marks, worked solutions on short-answer questions) are added where the coverage matrix requires them, bringing the worksheets to 9 / 6 / 12 / 9 / 12 / 15 questions. The new tests/tiered-worksheet-gold.test.js pins, for each topic, that the worksheet validates clean, every question carries tier / difficulty / objective, every objective value is one of the paired gold lesson plan's objective ids, and every plan objective is served by at least one question at each of the three tiers; the per-topic gold pack question-count pins are updated to match. This completes Phase B1's subset gate: issue #1225 closes with this slice; the 70-topic backfill stays a follow-on under epic #1204. (2026-10-23)

- Tiered worksheet core (issue #1226, slice 1 of #1225): worksheet questions gain an optional tier (support / core / extension) and difficulty (an integer from 1 to 5), defined normatively in SPEC.md - extension means transfer and multi-step reasoning, never more volume; support means the same objective at reduced cognitive load, never a lesser objective; core is the standard objective at full load. validateWorksheet validates both strictly when present (an unknown tier, or a difficulty that is not an integer from 1 to 5, is an error) while untiered worksheets validate exactly as before, and exit-ticket validation is unchanged. The worksheet prompt builder teaches the tier meanings and its exemplar carries tier and difficulty on every question; renderWorksheet and the answer key show the tier label for every tiered question (labels visible to students are the deliberate inclusion choice), with un-tiered rendering byte-identical to before. Pinned by the new tests/tiered-worksheet.test.js. The six-topic gold retrofit with per-question objective coverage is slice 2 under #1225. (2026-10-23)

- Pack metadata display (issue #1223, slice 2 of #1207): the web app pack manifest (web/index.html renderPackManifest) now displays the generated pack metadata block - the AI-generated label with the model and generator version, and the syllabus year, shown honestly as not recorded when the year is null - with every value escaped like the existing manifest fields; the six Phase A gate pack headers in player/pack-demo.html (water-cycle, fractions, e-algebra, phys-energy, differentiation, cell-bio) gain Syllabus year and AI-generated rows in their manifest dl, the year matching the topicFacts recorded for the topic. Pinned by new tests in tests/pack-webapp.test.js and tests/pack-demo.test.js across topicFacts, the pack-demo headers and the web rendering. This completes Phase A3: issue #1207 closes with this slice; the 70-topic metadata backfill stays a follow-on under epic #1204. (2026-10-23)

- Pack metadata core (issue #1221, slice 1 of #1207): every lesson-pack manifest now carries a deterministic metadata block (SPEC Lesson pack spec) with the syllabus year, outcome codes and SEAB assessment objectives recorded as facts only (code identifiers plus short titles; syllabus text is never reproduced), an AI-generated label naming the model identity available to the call and the generator version, a review sign-off block that stays null until signed, and a moderation state starting at unreviewed. player/validate.js gains validatePackMetadata; generator/syllabus.js gains topicFacts with facts recorded for the six Phase A gate topics (fractions, water-cycle, e-algebra, phys-energy, h2-differentiation, h2-cell-bio) across the generator, web and SYLLABUS.md mirrors; generateLessonPack emits the block from syllabus resolution (an unresolved topic emits a valid block with a null year and empty code lists). Pinned by the new tests/pack-metadata.test.js. (2026-10-23)

- Lesson-plan renderer and pack-demo wiring (issue #1219, slice 3 of #1206): player/printable.js gains renderLessonPlan, which validates the plan first (throwing on an invalid plan) and renders the duration total, every objective with its success criteria and assessment points, and every activity in order with its minutes and objective ids - scriptCue, grouping, resources and differentiation support / stretch render only when present, and all spec text is HTML-escaped; player/printable.d.ts gains the lesson-plan interfaces and the renderLessonPlan declaration. player/pack-demo.html wires the gold lesson plan into exactly the six subset-gate packs (primary-science-water-cycle, primary-math-fractions-addition, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio): each fetches samples/plans/<stem>.json as a seventh fetch, validates the plan with validateLessonPlan before rendering it through renderLessonPlan, and lists lessonPlan in its pack manifest. Pinned by the extended tests/printable.test.js, tests/pack-demo.test.js and tests/lesson-plan-gold.test.js. This completes Phase A2: issue #1206 closes with this slice. (2026-10-23)
- Six-topic gold lesson plans and lesson-pack fold-in (issue #1217, slice 2 of #1206): six hand-authored gold lesson plans in a new samples/plans/ directory, one per Phase A1 gate topic (primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation, jc-h2-cell-bio), each validating clean against validateLessonPlan, echoing its gold teacher script on level, subject, topic and title, summing its activity minutes exactly to durationMinutes, naming only script cues that appear in that script, and delivering every objective from at least one activity - pinned by tests/lesson-plan-gold.test.js. The lesson plan also joins the generated lesson pack as its seventh material: SPEC.md's Lesson pack spec moves from six materials to seven (lessonPlan appended last in pack order), generateLessonPack authors the plan from the shared unpack through buildLessonPlanPrompts and validateLessonPlan with the lesson-plan repair kind (a failing plan rejects the pack with err.material naming lessonPlan), the manifest materials list gains lessonPlan, and the pipeline pack types follow - pinned by the extended tests/pipeline-lesson-pack.test.js. No printable renderer or pack-demo surface in this slice: renderLessonPlan plus the pack-demo wiring for the six gate packs is slice 3, and issue #1206 stays open until it lands. (2026-10-23)
- Lesson-plan core (issue #1215, slice 1 of #1206): SPEC.md gains a Lesson plan spec - the plan a teacher script delivers from, with a durationMinutes lesson length, objectives carrying unique ids, successCriteria (I-can statements) and assessmentPoints, and activities whose minutes sum exactly to the duration, each naming the objectives it delivers and optionally the scriptCue of the teacher-script segment that delivers it, plus grouping, resources and differentiation (support / stretch). player/validate.js gains validateLessonPlan enforcing every rule, generator/build_lesson_plan_prompt.js authors plans against the contract with a validating water-cycle exemplar, and generator/pipeline.js gains generateLessonPlan with the generateScript deps and repair semantics; package subpath exports ./lesson-plan-prompt and ./lesson-plan are added, pinned by tests/lesson-plan.test.js. No renderer, gold plans or lesson-pack integration in this slice - folding the plan into the lesson pack and rendering it are slice-2 follow-ons under issue #1206. (2026-10-23)
- Mark schemes on the six-topic subset gate (issue #1213, slice 2 of #1205): the gold worksheets and gold exit tickets for primary-math-fractions-addition, primary-science-water-cycle, secondary-e-algebra, secondary-physics-energy, jc-h2-differentiation and jc-h2-cell-bio now carry marks and a markScheme on every question (credit points sum exactly to the question marks; the topic misconception is recorded as a common error where the question carries one) plus a workedSolution on every short-answer question - a retrofit only, with no existing text changed - pinned by tests/mark-scheme-gold.test.js, which also checks the printable teacher key renders the schemes while the student sheet excludes them and that all six topics stay stacked in the pack demo. This completes issue #1205; the remaining-topic backfill stays a follow-on under epic #1204. (2026-10-23)
- Mark-scheme core for worksheets and exit tickets (issue #1211, slice 1 of #1205): a question may carry marks, a markScheme (credit points whose marks must sum to the question marks, plus optional alternatives, commonErrors and an ecf error-carried-forward flag) and a workedSolution, all strictly validated when present in player/validate.js (a scheme without marks is an error, and a short-answer question carrying a scheme requires a workedSolution); the worksheet and exit-ticket author prompts generate the scheme with the question, and the printable teacher answer key renders the marks, credit points, alternatives, common errors, ECF note and worked solution while the student sheet never reads a scheme field. (2026-10-23)
- Primary Social Studies neighbourhood-change gold lesson pack (issue #1209, slice 2 of #1202): five hand-authored gold samples named primary-social-studies-neighbourhood-change.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the neighbourhood-change animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (A neighbourhood changes all at once, because the new flats, shops and MRT station all appear in a single step.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-neighbourhood-change-pack.test.js. This completes issue #1202. (2026-10-22)

- Primary Social Studies neighbourhood-change foundation (issue #1203, slice 1 of #1202): topic neighbourhood-change added to the existing Primary Social Studies track (id p-social-studies, subject social-studies; no new track, no SUBJECTS change) in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/primary-social-studies-neighbourhood-change.json (one neighbourhood site transforming stage by stage - a small area of low-rise houses and open ground first gains transport links as an MRT station and bus stop arrive, then housing blocks rise plot by plot, and shops, a market and a school open as families move in, with the population bar climbing at every stage and the wrong turn that a neighbourhood changes all at once played out and corrected in the final scene), registered in samples/index.json and the player demo picker, plus a neighbourhood-change misconception bank entry in generator/misconceptions.js (wrongTurn: A neighbourhood changes all at once, because the new flats, shops and MRT station all appear in a single step.). Pins updated to 95 slugs / 95 bank entries / 97 samples. (2026-10-22)

- Primary Social Studies water-supply gold lesson pack (issue #1200, slice 2 of #1197): five hand-authored gold samples named primary-social-studies-water-supply.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the water-supply animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Tap water is clean as soon as it is collected, because rainwater and reservoir water are already safe to drink.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-water-supply-pack.test.js. This completes issue #1197. (2026-10-22)

- Primary Social Studies water-supply foundation (issue #1198, slice 1 of #1197): topic water-supply added to the existing Primary Social Studies track (id p-social-studies, subject social-studies; no new track, no SUBJECTS change) in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/primary-social-studies-water-supply.json (one body of water moving through Singapore's supply chain stage by stage - rain is collected in a reservoir, raw water is drawn off to the treatment works, treatment stages remove dirt and germs one stage at a time so a cleanliness bar climbs at every stage, and the cleaned water is stored and piped to home taps, with the wrong turn that tap water needs no treatment played out and corrected in the final scene), registered in samples/index.json and the player demo picker, plus a water-supply misconception bank entry in generator/misconceptions.js (wrongTurn: Tap water is clean as soon as it is collected, because rainwater and reservoir water are already safe to drink.). Pins updated to 94 slugs / 94 bank entries / 96 samples. (2026-10-22)
- JC China Studies urbanisation gold lesson pack (issue #1195, slice 2 of #1192): five hand-authored gold samples named jc-china-studies-urbanisation.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the urbanisation animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (A Chinese city becomes urban in one sudden leap, because its farmland is replaced by built-up districts all at once.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-urbanisation-pack.test.js. This completes issue #1192. (2026-10-22)
- JC H2 China Studies in English 9628 urbanisation foundation (issue #1193, slice 1 of #1192): new JC China Studies track (id h2-china-studies, subject china-studies, added to SUBJECTS in player/validate.js and the SYLLABUS.md subject-list line) with topic urbanisation in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-china-studies-urbanisation.json (one Chinese city transforming across decades as people move in - farmland at the edge is built over stage by stage as factories and the first housing blocks appear, the built-up districts spread outward and the farmland shrinks, the urban population share bar climbs and the rural share bar falls at every stage, and the wrong turn of one sudden leap is played out in the final scene before the true staged growth is replayed and restored), registered in samples/index.json and the player demo picker, plus an urbanisation misconception bank entry in generator/misconceptions.js (wrongTurn: A Chinese city becomes urban in one sudden leap, because its farmland is replaced by built-up districts all at once.). Pins updated to 93 slugs / 93 bank entries / 95 samples. (2026-10-22)
- Secondary Design Studies ergonomic-dimensions gold lesson pack (issue #1190, slice 2 of #1187): five hand-authored gold samples named secondary-design-studies-ergonomic-dimensions.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the ergonomic-dimensions animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (One standard size fits every user, because a chair built to average measurements fits each person who sits in it.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-ergonomic-dimensions-pack.test.js. This completes issue #1187. (2026-10-22)

- Secondary Design Studies NP05 ergonomic-dimensions foundation (issue #1188, slice 1 of #1187): new Secondary Design Studies track (id design-studies, subject design-studies, added to SUBJECTS in player/validate.js and the SYLLABUS.md subject-list line) with topic ergonomic-dimensions in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/secondary-design-studies-ergonomic-dimensions.json (one chair-and-desk set sized for one student stage by stage - the student is measured, the seat height rises to the lower-leg height so the feet rest flat and the under-seat gap closes, the seat widens to the hip breadth plus clearance, the desk height is set to the seated elbow height so the forearms rest level, a fit bar climbs as each fit gap closes, and the wrong turn of one standard size is played out in the final scene before the fitted sizes are restored), registered in samples/index.json and the player demo picker, plus an ergonomic-dimensions misconception bank entry in generator/misconceptions.js (wrongTurn: One standard size fits every user, because a chair built to average measurements fits each person who sits in it.). Pins updated to 92 slugs / 92 bank entries / 94 samples. (2026-10-22)

- Primary Social Studies landscape-change gold lesson pack (issue #1185, slice 2 of #1182): five hand-authored gold samples named primary-social-studies-landscape-change.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the landscape-change animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Singapore's landscape changed in one sudden jump, because the fishing village was replaced by the modern city in a single step.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-landscape-change-pack.test.js. This completes issue #1182. (2026-10-22)

- Primary Social Studies landscape-change foundation (issue #1183, slice 1 of #1182): new Primary Social Studies track (id p-social-studies, subject social-studies; no SUBJECTS change - social-studies was already listed) with topic landscape-change in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/primary-social-studies-landscape-change.json (Singapore's landscape changing over time at one coastal site - the Singapore River mouth transforming stage by stage: a fishing village of huts and small boats becomes a trading port with godowns, a jetty and larger ships as trade grows, the port expands with warehouses and steamships, then the modern city rises with tall buildings, roads and container ships, with a population bar climbing at every stage), registered in samples/index.json and the player demo picker, plus a landscape-change misconception bank entry in generator/misconceptions.js (wrongTurn: Singapore's landscape changed in one sudden jump, because the fishing village was replaced by the modern city in a single step.). Pins updated to 91 slugs / 91 bank entries / 93 samples. (2026-10-22)

- Secondary Biotechnology NP04 fermentation gold lesson pack (issue #1180, slice 2 of #1177): five hand-authored gold samples named secondary-biotechnology-fermentation.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the fermentation animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The alcohol appears from nothing as the mixture ferments, because the glucose in the flask stays the same while ethanol and gas are produced.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-fermentation-pack.test.js. This completes issue #1177. (2026-10-22)

- Secondary Biotechnology NP04 foundation (issue #1178, slice 1 of #1177): new Secondary Biotechnology track (subject biotechnology, added to SUBJECTS in player/validate.js and the SYLLABUS.md subject-list line) with topic fermentation in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/secondary-biotechnology-fermentation.json (NP04: yeast in one flask converting glucose to ethanol and carbon dioxide over time - the glucose bar falls as the yeast consumes it, the ethanol bar rises, and carbon dioxide bubbles form, rise and collect in the gas space), registered in samples/index.json and the player demo picker, plus a fermentation misconception bank entry in generator/misconceptions.js (wrongTurn: The alcohol appears from nothing as the mixture ferments, because the glucose in the flask stays the same while ethanol and gas are produced.). Pins updated to 90 slugs / 90 bank entries / 92 samples. (2026-10-22)

- Secondary Social Studies 2260-2265 globalisation-supply-chain gold lesson pack (issue #1175, slice 2 of #1172): five hand-authored gold samples named secondary-social-studies-globalisation-supply-chain.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the globalisation-supply-chain animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (A global product is made entirely in the country where it is sold, because every stage of making it happens in one place.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-globalisation-supply-chain-pack.test.js. This completes issue #1172. (2026-10-22)

- Secondary Social Studies 2260-2265 foundation (issue #1173, slice 1 of #1172): new Secondary Social Studies track (subject social-studies, added to SUBJECTS in player/validate.js and the SYLLABUS.md subject-list line) with topic globalisation-supply-chain in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/secondary-social-studies-globalisation-supply-chain.json (Combined Humanities Issue 3: one smartphone supply chain - raw materials mined in one country, components made in a second, assembly in a third, shipped to a Singapore shop shelf, a value-added bar rising at every handover and route arrows carrying the product on), registered in samples/index.json and the player demo picker, plus a globalisation-supply-chain misconception bank entry in generator/misconceptions.js (wrongTurn: A global product is made entirely in the country where it is sold, because every stage of making it happens in one place.). Pins updated to 89 slugs / 89 bank entries / 91 samples. (2026-10-22)

- Secondary History 2174 decolonisation-chain gold lesson pack (issue #1170, slice 2 of #1167): five hand-authored gold samples named secondary-history-decolonisation-chain.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the decolonisation-chain animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Each colony won independence on its own, because what happened in a neighbouring territory made no difference to nationalist pressure at home.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-decolonisation-chain-pack.test.js. This completes issue #1167. (2026-10-22)

- Secondary History 2174 foundation (issue #1168, slice 1 of #1167): new Secondary History track (subject history, already in SUBJECTS so no SUBJECTS change) with topic decolonisation-chain in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/secondary-history-decolonisation-chain.json (SEAB 2174: independence in one territory raises nationalist pressure in the next, stage by stage Philippines 1946, Indonesia recognised 1949, Malaya 1957, Singapore internal self-government 1959, pressure bars rising past thresholds, control bars falling, transmission arrows carrying the example on), registered in samples/index.json and the player demo picker, plus a decolonisation-chain misconception bank entry in generator/misconceptions.js (wrongTurn: Each colony won independence on its own, because what happened in a neighbouring territory made no difference to nationalist pressure at home.). Pins updated to 88 slugs / 88 bank entries / 90 samples. (2026-10-22)

- JC H2 History 9174 oil-shock gold lesson pack (issue #1165, slice 2 of #1162): five hand-authored gold samples named jc-history-oil-shock.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the oil-shock animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The 1973 oil crisis pushed prices up because governments printed extra money to pay for dearer oil.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-oil-shock-pack.test.js. This completes issue #1162. (2026-10-22)

- JC H2 History 9174 foundation (issue #1163, slice 1 of #1162): new JC H2 History track (subject history, added to SUBJECTS in player/validate.js and the SYLLABUS.md subject-list line) with topic oil-shock in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-history-oil-shock.json (SEAB 9174 Paper 1 Theme II: the 1973 OPEC embargo closes the valve on one supply flow, the world oil price bar jumps from about $3 to about $12 a barrel, and the rise is carried stage by stage into transport costs, factory costs and shop prices while a demand bar falls back), registered in samples/index.json and the player demo picker, plus an oil-shock misconception bank entry in generator/misconceptions.js (wrongTurn: The 1973 oil crisis pushed prices up because governments printed extra money to pay for dearer oil.). Pins updated to 87 slugs / 87 bank entries / 89 samples. (2026-10-22)

- JC H2 Management of Business 9587 inventory-control gold lesson pack (issue #1160, slice 2 of #1157): five hand-authored gold samples named jc-mob-inventory-control.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the inventory-control animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Reorder only when stock runs out, because buffer stock is spare stock that should never be touched and deliveries arrive straight away.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-inventory-control-pack.test.js. This completes issue #1157. (2026-10-22)

- JC H2 Management of Business 9587 foundation (issue #1158, slice 1 of #1157): new JC H2 Management of Business track (subject management-of-business, added to SUBJECTS in player/validate.js and the SYLLABUS.md subject-list line) with topic inventory-control in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-mob-inventory-control.json (SEAB 9587: the sawtooth stock chart for one stocked item - stock falls at a steady usage rate from the maximum stock level of 1,000 units, the fall crossing the reorder level of 500 units triggers a new order, stock keeps falling through the 2-day lead time towards but never below the buffer stock of 250 units, and the delivery lands and jumps stock back to the maximum level so the sawtooth runs a second cycle), registered in samples/index.json and the player demo picker, plus an inventory-control misconception bank entry in generator/misconceptions.js (wrongTurn: Reorder only when stock runs out, because buffer stock is spare stock that should never be touched and deliveries arrive straight away.). Pins updated to 86 slugs / 86 bank entries / 88 samples. (2026-10-22)

- JC H2 Principles of Accounting 9593 foundation (issue #1153, slice 1 of #1152): new JC H2 Principles of Accounting track (subject principles-of-accounts) with topic absorption-marginal-costing in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-poa-absorption-marginal-costing.json (SEAB 9593: direct materials $10 + direct labour $6 + variable production overhead $4 builds a marginal unit cost of $20 in both columns, fixed production overhead of $12,000 over 1,000 units produced lands only in the absorption column at $12 per unit for an absorption unit cost of $32, and with 800 units sold the 200-unit closing inventory carries $2,400 of fixed overhead forward under absorption costing while marginal costing expenses the full $12,000, so absorption profit of $9,400 exceeds marginal profit of $7,000 by exactly $2,400), registered in samples/index.json and the player demo picker, plus an absorption-marginal-costing misconception bank entry in generator/misconceptions.js (wrongTurn: Absorption and marginal costing always report the same profit, because fixed production overhead is a period cost under both methods.). Pins updated to 85 slugs / 85 bank entries / 87 samples. (2026-10-22)

- JC H2 Principles of Accounting 9593 absorption-marginal-costing gold lesson pack (issue #1155, slice 2 of #1152): five hand-authored gold samples named jc-poa-absorption-marginal-costing.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the absorption-marginal-costing animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Absorption and marginal costing always report the same profit, because fixed production overhead is a period cost under both methods.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-absorption-marginal-costing-pack.test.js. This completes issue #1152. (2026-10-22)

- JC H2 Computing 9569 recursion gold lesson pack (issue #1150, slice 2 of #1147): five hand-authored gold samples named jc-computing-recursion.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the recursion animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (A recursive call replaces the caller, so factorial(4) is finished and gone once factorial(3) starts.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-recursion-pack.test.js. This completes issue #1147. (2026-10-22)

- JC H2 Computing 9569 foundation (issue #1148, slice 1 of #1147): new JC H2 Computing track (subject computing) with topic recursion in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-computing-recursion.json (SEAB 9569: one recursive evaluation of factorial(4) - the call stack grows frame by frame as factorial(4) calls factorial(3) calls factorial(2) calls factorial(1), the base case returns 1 without calling further, then the stack unwinds as each suspended frame resumes and multiplies 1, 2, 6, 24), registered in samples/index.json and the player demo picker, plus a recursion misconception bank entry in generator/misconceptions.js (wrongTurn: A recursive call replaces the caller, so factorial(4) is finished and gone once factorial(3) starts.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 84 slugs / 84 bank entries / 86 samples. (2026-10-22)

- JC H2 Geography 9173 drainage-basin gold lesson pack (issue #1145, slice 2 of #1142): five hand-authored gold samples named jc-geog-drainage-basin.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the drainage-basin animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The river peaks when the rain is heaviest, because rain runs straight off the surface into the river.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-drainage-basin-pack.test.js. This completes issue #1142. (2026-10-22)

- JC H2 Geography 9173 foundation (issue #1143, slice 1 of #1142): new JC H2 Geography track (subject geography) with topic drainage-basin in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-geog-drainage-basin.json (SEAB 9173: a storm pulse fills the basin stores in sequence - interception first, then soil, then groundwater - overland flow switches on only at soil saturation, so discharge peaks after the rain eases and recedes slowly on groundwater baseflow), registered in samples/index.json and the player demo picker, plus a drainage-basin misconception bank entry in generator/misconceptions.js (wrongTurn: The river peaks when the rain is heaviest, because rain runs straight off the surface into the river.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 83 slugs / 83 bank entries / 85 samples. (2026-10-22)

- Secondary Exercise and Sports Science 6081 foundation (issue #1136, slice 1 of #1135): new Secondary Exercise and Sports Science track (subject exercise-sports-science) with topic energy-systems in all three syllabus mirrors, exercise-sports-science registered in player/validate.js SUBJECTS, a hand-authored mechanism-first sample samples/secondary-exercise-sports-science-energy-systems.json (SEAB 6081: during one continuous bout of exercise all three energy systems contribute throughout and only their shares change - ATP-PC dominates the first seconds at about 70 percent while the phosphocreatine store drains, anaerobic glycolysis takes the largest share at about 55 percent as lactate builds, then the aerobic system ramps up to supply most of the energy at about 75 percent), registered in samples/index.json and the player demo picker, plus an energy-systems misconception bank entry in generator/misconceptions.js (wrongTurn: The body uses only one energy system at a time and switches cleanly to the next one when the first runs out.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 82 slugs / 82 bank entries / 84 samples. (2026-10-22)

- Secondary Exercise and Sports Science 6081 energy-systems gold lesson pack (issue #1140, slice 2 of #1135): five hand-authored gold samples named secondary-exercise-sports-science-energy-systems.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the energy-systems animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The body uses only one energy system at a time and switches cleanly to the next one when the first runs out.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-energy-systems-pack.test.js. This completes issue #1135. (2026-10-22)

- Secondary Business Studies 7085 break-even gold lesson pack (issue #1133, slice 2 of #1130): five hand-authored gold samples named secondary-business-studies-break-even.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the break-even animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Fixed costs rise as output rises, so total cost starts at zero like revenue.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-break-even-pack.test.js. This completes issue #1130. (2026-10-22)

- Secondary Business Studies 7085 foundation (issue #1131, slice 1 of #1130): new Secondary Business Studies track (subject business-studies) with topic break-even in all three syllabus mirrors, business-studies registered in player/validate.js SUBJECTS, a hand-authored mechanism-first sample samples/secondary-business-studies-break-even.json (SEAB 7085: for one product at a fixed price of $20, fixed costs of $2,000 stay flat, total cost rises from the $2,000 fixed-cost intercept by $10 of variable cost per unit and total revenue rises faster from zero, so the lines cross once at the break-even output of 200 units and $4,000 - loss below it, profit above it), registered in samples/index.json and the player demo picker, plus a break-even misconception bank entry in generator/misconceptions.js (wrongTurn: Fixed costs rise as output rises, so total cost starts at zero like revenue.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 81 slugs / 81 bank entries / 83 samples. (2026-10-22)

- Secondary Principles of Accounts 7087 double-entry gold lesson pack (issue #1128, slice 2 of #1125): five hand-authored gold samples named secondary-principles-of-accounts-double-entry.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the double-entry animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Buying equipment with cash makes the business poorer so total assets fall.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-double-entry-pack.test.js. This completes issue #1125.

- Secondary Principles of Accounts 7087 foundation (issue #1126, slice 1 of #1125): new Secondary Principles of Accounts track (subject principles-of-accounts) with topic double-entry in all three syllabus mirrors, principles-of-accounts registered in player/validate.js SUBJECTS, a hand-authored mechanism-first sample samples/secondary-principles-of-accounts-double-entry.json (SEAB 7087: one cash purchase of equipment changes two accounts at once - equipment rises and cash falls by the same $4,000, so the accounting equation Assets = Capital + Liabilities stays balanced and total assets are unchanged), registered in samples/index.json and the player demo picker, plus a double-entry misconception bank entry in generator/misconceptions.js (wrongTurn: Buying equipment with cash makes the business poorer so total assets fall.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 80 slugs / 80 bank entries / 82 samples. (2026-10-22)

- Secondary Nutrition and Food Science 6097 protein-denaturation gold lesson pack (issue #1123, slice 2 of #1120): five hand-authored gold samples named secondary-nutrition-food-science-protein-denaturation.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the protein-denaturation animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The white sets because the heat dries the water out of it.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-protein-denaturation-pack.test.js. This completes issue #1120.

- Secondary Nutrition and Food Science 6097 foundation (issue #1121, slice 1 of #1120): new Secondary Nutrition and Food Science track (subject nutrition-food-science) with topic protein-denaturation in all three syllabus mirrors, nutrition-food-science registered in player/validate.js SUBJECTS, a hand-authored mechanism-first sample samples/secondary-nutrition-food-science-protein-denaturation.json (SEAB 6097: folded chains unfold in gentle heat, bond into a network trapping water, white turns opaque and sets), registered in samples/index.json and the player demo picker, plus a protein-denaturation misconception bank entry in generator/misconceptions.js (wrongTurn: The white sets because the heat dries the water out of it.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 79 slugs / 79 bank entries / 81 samples. (2026-10-22)

- Secondary Design and Technology vacuum-forming gold lesson pack (issue #1118, slice 2 of #1115): five hand-authored gold samples named secondary-design-technology-vacuum-forming.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the vacuum-forming animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The vacuum sucks and pulls the soft plastic sheet down onto the mould.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-vacuum-forming-pack.test.js. This completes issue #1115.

- Secondary Design and Technology 7059 foundation (issue #1116, slice 1 of #1115): new Secondary Design and Technology track (subject design-technology) with topic vacuum-forming in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), design-technology registered in player/validate.js SUBJECTS, a hand-authored mechanism-first sample samples/secondary-design-technology-vacuum-forming.json (SEAB 7059: a thermoplastic sheet is clamped and heated until pliable, the mould rises into it, a vacuum removes the air beneath, and outside air pressure pushes the sheet onto the mould before it cools rigid), registered in samples/index.json and the player demo picker, plus a vacuum-forming misconception bank entry in generator/misconceptions.js (wrongTurn: The vacuum sucks and pulls the soft plastic sheet down onto the mould.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 78 slugs / 78 bank entries / 80 samples. (2026-10-21)

- Secondary Electronics sensor-divider gold lesson pack (issue #1113, slice 2 of #1110): five hand-authored gold samples named secondary-electronics-sensor-divider.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the sensor-divider animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (As it gets darker and the LDR's resistance rises, the voltage across the LDR falls, so the sensor output switches the lamp off.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-sensor-divider-pack.test.js. This completes issue #1110.

- Secondary Electronics 6063 foundation (issue #1111, slice 1 of #1110): new Secondary Electronics track (subject electronics) with topic sensor-divider in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), electronics registered in player/validate.js SUBJECTS, a hand-authored mechanism-first sample samples/secondary-electronics-sensor-divider.json (SEAB 6063: an LDR in series with a fixed resistor forms a potential divider - as light falls in stages the LDR resistance steps up, the divided voltage across the LDR climbs, and at the threshold the output switches a lamp on in the dark), registered in samples/index.json and the player demo picker, plus a sensor-divider misconception bank entry in generator/misconceptions.js (wrongTurn: As it gets darker and the LDR's resistance rises, the voltage across the LDR falls, so the sensor output switches the lamp off.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 77 slugs / 77 bank entries / 79 samples.

- JC H2 Mathematics maclaurin-series gold lesson pack (issue #1108, slice 2 of #1085): five hand-authored gold samples named jc-h2-maclaurin-series.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the maclaurin-series animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Adding more terms makes the polynomial match sin x everywhere, however far x gets from 0.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-maclaurin-series-pack.test.js. This completes issue #1085.

- JC H2 Mathematics 9758 foundation (issue #1106, slice 1 of #1085): topic maclaurin-series in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-h2-maclaurin-series.json (SEAB 9758 section 5.2 Maclaurin series, the concept bullet: sin x built term by term, each term widening the accurate region around 0, diverging far from 0), registered in samples/index.json and the player demo picker, plus a maclaurin-series misconception bank entry in generator/misconceptions.js (wrongTurn: Adding more terms makes the polynomial match sin x everywhere, however far x gets from 0.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 76 slugs / 76 bank entries / 78 samples.

- JC Further Mathematics logistic-growth gold lesson pack (issue #1104, slice 2 of #1084): five hand-authored gold samples named jc-further-logistic-growth.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the logistic-growth animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The population keeps growing faster and faster like a pure exponential, so it never slows down or levels off.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-logistic-growth-pack.test.js. This completes issue #1084.

- JC Further Mathematics 9649 foundation (issue #1102, slice 1 of #1084): new JC Further Mathematics track (subject math) with topic logistic-growth in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-further-logistic-growth.json (SEAB 9649 section 1.5 Differential equations, the logistic growth bullet: the population curve bends and levels exactly at the carrying-capacity equilibrium P = K, a slope field funnels starting curves to the same ceiling, and harvesting drags the equilibrium down), registered in samples/index.json and the player demo picker, plus a logistic-growth misconception bank entry in generator/misconceptions.js (wrongTurn: The population keeps growing faster and faster like a pure exponential, so it never slows down or levels off.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 75 slugs / 75 bank entries / 77 samples.

- JC H2 Economics multiplier-process gold lesson pack (issue #1100, slice 2 of #1083): five hand-authored gold samples named jc-h2-multiplier-process.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the multiplier-process animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Every round re-spends the full injection, so national income grows by the same amount each round without limit.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-multiplier-process-pack.test.js. This completes issue #1083.

- JC H2 Economics 9570 foundation (issue #1098, slice 1 of #1083): new JC H2 Economics track (subject economics) with topic multiplier-process in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/jc-h2-multiplier-process.json (SEAB 9570 Theme 3.1.2(e), anchored on the circular flow of Theme 3.1.1: one autonomous injection is re-spent in geometrically shrinking rounds - $100, then $80, then $64 - as leakages bite each round, so national income settles at $500, five times the injection, and aggregate demand shifts in shrinking steps), registered in samples/index.json and the player demo picker, plus a multiplier-process misconception bank entry in generator/misconceptions.js (wrongTurn: Every round re-spends the full injection, so national income grows by the same amount each round without limit.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 74 slugs / 74 bank entries / 76 samples.

- Secondary Computing logic-gates gold lesson pack (issue #1096, slice 2 of #1082): five hand-authored gold samples named secondary-computing-logic-gates.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the logic-gates animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The alarm is on whenever A is on, because OR works just like AND.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-logic-gates-pack.test.js. This completes issue #1082.

- Secondary Computing 7155 foundation (issue #1094, slice 1 of #1082): new Secondary Computing track (subject computing) with topic logic-gates in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), computing registered in player/validate.js SUBJECTS, a hand-authored mechanism-first sample samples/secondary-computing-logic-gates.json (SEAB 7155 Module 1.3 outcomes 1.3.5 and 1.3.2: one combined two-gate three-input circuit, alarm = (A AND B) OR (NOT C), where the inputs cycle, the signal propagates gate by gate and the truth table fills row by row), registered in samples/index.json and the player demo picker, plus a logic-gates misconception bank entry in generator/misconceptions.js (wrongTurn: The alarm is on whenever A is on, because OR works just like AND.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 73 slugs / 73 bank entries / 75 samples.

- Secondary Economics demand-supply-equilibrium gold lesson pack (issue #1092, slice 2 of #1081): five hand-authored gold samples named secondary-econ-demand-supply-equilibrium.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the demand-supply-equilibrium animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (Higher income just slides buyers along the same demand curve to a bigger quantity.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-demand-supply-equilibrium-pack.test.js. This completes issue #1081.

- Secondary Economics 2286 foundation (issue #1090, slice 1 of #1081): new Secondary Economics track (subject economics) with topic demand-supply-equilibrium in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), economics registered in player/validate.js SUBJECTS, a hand-authored mechanism-first sample samples/secondary-econ-demand-supply-equilibrium.json (SEAB 2286 section 2.3.4 conditions of demand worked through section 2.6.2: a rise in consumer income for a normal good shifts only the demand curve right, a shortage opens at the old price, and competition bids the price up along the unchanged supply curve to the new equilibrium), registered in samples/index.json and the player demo picker, plus a demand-supply-equilibrium misconception bank entry in generator/misconceptions.js (wrongTurn: Higher income just slides buyers along the same demand curve to a bigger quantity.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 72 slugs / 72 bank entries / 74 samples.

- Secondary Geography tectonics-subduction gold lesson pack (issue #1088, slice 2 of #1080): five hand-authored gold samples named secondary-geog-tectonics-subduction.json across samples/decks, samples/worksheets, samples/tickets, samples/notes and samples/scripts, keyed to the tectonics-subduction animation scenes s1-s4 (deck 11 slides = 7 fixed + 4 mechanism), with the bank wrongTurn (The continental plate pushes the oceanic plate down underneath it.) verbatim across worksheet, ticket, notes trap and script watchFor (script watchFor on the final s4 segment only; deck zero verbatim), a pack-demo surface entry presenting all six materials, and a dedicated gold test tests/gold-tectonics-subduction-pack.test.js. This completes issue #1080.

- Secondary Geography 2279 foundation (issue #1086, slice 1 of #1080): new Secondary Geography track (subject geography) with topic tectonics-subduction in all three syllabus mirrors (SYLLABUS.md, generator/syllabus.js, web/syllabus.js), a hand-authored mechanism-first sample samples/secondary-geog-tectonics-subduction.json (SEAB 2279 Topic 4.1 Key Question 4 Content 2 convergent boundaries powered by Key Question 1 Content 3 slab-pull: the denser oceanic plate bends down at the trench, sinks under its own weight and drags the plate behind it, so trench, earthquakes and volcanic arc read as one causal chain), registered in samples/index.json and the player demo picker, plus a tectonics-subduction misconception bank entry in generator/misconceptions.js (wrongTurn: The continental plate pushes the oceanic plate down underneath it.). Syllabus, misconception-bank, sample-count and demo-picker pins updated to 71 slugs / 71 bank entries / 73 samples.

- Water-cycle gold lesson pack test: tests/gold-water-cycle-pack.test.js now guards the Primary Science water-cycle gold lesson pack (five gold samples in samples/decks|worksheets|tickets|notes|scripts/primary-science-water-cycle.json), validating every material, pinning the 11-slide deck keyed to animation scenes s1-s4, and locking the misconception against the live bank entry MISCONCEPTIONS['water-cycle'] (wrongTurn: Water disappears for good once it evaporates.) (issue #1077).

- Secondary bio-nutrition gold lesson pack: five hand-authored gold samples for the diet-and-digestion facet of bio-nutrition in samples/decks/secondary-science-bio-nutrition.json, samples/worksheets/secondary-science-bio-nutrition.json, samples/tickets/secondary-science-bio-nutrition.json, samples/notes/secondary-science-bio-nutrition.json and samples/scripts/secondary-science-bio-nutrition.json, keyed to the secondary-science-bio-nutrition animation scenes, misconception bank trap reused verbatim: Digestion finishes in the stomach., guarded by tests/gold-bio-nutrition-pack.test.js (issue #1075); player/pack-demo.html also stacks the pack as its seventy-first demo surface (bio-nutrition-digestion-secondary-manifest) in the same change so the pack-demo set pin from issue #1073 stays green on main.

- Pack-demo set pin: tests/pack-demo-set.test.js derives the gold lesson-pack file set from samples/decks|worksheets|tickets|notes|scripts/ on disk and asserts player/pack-demo.html references every gold file exactly once, references no gold file that does not exist, and carries exactly one unique manifest header per gold pack, so a future gold pack can no longer silently lack a demo surface; ROADMAP.md R-3 misconception count corrected from 67 to 70 seed entries to match the live bank in generator/misconceptions.js (issue #1073).

- Player demo sample picker completeness: player/demo.html now offers the three Primary Geography samples (primary-geog-erosion.json, primary-geog-plate-tectonics.json, primary-geog-weather-climate.json) alongside the other Primary entries, so all 72 samples in samples/index.json are selectable in the no-API-key demo; tests/demo-picker.test.js pins the picker option set to samples/index.json exactly so the two cannot silently drift apart again (issue #1071).

- Secondary bio-ecology gold lesson pack: five hand-authored gold samples for bio-ecology in samples/decks/secondary-science-bio-ecology.json, samples/worksheets/secondary-science-bio-ecology.json, samples/tickets/secondary-science-bio-ecology.json, samples/notes/secondary-science-bio-ecology.json and samples/scripts/secondary-science-bio-ecology.json, keyed to the secondary-science-bio-ecology animation scenes, misconception bank trap reused verbatim: Energy is recycled around the food chain like nutrients are., guarded by tests/gold-bio-ecology-pack.test.js (issue #1067).
- Secondary bio-reproduction gold lesson pack: five hand-authored gold samples for bio-reproduction in samples/decks/secondary-science-bio-reproduction.json, samples/worksheets/secondary-science-bio-reproduction.json, samples/tickets/secondary-science-bio-reproduction.json, samples/notes/secondary-science-bio-reproduction.json and samples/scripts/secondary-science-bio-reproduction.json, keyed to the secondary-science-bio-reproduction animation scenes, misconception bank trap reused verbatim: Pollination is fertilisation., guarded by tests/gold-bio-reproduction-pack.test.js (issue #1063).
- Secondary bio-transport gold lesson pack: five hand-authored gold samples for bio-transport in samples/decks/secondary-science-bio-transport.json, samples/worksheets/secondary-science-bio-transport.json, samples/tickets/secondary-science-bio-transport.json, samples/notes/secondary-science-bio-transport.json and samples/scripts/secondary-science-bio-transport.json, keyed to the secondary-science-bio-transport animation scenes, misconception bank trap reused verbatim: Arteries always carry oxygenated blood., guarded by tests/gold-bio-transport-pack.test.js (issue #1059).
- Secondary bio-cells gold lesson pack: five hand-authored gold samples for bio-cells in samples/decks/secondary-science-cells.json, samples/worksheets/secondary-science-cells.json, samples/tickets/secondary-science-cells.json, samples/notes/secondary-science-cells.json and samples/scripts/secondary-science-cells.json, keyed to the secondary-science-cells animation scenes, misconception bank trap reused verbatim: The cell membrane is a solid wall that blocks everything from entering or leaving., guarded by tests/gold-bio-cells-pack.test.js (issue #1055).
- Secondary chem-acids gold lesson pack: five hand-authored gold samples for chem-acids in samples/decks/secondary-science-chem-acids.json, samples/worksheets/secondary-science-chem-acids.json, samples/tickets/secondary-science-chem-acids.json, samples/notes/secondary-science-chem-acids.json and samples/scripts/secondary-science-chem-acids.json, keyed to the secondary-science-chem-acids animation scenes, misconception bank trap reused verbatim: All acids are strong acids., guarded by tests/gold-chem-acids-pack.test.js (issue #1051).

- Secondary chem-bonding gold lesson pack: five hand-authored gold samples for chem-bonding in samples/decks/secondary-science-chem-bonding.json, samples/worksheets/secondary-science-chem-bonding.json, samples/tickets/secondary-science-chem-bonding.json, samples/notes/secondary-science-chem-bonding.json and samples/scripts/secondary-science-chem-bonding.json, keyed to the secondary-science-chem-bonding animation scenes, misconception bank trap reused verbatim: Table salt is made of NaCl molecules., guarded by tests/gold-chem-bonding-pack.test.js (issue #1047).

- Secondary chem-atomic gold lesson pack: five hand-authored gold samples for chem-atomic in samples/decks/secondary-science-chem-atomic.json, samples/worksheets/secondary-science-chem-atomic.json, samples/tickets/secondary-science-chem-atomic.json, samples/notes/secondary-science-chem-atomic.json and samples/scripts/secondary-science-chem-atomic.json, keyed to the secondary-science-chem-atomic animation scenes, misconception bank trap reused verbatim: Atoms are solid balls., guarded by tests/gold-chem-atomic-pack.test.js (issue #1043).

- Secondary phys-electricity gold lesson pack: five hand-authored gold samples for phys-electricity in samples/decks/secondary-science-electricity.json, samples/worksheets/secondary-science-electricity.json, samples/tickets/secondary-science-electricity.json, samples/notes/secondary-science-electricity.json and samples/scripts/secondary-science-electricity.json, keyed to the secondary-science-electricity animation scenes, misconception bank trap reused verbatim: The bulb uses up the current., guarded by tests/gold-phys-electricity-pack.test.js (issue #1039).

- Secondary phys-energy gold lesson pack: five hand-authored gold samples for phys-energy in samples/decks/secondary-physics-energy.json, samples/worksheets/secondary-physics-energy.json, samples/tickets/secondary-physics-energy.json, samples/notes/secondary-physics-energy.json and samples/scripts/secondary-physics-energy.json, keyed to the secondary-physics-energy animation scenes, misconception bank trap reused verbatim: Energy gets used up when work is done., guarded by tests/gold-phys-energy-pack.test.js (issue #1035).

- Secondary phys-forces gold lesson pack: five hand-authored gold samples for phys-forces in samples/decks/secondary-physics-forces.json, samples/worksheets/secondary-physics-forces.json, samples/tickets/secondary-physics-forces.json, samples/notes/secondary-physics-forces.json and samples/scripts/secondary-physics-forces.json, keyed to the secondary-physics-forces animation scenes, misconception bank trap reused verbatim: The same push gives the same pressure whether you stand flat or on tiptoes., guarded by tests/gold-phys-forces-pack.test.js (issue #1031).


- Secondary phys-kinematics gold lesson pack: five hand-authored gold samples for phys-kinematics in samples/decks/secondary-physics-kinematics.json, samples/worksheets/secondary-physics-kinematics.json, samples/tickets/secondary-physics-kinematics.json, samples/notes/secondary-physics-kinematics.json and samples/scripts/secondary-physics-kinematics.json, keyed to the secondary-physics-kinematics animation scenes, misconception bank trap reused verbatim: A flat line on a velocity-time graph means the object has stopped., guarded by tests/gold-phys-kinematics-pack.test.js (issue #1027).

- Secondary Biology cells lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Biology cells
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-science-cells materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  bio-cells-secondary-manifest header (slug
  `bio-cells-secondary-science`, level secondary, subject
  science, topic `bio-cells`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-seven packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1057).

- Secondary Biology ecology lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Biology ecology
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-science-bio-ecology materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  bio-ecology-secondary-manifest header (slug
  `bio-ecology-secondary-science`, level secondary, subject
  science, topic `bio-ecology`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all seventy packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1069).

- Secondary Biology reproduction lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Biology reproduction
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-science-bio-reproduction materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  bio-reproduction-secondary-manifest header (slug
  `bio-reproduction-secondary-science`, level secondary, subject
  science, topic `bio-reproduction`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-nine packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1065).

- Secondary Biology transport lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Biology transport
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-science-bio-transport materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  bio-transport-secondary-manifest header (slug
  `bio-transport-secondary-science`, level secondary, subject
  science, topic `bio-transport`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-eight packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1061).

- Secondary Chemistry acids, bases and salts lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Chemistry acids, bases and salts
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-science-chem-acids materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  chem-acids-secondary-manifest header (slug
  `chem-acids-secondary-science`, level secondary, subject
  science, topic `chem-acids`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-six packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1053).

- Secondary Chemistry bonding lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Chemistry bonding
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-science-chem-bonding materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  chem-bonding-secondary-manifest header (slug
  `chem-bonding-secondary-science`, level secondary, subject
  science, topic `chem-bonding`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-five packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1049).

- Secondary Chemistry atomic structure lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Chemistry atomic structure
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-science-chem-atomic materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  chem-atomic-secondary-manifest header (slug
  `chem-atomic-secondary-science`, level secondary, subject
  science, topic `chem-atomic`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-four packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1045).

- Secondary Physics electricity lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Physics electricity
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-science-electricity materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  phys-electricity-secondary-manifest header (slug
  `phys-electricity-secondary-science`, level secondary, subject
  science, topic `phys-electricity`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-three packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1041).

- Secondary Physics energy lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Physics energy
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-physics-energy materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  phys-energy-secondary-manifest header (slug
  `phys-energy-secondary-science`, level secondary, subject
  science, topic `phys-energy`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-two packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1037).

- Secondary Physics forces lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Physics forces
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-physics-forces materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  phys-forces-secondary-manifest header (slug
  `phys-forces-secondary-science`, level secondary, subject
  science, topic `phys-forces`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty-one packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1033).

- Secondary Physics kinematics lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary Physics kinematics
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-physics-kinematics materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  phys-kinematics-secondary-manifest header (slug
  `phys-kinematics-secondary-science`, level secondary, subject
  science, topic `phys-kinematics`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixty packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1029).

- Secondary E-Math probability lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary E-Math probability
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-e-probability materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  e-probability-secondary-manifest header (slug
  `e-probability-secondary-math`, level secondary, subject
  math, topic `e-probability`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-nine packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1025).

- Secondary E-Math e-probability gold lesson pack: five hand-authored gold samples for e-probability in samples/decks/secondary-e-probability.json, samples/worksheets/secondary-e-probability.json, samples/tickets/secondary-e-probability.json, samples/notes/secondary-e-probability.json and samples/scripts/secondary-e-probability.json, keyed to the secondary-e-probability animation scenes, misconception bank trap reused verbatim: After three heads, tails is due., guarded by tests/gold-e-probability-pack.test.js (issue #1023).

- Secondary E-Math statistics lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary E-Math statistics
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-e-statistics materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  e-statistics-secondary-manifest header (slug
  `e-statistics-secondary-math`, level secondary, subject
  math, topic `e-statistics`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-eight packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1021).

- Secondary E-Math mensuration lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary E-Math mensuration
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-e-mensuration materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  e-mensuration-secondary-manifest header (slug
  `e-mensuration-secondary-math`, level secondary, subject
  math, topic `e-mensuration`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-seven packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1017).

- Secondary E-Math geometry lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary E-Math geometry
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-e-geometry materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  e-geometry-secondary-manifest header (slug
  `e-geometry-secondary-math`, level secondary, subject
  math, topic `e-geometry`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-six packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1013).

- Secondary E-Math e-statistics gold lesson pack: five hand-authored gold samples for e-statistics in samples/decks/secondary-e-statistics.json, samples/worksheets/secondary-e-statistics.json, samples/tickets/secondary-e-statistics.json, samples/notes/secondary-e-statistics.json and samples/scripts/secondary-e-statistics.json, keyed to the secondary-e-statistics animation scenes, misconception bank trap reused verbatim: The mean always describes the typical score., guarded by tests/gold-e-statistics-pack.test.js (issue #1019).

- Secondary E-Math e-mensuration gold lesson pack: five hand-authored gold samples for e-mensuration in samples/decks/secondary-e-mensuration.json, samples/worksheets/secondary-e-mensuration.json, samples/tickets/secondary-e-mensuration.json, samples/notes/secondary-e-mensuration.json and samples/scripts/secondary-e-mensuration.json, keyed to the secondary-e-mensuration animation scenes, misconception bank trap reused verbatim: Doubling the radius doubles the area of a circle., guarded by tests/gold-e-mensuration-pack.test.js (issue #1015).

- Secondary E-Math e-geometry gold lesson pack: five hand-authored gold samples for e-geometry in samples/decks/secondary-e-geometry.json, samples/worksheets/secondary-e-geometry.json, samples/tickets/secondary-e-geometry.json, samples/notes/secondary-e-geometry.json and samples/scripts/secondary-e-geometry.json, keyed to the secondary-e-geometry animation scenes, misconception bank trap reused verbatim: Two shapes with the same area are congruent., guarded by tests/gold-e-geometry-pack.test.js (issue #1011).

- Secondary E-Math functions and graphs lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary E-Math functions and graphs
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-e-functions-graphs materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  e-functions-graphs-secondary-manifest header (slug
  `e-functions-graphs-secondary-math`, level secondary, subject
  math, topic `e-functions-graphs`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-five packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1009).

- Secondary E-Math e-functions-graphs gold lesson pack: five hand-authored gold samples for e-functions-graphs in samples/decks/secondary-e-functions-graphs.json, samples/worksheets/secondary-e-functions-graphs.json, samples/tickets/secondary-e-functions-graphs.json, samples/notes/secondary-e-functions-graphs.json and samples/scripts/secondary-e-functions-graphs.json, keyed to the secondary-e-functions-graphs animation scenes, misconception bank trap reused verbatim: The line with the bigger intercept is steeper., guarded by tests/gold-e-functions-graphs-pack.test.js (issue #1007).

- Secondary E-Math algebra lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary E-Math algebra
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-e-algebra materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  e-algebra-secondary-manifest header (slug
  `e-algebra-secondary-math`, level secondary, subject
  math, topic `e-algebra`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-four packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1005).

- Secondary E-Math e-algebra gold lesson pack: five hand-authored gold samples for e-algebra in samples/decks/secondary-e-algebra.json, samples/worksheets/secondary-e-algebra.json, samples/tickets/secondary-e-algebra.json, samples/notes/secondary-e-algebra.json and samples/scripts/secondary-e-algebra.json, keyed to the secondary-e-algebra animation scenes, misconception bank trap reused verbatim: (a + b)^2 = a^2 + b^2., guarded by tests/gold-e-algebra-pack.test.js (issue #1003).

- Secondary E-Math numbers lesson pack in the pack demo
  (`player/pack-demo.html`): the Secondary E-Math numbers
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-e-numbers materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  e-numbers-secondary-manifest header (slug
  `e-numbers-secondary-math`, level secondary, subject
  math, topic `e-numbers`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-three packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #1001).

- Secondary E-Math e-numbers gold lesson pack: five hand-authored gold samples for e-numbers in samples/decks/secondary-e-numbers.json, samples/worksheets/secondary-e-numbers.json, samples/tickets/secondary-e-numbers.json, samples/notes/secondary-e-numbers.json and samples/scripts/secondary-e-numbers.json, keyed to the secondary-e-numbers animation scenes, misconception bank trap reused verbatim: Adding powers: 2^3 + 2^4 = 2^7., guarded by tests/gold-e-numbers-pack.test.js (issue #999).

- Primary geography weather-climate lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary geography weather-climate
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-geog-weather-climate materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  weather-climate-primary-manifest header (slug
  `weather-climate-primary-geography`, level primary, subject
  geography, topic `weather-climate`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-two packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #997).

- Primary geography weather-climate gold lesson pack: five hand-authored gold samples for weather-climate in samples/decks/primary-geog-weather-climate.json, samples/worksheets/primary-geog-weather-climate.json, samples/tickets/primary-geog-weather-climate.json, samples/notes/primary-geog-weather-climate.json and samples/scripts/primary-geog-weather-climate.json, keyed to the primary-geog-weather-climate animation scenes, misconception bank trap reused verbatim: A cold day today means the climate is getting colder., guarded by tests/gold-weather-climate-pack.test.js (issue #995).

- Primary geography plate-tectonics gold lesson pack: five hand-authored gold samples for plate-tectonics in samples/decks/primary-geog-plate-tectonics.json, samples/worksheets/primary-geog-plate-tectonics.json, samples/tickets/primary-geog-plate-tectonics.json, samples/notes/primary-geog-plate-tectonics.json and samples/scripts/primary-geog-plate-tectonics.json, keyed to the primary-geog-plate-tectonics animation scenes, misconception bank trap reused verbatim: Plates lurch in sudden jolts, snapping into new positions., guarded by tests/gold-plate-tectonics-pack.test.js (issue #991).

- Primary geography plate-tectonics lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary geography plate-tectonics
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-geog-plate-tectonics materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  plate-tectonics-primary-manifest header (slug
  `plate-tectonics-primary-geography`, level primary, subject
  geography, topic `plate-tectonics`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty-one packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #993).

- Primary science adaptations lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary science adaptations
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-science-adaptations materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  adaptations-primary-manifest header (slug
  `adaptations-primary-science`, level primary, subject
  science, topic `adaptations`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifty packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #989).

- Primary science adaptations gold lesson pack: five hand-authored gold samples for adaptations in samples/decks/primary-science-adaptations.json, samples/worksheets/primary-science-adaptations.json, samples/tickets/primary-science-adaptations.json, samples/notes/primary-science-adaptations.json and samples/scripts/primary-science-adaptations.json, keyed to the primary-science-adaptations animation scenes, misconception bank trap reused verbatim: An animal can decide to grow a new feature when it needs one., guarded by tests/gold-adaptations-pack.test.js (issue #987).

- Primary science forces-magnets lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary science forces and magnets
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-science-forces-magnets materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  forces-magnets-primary-manifest header (slug
  `forces-magnets-primary-science`, level primary, subject
  science, topic `forces-magnets`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-nine packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #985).

- Primary science forces-magnets gold lesson pack: five hand-authored gold samples for forces-magnets in samples/decks/primary-science-forces-magnets.json, samples/worksheets/primary-science-forces-magnets.json, samples/tickets/primary-science-forces-magnets.json, samples/notes/primary-science-forces-magnets.json and samples/scripts/primary-science-forces-magnets.json, keyed to the primary-science-forces-magnets animation scenes, misconception bank trap reused verbatim: A magnet attracts every kind of metal., guarded by tests/gold-forces-magnets-pack.test.js (issue #983).

- Primary science photosynthesis lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary science photosynthesis
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-science-photosynthesis materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  photosynthesis-primary-manifest header (slug
  `photosynthesis-primary-science`, level primary, subject
  science, topic `photosynthesis`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-eight packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #981).

- Primary science photosynthesis gold lesson pack: five hand-authored gold samples for photosynthesis in samples/decks/primary-science-photosynthesis.json, samples/worksheets/primary-science-photosynthesis.json, samples/tickets/primary-science-photosynthesis.json, samples/notes/primary-science-photosynthesis.json and samples/scripts/primary-science-photosynthesis.json, keyed to the primary-science-photosynthesis-intro animation scenes, misconception bank trap reused verbatim: Only animals breathe; plants do not., guarded by tests/gold-photosynthesis-primary-pack.test.js (issue #979).

- Primary science energy forms lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary science energy forms
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-science-energy-forms materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  energy-forms-primary-manifest header (slug
  `energy-forms-primary-science`, level primary, subject
  science, topic `energy-forms`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-seven packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #977).

- Primary science energy-forms gold lesson pack: five hand-authored gold samples for energy-forms in samples/decks/primary-science-energy-forms.json, samples/worksheets/primary-science-energy-forms.json, samples/tickets/primary-science-energy-forms.json, samples/notes/primary-science-energy-forms.json and samples/scripts/primary-science-energy-forms.json, keyed to the primary-science-energy-forms animation scenes, misconception bank trap reused verbatim: Energy is used up, like fuel disappearing from a tank., guarded by tests/gold-energy-forms-pack.test.js (issue #975).

- Primary science life-cycles gold lesson pack: five hand-authored gold samples for life-cycles in samples/decks/primary-science-life-cycles.json, samples/worksheets/primary-science-life-cycles.json, samples/tickets/primary-science-life-cycles.json, samples/notes/primary-science-life-cycles.json and samples/scripts/primary-science-life-cycles.json, keyed to the primary-science-life-cycles animation scenes, misconception bank trap reused verbatim: The flower is the end of the life of the plant., guarded by tests/gold-life-cycles-pack.test.js (issue #971).

- Primary science life cycles lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary science life cycles
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-science-life-cycles materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  life-cycles-primary-manifest header (slug
  `life-cycles-primary-science`, level primary, subject
  science, topic `life-cycles`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-six packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #973).

- Primary science plant systems lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary science plant systems
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-science-plant-systems materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  plant-systems-primary-manifest header (slug
  `plant-systems-primary-science`, level primary, subject
  science, topic `plant-systems`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-five packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #969).

- Primary science plant-systems gold lesson pack: five hand-authored gold samples for plant-systems in samples/decks/primary-science-plant-systems.json, samples/worksheets/primary-science-plant-systems.json, samples/tickets/primary-science-plant-systems.json, samples/notes/primary-science-plant-systems.json and samples/scripts/primary-science-plant-systems.json, keyed to the primary-science-plant-systems animation scenes, misconception bank trap reused verbatim: Plants take food from the soil through their roots, like we eat food., guarded by tests/gold-plant-systems-pack.test.js (issue #967).

- Primary science human body systems lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary science human body systems
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-science-human-body-systems materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  human-body-systems-primary-manifest header (slug
  `human-body-systems-primary-science`, level primary, subject
  science, topic `human-body-systems`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-four packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #965).

- Primary science human-body-systems gold lesson pack: five hand-authored gold samples for human-body-systems in samples/decks/primary-science-human-body-systems.json, samples/worksheets/primary-science-human-body-systems.json, samples/tickets/primary-science-human-body-systems.json, samples/notes/primary-science-human-body-systems.json and samples/scripts/primary-science-human-body-systems.json, keyed to the primary-science-human-body-systems animation scenes, misconception bank trap reused verbatim: The heart uses up the blood it pumps, so the body must keep making fresh blood., guarded by tests/gold-human-body-systems-pack.test.js (issue #963).

- Primary mathematics model method lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics model method
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-model-method materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  model-method-primary-manifest header (slug
  `model-method-primary-math`, level primary, subject
  math, topic `model-method`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-three packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #961).

- Primary mathematics model-method gold lesson pack: five hand-authored gold samples for model-method in samples/decks/primary-math-model-method.json, samples/worksheets/primary-math-model-method.json, samples/tickets/primary-math-model-method.json, samples/notes/primary-math-model-method.json and samples/scripts/primary-math-model-method.json, keyed to the primary-math-model-method animation scenes, misconception bank trap reused verbatim: Drawing unit boxes in any lengths, guessing the sizes., guarded by tests/gold-model-method-pack.test.js (issue #959).

- Primary mathematics data graphs lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics data graphs
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-data-graphs materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  data-graphs-primary-manifest header (slug
  `data-graphs-primary-math`, level primary, subject
  math, topic `data-graphs`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-two packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #957).

- Primary mathematics data-graphs gold lesson pack: five hand-authored gold samples for data-graphs in samples/decks/primary-math-data-graphs.json, samples/worksheets/primary-math-data-graphs.json, samples/tickets/primary-math-data-graphs.json, samples/notes/primary-math-data-graphs.json and samples/scripts/primary-math-data-graphs.json, keyed to the primary-math-data-graphs animation scenes, misconception bank trap reused verbatim: A steeper line always means a bigger increase., guarded by tests/gold-data-graphs-pack.test.js (issue #955).

- Primary mathematics volume lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics volume
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-volume materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  volume-primary-manifest header (slug
  `volume-primary-math`, level primary, subject
  math, topic `volume`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty-one packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #953).

- Primary mathematics volume gold lesson pack: five hand-authored gold samples for volume in samples/decks/primary-math-volume.json, samples/worksheets/primary-math-volume.json, samples/tickets/primary-math-volume.json, samples/notes/primary-math-volume.json and samples/scripts/primary-math-volume.json, keyed to the primary-math-volume animation scenes, misconception bank trap reused verbatim: The taller container holds more., guarded by tests/gold-volume-pack.test.js (issue #951).

- Primary mathematics area and perimeter lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics area and perimeter
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-area-perimeter materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  area-perimeter-primary-manifest header (slug
  `area-perimeter-primary-math`, level primary, subject
  math, topic `area-perimeter`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all forty packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #949).

- Primary mathematics area and perimeter gold lesson pack: five hand-authored gold
  samples for area-perimeter in
  samples/decks/primary-math-area-perimeter.json,
  samples/worksheets/primary-math-area-perimeter.json,
  samples/tickets/primary-math-area-perimeter.json,
  samples/notes/primary-math-area-perimeter.json and
  samples/scripts/primary-math-area-perimeter.json,
  keyed to the primary-math-area-perimeter animation scenes,
  misconception bank trap reused verbatim: The area of the L-shape is the length times the width of its bounding box., guarded by
  tests/gold-area-perimeter-pack.test.js
  (issue #947).

- Primary mathematics geometry (angles) lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics geometry (angles)
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-geometry-angles materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  geometry-angles-primary-manifest header (slug
  `geometry-angles-primary-math`, level primary, subject
  math, topic `geometry-angles`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-nine packs' print
  stages, guarded by tests/pack-demo.test.js
  (issue #945).

- Primary mathematics geometry (angles) gold lesson pack: five hand-authored gold
  samples for geometry (angles) in
  samples/decks/primary-math-geometry-angles.json,
  samples/worksheets/primary-math-geometry-angles.json,
  samples/tickets/primary-math-geometry-angles.json,
  samples/notes/primary-math-geometry-angles.json and
  samples/scripts/primary-math-geometry-angles.json,
  keyed to the primary-math-geometry-angles animation scenes and built around
  the misconception bank trap reused verbatim: The angle with longer arms is bigger., guarded by
  tests/gold-geometry-angles-pack.test.js
  (issue #943).

- Primary mathematics algebra (intro) gold lesson pack: five hand-authored gold
  samples for algebra (intro) in
  samples/decks/primary-math-algebra-intro.json,
  samples/worksheets/primary-math-algebra-intro.json,
  samples/tickets/primary-math-algebra-intro.json,
  samples/notes/primary-math-algebra-intro.json and
  samples/scripts/primary-math-algebra-intro.json,
  keyed to the primary-math-algebra-intro animation scenes and built around
  the misconception bank trap reused verbatim: Treating x as a label for things, so 3x + 2x cannot be combined., guarded by
  tests/gold-algebra-intro-pack.test.js
  (issue #939).

- Primary mathematics rate and speed gold lesson pack: five hand-authored gold
  samples for rate and speed in
  samples/decks/primary-math-rate-speed.json,
  samples/worksheets/primary-math-rate-speed.json,
  samples/tickets/primary-math-rate-speed.json,
  samples/notes/primary-math-rate-speed.json and
  samples/scripts/primary-math-rate-speed.json,
  keyed to the primary-math-rate-speed animation scenes and built around
  the misconception bank trap reused verbatim: 60 km/h means the bus has travelled 60 km., guarded by
  tests/gold-rate-speed-pack.test.js
  (issue #935).

- Primary mathematics algebra (intro) lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics algebra (intro)
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-algebra-intro materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  algebra-intro-primary-manifest header (slug
  `algebra-intro-primary-math`, level primary, subject
  math, topic `algebra-intro`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-eight packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #941).

- Primary mathematics rate and speed lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics rate and speed
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-rate-speed materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  rate-speed-primary-manifest header (slug
  `rate-speed-primary-math`, level primary, subject
  math, topic `rate-speed`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-seven packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #937).

- Primary mathematics ratio lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics ratio
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-ratio materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  ratio-primary-manifest header (slug
  `ratio-primary-math`, level primary, subject
  math, topic `ratio`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-six packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #933).

- Primary mathematics ratio gold lesson pack: five hand-authored gold
  samples for ratio in
  samples/decks/primary-math-ratio.json,
  samples/worksheets/primary-math-ratio.json,
  samples/tickets/primary-math-ratio.json,
  samples/notes/primary-math-ratio.json and
  samples/scripts/primary-math-ratio.json,
  keyed to the primary-math-ratio-sharing animation scenes and built around
  the misconception bank trap reused verbatim: A ratio of 3:2 means 3/2 of the whole., guarded by
  tests/gold-ratio-pack.test.js
  (issue #931).

- Primary mathematics percentage lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics percentage
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-percentage materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  percentage-primary-manifest header (slug
  `percentage-primary-math`, level primary, subject
  math, topic `percentage`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-five packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #929).

- Primary mathematics percentage gold lesson pack: five hand-authored gold
  samples for percentage in
  samples/decks/primary-math-percentage.json,
  samples/worksheets/primary-math-percentage.json,
  samples/tickets/primary-math-percentage.json,
  samples/notes/primary-math-percentage.json and
  samples/scripts/primary-math-percentage.json,
  keyed to the primary-math-percentage-of-quantity animation scenes and built around
  the misconception bank trap reused verbatim: 25% of 60 is just 25., guarded by
  tests/gold-percentage-pack.test.js
  (issue #927).

- Primary mathematics decimals lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics decimals
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-decimals materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  decimals-primary-manifest header (slug
  `decimals-primary-math`, level primary, subject
  math, topic `decimals`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-four packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #925).

- Primary mathematics decimals gold lesson pack: five hand-authored gold
  samples for decimals in
  samples/decks/primary-math-decimals.json,
  samples/worksheets/primary-math-decimals.json,
  samples/tickets/primary-math-decimals.json,
  samples/notes/primary-math-decimals.json and
  samples/scripts/primary-math-decimals.json,
  keyed to the primary-math-decimals-place-value animation scenes and built around
  the misconception bank trap reused verbatim: Comparing decimals by digit count: 0.25 looks bigger than 0.4 because 25 > 4., guarded by
  tests/gold-decimals-pack.test.js
  (issue #923).

- Primary mathematics whole numbers lesson pack in the pack demo
  (`player/pack-demo.html`): the Primary mathematics whole numbers
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six primary-math-whole-numbers materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  whole-numbers-primary-manifest header (slug
  `whole-numbers-primary-math`, level primary, subject
  math, topic `whole-numbers`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-three packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #921).

- Primary mathematics whole numbers gold lesson pack: five hand-authored gold
  samples for whole-numbers in
  samples/decks/primary-math-whole-numbers.json,
  samples/worksheets/primary-math-whole-numbers.json,
  samples/tickets/primary-math-whole-numbers.json,
  samples/notes/primary-math-whole-numbers.json and
  samples/scripts/primary-math-whole-numbers.json,
  keyed to the primary-math-whole-numbers animation scenes and built around
  the misconception bank trap reused verbatim: Reading 5 0 6 7
  as 567, skipping the zero., guarded by
  tests/gold-whole-numbers-pack.test.js
  (issue #919).

- JC H2 ecology lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 ecology
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-ecology materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  ecology-jc-manifest header (slug
  `h2-ecology-jc-science`, level jc, subject
  science, topic `h2-ecology`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-two packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #917).

- JC H2 ecology gold lesson pack: five hand-authored gold
  samples for h2-ecology in
  samples/decks/jc-h2-ecology.json,
  samples/worksheets/jc-h2-ecology.json,
  samples/tickets/jc-h2-ecology.json,
  samples/notes/jc-h2-ecology.json and
  samples/scripts/jc-h2-ecology.json,
  keyed to the jc-h2-ecology animation scenes and built around
  the misconception bank trap reused verbatim: Energy is
  recycled through the ecosystem., guarded by
  tests/gold-ecology-jc-pack.test.js
  (issue #915).

- JC H2 energetics gold lesson pack: five hand-authored gold
  samples for h2-energetics in
  samples/decks/jc-h2-energetics.json,
  samples/worksheets/jc-h2-energetics.json,
  samples/tickets/jc-h2-energetics.json,
  samples/notes/jc-h2-energetics.json and
  samples/scripts/jc-h2-energetics.json,
  keyed to the jc-h2-energetics animation scenes and built around
  the misconception bank trap reused verbatim: Plants only
  respire at night., guarded by
  tests/gold-energetics-jc-pack.test.js
  (issue #911).

- JC H2 energetics lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 energetics
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-energetics materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  energetics-jc-manifest header (slug
  `h2-energetics-jc-science`, level jc, subject
  science, topic `h2-energetics`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty-one packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #913).

- JC H2 genetics lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 genetics
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-genetics materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  genetics-jc-manifest header (slug
  `h2-genetics-jc-science`, level jc, subject
  science, topic `h2-genetics`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirty packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #909).

- JC H2 genetics gold lesson pack: five hand-authored gold
  samples for h2-genetics in
  samples/decks/jc-h2-genetics.json,
  samples/worksheets/jc-h2-genetics.json,
  samples/tickets/jc-h2-genetics.json,
  samples/notes/jc-h2-genetics.json and
  samples/scripts/jc-h2-genetics.json,
  keyed to the jc-h2-genetics animation scenes and built around
  the misconception bank trap reused verbatim: Every mutation
  harms the organism., guarded by
  tests/gold-genetics-jc-pack.test.js
  (issue #907).

- JC H2 cell biology lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 cell biology
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-cell-bio materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  cell-bio-jc-manifest header (slug
  `h2-cell-bio-jc-science`, level jc, subject
  science, topic `h2-cell-bio`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-nine packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #905).

- JC H2 cell biology gold lesson pack: five hand-authored gold
  samples for h2-cell-bio in
  samples/decks/jc-h2-cell-bio.json,
  samples/worksheets/jc-h2-cell-bio.json,
  samples/tickets/jc-h2-cell-bio.json,
  samples/notes/jc-h2-cell-bio.json and
  samples/scripts/jc-h2-cell-bio.json,
  keyed to the jc-h2-cell-bio animation scenes and built around
  the misconception bank trap reused verbatim: Plant cells
  have no mitochondria., guarded by
  tests/gold-cell-bio-jc-pack.test.js
  (issue #903).

- JC H2 organic gold lesson pack: five hand-authored gold
  samples for h2-organic in
  samples/decks/jc-h2-organic.json,
  samples/worksheets/jc-h2-organic.json,
  samples/tickets/jc-h2-organic.json,
  samples/notes/jc-h2-organic.json and
  samples/scripts/jc-h2-organic.json,
  keyed to the jc-h2-organic animation scenes and built around
  the misconception bank trap reused verbatim: Curly arrows
  point from the electron-poor atom toward the electron-rich
  one., guarded by
  tests/gold-organic-jc-pack.test.js
  (issue #899).

- JC H2 organic chemistry lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 organic chemistry
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-organic materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  organic-jc-manifest header (slug
  `h2-organic-jc-science`, level jc, subject
  science, topic `h2-organic`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-eight packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #901).

- JC H2 inorganic chemistry lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 inorganic chemistry
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-inorganic materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  inorganic-jc-manifest header (slug
  `h2-inorganic-jc-science`, level jc, subject
  science, topic `h2-inorganic`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-seven packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #897).

- JC H2 inorganic gold lesson pack: five hand-authored gold
  samples for h2-inorganic in
  samples/decks/jc-h2-inorganic.json,
  samples/worksheets/jc-h2-inorganic.json,
  samples/tickets/jc-h2-inorganic.json,
  samples/notes/jc-h2-inorganic.json and
  samples/scripts/jc-h2-inorganic.json,
  keyed to the jc-h2-inorganic animation scenes and built around
  the misconception bank trap reused verbatim: Zinc is a
  transition metal because it sits in the d-block., guarded by
  tests/gold-inorganic-jc-pack.test.js
  (issue #895).

- JC H2 physical chemistry lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 physical chemistry
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-physical materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  physical-jc-manifest header (slug
  `h2-physical-jc-science`, level jc, subject
  science, topic `h2-physical`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-six packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #893).

- JC H2 physical gold lesson pack: five hand-authored gold
  samples for h2-physical in
  samples/decks|worksheets|tickets|notes|scripts/jc-h2-physical.json,
  keyed to the jc-h2-physical animation scenes and built around
  the misconception bank trap reused verbatim: a catalyst
  pushes the equilibrium toward the products, guarded by
  tests/gold-physical-jc-pack.test.js
  (issue #891).

- JC H2 quantum lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 quantum
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-quantum materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  quantum-jc-manifest header (slug
  `h2-quantum-jc-science`, level jc, subject
  science, topic `h2-quantum`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-five packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #889).

- JC H2 quantum gold lesson pack: five hand-authored gold
  samples for h2-quantum in
  samples/decks|worksheets|tickets|notes|scripts/jc-h2-quantum.json,
  keyed to the jc-h2-quantum animation scenes and built around
  the misconception bank trap reused verbatim: brighter light
  ejects faster electrons, guarded by
  tests/gold-quantum-jc-pack.test.js
  (issue #887).

- JC H2 electromagnetism lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 electromagnetism
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-em materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  em-jc-manifest header (slug
  `h2-em-jc-science`, level jc, subject
  science, topic `h2-em`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-four packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #885).

- JC H2 electromagnetism gold lesson pack: five hand-authored gold
  samples for h2-em in
  samples/decks|worksheets|tickets|notes|scripts/jc-h2-em.json,
  keyed to the jc-h2-em animation scenes and built around
  the misconception bank trap reused verbatim: an emf flows
  as long as the magnet sits inside the coil, guarded by
  tests/gold-em-jc-pack.test.js with the full suite at 1884 tests
  (issue #883).

- JC H2 mechanics lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 mechanics
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-mechanics materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  mechanics-jc-manifest header (slug
  `h2-mechanics-jc-science`, level jc, subject
  science, topic `h2-mechanics`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-three packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #881).

- JC H2 mechanics gold lesson pack: five hand-authored gold
  samples for h2-mechanics in
  samples/decks|worksheets|tickets|notes|scripts/jc-h2-mechanics.json,
  keyed to the jc-h2-mechanics animation scenes and built around
  the misconception that a centrifugal force flings you outward
  in a sharp turn
  (issue #879).

- JC H2 statistics lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 statistics
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-statistics materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  statistics-jc-manifest header (slug
  `h2-statistics-jc-math`, level jc, subject
  math, topic `h2-statistics`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-two packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #877).

- JC H2 statistics gold lesson pack: five hand-authored gold
  samples for h2-statistics in
  samples/decks|worksheets|tickets|notes|scripts/jc-h2-statistics.json,
  keyed to the jc-h2-statistics animation scenes and built around
  the misconception that a p-value of 0.03 means there is a 3%
  chance the null hypothesis is true
  (issue #875).

- JC H2 probability lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 probability
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-probability materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  probability-jc-manifest header (slug
  `h2-probability-jc-math`, level jc, subject
  math, topic `h2-probability`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty-one packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #873).

- JC H2 probability gold lesson pack: five hand-authored gold
  samples for h2-probability in
  samples/decks|worksheets|tickets|notes|scripts/jc-h2-probability.json,
  keyed to the jc-h2-probability animation scenes and built around
  the misconception that after five heads in a row, tails is due
  (issue #871).

- JC H2 integration lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 integration
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-integration materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  integration-jc-manifest header (slug
  `h2-integration-jc-math`, level jc, subject
  math, topic `h2-integration`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twenty packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #869).

- JC H2 integration gold lesson pack: five hand-authored gold
  samples for h2-integration in
  samples/decks|worksheets|tickets|notes|scripts/jc-h2-integration.json,
  keyed to the jc-h2-integration animation scenes and built around
  the misconception that a definite integral still needs the +C in
  the answer (issue #867).

- JC H2 differentiation gold lesson pack: five hand-authored gold
  samples for h2-differentiation in
  samples/decks|worksheets|tickets|notes|scripts/jc-h2-differentiation.json,
  keyed to the jc-h2-differentiation animation scenes and built
  around the misconception that dy/dx is a fraction whose d symbols
  cancel (issue #863).

- JC H2 differentiation lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 differentiation
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-differentiation materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  differentiation-jc-manifest header (slug
  `h2-differentiation-jc-math`, level jc, subject
  math, topic `h2-differentiation`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all nineteen packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #865).

- JC H2 sequences and series lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 sequences and series
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-sequences materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  sequences-manifest header (slug
  `h2-sequences-jc-math`, level jc, subject
  math, topic `h2-sequences`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all eighteen packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #860).

- Gold lesson pack for a JC topic (`samples/decks/jc-h2-sequences.json`,
  `samples/worksheets/jc-h2-sequences.json`,
  `samples/tickets/jc-h2-sequences.json`,
  `samples/notes/jc-h2-sequences.json`, and
  `samples/scripts/jc-h2-sequences.json`): hand-authored
  JC H2 sequences and series gold samples for all five materials -
  slide deck, worksheet, exit ticket, student notes, and teacher
  script - mirroring the vectors golds, keyed to the sequences
  animation scenes s1-s5 and the bank `h2-sequences` primary
  formula-slip misconception
  (u_10 needs ten jumps of d, so u_n = u_1 + n*d.),
  guarded by a dedicated test file `tests/gold-sequences-pack.test.js` (issue #858).

- Gold lesson pack for a JC topic (`samples/decks/jc-h2-functions-graphs.json`,
  `samples/worksheets/jc-h2-functions-graphs.json`,
  `samples/tickets/jc-h2-functions-graphs.json`,
  `samples/notes/jc-h2-functions-graphs.json`, and
  `samples/scripts/jc-h2-functions-graphs.json`): hand-authored
  JC H2 functions and graphs gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the vectors golds, keyed to the functions and
  graphs animation scenes s1-s4 and the bank `h2-functions-graphs` misconception
  (f(x + 3) shifts the graph 3 units to the right.),
  guarded by a dedicated test file `tests/gold-functions-graphs-pack.test.js` (issue #854).

- JC H2 functions and graphs lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 functions and graphs
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-functions-graphs materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  functions-graphs-manifest header (slug
  `h2-functions-graphs-jc-math`, level jc, subject
  math, topic `h2-functions-graphs`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all seventeen packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #856).

- JC H2 vectors lesson pack in the pack demo
  (`player/pack-demo.html`): the JC H2 vectors
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six jc-h2-vectors materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  vectors-manifest header (slug
  `h2-vectors-jc-math`, level jc, subject
  math, topic `h2-vectors`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all sixteen packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #852).

- Gold lesson pack for a JC topic (`samples/decks/jc-h2-vectors.json`,
  `samples/worksheets/jc-h2-vectors.json`,
  `samples/tickets/jc-h2-vectors.json`,
  `samples/notes/jc-h2-vectors.json`, and
  `samples/scripts/jc-h2-vectors.json`): hand-authored
  JC H2 vectors gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the complex numbers golds, keyed to the vectors
  animation scenes s1-s5 and the bank `h2-vectors` misconception
  (Moving a vector to a new start point changes it.),
  guarded by a dedicated test file `tests/gold-vectors-pack.test.js` (issue #850).

- Secondary A-Math trigonometry lesson pack in the pack demo
  (`player/pack-demo.html`): the secondary A-Math trigonometry
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-a-trigonometry materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  trigonometry-a-manifest header (slug
  `a-trigonometry-secondary-math`, level secondary, subject
  math, topic `a-trigonometry`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fifteen packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #848).

- Gold lesson pack for a secondary A-Math topic (`samples/decks/secondary-a-trigonometry.json`,
  `samples/worksheets/secondary-a-trigonometry.json`,
  `samples/tickets/secondary-a-trigonometry.json`,
  `samples/notes/secondary-a-trigonometry.json`, and
  `samples/scripts/secondary-a-trigonometry.json`): hand-authored
  secondary A-Math further trigonometry gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the quadratic functions golds, keyed to the trigonometry
  animation scenes s1-s4 and the bank `a-trigonometry` misconception
  (cos(A + B) = cos A + cos B.),
  guarded by a dedicated test file `tests/gold-trigonometry-a-pack.test.js` (issue #846).

- Secondary A-Math quadratic functions lesson pack in the pack demo
  (`player/pack-demo.html`): the secondary A-Math quadratic functions
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-a-quadratic-functions materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  quadratic-manifest header (slug
  `a-quadratic-functions-secondary-math`, level secondary, subject
  math, topic `a-quadratic-functions`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all fourteen packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #844).

- Gold lesson pack for a secondary A-Math topic (`samples/decks/secondary-a-quadratic-functions.json`,
  `samples/worksheets/secondary-a-quadratic-functions.json`,
  `samples/tickets/secondary-a-quadratic-functions.json`,
  `samples/notes/secondary-a-quadratic-functions.json`, and
  `samples/scripts/secondary-a-quadratic-functions.json`): hand-authored
  secondary A-Math quadratic functions gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the kinematics golds, keyed to the quadratic functions
  animation scenes s1-s4 and the bank `a-quadratic-functions` misconception
  (A negative discriminant means the equation has no solution.),
  guarded by a dedicated test file (issue #842).

- Secondary A-Math kinematics lesson pack in the pack demo
  (`player/pack-demo.html`): the secondary A-Math kinematics
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-a-kinematics materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  kinematics-manifest header (slug
  `a-kinematics-secondary-math`, level secondary, subject
  math, topic `a-kinematics`), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all thirteen packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #840).

- Gold lesson pack for a secondary A-Math topic (`samples/decks/secondary-a-kinematics.json`,
  `samples/worksheets/secondary-a-kinematics.json`,
  `samples/tickets/secondary-a-kinematics.json`,
  `samples/notes/secondary-a-kinematics.json`, and
  `samples/scripts/secondary-a-kinematics.json`): hand-authored
  secondary A-Math kinematics gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the binomial golds, keyed to the kinematics
  animation scenes s1-s4 and the bank `a-kinematics` misconception
  (A straight s-t graph means constant acceleration.),
  guarded by a dedicated test file (issue #838).

- Secondary A-Math binomial theorem lesson pack in the pack demo
  (`player/pack-demo.html`): the secondary A-Math binomial theorem
  gold lesson pack now appears on the same demo page as the other packs,
  presenting all six secondary-a-binomial materials (animation,
  slides, worksheet, exit ticket, student notes, and teacher
  script) under its own
  binomial-manifest header (slug
  `a-binomial-secondary-math`, level secondary, subject
  math), stacked animation, slides, and printables sections, all
  six materials validated before render for that pack, and
  the shared teacher-keys toggle covering all twelve packs' print
  stages, guarded by slice-scoped pack-demo tests (issue #836).

- Gold lesson pack for a secondary A-Math topic (`samples/decks/secondary-a-binomial.json`,
  `samples/worksheets/secondary-a-binomial.json`,
  `samples/tickets/secondary-a-binomial.json`,
  `samples/notes/secondary-a-binomial.json`, and
  `samples/scripts/secondary-a-binomial.json`): hand-authored
  secondary A-Math binomial theorem gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the integration golds, keyed to the binomial
  animation scenes s1-s4 and the bank `a-binomial` misconception
  ((a + b)^2 = a^2 + b^2.),
  guarded by a dedicated test file (issue #834).

- Gold lesson pack for a secondary A-Math topic (`samples/decks/secondary-a-integration.json`,
  `samples/worksheets/secondary-a-integration.json`,
  `samples/tickets/secondary-a-integration.json`,
  `samples/notes/secondary-a-integration.json`, and
  `samples/scripts/secondary-a-integration.json`): hand-authored
  secondary A-Math integration gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the differentiation golds, keyed to the integration
  animation scenes s1-s4 and the bank `a-integration` misconception
  (The integral of 2x is x^2.),
  guarded by a dedicated test file (issue #830).

- Secondary A-Math integration lesson pack in the pack demo
  (`player/pack-demo.html`): the secondary A-Math integration
  gold pack now appears on the same demo page as the other packs,
  with its own manifest header (slug
  `a-integration-secondary-math`, level secondary, subject
  math), stacked animation, slides, and printables sections, all
  six materials validated before any rendering for that pack, and
  the shared teacher-keys toggle covering all eleven packs' print
  stages (issue #832).

- Secondary A-Math differentiation lesson pack in the pack demo
  (`player/pack-demo.html`): the secondary A-Math differentiation
  gold pack now appears on the same demo page as the other packs,
  with its own manifest header (slug
  `a-differentiation-secondary-math`, level secondary, subject
  math), stacked animation, slides, and printables sections, all
  six materials validated before any rendering for that pack, and
  the shared teacher-keys toggle covering all ten packs' print
  stages (issue #828).

- Gold lesson pack for a secondary A-Math topic (`samples/decks/secondary-a-differentiation.json`,
  `samples/worksheets/secondary-a-differentiation.json`,
  `samples/tickets/secondary-a-differentiation.json`,
  `samples/notes/secondary-a-differentiation.json`, and
  `samples/scripts/secondary-a-differentiation.json`): hand-authored
  secondary A-Math differentiation gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the complex golds, keyed to the differentiation
  animation scenes s1-s5 and the bank `a-differentiation` misconception
  (dy/dx = 0 means a maximum or minimum.),
  guarded by a dedicated test file (issue #824).

- Secondary-chemistry chem-mole lesson pack in the pack demo (`player/pack-demo.html`): the
  secondary science chem-mole gold pack now appears on the same
  demo page as the water-cycle, fractions, waves, complex, trigonometry, thermal, photosynthesis and erosion packs, with its own
  manifest header (slug `chem-mole-secondary-science`, level
  secondary, subject science), stacked animation, slides, and
  printables sections, all six materials validated before any
  rendering for that pack, and the shared teacher-keys toggle
  covering all nine packs' print stages (issue #822).

- Gold lesson pack for a secondary-chemistry topic (`samples/decks/secondary-science-chem-mole.json`,
  `samples/worksheets/secondary-science-chem-mole.json`,
  `samples/tickets/secondary-science-chem-mole.json`,
  `samples/notes/secondary-science-chem-mole.json`, and
  `samples/scripts/secondary-science-chem-mole.json`): hand-authored
  secondary science mole-concept gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the erosion golds, keyed to the chem-mole
  animation scenes s1-s4 and the bank `chem-mole` misconception
  (One mole of anything weighs the same.),
  guarded by a dedicated test file (issue #820).

- Primary-geography erosion lesson pack in the pack demo (`player/pack-demo.html`): the
  primary geography erosion gold pack now appears on the same
  demo page as the water-cycle, fractions, waves, complex, trigonometry, thermal and photosynthesis packs, with its own
  manifest header (slug `erosion-primary-geography`, level
  primary, subject geography), stacked animation, slides, and
  printables sections, all six materials validated before any
  rendering for that pack, and the shared teacher-keys toggle
  covering all eight packs' print stages (issue #815).

- Gold lesson pack for a primary-geography topic (`samples/decks/primary-geog-erosion.json`,
  `samples/worksheets/primary-geog-erosion.json`,
  `samples/tickets/primary-geog-erosion.json`,
  `samples/notes/primary-geog-erosion.json`, and
  `samples/scripts/primary-geog-erosion.json`): hand-authored
  primary geography erosion gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the photosynthesis golds, keyed to the erosion
  animation scenes s1-s3 and the bank `erosion` misconception
  (Rocks crumble on their own, with nothing doing the wearing.),
  guarded by a dedicated test file (issue #811).

- Secondary photosynthesis lesson pack in the pack demo (`player/pack-demo.html`): the
  secondary science photosynthesis gold pack now appears on the same
  demo page as the water-cycle, fractions, waves, complex, trigonometry and thermal packs, with its own
  manifest header (slug `bio-nutrition-secondary-science`, level
  secondary, subject science), stacked animation, slides, and
  printables sections, all six materials validated before any
  rendering for that pack, and the shared teacher-keys toggle
  covering all seven packs' print stages (issue #809).

- JC thermal physics lesson pack in the pack demo (`player/pack-demo.html`): the
  JC H2 thermal physics gold pack now appears on the same
  demo page as the water-cycle, fractions, waves, complex and trigonometry packs, with its own
  manifest header (slug `h2-thermal-jc-science`, level
  jc, subject science), stacked animation, slides, and
  printables sections, all six materials validated before any
  rendering for that pack, and the shared teacher-keys toggle
  covering all six packs' print stages (issue #805).

- Gold lesson pack for a secondary-science topic (`samples/decks/secondary-science-photosynthesis.json`,
  `samples/worksheets/secondary-science-photosynthesis.json`,
  `samples/tickets/secondary-science-photosynthesis.json`,
  `samples/notes/secondary-science-photosynthesis.json`, and
  `samples/scripts/secondary-science-photosynthesis.json`): hand-authored
  secondary science photosynthesis gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the thermal golds, keyed to the photosynthesis
  animation scenes s1-s5 and the bank `bio-nutrition` photosynthesis-facet
  misconception
  (The oxygen released in photosynthesis comes from carbon dioxide.),
  guarded by a dedicated test file (issue #807).

- Gold lesson pack for a JC science topic (`samples/decks/jc-h2-thermal.json`,
  `samples/worksheets/jc-h2-thermal.json`,
  `samples/tickets/jc-h2-thermal.json`,
  `samples/notes/jc-h2-thermal.json`, and
  `samples/scripts/jc-h2-thermal.json`): hand-authored
  JC H2 thermal physics gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the complex golds, keyed to the thermal
  animation scenes s1-s5 and the bank `h2-thermal` misconception
  (In a hotter gas every molecule moves faster.),
  guarded by a dedicated test file (issue #796).

- Secondary trigonometry lesson pack in the pack demo (`player/pack-demo.html`): the
  secondary E-Math trigonometry gold pack now appears on the same
  demo page as the water-cycle, fractions, waves and complex packs, with its own
  manifest header (slug `e-trigonometry-secondary-math`, level
  secondary, subject math), stacked animation, slides, and
  printables sections, all six materials validated before any
  rendering for that pack, and the shared teacher-keys toggle
  covering all five packs' print stages (issue #794).

- Gold lesson pack for a secondary-math topic (`samples/decks/secondary-e-trigonometry.json`,
  `samples/worksheets/secondary-e-trigonometry.json`,
  `samples/tickets/secondary-e-trigonometry.json`,
  `samples/notes/secondary-e-trigonometry.json`, and
  `samples/scripts/secondary-e-trigonometry.json`): hand-authored
  secondary E-Math trigonometry gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the waves golds, keyed to the trigonometry
  animation scenes s1-s4 and the bank `e-trigonometry` misconception
  (tan = adjacent / opposite.), guarded by a dedicated
  test file (issue #792).

- JC complex numbers lesson pack in the pack demo (`player/pack-demo.html`): the
  JC math complex-numbers gold pack now appears on the same
  demo page as the water-cycle, fractions and waves packs, with its own
  manifest header (slug `h2-complex-jc-math`, level
  jc, subject math), stacked animation, slides, and
  printables sections, all six materials validated before any
  rendering for that pack, and the shared teacher-keys toggle
  covering all four packs' print stages (issue #790).

- Gold lesson pack for a JC topic (`samples/decks/jc-h2-complex.json`,
  `samples/worksheets/jc-h2-complex.json`,
  `samples/tickets/jc-h2-complex.json`,
  `samples/notes/jc-h2-complex.json`, and
  `samples/scripts/jc-h2-complex.json`): hand-authored
  JC H2 complex numbers gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the waves golds, keyed to the complex
  animation scenes s1-s5 and the bank `h2-complex` misconception
  (If arg(z) = 100 degrees then arg(z^3) = 300 degrees.),
  guarded by a dedicated test file (issue #788).

- Waves lesson pack in the pack demo (`player/pack-demo.html`): the
  secondary science waves gold pack now appears on the same
  demo page as the water-cycle and fractions packs, with its own
  manifest header (slug `phys-waves-secondary-science`, level
  secondary, subject science), stacked animation, slides, and
  printables sections, all six materials validated before any
  rendering for that pack, and the shared teacher-keys toggle
  covering all three packs' print stages (issue #786).

- Gold lesson pack for a secondary topic (`samples/decks/secondary-physics-waves.json`,
  `samples/worksheets/secondary-physics-waves.json`,
  `samples/tickets/secondary-physics-waves.json`,
  `samples/notes/secondary-physics-waves.json`, and
  `samples/scripts/secondary-physics-waves.json`): hand-authored
  secondary science waves gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the fractions golds, keyed to the waves
  animation scenes s1-s4 and the bank `phys-waves` misconception
  (Sound travels faster than light.), guarded by a dedicated
  test file (issue #784).

- In-app lesson-pack rendering in the web app (`web/index.html`): pack
  mode now renders the generated slide deck in-page via the slide
  presenter and the worksheet, student notes, exit ticket, and teacher
  script in-page via the printable renderers, with the teacher answer
  keys hidden by default behind a Show/Hide teacher keys toggle; the
  JSON downloads remain (issue #782).

- Lesson-pack generation mode in the web app (`web/index.html`): a
  mode selector next to the Generate button (animation stays the
  default) runs the pipeline's `generateLessonPack` for the picked
  level / subject / topic with the per-material validators, mounts and
  plays the pack's animation, shows a pack manifest naming the slug,
  topic, level, subject, and all six material keys, and offers the
  slides, worksheet, notes, exit ticket, and script as
  `<slug>-<key>.json` downloads of the exact generated material
  objects (issue #780).

- Fractions lesson pack in the pack demo (`player/pack-demo.html`): the
  primary-math fractions-addition gold pack now appears on the same
  demo page as the water-cycle pack, with its own manifest header
  (slug `fractions-primary-math`, level primary, subject math),
  stacked animation, slides, and printables sections, all six
  materials validated before any rendering for that pack, and the
  shared teacher-keys toggle covering both packs' print stages
  (issue #778).

- Gold lesson pack for a second subject (`samples/decks/primary-math-fractions-addition.json`,
  `samples/worksheets/primary-math-fractions-addition.json`,
  `samples/tickets/primary-math-fractions-addition.json`,
  `samples/notes/primary-math-fractions-addition.json`, and
  `samples/scripts/primary-math-fractions-addition.json`): hand-authored
  primary-math fractions-addition gold samples for all five materials —
  slide deck, worksheet, exit ticket, student notes, and teacher
  script — mirroring the water-cycle golds, keyed to the fractions
  animation scenes s1-s4 and the bank `fractions` misconception
  (adding tops and bottoms: 1/2 + 1/4 = 2/6), guarded by a dedicated
  test file (issue #776).

- Lesson-pack web demo (`player/pack-demo.html`): one page showing a
  full lesson pack — all six gold materials for the water cycle
  (animation, slides, worksheet, notes, exit ticket, and script)
  rendered via the shipped player, slide presenter, and printable
  renderers under a pack manifest header naming the slug, level,
  subject, and six material keys, with all six materials validated
  before any rendering and teacher keys toggleable (issue #772).

- Syllabus-keyed lesson-pack API (`generator/syllabus.js`, subpath
  `@jjfwang/teachkit/syllabus`; `generateLessonPackForSyllabus` on
  `generator/pipeline.js`): the taxonomy is embedded in the generator as
  `SYLLABUS` (locked 1:1 against `SYLLABUS.md` and `web/syllabus.js` by
  test) with a `resolveSyllabusTopic` resolver accepting a bare topic
  slug or the composite `level/track/slug` form and throwing on
  unknown, malformed, or ambiguous ids; `generateLessonPackForSyllabus`
  resolves the id first (rejecting before any LLM call on failure),
  overlays any explicit options, and shares the pack cache with direct
  `generateLessonPack` calls using the resolved values (issue #770).

- Lesson-pack orchestration (`generator/pipeline.js`, subpaths
  `@jjfwang/teachkit/notes`, `@jjfwang/teachkit/script`, and
  `@jjfwang/teachkit/lesson-pack`; prompt builders via
  `@jjfwang/teachkit/notes-prompt` and `@jjfwang/teachkit/script-prompt`):
  `generateNotes` and `generateScript` join the pipeline as the notes
  and script siblings of `generateWorksheet` / `generateExitTicket`
  (shared unpack, `validateNotes` / `validateScript` repair discipline),
  and `generateLessonPack` runs one shared unpack and authors all six
  materials from it — animation, slides, worksheet, student notes, exit
  ticket, teacher script — resolving with a pack manifest (topic slug,
  level, subject, generator version, material keys) and an in-memory
  slug cache: repeat calls make no further LLM calls, `opts.force`
  regenerates, and `clearPackCache()` empties the cache (issue #768).

- Printable student-notes and teacher-script renderer (`player/printable.js`,
  subpath `@jjfwang/teachkit/printable`): `renderNotes` prints a notes
  spec (objectives, definitions as term/meaning pairs, mechanism steps
  as an ordered list, worked example, and the trap section) and
  `renderScript` prints a teacher script (a total-minutes line summed
  from the segments, then each segment with its minutes, say text, and
  cue, questions, and watch-for note only when present). Every render
  validates first via `validateNotes` / `validateScript` and throws on
  an invalid spec; all spec text is HTML-escaped. Ships with
  `pr-` styles in `player/printable.css`, declarations in
  `player/printable.d.ts`, and `player/printable-demo.html` rendering
  the water-cycle notes and script gold samples (issue #766).

- Student notes and teacher script prompt builders (`generator/build_notes_prompt.js`
  `buildNotesPrompts` and `generator/build_script_prompt.js`
  `buildScriptPrompts`, each with a hand-authored `.d.ts` sibling):
  slide-style builders that author student notes (definitions from the
  key vocabulary, one mechanism step per transition, the trap naming
  the misconception) and timed teacher scripts (segments whose minutes
  sum to 5-120, cues naming scene ids or materials, `watchFor` keyed
  to the misconception), each embedding a trimmed water-cycle
  exemplar. Gold samples ship at `samples/notes/primary-science-water-cycle.json`
  and `samples/scripts/primary-science-water-cycle.json` (issue #764).

- Student notes and teacher script spec contracts and validators
  (`validateNotes` and `validateScript` in `player/validate.js`, with
  declarations in `player/validate.d.ts`): SPEC.md gains "Student notes
  spec" and "Teacher script spec" sections pinning the notes shape
  (objectives, definitions, mechanism steps, worked example, trap) and
  the script shape (timed segments with optional cue, questions, and
  watchFor fields, total timing 5..120 minutes), both sharing the
  material-header conventions (issue #762).

- End-to-end worksheet and exit-ticket generation in the pipeline
  (`generator/pipeline.js`): `generateWorksheet` and `generateExitTicket`
  run the same unpack -> author -> repair stages as `generateSlides`,
  authoring via `buildWorksheetPrompts` / `buildExitTicketPrompts` and
  repairing against `validateWorksheet` / `validateExitTicket`
  (`deps.validateWorksheet` / `deps.validateExitTicket`, else
  `deps.validate`, else the built-in `player/validate.js` validators).
  The exports map gains four subpaths: `@jjfwang/teachkit/worksheet` and
  `@jjfwang/teachkit/exit-ticket` (the pipeline module under
  material-named subpaths) and `@jjfwang/teachkit/worksheet-prompt` and
  `@jjfwang/teachkit/exit-ticket-prompt` (the prompt builders);
  `@jjfwang/teachkit/pipeline` now also exposes `generateWorksheet` and
  `generateExitTicket` (issue #760).

- Printable worksheet and exit-ticket renderer (`player/printable.js`,
  subpath `@jjfwang/teachkit/printable`): `renderWorksheet` /
  `renderExitTicket` produce student sheets (prompts and choice texts
  only — teacher content is structurally absent, not flagged off) and
  `renderWorksheetAnswerKey` / `renderExitTicketAnswerKey` produce the
  teacher keys (correct answers, explanations, feedback, misconceptions).
  Every render validates first and throws on an invalid spec; all spec
  text is HTML-escaped. Ships with `player/printable.css` (teacher key
  starts a new printed page), a hand-authored `player/printable.d.ts`,
  and `player/printable-demo.html` rendering both gold samples
  (issue #758).

- Worksheet and exit-ticket prompt builders (`generator/build_worksheet_prompt.js`
  `buildWorksheetPrompts` and `generator/build_exit_ticket_prompt.js`
  `buildExitTicketPrompts`, each with a hand-authored `.d.ts` sibling):
  slide-style builders that author practice worksheets (misconception-built
  distractors, a per-question `explanation` answer key) and short formative
  exit tickets (exactly 3-5 questions, per-answer `feedback` keyed to the
  misconception), each embedding a trimmed water-cycle exemplar. Gold
  samples ship at `samples/worksheets/primary-science-water-cycle.json`
  and `samples/tickets/primary-science-water-cycle.json` (issue #756).


- End-to-end slide-deck generation in the pipeline (`generator/pipeline.js`):
  `generateSlides` runs the same unpack -> author -> repair stages as
  `generateAnimation`, but authors a teaching slide deck via
  `buildSlidePrompts` and repairs it against `validateSlides`
  (`deps.validateSlides`, else `deps.validate`, else the built-in
  `player/validate.js` validator). The exports map gains two subpaths:
  `@jjfwang/teachkit/slides` (the pipeline module under a slides-named
  subpath, exposing `generateAnimation` and `generateSlides`) and
  `@jjfwang/teachkit/slides-prompt` (`buildSlidePrompts` from
  `generator/build_slides_prompt.js`); `@jjfwang/teachkit/pipeline` now also
  exposes `generateSlides` (issue #747).

### Changed

- Package renamed `@jjfwang/animath` -> `@jjfwang/teachkit` and the
  repository URL moved to github.com/jjfwang/teachkit, following the repo
  rename (issue #749). The spec-format key `"animath": "0.1"` and the
  `Animath*` browser globals are unchanged. npm publish of the new name
  and deprecation of the old name happen at the next release cut.

### Documentation

- SPEC.md gains a Lesson pack spec section pinning the shipped
  `generateLessonPack` / `generateLessonPackForSyllabus` contract:
  pack and manifest shape, the deterministic slug derivation and
  version rule, shared-unpack consistency, failure semantics
  (`err.material` / `err.problems`), and the in-memory slug cache
  semantics (issue #774).

## [0.2.0-beta.1] - 2026-10-16

Second registry beta of the animath library (`@jjfwang/animath`), published
under the `beta` dist-tag. Ships the generation engine on top of the beta.0
library surface: the automatic unpack -> author -> repair pipeline with
holistic staging for cycles and systems, the completed 19-subpath exports
map, the narrowed player public API, and the subject-generic validator
(any non-empty subject string, no hard-coded subject set).

### Added

- Package test scripts: `npm test` and `npm run test:coverage` now wrap the documented test-gate commands (`node --test "tests/*.test.js"` and the same command with `--experimental-test-coverage`), so consumers no longer need to memorize the raw commands from CONTRIBUTING.md (issue #738).

- Package exports map gains the `@jjfwang/animath/audit-samples` require
  subpath (`auditSampleFile` / `auditAllSamples`, from
  `generator/tooling/audit-samples.js`): the module already shipped in the
  tarball with a hand-authored `.d.ts` sibling, and is now reachable by its
  subpath name (issue #726).

- Package exports map gains three require subpaths for the WebM-export
  modules — `@jjfwang/animath/export-frames`, `@jjfwang/animath/export-record`
  and `@jjfwang/animath/export-ui`: all three already shipped in the tarball
  and are documented in the README and SPEC.md, and are now reachable by their
  subpath names, each with a hand-authored `.d.ts` sibling (issue #722).

- CLI machinery split out of the library modules (issue #709): the geometry
  audit CLI entry (usage, `parseArgs`, `main`, the `require.main` guard) moves
  from `generator/audit.js` to `generator/tooling/audit-cli.js` — run it via
  `node generator/tooling/audit-cli.js`; the Node-only sample walkers
  `auditSampleFile`/`auditAllSamples` move from `generator/geometry.js` to
  `generator/tooling/audit-samples.js`. The library subpaths now export only
  programmatic APIs, with hand-authored `.d.ts` files for the two new tooling
  modules, and the exports map gains `@jjfwang/animath/audit-cli`.

- Package exports map gains two require subpaths — `@jjfwang/animath/pipeline`
  (the end-to-end generate pipeline, `generateAnimation`, issue #693) and
  `@jjfwang/animath/unpack` (the unpack layer, `unpackTopic`, issue #685):
  both modules already shipped in the tarball with hand-authored `.d.ts`
  siblings, and are now reachable by their documented subpath names
  (issue #701).

- Staging strategy in the generate pipeline: the unpacker classifies a
  topic's shape (sequence, cycle, or system) and the author prompt stages
  scenes accordingly — a cycle (e.g. the water cycle) is staged as ONE
  holistic scene showing the whole loop at once with animated flows, instead
  of one scene per transition. The validator now accepts 1..8 scenes
  (SPEC.md updated).

- Generator unpack layer (`generator/unpack.js`): a topic is unpacked into
  ordered state transitions before authoring, so the generated scenes follow
  the topic's actual mechanism instead of a free-form draft (issue #685).
- Taste transfer in the author prompt: a trimmed hand-authored water-cycle
  exemplar plus five quality gates (label placement in clear space, per-scene
  caption, explain fields on key parts, emphasize on the mechanism beat, the
  misconception wrong turn played out visually) — bringing generated specs up
  to the hand-authored quality bar (issue #691).
- End-to-end generate pipeline (`generator/pipeline.js`): runs the
  unpack -> author -> repair stages automatically — one entry point that takes
  a topic and returns a validated animation spec; the web UI is unchanged
  (issue #693).
- Per-transition misconception beats: misconception-bank entries can name the
  unpack transition where the wrong turn plays out (matched against transition
  names), so the wrong-turn beat lands on its own transition's scene instead
  of anywhere in the spec (issue #695).

- End-to-end add-a-subject checklist in CONTRIBUTING.md covering the SPEC.md
  subject enum, `player/validate.js` SUBJECTS, the SYLLABUS.md section, the
  web/syllabus.js track, the generator misconception-bank entries, and the
  hand-authored sample + `samples/index.json` registration (issue #669).
- Misconception bank gains Slice 6: geography (erosion, plate-tectonics,
  weather-climate, grounded in the samples' misconception beats) plus the
  documented per-subject slice pattern; geography specs now earn the full
  wrong-turn-marker rubric check instead of the skip (issue #668).

### Changed

- RELEASING.md no longer claims no release exists: it records the first
  release (`0.2.0-beta.0`, published 2026-10-11, tag `v0.2.0-beta.0`) as
  shipped, marks the README registry-install follow-up (Step 8) done, and
  documents the prerelease dist-tag wrinkle in the publish/verify steps
  (`npm publish --tag beta`; consumers track with
  `npm install @jjfwang/animath@beta`) (issue #740).
- Validator no longer hard-codes the admitted subject set: `validateSpec`
  now accepts any non-empty `subject` string (SPEC.md updated), so library
  consumers can generate animations for any school subject, not only
  math/science/geography. `SUBJECTS` remains exported as the syllabus-known
  list for gallery/coverage (issue #734).
- Package `engines.node` floor rises from Node 16 to Node 18, because the
  `llm-client` subpath uses the global `fetch` (Node 18+); Node 16 consumers
  of that subpath previously hit "fetch is not defined" (issue #735).
- README "Install as a library" leads with the live registry command
  (`npm install @jjfwang/animath`), notes the beta pin
  (`npm install @jjfwang/animath@beta`), and keeps the git source fallback in
  one sentence; pending "once published" language removed (issue #666).
- User-facing language made subject-neutral: the package.json description and
  the web/index.html title and tagline (issue #670).
- `player/validate.js` exports SUBJECTS as the single source of truth for the
  allowed subject set; `tests/specs.test.js` now requires every validator
  subject to have sample coverage across levels (issue #671).
- `generator/build_prompt.js` throws visibly on a missing subject instead of
  silently defaulting to 'math' (issue #669).
- Gallery subject filter options now derive from `player/validate.js` SUBJECTS
  (Geography selectable in the sample gallery; hardcoded Math/Science options
  retained as fallback) (issue #679).
- `generator/build_prompt.js` accepts `opts.transitions`: one generated scene
  per unpacked transition, listed as numbered lines in the user message;
  absent or empty transitions leave the output byte-identical (issue #687).
- `player.version` and the web embed's `version` now derive from the
  `package.json` version (single source of truth) via the new
  `node generator/tooling/regen-version.js`, locked by `tests/version.test.js`
  — both were hardcoded `0.1` while the package was at `0.2.0-beta.0`
  (issue #706). The `0.1` in `player/validate.js` is the animath spec format
  version and is intentionally unchanged.
- Player public API narrowed: `player/player.js` now exports exactly
  `mount`, `version`, and `internals` — the 19 former top-level helper
  exports remain reachable via `player.internals` and are marked internal
  in `player/player.d.ts`, so consumers should depend only on
  `mount`/`version` (issue #707).
- `generator/audit.js` no longer requires `fs` or `path` at module load
  and no longer touches `__dirname` at load time: the Node-only functions
  (`readJson`, `manifestFiles`, `loadTriageVerdicts`, and the CLI `run`
  path) lazy-require the builtins they need, the triage-verdicts default
  path is computed lazily inside `loadTriageVerdicts`, and a pure
  separator-tolerant `basenameOf` replaces `path.basename` in the pure
  helpers, so the module loads in browser bundles (issues #708, #718).
- Repair loop default cap raised from 2 to 3 passes, locked in with tests
  (issue #689).

### Fixed

- Generator author prompt hard rule 5 now lists all eight validator shape
  kinds, including `sector` with its descriptor fields (`cx`, `cy`, `r`,
  `startAngle`, `endAngle`) and the not-moveable note, so generated
  pie-chart specs can use first-class sector descriptors; the `PROMPTS.md`
  mirror was regenerated by the same change (issue #730).

## [0.2.0-beta.0] - 2026-10-12

First registry beta of the animath library (`@jjfwang/animath`), published
under the `beta` dist-tag. Ships everything on main since 0.1.0: the
subject-agnostic generator prompt, Geography as a first-class subject (3
mechanism-first samples, 72 samples / 70 syllabus slugs total), the
measure-rubric-bands tooling, the scrub-slider fix, and the completed
test-coverage programme (1015 tests, ~99.9% lines).

### Added

- README "Install as a library" documents the ESM consumption pattern
  (default-import interop for the CJS+UMD charts entry; named imports are not
  detected by Node's ESM loader). `tests/esm-charts.test.js` runs a real ESM
  script importing the charts entry to prove the documented pattern works.

## [0.1.0] - 2026-10-11

The initial library release: animath becomes an installable npm package
(`@jjfwang/animath`), installable via `npm install github:jjfwang/animath`
(registry publish pending).

### Added

- `package.json` with name, version, and a 12-entry exports map
  (`.`, `./build-prompt`, `./charts`, `./geometry`, `./rubric`, `./audit`,
  `./misconceptions`, `./llm-client`, `./player`, `./player-validate`,
  `./embed`, `./package.json`) plus a `files` list shipping `generator/`,
  `player/`, `web/embed.js`, `web/embed.d.ts`, `README.md`, `CHANGELOG.md`,
  `LICENSE`, `PROMPTS.md`, and `SPEC.md`.
- Hand-authored TypeScript type definitions (10 `.d.ts` siblings) covering
  every exports-map subpath, exposed through the top-level `types` field.
- README "Install as a library" section documenting the install routes and
  the Node `>=16` engine requirement.
