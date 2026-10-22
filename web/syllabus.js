/* animath syllabus data for the web picker. Mirrors SYLLABUS.md.
 * Tracks group topics for usability; each track carries its SPEC.md subject.
 */
window.ANIMATH_SYLLABUS = {
  levels: [
    {
      id: 'primary', label: 'Primary (PSLE)', tracks: [
        {
          id: 'p-math', label: 'Mathematics', subject: 'math', topics: [
            { slug: 'whole-numbers', label: 'Whole numbers' },
            { slug: 'fractions', label: 'Fractions' },
            { slug: 'decimals', label: 'Decimals' },
            { slug: 'percentage', label: 'Percentage' },
            { slug: 'ratio', label: 'Ratio' },
            { slug: 'rate-speed', label: 'Rate & speed' },
            { slug: 'algebra-intro', label: 'Algebra (intro)' },
            { slug: 'geometry-angles', label: 'Angles & shapes' },
            { slug: 'area-perimeter', label: 'Area & perimeter' },
            { slug: 'volume', label: 'Volume' },
            { slug: 'data-graphs', label: 'Data & graphs' },
            { slug: 'model-method', label: 'Bar model word problems' }
          ]
        },
        {
          id: 'p-sci', label: 'Science', subject: 'science', topics: [
            { slug: 'human-body-systems', label: 'Human body systems' },
            { slug: 'plant-systems', label: 'Plant parts & functions' },
            { slug: 'life-cycles', label: 'Life cycles' },
            { slug: 'water-cycle', label: 'Water cycle' },
            { slug: 'energy-forms', label: 'Forms of energy' },
            { slug: 'photosynthesis', label: 'Photosynthesis (intro)' },
            { slug: 'forces-magnets', label: 'Forces & magnets' },
            { slug: 'adaptations', label: 'Adaptations' }
          ]
        },
        {
          id: 'p-geog', label: 'Geography', subject: 'geography', topics: [
            { slug: 'erosion', label: 'Erosion' },
            { slug: 'plate-tectonics', label: 'Plate tectonics' },
            { slug: 'weather-climate', label: 'Weather & climate' }
          ]
        }
      ]
    },
    {
      id: 'secondary', label: 'Secondary (O/N-level)', tracks: [
        {
          id: 'e-math', label: 'E-Math', subject: 'math', topics: [
            { slug: 'e-numbers', label: 'Numbers' },
            { slug: 'e-algebra', label: 'Algebra' },
            { slug: 'e-functions-graphs', label: 'Functions & graphs' },
            { slug: 'e-geometry', label: 'Geometry' },
            { slug: 'e-trigonometry', label: 'Trigonometry' },
            { slug: 'e-mensuration', label: 'Mensuration' },
            { slug: 'e-statistics', label: 'Statistics' },
            { slug: 'e-probability', label: 'Probability' }
          ]
        },
        {
          id: 'a-math', label: 'A-Math', subject: 'math', topics: [
            { slug: 'a-quadratic-functions', label: 'Quadratic functions' },
            { slug: 'a-binomial', label: 'Binomial theorem' },
            { slug: 'a-trigonometry', label: 'Further trigonometry' },
            { slug: 'a-differentiation', label: 'Differentiation' },
            { slug: 'a-integration', label: 'Integration' },
            { slug: 'a-kinematics', label: 'Kinematics' }
          ]
        },
        {
          id: 'physics', label: 'Physics', subject: 'science', topics: [
            { slug: 'phys-kinematics', label: 'Kinematics' },
            { slug: 'phys-forces', label: 'Forces' },
            { slug: 'phys-energy', label: 'Energy, work & power' },
            { slug: 'phys-electricity', label: 'Electricity' },
            { slug: 'phys-waves', label: 'Waves' }
          ]
        },
        {
          id: 'chemistry', label: 'Chemistry', subject: 'science', topics: [
            { slug: 'chem-atomic', label: 'Atomic structure' },
            { slug: 'chem-bonding', label: 'Chemical bonding' },
            { slug: 'chem-acids', label: 'Acids, bases & salts' },
            { slug: 'chem-mole', label: 'Mole concept' }
          ]
        },
        {
          id: 'biology', label: 'Biology', subject: 'science', topics: [
            { slug: 'bio-cells', label: 'Cells' },
            { slug: 'bio-transport', label: 'Transport' },
            { slug: 'bio-nutrition', label: 'Nutrition' },
            { slug: 'bio-reproduction', label: 'Reproduction' },
            { slug: 'bio-ecology', label: 'Ecology' }
          ]
        },
        {
          id: 'geography', label: 'Geography', subject: 'geography', topics: [
            { slug: 'tectonics-subduction', label: 'Subduction' }
          ]
        },
        {
          id: 'economics', label: 'Economics', subject: 'economics', topics: [
            { slug: 'demand-supply-equilibrium', label: 'Demand & supply equilibrium' }
          ]
        },
        {
          id: 'computing', label: 'Computing', subject: 'computing', topics: [
            { slug: 'logic-gates', label: 'Logic gates' }
          ]
        },
        {
          id: 'electronics', label: 'Electronics', subject: 'electronics', topics: [
            { slug: 'sensor-divider', label: 'Sensor divider (LDR)' }
          ]
        },
        {
          id: 'design-technology', label: 'Design and Technology', subject: 'design-technology', topics: [
            { slug: 'vacuum-forming', label: 'Vacuum forming' }
          ]
        },
        {
          id: 'nutrition-food-science', label: 'Nutrition and Food Science', subject: 'nutrition-food-science', topics: [
            { slug: 'protein-denaturation', label: 'Protein denaturation' }
          ]
        },
        {
          id: 'principles-of-accounts', label: 'Principles of Accounts', subject: 'principles-of-accounts', topics: [
            { slug: 'double-entry', label: 'Double entry' }
          ]
        },
        {
          id: 'business-studies', label: 'Business Studies', subject: 'business-studies', topics: [
            { slug: 'break-even', label: 'Break-even' }
          ]
        },
        {
          id: 'exercise-sports-science', label: 'Exercise and Sports Science', subject: 'exercise-sports-science', topics: [
            { slug: 'energy-systems', label: 'Energy systems' }
          ]
        }
      ]
    },
    {
      id: 'jc', label: 'Junior College (H2)', tracks: [
        {
          id: 'h2-math', label: 'H2 Mathematics', subject: 'math', topics: [
            { slug: 'h2-functions-graphs', label: 'Functions & graphs' },
            { slug: 'h2-sequences', label: 'Sequences & series' },
            { slug: 'h2-vectors', label: 'Vectors' },
            { slug: 'h2-complex', label: 'Complex numbers' },
            { slug: 'h2-differentiation', label: 'Differentiation' },
            { slug: 'h2-integration', label: 'Integration' },
            { slug: 'h2-probability', label: 'Probability' },
            { slug: 'h2-statistics', label: 'Statistics' },
            { slug: 'maclaurin-series', label: 'Maclaurin series' }
          ]
        },
        {
          id: 'h2-physics', label: 'H2 Physics', subject: 'science', topics: [
            { slug: 'h2-mechanics', label: 'Mechanics' },
            { slug: 'h2-em', label: 'Electromagnetism' },
            { slug: 'h2-thermal', label: 'Thermal physics' },
            { slug: 'h2-quantum', label: 'Quantum physics' }
          ]
        },
        {
          id: 'h2-chemistry', label: 'H2 Chemistry', subject: 'science', topics: [
            { slug: 'h2-physical', label: 'Physical chemistry' },
            { slug: 'h2-inorganic', label: 'Inorganic chemistry' },
            { slug: 'h2-organic', label: 'Organic chemistry' }
          ]
        },
        {
          id: 'h2-biology', label: 'H2 Biology', subject: 'science', topics: [
            { slug: 'h2-cell-bio', label: 'Cell biology' },
            { slug: 'h2-genetics', label: 'Genetics' },
            { slug: 'h2-energetics', label: 'Energetics' },
            { slug: 'h2-ecology', label: 'Ecology' }
          ]
        },
        {
          id: 'h2-economics', label: 'H2 Economics', subject: 'economics', topics: [
            { slug: 'multiplier-process', label: 'Multiplier process' }
          ]
        },
        {
          id: 'further-mathematics', label: 'Further Mathematics', subject: 'math', topics: [
            { slug: 'logistic-growth', label: 'Logistic growth' }
          ]
        },
        {
          id: 'h2-geography', label: 'H2 Geography', subject: 'geography', topics: [
            { slug: 'drainage-basin', label: 'Drainage basin' }
          ]
        },
        {
          id: 'h2-computing', label: 'H2 Computing', subject: 'computing', topics: [
            { slug: 'recursion', label: 'Recursion' }
          ]
        },
        {
          id: 'h2-principles-of-accounts', label: 'H2 Principles of Accounting', subject: 'principles-of-accounts', topics: [
            { slug: 'absorption-marginal-costing', label: 'Absorption and marginal costing' }
          ]
        },
        {
          id: 'h2-management-of-business', label: 'H2 Management of Business', subject: 'management-of-business', topics: [
            { slug: 'inventory-control', label: 'Inventory control' }
          ]
        }
      ]
    }
  ]
};
