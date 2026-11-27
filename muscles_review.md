# v48 — автоматично додані допоміжні мʼязи (для перевірки тренером)

Джерело: `exercises.json` (free-exercise-db, 880 вправ). Основні мʼязи (`pm`) і непорожні списки допоміжних (`sm`) НЕ змінювались. Заповнено лише порожні `sm`; кожен такий запис має `"smAuto": true`.

**Як вирішувалось.** Клас руху — ті самі правила, що для аналогів v46 (`_altClassOf`) + запасні правила v48 (`_cls48`). Для класу + головного мʼяза є явна таблиця синергістів (`_sm48Rule` в `index.html`). Мʼяз з таблиці додається, лише якщо серед «сусідів» (вправи того ж класу з тим самим головним мʼязом, у яких `sm` є в джерелі) він трапляється в ≥40 %; якщо сусідів менше 3 — діє лише таблиця (у колонці «підтримка» тоді «—»). Ізольовані вправи, де серед наших 17 груп немає вагомого синергіста, лишаються з порожнім списком.

Підсумок: заповнено **59**, лишилось порожніми **214** (ізольовані 146, розтяжки 59, некласифіковані 2, правило відкинуте даними 7).

## Заповнені записи

| # | Назва | Клас | Основні (pm) | Додано (sm) | Підтримка сусідів | Сусідів |
|---|---|---|---|---|---|---|
| 1 | Monster Walk | abduct | abductors (Відвідні) | glutes (Сідниці) | glutes — | 1 |
| 2 | Cable Hip Adduction | adduct | quadriceps (Квадрицепс) | adductors (Привідні) | adductors — | 0 |
| 3 | Barbell Curls Lying Against An Incline | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 4 | Cable Hammer Curls - Rope Attachment | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 5 | Dumbbell Prone Incline Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 6 | EZ-Bar Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 7 | Flexor Incline Dumbbell Curls | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 8 | Hammer Curls | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 9 | High Cable Curls | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 10 | Incline Dumbbell Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 11 | Incline Hammer Curls | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 12 | Incline Inner Biceps Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 13 | Lying Cable Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 14 | Lying Close-Grip Bar Curl On High Pulley | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 15 | Lying High Bench Barbell Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 16 | Lying Supine Dumbbell Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 17 | Machine Bicep Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 18 | Machine Preacher Curls | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 19 | One Arm Dumbbell Preacher Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 20 | Overhead Cable Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 21 | Preacher Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 22 | Seated Close-Grip Concentration Barbell Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 23 | Seated Dumbbell Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 24 | Seated Dumbbell Inner Biceps Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 25 | Spider Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 26 | Standing Biceps Cable Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 27 | Standing Inner-Biceps Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 28 | Standing One-Arm Cable Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 29 | Standing One-Arm Dumbbell Curl Over Incline Bench | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 30 | Two-Arm Dumbbell Preacher Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 31 | Wide-Grip Standing Barbell Curl | curl | biceps (Біцепс) | forearms (Передпліччя) | forearms 100% | 21 |
| 32 | Butterfly | fly | chest (Груди) | shoulders (Плечі) | shoulders 100% | 8 |
| 33 | Cable Iron Cross | fly | chest (Груди) | shoulders (Плечі) | shoulders 100% | 8 |
| 34 | Decline Dumbbell Flyes | fly | chest (Груди) | shoulders (Плечі) | shoulders 100% | 8 |
| 35 | Dumbbell Flyes | fly | chest (Груди) | shoulders (Плечі) | shoulders 100% | 8 |
| 36 | Flat Bench Cable Flyes | fly | chest (Груди) | shoulders (Плечі) | shoulders 100% | 8 |
| 37 | One-Arm Flat Bench Dumbbell Flye | fly | chest (Груди) | shoulders (Плечі) | shoulders 100% | 8 |
| 38 | Single-Arm Cable Crossover | fly | chest (Груди) | shoulders (Плечі) | shoulders 100% | 8 |
| 39 | One-Arm Kettlebell Clean and Jerk | pressv | shoulders (Плечі) | triceps (Трицепс) | triceps 98% (відкинуто: traps 13%) | 48 |
| 40 | Cable Incline Pushdown | pullover | lats (Найширші) | triceps (Трицепс), shoulders (Плечі) | triceps —, shoulders — | 1 |
| 41 | Rope Straight-Arm Pulldown | pullover | lats (Найширші) | triceps (Трицепс), shoulders (Плечі) | triceps —, shoulders — | 1 |
| 42 | Straight-Arm Pulldown | pullover | lats (Найширші) | triceps (Трицепс), shoulders (Плечі) | triceps —, shoulders — | 1 |
| 43 | Bent Over Dumbbell Rear Delt Raise With Head On Bench | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 44 | Cable Rear Delt Fly | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 45 | Dumbbell Lying Rear Lateral Raise | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 46 | Lying Rear Delt Raise | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 47 | Reverse Flyes | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 48 | Reverse Flyes With External Rotation | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 49 | Reverse Machine Flyes | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 50 | Seated Bent-Over Rear Delt Raise | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 51 | Sled Reverse Flye | rear | shoulders (Плечі) | middle back (Середина спини) | middle back 100% (відкинуто: traps 38%) | 8 |
| 52 | Barbell Shrug | shrug | traps (Трапеції) | forearms (Передпліччя) | forearms 80% | 5 |
| 53 | Cable Shrugs | shrug | traps (Трапеції) | forearms (Передпліччя) | forearms 80% | 5 |
| 54 | Dumbbell Shrug | shrug | traps (Трапеції) | forearms (Передпліччя) | forearms 80% | 5 |
| 55 | Middle Back Shrug | shrug | middle back (Середина спини) | traps (Трапеції) | traps — | 0 |
| 56 | Bosu Ball Cable Crunch With Side Bends | sidebend | abdominals (Прес) | lower back (Поперек) | lower back — | 1 |
| 57 | Dumbbell Side Bend | sidebend | abdominals (Прес) | lower back (Поперек) | lower back — | 1 |
| 58 | One-Arm High-Pulley Cable Side Bends | sidebend | abdominals (Прес) | lower back (Поперек) | lower back — | 1 |
| 59 | Weighted Ball Side Bend | sidebend | abdominals (Прес) | lower back (Поперек) | lower back — | 1 |

## Свідомо лишились без допоміжних

### Ізольовані — 146

Клас руху без вагомого синергіста серед 17 груп застосунку (махи в сторони, розгинання/згинання ніг, литки, передпліччя, трицепс-розгинання, скручування/прес, ротаторна манжета = «плечі», шия, згиначі стегна).

- **adduct · adductors** (1): Band Hip Adductions
- **calf · calves** (14): Barbell Seated Calf Raise; Calf Press; Calf Press On The Leg Press Machine; Calf Raise On A Dumbbell; Calf Raises - With Bands; Donkey Calf Raises; Dumbbell Seated One-Leg Calf Raise; Rocking Standing Calf Raise; Seated Calf Raise; Smith Machine Calf Raise; Smith Machine Reverse Calf Raises; Standing Barbell Calf Raise; Standing Calf Raises; Standing Dumbbell Calf Raise
- **coreflex · abdominals** (45): 3/4 Sit-Up; Ab Crunch Machine; Air Bike; Alternate Heel Touchers; Bent-Knee Hip Raise; Bottoms Up; Butt-Ups; Cable Crunch; Cable Reverse Crunch; Cable Seated Crunch; Cocoons; Cross-Body Crunch; Crunch - Hands Overhead; Crunch - Legs On Exercise Ball; Crunches; Decline Crunch; Decline Oblique Crunch; Decline Reverse Crunch; Elbow to Knee; Exercise Ball Crunch; Exercise Ball Pull-In; Flat Bench Leg Pull-In; Flat Bench Lying Leg Raise; Frog Sit-Ups; Hanging Leg Raise; Hanging Pike; Jackknife Sit-Up; Janda Sit-Up; Knee/Hip Raise On Parallel Bars; Leg Pull-In; Oblique Crunches; Oblique Crunches - On The Floor; Reverse Crunch; Rope Crunch; Seated Flat Bench Leg Pull-In; Seated Leg Tucks; Side Jackknife; Sit-Up; Smith Machine Hip Raise; Standing Rope Crunch; Suspended Reverse Crunch; Tuck Crunch; Weighted Crunches; Weighted Sit-Ups - With Bands; Wind Sprints
- **corerot · abdominals** (5): Cable Judo Flip; Cable Russian Twists; Kneeling Cable Crunch With Alternating Oblique Twists; Plate Twist; Seated Barbell Twist
- **corestab · abdominals** (1): Dead Bug
- **corestatic · abdominals** (1): Plank
- **cuff · shoulders** (5): Cable Internal Rotation; External Rotation; External Rotation with Band; External Rotation with Cable; Internal Rotation with Band
- **forearm · forearms** (18): Cable Wrist Curl; Dumbbell Lying Pronation; Dumbbell Lying Supination; Finger Curls; Palms-Down Dumbbell Wrist Curl Over A Bench; Palms-Down Wrist Curl Over A Bench; Palms-Up Barbell Wrist Curl Over A Bench; Palms-Up Dumbbell Wrist Curl Over A Bench; Plate Pinch; Seated Dumbbell Palms-Down Wrist Curl; Seated Dumbbell Palms-Up Wrist Curl; Seated One-Arm Dumbbell Palms-Down Wrist Curl; Seated One-Arm Dumbbell Palms-Up Wrist Curl; Seated Palm-Up Barbell Wrist Curl; Seated Palms-Down Barbell Wrist Curl; Seated Two-Arm Palms-Up Low-Pulley Wrist Curl; Standing Palms-Up Barbell Behind The Back Wrist Curl; Wrist Rotations with Straight Bar
- **hipflex · quadriceps** (1): Hip Flexion with Band
- **lateral · shoulders** (9): Alternating Deltoid Raise; Lateral Raise - With Bands; Lying One-Arm Lateral Raise; One-Arm Incline Lateral Raise; One-Arm Side Laterals; Power Partials; Seated Side Lateral Raise; Side Lateral Raise; Single-Arm Cross-Body Band Lateral Raise
- **legcurl · hamstrings** (5): Lying Leg Curls; Prone Manual Hamstring; Seated Band Hamstring Curl; Seated Leg Curl; Standing Leg Curl
- **legext · quadriceps** (2): Leg Extensions; Single-Leg Leg Extension
- **neck · neck** (5): Isometric Neck Exercise - Front And Back; Isometric Neck Exercise - Sides; Lying Face Down Plate Neck Resistance; Lying Face Up Plate Neck Resistance; Seated Head Harness Neck Resistance
- **shrug · traps** (1): Calf-Machine Shoulder Shrug
- **triext · triceps** (33): Band Skull Crusher; Body Tricep Press; Cable Incline Triceps Extension; Cable Lying Triceps Extension; Cable One Arm Tricep Extension; Cable Rope Overhead Triceps Extension; Chain Handle Extension; Decline Dumbbell Triceps Extension; Decline EZ Bar Triceps Extension; Dumbbell One-Arm Triceps Extension; Dumbbell Tricep Extension -Pronated Grip; Kneeling Cable Triceps Extension; Low Cable Triceps Extension; Lying Close-Grip Barbell Triceps Extension Behind The Head; Lying Close-Grip Barbell Triceps Press To Chin; Lying Triceps Press; Machine Triceps Extension; One Arm Pronated Dumbbell Triceps Extension; One Arm Supinated Dumbbell Triceps Extension; Reverse Grip Triceps Pushdown; Seated Bent-Over One-Arm Dumbbell Triceps Extension; Seated Bent-Over Two-Arm Dumbbell Triceps Extension; Seated Triceps Press; Sled Overhead Triceps Extension; Speed Band Overhead Triceps; Standing Bent-Over Two-Arm Dumbbell Triceps Extension; Standing Dumbbell Triceps Extension; Standing Towel Triceps Extension; Tricep Dumbbell Kickback; Triceps Overhead Extension with Rope; Triceps Pushdown; Triceps Pushdown - Rope Attachment; Triceps Pushdown - V-Bar Attachment

### Правило відкинуте даними бібліотеки — 7

Таблиця пропонувала синергіста, але серед ≥3 сусідів він трапляється рідше 40 % — не додано.

- **front · shoulders** (7): Front Cable Raise; Front Dumbbell Raise; Front Incline Dumbbell Raise; Front Plate Raise; Front Two-Dumbbell Raise; Standing Dumbbell Straight-Arm Front Delt Raise Above Head; Standing Front Barbell Raise Over Head

### Некласифіковані — 2

Клас руху не визначено з назви (кидки, олімпійські тощо) — нічого не вигадуємо.

- **f:push/compound · shoulders** (1): Backward Medicine Ball Throw
- **x · lats** (1): Overhead Slam

### Розтяжки (category = stretching, не чіпались) — 59

Розтяжки не мають «допоміжних» у сенсі навантаження.

- **adduct · adductors** (2): Adductor; Adductor/Groin
- **calf · calves** (3): Calf Stretch Elbows Against Wall; Calf Stretch Hands Against Wall; Calves-SMR
- **calf · hamstrings** (1): Standing Hamstring and Calf Stretch
- **coreflex · abdominals** (1): Toe Touchers
- **corestatic · abdominals** (1): Stomach Vacuum
- **f:?/compound · hamstrings** (1): Inchworm
- **f:pull/? · abdominals** (1): Torso Rotation
- **f:pull/? · adductors** (1): Side Leg Raises
- **f:pull/? · lats** (1): Dynamic Back Stretch
- **f:pull/? · shoulders** (1): Shoulder Stretch
- **f:pull/compound · adductors** (1): Groiners
- **f:pull/isolation · abdominals** (1): Scissor Kick
- **f:pull/isolation · calves** (1): Ankle Circles
- **f:push/? · quadriceps** (1): Rear Leg Raises
- **f:push/isolation · hamstrings** (1): Leg-Up Hamstring Stretch
- **f:static/? · abdominals** (1): Lower Back Curl
- **f:static/? · abductors** (1): IT Band and Glute Stretch
- **f:static/? · adductors** (1): Lying Bent Leg Groin
- **f:static/? · biceps** (1): Brachialis-SMR
- **f:static/? · calves** (5): Anterior Tibialis-SMR; Foot-SMR; Peroneals Stretch; Peroneals-SMR; Posterior Tibialis Stretch
- **f:static/? · glutes** (1): Ankle On The Knee
- **f:static/? · lats** (1): Side-Lying Floor Stretch
- **f:static/? · lower back** (1): Lower Back-SMR
- **f:static/? · quadriceps** (2): Quad Stretch; Standing Elevated Quad Stretch
- **f:static/compound · adductors** (1): Groin and Back Stretch
- **f:static/compound · lower back** (1): Pelvic Tilt Into Bridge
- **f:static/compound · quadriceps** (1): Intermediate Hip Flexor and Quad Stretch
- **f:static/isolation · abdominals** (1): Seated Overhead Stretch
- **f:static/isolation · abductors** (1): Iliotibial Tract-SMR
- **f:static/isolation · calves** (1): Standing Soleus And Achilles Stretch
- **f:static/isolation · chest** (1): Chest Stretch on Stability Ball
- **f:static/isolation · forearms** (1): Kneeling Forearm Stretch
- **f:static/isolation · glutes** (1): Piriformis-SMR
- **f:static/isolation · hamstrings** (3): Hamstring Stretch; Hamstring-SMR; Intermediate Groin Stretch
- **f:static/isolation · lats** (2): Latissimus Dorsi-SMR; One Arm Against Wall
- **f:static/isolation · quadriceps** (5): Looking At Ceiling; On Your Side Quad Stretch; On-Your-Back Quad Stretch; Quadriceps-SMR; Standing Hip Flexors
- **fly · abductors** (1): Lying Crossover
- **fly · quadriceps** (1): Iron Crosses (stretch)
- **forearm · forearms** (1): Wrist Circles
- **front · hamstrings** (1): Front Leg Raises
- **lateral · abdominals** (1): Standing Lateral Stretch
- **neck · neck** (2): Neck-SMR; Side Neck Stretch
- **— · quadriceps** (1): Lying Prone Quadriceps

