// =============================================
//  國中・高中・大學 題庫
//  格式和 data.js 一樣；沒有適合圖片的單字，圖片欄位留空 ''（題目會改用中文意思）
//  level：elem 國小／jh 國中／sh 高中／uni 大學
// =============================================

const LEVELS = [
  { id: 'elem', name: '國小', sub: '1～6 年級' },
  { id: 'jh', name: '國中', sub: '國一～國三・會考' },
  { id: 'sh', name: '高中', sub: '高一～高三・學測' },
  { id: 'uni', name: '大學', sub: '校園・學術・職場' },
];
for (let g = 1; g <= 6; g++) GRADES[g].level = 'elem';

Object.assign(GRADES, {
  // ======================== 國中 ========================
  7: {
    name: '國一', badge: '國1', level: 'jh', color: '#f76707', theme: '學校生活・社團興趣・日常作息・現在式',
    words: [
      ['classmate', '同學', '👫'], ['uniform', '制服', '👔'], ['locker', '置物櫃', '🔐'], ['notebook', '筆記本', '📓'], ['schedule', '時間表', '🗒️'],
      ['exam', '考試', '📝'], ['club', '社團', '🎭'], ['hobby', '嗜好', '🎯'], ['collect', '收集', '🗃️'], ['activity', '活動', '🤸'],
      ['wash', '洗', '🧽'], ['favorite', '最喜歡的', '❤️'], ['answer', '回答', '💬'], ['explain', '解釋', '🗣️'], ['excellent', '優秀的', '💯'],
      ['team', '隊伍', '🤝'], ['player', '選手', '⛹️'], ['win', '贏', '🏅'], ['lose', '輸', '😞'], ['kind', '親切的', '😊'],
      ['shy', '害羞的', '😳'], ['funny', '好笑的', '🤣'], ['begin', '開始', '🏁'], ['finish', '完成', '✅'], ['understand', '了解', '🤓'],
      ['join', '加入', '➕'], ['enjoy', '享受', '🥰'], ['spend', '花費（時間、金錢）', '💸'], ['once', '一次', '1️⃣'], ['twice', '兩次', '2️⃣'],
      ['ready', '準備好的', '👍'],
    ],
    sentences: [
      ['I usually get up at six thirty.', '我通常六點半起床。'], ['My favorite subject is English.', '我最喜歡的科目是英文。'],
      ['We wear uniforms at school.', '我們在學校穿制服。'], ['What club are you in?', '你參加什麼社團？'],
      ['I am in the basketball club.', '我參加籃球社。'], ['She is shy, but she is very kind.', '她很害羞，但她很親切。'],
      ['How often do you practice the piano?', '你多久練習一次鋼琴？'], ['I practice twice a week.', '我一週練習兩次。'],
      ['Our team won the game.', '我們隊贏了比賽。'], ['Can you explain this question?', '你可以解釋這個問題嗎？'],
      ['I spend an hour on homework every day.', '我每天花一小時寫功課。'], ['Do you enjoy collecting stamps?', '你喜歡收集郵票嗎？'],
      ['The exam begins at nine.', '考試九點開始。'],
    ],
    dialogues: [{
      title: '新學期', icon: '', turns: [
        { ai: 'Hi! Are you a new student here?', zh: '嗨！你是新來的學生嗎？', keys: ['yes', 'no', 'new', 'student'], ex: ['Yes, I am. I just joined this class.', "No, I'm not."] },
        { ai: 'Which club do you want to join?', zh: '你想參加哪個社團？', keys: ['club', 'join', 'want', 'basketball', 'music', 'art', 'english', 'science', 'dance'], ex: ['I want to join the music club.', 'I want to join the basketball club.'] },
        { ai: 'What do you usually do after school?', zh: '你放學後通常做什麼？', keys: ['*'], ex: ['I usually do my homework and play games.', 'I usually go to cram school.'] },
        { ai: 'What is your favorite subject? Why?', zh: '你最喜歡哪個科目？為什麼？', keys: ['*'], ex: ['My favorite subject is math because it is interesting.'] },
      ],
    }],
  },
  8: {
    name: '國二', badge: '國2', level: 'jh', color: '#0ca678', theme: '旅行・天氣・健康・比較級・未來式',
    words: [
      ['travel', '旅行', '🗺️'], ['passport', '護照', '🛂'], ['luggage', '行李', '🧳'], ['hotel', '旅館', '🏨'], ['airport', '機場', '🛫'],
      ['souvenir', '紀念品', '🎐'], ['degree', '度（溫度）', '🌡️'], ['season', '季節', '🍁'], ['typhoon', '颱風', '🌀'], ['earthquake', '地震', ''],
      ['fever', '發燒', '🤒'], ['cough', '咳嗽', '😷'], ['headache', '頭痛', '🤕'], ['stomachache', '胃痛', '🤢'], ['rest', '休息', '🛌'],
      ['similar', '相似的', '👯'], ['different', '不同的', '🔀'], ['plan', '計畫', '📋'], ['visit', '拜訪', '🏘️'], ['abroad', '在國外', '🌍'],
      ['foreign', '外國的', '🌐'], ['culture', '文化', '🏯'], ['language', '語言', '🔤'], ['traditional', '傳統的', '🏮'], ['crowded', '擁擠的', '👥'],
      ['comfortable', '舒服的', '🛋️'], ['convenient', '方便的', '🏪'], ['pack', '打包', '🎒'], ['arrive', '抵達', '🛬'], ['leave', '離開', '🚪'],
      ['guide', '導遊', '🚩'], ['photo', '照片', '📷'],
    ],
    sentences: [
      ['We are going to travel to Japan next summer.', '我們明年夏天要去日本旅行。'], ["Don't forget to bring your passport.", '別忘了帶你的護照。'],
      ['The plane will arrive at eight.', '飛機將在八點抵達。'], ['Winter in Japan is colder than winter in Taiwan.', '日本的冬天比台灣的冬天冷。'],
      ['A typhoon is coming tomorrow.', '明天颱風要來了。'], ['I have a fever and a bad cough.', '我發燒而且咳得很厲害。'],
      ['You should rest and drink more water.', '你應該休息並多喝水。'], ['Which season do you like best?', '你最喜歡哪個季節？'],
      ['The night market is very crowded.', '夜市非常擁擠。'], ['This hotel is more comfortable than that one.', '這家旅館比那家舒服。'],
      ['Learning a foreign language is fun.', '學外語很有趣。'], ['I bought some souvenirs for my family.', '我買了一些紀念品給家人。'],
    ],
    dialogues: [{
      title: '計畫旅行', icon: '', turns: [
        { ai: 'Where are you going this summer vacation?', zh: '這個暑假你要去哪裡？', keys: ['going', 'go', 'to', 'visit', 'travel', 'stay'], ex: ['I am going to Japan with my family.', 'I am going to stay home.'] },
        { ai: 'How will you get there?', zh: '你要怎麼去那裡？', keys: ['bus', 'walk', 'foot', 'bike', 'car', 'train', 'taxi', 'mrt', 'plane', 'fly', 'by'], ex: ['We will fly there.', 'By train.'] },
        { ai: 'What will you do there?', zh: '你會在那裡做什麼？', keys: ['*'], ex: ['I will visit some temples and eat local food.'] },
        { ai: 'What should you pack for the trip?', zh: '這趟旅行你應該帶什麼？', keys: ['*'], ex: ['I should pack my passport, clothes and an umbrella.'] },
      ],
    }],
  },
  9: {
    name: '國三', badge: '國3', level: 'jh', color: '#1c7ed6', theme: '環境・科技・表達意見・被動語態・關係子句',
    words: [
      ['technology', '科技', '📡'], ['smartphone', '智慧型手機', '📱'], ['internet', '網路', '🌐'], ['online', '線上的', '💻'], ['information', '資訊', 'ℹ️'],
      ['invent', '發明', '💡'], ['protect', '保護', '🛡️'], ['reduce', '減少', '📉'], ['waste', '浪費；廢棄物', '🗑️'], ['nature', '自然', '🌿'],
      ['climate', '氣候', '🌡️'], ['global', '全球的', '🌍'], ['disappear', '消失', '💨'], ['increase', '增加', '📈'], ['opinion', '意見', '💭'],
      ['agree', '同意', '👍'], ['disagree', '不同意', '👎'], ['reason', '理由', '❓'], ['example', '例子', '📌'], ['experience', '經驗', '🧗'],
      ['success', '成功', '🏆'], ['fail', '失敗', '❌'], ['goal', '目標', '🎯'], ['chance', '機會', '🍀'], ['decide', '決定', '🤔'],
      ['prepare', '準備', '📚'], ['graduate', '畢業', '🎓'], ['hope', '希望', '🌈'], ['effort', '努力', '💪'],
    ],
    sentences: [
      ['Smartphones are used by many students.', '很多學生使用智慧型手機。'], ['The light bulb was invented by Edison.', '電燈泡是愛迪生發明的。'],
      ['We should reduce plastic waste.', '我們應該減少塑膠垃圾。'], ['In my opinion, homework is important.', '我認為功課很重要。'],
      ['I agree with you.', '我同意你。'], ['The boy who is wearing glasses is my brother.', '戴眼鏡的那個男孩是我弟弟。'],
      ['This is the book that I bought yesterday.', '這是我昨天買的書。'], ['Many animals may disappear because of climate change.', '很多動物可能因為氣候變遷而消失。'],
      ['If you try hard, you will succeed.', '如果你努力，你就會成功。'], ['I have decided to study harder.', '我已經決定要更用功。'],
      ['We will graduate next June.', '我們明年六月畢業。'], ['Failure is the mother of success.', '失敗為成功之母。'],
    ],
    dialogues: [{
      title: '表達意見', icon: '', turns: [
        { ai: 'Do you think students should use smartphones at school?', zh: '你認為學生應該在學校用手機嗎？', keys: ['yes', 'no', 'think', 'should'], ex: ['Yes, I think so. They help us find information.', "No, I don't think so. They are bad for our eyes."] },
        { ai: 'Why do you think so?', zh: '你為什麼這樣想？', keys: ['*'], ex: ['Because we can use them to learn English.'] },
        { ai: 'What can we do to protect the earth?', zh: '我們可以做什麼來保護地球？', keys: ['*'], ex: ['We can reduce waste and save energy.'] },
        { ai: 'What is your goal after you graduate?', zh: '你畢業後的目標是什麼？', keys: ['*'], ex: ['I want to go to a good senior high school.'] },
      ],
    }],
  },

  // ======================== 高中 ========================
  10: {
    name: '高一', badge: '高1', level: 'sh', color: '#ae3ec9', theme: '7000 單字 Level 3・個人成長・人際溝通',
    words: [
      ['achieve', '達成', ''], ['ability', '能力', ''], ['attitude', '態度', ''], ['challenge', '挑戰', ''], ['communicate', '溝通', '💬'],
      ['confident', '有自信的', '😎'], ['describe', '描述', ''], ['encourage', '鼓勵', ''], ['generation', '世代', ''], ['independent', '獨立的', ''],
      ['influence', '影響', ''], ['knowledge', '知識', '📚'], ['method', '方法', ''], ['opportunity', '機會', ''], ['patient', '有耐心的', '⏳'],
      ['personality', '個性', ''], ['pressure', '壓力', '😫'], ['relationship', '關係', ''], ['responsible', '負責任的', ''], ['satisfy', '使滿意', ''],
      ['solution', '解決辦法', ''], ['suggest', '建議', ''], ['support', '支持', '🤝'], ['value', '價值', ''], ['volunteer', '志工', '🙋'],
      ['compare', '比較', ''], ['improve', '改善', '📈'], ['consider', '考慮', ''], ['focus', '專注', '🎯'],
    ],
    sentences: [
      ['Reading helps you improve your English ability.', '閱讀幫助你提升英文能力。'], ['Your attitude decides your future.', '你的態度決定你的未來。'],
      ['She is confident enough to speak in public.', '她夠有自信，能在大眾面前說話。'], ['My parents always encourage me to try new things.', '我爸媽總是鼓勵我嘗試新事物。'],
      ['Good communication is important in a relationship.', '良好的溝通在一段關係中很重要。'], ['Many students feel a lot of pressure before exams.', '很多學生在考試前感到很大的壓力。'],
      ['I suggest that we take a short break.', '我建議我們休息一下。'], ['He works as a volunteer at the hospital.', '他在醫院當志工。'],
      ['Could you describe your personality?', '你可以描述一下你的個性嗎？'], ['We need to find a better solution.', '我們需要找到更好的解決辦法。'],
      ['This is a great opportunity to learn.', '這是一個很好的學習機會。'], ['It takes patience to learn a new skill.', '學習一項新技能需要耐心。'],
    ],
    dialogues: [{
      title: '自我成長', icon: '', turns: [
        { ai: 'What is the biggest challenge in your life now?', zh: '你現在生活中最大的挑戰是什麼？', keys: ['*'], ex: ['The biggest challenge is managing my time.', 'I think it is the pressure of exams.'] },
        { ai: 'How do you deal with stress?', zh: '你怎麼處理壓力？', keys: ['*'], ex: ['I listen to music or go jogging.'] },
        { ai: 'Would you like to be a volunteer? Why?', zh: '你想當志工嗎？為什麼？', keys: ['*'], ex: ['Yes, because I want to help others.'] },
        { ai: 'What skill do you want to improve this year?', zh: '你今年想加強什麼能力？', keys: ['*'], ex: ['I want to improve my speaking skills.'] },
      ],
    }],
  },
  11: {
    name: '高二', badge: '高2', level: 'sh', color: '#e64980', theme: '7000 單字 Level 4・社會議題・媒體・科學',
    words: [
      ['advertisement', '廣告', '📺'], ['analyze', '分析', ''], ['appreciate', '欣賞；感激', ''], ['authority', '權威；當局', ''], ['benefit', '好處', ''],
      ['campaign', '宣傳活動', ''], ['consequence', '後果', ''], ['contribute', '貢獻', ''], ['convince', '說服', ''], ['criticize', '批評', ''],
      ['debate', '辯論', '🗣️'], ['democracy', '民主', '🗳️'], ['efficient', '有效率的', ''], ['emphasize', '強調', ''], ['evidence', '證據', '🔍'],
      ['expand', '擴大', ''], ['financial', '財務的', '💰'], ['frequent', '頻繁的', ''], ['identity', '身分', ''], ['individual', '個人', ''],
      ['issue', '議題', ''], ['media', '媒體', '📰'], ['negative', '負面的', '➖'], ['positive', '正面的', '➕'], ['potential', '潛力', ''],
      ['previous', '先前的', ''], ['reliable', '可靠的', ''], ['research', '研究', '🔬'], ['resource', '資源', ''], ['survey', '調查', '📊'],
    ],
    sentences: [
      ['Social media has a strong influence on teenagers.', '社群媒體對青少年有很大的影響。'], ['There is no evidence that the story is true.', '沒有證據顯示這個故事是真的。'],
      ['The survey shows that most students sleep less than seven hours.', '調查顯示大部分學生睡不到七小時。'], ['Every individual can contribute to society.', '每個人都能對社會有所貢獻。'],
      ['We should think about the consequences before we act.', '我們應該在行動前想想後果。'], ['Exercise has many benefits for both body and mind.', '運動對身心都有很多好處。'],
      ['It is hard to convince my parents.', '要說服我爸媽很難。'], ['The scientists are doing research on new energy.', '科學家正在研究新能源。'],
      ['Try to look at things in a positive way.', '試著用正面的方式看事情。'], ['Is this website a reliable source of information?', '這個網站是可靠的資訊來源嗎？'],
      ['Our class will hold a debate on school uniforms.', '我們班將舉辦一場關於制服的辯論。'], ['I really appreciate your help.', '我真的很感激你的幫忙。'],
    ],
    dialogues: [{
      title: '時事討論', icon: '', turns: [
        { ai: 'How much time do you spend on social media every day?', zh: '你每天花多少時間在社群媒體上？', keys: ['*'], ex: ['I spend about two hours on social media every day.'] },
        { ai: 'Do you think social media has more benefits or problems?', zh: '你認為社群媒體的好處多還是問題多？', keys: ['*'], ex: ['I think it has more benefits because we can share information quickly.'] },
        { ai: 'How can we tell if news is reliable?', zh: '我們要怎麼判斷新聞是否可靠？', keys: ['*'], ex: ['We should check the source and look for evidence.'] },
        { ai: 'Should students wear school uniforms? Why or why not?', zh: '學生應該穿制服嗎？為什麼？', keys: ['*'], ex: ['I think students should wear uniforms because it saves time.'] },
      ],
    }],
  },
  12: {
    name: '高三', badge: '高3', level: 'sh', color: '#5c7cfa', theme: '7000 單字 Level 5・學測閱讀・抽象議題',
    words: [
      ['abstract', '抽象的', ''], ['accelerate', '加速', ''], ['accommodate', '容納', ''], ['adequate', '足夠的', ''], ['anticipate', '預期', ''],
      ['approximately', '大約', ''], ['assess', '評估', ''], ['circumstance', '情況', ''], ['comprehensive', '全面的', ''], ['controversial', '有爭議的', ''],
      ['crucial', '關鍵的', ''], ['diverse', '多元的', ''], ['dominate', '支配；主導', ''], ['eliminate', '消除', ''], ['enormous', '巨大的', ''],
      ['essential', '必要的', ''], ['evaluate', '評價', ''], ['inevitable', '不可避免的', ''], ['innovation', '創新', '💡'], ['interpret', '解讀', ''],
      ['legislation', '立法', ''], ['maintain', '維持', ''], ['phenomenon', '現象', ''], ['perspective', '觀點', ''], ['prominent', '著名的；顯著的', ''],
      ['sustainable', '永續的', '♻️'], ['tremendous', '極大的', ''], ['vulnerable', '脆弱的', ''], ['ultimately', '最終', ''],
    ],
    sentences: [
      ['Sleep is essential for good health.', '睡眠對健康是必要的。'], ['Technology has accelerated the pace of modern life.', '科技加快了現代生活的步調。'],
      ['The decision was controversial among the public.', '這個決定在大眾之間很有爭議。'], ['It is crucial to evaluate information carefully.', '仔細評估資訊是很關鍵的。'],
      ['Taiwan is home to a diverse range of cultures.', '台灣有多元的文化。'], ['Change is inevitable, so we must learn to adapt.', '改變無法避免，所以我們必須學會適應。'],
      ['The government aims to eliminate single-use plastics.', '政府的目標是消除一次性塑膠。'], ['Approximately two thirds of the students agreed.', '大約三分之二的學生同意。'],
      ['Sustainable development meets the needs of the present.', '永續發展滿足當代的需求。'], ['Each person may interpret the poem differently.', '每個人對這首詩的解讀可能不同。'],
      ['Young children are especially vulnerable to the virus.', '幼童特別容易感染這種病毒。'], ['Ultimately, success depends on your own effort.', '最終，成功取決於你自己的努力。'],
    ],
    dialogues: [{
      title: '學測口說', icon: '', turns: [
        { ai: 'What do you think is the most important skill for the future?', zh: '你認為未來最重要的能力是什麼？', keys: ['*'], ex: ['I think critical thinking is the most important skill.'] },
        { ai: 'Can you give an example?', zh: '你可以舉個例子嗎？', keys: ['*'], ex: ['For example, we need to judge whether online news is true.'] },
        { ai: 'Which university department are you interested in?', zh: '你對哪個大學科系有興趣？', keys: ['*'], ex: ['I am interested in computer science.'] },
        { ai: 'How do you prepare for the exam?', zh: '你怎麼準備考試？', keys: ['*'], ex: ['I review my notes every day and do practice tests.'] },
      ],
    }],
  },

  // ======================== 大學 ========================
  u1: {
    name: '大學生活', badge: '大學', level: 'uni', color: '#2b8a3e', theme: '校園・宿舍・選課・打工・時間管理',
    words: [
      ['campus', '校園', '🏫'], ['dormitory', '宿舍', '🛏️'], ['roommate', '室友', '👯'], ['semester', '學期', '📅'], ['credit', '學分', ''],
      ['major', '主修', '🎓'], ['minor', '輔修', ''], ['lecture', '講課', '👨‍🏫'], ['professor', '教授', '👩‍🏫'], ['tuition', '學費', '💰'],
      ['scholarship', '獎學金', '🏅'], ['deadline', '截止期限', '⏰'], ['assignment', '作業', '📝'], ['presentation', '報告；簡報', '📽️'], ['register', '註冊', '🖊️'],
      ['elective', '選修課', ''], ['attendance', '出席', '✋'], ['cafeteria', '自助餐廳', '🍱'], ['internship', '實習', '💼'], ['budget', '預算', '💵'],
      ['rent', '租金', '🏠'], ['social', '社交的', '🎉'], ['adjust', '適應；調整', '🔧'], ['balance', '平衡', '⚖️'], ['manage', '管理', '🗂️'],
      ['freshman', '大一新生', '🐣'], ['thesis', '論文', '📄'],
    ],
    sentences: [
      ['I live in the dormitory with three roommates.', '我和三個室友住在宿舍。'], ['My major is economics, and my minor is English.', '我主修經濟，輔修英文。'],
      ['The deadline for the assignment is next Friday.', '作業的截止日是下週五。'], ['I applied for a scholarship this semester.', '我這學期申請了獎學金。'],
      ['Attendance is part of the final grade.', '出席率是期末成績的一部分。'], ['How many credits are you taking this semester?', '你這學期修幾學分？'],
      ["I'm working part-time at a coffee shop.", '我在咖啡店打工。'], ['It took me a while to adjust to college life.', '我花了一段時間適應大學生活。'],
      ['You need to balance your studies and social life.', '你需要平衡課業和社交生活。'], ['Our group presentation went really well.', '我們的小組報告非常順利。'],
      ["The professor's lecture was very inspiring.", '教授的課非常有啟發性。'], ['I have to manage my budget carefully.', '我必須小心管理我的預算。'],
    ],
    dialogues: [{
      title: '大學生活', icon: '', turns: [
        { ai: "What's your major, and why did you choose it?", zh: '你主修什麼？為什麼選它？', keys: ['*'], ex: ['My major is computer science because I love programming.'] },
        { ai: 'How do you like living in the dorm?', zh: '你覺得住宿舍怎麼樣？', keys: ['*'], ex: ['I like it, but sometimes it is a little noisy.'] },
        { ai: 'How do you manage your time between classes and your part-time job?', zh: '你怎麼安排上課和打工的時間？', keys: ['*'], ex: ['I make a schedule every week and try to finish assignments early.'] },
        { ai: 'What do you plan to do after graduation?', zh: '你畢業後打算做什麼？', keys: ['*'], ex: ['I plan to find an internship and then work abroad.'] },
      ],
    }],
  },
  u2: {
    name: '學術英文', badge: '學術', level: 'uni', color: '#1971c2', theme: '論文寫作・研究方法・學術討論',
    words: [
      ['hypothesis', '假設', ''], ['data', '資料；數據', '📊'], ['methodology', '研究方法論', ''], ['sample', '樣本', ''], ['variable', '變數', ''],
      ['significant', '顯著的；重要的', ''], ['correlation', '相關性', ''], ['conclusion', '結論', ''], ['reference', '參考文獻', '📚'], ['citation', '引用', ''],
      ['plagiarism', '抄襲', '🚫'], ['argument', '論點', ''], ['framework', '架構', ''], ['theory', '理論', ''], ['empirical', '實證的', ''],
      ['qualitative', '質性的', ''], ['quantitative', '量化的', ''], ['objective', '客觀的；目標', ''], ['subjective', '主觀的', ''], ['bias', '偏見；偏誤', ''],
      ['limitation', '限制', ''], ['implication', '含意；影響', ''], ['review', '回顧；審查', ''], ['experiment', '實驗', '🧪'], ['participant', '參與者', ''],
      ['statistics', '統計', '📈'], ['publish', '出版；發表', '📰'],
    ],
    sentences: [
      ['Our hypothesis was supported by the data.', '我們的假設獲得資料支持。'], ['The sample included 200 university students.', '樣本包含 200 名大學生。'],
      ['There is a significant correlation between sleep and grades.', '睡眠和成績之間有顯著的相關性。'], ['Please list all your references at the end of the paper.', '請在論文最後列出所有參考文獻。'],
      ['Plagiarism is a serious academic offense.', '抄襲是嚴重的學術違規。'], ['This study has several limitations.', '這項研究有幾項限制。'],
      ['We used both qualitative and quantitative methods.', '我們同時使用了質性與量化方法。'], ['Try to keep your writing objective.', '試著讓你的寫作保持客觀。'],
      ['The results have important implications for teachers.', '這些結果對教師有重要的意涵。'], ['In conclusion, more research is needed.', '總之，還需要更多研究。'],
      ['Each participant completed a short survey.', '每位參與者都填了一份簡短的問卷。'], ['Her paper was published in an international journal.', '她的論文發表在國際期刊上。'],
    ],
    dialogues: [{
      title: '研究討論', icon: '', turns: [
        { ai: 'What is your research topic?', zh: '你的研究主題是什麼？', keys: ['*'], ex: ['My research topic is how social media affects sleep.'] },
        { ai: 'What method will you use to collect data?', zh: '你會用什麼方法蒐集資料？', keys: ['*'], ex: ['I will use an online survey and some interviews.'] },
        { ai: 'What do you expect to find?', zh: '你預期會發現什麼？', keys: ['*'], ex: ['I expect that students who use phones at night sleep less.'] },
        { ai: 'What are the limitations of your study?', zh: '你的研究有什麼限制？', keys: ['*'], ex: ['The sample size is small, so the results may not be general.'] },
      ],
    }],
  },
  u3: {
    name: '職場英文', badge: '職場', level: 'uni', color: '#c2255c', theme: '多益常見情境・會議・面試・客戶往來',
    words: [
      ['colleague', '同事', '👥'], ['manager', '經理', '👔'], ['client', '客戶', '🤝'], ['meeting', '會議', '👨‍💼'], ['agenda', '議程', '📋'],
      ['appointment', '預約；約會', '🗓️'], ['invoice', '發票；請款單', '🧾'], ['contract', '合約', '📝'], ['negotiate', '談判', '⚖️'], ['department', '部門', '🏢'],
      ['promotion', '升遷；促銷', '📈'], ['salary', '薪水', '💵'], ['resume', '履歷', '📄'], ['interview', '面試', '🎙️'], ['apply', '申請；應徵', '✉️'],
      ['candidate', '應徵者', '🙋'], ['qualified', '合格的', '✅'], ['customer', '顧客', '🛍️'], ['discount', '折扣', '🏷️'], ['order', '訂購', '🛒'],
      ['deliver', '運送', '🚚'], ['shipment', '貨物', '📦'], ['refund', '退款', '💸'], ['complaint', '抱怨；客訴', '😤'], ['confirm', '確認', '✔️'],
      ['postpone', '延後', '⏸️'], ['attach', '附加', '📎'], ['reply', '回覆', '↩️'], ['conference', '研討會', '🎤'],
    ],
    sentences: [
      ['Could we schedule a meeting for Monday morning?', '我們可以把會議安排在星期一早上嗎？'], ['Please find the invoice attached.', '請查收附件中的發票。'],
      ['The meeting has been postponed until next week.', '會議已延到下週。'], ["I'm calling to confirm my appointment.", '我打來確認我的預約。'],
      ['Our manager is in a meeting right now.', '我們經理現在正在開會。'], ['The shipment will be delivered within three days.', '貨物將在三天內送達。'],
      ['I would like to apply for the marketing position.', '我想應徵行銷職位。'], ['Please send your resume by email.', '請用電子郵件寄送您的履歷。'],
      ['We can offer you a ten percent discount.', '我們可以給您九折優惠。'], ['The customer asked for a full refund.', '這位顧客要求全額退款。'],
      ['Thank you for your quick reply.', '謝謝您的快速回覆。'], ['She got a promotion and a higher salary.', '她升職了，薪水也更高了。'],
    ],
    dialogues: [{
      title: '工作面試', icon: '', turns: [
        { ai: 'Could you tell me a little about yourself?', zh: '可以簡單介紹一下你自己嗎？', keys: ['*'], ex: ['I graduated from National Taiwan University, and I majored in business.'] },
        { ai: 'Why do you want to work for our company?', zh: '你為什麼想在我們公司工作？', keys: ['*'], ex: ['Because your company is a leader in this field, and I want to grow with you.'] },
        { ai: 'What are your strengths and weaknesses?', zh: '你的優點和缺點是什麼？', keys: ['*'], ex: ['My strength is that I am a good team player. My weakness is that I am sometimes too careful.'] },
        { ai: 'Do you have any questions for us?', zh: '你有什麼問題想問我們嗎？', keys: ['*'], ex: ['Yes. What does a typical day look like in this position?'] },
      ],
    }],
  },
});

// ---------- 新對話的提示（句型 + 可以用的字） ----------
Object.assign(CHAT_HINTS, {
  'Hi! Are you a new student here?': ["Yes, I am. / No, I'm not.", ['Yes, I am.', "No, I'm not.", 'new', 'student']],
  'Which club do you want to join?': ['I want to join the ___ club.', ['music', 'basketball', 'art', 'English', 'science', 'dance']],
  'What do you usually do after school?': ['I usually ___ after school.', ['do my homework', 'go to cram school', 'play basketball', 'read comic books']],
  'What is your favorite subject? Why?': ['My favorite subject is ___ because ___.', ['English', 'math', 'science', 'P.E.', 'it is interesting', 'it is easy']],
  'Where are you going this summer vacation?': ['I am going to ___.', ['Japan', 'Tainan', 'the beach', 'stay home']],
  'What will you do there?': ['I will ___.', ['visit some temples', 'eat local food', 'go shopping', 'take a lot of photos']],
  'What should you pack for the trip?': ['I should pack ___.', ['my passport', 'clothes', 'an umbrella', 'some medicine']],
  'Do you think students should use smartphones at school?': ["Yes, I think so. / No, I don't think so.", ['Yes, I think so.', "No, I don't think so.", 'because']],
  'Why do you think so?': ['Because ___.', ['they help us learn', 'they are bad for our eyes', 'we can find information quickly']],
  'What can we do to protect the earth?': ['We can ___.', ['reduce waste', 'save energy', 'recycle bottles', 'take the bus']],
  'What is your goal after you graduate?': ['I want to ___.', ['go to a good senior high school', 'learn more English', 'travel abroad']],
  'What is the biggest challenge in your life now?': ['The biggest challenge is ___.', ['managing my time', 'the pressure of exams', 'making new friends']],
  'How do you deal with stress?': ['I ___ when I feel stressed.', ['listen to music', 'go jogging', 'talk to my friends', 'sleep early']],
  'Would you like to be a volunteer? Why?': ['Yes, because ___. / No, because ___.', ['I want to help others', 'it is meaningful', 'I am too busy']],
  'What skill do you want to improve this year?': ['I want to improve my ___.', ['speaking skills', 'writing skills', 'time management', 'math']],
  'How much time do you spend on social media every day?': ['I spend about ___ on social media every day.', ['one hour', 'two hours', 'thirty minutes']],
  'Do you think social media has more benefits or problems?': ['I think it has more ___ because ___.', ['benefits', 'problems', 'we can share information quickly', 'it wastes time']],
  'How can we tell if news is reliable?': ['We should ___.', ['check the source', 'look for evidence', 'compare different news']],
  'Should students wear school uniforms? Why or why not?': ['I think students should / should not wear uniforms because ___.', ['it saves time', 'it is fair', 'students want to be free']],
  'What do you think is the most important skill for the future?': ['I think ___ is the most important skill.', ['critical thinking', 'communication', 'creativity', 'English']],
  'Can you give an example?': ['For example, ___.', ['we need to judge whether news is true', 'AI is changing many jobs']],
  'Which university department are you interested in?': ['I am interested in ___.', ['computer science', 'medicine', 'business', 'foreign languages']],
  'How do you prepare for the exam?': ['I ___.', ['review my notes every day', 'do practice tests', 'study with my friends']],
  "What's your major, and why did you choose it?": ['My major is ___ because ___.', ['computer science', 'economics', 'English', 'I love it', 'it is useful']],
  'How do you like living in the dorm?': ['I like it, but ___.', ['it is a little noisy', 'the room is small', 'I miss home']],
  'How do you manage your time between classes and your part-time job?': ['I ___.', ['make a schedule every week', 'finish assignments early', 'work on weekends only']],
  'What do you plan to do after graduation?': ['I plan to ___.', ['find an internship', 'go to graduate school', 'work abroad']],
  'What is your research topic?': ['My research topic is ___.', ['how social media affects sleep', 'online learning', 'climate change']],
  'What method will you use to collect data?': ['I will use ___.', ['an online survey', 'interviews', 'an experiment']],
  'What do you expect to find?': ['I expect that ___.', ['students who use phones at night sleep less', 'the results will be positive']],
  'What are the limitations of your study?': ['The main limitation is that ___.', ['the sample size is small', 'the study is short', 'the data is self-reported']],
  'Could you tell me a little about yourself?': ['I graduated from ___, and I majored in ___.', ['National Taiwan University', 'business', 'engineering', 'English']],
  'Why do you want to work for our company?': ['Because ___.', ['your company is a leader in this field', 'I want to grow with you', 'I like your products']],
  'What are your strengths and weaknesses?': ['My strength is ___. My weakness is ___.', ['that I am a good team player', 'that I learn fast', 'that I am sometimes too careful']],
  'Do you have any questions for us?': ['Yes. ___?', ['What does a typical day look like', 'What training do you offer', 'When will I hear from you']],
});
