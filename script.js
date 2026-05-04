import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgt4XVsPxcI2XfKKdCEWxZTHgFOX2tRew",
  authDomain: "hr-backoffice-shared.firebaseapp.com",
  projectId: "hr-backoffice-shared",
  storageBucket: "hr-backoffice-shared.firebasestorage.app",
  messagingSenderId: "816300633926",
  appId: "1:816300633926:web:5841f03a3936c563fbff47"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const PAGE_CONFIG = {
  jd: {
    tag: "JOB DESCRIPTION",
    title: "職缺 JD 管理",
    desc: "管理所有職缺需求與關鍵字設定，作為履歷比對分析的基礎資料。",
    collection: "jd",
    modalTag: "JD",
    hasFile: false,
    statuses: ["招募中", "暫停", "已關閉"],
    stats: [
      { label: "總職缺數", key: "total" },
      { label: "招募中", key: "active" },
      { label: "已關閉", key: "closed" }
    ],
    columns: ["職缺名稱", "部門", "關鍵字", "狀態", "操作"],
    fields: [
      { key: "title", label: "職缺名稱", type: "text", required: true },
      { key: "department", label: "部門", type: "text" },
      { key: "keywords", label: "關鍵字（逗號分隔）", type: "text", full: true },
      { key: "description", label: "職缺說明", type: "textarea", full: true },
      { key: "status", label: "狀態", type: "select", options: ["招募中", "暫停", "已關閉"] }
    ]
  },
  resume: {
    tag: "RESUME",
    title: "履歷管理",
    desc: "集中管理候選人履歷，支援上傳檔案至 Firebase Storage，供所有 HR 下載使用。",
    collection: "resumes",
    modalTag: "RESUME",
    hasFile: true,
    statuses: ["已上傳", "已面談", "未面談", "不合適"],
    stats: [
      { label: "總履歷數", key: "total" },
      { label: "已上傳", key: "uploaded" },
      { label: "已面談", key: "interviewed" }
    ],
    columns: ["檔名", "應徵職缺", "狀態", "上傳時間", "操作"],
    fields: [
      { key: "jobTitle", label: "應徵職缺", type: "text", required: true },
      { key: "status", label: "目前狀態", type: "select", options: ["已上傳", "已面談", "未面談", "不合適"] }
    ]
  },
  interviewed: {
    tag: "INTERVIEWED",
    title: "已面談管理",
    desc: "整理已完成面談的人選資料，方便後續評估與錄用追蹤。",
    collection: "interviewed",
    modalTag: "INTERVIEWED",
    hasFile: false,
    statuses: ["通過", "待定", "不錄用"],
    stats: [
      { label: "已面談總數", key: "total" },
      { label: "通過", key: "passed" },
      { label: "待定", key: "pending" }
    ],
    columns: ["姓名", "應徵職缺", "面談日期", "結果", "操作"],
    fields: [
      { key: "name", label: "姓名", type: "text", required: true },
      { key: "jobTitle", label: "應徵職缺", type: "text" },
      { key: "interviewDate", label: "面談日期", type: "date" },
      { key: "result", label: "結果", type: "select", options: ["通過", "待定", "不錄用"] },
      { key: "notes", label: "備註", type: "textarea", full: true }
    ]
  },
  "not-interviewed": {
    tag: "NOT INTERVIEWED",
    title: "未面談管理",
    desc: "掌握待安排面談的人選，快速追蹤目前招募進度。",
    collection: "not-interviewed",
    modalTag: "NOT INTERVIEWED",
    hasFile: false,
    statuses: ["待聯繫", "已約時間", "未回應"],
    stats: [
      { label: "待面談總數", key: "total" },
      { label: "待聯繫", key: "pending" },
      { label: "已約時間", key: "scheduled" }
    ],
    columns: ["姓名", "應徵職缺", "收件日期", "狀態", "操作"],
    fields: [
      { key: "name", label: "姓名", type: "text", required: true },
      { key: "jobTitle", label: "應徵職缺", type: "text" },
      { key: "receivedDate", label: "收件日期", type: "date" },
      { key: "status", label: "狀態", type: "select", options: ["待聯繫", "已約時間", "未回應"] },
      { key: "notes", label: "備註", type: "textarea", full: true }
    ]
  }
};

// ─── 高亮 nav（所有頁面都執行）───────────────────────────────
function highlightNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach(a => {
    if (a.dataset.nav === page) a.classList.add("is-active");
  });
  document.querySelectorAll(".sidebar-links a[data-nav]").forEach(a => {
    if (a.dataset.nav === page) a.classList.add("is-active");
  });
}

highlightNav();

// ─── 後台頁面邏輯（只在有 config 的頁面執行）────────────────
function initBackend() {
  const page = document.body.dataset.page;
  const config = PAGE_CONFIG[page];
  if (!config) return; // index.html，不需執行

  const pageTag        = document.getElementById("pageTag");
  const pageTitle      = document.getElementById("pageTitle");
  const pageDesc       = document.getElementById("pageDescription");
  const statsGrid      = document.getElementById("statsGrid");
  const tableHead      = document.getElementById("tableHead");
  const tableBody      = document.getElementById("tableBody");
  const searchInput    = document.getElementById("searchInput");
  const statusFilter   = document.getElementById("statusFilter");
  const addRecordBtn   = document.getElementById("addRecordBtn");
  const modalOverlay   = document.getElementById("modalOverlay");
  const modalTag       = document.getElementById("modalTag");
  const modalTitle     = document.getElementById("modalTitle");
  const recordForm     = document.getElementById("recordForm");
  const closeModalBtn  = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const saveRecordBtn  = document.getElementById("saveRecordBtn");

  let allRecords = [];
  let editingId  = null;
  let selectedFile = null;

  function initPage() {
    pageTag.textContent   = config.tag;
    pageTitle.textContent = config.title;
    pageDesc.textContent  = config.desc;
    modalTag.textContent  = config.modalTag;

    statusFilter.innerHTML = `<option value="">全部狀態</option>`;
    config.statuses.forEach(s => {
      statusFilter.innerHTML += `<option value="${s}">${s}</option>`;
    });

    tableHead.innerHTML = `<tr>${config.columns.map(c => `<th>${c}</th>`).join("")}</tr>`;
  }

  async function loadRecords() {
    try {
      const q = query(collection(db, config.collection), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      allRecords = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      renderStats();
      renderTable();
    } catch (e) {
      console.error("載入資料失敗：", e);
    }
  }

  function renderStats() {
    const total = allRecords.length;
    const counts = {};
    allRecords.forEach(r => {
      const s = r.status || r.result || "";
      counts[s] = (counts[s] || 0) + 1;
    });

    const statMap = {
      total,
      active:      counts["招募中"] || 0,
      closed:      counts["已關閉"] || 0,
      uploaded:    counts["已上傳"] || 0,
      interviewed: counts["已面談"] || 0,
      passed:      counts["通過"] || 0,
      pending:     counts["待定"] || counts["待聯繫"] || 0,
      scheduled:   counts["已約時間"] || 0
    };

    statsGrid.innerHTML = config.stats.map(s => `
      <div class="stat-card">
        <p class="stat-label">${s.label}</p>
        <p class="stat-value">${statMap[s.key] ?? 0}</p>
      </div>
    `).join("");
  }

  function renderTable() {
    const search = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = allRecords.filter(r => {
      const text = Object.values(r).join(" ").toLowerCase();
      return (!search || text.includes(search))
          && (!status || r.status === status || r.result === status);
    });

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td class="empty-row" colspan="${config.columns.length}">尚無資料</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(r => {
      let cells = "";
      if (page === "jd") {
        cells = `
          <td>${r.title || "-"}</td>
          <td>${r.department || "-"}</td>
          <td>${r.keywords || "-"}</td>
          <td>${badgeHTML(r.status)}</td>
        `;
      } else if (page === "resume") {
        const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString("zh-TW") : "-";
        const dl = r.fileURL
          ? `<a href="${r.fileURL}" target="_blank" class="action-btn edit" style="text-decoration:none">下載</a>`
          : `<span style="color:#9ca3af">無檔案</span>`;
        cells = `
          <td>${r.fileName || "-"}</td>
          <td>${r.jobTitle || "-"}</td>
          <td>${badgeHTML(r.status)}</td>
          <td>${date}</td>
        `;
        return `<tr>
          ${cells}
          <td class="row-actions">
            ${dl}
            <button class="action-btn edit" data-edit="${r.id}">編輯</button>
            <button class="action-btn delete" data-delete="${r.id}" data-path="${r.storagePath || ""}">刪除</button>
          </td>
        </tr>`;
      } else if (page === "interviewed") {
        cells = `
          <td>${r.name || "-"}</td>
          <td>${r.jobTitle || "-"}</td>
          <td>${r.interviewDate || "-"}</td>
          <td>${badgeHTML(r.result)}</td>
        `;
      } else {
        cells = `
          <td>${r.name || "-"}</td>
          <td>${r.jobTitle || "-"}</td>
          <td>${r.receivedDate || "-"}</td>
          <td>${badgeHTML(r.status)}</td>
        `;
      }
      return `<tr>
        ${cells}
        <td class="row-actions">
          <button class="action-btn edit" data-edit="${r.id}">編輯</button>
          <button class="action-btn delete" data-delete="${r.id}">刪除</button>
        </td>
      </tr>`;
    }).join("");
  }

  function badgeHTML(status) {
    const map = {
      "招募中": "active", "通過": "active", "已上傳": "active",
      "暫停": "pending", "待定": "pending", "待聯繫": "pending", "已約時間": "pending",
      "已關閉": "neutral", "不錄用": "neutral", "不合適": "neutral", "未回應": "neutral"
    };
    return `<span class="status-badge ${map[status] || "neutral"}">${status || "-"}</span>`;
  }

  function buildForm(record = {}) {
    selectedFile = null;
    let html = "";

    if (page === "resume") {
      html += `
        <label class="form-field full">
          <span>上傳履歷</span>
          <div style="display:flex;align-items:center;gap:12px;border:1px solid #d6d3d1;border-radius:16px;padding:14px 16px;background:#fff">
            <button type="button" id="filePickerBtn" class="btn btn-secondary" style="white-space:nowrap;padding:8px 16px;border-radius:12px">選擇檔案</button>
            <span id="fileNameDisplay" style="color:#6b7280;font-size:14px">${record.fileName || "尚未選擇檔案"}</span>
          </div>
          <input type="file" id="resumeFileInput" accept=".pdf,.doc,.docx" style="display:none" />
        </label>
      `;
    }

    config.fields.forEach(f => {
      const val = record[f.key] || "";
      const cls = f.full ? "form-field full" : "form-field";
      if (f.type === "select") {
        html += `<label class="${cls}"><span>${f.label}</span>
          <select name="${f.key}">
            ${f.options.map(o => `<option value="${o}" ${val === o ? "selected" : ""}>${o}</option>`).join("")}
          </select></label>`;
      } else if (f.type === "textarea") {
        html += `<label class="${cls}"><span>${f.label}</span>
          <textarea name="${f.key}">${val}</textarea></label>`;
      } else {
        html += `<label class="${cls}"><span>${f.label}</span>
          <input type="${f.type}" name="${f.key}" value="${val}" ${f.required ? "required" : ""} /></label>`;
      }
    });

    recordForm.innerHTML = html;

    if (page === "resume") {
      const fileInput   = document.getElementById("resumeFileInput");
      const fileDisplay = document.getElementById("fileNameDisplay");
      const pickerBtn   = document.getElementById("filePickerBtn");
      pickerBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        selectedFile = fileInput.files[0] || null;
        fileDisplay.textContent = selectedFile ? selectedFile.name : "尚未選擇檔案";
      });
    }
  }

  function openModal(record = {}, id = null) {
    editingId = id;
    modalTitle.textContent = id ? "編輯資料" : "新增資料";
    buildForm(record);
    modalOverlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
    editingId = null;
    selectedFile = null;
  }

  async function saveRecord(e) {
    e.preventDefault();
    saveRecordBtn.disabled = true;
    saveRecordBtn.textContent = "儲存中...";

    const formData = new FormData(recordForm);
    const data = {};
    formData.forEach((v, k) => { data[k] = v; });

    try {
      if (page === "resume" && selectedFile) {
        const filePath = `resumes/${Date.now()}_${selectedFile.name}`;
        const storageRef = ref(storage, filePath);
        await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, selectedFile);
          task.on("state_changed", null, reject, async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            data.fileURL     = url;
            data.storagePath = filePath;
            data.fileName    = selectedFile.name;
            resolve();
          });
        });
      }

      if (editingId) {
        await updateDoc(doc(db, config.collection, editingId), { ...data });
      } else {
        await addDoc(collection(db, config.collection), { ...data, createdAt: serverTimestamp() });
      }

      closeModal();
      await loadRecords();
    } catch (err) {
      console.error("儲存失敗：", err);
      alert("儲存失敗：" + err.message);
    } finally {
      saveRecordBtn.disabled = false;
      saveRecordBtn.textContent = "儲存";
    }
  }

  async function deleteRecord(id, storagePath) {
    if (!confirm("確定要刪除此筆資料？")) return;
    try {
      await deleteDoc(doc(db, config.collection, id));
      if (storagePath) {
        await deleteObject(ref(storage, storagePath)).catch(() => {});
      }
      await loadRecords();
    } catch (err) {
      console.error("刪除失敗：", err);
    }
  }

  addRecordBtn.addEventListener("click", () => openModal());
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeModal(); });
  recordForm.addEventListener("submit", saveRecord);
  searchInput.addEventListener("input", () => renderTable());
  statusFilter.addEventListener("change", () => renderTable());

  tableBody.addEventListener("click", e => {
    const editBtn   = e.target.closest("[data-edit]");
    const deleteBtn = e.target.closest("[data-delete]");
    if (editBtn) {
      const record = allRecords.find(r => r.id === editBtn.dataset.edit);
      if (record) openModal(record, record.id);
    }
    if (deleteBtn) {
      deleteRecord(deleteBtn.dataset.delete, deleteBtn.dataset.path || "");
    }
  });

  initPage();
  loadRecords();
}

initBackend();
