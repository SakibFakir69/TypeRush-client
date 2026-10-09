export type Lang = "en" | "bn" | "hi";

export const LANGS: Array<{ id: Lang; label: string; hint: string }> = [
  { id: "en", label: "English", hint: "" },
  { id: "bn", label: "বাংলা", hint: "Switch your keyboard to a Bangla layout to type this." },
  { id: "hi", label: "हिन्दी", hint: "Switch your keyboard to a Hindi layout to type this." },
];

export const PARAGRAPHS: Record<Lang, string[]> = {
  en: [
    "The morning sun spills over the rooftops as the city slowly wakes up. Birds argue in the mango trees while tea stalls hiss and clatter. It is the best hour to sit down, breathe, and type your first hundred words.",
    "A river never hurries, yet everything it touches changes. Typing works the same way. Small daily sessions carve speed into your fingers the way water carves stone.",
    "Keep your wrists straight and your eyes on the screen, not the keys. Mistakes are teachers, not failures. Slow down on hard words and your accuracy will climb within a week.",
    "The old train rattled past green fields and sleepy stations. Vendors called out tea and snacks at every halt. I watched the world blur by and tapped the rhythm into my keyboard.",
    "Mountains do not move for anyone, so climbers learn patience instead. Every expert typist was once a beginner hunting for letters. Stay with it and the keys will find you.",
    "Rain hammered the tin roof while the street below turned to silver. Inside, the room smelled of wet earth and fresh coffee. It was a perfect evening to practice one more round.",
    "A garden grows the way skill grows: a little water every day. Ten focused minutes beat one exhausted hour. Plant your practice early and watch your speed bloom.",
    "Books are quiet teachers. Each page you copy trains your eyes to read ahead and your hands to follow. Pick a favorite paragraph and type it until it feels like music.",
    "The ocean keeps its own time, wave after steady wave. Let your fingers find that rhythm. Smooth and even always beats fast and messy in the long run.",
    "Tea cools, deadlines approach, and the cursor keeps blinking. Begin with one sentence. Then another. Momentum is built one keystroke at a time, never all at once.",
    "Night settles over the rooftops and the city hums below. Somewhere a writer deletes a whole chapter and starts again. Every master was once a mess of mistakes.",
    "Your keyboard is an instrument. Warm up with easy words, stretch into harder ones, and cool down with a favorite quote. Practice ends, but the habit stays with you.",
  ],
  bn: [
    "প্রতিদিন সকালে উঠে কিছুক্ষণ টাইপিং অনুশীলন করো। ধীরে ধীরে তোমার গতি বাড়বে। ভুল হলে ভয় পেয়ো না, ভুল থেকেই শেখা হয়।",
    "পদ্মা নদীর পানি বয়ে চলে সাগরের দিকে। নদীর মতো ধৈর্য ধরো। প্রতিদিন একটু একটু চেষ্টা করলে বড় সাফল্য আসে।",
    "বই পড়া খুব ভালো অভ্যাস। প্রতিদিন অন্তত দশ পাতা বই পড়ো। বই মনের জানালা খুলে দেয়।",
    "বৃষ্টির দিনে জানালার পাশে বসে চা খেতে ভালো লাগে। টিনের চালে বৃষ্টির শব্দ শুনতে কী যে মধুর লাগে।",
    "সকালে ঘুম থেকে উঠে দাঁত মেজে নাস্তা করো। তারপর পড়তে বসো। নিয়ম মেনে চললে শরীর ও মন ভালো থাকে।",
    "কঠিন কাজ দেখে ভয় পেয়ো না। ছোট ছোট ভাগে ভাগ করে নাও। এক এক করে শেষ করলে কাজ সহজ হয়ে যায়।",
  ],
  hi: [
    "रोज़ सुबह उठकर कुछ देर टाइपिंग का अभ्यास करो। धीरे-धीरे तुम्हारी गति बढ़ेगी। गलती से डरो मत, गलती से ही सीख मिलती है।",
    "गंगा नदी पहाड़ों से निकलकर सागर तक जाती है। नदी जैसा धैर्य रखो। रोज़ थोड़ा प्रयास करने से बड़ी सफलता मिलती है।",
    "किताबें पढ़ना बहुत अच्छी आदत है। रोज़ कम से कम दस पन्ने पढ़ो। किताबें मन की खिड़की खोल देती हैं।",
    "बारिश के दिन खिड़की के पास बैठकर चाय पीना अच्छा लगता है। पत्तों पर बारिश की बूंदें मोती जैसी चमकती हैं।",
    "सुबह उठकर दांत साफ़ करो और नाश्ता करो। फिर पढ़ने बैठो। नियम से चलने पर तन और मन स्वस्थ रहते हैं।",
    "मुश्किल काम से घबराओ मत। उसे छोटे-छोटे हिस्सों में बांट लो। एक-एक करके पूरा करने से काम आसान हो जाता है।",
  ],
};

export const WORDS: Record<Lang, string> = {
  en: "the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time just him know take people into year your good",
  bn: "আমি তুমি সে আমরা তোমরা তারা এই সেই কী কেন কখন কোথায় কিভাবে বই খাতা কলম পানি ভাত মাছ ফল গাছ ফুল পাখি আকাশ মাটি সূর্য চাঁদ দিন রাত সকাল বিকেল",
  hi: "मैं तुम वह हम तुम सब यह वह क्या क्यों कब कहाँ कैसे किताब पानी खाना घर स्कूल दोस्त दिन रात सुबह शाम सूरज चांद तारा पेड़ फूल नदी पहाड़",
};

export const QUOTES: Record<Lang, Array<{ text: string; author: string }>> = {
  en: [
    {
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
    },
    {
      text: "It always seems impossible until it is done.",
      author: "Nelson Mandela",
    },
    {
      text: "Well begun is half done.",
      author: "Aristotle",
    },
    {
      text: "The best way out is always through.",
      author: "Robert Frost",
    },
  ],
  bn: [
    { text: "চেষ্টা কখনো বৃথা যায় না। লেগে থাকো, সাফল্য আসবেই।", author: "টাইপরাশ" },
    { text: "আজকের পরিশ্রম আগামীর সাফল্য।", author: "টাইপরাশ" },
    { text: "ধৈর্যই সাফল্যের চাবি।", author: "টাইপরাশ" },
  ],
  hi: [
    { text: "कोशिश कभी बेकार नहीं जाती। लगे रहो, सफलता मिलेगी।", author: "टाइपरश" },
    { text: "आज की मेहनत कल की सफलता है।", author: "टाइपरश" },
    { text: "धैर्य ही सफलता की कुंजी है।", author: "टाइपरश" },
  ],
};
