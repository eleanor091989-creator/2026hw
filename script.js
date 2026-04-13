import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const APP_CONFIG = {
  jd: {
    pageTag: "JOB DESCRIPTION",
    pageTitle: "職缺 JD",
    pageDescription: "集中管理職缺需求、年資條件與關鍵字設定，方便後續履歷比對。",
    addLabel: "新增職缺",
    searchPlaceholder: "搜尋職缺名稱、部門、關鍵字",
    filterLabel: "全部狀態",
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
      { jobTitle: "招募專員", department: "人資部", experience: "2 年以上", keywords: "面談、招募、履歷篩選", status: "進行中" },
      { jobTitle: "教育訓練專員", department: "人資部", experience: "1 年以上", keywords: "培訓、課程規劃、內訓", status: "待更新" },
      { jobTitle: "薪酬福利管理師", department: "人資部", experience: "3 年以上", keywords: "薪資、保險、勞基法", status: "進行中" }
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
      { name: "王小雅", role: "招募專員", match: "88%", experience: "3 年", status: "已完成初篩" },
      { name: "林子晴", role: "教育訓練專員", match: "81%", experience: "2 年", status: "待安排面談" },
      { name: "陳冠宇", role: "薪酬福利管理師", match: "76%", experience: "4 年", status: "已進入複試" }
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
      { name: "張雅婷", role: "招募專員", date: "2026/04/10", result: "表現佳", status: "安排複試" },
      { name: "李承恩", role: "教育訓練專員", date: "2026/04/09", result: "待主管確認", status: "待回覆" },
      { name: "黃詠心", role: "薪酬福利管理師", date: "2026/04/08", result: "符合需求", status: "準備錄用" }
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
      { name: "吳佩蓉", role: "招募專員", match: "84%", status: "待通知", note: "可安排本週面談" },
      { name: "周彥廷", role: "教育訓練專員", match: "79%", status: "待主管確認", note: "需補作品集" },
      { name: "蔡宜庭", role: "薪酬福利管理師", match: "82%", status: "待聯繫", note: "可下週安排" }
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

const pageKey = document.body.dataset.page;
const config = APP_CONFIG[pageKey];

let allRecords = [];
let editingId = null;
let unsubscribeRecords = null;

injectExtraStyles();
setupHomeInteractions();
highlightActiveNav(pageKey);

if (config) {
  initBackendPage();
}

function injectExtraStyles() {
  const style = document.createElement("style");
  style.textContent = `
    a.btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    body.modal-open {
      overflow: hidden;
    }

    .nav a.is-active {
      color: #b7791f;
    }

    .nav a.is-active::after {
      width: 100%;
    }

    .session-bar {
      width: min(1120px, calc(100% - 32px));
      margin: 96px auto 0;
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 22px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.04);
    }

    .session-user {
      font-size: 14px;
      color: #374151;
      word-break: break-all;
    }

    .backend-main {
      min-height: calc(100vh - 140px);
      padding: 24px 0 40px;
      background: #f7f5f1;
    }

    .backend-layout {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      gap: 24px;
      align-items: start;
      margin-top: 24px;
    }

    .backend-sidebar {
      position: sticky;
      top: 24px;
    }

    .sidebar-card {
      background: #111827;
      color: #ffffff;
      border-radius: 30px;
      padding: 28px;
      box-shadow: 0 12px 28px rgba(17, 24, 39, 0.14);
    }

    .sidebar-card h2 {
      margin: 12px 0 0;
      font-size: 28px;
      line-height: 1.25;
    }

    .sidebar-card p:not(.section-tag) {
      margin: 12px 0 0;
      color: rgba(255, 255, 255, 0.75);
    }

    .sidebar-links {
      margin-top: 18px;
      display: grid;
      gap: 12px;
    }

    .sidebar-links a {
      display: block;
      padding: 14px 16px;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid #e7e5e4;
      color: #374151;
      font-weight: 700;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.04);
      transition: all 0.25s ease;
    }

    .sidebar-links a:hover,
    .sidebar-links a.is-active {
      color: #92400e;
      border-color: #e0b74f;
      background: #fff7e6;
    }

    .backend-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 30px;
      padding: 28px;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.04);
    }

    .page-header h2 {
      margin: 12px 0 0;
      font-size: 38px;
      line-height: 1.15;
      color: #0f172a;
    }

    .page-desc {
      margin: 14px 0 0;
      color: #4b5563;
      line-height: 1.8;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: linear-gradient(135deg, #ffffff, #faf7f2);
      border: 1px solid #e7e5e4;
      border-radius: 24px;
      padding: 22px;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.04);
    }

    .stat-label {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      font-weight: 700;
    }

    .stat-value {
      margin: 10px 0 0;
      font-size: 32px;
      font-weight: 800;
      color: #111827;
    }

    .panel {
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 30px;
      padding: 24px;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.04);
    }

    .panel-toolbar {
      display: flex;
      gap: 16px;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .panel-input,
    .panel-select {
      min-height: 48px;
      border-radius: 16px;
      border: 1px solid #d6d3d1;
      background: #ffffff;
      padding: 0 16px;
      font-size: 15px;
      color: #1f2937;
    }

    .panel-input {
      width: min(360px, 100%);
    }

    .panel-select {
      min-width: 180px;
    }

    .panel-input:focus,
    .panel-select:focus,
    .form-field input:focus,
    .form-field textarea:focus,
    .form-field select:focus,
    .auth-input:focus {
      outline: none;
      border-color: #d4a017;
      box-shadow: 0 0 0 4px rgba(212, 160, 23, 0.12);
    }

    .empty-row {
      text-align: center !important;
      color: #6b7280;
      padding: 32px 16px !important;
    }

    .row-actions {
      white-space: nowrap;
    }

    .action-btn {
      border: none;
      border-radius: 14px;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: 8px;
    }

    .action-btn.edit {
      background: #f3f4f6;
      color: #374151;
    }

    .action-btn.edit:hover {
      background: #e5e7eb;
    }

    .action-btn.delete {
      background: #fee2e2;
      color: #b91c1c;
    }

    .action-btn.delete:hover {
      background: #fecaca;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
    }

    .status-badge.active {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.neutral {
      background: #e5e7eb;
      color: #374151;
    }

    .modal-overlay,
    .auth-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(15, 23, 42, 0.45);
    }

    .modal-overlay.hidden,
    .auth-overlay.hidden {
      display: none;
    }

    .modal-card,
    .auth-card {
      width: min(760px, 100%);
      background: #ffffff;
      border-radius: 30px;
      padding: 28px;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
    }

    .auth-card {
      width: min(460px, 100%);
    }

    .modal-header,
    .auth-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 22px;
    }

    .modal-header h3,
    .auth-header h3 {
      margin: 12px 0 0;
      font-size: 28px;
      color: #111827;
    }

    .icon-btn {
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 14px;
      background: #f3f4f6;
      color: #374151;
      font-size: 24px;
      cursor: pointer;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .form-field {
      display: block;
    }

    .form-field.full {
      grid-column: 1 / -1;
    }

    .form-field span {
      display: block;
      margin-bottom: 8px;
      color: #374151;
      font-size: 14px;
      font-weight: 700;
    }

    .form-field input,
    .form-field textarea,
    .form-field select,
    .auth-input {
      width: 100%;
      border: 1px solid #d6d3d1;
      border-radius: 16px;
      background: #ffffff;
      padding: 14px 16px;
      font: inherit;
      color: #1f2937;
    }

    .form-field textarea {
      min-height: 120px;
      resize: vertical;
    }

    .modal-actions,
    .auth-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 22px;
      flex-wrap: wrap;
    }

    .auth-form {
      display: grid;
      gap: 14px;
    }

    .auth-help {
      margin-top: 10px;
      color: #6b7280;
      font-size: 14px;
      line-height: 1.7;
    }

    .auth-error {
      margin-top: 12px;
      color: #b91c1c;
      font-size: 14px;
      min-height: 22px;
    }

    @media (max-width: 1024px) {
      .backend-layout {
        grid-template-columns: 1fr;
      }

      .backend-sidebar {
        position: static;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .session-bar {
        margin-top: 88px;
        flex-direction: column;
        align-items: flex-start;
      }

      .page-header {
        flex-direction: column;
      }

      .page-header h2 {
        font-size: 32px;
      }

      .panel-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .panel-input,
      .panel-select {
        width: 100%;
      }

      .table-card {
        padding: 14px;
      }

      .modal-card,
      .auth-card {
        padding: 22px;
      }
    }
  `;
  document.head.appendChild(style);
}

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

function highlightActiveNav(activeKey) {
  if (!activeKey) return;
  document.querySelectorAll(`[data-nav="${activeKey}"]`).forEach((item) => {
    item.classList.add("is-active");
  });
}

function initBackendPage() {
  buildAuthOverlay();
  buildSessionBar();

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

  tableBody.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const action = actionButton.dataset.action;
    const id = actionButton.dataset.id;
    const currentRecord = allRecords.find((item) => item.id === id);

    if (action === "edit" && currentRecord) {
      openModal("edit", currentRecord);
    }

    if (action === "delete" && currentRecord) {
      const confirmed = window.confirm(`確定要刪除「${config.pageTitle}」這筆資料嗎？`);
      if (!confirmed) return;

      await deleteDoc(doc(db, "hr_admin", pageKey, "records", id));
    }
  });

  recordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(recordForm);
    const payload = {};

    config.fields.forEach((field) => {
      payload[field.name] = String(formData.get(field.name) || "").trim();
    });

    payload.updatedAt = serverTimestamp();

    if (editingId) {
      await updateDoc(doc(db, "hr_admin", pageKey, "records", editingId), payload);
    } else {
      payload.createdAt = serverTimestamp();
      await addDoc(collection(db, "hr_admin", pageKey, "records"), payload);
    }

    closeModal();
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      updateSessionBar(user);
      hideAuthOverlay();
      await seedDefaultsIfEmpty();
      subscribeRecords();
    } else {
      updateSessionBar(null);
      showAuthOverlay();
      allRecords = [];
      render();
      if (unsubscribeRecords) unsubscribeRecords();
    }
  });

  function subscribeRecords() {
    if (unsubscribeRecords) unsubscribeRecords();

    unsubscribeRecords = onSnapshot(
      collection(db, "hr_admin", pageKey, "records"),
      (snapshot) => {
        allRecords = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));
        render();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async function seedDefaultsIfEmpty() {
    const ref = collection(db, "hr_admin", pageKey, "records");
    const snapshot = await getDocs(ref);
    if (!snapshot.empty) return;

    for (const item of config.defaults) {
      await addDoc(ref, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }

  function render() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredRecords = allRecords.filter((record) => {
      const matchKeyword =
        !keyword ||
        Object.values(record).some((value) => String(value).toLowerCase().includes(keyword));

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
}

function buildAuthOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "auth-overlay hidden";
  overlay.id = "authOverlay";
  overlay.innerHTML = `
    <div class="auth-card">
      <div class="auth-header">
        <div>
          <p class="section-tag">LOGIN REQUIRED</p>
          <h3>登入 HR 共用後台</h3>
        </div>
      </div>

      <form class="auth-form" id="authForm">
        <input class="auth-input" id="authEmail" type="email" placeholder="請輸入 Email" required />
        <input class="auth-input" id="authPassword" type="password" placeholder="請輸入密碼" required />

        <div class="auth-actions">
          <button class="btn btn-secondary" type="button" id="registerBtn">註冊</button>
          <button class="btn btn-primary" type="submit">登入</button>
        </div>

        <p class="auth-help">第一次使用可直接輸入 Email 與密碼後按「註冊」，之後再用同組帳號登入。</p>
        <div class="auth-error" id="authError"></div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const authForm = document.getElementById("authForm");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authError = document.getElementById("authError");
  const registerBtn = document.getElementById("registerBtn");

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authError.textContent = "";

    try {
      await signInWithEmailAndPassword(auth, authEmail.value.trim(), authPassword.value.trim());
    } catch (error) {
      authError.textContent = translateAuthError(error);
    }
  });

  registerBtn.addEventListener("click", async () => {
    authError.textContent = "";

    try {
      await createUserWithEmailAndPassword(auth, authEmail.value.trim(), authPassword.value.trim());
    } catch (error) {
      authError.textContent = translateAuthError(error);
    }
  });
}

function buildSessionBar() {
  const header = document.querySelector(".site-header");
  const bar = document.createElement("div");
  bar.className = "session-bar";
  bar.id = "sessionBar";
  bar.innerHTML = `
    <div class="session-user" id="sessionUser">尚未登入</div>
    <button class="btn btn-secondary" id="logoutBtn" type="button">登出</button>
  `;
  header.insertAdjacentElement("afterend", bar);

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
  });
}

function updateSessionBar(user) {
  const sessionUser = document.getElementById("sessionUser");
  if (!sessionUser) return;

  sessionUser.textContent = user ? `目前登入：${user.email || "已登入使用者"}` : "尚未登入";
}

function showAuthOverlay() {
  document.getElementById("authOverlay")?.classList.remove("hidden");
}

function hideAuthOverlay() {
  document.getElementById("authOverlay")?.classList.add("hidden");
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

function translateAuthError(error) {
  const code = error?.code || "";

  if (code.includes("invalid-email")) return "Email 格式不正確";
  if (code.includes("missing-password")) return "請輸入密碼";
  if (code.includes("weak-password")) return "密碼至少需要 6 碼";
  if (code.includes("email-already-in-use")) return "這個 Email 已經註冊過";
  if (code.includes("invalid-credential")) return "帳號或密碼錯誤";
  if (code.includes("user-not-found")) return "找不到這個帳號";
  if (code.includes("wrong-password")) return "密碼錯誤";
  return "操作失敗，請稍後再試一次";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
