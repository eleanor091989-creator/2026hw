const APP_CONFIG = {
  jd: {
    pageTag: "JOB DESCRIPTION",
    pageTitle: "職缺 JD",
    pageDescription: "集中管理職缺需求、年資條件與關鍵字設定，方便後續履歷比對。",
    addLabel: "新增職缺",
    searchPlaceholder: "搜尋職缺名稱、部門、關鍵字",
    filterLabel: "全部狀態",
    storageKey: "hr_admin_jd",
    statusOptions: ["進行中", "待更新", "已結束"],
    columns: [
      { key: "jobTitle", label: "職缺名稱" },
      { key: "department", label: "部門" },
      { key: "experience", label: "需求年資" },
      { key: "keywords", label: "關鍵字" },
      { key: "status", label: "狀態", badge: true }
    ],
    fields: [
      { name: "jobTitle", label: "職缺名稱", type: "text", required: true },
      { name: "department", label: "部門", type: "text", required: true },
      { name: "experience", label: "需求年資", type: "text", required: true },
      { name: "keywords", label: "關鍵字", type: "textarea", full: true },
      { name: "status", label: "狀態", type: "select", options: ["進行中", "待更新", "已結束"], required: true }
    ],
    defaults: [
      { id: "jd-1", jobTitle: "招募專員", department: "人資部", experience: "2 年以上", keywords: "面談、招募、履歷篩選", status: "進行中" },
      { id: "jd-2", jobTitle: "教育訓練專員", department: "人資部", experience: "1 年以上", keywords: "培訓、課程規劃、內訓", status: "待更新" },
      { id: "jd-3", jobTitle: "薪酬福利管理師", department: "人資部", experience: "3 年以上", keywords: "薪資、保險、勞基法", status: "進行中" }
    ],
    stats(records) {
      return [
        { label: "總職缺數", value: records.length },
        { label: "進行中", value: records.filter((item) => item.status === "進行中").length },
        { label: "待更新", value: records.filter((item) => item.status === "待更新").length }
      ];
    }
  },
  resume: {
    pageTag: "RESUME",
    pageTitle: "履歷",
    pageDescription: "彙整候選人履歷資料，快速查看匹配度、年資與招募狀態。",
    addLabel: "新增履歷",
    searchPlaceholder: "搜尋姓名、應徵職缺、狀態",
    filterLabel: "全部狀態",
    storageKey: "hr_admin_resume",
    statusOptions: ["已完成初篩", "待安排面談", "已進入複試", "已淘汰"],
    columns: [
      { key: "name", label: "姓名" },
      { key: "role", label: "應徵職缺" },
      { key: "match", label: "關鍵字匹配" },
      { key: "experience", label: "工作年資" },
      { key: "status", label: "目前狀態", badge: true }
    ],
    fields: [
      { name: "name", label: "姓名", type: "text", required: true },
      { name: "role", label: "應徵職缺", type: "text", required: true },
      { name: "match", label: "關鍵字匹配", type: "text", required: true },
      { name: "experience", label: "工作年資", type: "text", required: true },
      { name: "status", label: "目前狀態", type: "select", options: ["已完成初篩", "待安排面談", "已進入複試", "已淘汰"], required: true }
    ],
    defaults: [
      { id: "resume-1", name: "王小雅", role: "招募專員", match: "88%", experience: "3 年", status: "已完成初篩" },
      { id: "resume-2", name: "林子晴", role: "教育訓練專員", match: "81%", experience: "2 年", status: "待安排面談" },
      { id: "resume-3", name: "陳冠宇", role: "薪酬福利管理師", match: "76%", experience: "4 年", status: "已進入複試" }
    ],
    stats(records) {
      return [
        { label: "總履歷數", value: records.length },
        { label: "待安排面談", value: records.filter((item) => item.status === "待安排面談").length },
        { label: "已進入複試", value: records.filter((item) => item.status === "已進入複試").length }
      ];
    }
  },
  interviewed: {
    pageTag: "INTERVIEWED",
    pageTitle: "已面談",
    pageDescription: "管理已完成面談的候選人，方便追蹤評估結果與後續安排。",
    addLabel: "新增面談紀錄",
    searchPlaceholder: "搜尋姓名、職缺、結果",
    filterLabel: "全部狀態",
    storageKey: "hr_admin_interviewed",
    statusOptions: ["安排複試", "待回覆", "準備錄用"],
    columns: [
      { key: "name", label: "姓名" },
      { key: "role", label: "應徵職缺" },
      { key: "date", label: "面談日期" },
      { key: "result", label: "評估結果" },
      { key: "status", label: "下一步", badge: true }
    ],
    fields: [
      { name: "name", label: "姓名", type: "text", required: true },
      { name: "role", label: "應徵職缺", type: "text", required: true },
      { name: "date", label: "面談日期", type: "text", required: true },
      { name: "result", label: "評估結果", type: "text", required: true },
      { name: "status", label: "下一步", type: "select", options: ["安排複試", "待回覆", "準備錄用"], required: true }
    ],
    defaults: [
      { id: "interviewed-1", name: "張雅婷", role: "招募專員", date: "2026/04/10", result: "表現佳", status: "安排複試" },
      { id: "interviewed-2", name: "李承恩", role: "教育訓練專員", date: "2026/04/09", result: "待主管確認", status: "待回覆" },
      { id: "interviewed-3", name: "黃詠心", role: "薪酬福利管理師", date: "2026/04/08", result: "符合需求", status: "準備錄用" }
    ],
    stats(records) {
      return [
        { label: "已面談總數", value: records.length },
        { label: "安排複試", value: records.filter((item) => item.status === "安排複試").length },
        { label: "準備錄用", value: records.filter((item) => item.status === "準備錄用").length }
      ];
    }
  },
  "not-interviewed": {
    pageTag: "NOT INTERVIEWED",
    pageTitle: "未面談",
    pageDescription: "整理待安排面談候選人，快速追蹤通知狀態與備註。",
    addLabel: "新增待面談名單",
    searchPlaceholder: "搜尋姓名、職缺、備註",
    filterLabel: "全部狀態",
    storageKey: "hr_admin_not_interviewed",
    statusOptions: ["待通知", "待主管確認", "待聯繫"],
    columns: [
      { key: "name", label: "姓名" },
      { key: "role", label: "應徵職缺" },
      { key: "match", label: "履歷匹配" },
      { key: "status", label: "目前進度", badge: true },
      { key: "note", label: "備註" }
    ],
    fields: [
      { name: "name", label: "姓名", type: "text", required: true },
      { name: "role", label: "應徵職缺", type: "text", required: true },
      { name: "match", label: "履歷匹配", type: "text", required: true },
      { name: "status", label: "目前進度", type: "select", options: ["待通知", "待主管確認", "待聯繫"], required: true },
      { name: "note", label: "備註", type: "textarea", full: true }
    ],
    defaults: [
      { id: "not-interviewed-1", name: "吳佩蓉", role: "招募專員", match: "84%", status: "待通知", note: "可安排本週面談" },
      { id: "not-interviewed-2", name: "周彥廷", role: "教育訓練專員", match: "79%", status: "待主管確認", note: "需補作品集" },
      { id: "not-interviewed-3", name: "蔡宜庭", role: "薪酬福利管理師", match: "82%", status: "待聯繫", note: "可下週安排" }
    ],
    stats(records) {
      return [
        { label: "待面談總數", value: records.length },
        { label: "待通知", value: records.filter((item) => item.status === "待通知").length },
        { label: "待聯繫", value: records.filter((item) => item.status === "待聯繫").length }
      ];
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setupHomeInteractions();

  const pageKey = document.body.dataset.page;
  highlightActiveNav(pageKey);

  if (!APP_CONFIG[pageKey]) return;

  const config = APP_CONFIG[pageKey];
  ensureSeedData(config);

  const pageTag = document.getElementById("pageTag");
  const pageTitle = document.getElementById("pageTitle");
  const pageDescription = document.getElementById("pageDescription");
  const addRecordBtn = document.getElementById("addRecordBtn");
  const statsGrid = document.getElementById("statsGrid");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalTag = document.getElementById("modalTag");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const recordForm = document.getElementById("recordForm");

  let editingId = null;

  pageTag.textContent = config.pageTag;
  pageTitle.textContent = config.pageTitle;
  pageDescription.textContent = config.pageDescription;
  addRecordBtn.textContent = config.addLabel;
  searchInput.placeholder = config.searchPlaceholder;
  modalTag.textContent = config.pageTag;

  statusFilter.innerHTML = `<option value="">${config.filterLabel}</option>${config.statusOptions
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join("")}`;

  addRecordBtn.addEventListener("click", () => openModal("add"));
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);
  searchInput.addEventListener("input", render);
  statusFilter.addEventListener("change", render);

  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeModal();
  });

  tableBody.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const action = actionButton.dataset.action;
    const id = actionButton.dataset.id;
    const records = getRecords(config);
    const currentRecord = records.find((item) => item.id === id);

    if (action === "edit" && currentRecord) {
      openModal("edit", currentRecord);
    }

    if (action === "delete" && currentRecord) {
      const confirmed = window.confirm(`確定要刪除「${config.pageTitle}」這筆資料嗎？`);
      if (!confirmed) return;

      const nextRecords = records.filter((item) => item.id !== id);
      saveRecords(config, nextRecords);
      render();
    }
  });

  recordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(recordForm);
    const nextRecord = { id: editingId || String(Date.now()) };

    config.fields.forEach((field) => {
      nextRecord[field.name] = String(formData.get(field.name) || "").trim();
    });

    const records = getRecords(config);
    const nextRecords = editingId
      ? records.map((item) => (item.id === editingId ? nextRecord : item))
      : [nextRecord, ...records];

    saveRecords(config, nextRecords);
    closeModal();
    render();
  });

  render();

  function render() {
    const allRecords = getRecords(config);
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredRecords = allRecords.filter((record) => {
      const matchKeyword =
        !keyword ||
        Object.values(record).some((value) =>
          String(value).toLowerCase().includes(keyword)
        );

      const matchStatus = !selectedStatus || record.status === selectedStatus;
      return matchKeyword && matchStatus;
    });

    statsGrid.innerHTML = buildStats(config.stats(allRecords));
    tableHead.innerHTML = buildHead(config.columns);
    tableBody.innerHTML = buildBody(config.columns, filteredRecords);
  }

  function openModal(mode, record = {}) {
    editingId = record.id || null;
    modalTitle.textContent = mode === "edit" ? `編輯${config.pageTitle}` : config.addLabel;
    recordForm.innerHTML = buildForm(config.fields, record);
    modalOverlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
    editingId = null;
  }
});

function setupHomeInteractions() {
  const scrollButtons = document.querySelectorAll("[data-scroll]");
  scrollButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetSelector = button.getAttribute("data-scroll");
      const target = document.querySelector(targetSelector);
      if (!target) return;

      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
    });
  });
}

function highlightActiveNav(pageKey) {
  if (!pageKey) return;
  document.querySelectorAll(`[data-nav="${pageKey}"]`).forEach((item) => {
    item.classList.add("is-active");
  });
}

function ensureSeedData(config) {
  const existing = localStorage.getItem(config.storageKey);
  if (!existing) {
    localStorage.setItem(config.storageKey, JSON.stringify(config.defaults));
  }
}

function getRecords(config) {
  try {
    const raw = localStorage.getItem(config.storageKey);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveRecords(config, records) {
  localStorage.setItem(config.storageKey, JSON.stringify(records));
}

function buildStats(items) {
  return items
    .map(
      (item) => `
        <div class="stat-card">
          <p class="stat-label">${escapeHtml(item.label)}</p>
          <p class="stat-value">${escapeHtml(String(item.value))}</p>
        </div>
      `
    )
    .join("");
}

function buildHead(columns) {
  return `
    <tr>
      ${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
      <th>操作</th>
    </tr>
  `;
}

function buildBody(columns, records) {
  if (!records.length) {
    return `
      <tr>
        <td colspan="${columns.length + 1}" class="empty-row">目前沒有資料</td>
      </tr>
    `;
  }

  return records
    .map((record) => {
      const cells = columns
        .map((column) => {
          const value = record[column.key] || "";
          if (column.badge) {
            return `
              <td>
                <span class="status-badge ${getStatusClass(value)}">
                  ${escapeHtml(String(value))}
                </span>
              </td>
            `;
          }

          return `<td>${escapeHtml(String(value))}</td>`;
        })
        .join("");

      return `
        <tr>
          ${cells}
          <td class="row-actions">
            <button class="action-btn edit" data-action="edit" data-id="${escapeHtml(record.id)}">編輯</button>
            <button class="action-btn delete" data-action="delete" data-id="${escapeHtml(record.id)}">刪除</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function buildForm(fields, record) {
  return fields
    .map((field) => {
      const value = record[field.name] || "";
      const required = field.required ? "required" : "";
      const fullClass = field.full ? "full" : "";

      if (field.type === "textarea") {
        return `
          <label class="form-field ${fullClass}">
            <span>${escapeHtml(field.label)}</span>
            <textarea name="${escapeHtml(field.name)}" ${required}>${escapeHtml(String(value))}</textarea>
          </label>
        `;
      }

      if (field.type === "select") {
        return `
          <label class="form-field ${fullClass}">
            <span>${escapeHtml(field.label)}</span>
            <select name="${escapeHtml(field.name)}" ${required}>
              ${field.options
                .map((option) => {
                  const selected = option === value ? "selected" : "";
                  return `<option value="${escapeHtml(option)}" ${selected}>${escapeHtml(option)}</option>`;
                })
                .join("")}
            </select>
          </label>
        `;
      }

      return `
        <label class="form-field ${fullClass}">
          <span>${escapeHtml(field.label)}</span>
          <input type="${escapeHtml(field.type)}" name="${escapeHtml(field.name)}" value="${escapeHtml(String(value))}" ${required} />
        </label>
      `;
    })
    .join("");
}

function getStatusClass(status) {
  const activeSet = ["進行中", "已完成初篩", "已進入複試", "安排複試", "準備錄用"];
  const pendingSet = ["待更新", "待安排面談", "待回覆", "待通知", "待主管確認", "待聯繫"];

  if (activeSet.includes(status)) return "active";
  if (pendingSet.includes(status)) return "pending";
  return "neutral";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
