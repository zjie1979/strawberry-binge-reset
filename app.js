const STORAGE_KEY = "strawberryBingeReset.v1";

const plans = [
  {
    id: "reset-original",
    name: "暴食后恢复 A",
    tag: "当天",
    desc: "适合前一晚聚餐、夜宵、高油高盐后。按进食结束时间顺延第一餐。",
    steps: [
      ["起床后", "温水 2-3 杯。"],
      ["第一餐前", "黑咖啡 1 杯，可加少量牛奶。"],
      ["第一餐", "鸡蛋 2 个，或鸡胸 200-300g。"],
      ["下午加餐", "番茄、黄瓜、半个苹果或燕麦饼；饿了可加奶咖。"],
      ["傍晚正餐", "鸡腿肉、鸡胸、虾仁或牛肉约 150g。"],
      ["全天", "水 1.5-2L，晚上不渴就少喝。"]
    ]
  },
  {
    id: "reset-flex",
    name: "暴食后恢复 B",
    tag: "灵活",
    desc: "适合想吃得不太寡淡的一天，下午有酸奶或水果选项。",
    steps: [
      ["起床后", "温水 3 杯，分开喝完。"],
      ["中午前后", "黑咖啡 1 杯。"],
      ["12 点左右", "煎蛋 2 个，或番茄炒蛋。"],
      ["下午 3 点", "无糖酸奶 1 杯，或半个火龙果；可配红茶/奶咖。"],
      ["5 点半", "煎牛肉 150g、虾仁 200g 或鸡腿 1 个，任选一。"],
      ["规则", "6 点后停止进食；可连续 1-2 天，不建议频繁反复。"]
    ]
  },
  {
    id: "reset-light",
    name: "暴食后恢复 C",
    tag: "清淡",
    desc: "食物更简单，适合前一天吃到很撑后让肠胃休息。",
    steps: [
      ["12 点左右", "温水 2 杯，半小时后黑咖啡 1 杯。"],
      ["第一餐", "鸡蛋 1 个 + 黄瓜 1 根，或黄瓜炒蛋。"],
      ["下午 3 点", "蒸红薯、蒸紫薯或老南瓜 100g。"],
      ["5 点左右", "鸡蛋 1 个 + 蛋白 1 个。"],
      ["饿了补充", "半根黄瓜或 1 杯奶咖。"],
      ["全天", "约 8 杯温水，柠檬水也可以。"]
    ]
  },
  {
    id: "reset-v3-fast",
    name: "恢复 3.0 快速版",
    tag: "一天",
    desc: "三餐都很明确，适合只想照表执行。",
    steps: [
      ["早", "水 1 杯 + 咖啡 1 杯，可加少量牛奶；鸡蛋 1 个。"],
      ["中", "鸡蛋 2 个 + 紫薯 1 根。"],
      ["晚", "鸡腿 1 个。"],
      ["全天", "温水 1.5L 左右。"]
    ]
  },
  {
    id: "reset-v3-two-day",
    name: "恢复 3.0 饱腹版",
    tag: "1-2 天",
    desc: "鸡腿和粗粮更多，饱腹感更强，也可用于平台期短期调整。",
    steps: [
      ["早", "水 1 杯 + 咖啡 1 杯 + 鸡蛋 1 个。"],
      ["中", "烤鸡腿 2 个 + 玉米或紫薯 1 根。"],
      ["下午 3-4 点", "绿茶 1 杯，可加少量牛奶。"],
      ["晚", "烤鸡腿 1 个或玉米 1 根。"],
      ["全天", "温水 1.5L；鸡腿不用刻意去皮。"]
    ]
  },
  {
    id: "holiday-meal",
    name: "节假日聚餐日",
    tag: "聚餐",
    desc: "不是暴食后补救，而是当天有一顿聚餐时的轻量安排。",
    steps: [
      ["晚上聚餐时", "早上和中午各吃鸡蛋 + 小红薯；晚上聚餐吃到 8 分饱。"],
      ["中午聚餐时", "早起豆浆 1 杯；中午正常聚餐；晚上苹果 1 个或鸡胸 100g。"],
      ["全天", "温水约 1000ml，聚餐放中午更容易控制。"]
    ]
  }
];

const state = loadState();

const planList = document.querySelector("#planList");
const stepList = document.querySelector("#stepList");
const todayPanel = document.querySelector("#todayPanel");
const activePlanName = document.querySelector("#activePlanName");
const progressText = document.querySelector("#progressText");
const stepCount = document.querySelector("#stepCount");
const completeBtn = document.querySelector("#completeBtn");
const historyList = document.querySelector("#historyList");
const planCount = document.querySelector("#planCount");

function loadState() {
  const fallback = { activePlanId: plans[0].id, checked: {}, history: [] };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getActivePlan() {
  return plans.find((plan) => plan.id === state.activePlanId) || plans[0];
}

function getCheckedSet() {
  const key = todayKey();
  const plan = getActivePlan();
  state.checked[key] ||= {};
  state.checked[key][plan.id] ||= [];
  return new Set(state.checked[key][plan.id]);
}

function setCheckedSet(set) {
  const key = todayKey();
  const plan = getActivePlan();
  state.checked[key] ||= {};
  state.checked[key][plan.id] = [...set];
  saveState();
}

function renderPlans() {
  planCount.textContent = `${plans.length} 个`;
  planList.innerHTML = plans.map((plan) => `
    <button class="plan-button ${plan.id === state.activePlanId ? "active" : ""}" type="button" data-plan="${plan.id}">
      <span class="plan-title">${plan.name}<span class="badge">${plan.tag}</span></span>
      <span class="plan-desc">${plan.desc}</span>
    </button>
  `).join("");
}

function renderSteps() {
  const plan = getActivePlan();
  const checked = getCheckedSet();
  const done = checked.size;
  const total = plan.steps.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  activePlanName.textContent = plan.name;
  progressText.textContent = `${percent}%`;
  document.documentElement.style.setProperty("--progress", `${percent}%`);
  todayPanel.hidden = false;
  stepCount.textContent = `${done}/${total}`;
  completeBtn.disabled = done !== total;

  stepList.innerHTML = plan.steps.map(([name, food], index) => `
    <button class="check-row ${checked.has(index) ? "done" : ""}" type="button" data-step="${index}">
      <span class="box" aria-hidden="true"></span>
      <span>
        <span class="step-name">${name}</span>
        <span class="step-food">${food}</span>
      </span>
    </button>
  `).join("");
}

function renderHistory() {
  const items = state.history.slice(0, 8);
  if (!items.length) {
    historyList.innerHTML = `<p class="empty">还没有完成记录。</p>`;
    return;
  }
  historyList.innerHTML = items.map((item) => `
    <div class="history-item">
      <strong>${item.planName}</strong>
      <span>${item.date} 完成 · ${item.steps} 项</span>
    </div>
  `).join("");
}

function render() {
  renderPlans();
  renderSteps();
  renderHistory();
}

planList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-plan]");
  if (!button) return;
  state.activePlanId = button.dataset.plan;
  saveState();
  render();
});

stepList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-step]");
  if (!button) return;
  const index = Number(button.dataset.step);
  const checked = getCheckedSet();
  if (checked.has(index)) checked.delete(index);
  else checked.add(index);
  setCheckedSet(checked);
  render();
});

completeBtn.addEventListener("click", () => {
  const plan = getActivePlan();
  const date = todayKey();
  state.history = state.history.filter((item) => !(item.date === date && item.planId === plan.id));
  state.history.unshift({ date, planId: plan.id, planName: plan.name, steps: plan.steps.length });
  saveState();
  render();
});

document.querySelector("#resetTodayBtn").addEventListener("click", () => {
  const key = todayKey();
  const plan = getActivePlan();
  if (state.checked[key]) {
    state.checked[key][plan.id] = [];
  }
  saveState();
  render();
});

document.querySelector("#clearHistoryBtn").addEventListener("click", () => {
  state.history = [];
  saveState();
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

render();
