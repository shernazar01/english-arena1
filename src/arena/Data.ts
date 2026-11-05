// @ts-nocheck
// English Arena: umumiy so'zlar bazasi va "takrorlanmaydigan" tanlagich.
// Yangi so'z qo'shish uchun: tegishli toifaga ["inglizcha", "o'zbekcha", "emoji"] qo'shing.
// MUHIM: emoji har so'zda noyob bo'lsin (rasmli o'yinlarda adashmaslik uchun).

const RAW = {
  hayvonlar: [
    ["cat", "mushuk", "🐱"], ["dog", "it", "🐶"], ["fish", "baliq", "🐟"], ["bird", "qush", "🐦"],
    ["horse", "ot", "🐴"], ["cow", "sigir", "🐄"], ["chicken", "tovuq", "🐔"], ["rabbit", "quyon", "🐰"],
    ["lion", "sher", "🦁"], ["monkey", "maymun", "🐵"], ["tiger", "yo'lbars", "🐯"], ["elephant", "fil", "🐘"],
    ["bear", "ayiq", "🐻"], ["pig", "cho'chqa", "🐷"], ["sheep", "qo'y", "🐑"], ["duck", "o'rdak", "🦆"],
    ["frog", "baqa", "🐸"], ["snake", "ilon", "🐍"], ["turtle", "toshbaqa", "🐢"], ["butterfly", "kapalak", "🦋"],
    ["bee", "asalari", "🐝"], ["spider", "o'rgimchak", "🕷️"], ["mouse", "sichqon", "🐭"], ["wolf", "bo'ri", "🐺"],
    ["fox", "tulki", "🦊"], ["panda", "panda", "🐼"], ["penguin", "pingvin", "🐧"], ["dolphin", "delfin", "🐬"],
    ["whale", "kit", "🐳"], ["octopus", "sakkizoyoq", "🐙"], ["camel", "tuya", "🐫"], ["giraffe", "jirafa", "🦒"],
    ["zebra", "zebra", "🦓"], ["owl", "boyqush", "🦉"], ["ant", "chumoli", "🐜"], ["crab", "qisqichbaqa", "🦀"],
    ["shark", "akula", "🦈"], ["eagle", "burgut", "🦅"], ["goat", "echki", "🐐"],
  ],
  taomlar: [
    ["apple", "olma", "🍎"], ["banana", "banan", "🍌"], ["bread", "non", "🍞"], ["milk", "sut", "🥛"],
    ["cake", "tort", "🍰"], ["pizza", "pitsa", "🍕"], ["egg", "tuxum", "🥚"], ["cheese", "pishloq", "🧀"],
    ["orange", "apelsin", "🍊"], ["lemon", "limon", "🍋"], ["grape", "uzum", "🍇"], ["watermelon", "tarvuz", "🍉"],
    ["strawberry", "qulupnay", "🍓"], ["cherry", "gilos", "🍒"], ["peach", "shaftoli", "🍑"], ["pear", "nok", "🍐"],
    ["carrot", "sabzi", "🥕"], ["potato", "kartoshka", "🥔"], ["tomato", "pomidor", "🍅"], ["corn", "makkajo'xori", "🌽"],
    ["onion", "piyoz", "🧅"], ["meat", "go'sht", "🥩"], ["rice", "guruch", "🍚"], ["soup", "sho'rva", "🍲"],
    ["cookie", "pechenye", "🍪"], ["honey", "asal", "🍯"], ["coffee", "qahva", "☕"], ["tea", "choy", "🍵"],
    ["juice", "sharbat", "🧃"], ["burger", "burger", "🍔"], ["salad", "salat", "🥗"], ["candy", "konfet", "🍬"],
    ["chocolate", "shokolad", "🍫"], ["pineapple", "ananas", "🍍"], ["coconut", "kokos", "🥥"], ["pepper", "qalampir", "🌶️"],
    ["mushroom", "qo'ziqorin", "🍄"], ["peanut", "yeryong'oq", "🥜"], ["salt", "tuz", "🧂"],
  ],
  ranglar: [
    ["red", "qizil", "🔴"], ["blue", "ko'k", "🔵"], ["green", "yashil", "🟢"], ["yellow", "sariq", "🟡"],
    ["purple", "binafsha", "🟣"], ["brown", "jigarrang", "🟤"], ["black", "qora", "⚫"], ["white", "oq", "⚪"],
  ],
  tabiat: [
    ["sun", "quyosh", "☀️"], ["moon", "oy", "🌙"], ["star", "yulduz", "⭐"], ["tree", "daraxt", "🌳"],
    ["flower", "gul", "🌸"], ["rose", "atirgul", "🌹"], ["rain", "yomg'ir", "🌧️"], ["snow", "qor", "❄️"],
    ["cloud", "bulut", "☁️"], ["rainbow", "kamalak", "🌈"], ["fire", "olov", "🔥"], ["water", "suv", "💧"],
    ["mountain", "tog'", "⛰️"], ["sea", "dengiz", "🌊"], ["wind", "shamol", "💨"], ["lightning", "chaqmoq", "⚡"],
    ["leaf", "barg", "🍃"], ["earth", "yer", "🌍"], ["desert", "cho'l", "🏜️"], ["island", "orol", "🏝️"],
    ["volcano", "vulqon", "🌋"], ["cactus", "kaktus", "🌵"], ["sunflower", "kungaboqar", "🌻"],
  ],
  buyumlar: [
    ["book", "kitob", "📚"], ["pencil", "qalam", "✏️"], ["clock", "soat", "⏰"], ["phone", "telefon", "📱"],
    ["door", "eshik", "🚪"], ["key", "kalit", "🔑"], ["bag", "sumka", "🎒"], ["scissors", "qaychi", "✂️"],
    ["computer", "kompyuter", "💻"], ["camera", "kamera", "📷"], ["lamp", "chiroq", "💡"], ["bed", "karavot", "🛏️"],
    ["chair", "stul", "🪑"], ["glasses", "ko'zoynak", "👓"], ["umbrella", "soyabon", "☂️"], ["ball", "to'p", "⚽"],
    ["gift", "sovg'a", "🎁"], ["bell", "qo'ng'iroq", "🔔"], ["candle", "sham", "🕯️"], ["map", "xarita", "🗺️"],
    ["flag", "bayroq", "🚩"], ["hammer", "bolg'a", "🔨"], ["guitar", "gitara", "🎸"], ["piano", "pianino", "🎹"],
    ["drum", "nog'ora", "🥁"], ["television", "televizor", "📺"], ["radio", "radio", "📻"], ["envelope", "konvert", "✉️"],
    ["ruler", "chizg'ich", "📏"], ["calendar", "taqvim", "📅"], ["medal", "medal", "🏅"], ["trophy", "kubok", "🏆"],
    ["crown", "toj", "👑"], ["diamond", "olmos", "💎"], ["money", "pul", "💰"], ["balloon", "shar", "🎈"],
    ["soap", "sovun", "🧼"], ["music", "musiqa", "🎵"],
  ],
  kiyim: [
    ["shoe", "poyabzal", "👟"], ["hat", "shlyapa", "🎩"], ["shirt", "ko'ylak", "👕"], ["dress", "libos", "👗"],
    ["pants", "shim", "👖"], ["sock", "paypoq", "🧦"], ["coat", "palto", "🧥"], ["glove", "qo'lqop", "🧤"],
    ["scarf", "sharf", "🧣"], ["ring", "uzuk", "💍"],
  ],
  transport: [
    ["car", "mashina", "🚗"], ["bus", "avtobus", "🚌"], ["train", "poyezd", "🚆"], ["plane", "samolyot", "✈️"],
    ["boat", "qayiq", "⛵"], ["bicycle", "velosiped", "🚲"], ["rocket", "raketa", "🚀"], ["helicopter", "vertolyot", "🚁"],
    ["taxi", "taksi", "🚕"], ["truck", "yuk mashinasi", "🚚"], ["tractor", "traktor", "🚜"], ["ship", "kema", "🚢"],
  ],
  joylar: [
    ["house", "uy", "🏠"], ["school", "maktab", "🏫"], ["hospital", "kasalxona", "🏥"], ["bridge", "ko'prik", "🌉"],
    ["castle", "qasr", "🏰"], ["tent", "chodir", "⛺"],
  ],
  tana: [
    ["eye", "ko'z", "👁️"], ["ear", "quloq", "👂"], ["nose", "burun", "👃"], ["mouth", "og'iz", "👄"],
    ["hand", "qo'l", "✋"], ["foot", "oyoq", "🦶"], ["heart", "yurak", "❤️"], ["brain", "miya", "🧠"],
    ["tongue", "til", "👅"], ["tooth", "tish", "🦷"], ["bone", "suyak", "🦴"],
  ],
  odamlar: [
    ["baby", "chaqaloq", "👶"], ["boy", "o'g'il bola", "👦"], ["girl", "qiz bola", "👧"], ["man", "erkak", "👨"],
    ["woman", "ayol", "👩"], ["king", "shoh", "🤴"], ["queen", "malika", "👸"], ["ghost", "sharpa", "👻"],
    ["robot", "robot", "🤖"], ["clown", "masxaraboz", "🤡"],
  ],
};

export const WORDS = Object.entries(RAW).flatMap(([cat, list]) =>
  list.map(([en, uz, e]) => ({ en, uz, e, cat }))
);

// [inglizcha gap, o'zbekcha tarjima]. Tinish belgisiz yoziladi.
export const SENTS = [
  ["I like apples", "Men olmani yaxshi ko'raman"], ["The cat is small", "Mushuk kichkina"],
  ["She has a red ball", "Uning qizil to'pi bor"], ["We play in the park", "Biz bog'da o'ynaymiz"],
  ["My dog can run", "Mening itim yugura oladi"], ["He reads a book", "U kitob o'qiydi"],
  ["The sun is hot", "Quyosh issiq"], ["I drink milk every day", "Men har kuni sut ichaman"],
  ["They are my friends", "Ular mening do'stlarim"], ["The bird can fly", "Qush ucha oladi"],
  ["I have a big house", "Mening katta uyim bor"], ["She is my mother", "U mening onam"],
  ["He is a good teacher", "U yaxshi o'qituvchi"], ["We go to school", "Biz maktabga boramiz"],
  ["The fish can swim", "Baliq suza oladi"], ["I eat bread and cheese", "Men non va pishloq yeyman"],
  ["The car is fast", "Mashina tez"], ["My brother has a bike", "Akamning velosipedi bor"],
  ["It is a sunny day", "Bugun quyoshli kun"], ["The apple is on the table", "Olma stol ustida"],
  ["I can see a bird", "Men qushni ko'ra olaman"], ["She likes to sing", "U qo'shiq aytishni yaxshi ko'radi"],
  ["They play football", "Ular futbol o'ynaydi"], ["Open the door", "Eshikni och"],
  ["Close your book", "Kitobingni yop"], ["What is your name", "Isming nima"],
  ["My name is Ali", "Mening ismim Ali"], ["How old are you", "Sen necha yoshdasan"],
  ["I am ten years old", "Men o'n yoshdaman"], ["Where do you live", "Sen qayerda yashaysan"],
  ["I live in Tashkent", "Men Toshkentda yashayman"], ["She drinks tea every morning", "U har ertalab choy ichadi"],
  ["We are in the classroom", "Biz sinfxonadamiz"], ["The teacher writes on the board", "O'qituvchi doskaga yozadi"],
  ["I have two cats", "Mening ikkita mushugim bor"], ["The flowers are beautiful", "Gullar chiroyli"],
  ["He is very tall", "U juda baland bo'yli"], ["My mother cooks dinner", "Onam kechki ovqat tayyorlaydi"],
  ["Birds sing in the morning", "Qushlar ertalab sayraydi"], ["It is cold in winter", "Qishda sovuq bo'ladi"],
  ["I wake up at seven", "Men soat yettida uyg'onaman"], ["Let us play a game", "Keling, o'yin o'ynaymiz"],
  ["The moon is bright tonight", "Bugun kechqurun oy yorqin"], ["She wears a blue dress", "U ko'k libos kiyadi"],
  ["We eat lunch at school", "Biz tushlikni maktabda qilamiz"], ["Do you like pizza", "Sen pitsani yoqtirasanmi"],
  ["I do my homework after school", "Men uy vazifamni maktabdan keyin bajaraman"],
  ["He plays the guitar well", "U gitarada yaxshi chaladi"], ["The train arrives at noon", "Poyezd tush paytida keladi"],
  ["Reading makes us smart", "O'qish bizni aqlli qiladi"],
];

/* ---------- yordamchilar ---------- */

// To'g'ri aralashtirish (Fisher–Yates). Eski sort(random) notekis aralashtirardi.
export const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/* Takrorlanmaslik xotirasi: oxirgi ishlatilgan elementlar eslab qolinadi (brauzerda saqlanadi).
   Yangi o'yinda avval HALI KO'RILMAGANLAR olinadi; hammasi tugasa eng eskilaridan boshlanadi. */
const HKEY = "english-arena-seen-v2";
let memo = {};
const readAll = () => { try { return JSON.parse(localStorage.getItem(HKEY)) || {}; } catch (e) { return {}; } };
const getHist = (ns) => readAll()[ns] || memo[ns] || [];
const saveHist = (ns, list) => {
  memo[ns] = list;
  try { const h = readAll(); h[ns] = list; localStorage.setItem(HKEY, JSON.stringify(h)); } catch (e) {}
};

export function fresh(pool, n, ns, idOf, filter) {
  const cand = shuffle(filter ? pool.filter(filter) : pool);
  const hist = getHist(ns);
  const pos = new Map(hist.map((id, i) => [id, i]));
  const unseen = cand.filter((x) => !pos.has(idOf(x)));
  const seen = cand.filter((x) => pos.has(idOf(x))).sort((a, b) => pos.get(idOf(a)) - pos.get(idOf(b)));
  const out = [...unseen, ...seen].slice(0, n);
  const ids = out.map(idOf);
  saveHist(ns, [...hist.filter((id) => !ids.includes(id)), ...ids].slice(-Math.floor(pool.length * 0.75)));
  return out;
}

export const freshWords = (n, filter) => fresh(WORDS, n, "w", (x) => x.en, filter);
export const freshSents = (n) => fresh(SENTS, n, "s", (x) => x[0]);

// 4 ta variant (1 ta to'g'ri + 3 ta noto'g'ri)
export const options = (w) => shuffle([w, ...shuffle(WORDS.filter((x) => x.en !== w.en)).slice(0, 3)]);

// Bitta elementni tasodifiy tanlash
export const oneOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
