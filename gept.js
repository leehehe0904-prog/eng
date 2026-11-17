// =============================================
//  全民英檢初級 (GEPT Elementary) 題庫
//  題型參考英檢初級：
//   初試 聽力：看圖辨義、問答、簡短對話、短文聽解
//   初試 閱讀：詞彙、段落填空、閱讀理解
//   複試 寫作：句子改寫、句子合併、重組、段落寫作
//   複試 口說：複誦、朗讀、回答問題
//  題目為練習用的自編題，正式題數與計分以 LTTC 官方公告為準。
//  a = 正確答案的位置（從 0 開始：0=A, 1=B, 2=C, 3=D）
// =============================================

// ---------- 英檢初級常用單字（會當成一個「年級」使用所有遊戲） ----------
GRADES.gept = {
  name: '英檢初級單字', icon: '🎓', color: '#e64980', theme: '頻率・地點・時間・季節・方向・形容詞',
  words: [
    ['always', '總是', '🔁'], ['usually', '通常', '📆'], ['sometimes', '有時候', '🎲'], ['never', '從不', '🚫'],
    ['borrow', '借入', '📥'], ['return', '歸還', '📤'], ['ticket', '票', '🎫'], ['station', '車站', '🚉'],
    ['cousin', '表/堂兄弟姊妹', '🧒'], ['neighbor', '鄰居', '🏘️'], ['weather', '天氣', '🌦️'], ['vacation', '假期', '🏝️'],
    ['practice', '練習', '🎯'], ['exercise', '運動', '🏋️'], ['healthy', '健康的', '💪'], ['sick', '生病的', '🤒'],
    ['medicine', '藥', '💊'], ['dentist', '牙醫', '🦷'], ['bakery', '麵包店', '🥐'], ['bookstore', '書店', '📚'],
    ['menu', '菜單', '📋'], ['price', '價格', '💲'], ['present', '禮物', '🎁'], ['invite', '邀請', '💌'],
    ['party', '派對', '🥳'], ['busy', '忙碌的', '⏳'], ['early', '早的', '🐓'], ['late', '晚的；遲的', '🐢'],
    ['quiet', '安靜的', '🤫'], ['noisy', '吵鬧的', '📢'], ['careful', '小心的', '🦺'], ['remember', '記得', '🧠'],
    ['forget', '忘記', '🤔'], ['question', '問題', '❔'], ['subject', '科目', '📘'], ['science', '自然科學', '🔬'],
    ['history', '歷史', '📜'], ['map', '地圖', '🗺️'], ['corner', '轉角', '↪️'], ['left', '左邊', '⬅️'],
    ['right', '右邊', '➡️'], ['straight', '直直地', '⬆️'], ['minute', '分鐘', '⏱️'], ['hour', '小時', '🕐'],
    ['week', '星期；週', '📅'], ['month', '月', '🗓️'], ['spring', '春天', '🌷'], ['summer', '夏天', '🏖️'],
    ['fall', '秋天', '🍂'], ['winter', '冬天', '⛄'],
  ],
  sentences: [
    ['I always get up at six.', '我總是六點起床。'],
    ['She usually walks to school.', '她通常走路去上學。'],
    ['Can I borrow your pen?', '我可以跟你借筆嗎？'],
    ['Please return the book on Monday.', '請在星期一還書。'],
    ['Turn left at the corner.', '在轉角左轉。'],
    ['The train station is near my house.', '火車站在我家附近。'],
    ['Be careful when you cross the street.', '過馬路時要小心。'],
    ['My cousin is busy this week.', '我表哥這星期很忙。'],
    ["Don't forget to bring your ticket.", '別忘了帶你的票。'],
    ['Winter is colder than fall.', '冬天比秋天冷。'],
    ['We have science class on Friday.', '我們星期五有自然課。'],
    ['Eating vegetables keeps you healthy.', '吃蔬菜讓你保持健康。'],
  ],
  dialogues: [
    {
      title: '口說面試：自我介紹', icon: '🙋', turns: [
        { ai: "Hello. What's your name?", zh: '你好。你叫什麼名字？', keys: ['*'], cap: true, ex: ['My name is Amy Chen.', "I'm Kevin Lin."] },
        { ai: 'Nice to meet you, {name}. How old are you?', zh: '很高興認識你。你幾歲？', keys: NUMS.concat(['years', 'old']), ex: ["I'm twelve years old."] },
        { ai: 'What do you like to do in your free time?', zh: '你空閒時喜歡做什麼？', keys: ['*'], ex: ['I like to read comic books.', 'I like to play basketball with my friends.'] },
        { ai: 'Why do you study English?', zh: '你為什麼學英文？', keys: ['*'], ex: ['Because I want to travel around the world.', 'Because English is very useful.'] },
        { ai: 'What did you do last weekend?', zh: '你上週末做了什麼？', keys: ['went', 'played', 'watched', 'visited', 'stayed', 'read', 'ate', 'did', 'had', 'helped', 'studied', 'was'], ex: ['I went to the beach with my family.', 'I stayed home and watched TV.'] },
      ],
    },
    {
      title: '問路', icon: '🗺️', turns: [
        { ai: 'Excuse me. Is there a post office near here?', zh: '不好意思，這附近有郵局嗎？', keys: ['yes', 'no', 'there is', 'near'], ex: ['Yes, there is one on Park Road.'] },
        { ai: 'How can I get there?', zh: '我要怎麼去那裡？', keys: ['go', 'turn', 'walk', 'left', 'right', 'straight', 'take'], ex: ['Go straight and turn left at the corner.'] },
        { ai: 'Is it far from here?', zh: '離這裡遠嗎？', keys: ['yes', 'no', 'far', 'minute', 'near', 'close'], ex: ["No, it's about five minutes on foot."] },
        { ai: 'Thank you very much!', zh: '非常謝謝你！', keys: ['welcome', 'no problem', 'problem'], ex: ["You're welcome."] },
      ],
    },
  ],
};

const GEPT = {
  // ---------- 聽力 第一部分：看圖辨義 ----------
  listenPic: [
    { pic: '👦⚽🌳', q: 'What is the boy doing?', opts: ['He is playing soccer in the park.', 'He is reading in the library.', 'He is sleeping in his bed.'], a: 0 },
    { pic: '🕢', q: 'What time is it?', opts: ["It's seven o'clock.", "It's seven thirty.", "It's eight thirty."], a: 1 },
    { pic: '🌧️☂️👧', q: 'How is the weather?', opts: ["It's sunny and hot.", "It's raining.", "It's snowing."], a: 1 },
    { pic: '🍎🍎🍎 🍌🍌', q: 'How many apples are there?', opts: ['There are two.', 'There are three.', 'There are five.'], a: 1 },
    { pic: '👩‍🍳🍳', q: 'What does the woman do?', opts: ['She is a cook.', 'She is a nurse.', 'She is a bus driver.'], a: 0 },
    { pic: '👧🚌🏫', q: 'How does the girl go to school?', opts: ['By bike.', 'On foot.', 'By bus.'], a: 2 },
    { pic: '🎂🎁🥳', q: 'What are they doing?', opts: ['They are having a birthday party.', 'They are doing their homework.', 'They are taking a test.'], a: 0 },
    { pic: '👕 $120', q: 'How much is the T-shirt?', opts: ["It's one hundred and twelve dollars.", "It's one hundred and twenty dollars.", "It's two hundred dollars."], a: 1 },
    { pic: '👨‍⚕️🤒🛏️', q: 'Where is the boy?', opts: ['He is in the hospital.', 'He is at the bakery.', 'He is at the zoo.'], a: 0 },
    { pic: '🏊‍♀️🌊☀️', q: 'What is the woman doing?', opts: ['She is cooking.', 'She is swimming.', 'She is singing.'], a: 1 },
    { pic: '🐱🛋️', q: 'Where is the cat?', opts: ['It is on the sofa.', 'It is in the box.', 'It is under the tree.'], a: 0 },
    { pic: '👨‍🦳📖👓', q: 'What is the old man doing?', opts: ['He is writing a letter.', 'He is reading a book.', 'He is watching TV.'], a: 1 },
  ],

  // ---------- 聽力 第二部分：問答 ----------
  listenQA: [
    { q: 'Where do you live?', opts: ['I live in Taipei.', "I'm twelve years old.", 'I like it very much.'], a: 0 },
    { q: 'How often do you play basketball?', opts: ['With my brother.', 'Twice a week.', 'At the park.'], a: 1 },
    { q: 'Would you like some more cake?', opts: ["No, thanks. I'm full.", 'Yes, it is.', 'I like cats.'], a: 0 },
    { q: "What's wrong with you?", opts: ["I'm fine, and you?", 'I have a bad cold.', "That's right."], a: 1 },
    { q: 'Thank you for the present.', opts: ["You're welcome.", 'Here you are.', 'Yes, please.'], a: 0 },
    { q: 'Whose bag is this?', opts: ["It's blue.", "It's Mary's.", "It's on the desk."], a: 1 },
    { q: 'When did you get up this morning?', opts: ['At six thirty.', 'In the kitchen.', 'For two hours.'], a: 0 },
    { q: 'May I use your pen?', opts: ['Sure, go ahead.', "No, I'm not.", "It's a pen."], a: 0 },
    { q: 'How long does it take to get to school?', opts: ['By bus.', 'About ten minutes.', 'At eight.'], a: 1 },
    { q: "Let's go to the movies tonight.", opts: ['Good idea!', 'Yes, I did.', "It's ten dollars."], a: 0 },
    { q: 'What does your father do?', opts: ['He is reading.', 'He is a police officer.', 'He is tall.'], a: 1 },
    { q: 'Is this seat taken?', opts: ['No, you can sit here.', 'Yes, I can take it.', "It's a chair."], a: 0 },
    { q: 'Which do you like better, tea or coffee?', opts: ['Yes, I do.', 'Tea, please.', 'Very much.'], a: 1 },
    { q: 'Why were you late for school?', opts: ['Because I missed the bus.', 'At eight o\'clock.', 'I go to school by bus.'], a: 0 },
  ],

  // ---------- 聽力 第三部分：簡短對話 ----------
  listenDialog: [
    { lines: [['W', 'Are you free this Saturday?'], ['M', "Yes. What's up?"], ['W', "Let's go to the zoo together."], ['M', 'Great idea!']], q: 'What will they do on Saturday?', opts: ['Go to the zoo.', 'Go to the movies.', 'Stay at home.'], a: 0 },
    { lines: [['M', 'Excuse me. Where is the post office?'], ['W', "Go straight and turn left at the corner. It's next to the bank."]], q: 'Where is the post office?', opts: ['Next to the school.', 'Next to the bank.', 'Across from the park.'], a: 1 },
    { lines: [['W', 'How much are these socks?'], ['M', 'They are fifty dollars a pair.'], ['W', "OK. I'll take two pairs."]], q: 'How much will the woman pay?', opts: ['Fifty dollars.', 'Seventy dollars.', 'One hundred dollars.'], a: 2 },
    { lines: [['M', 'You look tired, Amy.'], ['W', 'I went to bed late last night. I studied for the math test.']], q: 'Why is Amy tired?', opts: ['She played games all night.', 'She studied late.', 'She was sick.'], a: 1 },
    { lines: [['W', 'What would you like to drink?'], ['M', "I'd like a cup of hot tea, please."], ['W', 'Sure.']], q: 'What does the man want?', opts: ['Coffee.', 'Hot tea.', 'Orange juice.'], a: 1 },
    { lines: [['M', 'Did you watch the basketball game yesterday?'], ['W', "No, I didn't. I had to help my mom clean the house."]], q: 'What did the woman do yesterday?', opts: ['She watched a game.', 'She played basketball.', 'She cleaned the house.'], a: 2 },
    { lines: [['W', 'When does the train leave?'], ['M', 'At ten fifteen. We still have twenty minutes.']], q: 'What time is it now?', opts: ['It is nine fifty-five.', 'It is ten fifteen.', 'It is ten thirty-five.'], a: 0 },
    { lines: [['M', 'Happy birthday, Lisa! This is for you.'], ['W', 'Wow, a storybook! Thank you so much.']], q: 'What did Lisa get?', opts: ['A storybook.', 'A cake.', 'A doll.'], a: 0 },
    { lines: [['W', 'Is your brother older than you?'], ['M', "No, he's two years younger. He's ten."]], q: 'How old is the man?', opts: ['Eight.', 'Ten.', 'Twelve.'], a: 2 },
    { lines: [['M', 'Mom, can I play outside?'], ['W', 'Finish your homework first, and then you can go.']], q: 'What does the boy have to do first?', opts: ['Play outside.', 'Do his homework.', 'Eat dinner.'], a: 1 },
    { lines: [['W', 'Can I help you?'], ['M', "Yes. I'm looking for a jacket for my son."], ['W', 'How about this blue one?']], q: 'Where are they?', opts: ['In a clothes store.', 'In a restaurant.', 'In a library.'], a: 0 },
  ],

  // ---------- 聽力 第四部分：短文聽解（選圖） ----------
  listenTalk: [
    { talk: "Good morning, everyone. Here is the weather report. Today is sunny, but tomorrow it will rain all day. Don't forget to bring your umbrella tomorrow.", q: 'What will the weather be like tomorrow?', opts: ['☀️', '🌧️', '❄️'], a: 1 },
    { talk: "Hi, I'm Kevin. Every Sunday morning, I go swimming with my dad. In the afternoon, I usually read comic books at home.", q: 'What does Kevin do on Sunday morning?', opts: ['📚', '🏊', '🚴'], a: 1 },
    { talk: 'Attention, please. The library will close at five p.m. today. Please return your books before then. Thank you.', q: 'Where is the speaker?', opts: ['🏥', '📚', '🛒'], a: 1 },
    { talk: 'My favorite animal is very big and gray. It has a long nose and big ears.', q: 'Which animal is the speaker talking about?', opts: ['🦒', '🐘', '🦓'], a: 1 },
    { talk: "Tom's mom made dinner tonight. She cooked fish and soup, but Tom only wanted noodles. So his dad made him a bowl of noodles.", q: 'What did Tom eat for dinner?', opts: ['🐟', '🍜', '🍕'], a: 1 },
    { talk: 'Welcome to our store! Today, all shoes are on sale. Buy one pair and get one free. The sale ends at nine tonight.', q: 'What is on sale today?', opts: ['👟', '👕', '🎒'], a: 0 },
  ],

  // ---------- 閱讀 第一部分：詞彙 ----------
  readVocab: [
    { q: 'My sister ______ to school every day.', opts: ['walk', 'walks', 'walking', 'walked'], a: 1, ex: '主詞 my sister 是第三人稱單數，現在式動詞要加 s。' },
    { q: 'There ______ many people in the park yesterday.', opts: ['is', 'are', 'was', 'were'], a: 3, ex: 'yesterday 是過去式，many people 是複數，用 were。' },
    { q: "I'm hungry. Can I have ______ bread?", opts: ['some', 'many', 'a', 'few'], a: 0, ex: 'bread 不可數；請求時用 some。' },
    { q: 'Tom is ______ than his brother.', opts: ['tall', 'taller', 'tallest', 'more tall'], a: 1, ex: '看到 than 用比較級：tall → taller。' },
    { q: "Please ______ the window. It's cold outside.", opts: ['open', 'close', 'clean', 'break'], a: 1, ex: '外面很冷，所以要「關」窗 close。' },
    { q: 'I want to eat ______ orange.', opts: ['a', 'an', 'two', 'many'], a: 1, ex: 'orange 是母音開頭，用 an。' },
    { q: 'My birthday is ______ May.', opts: ['on', 'at', 'in', 'for'], a: 2, ex: '月份前面用 in（in May）；日期用 on（on May 5th）。' },
    { q: 'Be ______! The floor is wet.', opts: ['careful', 'careless', 'happy', 'quiet'], a: 0, ex: '地板濕濕的，要小心 careful。' },
    { q: "How ______ is this T-shirt? It's 300 dollars.", opts: ['many', 'much', 'old', 'long'], a: 1, ex: '問價錢用 How much。' },
    { q: 'I usually ______ my teeth before I go to bed.', opts: ['wash', 'brush', 'cut', 'eat'], a: 1, ex: '刷牙是 brush my teeth。' },
    { q: "Ken doesn't like milk, ______ he likes juice.", opts: ['and', 'but', 'so', 'or'], a: 1, ex: '前後意思相反（不喜歡／喜歡），用 but。' },
    { q: 'The movie was very ______. Everyone laughed.', opts: ['boring', 'funny', 'sad', 'scary'], a: 1, ex: '大家都笑了，所以電影很好笑 funny。' },
    { q: "Don't ______ late for class.", opts: ['is', 'be', 'are', 'being'], a: 1, ex: "Don't 後面接原形動詞，be 動詞原形是 be。" },
    { q: 'Look! The children ______ in the river.', opts: ['swim', 'swims', 'are swimming', 'swam'], a: 2, ex: '看到 Look! 表示「正在」，用現在進行式 are swimming。' },
    { q: 'We ______ to Kenting last summer.', opts: ['go', 'goes', 'went', 'will go'], a: 2, ex: 'last summer 是過去時間，用過去式 went。' },
    { q: 'This is ______ book. Please give it to her.', opts: ['she', 'her', 'hers', 'herself'], a: 1, ex: '名詞 book 前面用所有格 her。' },
    { q: 'I will call you when I ______ home.', opts: ['get', 'got', 'will get', 'getting'], a: 0, ex: 'when 引導的時間子句用現在式代替未來式。' },
    { q: 'Mary is good ______ drawing.', opts: ['in', 'on', 'at', 'for'], a: 2, ex: '擅長某事：be good at。' },
  ],

  // ---------- 閱讀 第二部分：段落填空 ----------
  readCloze: [
    {
      title: 'A Letter to Grandma',
      text: 'Dear Grandma,\nThank you for the birthday present. I [1] the red sweater very much. It is warm, and it [2] me well. Last Sunday, Mom and I [3] to the park. I wore the sweater, and my friends said it was beautiful. I hope I can [4] you soon.\nLove,\nAmy',
      blanks: [
        { opts: ['like', 'likes', 'liking', 'to like'], a: 0, ex: '主詞 I，現在式用原形 like。' },
        { opts: ['fit', 'fits', 'fitting', 'is fit'], a: 1, ex: '主詞 it 第三人稱單數，fit 要加 s。' },
        { opts: ['go', 'goes', 'went', 'going'], a: 2, ex: 'Last Sunday 是過去，用 went。' },
        { opts: ['see', 'saw', 'seeing', 'sees'], a: 0, ex: 'can 後面接原形動詞 see。' },
      ],
    },
    {
      title: "Peter's Dog",
      text: 'Peter has a dog [1] Lucky. Lucky is three years old. Every morning, Peter takes Lucky [2] a walk. Lucky likes to run and play [3] other dogs. Peter thinks Lucky is his [4] friend.',
      blanks: [
        { opts: ['name', 'named', 'naming', 'names'], a: 1, ex: 'a dog named Lucky = 一隻名叫 Lucky 的狗。' },
        { opts: ['for', 'at', 'on', 'of'], a: 0, ex: '帶狗去散步：take ... for a walk。' },
        { opts: ['to', 'with', 'by', 'from'], a: 1, ex: '和……一起玩：play with。' },
        { opts: ['good', 'better', 'best', 'well'], a: 2, ex: '「最好的」朋友用最高級 best。' },
      ],
    },
    {
      title: 'Night Markets',
      text: 'Taiwan has many night markets. People [1] go there in the evening to eat and shop. You can [2] many kinds of food, like stinky tofu and bubble tea. The food is delicious and [3] cheap. Many tourists [4] night markets because they are fun.',
      blanks: [
        { opts: ['usual', 'usually', 'use', 'used'], a: 1, ex: '修飾動詞 go 要用副詞 usually。' },
        { opts: ['find', 'found', 'finds', 'finding'], a: 0, ex: 'can 後面接原形動詞。' },
        { opts: ['no', 'not', 'very', 'many'], a: 2, ex: 'very cheap = 很便宜。' },
        { opts: ['loves', 'love', 'loving', 'to love'], a: 1, ex: '主詞 tourists 是複數，用原形 love。' },
      ],
    },
    {
      title: 'A Rainy Day',
      text: 'It was raining [1] I left home this morning. I forgot [2] my umbrella, so I got wet. When I got to school, my friend Ben gave me a towel. He is always [3] to me. After school, we walked home [4] under his umbrella.',
      blanks: [
        { opts: ['when', 'what', 'where', 'who'], a: 0, ex: '「當……的時候」用 when。' },
        { opts: ['take', 'took', 'to take', 'taking'], a: 2, ex: 'forget to + 原形 = 忘記去做某事。' },
        { opts: ['kind', 'kindly', 'kindness', 'kinds'], a: 0, ex: 'be 動詞後面接形容詞 kind。' },
        { opts: ['together', 'alone', 'never', 'ago'], a: 0, ex: '兩人一起走回家：together。' },
      ],
    },
  ],

  // ---------- 閱讀 第三部分：閱讀理解 ----------
  readComp: [
    {
      title: 'City Swimming Pool',
      text: 'City Swimming Pool\nOpen: Tuesday – Sunday, 9:00 a.m. – 8:00 p.m.\nClosed on Mondays\nTickets: Adults $100 / Children (under 12) $50\n* Please wear a swimming cap.',
      qs: [
        { q: 'When is the pool closed?', opts: ['On Sundays.', 'On Mondays.', 'On Tuesdays.', 'Every evening.'], a: 1 },
        { q: 'Mr. Lin and his 8-year-old son want to swim. How much will they pay?', opts: ['$100', '$150', '$200', '$50'], a: 1 },
        { q: 'What must people wear?', opts: ['A hat.', 'Shoes.', 'A swimming cap.', 'Glasses.'], a: 2 },
      ],
    },
    {
      title: "Joe's Breakfast",
      text: "Joe's Breakfast\nSandwich .......... $40\nHamburger ......... $55\nEgg pancake ....... $35\nMilk tea .......... $25\nOrange juice ...... $30\n★ Any food + any drink: $10 off!",
      qs: [
        { q: 'How much is a hamburger with an orange juice?', opts: ['$85', '$75', '$95', '$65'], a: 1 },
        { q: 'Which food is the cheapest?', opts: ['Sandwich.', 'Hamburger.', 'Egg pancake.', 'Milk tea.'], a: 2 },
      ],
    },
    {
      title: 'An Invitation',
      text: "Hi Jenny,\nI'm going to have a party at my house this Saturday afternoon. It's my brother's 10th birthday. We will have pizza, cake and games. Can you come? Please call me before Friday.\nYour friend,\nLily",
      qs: [
        { q: 'Why is Lily having a party?', opts: ["It's her birthday.", "It's her brother's birthday.", "It's Jenny's birthday.", "It's Christmas."], a: 1 },
        { q: 'When is the party?', opts: ['Friday afternoon.', 'Saturday morning.', 'Saturday afternoon.', 'Sunday afternoon.'], a: 2 },
        { q: 'What should Jenny do before Friday?', opts: ['Buy a cake.', 'Call Lily.', 'Make pizza.', 'Write a card.'], a: 1 },
      ],
    },
    {
      title: 'Ben Loves Animals',
      text: 'Ben loves animals. He has two cats and a bird. Every day after school, he feeds them and cleans their home. On weekends, he helps at an animal hospital near his house. He wants to be an animal doctor in the future.',
      qs: [
        { q: 'How many pets does Ben have?', opts: ['Two.', 'Three.', 'Four.', 'One.'], a: 1 },
        { q: 'What does Ben do on weekends?', opts: ['He plays with friends.', 'He helps at an animal hospital.', 'He goes to the zoo.', 'He buys a new pet.'], a: 1 },
        { q: 'What does Ben want to be?', opts: ['A teacher.', 'A farmer.', 'An animal doctor.', 'A cook.'], a: 2 },
      ],
    },
    {
      title: 'Class Schedule',
      text: 'Class 5-2 — Wednesday\n08:40  English\n09:30  Math\n10:30  Science\n11:20  P.E. (Bring your sports shoes!)\n12:00  Lunch\n13:30  Music',
      qs: [
        { q: 'What class is after Math?', opts: ['English.', 'Science.', 'P.E.', 'Music.'], a: 1 },
        { q: 'What do students need for P.E.?', opts: ['A book.', 'A lunch box.', 'Sports shoes.', 'A piano.'], a: 2 },
      ],
    },
  ],

  // ---------- 寫作 第一部分：句子改寫 ----------
  rewrite: [
    { s: 'He is a student.', task: '改成問句', ans: ['Is he a student?'] },
    { s: 'Mary likes apples.', task: '改成否定句', ans: ["Mary doesn't like apples."] },
    { s: 'They play basketball every day.', task: '改成問句（Do...?）', ans: ['Do they play basketball every day?'] },
    { s: 'I go to school by bus.', task: '加上 yesterday，改成過去式', ans: ['I went to school by bus yesterday.', 'Yesterday I went to school by bus.', 'Yesterday, I went to school by bus.'] },
    { s: 'Tom is reading a book.', task: '用 What 開頭問「Tom 在讀什麼？」', ans: ['What is Tom reading?'] },
    { s: 'She can swim.', task: '改成問句', ans: ['Can she swim?'] },
    { s: 'There is a cat under the table.', task: '改成問句', ans: ['Is there a cat under the table?'] },
    { s: 'He has a sister.', task: '改成否定句', ans: ["He doesn't have a sister."] },
    { s: 'We are watching TV.', task: '主詞改成 My brother', ans: ['My brother is watching TV.'] },
    { s: 'The boy is tall.', task: '主詞改成 The boys', ans: ['The boys are tall.'] },
    { s: 'I will visit my grandma.', task: '主詞改成 Linda', ans: ['Linda will visit her grandma.'] },
    { s: 'He went to the park.', task: '改成問句（Did...?）', ans: ['Did he go to the park?'] },
  ],

  // ---------- 寫作 第一部分：句子合併 ----------
  combine: [
    { a: 'I was tired.', b: 'I went to bed early.', hint: 'so', ans: ['I was tired, so I went to bed early.'] },
    { a: 'I like dogs.', b: 'My sister likes cats.', hint: 'but', ans: ['I like dogs, but my sister likes cats.'] },
    { a: 'Tom is tall.', b: 'Ben is taller.', hint: 'than（用 Ben 開頭）', ans: ['Ben is taller than Tom.'] },
    { a: 'She stayed home.', b: 'She was sick.', hint: 'because', ans: ['She stayed home because she was sick.'] },
    { a: 'I have a friend.', b: 'He lives in Tainan.', hint: 'who', ans: ['I have a friend who lives in Tainan.'] },
    { a: 'I was eating dinner.', b: 'My dad came home.', hint: 'when', ans: ['I was eating dinner when my dad came home.', 'When my dad came home, I was eating dinner.'] },
    { a: 'Do you want tea?', b: 'Do you want coffee?', hint: 'or', ans: ['Do you want tea or coffee?'] },
    { a: 'My mom is a nurse.', b: 'My aunt is a nurse.', hint: 'Both ... and ...', ans: ['Both my mom and my aunt are nurses.', 'My mom and my aunt are both nurses.'] },
    { a: 'It is raining.', b: 'We can\'t play outside.', hint: 'so', ans: ["It is raining, so we can't play outside."] },
    { a: 'Kevin plays the piano.', b: 'Kevin plays the guitar.', hint: 'and', ans: ['Kevin plays the piano and the guitar.', 'Kevin plays the piano and plays the guitar.'] },
  ],

  // ---------- 寫作 第一部分：重組（積木） ----------
  reorder: [
    { pre: 'Mary', post: '.', parts: ['likes', 'to', 'read', 'books'] },
    { pre: 'What', post: '?', parts: ['are', 'you', 'eating'] },
    { pre: 'My father', post: '.', parts: ['works', 'in', 'a', 'hospital'] },
    { pre: 'How', post: '?', parts: ['do', 'you', 'go', 'to school'] },
    { pre: 'There', post: '.', parts: ['are', 'thirty', 'students', 'in my class'] },
    { pre: 'Can', post: '?', parts: ['you', 'help', 'me'] },
    { pre: 'It', post: '.', parts: ['is', 'going', 'to', 'rain'] },
    { pre: 'Where', post: '?', parts: ['did', 'you', 'go', 'last weekend'] },
    { pre: 'This', post: '.', parts: ['is', 'the', 'most', 'interesting', 'book'] },
    { pre: 'Please', post: '.', parts: ['turn', 'off', 'the', 'lights'] },
    { pre: 'I', post: '.', parts: ['have', 'never', 'been', 'to Japan'] },
    { pre: 'Who', post: '?', parts: ['is', 'the', 'girl', 'in red'] },
  ],

  // ---------- 寫作 第二部分：段落寫作（看圖） ----------
  paragraph: [
    {
      panels: ['🌅⏰👦', '🚲🏫', '⚽👫'], title: "Tom's Day", task: '請根據三張圖片，寫一篇約 50 字的短文，描述 Tom 的一天。',
      words: ['get up', 'ride a bike', 'school', 'play soccer', 'friends'],
      sample: 'Tom gets up at six thirty every morning. He eats breakfast with his family. Then he rides his bike to school. After school, he plays soccer with his friends in the park. He has a lot of fun, and he is very happy.',
    },
    {
      panels: ['🧹🏠', '🛒🍎', '🍳👨‍👩‍👧'], title: "Amy's Sunday", task: '上週日 Amy 和家人做了什麼？請根據圖片寫一篇約 50 字的短文（用過去式）。',
      words: ['clean', 'house', 'supermarket', 'buy', 'cook', 'dinner'],
      sample: 'Last Sunday, Amy and her family cleaned the house in the morning. In the afternoon, they went to the supermarket and bought some apples and vegetables. In the evening, Amy helped her mom cook dinner. They had a wonderful day together.',
    },
    {
      panels: ['🎂🎁', '🕯️🍰', '🥳👫'], title: 'A Birthday Party', task: '請根據圖片，寫一篇約 50 字的短文，描述一場生日派對。',
      words: ['birthday', 'present', 'candles', 'cake', 'sing', 'happy'],
      sample: "Yesterday was Ken's birthday. His friends came to his house and gave him many presents. There were ten candles on the big cake. Everyone sang \"Happy Birthday\" to him. Then they ate cake and played games. Ken was very happy.",
    },
    {
      panels: ['🌧️🏫', '👦😟', '👧☂️🤝'], title: 'A Rainy Day', task: '請根據圖片，寫一篇約 50 字的短文，描述下雨天發生的事。',
      words: ['rain', 'forget', 'umbrella', 'worried', 'share', 'kind'],
      sample: 'It rained after school yesterday. Ben forgot to bring his umbrella, so he was worried. He did not know how to go home. Then his classmate Jenny came. She shared her umbrella with him, and they walked home together. Ben thanked her because she was very kind.',
    },
    {
      panels: ['🏖️☀️', '🏊👨‍👩‍👦', '🍉😋'], title: 'Summer Vacation', task: '請根據圖片，寫一篇約 50 字的短文，描述暑假去海邊的經驗。',
      words: ['summer vacation', 'beach', 'swim', 'family', 'watermelon', 'hot'],
      sample: 'Last summer vacation, I went to the beach with my family. It was sunny and very hot. My dad and I swam in the sea, and my mom took many pictures. After that, we ate some cold watermelon. It was delicious. I want to go there again next year.',
    },
  ],

  // ---------- 口說 第一部分：複誦 ----------
  repeat: [
    "I'm going to the library.",
    'What time does the movie start?',
    'My brother is good at math.',
    'Please turn off the lights.',
    "It's a beautiful day today.",
    'Where did you buy that hat?',
    'We had a great time at the beach.',
    'I usually take the bus to school.',
    'Could you tell me the way to the station?',
    'She is the tallest girl in our class.',
    "Don't forget to bring your umbrella.",
    'How many books did you read last month?',
    'My mother is cooking in the kitchen.',
    'Would you like something to drink?',
  ],

  // ---------- 口說 第二部分：朗讀 ----------
  readAloud: [
    { title: 'My Best Friend', text: 'My best friend is Lisa. She is tall and has long hair. We are in the same class. We often play badminton after school. She is kind and always helps me with my homework.' },
    { title: 'A Busy Morning', text: 'Every morning, I get up at six thirty. I brush my teeth and wash my face. Then I eat breakfast with my family. At seven twenty, I walk to school with my sister.' },
    { title: 'The Weekend', text: 'Last weekend, my family went to the mountains. The air was fresh and the trees were green. We had a picnic by the river. It was a wonderful day.' },
    { title: 'Healthy Life', text: 'It is important to stay healthy. We should eat more fruit and vegetables. We should also exercise every day and go to bed early. Then we will feel great.' },
    { title: 'My Pet', text: "I have a little dog. His name is Coco. He is white and very cute. Every evening, I take him for a walk in the park. He likes to run and play with balls." },
  ],

  // ---------- 口說 第三部分：回答問題 ----------
  answer: [
    { q: 'What do you usually do on weekends?', zh: '你週末通常做什麼？', samples: ['I usually go to the park with my family.', 'I often read books and play video games on weekends.'] },
    { q: "What's your favorite season? Why?", zh: '你最喜歡哪個季節？為什麼？', samples: ['My favorite season is summer because I can go swimming.', 'I like winter because it is cool and I can eat hot pot.'] },
    { q: 'Please tell me about your best friend.', zh: '請說說你最好的朋友。', samples: ['My best friend is Tom. He is funny and we play basketball together.'] },
    { q: 'How do you go to school every day?', zh: '你每天怎麼去上學？', samples: ['I go to school by bus.', 'My mom takes me to school by scooter.'] },
    { q: 'What did you have for dinner last night?', zh: '你昨晚晚餐吃了什麼？', samples: ['I had rice, fish and vegetables.', 'I ate beef noodles with my family.'] },
    { q: 'What do you want to do this summer vacation?', zh: '這個暑假你想做什麼？', samples: ['I want to go to the beach with my family.', 'I want to learn how to swim.'] },
    { q: 'Do you like to cook? Why or why not?', zh: '你喜歡煮菜嗎？為什麼？', samples: ["Yes, I do. Cooking is fun and I like to eat what I make.", "No, I don't, because it is too hard for me."] },
    { q: 'What is your favorite subject at school?', zh: '你在學校最喜歡什麼科目？', samples: ['My favorite subject is English because it is interesting.', 'I like P.E. because I love sports.'] },
    { q: 'Who do you live with?', zh: '你跟誰住在一起？', samples: ['I live with my parents and my little brother.'] },
    { q: 'What time do you usually go to bed?', zh: '你通常幾點睡覺？', samples: ['I usually go to bed at ten o\'clock.'] },
    { q: 'What do you do when you are sick?', zh: '你生病時會做什麼？', samples: ['I see a doctor and take some medicine. Then I stay in bed and rest.'] },
    { q: 'Which do you like better, dogs or cats? Why?', zh: '狗和貓你比較喜歡哪個？為什麼？', samples: ['I like dogs better because they are friendly.', 'I like cats better because they are cute and quiet.'] },
    { q: 'Where do you want to go for a trip? Why?', zh: '你想去哪裡旅行？為什麼？', samples: ['I want to go to Japan because I want to see the snow.'] },
    { q: 'What did you do last weekend?', zh: '你上週末做了什麼？', samples: ['I went to the movies with my friends.', 'I stayed home and helped my mom clean the house.'] },
    { q: 'How can you help your family at home?', zh: '你在家可以怎麼幫忙家人？', samples: ['I can wash the dishes and take out the trash.'] },
  ],
};
