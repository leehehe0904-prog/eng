// =============================================
//  英文小冒險 — 題庫資料
//  想新增單字或句子，直接照格式加在對應年級即可：
//  words:     ['英文', '中文', '表情圖案']
//  sentences: ['英文句子', '中文意思']
//  dialogues: AI 對話腳本（keys = 回答中只要出現其中一個字就算過關，'*' = 任何回答都可以）
// =============================================

const NUMS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const FOODS = ['rice', 'noodles', 'pizza', 'hamburger', 'bread', 'cake', 'egg', 'apple', 'banana', 'milk', 'juice', 'sandwich',
  'chicken', 'fish', 'dumplings', 'cookie', 'ice cream', 'candy', 'soup', 'salad', 'fries', 'hot dog', 'eating'];
const ANIMALS = ['cat', 'dog', 'bird', 'fish', 'rabbit', 'tiger', 'lion', 'monkey', 'elephant', 'pig', 'duck', 'panda',
  'bear', 'horse', 'cow', 'frog', 'snake', 'koala', 'giraffe', 'zebra', 'penguin', 'dolphin', 'animal'];

const GRADES = {
  1: {
    name: '一年級', icon: '🐣', color: '#ff6b6b', theme: '顏色・數字・動物・水果',
    words: [
      ['apple', '蘋果', '🍎'], ['banana', '香蕉', '🍌'], ['cat', '貓', '🐱'], ['dog', '狗', '🐶'],
      ['bird', '鳥', '🐦'], ['fish', '魚', '🐟'], ['red', '紅色', '🔴'], ['blue', '藍色', '🔵'],
      ['yellow', '黃色', '🟡'], ['green', '綠色', '🟢'], ['one', '一', '1️⃣'], ['two', '二', '2️⃣'],
      ['three', '三', '3️⃣'], ['book', '書', '📖'], ['pen', '筆', '🖊️'], ['ball', '球', '⚽'],
      ['sun', '太陽', '☀️'], ['egg', '蛋', '🥚'], ['milk', '牛奶', '🥛'], ['hat', '帽子', '👒'],
    ],
    sentences: [
      ['I like apples.', '我喜歡蘋果。'],
      ['This is a cat.', '這是一隻貓。'],
      ['It is red.', '它是紅色的。'],
      ['I have a pen.', '我有一支筆。'],
      ['I see a bird.', '我看到一隻鳥。'],
      ['The sun is hot.', '太陽很熱。'],
      ['I have three balls.', '我有三顆球。'],
      ['Do you like milk?', '你喜歡牛奶嗎？'],
      ['Good morning, teacher.', '老師早安。'],
    ],
    dialogues: [
      {
        title: '打招呼', icon: '👋', turns: [
          { ai: 'Hello!', zh: '哈囉！', keys: ['hello', 'hi', 'hey'], ex: ['Hi!', 'Hello!'] },
          { ai: "What's your name?", zh: '你叫什麼名字？', keys: ['*'], cap: true, ex: ['My name is Amy.', "I'm Ben."] },
          { ai: 'Nice to meet you, {name}! How are you?', zh: '很高興認識你！你好嗎？', keys: ['fine', 'good', 'ok', 'okay', 'great', 'happy', 'tired', 'sad', 'well'], ex: ["I'm fine, thank you.", "I'm happy!"] },
          { ai: 'Goodbye, {name}!', zh: '再見！', keys: ['bye', 'goodbye', 'see you'], ex: ['Bye!', 'Goodbye!'] },
        ],
      },
      {
        title: '水果和顏色', icon: '🍎', turns: [
          { ai: 'Look! 🍎 What is this?', zh: '你看！這是什麼？', keys: ['apple'], ex: ['It is an apple.', 'An apple.'] },
          { ai: 'What color is it?', zh: '它是什麼顏色？', keys: ['red'], ex: ['It is red.', 'Red.'] },
          { ai: 'Do you like apples?', zh: '你喜歡蘋果嗎？', keys: ['yes', 'no', 'like'], ex: ['Yes, I do.', "No, I don't."] },
          { ai: '🍎🍎🍎 How many apples?', zh: '有幾顆蘋果？', keys: ['three', '3'], ex: ['Three.', 'Three apples.'] },
        ],
      },
    ],
  },

  2: {
    name: '二年級', icon: '🐥', color: '#ff922b', theme: '家人・身體・教室・食物',
    words: [
      ['mom', '媽媽', '👩'], ['dad', '爸爸', '👨'], ['sister', '姊妹', '👧'], ['brother', '兄弟', '👦'],
      ['baby', '嬰兒', '👶'], ['eye', '眼睛', '👁️'], ['ear', '耳朵', '👂'], ['nose', '鼻子', '👃'],
      ['mouth', '嘴巴', '👄'], ['hand', '手', '✋'], ['foot', '腳', '🦶'], ['bag', '書包', '🎒'],
      ['bed', '床', '🛏️'], ['chair', '椅子', '🪑'], ['door', '門', '🚪'], ['cake', '蛋糕', '🍰'],
      ['juice', '果汁', '🧃'], ['bread', '麵包', '🍞'], ['duck', '鴨子', '🦆'], ['pig', '豬', '🐷'],
    ],
    sentences: [
      ['This is my mom.', '這是我的媽媽。'],
      ['Touch your nose.', '摸摸你的鼻子。'],
      ['Open the door, please.', '請把門打開。'],
      ['I have two eyes.', '我有兩隻眼睛。'],
      ['Can I have some juice?', '我可以喝一些果汁嗎？'],
      ['My brother is tall.', '我的哥哥很高。'],
      ['Sit down, please.', '請坐下。'],
      ['The baby is sleeping.', '寶寶正在睡覺。'],
      ['I like cake.', '我喜歡蛋糕。'],
    ],
    dialogues: [
      {
        title: '我的家人', icon: '👨‍👩‍👧', turns: [
          { ai: '👩 Who is she?', zh: '她是誰？', keys: ['mom', 'mother', 'mommy', 'mum'], ex: ['She is my mom.', 'My mom.'] },
          { ai: '👨 Who is he?', zh: '他是誰？', keys: ['dad', 'father', 'daddy'], ex: ['He is my dad.', 'My dad.'] },
          { ai: 'Do you have a brother or a sister?', zh: '你有兄弟或姊妹嗎？', keys: ['yes', 'no', 'brother', 'sister'], ex: ['Yes, I have a sister.', "No, I don't."] },
          { ai: 'How many people are in your family?', zh: '你家有幾個人？', keys: NUMS, ex: ['Four.', 'There are four people.'] },
        ],
      },
      {
        title: '身體和點心', icon: '👃', turns: [
          { ai: '👃 Touch your nose! What is this?', zh: '摸摸鼻子！這是什麼？', keys: ['nose'], ex: ['It is my nose.', 'Nose.'] },
          { ai: 'How many eyes do you have?', zh: '你有幾隻眼睛？', keys: ['two', '2'], ex: ['I have two eyes.', 'Two.'] },
          { ai: "I'm thirsty. Can I have some juice? 🧃", zh: '我口渴了。我可以喝一些果汁嗎？', keys: ['yes', 'sure', 'ok', 'okay', 'here', 'no'], ex: ['Sure! Here you are.', 'Yes, you can.'] },
          { ai: 'Thank you!', zh: '謝謝你！', keys: ['welcome', 'ok', 'no problem'], ex: ["You're welcome."] },
        ],
      },
    ],
  },

  3: {
    name: '三年級', icon: '🐰', color: '#f59f00', theme: '動物・食物・職業・心情・動作',
    words: [
      ['rabbit', '兔子', '🐰'], ['tiger', '老虎', '🐯'], ['lion', '獅子', '🦁'], ['monkey', '猴子', '🐵'],
      ['elephant', '大象', '🐘'], ['rice', '飯', '🍚'], ['noodles', '麵', '🍜'], ['pizza', '披薩', '🍕'],
      ['hamburger', '漢堡', '🍔'], ['teacher', '老師', '🧑‍🏫'], ['student', '學生', '🧑‍🎓'], ['doctor', '醫生', '🧑‍⚕️'],
      ['happy', '開心的', '😄'], ['sad', '難過的', '😢'], ['hungry', '餓的', '🤤'], ['tired', '累的', '😴'],
      ['run', '跑', '🏃'], ['jump', '跳', '🦘'], ['swim', '游泳', '🏊'], ['sing', '唱歌', '🎤'],
    ],
    sentences: [
      ['What are you eating?', '你在吃什麼？'],
      ['I am eating noodles.', '我正在吃麵。'],
      ['I am hungry.', '我肚子餓了。'],
      ['Can you swim?', '你會游泳嗎？'],
      ['Yes, I can.', '是的，我會。'],
      ['She is a teacher.', '她是一位老師。'],
      ['The elephant is big.', '大象很大。'],
      ['Are you happy?', '你開心嗎？'],
      ['I can run fast.', '我可以跑得很快。'],
    ],
    dialogues: [
      {
        title: '吃什麼呢？', icon: '🍜', turns: [
          { ai: "Hi! I'm hungry. Are you hungry?", zh: '嗨！我餓了。你餓了嗎？', keys: ['yes', 'no', 'hungry'], ex: ['Yes, I am.', "No, I'm not."] },
          { ai: 'What are you eating?', zh: '你在吃什麼？', keys: FOODS, ex: ['I am eating noodles.', 'I am eating pizza.'] },
          { ai: 'Yummy! What food do you like?', zh: '好好吃！你喜歡什麼食物？', keys: ['like', 'love'].concat(FOODS), ex: ['I like hamburgers.', 'I like rice.'] },
          { ai: 'Me too! Are you full now?', zh: '我也是！你現在吃飽了嗎？', keys: ['yes', 'no', 'full'], ex: ['Yes, I am full.', "No, I'm still hungry."] },
        ],
      },
      {
        title: '我會做什麼', icon: '🏊', turns: [
          { ai: 'Can you swim?', zh: '你會游泳嗎？', keys: ['yes', 'no', 'can'], ex: ['Yes, I can.', "No, I can't."] },
          { ai: 'Can you sing?', zh: '你會唱歌嗎？', keys: ['yes', 'no', 'can'], ex: ['Yes, I can.', "No, I can't."] },
          { ai: 'What animal do you like?', zh: '你喜歡什麼動物？', keys: ANIMALS, ex: ['I like tigers.', 'I like rabbits.'] },
          { ai: 'Why do you like them?', zh: '你為什麼喜歡牠們？', keys: ['*'], ex: ['Because they are cute.', 'Because they are strong.'] },
        ],
      },
    ],
  },

  4: {
    name: '四年級', icon: '🦊', color: '#40c057', theme: '天氣・時間・房間・三餐・才藝',
    words: [
      ['sunny', '晴朗的', '☀️'], ['rainy', '下雨的', '🌧️'], ['cloudy', '多雲的', '☁️'], ['windy', '有風的', '🌬️'],
      ['cold', '冷的', '🥶'], ['hot', '熱的', '🥵'], ['kitchen', '廚房', '🍳'], ['bedroom', '臥室', '🛏️'],
      ['bathroom', '浴室', '🛁'], ['breakfast', '早餐', '🥞'], ['lunch', '午餐', '🍱'], ['dinner', '晚餐', '🍽️'],
      ['basketball', '籃球', '🏀'], ['baseball', '棒球', '⚾'], ['piano', '鋼琴', '🎹'], ['guitar', '吉他', '🎸'],
      ['umbrella', '雨傘', '☂️'], ['jacket', '夾克', '🧥'], ['clock', '時鐘', '⏰'], ['morning', '早上', '🌅'],
    ],
    sentences: [
      ['It is sunny today.', '今天天氣晴朗。'],
      ['What time is it?', '現在幾點？'],
      ["It is seven o'clock.", '現在七點。'],
      ['I eat breakfast at seven.', '我七點吃早餐。'],
      ['I play basketball after school.', '我放學後打籃球。'],
      ['Where is my umbrella?', '我的雨傘在哪裡？'],
      ['Mom is in the kitchen.', '媽媽在廚房裡。'],
      ['Can you play the piano?', '你會彈鋼琴嗎？'],
      ['Put on your jacket.', '穿上你的夾克。'],
    ],
    dialogues: [
      {
        title: '天氣和時間', icon: '⛅', turns: [
          { ai: "Good morning! How's the weather today?", zh: '早安！今天天氣如何？', keys: ['sunny', 'rainy', 'cloudy', 'windy', 'hot', 'cold', 'warm', 'cool', 'snowy', 'raining'], ex: ["It's sunny.", "It's rainy and cold."] },
          { ai: 'What time is it now?', zh: '現在幾點？', keys: NUMS.concat(["o'clock", 'thirty', 'half']), ex: ["It's seven o'clock.", "It's eight thirty."] },
          { ai: 'What do you eat for breakfast?', zh: '你早餐吃什麼？', keys: FOODS.concat(['eat', 'have', 'drink']), ex: ['I eat bread and drink milk.', 'I have eggs.'] },
          { ai: "Don't be late for school! Do you have your umbrella?", zh: '上學別遲到！你有帶雨傘嗎？', keys: ['yes', 'no', 'have'], ex: ['Yes, I do.', "No, I don't."] },
        ],
      },
      {
        title: '放學以後', icon: '🏀', turns: [
          { ai: 'What do you do after school?', zh: '你放學後做什麼？', keys: ['play', 'read', 'watch', 'do', 'go', 'eat', 'sleep', 'study', 'practice', 'draw', 'swim'], ex: ['I play basketball.', 'I do my homework.'] },
          { ai: 'Can you play the piano?', zh: '你會彈鋼琴嗎？', keys: ['yes', 'no', 'can'], ex: ['Yes, I can.', "No, I can't."] },
          { ai: 'Where is your mom now?', zh: '你媽媽現在在哪裡？', keys: ['kitchen', 'bedroom', 'bathroom', 'living room', 'home', 'work', 'office', 'school', 'in', 'at'], ex: ['She is in the kitchen.', 'She is at work.'] },
          { ai: 'What do you have for dinner?', zh: '你晚餐吃什麼？', keys: FOODS.concat(['have', 'eat']), ex: ['I have rice and fish.', 'I eat noodles.'] },
        ],
      },
    ],
  },

  5: {
    name: '五年級', icon: '🦁', color: '#339af0', theme: '地點・交通・節日・購物・形容詞',
    words: [
      ['library', '圖書館', '📚'], ['hospital', '醫院', '🏥'], ['park', '公園', '🏞️'], ['supermarket', '超市', '🛒'],
      ['bus', '公車', '🚌'], ['train', '火車', '🚆'], ['bike', '腳踏車', '🚲'], ['taxi', '計程車', '🚕'],
      ['airplane', '飛機', '✈️'], ['birthday', '生日', '🎂'], ['holiday', '假日', '🏖️'], ['homework', '功課', '📝'],
      ['weekend', '週末', '🎉'], ['beautiful', '美麗的', '🌸'], ['delicious', '美味的', '😋'], ['expensive', '昂貴的', '💰'],
      ['cheap', '便宜的', '🏷️'], ['money', '錢', '💵'], ['Monday', '星期一', '📅'], ['Sunday', '星期日', '🗓️'],
    ],
    sentences: [
      ["Let's go to the park.", '我們去公園吧。'],
      ['How do you go to school?', '你怎麼去上學？'],
      ['I go to school by bus.', '我搭公車去上學。'],
      ['When is your birthday?', '你的生日是什麼時候？'],
      ['My birthday is in May.', '我的生日在五月。'],
      ['I do my homework every day.', '我每天都寫功課。'],
      ['How much is this bag?', '這個包包多少錢？'],
      ['The cake is delicious.', '這個蛋糕很好吃。'],
      ['What do you do on weekends?', '你週末都做什麼？'],
    ],
    dialogues: [
      {
        title: '週末去哪裡', icon: '🚌', turns: [
          { ai: 'How do you go to school?', zh: '你怎麼去上學？', keys: ['bus', 'walk', 'foot', 'bike', 'car', 'train', 'taxi', 'mrt', 'scooter', 'by'], ex: ['I go to school by bus.', 'I walk to school.'] },
          { ai: 'Where do you want to go this weekend?', zh: '這個週末你想去哪裡？', keys: ['park', 'library', 'supermarket', 'museum', 'zoo', 'beach', 'mall', 'home', 'go', 'want'], ex: ['I want to go to the park.', 'I want to go to the zoo.'] },
          { ai: 'Cool! What will you do there?', zh: '好酷！你會在那裡做什麼？', keys: ['*'], ex: ['I will play with my friends.', 'I will read books.'] },
          { ai: 'How will you get there?', zh: '你要怎麼去那裡？', keys: ['bus', 'walk', 'foot', 'bike', 'car', 'train', 'taxi', 'mrt', 'by'], ex: ['By bike.', 'I will go there by car.'] },
        ],
      },
      {
        title: '生日和購物', icon: '🎂', turns: [
          { ai: 'When is your birthday?', zh: '你的生日是什麼時候？', keys: MONTHS.concat(['birthday']), ex: ['My birthday is in May.', "It's in October."] },
          { ai: 'What do you want for your birthday?', zh: '你生日想要什麼？', keys: ['*'], ex: ['I want a new bike.', 'I want a big cake.'] },
          { ai: 'This toy is 2000 dollars. Is it cheap or expensive?', zh: '這個玩具 2000 元。它便宜還是貴？', keys: ['cheap', 'expensive'], ex: ["It's expensive!", 'It is cheap.'] },
          { ai: 'How much money do you have?', zh: '你有多少錢？', keys: ['*'], ex: ['I have 100 dollars.', "I don't have money."] },
        ],
      },
    ],
  },

  6: {
    name: '六年級', icon: '🦅', color: '#845ef7', theme: '夢想職業・過去未來・環保・比較',
    words: [
      ['scientist', '科學家', '🧑‍🔬'], ['engineer', '工程師', '🧑‍🔧'], ['astronaut', '太空人', '🧑‍🚀'], ['firefighter', '消防員', '🧑‍🚒'],
      ['museum', '博物館', '🏛️'], ['restaurant', '餐廳', '🍝'], ['dictionary', '字典', '📕'], ['vegetable', '蔬菜', '🥦'],
      ['festival', '節日', '🏮'], ['temperature', '溫度', '🌡️'], ['environment', '環境', '🌏'], ['recycle', '回收', '♻️'],
      ['invention', '發明', '💡'], ['adventure', '冒險', '🗺️'], ['important', '重要的', '❗'], ['interesting', '有趣的', '🤩'],
      ['dangerous', '危險的', '⚠️'], ['yesterday', '昨天', '⏪'], ['tomorrow', '明天', '⏩'], ['computer', '電腦', '💻'],
    ],
    sentences: [
      ['I want to be a scientist.', '我想成為一位科學家。'],
      ['I went to the museum yesterday.', '我昨天去了博物館。'],
      ['We should recycle bottles.', '我們應該回收瓶子。'],
      ['What will you do tomorrow?', '你明天要做什麼？'],
      ['English is more interesting than math.', '英文比數學有趣。'],
      ["Don't swim in dangerous places.", '不要在危險的地方游泳。'],
      ['The temperature is very high today.', '今天的溫度很高。'],
      ['Did you finish your homework?', '你寫完功課了嗎？'],
      ['I will visit my grandma tomorrow.', '我明天會去看奶奶。'],
    ],
    dialogues: [
      {
        title: '我的夢想', icon: '🚀', turns: [
          { ai: 'What do you want to be in the future?', zh: '你未來想成為什麼？', keys: ['want', 'be', 'scientist', 'teacher', 'doctor', 'engineer', 'astronaut', 'firefighter', 'police', 'singer', 'cook', 'chef', 'artist', 'player', 'youtuber'], ex: ['I want to be a scientist.', 'I want to be a teacher.'] },
          { ai: 'Why?', zh: '為什麼？', keys: ['*'], ex: ['Because I like science.', 'Because I want to help people.'] },
          { ai: 'That sounds great! What did you do yesterday?', zh: '聽起來很棒！你昨天做了什麼？', keys: ['went', 'played', 'did', 'watched', 'read', 'ate', 'visited', 'studied', 'had', 'saw', 'made', 'stayed', 'was'], ex: ['I went to the library.', 'I played basketball.'] },
          { ai: 'What will you do tomorrow?', zh: '你明天要做什麼？', keys: ['will', 'going', 'want'], ex: ['I will visit my grandma.', 'I am going to the park.'] },
        ],
      },
      {
        title: '愛護地球', icon: '🌏', turns: [
          { ai: 'Do you recycle at home?', zh: '你在家會做資源回收嗎？', keys: ['yes', 'no', 'recycle'], ex: ['Yes, I do.', 'Yes, we recycle every day.'] },
          { ai: 'What can we recycle?', zh: '我們可以回收什麼？', keys: ['bottle', 'paper', 'can', 'plastic', 'bag', 'glass', 'box'], ex: ['We can recycle bottles and paper.', 'Plastic bags.'] },
          { ai: 'How can we protect the environment?', zh: '我們可以怎麼保護環境？', keys: ['*'], ex: ['We should save water.', "We shouldn't waste food."] },
          { ai: 'Which is more important, money or the earth?', zh: '錢和地球，哪個比較重要？', keys: ['earth', 'money', 'important'], ex: ['The earth is more important.'] },
        ],
      },
    ],
  },
};

// ---------- 生活英文句子 ----------
const DAILY = [
  {
    id: 'morning', name: '早上起床', icon: '🌅', items: [
      ['Good morning, Mom.', '早安，媽媽。'],
      ["It's time to get up.", '該起床了。'],
      ['I brush my teeth.', '我刷牙。'],
      ['I wash my face.', '我洗臉。'],
      ["What's for breakfast?", '早餐吃什麼？'],
      ["Let's go to school.", '我們去上學吧。'],
    ],
  },
  {
    id: 'school', name: '在學校', icon: '🏫', items: [
      ['May I come in?', '我可以進來嗎？'],
      ['May I go to the restroom?', '我可以去廁所嗎？'],
      ["I don't understand.", '我不懂。'],
      ['Can you say that again?', '你可以再說一次嗎？'],
      ['How do you spell it?', '這個要怎麼拼？'],
      ['Can I borrow your eraser?', '我可以跟你借橡皮擦嗎？'],
    ],
  },
  {
    id: 'meal', name: '吃飯時間', icon: '🍽️', items: [
      ["Let's eat!", '開動吧！'],
      ['This is yummy!', '這好好吃！'],
      ['Can I have some water?', '我可以喝點水嗎？'],
      ['Please pass me the salt.', '請把鹽遞給我。'],
      ["I'm full.", '我吃飽了。'],
      ['May I have some more?', '我可以再多吃一點嗎？'],
    ],
  },
  {
    id: 'shop', name: '買東西', icon: '🛒', items: [
      ['How much is it?', '這個多少錢？'],
      ['I want this one.', '我想要這一個。'],
      ['Can I try it on?', '我可以試穿嗎？'],
      ["It's too expensive.", '這太貴了。'],
      ['Do you have a bigger one?', '你們有大一點的嗎？'],
      ['Here you are.', '給你。'],
    ],
  },
  {
    id: 'polite', name: '禮貌用語', icon: '🤝', items: [
      ['Thank you very much.', '非常謝謝你。'],
      ["You're welcome.", '不客氣。'],
      ["I'm sorry.", '對不起。'],
      ["That's OK.", '沒關係。'],
      ['Excuse me.', '不好意思。'],
      ['Nice to meet you.', '很高興認識你。'],
    ],
  },
  {
    id: 'health', name: '身體不舒服', icon: '🤒', items: [
      ["I don't feel well.", '我覺得不舒服。'],
      ['I have a headache.', '我頭痛。'],
      ['I have a fever.', '我發燒了。'],
      ['My stomach hurts.', '我肚子痛。'],
      ['I need to see a doctor.', '我需要看醫生。'],
      ['Take care.', '保重。'],
    ],
  },
  {
    id: 'night', name: '晚上在家', icon: '🌙', items: [
      ["I'm home!", '我回來了！'],
      ["I'm doing my homework.", '我正在寫功課。'],
      ['Can I watch TV?', '我可以看電視嗎？'],
      ['Time for bed.', '該睡覺了。'],
      ['Good night.', '晚安。'],
      ['Sweet dreams.', '祝你有個好夢。'],
    ],
  },
  {
    id: 'friends', name: '跟朋友玩', icon: '⚽', items: [
      ["Let's play together!", '我們一起玩吧！'],
      ["It's my turn.", '輪到我了。'],
      ['Can I join you?', '我可以加入你們嗎？'],
      ['Good job!', '做得好！'],
      ["Don't give up!", '不要放棄！'],
      ['See you tomorrow.', '明天見。'],
    ],
  },
];

// ---------- 英文日記題目 ----------
const DIARY_PROMPTS = [
  { icon: '👨‍👩‍👧', title: 'My Family', zh: '我的家人', starters: ['There are ___ people in my family.', 'My dad is ___.', 'My mom likes ___.', 'I love my family.'] },
  { icon: '🍔', title: 'My Favorite Food', zh: '我最喜歡的食物', starters: ['My favorite food is ___.', 'It is ___.', 'I eat it ___.'] },
  { icon: '🐶', title: 'My Pet / Favorite Animal', zh: '我的寵物 / 最喜歡的動物', starters: ['I like ___.', 'It is ___ and ___.', 'It can ___.'] },
  { icon: '🏫', title: 'My School Day', zh: '我在學校的一天', starters: ['I go to school at ___.', 'I like ___ class.', 'After school, I ___.'] },
  { icon: '🎉', title: 'My Weekend', zh: '我的週末', starters: ['Last weekend, I ___.', 'I went to ___ with ___.', 'It was ___.'] },
  { icon: '🚀', title: 'My Dream', zh: '我的夢想', starters: ['I want to be a ___.', 'Because ___.', 'I will ___.'] },
  { icon: '☀️', title: 'Today', zh: '今天', starters: ['Today is ___.', 'The weather is ___.', 'Today I feel ___ because ___.'] },
  { icon: '✨', title: 'Free Writing', zh: '自由寫作', starters: ['I ___.', 'I like ___.', 'I can ___.'] },
];

// ---------- 造句的開頭提示 ----------
const STARTERS = ['I like ___.', 'This is ___.', 'I have ___.', 'I can ___.', 'I see ___.', 'It is ___.',
  'My ___ is ___.', 'I want to ___.', 'There is ___.', 'Yesterday I ___.', 'I will ___ tomorrow.', 'I think ___.'];

// ---------- 自由聊天：Robo 會問的問題 ----------
const BOT_QUESTIONS = [
  ["What's your name?", '你叫什麼名字？', ['My name is Amy.', "I'm Ben."]],
  ['How old are you?', '你幾歲？', ["I'm ten years old.", "I'm eight."]],
  ["What's your favorite color?", '你最喜歡什麼顏色？', ['I like blue.', 'My favorite color is pink.']],
  ['What food do you like?', '你喜歡什麼食物？', ['I like pizza.', 'I like noodles.']],
  ['Do you have a pet?', '你有養寵物嗎？', ['Yes, I have a dog.', "No, I don't."]],
  ['What do you like to do after school?', '你放學後喜歡做什麼？', ['I like to play basketball.', 'I like to read books.']],
  ["What's the weather like today?", '今天天氣怎麼樣？', ["It's sunny.", "It's rainy."]],
  ['Who is in your family?', '你家有誰？', ['My mom, my dad and me.', 'I have a brother.']],
  ['What do you want to be in the future?', '你未來想做什麼？', ['I want to be a doctor.', 'I want to be a teacher.']],
  ["What's your favorite animal?", '你最喜歡什麼動物？', ['I like cats.', 'My favorite animal is the panda.']],
  ['Can you swim?', '你會游泳嗎？', ['Yes, I can.', "No, I can't."]],
  ['What did you eat for breakfast?', '你早餐吃了什麼？', ['I ate bread.', 'I had eggs and milk.']],
];

// ---------- AI 對話的提示：句型 + 可以用的字 ----------
// 依照 AI 問的句子（要跟對話裡的 ai 文字完全一樣）對應。
// 句型中的 ___ 會被點選的字填進去；字以 . ? ! 結尾代表整句直接帶入。
const CHAT_HINTS = {
  // 一年級
  'Hello!': ['Hi! / Hello!', ['Hi!', 'Hello!', 'Good morning!']],
  "What's your name?": ['My name is ___.', ['Amy', 'Ben', 'Lily', 'Tom', 'Kevin']],
  'Nice to meet you, {name}! How are you?': ["I'm ___, thank you.", ['fine', 'good', 'great', 'happy', 'tired']],
  'Goodbye, {name}!': ['___! See you!', ['Bye', 'Goodbye']],
  'Look! 🍎 What is this?': ['It is an ___.', ['apple', 'egg']],
  'What color is it?': ['It is ___.', ['red', 'blue', 'yellow', 'green']],
  'Do you like apples?': ['Yes, I do. / No, I don\'t.', ['Yes, I do.', "No, I don't."]],
  '🍎🍎🍎 How many apples?': ['___ apples.', ['One', 'Two', 'Three']],
  // 二年級
  '👩 Who is she?': ['She is my ___.', ['mom', 'sister', 'grandma', 'teacher']],
  '👨 Who is he?': ['He is my ___.', ['dad', 'brother', 'grandpa', 'uncle']],
  'Do you have a brother or a sister?': ['Yes, I have a ___. / No, I don\'t.', ['brother', 'sister', "No, I don't."]],
  'How many people are in your family?': ['There are ___ people in my family.', ['three', 'four', 'five', 'six']],
  '👃 Touch your nose! What is this?': ['It is my ___.', ['nose', 'eye', 'ear', 'mouth']],
  'How many eyes do you have?': ['I have ___ eyes.', ['one', 'two', 'three']],
  "I'm thirsty. Can I have some juice? 🧃": ['Sure! Here you are.', ['Sure! Here you are.', 'Yes, you can.', "Sorry, I don't have juice."]],
  'Thank you!': ["You're welcome.", ["You're welcome.", 'No problem.']],
  // 三年級
  "Hi! I'm hungry. Are you hungry?": ["Yes, I am. / No, I'm not.", ['Yes, I am.', "No, I'm not."]],
  'What are you eating?': ['I am eating ___.', ['noodles', 'rice', 'pizza', 'a hamburger', 'bread', 'cake']],
  'Yummy! What food do you like?': ['I like ___.', ['pizza', 'noodles', 'rice', 'hamburgers', 'cake', 'chicken']],
  'Me too! Are you full now?': ["Yes, I'm full. / No, I'm still hungry.", ["Yes, I'm full.", "No, I'm still hungry."]],
  'Can you swim?': ["Yes, I can. / No, I can't.", ['Yes, I can.', "No, I can't."]],
  'Can you sing?': ["Yes, I can. / No, I can't.", ['Yes, I can.', "No, I can't."]],
  'What animal do you like?': ['I like ___.', ['tigers', 'rabbits', 'monkeys', 'elephants', 'lions', 'dogs', 'cats']],
  'Why do you like them?': ['Because they are ___.', ['cute', 'big', 'strong', 'funny', 'cool', 'smart', 'soft']],
  // 四年級
  "Good morning! How's the weather today?": ["It's ___ today.", ['sunny', 'rainy', 'cloudy', 'windy', 'hot', 'cold']],
  'What time is it now?': ["It's ___.", ["seven o'clock", "eight o'clock", 'seven thirty', 'six forty']],
  'What do you eat for breakfast?': ['I eat ___ and drink ___.', ['bread', 'eggs', 'a sandwich', 'milk', 'juice', 'soy milk']],
  "Don't be late for school! Do you have your umbrella?": ["Yes, I do. / No, I don't.", ['Yes, I do.', "No, I don't."]],
  'What do you do after school?': ['I ___ after school.', ['play basketball', 'do my homework', 'read books', 'play the piano', 'watch TV']],
  'Can you play the piano?': ["Yes, I can. / No, I can't.", ['Yes, I can.', "No, I can't."]],
  'Where is your mom now?': ['She is in the ___. / She is at ___.', ['kitchen', 'living room', 'bedroom', 'work', 'home']],
  'What do you have for dinner?': ['I have ___ for dinner.', ['rice', 'fish', 'noodles', 'chicken', 'soup', 'vegetables']],
  // 五年級
  'How do you go to school?': ['I go to school by ___. / I walk to school.', ['bus', 'bike', 'car', 'MRT', 'I walk to school.']],
  'Where do you want to go this weekend?': ['I want to go to the ___.', ['park', 'zoo', 'library', 'beach', 'museum']],
  'Cool! What will you do there?': ['I will ___.', ['play with my friends', 'read books', 'see the animals', 'swim', 'take pictures']],
  'How will you get there?': ['By ___.', ['bus', 'bike', 'car', 'train', 'MRT']],
  'When is your birthday?': ['My birthday is in ___.', ['January', 'March', 'May', 'August', 'October', 'December']],
  'What do you want for your birthday?': ['I want a ___.', ['new bike', 'big cake', 'toy car', 'storybook', 'puppy']],
  'This toy is 2000 dollars. Is it cheap or expensive?': ["It's ___!", ['expensive', 'cheap']],
  'How much money do you have?': ['I have ___ dollars.', ['fifty', 'one hundred', 'five hundred', "I don't have money."]],
  // 六年級
  'What do you want to be in the future?': ['I want to be a ___.', ['scientist', 'teacher', 'doctor', 'engineer', 'firefighter', 'singer']],
  'Why?': ['Because I ___.', ['like science', 'want to help people', 'love music', 'like children', 'want to be famous']],
  'That sounds great! What did you do yesterday?': ['I ___ yesterday.', ['went to the library', 'played basketball', 'watched a movie', 'visited my grandma', 'did my homework']],
  'What will you do tomorrow?': ['I will ___ tomorrow.', ['visit my grandma', 'go to the park', 'study English', 'play games', 'clean my room']],
  'Do you recycle at home?': ["Yes, I do. / No, I don't.", ['Yes, I do.', "No, I don't."]],
  'What can we recycle?': ['We can recycle ___.', ['bottles', 'paper', 'cans', 'plastic bags', 'boxes']],
  'How can we protect the environment?': ['We should ___.', ['save water', 'turn off the lights', 'recycle', 'not waste food', 'plant trees']],
  'Which is more important, money or the earth?': ['The ___ is more important.', ['earth', 'money']],
  // 英檢口說面試
  "Hello. What's your name?": ['My name is ___.', ['Amy Chen', 'Kevin Lin', 'Lily Wang']],
  'Nice to meet you, {name}. How old are you?': ["I'm ___ years old.", ['ten', 'eleven', 'twelve', 'thirteen']],
  'What do you like to do in your free time?': ['I like to ___.', ['read books', 'play basketball', 'draw pictures', 'listen to music']],
  'Why do you study English?': ['Because ___.', ['English is useful', 'I want to travel', 'I like English songs', 'I want to make friends']],
  'What did you do last weekend?': ['I ___ last weekend.', ['went to the beach', 'stayed home', 'watched TV', 'visited my grandparents']],
  'Excuse me. Is there a post office near here?': ['Yes, there is one on ___.', ['Park Road', 'Main Street', 'Zhongshan Road']],
  'How can I get there?': ['Go straight and turn ___ at the corner.', ['left', 'right']],
  'Is it far from here?': ["No, it's about ___ minutes on foot.", ['five', 'ten', 'fifteen']],
  'Thank you very much!': ["You're welcome.", ["You're welcome.", 'No problem.']],
  // 自由聊天
  'How old are you?': ["I'm ___ years old.", ['eight', 'nine', 'ten', 'eleven', 'twelve']],
  "What's your favorite color?": ['My favorite color is ___.', ['red', 'blue', 'green', 'pink', 'yellow', 'purple']],
  'What food do you like?': ['I like ___.', ['pizza', 'noodles', 'rice', 'hamburgers', 'dumplings']],
  'Do you have a pet?': ["Yes, I have a ___. / No, I don't.", ['dog', 'cat', 'fish', 'rabbit', "No, I don't."]],
  'What do you like to do after school?': ['I like to ___.', ['play basketball', 'read books', 'watch TV', 'draw pictures']],
  "What's the weather like today?": ["It's ___.", ['sunny', 'rainy', 'cloudy', 'hot', 'cold']],
  'Who is in your family?': ['My ___, my ___ and me.', ['mom', 'dad', 'brother', 'sister', 'grandma']],
  "What's your favorite animal?": ['My favorite animal is the ___.', ['panda', 'dog', 'cat', 'tiger', 'rabbit']],
  'What did you eat for breakfast?': ['I ate ___.', ['bread', 'eggs', 'a sandwich', 'rice balls']],
};
