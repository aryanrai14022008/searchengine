export const QUIZ_QUESTIONS = [
  {
    id: 'role',
    question: 'What describes you best?',
    options: [
      { label: 'Office professional', val: 'Office goer' },
      { label: 'Work from home', val: 'Work from home' },
      { label: 'Student', val: 'Student' },
      { label: 'Fitness / sports enthusiast', val: 'Fitness / sports enthusiast' },
      { label: 'Homemaker', val: 'Homemaker' },
      { label: 'Other', val: 'Other' }
    ]
  },
  {
    id: 'weakness',
    question: 'What is your biggest snack weakness?',
    options: [
      { label: 'Dark Chocolate / Brownies', val: 'Chocolate' },
      { label: 'Salty Chips & Crisps', val: 'Chips' },
      { label: 'Tea Biscuits & Cookies', val: 'Biscuits' },
      { label: 'Traditional Sweets & Desserts', val: 'Sweets' },
      { label: 'Fried Savory Snacks', val: 'Fried snacks' },
      { label: 'Strict clean discipline', val: 'No weakness' }
    ]
  },
  {
    id: 'label',
    question: 'How often do you check the nutrition label?',
    options: [
      { label: 'Every single time', val: 'Every time' },
      { label: 'Sometimes, when curious', val: 'Sometimes' },
      { label: 'Only when actively on a diet', val: 'Only when dieting' },
      { label: 'Rarely / Never', val: 'Never' }
    ]
  },
  {
    id: 'activity',
    question: 'What does your physical activity look like?',
    options: [
      { label: 'Heavy gym / Athletics (5+ days/week)', val: 'Heavy gym' },
      { label: 'Moderate workouts / Jogging / Yoga', val: 'Moderate' },
      { label: 'Light walks / Commute activity', val: 'Light' },
      { label: 'Mostly sedentary / Desk focused', val: 'Sedentary' }
    ]
  },
  {
    id: 'time',
    question: 'When does hunger strike you the hardest?',
    options: [
      { label: '11:00 AM Mid-morning', val: '11:00 AM' },
      { label: '4:00 PM Afternoon slump', val: '4:00 PM' },
      { label: 'Post-workout recovery', val: 'Post-workout' },
      { label: 'Late night cravings', val: 'Late night' }
    ]
  },
  {
    id: 'preference',
    question: 'What kind of texture and flavor do you prefer?',
    options: [
      { label: 'Rich Dark Chocolate & Roasted Almonds', val: 'Dark Chocolate Almond' },
      { label: 'Warm Cinnamon Vanilla & Cashews', val: 'Vanilla Cashew' },
      { label: 'Creamy Peanut Butter & Sea Salt', val: 'Peanut Butter' },
      { label: 'Berry Chew & Chia Seeds', val: 'Berry Chia' }
    ]
  },
  {
    id: 'impact',
    question: 'Every bar donates a meal to a child. What matters most to you?',
    options: [
      { label: 'Healthy snacking with real purpose', val: 'Love it' },
      { label: 'Supporting children through education', val: 'Inspiring' },
      { label: 'Clean nutrition with honest ingredients', val: 'Great bonus' },
      { label: 'Transparency in community welfare', val: 'Want to know more' }
    ]
  },
  {
    id: 'sharing',
    question: 'Who would you share healthy snacks with?',
    options: [
      { label: 'Personal daily fuel', val: 'Just me' },
      { label: 'Workout & gym partners', val: 'Gym buddies' },
      { label: 'Office colleagues & teammates', val: 'Colleagues' },
      { label: 'Family at home', val: 'Family' }
    ]
  },
  {
    id: 'decision_factor',
    question: 'If you had to pick just ONE factor that decides whether you buy a specific snack bar, what would it be?',
    options: [
      { label: 'Flavor & Taste', val: 'Flavor & Taste' },
      { label: 'High Protein Value', val: 'High Protein Value' },
      { label: 'Low Sugar / Healthy Ingredients', val: 'Low Sugar / Healthy Ingredients' },
      { label: 'Price / Value for Money', val: 'Price / Value for Money' }
    ]
  }
];

export const ARCHETYPES = [
  {
    id: 'power-strategist',
    title: 'THE 4PM POWER STRATEGIST',
    name: 'The Afternoon Energy Master',
    description: 'You power through high-intensity days, but the late afternoon brings an energy dip. You need wholesome, clean fuel to stay focused without sugar crashes.',
    proteinNeed: 'High Focus',
    cravingTime: '4:00 PM',
    cleanLabelScore: '98%',
    tagColor: '#D96B43'
  },
  {
    id: 'clean-purist',
    title: 'THE CLEAN FUEL PURIST',
    name: 'The Label Conscious Snacker',
    description: 'You care deeply about what goes into your body. Zero artificial sweeteners, zero trans fats, and zero shortcuts. You look for real, honest nutrition.',
    proteinNeed: 'Pure Fuel',
    cravingTime: 'Mid-Morning',
    cleanLabelScore: '100%',
    tagColor: '#3B7A57'
  },
  {
    id: 'endurance-beast',
    title: 'THE ENDURANCE PERFORMER',
    name: 'The Recovery Optimizer',
    description: 'You push your body through demanding workouts and active days. Wholesome protein and natural energy give your muscles consistent replenishment.',
    proteinNeed: 'Peak Recovery',
    cravingTime: 'Post-Workout',
    cleanLabelScore: '95%',
    tagColor: '#C86D24'
  },
  {
    id: 'mindful-connoisseur',
    title: 'THE MINDFUL CONNOISSEUR',
    name: 'The Balanced Foodie',
    description: 'You believe healthy food should still taste wonderful. You seek balanced, satisfying nourishment that aligns with health and social impact.',
    proteinNeed: 'Balanced',
    cravingTime: 'Evening',
    cleanLabelScore: '94%',
    tagColor: '#8C4351'
  }
];

export function calculateArchetype(answers) {
  const role = answers.role || '';
  const weakness = answers.weakness || '';
  const activity = answers.activity || '';
  const time = answers.time || '';

  if (activity.includes('Heavy') || activity.includes('Fitness')) {
    return ARCHETYPES[2];
  }
  if (answers.label === 'Every time' || weakness === 'No weakness') {
    return ARCHETYPES[1];
  }
  if (time.includes('4:00 PM') || role.includes('Office') || role.includes('Work from home')) {
    return ARCHETYPES[0];
  }
  return ARCHETYPES[3];
}
