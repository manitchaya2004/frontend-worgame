import { PLAYER_X_POS, FIXED_Y } from "../../const/index";
import { sfx } from "../../utils/sfx";
import { WordSystem } from "../../utils/gameSystem";

// ✅ ฟังก์ชันหน่วงเวลา
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 🧠 AI Helper: คำนวณ Levenshtein Distance สำหรับหาคำลวง (Distractors)
const getLevenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

export const createEnemySlice = (set, get) => ({
  stageData: null,
  currentWave: 1,
  enemies: [],
  isDodging: false,
  currentQuiz: null,
  quizResolver: null,

  // --- ACTIONS ---
  

  // เกิดศัตรูในเวฟปัจจุบัน
  spawnEnemies: (loot) => {
    const store = get();
    const waveData = store.stageData ? store.stageData[store.currentWave] : [];

    if (!waveData || waveData.length === 0) {
      console.log("No enemies found for wave " + store.currentWave);
      set({ gameState: "GAME_CLEARED", playerShoutText: "MISSION COMPLETE!" });
      return;
    }

    const enemiesWithPos = waveData.map((e, i) => ({
      ...e,
      x: 85 - i * 10,
      hp: e.max_hp,
      shield: 0,
      currentStep: 1,
      selectedPattern: e.selectedPattern || 1,
    }));

    set({
      gameState: "PLAYERTURN",
      enemies: enemiesWithPos,
      playerData: {
        ...store.playerData,
        rp: store.playerData.max_rp,
        inventory: loot,
      },
    });
  },

  updateEnemy: (id, data) =>
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  // ระบบคำนวณดาเมจที่ทำต่อศัตรู (หักลบ Shield ก่อน HP)
  damageEnemy: (id, dmg) => {
    const target = get().enemies.find((e) => e.id === id);
    if (target) {
      let finalDmg = dmg;
      let currentShield = target.shield || 0;

      if (currentShield > 0) {
        if (currentShield >= dmg) {
          currentShield -= dmg;
          finalDmg = 0;
        } else {
          finalDmg -= currentShield;
          currentShield = 0;
        }
        get().updateEnemy(id, { shield: currentShield });
      }

      const newHp = Math.max(0, target.hp - finalDmg);
      get().updateEnemy(id, { hp: newHp });

      // แสดง Popup ตัวเลขดาเมจ
      get().addPopup({
        id: Math.random(),
        x: target.x - 2,
        y: FIXED_Y - 80,
        value: finalDmg,
      });
    }
  },

  // ตัดสินผล Quiz
  resolveQuiz: (answer) => {
    const store = get();
    if (!store.currentQuiz || !store.quizResolver) return;
    const isCorrect = answer === store.currentQuiz.correctAnswer;
    store.quizResolver(isCorrect);
    set({ currentQuiz: null, quizResolver: null });
  },

  // ⚔️ ระบบ AI ศัตรู (Enemy Turn)
  runEnemyTurn: async () => {
    const store = get();
    set({ playerShoutText: "", gameState: "ENEMYTURN" });

    // ✅ 1. รีเซ็ตเกราะศัตรูทุกตัวเมื่อเริ่มเทิร์นศัตรู
    const enemiesResetShield = store.enemies.map((e) => ({
      ...e,
      shield: 0,
    }));
    set({ enemies: enemiesResetShield });

    const currentEnemies = get().enemies;

    for (const en of currentEnemies) {
      if (en.hp <= 0) continue;
      if (get().playerData.hp <= 0) {
        set({ gameState: "OVER" });
        return;
      }

      // ดึง Action จาก Pattern ของศัตรู
      let actionObj = null;
      if (en.patternList) {
        actionObj = en.patternList.find(
          (p) => p.pattern_no === en.selectedPattern && p.order === en.currentStep
        );
      }

      const actionMove = actionObj ? actionObj.move.toUpperCase() : "WAIT";

      // คำนวณ Step ถัดไป (ถ้าจบ Pattern ให้วนกลับไป 1)
      let nextStep = en.currentStep + 1;
      const hasNext = en.patternList?.some(
        (p) => p.pattern_no === en.selectedPattern && p.order === nextStep
      );
      if (!hasNext) nextStep = 1;

      // --- EXECUTE AI ACTIONS ---

      // 🛡️ GUARD: เพิ่มเกราะ
      if (actionMove === "GUARD") {
        const shieldGain = en.def || 5;
        get().updateEnemy(en.id, { shoutText: "GUARD!" });
        await delay(400);

        const currentShield = en.shield || 0;
        const newShield = currentShield + shieldGain;

        get().updateEnemy(en.id, { shield: newShield });
        await delay(600);

        get().updateEnemy(en.id, {
          shoutText: "",
          currentStep: nextStep,
        });
        await delay(200);
        continue;
      }

      // ⚔️ ATTACK: โจมตีผู้เล่น
      if (actionMove === "ATTACK") {
        const dmg = Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min;
        const shoutWord = WordSystem.getRandomWordByLength(store.dictionary, Math.min(dmg, 8)) || "GRR!";

        get().updateEnemy(en.id, { shoutText: shoutWord });
        await delay(400);

        const originalX = en.x;
        get().updateEnemy(en.id, { x: PLAYER_X_POS+ 10 , atkFrame: 1 });
        await delay(400);

        get().damagePlayer(dmg);
        sfx.playHit();
        get().updateEnemy(en.id, { atkFrame: 2 });
        await delay(400);

        get().updateEnemy(en.id, {
          x: originalX,
          atkFrame: 0,
          shoutText: "",
          currentStep: nextStep,
        });
        await delay(200);
        continue;
      }

      // 💤 WAIT: ยืนนิ่งๆ
      if (actionMove === "WAIT") {
        get().updateEnemy(en.id, { shoutText: "...", currentStep: nextStep });
        get().addPopup({ id: Math.random(), x: en.x - 2, y: FIXED_Y - 80, value: 0 });
        await delay(800);
        get().updateEnemy(en.id, { shoutText: "" });
        continue;
      }

      // 🔥 SKILL: ท่าไม้ตาย (เปิดระบบ Quiz)
      if (actionMove === "SKILL") {
        const vocabList = store.dictionary;
        // 1. สุ่มคำตอบที่ถูก
        const correctEntry = vocabList[Math.floor(Math.random() * vocabList.length)];
        
        // 2. หาคำลวงที่เขียนคล้ายกันโดยใช้ Levenshtein Distance
        const choices = vocabList
          .filter((v) => v.word !== correctEntry.word)
          .map((v) => {
            let score = getLevenshteinDistance(correctEntry.word, v.word);
            score += Math.abs(correctEntry.word.length - v.word.length); // ความยาวต่างกันมาก = ยิ่งไม่เหมือน
            return { ...v, similarityScore: score };
          })
          .sort((a, b) => a.similarityScore - b.similarityScore)
          .slice(0, 3)
          .map((w) => w.word);

        // รวมคำถูก + คำลวง และสลับที่
        const finalChoices = [correctEntry.word, ...choices].sort(() => 0.5 - Math.random());

        set({ gameState: "QUIZ_MODE" });
const originalX = en.x;

  // 1. สั่งพุ่งไปหาผู้เล่นก่อน (ใช้ความเร็วปกติ)
  get().updateEnemy(en.id, {
    x: PLAYER_X_POS - 10, // ลองปรับเลขนี้ดูครับ (ค่าที่เหมาะสมคือให้ศัตรูอยู่ห่างจากผู้เล่นเล็กน้อย)
    shoutText: correctEntry.meaning,
    atkFrame: 1,
  });

  await delay(300); // รอให้ Animation พุ่งทำงานเสร็จ

  // 2. เปลี่ยนเป็น QUIZ_MODE เพื่อล็อกหน้าจอและแสดงคำถาม
  set({ 
    gameState: "QUIZ_MODE",
    currentQuiz: {
      question: correctEntry.meaning,
      correctAnswer: correctEntry.word,
      choices: finalChoices,
      enemyId: en.id,
    },
  });

  // 3. รอคำตอบ...
  const isCorrect = await new Promise((resolve) => {
    set({ quizResolver: resolve });
  });

  // 4. หลังจากตอบเสร็จ ค่อยจัดการ Action ต่อ
  set({ gameState: "ENEMYTURN" });
        await delay(50);
        get().updateEnemy(en.id, { x: PLAYER_X_POS, atkFrame: 2 });

        if (isCorrect) {
          // ถ้าตอบถูก ผู้เล่นจะหลบได้ (Miss)
          set({ isDodging: true });
          get().updateEnemy(en.id, { shoutText: "MISSED!" });
          get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 80, value: "MISS", isPlayer: true });
        } else {
          // ถ้าตอบผิด โดนดาเมจ 2 เท่า
          const dmg = (Math.floor(Math.random() * (en.atk_power_max - en.atk_power_min + 1)) + en.atk_power_min) * 2;
          sfx.playHit();
          get().damagePlayer(dmg);
        }

        await delay(1000);
        set({ isDodging: false });
        get().updateEnemy(en.id, {
          x: originalX,
          atkFrame: 0,
          shoutText: "",
          currentStep: nextStep,
        });
        await delay(500);
      }

      if (get().playerData.hp <= 0) {
        set({ gameState: "OVER" });
        return;
      }
    }

    // จบเทิร์นศัตรู -> เริ่มเทิร์นผู้เล่นใหม่
    if (get().playerData.hp > 0) {
      get().startPlayerTurn();
    }
  },
});