// =============================================
//  化學教學影片（YouTube）：每個主題一部，題目解析和知識庫都會嵌入播放
//  影片都用 YouTube oEmbed 確認過「存在、可以嵌入」，標題和主題相符
//  影片可能被作者下架：執行 node tools/check-videos.mjs 可以重新檢查
// =============================================
const CHEM_VIDEOS = {
  // ---------- 國小高年級 ----------
  states: { id: 'iGZZ-KDUICg', title: '[ 科學與科技 ] 水溶液的溶解現象', ch: '有夠好。就是要讓你懂' },
  acidbase_e: { id: 'JrXGun2dBXI', title: '[ 科學與科技 ] 水溶液的酸鹼性', ch: '有夠好。就是要讓你懂' },
  combustion: { id: 'y0Jf64uWj9U', title: '【生活裡的科學】燃燒假恐怖', ch: '大愛電視' },
  rust: { id: 'N2bDuowzPQ0', title: '【TRY科學】鐵鏽不再來，鍍鋅防鏽原理科學動畫', ch: '大愛電視' },
  o2co2: { id: 'tsYs8nmbfPg', title: '小五下自然 燃燒與生鏽：氧氣、二氧化碳與生鏽', ch: '孩子王' },
  conduct: { id: 'oD27iFvqABk', title: '[ 科學與科技 ] 水溶液的導電性', ch: '有夠好。就是要讓你懂' },
  // ---------- 國中理化 ----------
  atom: { id: '2Hju5sgeGQQ', title: '【物質的基本結構】原子的結構', ch: '均一教育平台' },
  periodic: { id: 'cL14aZD8rsw', title: '【物質的基本結構】元素週期表', ch: '均一教育平台' },
  formula: { id: 'xga-lLCOFWM', title: '【物質的基本結構】分子與化學式', ch: '均一教育平台' },
  mixture: { id: 'fFXhepkJEjs', title: '【認識物質】混合物分離', ch: '均一教育平台' },
  concentration: { id: 'UOT-9pOx9_A', title: '【認識物質】濃度', ch: '均一教育平台' },
  conservation: { id: 'YWxQuM_a2mU', title: '國二理化 化學反應、質量守恆', ch: 'FOX老師教學分享' },
  equation: { id: 'JbDIkbEcyzc', title: '國二下理化 認識化學反應式：基本概念', ch: 'nemo的生物教室' },
  mole: { id: 'NP3WTzo7M9E', title: '莫耳數的觀念剖析', ch: '鍾傑自然' },
  redox: { id: 'fsHAn6Gw-4s', title: '國二下理化 氧化還原反應原理', ch: 'nemo的生物教室' },
  electrolyte: { id: 'MdVn3zFpYHc', title: '電解質與非電解質（國中理化）', ch: '劉維自然' },
  ph: { id: 'Ais2ZiGw3OU', title: '八下理化 酸鹼中和：中和反應原理、常見鹽類', ch: '何肇忠老師' },
  rate_eq: { id: 'sievIibV9SM', title: '國二自然 反應速率與平衡', ch: '鍾傑自然' },
  // ---------- 高中化學 ----------
  econfig: { id: '_VMKVEt33AM', title: '認真說化10分鐘：電子能階的大小順序與電子組態的填寫', ch: '吉米師' },
  trend: { id: 'iQjsdoLvQvs', title: '游離能、電負度及電子親和力', ch: '陪著阿羽長知識' },
  bond: { id: 'SPVtgwFMaOI', title: '化學鍵結：金屬鍵、離子鍵、共價鍵', ch: '威克漢化學' },
  shape: { id: '9qMTq0B6u-0', title: '價殼層電子對互斥：理論與分子形狀', ch: '東方王' },
  imf: { id: 'zAd74okYmn8', title: '認真說化10分鐘：分子極性與分子間的作用力', ch: '吉米師' },
  stoich: { id: 'vb9u-4ggarM', title: '化學計量：限量試劑及產率的概念', ch: '東方王' },
  gas: { id: 'P1S5SCOj-FM', title: '氣體：波以耳、查理、亞佛加厥定律與 PV = nRT', ch: '威克漢化學' },
  molarity: { id: 'MwhuknZtSPE', title: '溶液濃度的表示：體積莫耳濃度', ch: '冠緯學長陪你學' },
  thermo: { id: 'cM_mjhCsxhs', title: '化學反應的能量變化', ch: '高貫洲' },
  lechatelier: { id: 's7rq_YNiGPk', title: '勒沙特列原理：濃度對平衡的影響', ch: 'Fuyu' },
  electrochem: { id: 'cInEeZZ8CaY', title: '電化學：電化電池、電解電池、電池表示法', ch: "NICHT's course" },
  organic: { id: 'C8OLLaR7MHM', title: '高三化學：有機化合物的官能基介紹', ch: '臺北酷課雲' },
};
