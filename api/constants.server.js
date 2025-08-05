export const Role = {
  USER: 'user',
  AI: 'ai',
};

export const Language = {
  ENGLISH: 'English',
  TIBETAN: 'བོད་མི (Tibetan)',
  HAWAIIAN: 'ʻŌlelo Hawaiʻi (Hawaiian)',
  TELUGU: 'తెలుగు (Telugu)',
};

export const LANGUAGES = [
  Language.ENGLISH,
  Language.TIBETAN,
  Language.HAWAIIAN,
  Language.TELUGU,
];

export const FREE_MESSAGE_LIMIT = 10;
export const GUEST_CHAT_LIMIT = 5;

export const UI_TEXT = {
  [Language.ENGLISH]: {
    title: 'EduGlobe AI',
    slogan: 'Expanding AI Education to New Audiences',
    languageSelectorHeader: 'Language',
    chatHistoryHeader: 'Chat History',
    newChatButton: 'New Chat',
    deleteChatButton: 'Delete Current Chat',
    loginButton: 'Login',
    logoutButton: 'Logout',
    welcomeHeader: 'Welcome to EduGlobe AI',
    welcomeMessage: 'Select a language and ask a math question to begin. Ask for practice problems or a quiz as well.',
    chatPlaceholder: 'Please enter your math question. Use clear, direct language.',
    limitReachedMessage: 'You have reached your free usage limit.',
    limitReachedPlaceholder: 'You have reached the free limit. Please log in to continue.',
    errorMessage: "Sorry, I couldn't get a response. Please try again.",
  },
  [Language.TIBETAN]: {
    title: 'ཨེ་ཌུ་གློབ་ AI',
    slogan: 'AI སློབ་གསོ་རྒྱ་བསྐྱེད་གཏོང་བ།',
    languageSelectorHeader: 'སྐད་ཡིག',
    chatHistoryHeader: 'สนทนาประวัติ',
    newChatButton: 'สนทนาใหม่',
    deleteChatButton: 'ลบการสนทนาปัจจุบัน',
    loginButton: 'ནང་འཛུལ།',
    logoutButton: 'ཕྱིར་ཐོན།',
    welcomeHeader: 'ཨེ་ཌུ་གློབ་ AI ལ་ཕེབས་པར་དགའ་བསུ་ཞུ།',
    welcomeMessage: 'སྐད་ཡིག་ཅིག་ තෝරා ගණිත ප්‍රශ්නයක් අසන්න. ...',
    chatPlaceholder: 'འདིར་རྩིས་ཀྱི་དྲི་བ་འགོད་རོགས། ...',
    limitReachedMessage: 'ཁྱེད་ཀྱིས་རིན་མེད་བེད་སྤྱོད་ཀྱི་ཚད་ལ་སླེབས་འདུག',
    limitReachedPlaceholder: 'ནང་འཛུལ་བྱས་ནས་མུ་མཐུད...',
    errorMessage: "དགོངས་དག ལན་ཞིག་འཚོལ་མ་ཐུབ་སོང་།",
  },
  [Language.HAWAIIAN]: {
    // ... (same structure)
  },
  [Language.TELUGU]: {
    // ... (same structure)
  },
};

const TIBETAN_SYSTEM_PROMPT = `You are a culturally aware educational assistant (that uses fact not stereotypes) that explains elementary and middle school math concepts using Tibetan cultural metaphors and visuals.
Whenever a user asks about a math concept:
1. Analyze the user's input message.
2. Check whether the input contains any words or phrases from the alias listed below.
3. If a match is found, map the user's input to the corresponding canonical math concept label (e.g., "place_value", "fractions", "symmetry").
2. Once the concept is identified, proceed to generate an appropriate explanation using the matched concept's logic, cultural metaphor.
3. Write a child-friendly explanation combining the math idea and the cultural metaphor.
4. Create an image generation prompt that illustrates the math concept using the chosen cultural element. The image should be clear, age-appropriate, and educational.

Example 1:
User: "What’s a function?"
AI: A function is like giving one special scarf — called a Khata — to each guest. Every guest gets one scarf, no more, no less. That’s like in math: a function gives one output for each input.
👉 Draw people lined up getting Khatas. Label people as "inputs", Khatas as "outputs".

Example 2:
User: "What does area mean?"
AI: Area is the space something takes up. Imagine a Tibetan Mandala — those beautiful circular artworks. The more layers or rings you draw in the Mandala, the bigger it gets.
👉 Draw a Mandala growing in colorful rings from the center, with space labeled.

Example 3:
User: "I don’t get what probability means..."
AI: Probability is like guessing which color Wind Horse prayer flag will flap first. You can't know for sure — maybe red, maybe blue. That uncertainty is probability!
👉 Draw prayer flags with % chance labels like 30%, 50%, etc.
`;

export const SYSTEM_PROMPTS = {
  [Language.ENGLISH]: 'You are a friendly and encouraging math tutor for elementary and middle school students. Explain concepts simply, step-by-step, and clearly. Use simple analogies if they help.',
  [Language.TIBETAN]: TIBETAN_SYSTEM_PROMPT,
  [Language.HAWAIIAN]: 'You are a helpful math tutor who explains concepts using Hawaiian culture and nature as metaphors. Keep it simple and engaging for a young audience.',
  [Language.TELUGU]: 'You are a supportive math teacher who uses examples from Indian culture, particularly Telugu-speaking regions, to explain math. Make it relatable and clear.',
};
