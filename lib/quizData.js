export const QUIZ_QUESTIONS = [
  {
    id: 'daily_hustle',
    question: 'What describes your daily hustle best?',
    options: [
      { label: 'Office Goer', val: 'Office Goer' },
      { label: 'Work From Home', val: 'Work From Home' },
      { label: 'Student', val: 'Student' },
      { label: 'Fitness Enthusiast', val: 'Fitness Enthusiast' },
      { label: 'Parent / Homemaker', val: 'Parent / Homemaker' }
    ]
  },
  {
    id: 'snack_weakness',
    question: "When your 4 PM Chai-time hits, what's your biggest snack weakness?",
    options: [
      { label: 'Fried Cravings (Samosa, Bhajia, Namkeen)', val: 'Fried Cravings (Samosa, Bhajia, Namkeen)' },
      { label: 'The Sweet Tooth (Maida Biscuits, Mithai, Chocolates)', val: 'The Sweet Tooth (Maida Biscuits, Mithai, Chocolates)' },
      { label: 'Spicy Street Food (Chatpatta treats, Vada Pav, Puffs)', val: 'Spicy Street Food (Chatpatta treats, Vada Pav, Puffs)' },
      { label: 'Mindless Munching (Grabbing whatever junk is nearby)', val: 'Mindless Munching (Grabbing whatever junk is nearby)' }
    ]
  },
  {
    id: 'healthy_bars_frustration',
    question: 'What is your biggest frustration with "healthy" snack bars?',
    options: [
      { label: 'Tastes like medicine', val: 'Tastes like medicine' },
      { label: 'Secret sugar bombs', val: 'Secret sugar bombs' },
      { label: 'Hard as a brick', val: 'Hard as a brick' },
      { label: 'Hard to digest', val: 'Hard to digest' }
    ]
  },
  {
    id: 'dream_flavor',
    question: 'Your dream flavor profile is...',
    options: [
      { label: 'Rich Chocolate with nuts', val: 'Rich Chocolate with nuts' },
      { label: 'Coffee with walnuts', val: 'Coffee with walnuts' },
      { label: 'Creamy Peanut Butter', val: 'Creamy Peanut Butter' },
      { label: 'Salted Caramel', val: 'Salted Caramel' },
      { label: 'Fruity & Refreshing', val: 'Fruity & Refreshing' }
    ]
  },
  {
    id: 'snack_bar_look_for',
    question: 'What is your preferred source of protein in the snack bar?',
    options: [
      { label: 'Whey Protein', val: 'Whey Protein' },
      { label: 'Plant-Based / Vegan', val: 'Plant-Based / Vegan' },
      { label: 'Protein blend (mix of plant and whey)', val: 'Protein blend (mix of plant and whey)' },
      { label: "Either / Doesn’t Matter (as long as it is healthy)", val: "Either / Doesn’t Matter (as long as it is healthy)" }
    ]
  },
  {
    id: 'hunger_monster_time',
    question: 'When does your hunger monster usually strike?',
    options: [
      { label: 'Pre-Lunch Cravings', val: 'Pre-Lunch Cravings' },
      { label: 'Evening Chai Time', val: 'Evening Chai Time' },
      { label: 'Late Night Munching', val: 'Late Night Munching' },
      { label: 'Right After a Workout', val: 'Right After a Workout' },
      { label: 'Anytime On-The-Go', val: 'Anytime On-The-Go' }
    ]
  },
  {
    id: 'sweet_spot_price',
    question: 'What is your sweet spot for a everyday snack bar?',
    options: [
      { label: 'Under ₹50', val: 'Under ₹50' },
      { label: '₹51 to ₹75', val: '₹51 to ₹75' },
      { label: '₹76 to ₹100', val: '₹76 to ₹100' },
      { label: '₹101 to ₹125', val: '₹101 to ₹125' },
      { label: "Doesn't matter (as long as the product is exceptionally good)", val: "Doesn't matter (as long as the product is exceptionally good)" }
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
  const hustle = answers.daily_hustle || '';
  const weakness = answers.snack_weakness || '';
  const preference = answers.snack_bar_look_for || '';
  const hungerTime = answers.hunger_monster_time || '';

  if (hustle.includes('Fitness') || preference.includes('Whey') || preference.includes('High Protein') || hungerTime.includes('Workout')) {
    return ARCHETYPES[2];
  }
  if (preference.includes('Plant-Based') || preference.includes('Zero Added Sugar') || preference.includes('Plant Based') || preference.includes('Gluten Free')) {
    return ARCHETYPES[1];
  }
  if (hungerTime.includes('Chai') || hungerTime.includes('Pre-Lunch') || hungerTime.includes('4 PM') || hustle.includes('Office') || hustle.includes('Work From Home')) {
    return ARCHETYPES[0];
  }
  return ARCHETYPES[3];
}
