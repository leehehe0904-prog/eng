// =============================================
//  Python 完整教學：從第一支程式到物件導向
//  每章：{ ch: '章名', t: '主題', p: ['重點'], code: `可以執行的範例`, lang: 'python' | 'js', input: '給 input() 的資料' }
//  注意：範例寫在 ` ` 裡面，程式中的反斜線要寫成兩個（\\n 代表 Python 的 \n）
// =============================================
const CODE_GUIDE = [
  { ch: '1. 第一支程式', t: '認識 Python 與 print', p: [
    'Python 是全世界最受歡迎的程式語言之一，語法接近英文，很適合初學者。',
    '**print()** 會把括號裡的內容顯示出來；文字（字串）要用 **"雙引號"** 或 **\'單引號\'** 包起來。',
    '程式由上往下**一行一行**執行。',
    '**#** 後面是**註解**，給人看的說明，電腦不會執行。',
    'Python **大小寫有分別**：print 不能寫成 Print。',
  ], code: `# 我的第一支程式
print("Hello, World!")
print('你好，Python！')
print(2026)
print("1 + 2 =", 1 + 2)` },

  { ch: '2. 輸出與跳脫字元', t: 'print 的用法與 \\n、\\t', p: [
    'print 一次可以印很多個值，用逗號分開，中間會自動加一個空格。',
    '**sep=** 設定值與值之間的分隔，**end=** 設定最後要加什麼（預設是換行）。',
    '**跳脫字元**：在字串中用反斜線 \\ 表示特殊字元。',
    '**\\n** 換行、**\\t** 跳格（Tab）、**\\\\** 反斜線本身、**\\"** 雙引號、**\\\'** 單引號。',
    '**三引號** """ … """ 可以寫好幾行的字串。',
  ], code: `print("第一行\\n第二行\\n第三行")
print("名字\\t分數")
print("小明\\t95")
print("他說：\\"你好！\\"")
print("檔案在 C:\\\\Users\\\\Amy")

print("2026", "11", "17", sep="-")
print("等一下", end="……")
print("繼續印在同一行")

poem = """床前明月光，
疑是地上霜。"""
print(poem)` },

  { ch: '3. 字串格式化', t: 'f 字串與格式', p: [
    '在字串前面加 **f**，就可以把變數放在 **{ }** 裡：f"我 {age} 歲"。',
    '**{x:.2f}** 小數點後 2 位；**{x:,}** 加千分位逗號；**{x:>5}** 靠右、寬度 5；**{x:<5}** 靠左；**{x:^9}** 置中。',
    '**{x:05d}** 不足 5 位前面補 0；**{x:%}** 百分比。',
    '也可以在 { } 裡面直接計算：f"{a + b}"。',
  ], code: `name = "Amy"
score = 95.678
money = 1234567
print(f"{name} 的分數是 {score:.1f}")
print(f"存款：{money:,} 元")
print(f"[{name:>8}]")
print(f"[{name:<8}]")
print(f"[{name:^8}]")
print(f"座號 {7:03d}")
print(f"正確率 {0.875:.1%}")
print(f"3 x 4 = {3 * 4}")` },

  { ch: '4. 變數與資料型態', t: '變數、型態、命名規則', p: [
    '**變數**用來存放資料：age = 10（= 是「把右邊的值放進左邊」）。',
    '常見型態：**int** 整數、**float** 小數、**str** 字串、**bool** 布林（True / False）、**None** 空值。',
    '用 **type()** 查看型態。',
    '命名規則：英文字母或底線開頭，可以有數字，不能有空格、不能用關鍵字（if、for…）；大小寫不同。',
    '一次指定多個：a, b = 1, 2；交換：a, b = b, a。',
  ], code: `age = 12
height = 150.5
name = "小明"
is_student = True
nothing = None
for v in [age, height, name, is_student, nothing]:
    print(v, type(v))

a, b = 1, 2
a, b = b, a
print("交換後：", a, b)` },

  { ch: '5. 運算子', t: '算術、比較、邏輯運算', p: [
    '算術：**+ − * /**（/ 的結果一定是小數）、**//** 整數除法、**%** 取餘數、兩個星號 ** 是次方。',
    '複合指定：+=、-=、*=、/=，例如 x += 1 就是 x = x + 1。',
    '比較：**==** 等於、**!=** 不等於、**> < >= <=**，結果是 True 或 False。',
    '邏輯：**and**（兩個都要成立）、**or**（一個成立就好）、**not**（相反）。',
    '優先順序：括號 → 次方 → 乘除 → 加減 → 比較 → not → and → or。',
  ], code: `print(7 / 2, 7 // 2, 7 % 2, 2 ** 10)
x = 10
x += 5
x *= 2
print("x =", x)
print(3 > 2, 3 == 3.0, "a" != "A")
age = 13
print(age >= 12 and age < 15)
print(not True or False)
print(round(3.14159, 2), abs(-7), max(3, 9, 4))` },

  { ch: '6. 輸入與型態轉換', t: 'input、int、float、str', p: [
    '**input("提示")** 讀取使用者輸入，得到的**一定是字串**。',
    '**int()** 轉整數、**float()** 轉小數、**str()** 轉字串。',
    '一行輸入多個數字：a, b = map(int, input().split())。',
    '在本網站，input 的資料要寫在編輯器下方的「輸入資料」，一行一筆。',
  ], code: `name = input("你的名字？")
age = int(input("你幾歲？"))
a, b = map(int, input("輸入兩個數字（用空格分開）：").split())
print(f"{name} 明年 {age + 1} 歲")
print(f"{a} + {b} = {a + b}")
print("10" + "5", int("10") + int("5"), str(10) + "5")`, input: '小明\n12\n3 8' },

  { ch: '7. 字串', t: '索引、切片與字串方法', p: [
    '字串的每個字都有**索引**：從 0 開始；**-1** 是最後一個。',
    '**切片** s[開始:結束:間隔]：包含開始、不包含結束；s[::-1] 反轉。',
    '**len(s)** 長度；**"a" in s** 檢查有沒有。',
    '常用方法：**upper() lower() strip() replace() split() join() find() count() startswith()**。',
    '字串**不能直接修改**某一個字，要做出新的字串。',
  ], code: `s = "Hello Python"
print(s[0], s[-1], s[0:5], s[6:], s[::-1])
print(len(s), "Py" in s)
print(s.upper(), s.lower())
print("  space  ".strip() + "!")
print(s.replace("Python", "World"))
words = "apple,banana,cherry".split(",")
print(words)
print(" / ".join(words))
print(s.find("Py"), s.count("o"), s.startswith("He"))` },

  { ch: '8. 條件判斷', t: 'if、elif、else', p: [
    '**if 條件:** 底下**縮排**的程式，條件成立才執行；別忘了冒號。',
    '**elif** 再檢查其他條件；**else** 以上都不成立時執行。',
    '條件由上往下檢查，**第一個成立的**就執行，後面不再檢查。',
    '一行的寫法：結果 = A if 條件 else B。',
    '0、""、[]、None 會被當成 False，其他大多是 True。',
  ], code: `score = int(input("分數："))
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "D"
print("等第：", grade)

result = "及格" if score >= 60 else "不及格"
print(result)

if score % 2 == 0:
    print("是偶數")`, input: '86' },

  { ch: '9. for 迴圈', t: 'for、range、enumerate、zip', p: [
    '**for 變數 in 序列:** 把序列裡的東西一個一個拿出來。',
    '**range(n)**：0～n−1；**range(a, b)**：a～b−1；**range(a, b, 間隔)**：可以跳著數或倒數。',
    '**enumerate()** 同時拿到「第幾個」和「值」；**zip()** 把兩個串列配對。',
    '迴圈裡可以再放迴圈（**巢狀迴圈**），例如九九乘法表。',
  ], code: `for i in range(5):
    print(i, end=" ")
print()
for i in range(10, 0, -3):
    print(i, end=" ")
print()
for ch in "Hi!":
    print(ch)
fruits = ["蘋果", "香蕉", "葡萄"]
for i, f in enumerate(fruits, start=1):
    print(i, f)
prices = [30, 20, 50]
for f, p in zip(fruits, prices):
    print(f"{f}：{p} 元")
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i}x{j}={i*j}", end="\\t")
    print()` },

  { ch: '10. while 迴圈', t: 'while、break、continue', p: [
    '**while 條件:** 條件成立就一直重複，適合「不知道要做幾次」的情況。',
    '要確定條件**最後會變成 False**，不然會變成**無窮迴圈**。',
    '**break**：立刻跳出整個迴圈。',
    '**continue**：跳過這一次，直接進入下一次。',
  ], code: `n = 1
while n <= 5:
    print("第", n, "次")
    n += 1

total = 0
while True:
    total += 7
    if total > 30:
        break
print("超過 30 了：", total)

for i in range(1, 11):
    if i % 3 == 0:
        continue
    print(i, end=" ")` },

  { ch: '11. 串列 list', t: '串列的建立與操作', p: [
    '串列用 **[ ]** 存很多資料，可以放不同型態，**索引從 0 開始**。',
    '新增：**append()** 加到最後、**insert(i, x)** 插入；刪除：**pop()**、**remove(x)**、**del a[i]**。',
    '排序：**a.sort()** 直接改原串列；**sorted(a)** 產生新串列；reverse=True 由大到小。',
    '**len sum max min**；**x in a** 檢查有沒有；**a.index(x)** 找位置；**a.count(x)** 數幾個。',
    '**二維串列**：串列裡放串列，像表格 a[列][行]。',
  ], code: `scores = [88, 72, 95]
scores.append(60)
scores.insert(0, 100)
print(scores)
scores.remove(72)
last = scores.pop()
print("拿掉", last, "→", scores)
print(sorted(scores), sorted(scores, reverse=True))
print(len(scores), sum(scores), max(scores), min(scores))
print(95 in scores, scores.index(95))
print(scores[1:3], scores[-1])
grid = [[1, 2, 3], [4, 5, 6]]
print(grid[1][2])
for row in grid:
    print(row)` },

  { ch: '12. 串列生成式', t: '一行產生串列', p: [
    '**[運算式 for 變數 in 序列]**：快速做出新串列。',
    '加上條件：**[運算式 for 變數 in 序列 if 條件]**。',
    '比用 for + append 簡短，但太複雜時還是用一般迴圈比較好讀。',
  ], code: `squares = [n * n for n in range(1, 11)]
print(squares)
evens = [n for n in range(20) if n % 2 == 0]
print(evens)
words = ["cat", "elephant", "dog", "giraffe"]
print([w.upper() for w in words if len(w) > 3])
print([[i * j for j in range(1, 4)] for i in range(1, 4)])` },

  { ch: '13. 元組與集合', t: 'tuple 與 set', p: [
    '**元組 tuple** 用 ( )，跟串列很像但**不能修改**，適合固定的資料，例如座標 (3, 5)。',
    '**解包**：x, y = (3, 5)。',
    '**集合 set** 用 { }，**不會有重複**、沒有順序，常用來去除重複。',
    '集合運算：**&** 交集、**|** 聯集、**−** 差集。',
  ], code: `point = (3, 5)
x, y = point
print(x, y)
nums = [3, 1, 3, 2, 1, 5]
print(set(nums))
a = {"小明", "小華", "小美"}
b = {"小華", "小強"}
print("兩隊都有：", a & b)
print("全部的人：", a | b)
print("只有 A 隊：", a - b)` },

  { ch: '14. 字典 dict', t: '用「鍵：值」存資料', p: [
    '字典用 **{鍵: 值}**：d = {"name": "Amy", "age": 12}。',
    '**d["name"]** 取值；鍵不存在會錯，**d.get("鍵", 預設值)** 比較安全。',
    '新增或修改：d["score"] = 95；刪除：**del d["age"]** 或 **d.pop("age")**。',
    '**keys() values() items()** 分別拿到所有鍵、值、鍵值對。',
    '很適合拿來**計數**：count[w] = count.get(w, 0) + 1。',
  ], code: `student = {"name": "Amy", "age": 12}
student["score"] = 95
print(student["name"], student.get("phone", "沒有電話"))
for k, v in student.items():
    print(k, "→", v)
text = "to be or not to be"
count = {}
for w in text.split():
    count[w] = count.get(w, 0) + 1
print(count)
print(sorted(count.items(), key=lambda kv: kv[1], reverse=True))` },

  { ch: '15. 函式', t: 'def、參數、return', p: [
    '**def 函式名(參數):** 定義函式；**return** 把結果傳回；沒有 return 就回傳 None。',
    '**預設參數**：def greet(name="同學")；**關鍵字參數**：greet(name="Amy")。',
    '可以一次回傳多個值（其實是元組）：return 最大, 最小。',
    '函式裡的變數是**區域變數**，外面看不到。',
    '函式下第一行的 """說明""" 叫 docstring，用來寫函式的用途。',
  ], code: `def greet(name="同學", times=1):
    """跟某人打招呼"""
    for _ in range(times):
        print(f"哈囉，{name}！")

greet()
greet("Amy", times=2)

def stats(nums):
    return max(nums), min(nums), sum(nums) / len(nums)

hi, lo, avg = stats([70, 85, 92, 64])
print(hi, lo, round(avg, 1))

def area(r):
    pi = 3.14159
    return pi * r ** 2
print(round(area(3), 2))` },

  { ch: '16. lambda、map、filter、sorted', t: '小函式與好用的內建函式', p: [
    '**lambda 參數: 運算式**：只有一行的小函式。',
    '**map(函式, 串列)**：每個都套用；**filter(函式, 串列)**：留下符合的。',
    '**sorted(資料, key=…)**：依照指定的方式排序。',
    '**any()** 有一個為真就是 True；**all()** 全部為真才是 True。',
  ], code: `double = lambda x: x * 2
print(double(21))
nums = [5, 12, 7, 20, 3]
print(list(map(lambda n: n * n, nums)))
print(list(filter(lambda n: n > 6, nums)))
students = [("Amy", 88), ("Ben", 95), ("Cat", 72)]
print(sorted(students, key=lambda s: s[1], reverse=True))
print(sorted(["banana", "kiwi", "apple"], key=len))
print(any(n > 15 for n in nums), all(n > 0 for n in nums))` },

  { ch: '17. 錯誤處理', t: 'try、except、finally、raise', p: [
    '程式出錯會停下來；用 **try / except** 可以「接住」錯誤，讓程式繼續。',
    '常見錯誤：**ValueError**（值不對）、**ZeroDivisionError**（除以 0）、**IndexError**、**KeyError**、**TypeError**、**NameError**。',
    '**finally**：不管有沒有錯都會執行。',
    '**raise**：自己丟出錯誤，例如檢查到不合理的資料。',
  ], code: `for text in ["12", "abc", "0"]:
    try:
        n = int(text)
        print(100 / n)
    except ValueError:
        print(text, "不是數字")
    except ZeroDivisionError:
        print("不能除以 0")
    finally:
        print("--- 檢查完", text)

def set_age(age):
    if age < 0:
        raise ValueError("年齡不能是負數")
    return age

try:
    set_age(-3)
except ValueError as e:
    print("錯誤：", e)` },

  { ch: '18. 模組 import', t: 'math、random、datetime', p: [
    '**import 模組**：使用別人寫好的工具；**from 模組 import 名稱**：只拿需要的。',
    '**math**：sqrt 開根號、pi、floor 無條件捨去、ceil 無條件進位、gcd 最大公因數。',
    '**random**：randint 隨機整數、choice 隨機選一個、shuffle 打亂。',
    '**datetime**：日期和時間。',
  ], code: `import math
import random
from datetime import date

print(math.sqrt(144), round(math.pi, 4), math.floor(3.9), math.ceil(3.1), math.gcd(36, 48))
print(random.randint(1, 6))
print(random.choice(["剪刀", "石頭", "布"]))
cards = [1, 2, 3, 4, 5]
random.shuffle(cards)
print(cards)
print("今天是", date.today())` },

  { ch: '19. 類別與物件', t: 'class、__init__、self、繼承', p: [
    '**類別 class** 像「設計圖」，**物件**是照設計圖做出來的東西。',
    '**__init__** 是建立物件時自動執行的方法，用來設定**屬性**。',
    '**self** 代表「這個物件自己」，方法的第一個參數一定是 self。',
    '**繼承**：class 子類別(父類別)，子類別擁有父類別的功能，還可以改寫或加新的。',
  ], code: `class Pet:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound
        self.energy = 5

    def speak(self):
        print(f"{self.name}：{self.sound}！")

    def play(self):
        self.energy -= 2
        print(f"{self.name} 玩得好開心，體力剩 {self.energy}")

class Dog(Pet):
    def __init__(self, name):
        super().__init__(name, "汪汪")

    def fetch(self):
        print(f"{self.name} 把球撿回來了")

cat = Pet("咪咪", "喵")
dog = Dog("小黑")
cat.speak()
dog.speak()
dog.play()
dog.fetch()` },

  { ch: '20. 遞迴', t: '函式呼叫自己', p: [
    '**遞迴**：把問題拆成「一樣但更小」的問題，函式自己呼叫自己。',
    '一定要有**終止條件**，否則會無限呼叫（RecursionError）。',
    '經典例子：階乘、費氏數列、河內塔。',
    '重複計算太多時，可用**記憶化**（把算過的存起來）加速。',
  ], code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
print(factorial(10))

memo = {}
def fib(n):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]
print([fib(i) for i in range(20)])

def hanoi(n, a, b, c):
    if n == 1:
        print(f"{a} → {c}")
        return
    hanoi(n - 1, a, c, b)
    print(f"{a} → {c}")
    hanoi(n - 1, b, a, c)
hanoi(3, "A", "B", "C")` },

  { ch: '21. 常用演算法', t: '最大公因數、質數、搜尋、排序', p: [
    '**輾轉相除法**求最大公因數：gcd(a, b) = gcd(b, a % b)，直到餘數為 0。',
    '**質數判斷**：只要檢查到 √n 就夠了。',
    '**二分搜尋**：資料已排序時每次砍一半，O(log n)。',
    '**選擇排序**：每次找最小的放到前面，O(n²)。',
  ], code: `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
print("gcd(84, 36) =", gcd(84, 36))

def is_prime(n):
    if n < 2:
        return False
    i = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i += 1
    return True
print([n for n in range(2, 60) if is_prime(n)])

def selection_sort(a):
    a = a[:]
    for i in range(len(a)):
        m = min(range(i, len(a)), key=lambda k: a[k])
        a[i], a[m] = a[m], a[i]
    return a
print(selection_sort([29, 3, 17, 8, 42, 1]))

def binary_search(a, x):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == x:
            return mid
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
print(binary_search([1, 3, 8, 17, 29, 42], 29))` },

  { ch: '22. 檔案讀寫', t: 'open、with、read、write', p: [
    '**open(檔名, 模式)**：模式 **"w"** 寫入（覆蓋）、**"a"** 附加、**"r"** 讀取。',
    '用 **with open(…) as f:** 寫法，結束時會自動關閉檔案。',
    '**f.write()** 寫入；**f.read()** 讀全部；**for line in f:** 一行一行讀。',
    '中文檔案記得加 **encoding="utf-8"**。（本網站的檔案存在瀏覽器暫時的空間，重新整理就會消失）',
  ], code: `with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("今天學了 Python\\n")
    f.write("我會寫檔案了！\\n")

with open("diary.txt", "a", encoding="utf-8") as f:
    f.write("明天要學類別\\n")

with open("diary.txt", encoding="utf-8") as f:
    for i, line in enumerate(f, start=1):
        print(i, line.strip())` },

  { ch: '23. Python 與 JavaScript 對照', t: '兩種語言比一比', lang: 'js', p: [
    '輸出：Python **print()** ↔ JavaScript **console.log()**。',
    '變數：Python 直接 x = 1 ↔ JS **let x = 1;**（不會改的用 **const**）。',
    '區塊：Python 用**縮排和冒號** ↔ JS 用 **{ }**。',
    '條件：**elif** ↔ **else if**；**and / or / not** ↔ **&& / || / !**；== ↔ **===**。',
    '迴圈：for i in range(5) ↔ **for (let i = 0; i < 5; i++)**；串列 list ↔ 陣列 Array；字典 dict ↔ 物件 Object。',
    '函式：def f(x): ↔ **function f(x) { }** 或 **(x) => …**；f 字串 ↔ 樣板字串 **`${x}`**。',
  ], code: `// 這是 JavaScript（右上角可以切換語言）
const name = "Amy";
let score = 88;
if (score >= 90 && name !== "") {
  console.log("A");
} else if (score >= 80) {
  console.log(\`\${name} 拿到 B\`);
}
for (let i = 0; i < 3; i++) {
  console.log("第", i, "次");
}
const nums = [3, 1, 2];
const doubled = nums.map(n => n * 2);
console.log(doubled, nums.length);
const pet = { name: "咪咪", age: 2 };
console.log(pet.name, Object.keys(pet));
function add(a, b) {
  return a + b;
}
console.log(add(2, 3));` },
];
