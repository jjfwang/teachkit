# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release PRs add entries under `Unreleased`, then move them into a new dated
version section when the release ships.

## [Unreleased]

### Added

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
