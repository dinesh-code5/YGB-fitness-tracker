const axios = require('axios');
// Workout plan generator based on goal and experience

// Muscle group categories for the picker UI
const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Forearms', 'Abs', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Cardio', 'Full Body'
];

const EXERCISE_LIBRARY = {
  // CHEST
  bench_press:      { name: 'Bench Press',           muscleGroup: 'Chest',     muscles: ['Chest','Triceps','Front Deltoid'],   youtubeId: 'rT7DgCr-3pg', description: 'The king of chest exercises. Lie flat, grip barbell slightly wider than shoulders, lower to lower chest and press back up.', cues: ['Keep back slightly arched','Plant feet firmly on floor','Grip slightly wider than shoulder width','Lower bar to lower chest'], mistakes: ['Bouncing bar off chest','Flaring elbows too wide','Lifting hips off bench'] },
  incline_press:    { name: 'Incline DB Press',       muscleGroup: 'Chest',     muscles: ['Upper Chest','Triceps'],             youtubeId: '8iPEnn-ltC8', description: 'Targets the upper chest. Set bench to 30-45 degrees and press dumbbells from chest level overhead.', cues: ['Set bench to 30-45 degrees','Retract shoulder blades','Control the descent'], mistakes: ['Too steep incline','Touching weights at top'] },
  chest_fly:        { name: 'Cable Chest Fly',        muscleGroup: 'Chest',     muscles: ['Chest'],                            youtubeId: 'WEM9FCIPlxQ', description: 'Isolation movement for chest. Arms sweep in a wide arc, squeezing chest at the midpoint.', cues: ['Slight bend in elbows throughout','Squeeze chest at center','Control the stretch'], mistakes: ['Bending elbows too much','Using too much weight'] },
  pushup:           { name: 'Push-ups',               muscleGroup: 'Chest',     muscles: ['Chest','Triceps','Shoulders'],       youtubeId: 'IODxDxX7oi4', description: 'Classic bodyweight chest movement. Keep body rigid like a plank throughout.', cues: ['Core tight throughout','Elbows at 45 degrees','Full range of motion'], mistakes: ['Sagging hips','Neck forward'] },

  // BACK
  deadlift:         { name: 'Deadlift',               muscleGroup: 'Back',      muscles: ['Back','Glutes','Hamstrings'],        youtubeId: 'op9kVnSso6Q', description: 'The most powerful compound lift. Pulls the entire posterior chain. Hinge at hips, keep bar close to body.', cues: ['Hinge at hips first','Bar close to body throughout','Chest up back straight','Drive through heels'], mistakes: ['Rounding lower back','Bar drifting away','Jerking off floor'] },
  pullup:           { name: 'Pull-ups',               muscleGroup: 'Back',      muscles: ['Lats','Biceps','Rhomboids'],         youtubeId: 'eGo4IYlbE5g', description: 'Best bodyweight back exercise. Hang from bar and pull chest to bar level.', cues: ['Start from dead hang','Pull elbows to ribs','Control the descent','Squeeze lats at top'], mistakes: ['Kipping/swinging','Partial range','Looking up excessively'] },
  barbell_row:      { name: 'Barbell Row',            muscleGroup: 'Back',      muscles: ['Back','Biceps','Rear Deltoid'],      youtubeId: 'G8l_8chR5BE', description: 'Horizontal pulling movement for back thickness. Hinge forward and row bar to lower chest.', cues: ['Hinge forward at 45 degrees','Pull bar to lower chest','Retract scapula at top','Keep back flat'], mistakes: ['Too upright posture','Using momentum','Not retracting blades'] },
  lat_pulldown:     { name: 'Lat Pulldown',           muscleGroup: 'Back',      muscles: ['Lats','Biceps'],                    youtubeId: 'CAwf7n6Luuc', description: 'Machine exercise targeting lat width. Pull bar to upper chest with controlled motion.', cues: ['Lean back slightly','Pull to upper chest','Squeeze lats at bottom'], mistakes: ['Pulling behind neck','Using too much weight'] },
  seated_row:       { name: 'Seated Cable Row',       muscleGroup: 'Back',      muscles: ['Back','Biceps','Rear Deltoid'],      youtubeId: 'GZbfZ033f74', description: 'Cable row for mid-back thickness. Sit upright and row handles to midsection.', cues: ['Keep chest up','Row to midsection','Squeeze shoulder blades'], mistakes: ['Rounding forward','Using momentum'] },

  // SHOULDERS
  overhead_press:   { name: 'Overhead Press',         muscleGroup: 'Shoulders', muscles: ['Shoulders','Triceps'],              youtubeId: '2yjwXTZQDDI', description: 'Primary shoulder mass builder. Press barbell or dumbbells overhead from shoulder height.', cues: ['Stand feet shoulder width','Brace core tight','Press bar straight overhead','Lock out arms at top'], mistakes: ['Excessive back arch','Not fully extending arms','Bar path drifting forward'] },
  lateral_raises:   { name: 'Lateral Raises',         muscleGroup: 'Shoulders', muscles: ['Side Deltoid'],                     youtubeId: 'Gmi_DCnJ93c', description: 'Isolation for side delts for shoulder width. Raise arms to shoulder height with slight bend in elbows.', cues: ['Slight bend in elbows','Lead with elbows not hands','Stop at shoulder height'], mistakes: ['Using too much weight','Shrugging shoulders','Swinging body'] },
  front_raise:      { name: 'Front Raise',            muscleGroup: 'Shoulders', muscles: ['Front Deltoid'],                    youtubeId: 'gkbNVFVWITg', description: 'Targets front deltoid. Raise plates or dumbbells to shoulder height in front of body.', cues: ['Slight elbow bend','Raise to shoulder height','Control descent'], mistakes: ['Swinging body','Going too heavy'] },
  face_pull:        { name: 'Face Pull',              muscleGroup: 'Shoulders', muscles: ['Rear Deltoid','Rotator Cuff'],       youtubeId: 'rep-qVOkqgk', description: 'Rear delt and rotator cuff health exercise. Pull rope to face level and flare elbows out.', cues: ['Elbows high and wide','Pull to forehead','External rotation at end'], mistakes: ['Elbows dropping','Too heavy a weight'] },

  // BICEPS
  bicep_curl:       { name: 'Barbell Curl',           muscleGroup: 'Biceps',    muscles: ['Biceps'],                           youtubeId: 'ykJmrZ5v0Oo', description: 'Classic bicep builder. Keep elbows pinned at sides and curl bar from hip to shoulder.', cues: ['Keep elbows at sides','Full range of motion','Supinate wrists at top'], mistakes: ['Swinging body','Moving elbows forward','Partial reps'] },
  hammer_curl:      { name: 'Hammer Curl',            muscleGroup: 'Biceps',    muscles: ['Biceps','Brachialis'],              youtubeId: 'zC3nLlEvin4', description: 'Neutral grip curl targeting brachialis for arm thickness. Thumbs face up throughout.', cues: ['Neutral grip throughout','Elbows stay at sides','Full range of motion'], mistakes: ['Swinging','Partial reps'] },
  incline_curl:     { name: 'Incline DB Curl',        muscleGroup: 'Biceps',    muscles: ['Biceps'],                           youtubeId: 'soxrZlIl35U', description: 'Stretches bicep at the bottom for a fuller contraction. Sit on incline bench, arms hang behind torso.', cues: ['Arms fully behind torso','Full stretch at bottom','Squeeze hard at top'], mistakes: ['Elbows swinging forward','Partial range'] },

  // TRICEPS
  tricep_pushdown:  { name: 'Tricep Pushdown',        muscleGroup: 'Triceps',   muscles: ['Triceps'],                          youtubeId: '2-LAMcpzODU', description: 'Cable isolation for all three tricep heads. Push bar down until arms are fully extended.', cues: ['Keep elbows at sides','Full extension at bottom','Controlled return'], mistakes: ['Moving elbows forward','Using momentum'] },
  skull_crusher:    { name: 'Skull Crusher',          muscleGroup: 'Triceps',   muscles: ['Triceps'],                          youtubeId: 'd_KZxkY_5cM', description: 'Lying tricep extension for mass. Lower bar towards forehead keeping upper arms vertical.', cues: ['Upper arms vertical','Lower to forehead','Elbows in, not flared'], mistakes: ['Flaring elbows','Not fully extending'] },
  dips:             { name: 'Tricep Dips',            muscleGroup: 'Triceps',   muscles: ['Triceps','Chest','Shoulders'],       youtubeId: '2z8JmcrW-As', description: 'Bodyweight tricep compound. Stay upright to focus on triceps rather than chest.', cues: ['Stay upright for triceps','Elbows close to body','Full range of motion'], mistakes: ['Leaning too far forward','Partial reps'] },

  // FOREARMS
  wrist_curl:       { name: 'Wrist Curl',             muscleGroup: 'Forearms',  muscles: ['Forearms'],                         youtubeId: 'dExkUcEFSp4', description: 'Forearm flexor isolation. Rest forearms on bench and curl wrists upward.', cues: ['Forearms on bench','Full range of motion','Slow controlled reps'], mistakes: ['Going too heavy','Rushing reps'] },
  reverse_curl:     { name: 'Reverse Curl',           muscleGroup: 'Forearms',  muscles: ['Forearms','Brachialis'],            youtubeId: 'nRgxYX2XuX4', description: 'Overhand grip curl working forearm extensors and brachialis.', cues: ['Overhand grip','Keep elbows at sides','Full range'], mistakes: ['Going too heavy','Swinging body'] },

  // ABS
  crunch:           { name: 'Crunch',                 muscleGroup: 'Abs',       muscles: ['Abs'],                              youtubeId: 'Xyd_fa5zoEU', description: 'Basic ab isolation. Focus on contracting abs, not pulling neck.', cues: ['Exhale on the way up','Focus on ab contraction','Do not pull neck'], mistakes: ['Pulling neck','Using momentum'] },
  plank:            { name: 'Plank',                  muscleGroup: 'Abs',       muscles: ['Abs','Core','Shoulders'],           youtubeId: 'ASdvN_XEl_c', description: 'Isometric core stability exercise. Hold body rigid like a plank.', cues: ['Body straight from head to heels','Hips level','Breathe steadily'], mistakes: ['Hips too high','Hips sagging','Looking up'] },
  leg_raise:        { name: 'Hanging Leg Raise',      muscleGroup: 'Abs',       muscles: ['Lower Abs','Hip Flexors'],          youtubeId: 'l4kQd9eWclE', description: 'Challenging lower ab exercise. Hang from bar and raise legs to parallel.', cues: ['Control the descent','Legs straight if possible','Tilt pelvis up at top'], mistakes: ['Swinging','Using momentum'] },
  cable_crunch:     { name: 'Cable Crunch',           muscleGroup: 'Abs',       muscles: ['Abs'],                              youtubeId: 'AV5eMon7pcI', description: 'Weighted ab exercise with consistent cable tension. Kneel and crunch elbows to knees.', cues: ['Hips stay stationary','Round spine down','Hold contraction briefly'], mistakes: ['Moving hips','Pulling with arms'] },

  // QUADS
  squat:            { name: 'Barbell Squat',          muscleGroup: 'Quads',     muscles: ['Quads','Glutes','Hamstrings'],       youtubeId: 'ultWZbUMPL8', description: 'King of all exercises. Builds quads, glutes and overall mass. Break parallel for full development.', cues: ['Bar on upper traps','Feet shoulder width slightly turned out','Knees track over toes','Hip crease below knee'], mistakes: ['Knees caving in','Heels coming up','Not hitting depth'] },
  leg_press:        { name: 'Leg Press',              muscleGroup: 'Quads',     muscles: ['Quads','Glutes'],                   youtubeId: 'IZxyjW7MPJQ', description: 'Machine compound for quads. Safer on lower back than squats. Vary foot placement for emphasis.', cues: ['Feet shoulder width on platform','Push through heels','Do not lock knees fully'], mistakes: ['Lifting hips off seat','Knees caving in'] },
  leg_extension:    { name: 'Leg Extension',          muscleGroup: 'Quads',     muscles: ['Quads'],                            youtubeId: 'YyvSfVjQeL0', description: 'Quad isolation machine. Extend knees to full lockout and squeeze quads hard.', cues: ['Full extension at top','Squeeze quads','Controlled descent'], mistakes: ['Using momentum','Not full extension'] },
  lunges:           { name: 'Lunges',                 muscleGroup: 'Quads',     muscles: ['Quads','Glutes','Hamstrings'],       youtubeId: '3XDriUn0udo', description: 'Unilateral leg exercise for balance and quad development. Step forward and lower back knee toward ground.', cues: ['Keep torso upright','Front knee over ankle','Back knee just above floor'], mistakes: ['Knee caving in','Torso leaning too far forward'] },

  // HAMSTRINGS
  romanian_deadlift:{ name: 'Romanian Deadlift',      muscleGroup: 'Hamstrings',muscles: ['Hamstrings','Glutes'],              youtubeId: 'JCXUYuzwNrM', description: 'Best hamstring stretch exercise. Hinge forward with slight knee bend until stretch is felt.', cues: ['Soft knee bend','Hinge at hips','Feel stretch in hamstrings','Keep bar close to legs'], mistakes: ['Bending knees too much','Rounding back'] },
  leg_curl:         { name: 'Lying Leg Curl',         muscleGroup: 'Hamstrings',muscles: ['Hamstrings'],                       youtubeId: '1Tq3QdYUuHs', description: 'Hamstring isolation machine. Curl heels toward glutes through full range of motion.', cues: ['Full range of motion','Squeeze at top of curl','Control descent'], mistakes: ['Rushing the movement','Lifting hips'] },

  // GLUTES
  hip_thrust:       { name: 'Hip Thrust',             muscleGroup: 'Glutes',    muscles: ['Glutes','Hamstrings'],              youtubeId: 'SEdqd9BaNx0', description: 'Best glute builder. Upper back on bench, drive hips up to full extension squeezing glutes hard.', cues: ['Drive through heels','Full hip extension at top','Squeeze glutes hard','Chin tucked to chest'], mistakes: ['Not achieving full extension','Lower back arching instead of glutes'] },
  glute_kickback:   { name: 'Cable Glute Kickback',   muscleGroup: 'Glutes',    muscles: ['Glutes'],                           youtubeId: 'FO6LHBQiYgk', description: 'Cable isolation for glute toning. Kick leg back and up squeezing glute at the top.', cues: ['Squeeze at full extension','Keep core stable','Controlled movement'], mistakes: ['Rotating hips','Using momentum'] },

  // CALVES
  calf_raises:      { name: 'Standing Calf Raises',   muscleGroup: 'Calves',    muscles: ['Calves'],                           youtubeId: 'c5Kv6-fnTj8', description: 'Primary calf builder. Rise up on toes through full range, pause at top.', cues: ['Full stretch at bottom','Pause at top','Slow controlled movement'], mistakes: ['Bouncing at bottom','Not achieving full range'] },
  seated_calf:      { name: 'Seated Calf Raise',      muscleGroup: 'Calves',    muscles: ['Soleus','Calves'],                  youtubeId: 'JbyjNymZOt0', description: 'Targets soleus (deeper calf muscle). Seated position with knees bent emphasizes soleus over gastrocnemius.', cues: ['Full range of motion','Pause at top and bottom','Toes forward'], mistakes: ['Partial range','Bouncing'] },

  // CARDIO
  treadmill:        { name: 'Treadmill Run',          muscleGroup: 'Cardio',    muscles: ['Full Body'],                        youtubeId: null, description: 'Steady state or interval cardio. Great for fat loss and cardiovascular health.', cues: ['Land midfoot','Keep pace conversational for steady state','Pump arms naturally'], mistakes: ['Holding handrails','Overstriding'] },
  cycling:          { name: 'Cycling',                muscleGroup: 'Cardio',    muscles: ['Quads','Calves'],                   youtubeId: null, description: 'Low impact cardio machine. Adjust seat so legs are almost fully extended at bottom.', cues: ['Seat at hip height','Smooth pedal stroke','Maintain good posture'], mistakes: ['Seat too low','Hunching over'] },
  jump_rope:        { name: 'Jump Rope',              muscleGroup: 'Cardio',    muscles: ['Calves','Shoulders','Full Body'],    youtubeId: null, description: 'High intensity cardio that also trains coordination and calf strength.', cues: ['Land on balls of feet','Small jumps','Wrists do the rotation'], mistakes: ['Jumping too high','Using arms instead of wrists'] },

  // FULL BODY
  clean_press:      { name: 'Power Clean & Press',    muscleGroup: 'Full Body', muscles: ['Full Body'],                        youtubeId: '0MgHSA2sxiQ', description: 'Olympic lift variation for full body power. Clean bar to shoulders then press overhead.', cues: ['Explosive hip extension','Catch in front rack position','Press from shoulders'], mistakes: ['Using arms too early','Not hip drive'] },
  burpees:          { name: 'Burpees',                muscleGroup: 'Full Body', muscles: ['Full Body'],                        youtubeId: 'auBLPXO8Fww', description: 'High intensity full body conditioning movement. Squat, jump back to plank, pushup, jump forward, jump up.', cues: ['Move quickly but controlled','Full pushup at bottom','Jump explosively at top'], mistakes: ['Skipping the pushup','Sloppy plank position'] },

  // MORE CHEST
  dumbbell_pullover:{ name: 'DB Pullover',            muscleGroup: 'Chest',     muscles: ['Chest','Lats','Triceps'],           youtubeId: 'FK4rHfGsQlg', description: 'Classic chest and lat stretch. Lie across bench and lower dumbbell behind head in arc motion.', cues: ['Keep arms slightly bent','Feel stretch across chest','Control the arc'], mistakes: ['Arms too straight','Going too heavy'] },
  cable_crossover:  { name: 'Cable Crossover',        muscleGroup: 'Chest',     muscles: ['Chest'],                            youtubeId: 'taI4XduLpTk', description: 'Cable fly variation with constant tension throughout. Cross hands at center and squeeze hard.', cues: ['Slight forward lean','Bring hands together at center','Squeeze chest hard'], mistakes: ['Using too much weight','Straight arms'] },
  decline_press:    { name: 'Decline Bench Press',    muscleGroup: 'Chest',     muscles: ['Lower Chest','Triceps'],            youtubeId: 'LfyQTbKnFDk', description: 'Targets the lower chest. Bench declined at 15-30 degrees, press bar from lower chest.', cues: ['Feet secured firmly','Bar to lower chest','Controlled descent'], mistakes: ['Too steep decline','Bouncing bar'] },
  pec_deck:         { name: 'Pec Deck / Chest Fly Machine', muscleGroup: 'Chest', muscles: ['Chest'],                         youtubeId: 'Z57CtFmRMxA', description: 'Machine fly for chest isolation with guided path and constant tension.', cues: ['Squeeze at center','Control the return','Keep chest high'], mistakes: ['Going too heavy','Elbows dropping'] },

  // MORE BACK
  tbar_row:         { name: 'T-Bar Row',              muscleGroup: 'Back',      muscles: ['Back','Biceps','Rear Deltoid'],      youtubeId: 'j3FTIxDQsD4', description: 'Thick back builder. Neutral grip row using T-bar machine or landmine setup.', cues: ['Chest on pad','Pull elbows back','Squeeze shoulder blades at top'], mistakes: ['Rounding back','Too much weight'] },
  single_arm_row:   { name: 'Single Arm DB Row',      muscleGroup: 'Back',      muscles: ['Lats','Rhomboids','Biceps'],         youtubeId: 'pYcpY20QaE8', description: 'Unilateral back exercise for balanced development. Brace on bench and row dumbbell to hip.', cues: ['Elbow close to body','Pull to hip not armpit','Full stretch at bottom'], mistakes: ['Rotating torso too much','Partial range'] },
  straight_arm_pulldown: { name: 'Straight Arm Pulldown', muscleGroup: 'Back', muscles: ['Lats','Triceps'],                   youtubeId: 'oM5GBFy3OWQ', description: 'Isolates the lats without bicep involvement. Keep arms straight and hinge from shoulder.', cues: ['Arms stay straight','Hinge at shoulder joint','Feel lats engage'], mistakes: ['Bending elbows','Standing too close to cable'] },
  good_morning:     { name: 'Good Morning',           muscleGroup: 'Back',      muscles: ['Lower Back','Hamstrings','Glutes'], youtubeId: 'vKPGe8zb2S4', description: 'Lower back and hamstring developer. Bar on traps, hinge forward keeping back flat.', cues: ['Soft knee bend','Hinge at hips','Back perfectly flat','Feel hamstring stretch'], mistakes: ['Rounding back','Too much weight'] },
  hyperextension:   { name: 'Back Extension',         muscleGroup: 'Back',      muscles: ['Lower Back','Glutes'],              youtubeId: 'ph3pMBkr0dg', description: 'Lower back isolation on GHD or 45-degree bench. Great for spinal erector development.', cues: ['Squeeze glutes at top','Controlled movement','Do not hyperextend'], mistakes: ['Rounding at bottom','Going too fast'] },

  // MORE SHOULDERS
  arnold_press:     { name: 'Arnold Press',           muscleGroup: 'Shoulders', muscles: ['Shoulders','Triceps'],              youtubeId: '6Z15_WdXmVw', description: 'Rotating dumbbell press invented by Arnold Schwarzenegger. Hits all three delt heads.', cues: ['Start palms facing you','Rotate as you press','Full rotation at top'], mistakes: ['Skipping the rotation','Partial range'] },
  upright_row:      { name: 'Upright Row',            muscleGroup: 'Shoulders', muscles: ['Traps','Side Deltoid'],             youtubeId: 'VG67q5v3TWo', description: 'Trap and shoulder developer. Pull bar or dumbbells up along body to chin level.', cues: ['Elbows lead up','Pull to chin height','Controlled descent'], mistakes: ['Too wide grip','Going too heavy'] },
  shrugs:           { name: 'Barbell Shrugs',         muscleGroup: 'Shoulders', muscles: ['Traps'],                            youtubeId: 'cJRVVxmytaM', description: 'Trap isolation exercise. Simply shrug shoulders up toward ears and hold briefly.', cues: ['Full height shrug','Hold 1 second at top','Slow controlled descent'], mistakes: ['Rolling shoulders','Bending elbows'] },
  rear_delt_fly:    { name: 'Rear Delt Fly',          muscleGroup: 'Shoulders', muscles: ['Rear Deltoid','Rhomboids'],         youtubeId: 'ttvfGg9d76c', description: 'Targets the often-neglected rear deltoids for shoulder balance and posture.', cues: ['Hinge forward or use pec deck','Slight elbow bend','Squeeze rear delts at top'], mistakes: ['Too heavy','Shrugging'] },

  // MORE BICEPS
  concentration_curl:{ name: 'Concentration Curl',   muscleGroup: 'Biceps',    muscles: ['Biceps'],                           youtubeId: 'Jvj2wV0vOYU', description: 'Peak contraction bicep exercise. Elbow braced on inner thigh for strict isolation.', cues: ['Elbow on inner thigh','Full supination at top','Squeeze hard at peak'], mistakes: ['Moving elbow off thigh','Partial reps'] },
  cable_curl:       { name: 'Cable Curl',             muscleGroup: 'Biceps',    muscles: ['Biceps'],                           youtubeId: 'av7-8igSXTs', description: 'Constant tension bicep curl via cable. Great for peak contraction.', cues: ['Keep elbows pinned','Full range of motion','Squeeze at top'], mistakes: ['Moving elbows forward','Using momentum'] },
  spider_curl:      { name: 'Spider Curl',            muscleGroup: 'Biceps',    muscles: ['Biceps'],                           youtubeId: 'oNFThBwWKEQ', description: 'Chest-supported curl that eliminates momentum. Chest on incline bench angled at 45 degrees.', cues: ['Chest on bench pad','Elbows hang freely','Full range of motion'], mistakes: ['Swinging','Partial reps'] },
  preacher_curl:    { name: 'Preacher Curl',          muscleGroup: 'Biceps',    muscles: ['Biceps'],                           youtubeId: 'fIWP-FRFNU0', description: 'Long head bicep isolation using preacher bench. Prevents cheating.', cues: ['Upper arms on pad','Full extension at bottom','Squeeze at top'], mistakes: ['Bouncing at bottom','Not full extension'] },

  // MORE TRICEPS
  overhead_tricep:  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', muscles: ['Triceps','Long Head'],             youtubeId: 'YbX7Wd8jQ-Q', description: 'Targets the long head of the tricep which is best stretched overhead. Use dumbbell or cable.', cues: ['Keep elbows close to head','Full stretch at bottom','Lock out at top'], mistakes: ['Elbows flaring wide','Partial range'] },
  close_grip_bench: { name: 'Close Grip Bench Press',  muscleGroup: 'Triceps',  muscles: ['Triceps','Chest'],                 youtubeId: 'nEF0bv2FW7s', description: 'Compound tricep builder using narrow grip on bench press. Also works inner chest.', cues: ['Grip shoulder width','Elbows in tight to body','Full range of motion'], mistakes: ['Grip too narrow','Flaring elbows'] },
  diamond_pushup:   { name: 'Diamond Push-ups',        muscleGroup: 'Triceps',  muscles: ['Triceps','Chest'],                 youtubeId: 'J0DXDOwHYkc', description: 'Bodyweight tricep exercise with hands in diamond shape under chest.', cues: ['Hands form diamond shape','Elbows close to body','Full range'], mistakes: ['Elbows flaring','Hips sagging'] },

  // MORE ABS
  russian_twist:    { name: 'Russian Twist',          muscleGroup: 'Abs',       muscles: ['Obliques','Abs'],                  youtubeId: 'JyUqwkVpsi8', description: 'Rotational core exercise targeting obliques. Sit at 45 degrees and rotate side to side.', cues: ['Keep feet off ground','Rotate from torso','Touch floor each side'], mistakes: ['Swinging arms only','Feet on floor makes it too easy'] },
  ab_wheel:         { name: 'Ab Wheel Rollout',       muscleGroup: 'Abs',       muscles: ['Abs','Core','Lower Back'],         youtubeId: 'p4m5vC5d5sw', description: 'Very challenging total core exercise. Roll out from knees controlling with abs.', cues: ['Slow controlled rollout','Abs contracted throughout','Do not let hips sag'], mistakes: ['Going too far too soon','Hips sagging'] },
  bicycle_crunch:   { name: 'Bicycle Crunch',         muscleGroup: 'Abs',       muscles: ['Abs','Obliques'],                  youtubeId: 'Iwyvozckjak', description: 'Alternating elbow-to-knee crunch targeting both abs and obliques.', cues: ['Slow and controlled','Full extension of straight leg','Rotate from torso'], mistakes: ['Going too fast','Pulling neck forward'] },
  dead_bug:         { name: 'Dead Bug',               muscleGroup: 'Abs',       muscles: ['Core','Abs'],                      youtubeId: 'LG_5f4POKhU', description: 'Anti-extension core exercise. Lower opposite arm and leg while keeping lower back pressed to floor.', cues: ['Lower back pressed to floor','Controlled breathing','Move slowly'], mistakes: ['Arching back','Moving too fast'] },
  mountain_climber: { name: 'Mountain Climbers',      muscleGroup: 'Abs',       muscles: ['Abs','Hip Flexors','Shoulders'],   youtubeId: 'nmwgirgXLYM', description: 'Dynamic plank variation that elevates heart rate while training abs.', cues: ['Keep hips level','Drive knees to chest','Shoulders over wrists'], mistakes: ['Hips bouncing up','Looking up'] },

  // MORE QUADS
  hack_squat:       { name: 'Hack Squat',             muscleGroup: 'Quads',     muscles: ['Quads','Glutes'],                  youtubeId: 'DbFgADa2PL8', description: 'Machine squat variant with back supported. Great for quad isolation.', cues: ['Feet shoulder width','Full depth','Push through heels'], mistakes: ['Too shallow depth','Knees caving'] },
  bulgarian_split:  { name: 'Bulgarian Split Squat',  muscleGroup: 'Quads',     muscles: ['Quads','Glutes','Hamstrings'],     youtubeId: 'qOChUQBDtXg', description: 'Single leg squat with rear foot elevated. One of the best unilateral leg exercises.', cues: ['Front foot far enough forward','Keep torso upright','Back knee near floor'], mistakes: ['Front foot too close','Torso leaning forward'] },
  step_up:          { name: 'Step-ups',               muscleGroup: 'Quads',     muscles: ['Quads','Glutes'],                  youtubeId: 'dQqApCGd5Ss', description: 'Unilateral leg exercise using a box or bench. Great for quad and glute development.', cues: ['Step up with full foot on box','Drive through heel','Control descent'], mistakes: ['Pushing off back foot','Leaning forward'] },
  sissy_squat:      { name: 'Sissy Squat',            muscleGroup: 'Quads',     muscles: ['Quads'],                           youtubeId: 'Y5-kS3MIXco', description: 'Advanced quad isolation. Knees travel far forward as heels rise and you lean back.', cues: ['Hold something for balance','Control the movement','Feel deep quad stretch'], mistakes: ['Going too fast','Insufficient quad strength to do safely'] },

  // MORE HAMSTRINGS
  nordic_curl:      { name: 'Nordic Curl',            muscleGroup: 'Hamstrings',muscles: ['Hamstrings'],                      youtubeId: 'Z7Pml3Kqm-Y', description: 'Extremely effective hamstring exercise. Kneel with feet anchored and lower body toward floor.', cues: ['Control descent with hamstrings','Use arms if needed','Hamstrings control the fall'], mistakes: ['Dropping too fast','Not using hamstrings to control'] },
  glute_ham_raise:  { name: 'Glute Ham Raise',        muscleGroup: 'Hamstrings',muscles: ['Hamstrings','Glutes'],             youtubeId: 'nOdFkKK68HM', description: 'GHD machine exercise for hamstrings and glutes. Curl body up from horizontal position.', cues: ['Full range of motion','Squeeze hamstrings at top','Control the descent'], mistakes: ['Using momentum','Partial range'] },
  sumo_deadlift:    { name: 'Sumo Deadlift',          muscleGroup: 'Hamstrings',muscles: ['Hamstrings','Glutes','Inner Thigh'],youtubeId: 'JAiO74hMLBY', description: 'Wide stance deadlift targeting inner hamstrings and glutes more than conventional.', cues: ['Wide stance toes pointed out','Grip inside knees','Keep chest up'], mistakes: ['Knees caving','Not pushing knees out'] },

  // MORE GLUTES
  cable_pull_through:{ name: 'Cable Pull Through',   muscleGroup: 'Glutes',    muscles: ['Glutes','Hamstrings'],             youtubeId: 'r6oNmrYIkgo', description: 'Hip hinge movement with cable resistance. Face away from cable and hinge forward.', cues: ['Hinge at hips not squat','Drive hips forward at top','Feel glutes contract'], mistakes: ['Squatting instead of hinging','Leaning too far back at top'] },
  sumo_squat:       { name: 'Sumo Squat',            muscleGroup: 'Glutes',    muscles: ['Glutes','Inner Thigh','Quads'],    youtubeId: 'cVBHMQXGFBg', description: 'Wide stance squat that emphasizes glutes and inner thighs more than regular squat.', cues: ['Toes pointed out 45 degrees','Knees track over toes','Squeeze glutes at top'], mistakes: ['Knees caving','Not enough width'] },
  donkey_kick:      { name: 'Donkey Kick',           muscleGroup: 'Glutes',    muscles: ['Glutes'],                          youtubeId: 'SJ1Xuz9D-ZQ', description: 'On all fours, kick leg back and up squeezing glute. Can be done with or without cable.', cues: ['Kick to hip height','Squeeze glute at top','Core stable, no rotation'], mistakes: ['Rotating hips','Kicking too high losing form'] },

  // MORE CALVES
  donkey_calf:      { name: 'Donkey Calf Raise',     muscleGroup: 'Calves',    muscles: ['Calves','Gastrocnemius'],          youtubeId: 'dIvMqgLb2UE', description: 'Bent-over calf raise targeting gastrocnemius with a unique stretch. Can use machine or partner.', cues: ['Hinge forward at 90 degrees','Full range of motion','Pause at bottom'], mistakes: ['Not enough forward lean','Partial range'] },

  // MORE CARDIO
  rowing_machine:   { name: 'Rowing Machine',        muscleGroup: 'Cardio',    muscles: ['Back','Legs','Arms','Cardio'],     youtubeId: 'QUFpJsBVBZk', description: 'Full body cardio machine with 60% legs 20% core 20% arms. Excellent low impact option.', cues: ['Drive with legs first','Then lean back','Then pull arms to lower chest'], mistakes: ['Pulling with arms first','Hunching over'] },
  stairmaster:      { name: 'Stairmaster',           muscleGroup: 'Cardio',    muscles: ['Glutes','Quads','Calves'],         youtubeId: 'oBL-Dfd_a7s', description: 'Stair climbing cardio machine. Targets glutes and calves while raising heart rate.', cues: ['Full step down','Do not lean on rails','Steady pace'], mistakes: ['Holding rails for support','Too fast a pace'] },
  battle_ropes:     { name: 'Battle Ropes',          muscleGroup: 'Cardio',    muscles: ['Shoulders','Arms','Core'],         youtubeId: 'RVv4yLbI8GU', description: 'High intensity conditioning tool. Wave, slam or rotate ropes for upper body cardio.', cues: ['Bend knees slightly','Alternate arms or both together','Short rest periods'], mistakes: ['Straight legs','Too long rest'] },
  box_jump:         { name: 'Box Jump',              muscleGroup: 'Cardio',    muscles: ['Quads','Glutes','Calves'],         youtubeId: 'NBY9-kTuHEk', description: 'Explosive plyometric exercise. Jump onto a box landing softly with bent knees.', cues: ['Explosive arm swing','Land softly with knees bent','Step down do not jump down'], mistakes: ['Landing stiff-legged','Jumping down instead of stepping'] },

  // MORE FULL BODY
  kettlebell_swing: { name: 'Kettlebell Swing',      muscleGroup: 'Full Body', muscles: ['Glutes','Hamstrings','Core','Shoulders'],youtubeId: 'YSxHifyI6s8', description: 'Hip hinge power movement with kettlebell. Drive hips forward explosively to swing KB to chest height.', cues: ['Hinge at hips not squat','Explosive hip snap','Arms just guide the bell'], mistakes: ['Squatting instead of hinging','Using arms to lift'] },
  thruster:         { name: 'Thruster',              muscleGroup: 'Full Body', muscles: ['Quads','Shoulders','Triceps'],     youtubeId: 'L219ltL15zk', description: 'Front squat into overhead press in one fluid motion. Used in CrossFit for conditioning.', cues: ['Full depth squat','Drive through heels','Press overhead as you stand'], mistakes: ['Partial squat','Pausing between squat and press'] },
  farmers_walk:     { name: 'Farmers Walk',          muscleGroup: 'Full Body', muscles: ['Forearms','Traps','Core','Legs'],  youtubeId: 'Fkzk7T0BHXY', description: 'Loaded carry exercise for grip strength and overall conditioning. Walk with heavy weights.', cues: ['Chest tall','Short quick steps','Squeeze the handles hard'], mistakes: ['Leaning to one side','Looking down'] },
  turkish_getup:    { name: 'Turkish Get-up',        muscleGroup: 'Full Body', muscles: ['Shoulders','Core','Hips'],        youtubeId: 'jFK9rv_Srmk', description: 'Complex movement from lying to standing while holding weight overhead. Ultimate mobility and stability test.', cues: ['Eye on the bell always','Go slow and controlled','Each position deliberate'], mistakes: ['Rushing','Looking away from bell'] },

  // STRETCHES / WARM UP
  band_pull_apart:  { name: 'Band Pull Apart',       muscleGroup: 'Shoulders', muscles: ['Rear Deltoid','Rhomboids'],        youtubeId: 'FcVpFuRdBKI', description: 'Resistance band warm-up for shoulder health. Hold band at chest and pull apart horizontally.', cues: ['Arms straight throughout','Pull to full extension','Controlled return'], mistakes: ['Bending elbows','Going too fast'] },
  cat_cow:          { name: 'Cat-Cow Stretch',       muscleGroup: 'Full Body', muscles: ['Spine','Core'],                   youtubeId: '0m7J3QkP5kk', description: 'Spinal mobility warm-up. On all fours alternate between arching and rounding the back.', cues: ['Breathe through movement','Slow and controlled','Full range of motion'], mistakes: ['Moving too fast','Not breathing'] },
};

const PPL_PLANS = {
  beginner: {
    split: 'Push-Pull-Legs (3-Day Split)',
    frequency: 3,
    schedule: [
      {
        day: 'Day 1',
        name: 'Push (Chest, Shoulders, Triceps)',
        type: 'push',
        exercises: [
          { exerciseId: 'bench_press', name: 'Bench Press', sets: 3, reps: '8-10', rest: '2-3m', muscleGroup: 'Chest' },
          { exerciseId: 'overhead_press', name: 'Overhead Press', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Shoulders' },
          { exerciseId: 'incline_press', name: 'Incline DB Press', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Chest' },
          { exerciseId: 'lateral_raises', name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '1m', muscleGroup: 'Shoulders' },
          { exerciseId: 'tricep_pushdown', name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest: '1m', muscleGroup: 'Triceps' }
        ]
      },
      {
        day: 'Day 2',
        name: 'Pull (Back, Biceps, Rear Delts)',
        type: 'pull',
        exercises: [
          { exerciseId: 'lat_pulldown', name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Back' },
          { exerciseId: 'seated_row', name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Back' },
          { exerciseId: 'face_pull', name: 'Face Pulls', sets: 3, reps: '15', rest: '1m', muscleGroup: 'Shoulders' },
          { exerciseId: 'bicep_curl', name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '1.5m', muscleGroup: 'Biceps' },
          { exerciseId: 'hammer_curl', name: 'Hammer Curls', sets: 3, reps: '12', rest: '1m', muscleGroup: 'Biceps' }
        ]
      },
      {
        day: 'Day 3',
        name: 'Legs (Quads, Hamstrings, Calves)',
        type: 'legs',
        exercises: [
          { exerciseId: 'squat', name: 'Goblet Squats', sets: 3, reps: '12-15', rest: '2m', muscleGroup: 'Quads' },
          { exerciseId: 'leg_press', name: 'Leg Press', sets: 3, reps: '12-15', rest: '2m', muscleGroup: 'Quads' },
          { exerciseId: 'leg_curl', name: 'Leg Curls', sets: 3, reps: '12-15', rest: '1.5m', muscleGroup: 'Hamstrings' },
          { exerciseId: 'calf_raises', name: 'Calf Raises', sets: 4, reps: '15-20', rest: '1m', muscleGroup: 'Calves' },
          { exerciseId: 'plank', name: 'Plank', sets: 3, reps: '45s', rest: '1m', muscleGroup: 'Abs' }
        ]
      }
    ],
    tips: [
      'Focus on mastering the form before increasing weight.',
      'Log your weights every session to track progress.',
      'Ensure you get 7-8 hours of sleep for recovery.'
    ]
  },
  intermediate: {
    split: 'Push-Pull-Legs (6-Day Hypertrophy)',
    frequency: 6,
    schedule: [
      {
        day: 'Push A',
        name: 'Power Chest & Shoulders',
        type: 'push',
        exercises: [
          { exerciseId: 'bench_press', name: 'Bench Press', sets: 4, reps: '6-8', rest: '3m', muscleGroup: 'Chest' },
          { exerciseId: 'overhead_press', name: 'Overhead Press', sets: 3, reps: '8-10', rest: '2m', muscleGroup: 'Shoulders' },
          { exerciseId: 'incline_press', name: 'Incline DB Press', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Chest' },
          { exerciseId: 'lateral_raises', name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '1m', muscleGroup: 'Shoulders' },
          { exerciseId: 'dips', name: 'Dips', sets: 3, reps: 'Max', rest: '1.5m', muscleGroup: 'Triceps' }
        ]
      },
      {
        day: 'Pull A',
        name: 'Back Thickness & Biceps',
        type: 'pull',
        exercises: [
          { exerciseId: 'barbell_row', name: 'Barbell Row', sets: 4, reps: '8-10', rest: '2m', muscleGroup: 'Back' },
          { exerciseId: 'pullup', name: 'Weighted Pull-ups', sets: 3, reps: '8-10', rest: '2m', muscleGroup: 'Back' },
          { exerciseId: 'seated_row', name: 'Seated Row', sets: 3, reps: '12', rest: '1.5m', muscleGroup: 'Back' },
          { exerciseId: 'incline_curl', name: 'Incline Curls', sets: 3, reps: '10-12', rest: '1m', muscleGroup: 'Biceps' },
          { exerciseId: 'face_pull', name: 'Face Pulls', sets: 3, reps: '15', rest: '1m', muscleGroup: 'Shoulders' }
        ]
      },
      {
        day: 'Legs A',
        name: 'Quad Focus',
        type: 'legs',
        exercises: [
          { exerciseId: 'squat', name: 'Squats', sets: 4, reps: '8-10', rest: '3m', muscleGroup: 'Quads' },
          { exerciseId: 'bulgarian_split', name: 'Bulgarian Split Squats', sets: 3, reps: '10', rest: '2m', muscleGroup: 'Quads' },
          { exerciseId: 'leg_extension', name: 'Leg Extensions', sets: 3, reps: '15', rest: '1m', muscleGroup: 'Quads' },
          { exerciseId: 'romanian_deadlift', name: 'Stiff Leg Deadlift', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Hamstrings' },
          { exerciseId: 'seated_calf', name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '1m', muscleGroup: 'Calves' }
        ]
      }
    ],
    tips: [
      'Eat in a slight calorie surplus for muscle growth.',
      'Vary your rep ranges for both power and hypertrophy.',
      'Take a deload week every 6-8 weeks.'
    ]
  },
  advanced: {
    split: 'Push-Pull-Legs (Advanced Aesthetic)',
    frequency: 6,
    schedule: [
      {
        day: 'Push',
        name: 'Aesthetic Push',
        type: 'push',
        exercises: [
          { exerciseId: 'incline_press', name: 'Incline DB Press', sets: 4, reps: '8-10', rest: '2m', muscleGroup: 'Chest' },
          { exerciseId: 'chest_fly', name: 'Cable Flys', sets: 3, reps: '12-15', rest: '1m', muscleGroup: 'Chest' },
          { exerciseId: 'arnold_press', name: 'Arnold Press', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Shoulders' },
          { exerciseId: 'lateral_raises', name: 'Lateral Raises', sets: 5, reps: '15-20', rest: '1m', muscleGroup: 'Shoulders' },
          { exerciseId: 'overhead_tricep', name: 'Overhead Tricep Ext.', sets: 3, reps: '12-15', rest: '1m', muscleGroup: 'Triceps' }
        ]
      },
      {
        day: 'Pull',
        name: 'Aesthetic Pull',
        type: 'pull',
        exercises: [
          { exerciseId: 'deadlift', name: 'Deadlifts', sets: 3, reps: '5', rest: '3m', muscleGroup: 'Back' },
          { exerciseId: 'weighted_pullups', name: 'Weighted Pull-ups', sets: 3, reps: '8', rest: '2m', muscleGroup: 'Back' },
          { exerciseId: 'tbar_row', name: 'T-Bar Row', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Back' },
          { exerciseId: 'bicep_curl', name: 'Hammer Curls', sets: 3, reps: '12', rest: '1m', muscleGroup: 'Biceps' },
          { exerciseId: 'preacher_curl', name: 'Preacher Curls', sets: 3, reps: '10-12', rest: '1.5m', muscleGroup: 'Biceps' }
        ]
      },
      {
        day: 'Legs',
        name: 'Aesthetic Legs',
        type: 'legs',
        exercises: [
          { exerciseId: 'squat', name: 'High Bar Squats', sets: 4, reps: '8-10', rest: '3m', muscleGroup: 'Quads' },
          { exerciseId: 'romanian_deadlift', name: 'RDLs', sets: 4, reps: '10-12', rest: '2m', muscleGroup: 'Hamstrings' },
          { exerciseId: 'hip_thrust', name: 'Hip Thrusts', sets: 3, reps: '10-12', rest: '2m', muscleGroup: 'Glutes' },
          { exerciseId: 'calf_raises', name: 'Standing Calf Raises', sets: 5, reps: '15', rest: '1m', muscleGroup: 'Calves' }
        ]
      }
    ],
    tips: [
      'Focus on the mind-muscle connection for every rep.',
      'Control the negative phase of each movement.',
      'Maintain strict form even when pushing to failure.'
    ]
  }
};

const RECOMMENDED_TEMPLATES = [
  {
    id: 'rec-beginner-fb',
    name: 'Foundation (Full Body)',
    description: 'Perfect for building base strength and learning form.',
    workoutType: 'full_body',
    difficulty: 'beginner',
    goal: 'general',
    exercises: [
      { exerciseId: 'pushup', name: 'Push-ups', defaultSets: 3, defaultReps: 'Max', restTime: 90, muscleGroup: 'Chest' },
      { exerciseId: 'squat', name: 'Barbell Squat', defaultSets: 3, defaultReps: '12-15', restTime: 90, muscleGroup: 'Quads' },
      { exerciseId: 'lat_pulldown', name: 'Lat Pulldown', defaultSets: 3, defaultReps: '12', restTime: 90, muscleGroup: 'Back' },
      { exerciseId: 'plank', name: 'Plank', defaultSets: 3, defaultReps: '45s', restTime: 60, muscleGroup: 'Abs' }
    ]
  },
  {
    id: 'rec-int-push',
    name: 'Hypertrophy: Push Day',
    description: 'Focused on chest, shoulders, and triceps growth.',
    workoutType: 'push',
    difficulty: 'intermediate',
    goal: 'bulk',
    exercises: [
      { exerciseId: 'bench_press', name: 'Bench Press', defaultSets: 4, defaultReps: '8-10', restTime: 120, muscleGroup: 'Chest' },
      { exerciseId: 'incline_press', name: 'Incline DB Press', defaultSets: 3, defaultReps: '10-12', restTime: 90, muscleGroup: 'Chest' },
      { exerciseId: 'lateral_raises', name: 'Lateral Raises', defaultSets: 4, defaultReps: '15', restTime: 60, muscleGroup: 'Shoulders' },
      { exerciseId: 'tricep_pushdown', name: 'Tricep Pushdown', defaultSets: 3, defaultReps: '12-15', restTime: 60, muscleGroup: 'Triceps' }
    ]
  },
  {
    id: 'rec-int-pull',
    name: 'Hypertrophy: Pull Day',
    description: 'Targets back thickness, width, and bicep peaks.',
    workoutType: 'pull',
    difficulty: 'intermediate',
    goal: 'bulk',
    exercises: [
      { exerciseId: 'barbell_row', name: 'Barbell Row', defaultSets: 4, defaultReps: '8-10', restTime: 120, muscleGroup: 'Back' },
      { exerciseId: 'lat_pulldown', name: 'Lat Pulldown', defaultSets: 3, defaultReps: '10-12', restTime: 90, muscleGroup: 'Back' },
      { exerciseId: 'face_pull', name: 'Face Pulls', defaultSets: 3, defaultReps: '15', restTime: 60, muscleGroup: 'Shoulders' },
      { exerciseId: 'bicep_curl', name: 'Barbell Curls', defaultSets: 3, defaultReps: '10-12', restTime: 60, muscleGroup: 'Biceps' }
    ]
  },
  {
    id: 'rec-int-legs',
    name: 'Hypertrophy: Leg Day',
    description: 'Comprehensive leg development for quads and hamstrings.',
    workoutType: 'legs',
    difficulty: 'intermediate',
    goal: 'bulk',
    exercises: [
      { exerciseId: 'squat', name: 'Barbell Squat', defaultSets: 4, defaultReps: '8-10', restTime: 180, muscleGroup: 'Quads' },
      { exerciseId: 'leg_press', name: 'Leg Press', defaultSets: 3, defaultReps: '12-15', restTime: 120, muscleGroup: 'Quads' },
      { exerciseId: 'leg_curl', name: 'Leg Curls', defaultSets: 3, defaultReps: '12-15', restTime: 90, muscleGroup: 'Hamstrings' },
      { exerciseId: 'calf_raises', name: 'Calf Raises', defaultSets: 4, defaultReps: '15-20', restTime: 60, muscleGroup: 'Calves' }
    ]
  }
];

// @desc    Get recommended workout plans (YGB Recommended)
// @route   GET /api/plans/workout
// @access  Private
const getWorkoutPlan = async (req, res) => {
  try {
    const user = req.user;
    const plan = PPL_PLANS[user.experience] || PPL_PLANS.beginner;
    
    res.json({ 
      success: true, 
      plan,
      templates: RECOMMENDED_TEMPLATES
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating plan' });
  }
};

// @desc    Get exercise library
// @route   GET /api/plans/exercises
// @access  Private
const getExercises = async (req, res) => {
  try {
    const { muscleGroup, search } = req.query;
    
    // Check if we have the API Key
    if (process.env.API_NINJAS_KEY) {
      try {
        const params = {};
        if (search) params.name = search;
        
        // API Ninjas uses lowercase muscle names: 'biceps', 'chest', etc.
        // We map our 'MUSCLE_GROUPS' to their format if needed
        if (muscleGroup && muscleGroup !== 'All') {
          params.muscle = muscleGroup.toLowerCase();
        }

        const response = await axios.get('https://api.api-ninjas.com/v1/exercises', {
          params,
          headers: { 'X-Api-Key': process.env.API_NINJAS_KEY }
        });

        if (response.data && response.data.length > 0) {
          const exercises = response.data.map((ex, index) => ({
            id: `ext-${ex.name.replace(/\s+/g, '_').toLowerCase()}`,
            name: ex.name,
            muscleGroup: ex.muscle.charAt(0).toUpperCase() + ex.muscle.slice(1),
            muscles: [ex.muscle],
            description: ex.instructions,
            difficulty: ex.difficulty,
            equipment: ex.equipment,
            type: ex.type,
            cues: [], // API doesn't provide these separately
            mistakes: ex.safety_info ? [ex.safety_info] : []
          }));
          return res.json({ success: true, exercises });
        }
      } catch (err) {
        console.error('API Ninjas fetch error:', err.message);
        // If API fails, we fall back to local library below
      }
    }

    // Fallback to local library if API key is missing or request fails
    let exercises = Object.entries(EXERCISE_LIBRARY).map(([id, ex]) => ({ id, ...ex }));
    if (muscleGroup && muscleGroup !== 'All') {
      exercises = exercises.filter(e => e.muscleGroup.toLowerCase() === muscleGroup.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      exercises = exercises.filter(e => 
        e.name.toLowerCase().includes(s) || 
        e.muscleGroup.toLowerCase().includes(s)
      );
    }
    res.json({ success: true, exercises });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercises' });
  }
};

// @desc    Get muscle groups list
// @route   GET /api/plans/muscle-groups
// @access  Private
const getMuscleGroups = async (req, res) => {
  res.json({ success: true, muscleGroups: MUSCLE_GROUPS });
};

// @desc    Get single exercise with full guidance
// @route   GET /api/plans/exercises/:id
// @access  Private
const getExercise = async (req, res) => {
  try {
    const exercise = EXERCISE_LIBRARY[req.params.id];
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json({ success: true, exercise: { id: req.params.id, ...exercise } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercise' });
  }
};

module.exports = { getWorkoutPlan, getExercises, getExercise, getMuscleGroups, MUSCLE_GROUPS, RECOMMENDED_TEMPLATES };