var LS = {
  assessments: "adik_assessments_v1",
  bank: "adik_bank_v1",
  api: "adik_api_v1",
  draft: "adik_draft_v1",
  sync: "adik_sync_v1",
  school: "adik_school_v1"
};
var LS_OLD = {
  assessments: "roemah_edu_assessments_v1",
  bank: "roemah_edu_bank_v1",
  api: "roemah_edu_api_v1",
  draft: "roemah_edu_draft_v1",
  sync: "roemah_edu_sync_v1"
};
function migrateBrandKeys() {
  try {
    Object.keys(LS).forEach(function (k) {
      if (localStorage.getItem(LS[k]) == null && localStorage.getItem(LS_OLD[k]) != null) {
        localStorage.setItem(LS[k], localStorage.getItem(LS_OLD[k]));
      }
    });
  } catch (e) { }
}
migrateBrandKeys();

var ICON = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H15a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  files: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>',
  printer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 17h8v4H8z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h7V3"/><path d="M8 21v-6h8v6"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.5 12.5L20 3"/><path d="M17 6l3 3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V9"/><path d="M7 13l5-5 5 5"/><path d="M5 3h14"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5.6"/><path d="M18 20a6 6 0 0 0-3-5.2"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>',
  table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.5 4.5 0 0 0 7 18z"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM21 14h.01M14 21h.01"/></svg>'
};

var ASSESSMENT_TYPES = ["Asesmen Diagnostik", "Asesmen Formatif", "Asesmen Sumatif", "Ulangan Harian", "Ulangan Tengah Semester", "Ulangan Akhir Semester", "Ujian Praktik"];
var JENJANG = ["SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK", "SLB", "Madrasah Diniyah"];
var SEMESTER = ["Ganjil", "Genap"];
var MAPEL_BOGA = ["Dasar-dasar Kuliner", "P2M", "Tata Hidang", "Pastry dan Bakery", "Kewirausahaan", "Mapel Pilihan"];
var KELAS_BOGA = ["X", "XI", "XII"];
var TAHUN_AJARAN = ["2024/2025", "2025/2026", "2026/2027", "2027/2028"];
var BENTUK = [
  { v: "pg", l: "Pilihan Ganda" },
  { v: "pgk", l: "Pilihan Ganda Kompleks" },
  { v: "bs", l: "Benar/Salah" },
  { v: "menjodohkan", l: "Menjodohkan" },
  { v: "isian", l: "Isian Singkat" },
  { v: "uraian", l: "Uraian" },
  { v: "praktik", l: "Praktik" }
];
var KESULITAN = [
  { v: "mudah", l: "Mudah" },
  { v: "sedang", l: "Sedang" },
  { v: "sulit", l: "Sulit" },
  { v: "campuran", l: "Campuran" }
];
var KOGNITIF = [
  { v: "C1", l: "C1 Mengingat" },
  { v: "C2", l: "C2 Memahami" },
  { v: "C3", l: "C3 Menerapkan" },
  { v: "C4", l: "C4 Menganalisis" },
  { v: "C5", l: "C5 Mengevaluasi" },
  { v: "C6", l: "C6 Mencipta" }
];

var state = {
  page: "dashboard",
  resultTab: "soal",
  current: null,
  bankSelect: {},
  bankSelectSize: 0,
  filter: {
    riwayat: { q: "", jenis: "", mapel: "" },
    bank: { q: "", mapel: "", bentuk: "" }
  },
  pendingFocus: null,
  student: null,
  rekap: { aid: "", pulled: [], lastPull: null, loading: false, detail: null, scores: {} }
};

var formErrors = {};

var DOM = {
  content: document.getElementById("content"),
  title: document.getElementById("pageTitle"),
  subtitle: document.getElementById("pageSubtitle"),
  sidebar: document.getElementById("sidebar"),
  overlay: document.getElementById("sidebarOverlay"),
  modalRoot: document.getElementById("modalRoot"),
  toastWrap: document.getElementById("toastWrap"),
  sideConn: document.getElementById("sideConn"),
  printFrame: document.getElementById("printFrame")
};

function uid() {
  return "id" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function attr(s) { return esc(s); }
function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }

function load(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function persistSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    toast("warn", "Penyimpanan penuh", "Data tidak dapat disimpan di browser.");
  }
}

var assessments = load(LS.assessments, []);
var bank = load(LS.bank, []);
var MODEL_DEFAULT = "gemini-3.8-flash";
/* Penanda versi build - ditampilkan di Pengaturan API untuk memastikan browser
   sudah memuat JS terbaru (bukan versi lama dari cache). */
var APP_BUILD = "AI-2026.10.20a";
function migrateModel(m) {
  var s = String(m || "").trim();
  if (!s) return MODEL_DEFAULT;
  if (/^gemini-(1\.5|2\.0|2\.5)-flash/i.test(s)) return MODEL_DEFAULT;
  if (/^gemini-pro$/i.test(s)) return MODEL_DEFAULT;
  return s;
}
var apiConfig = load(LS.api, { provider: "gemini", model: MODEL_DEFAULT, key: "", lastTest: null, lastError: "" });
if (apiConfig && typeof apiConfig.key === "string") apiConfig.key = apiConfig.key.trim();
var _migratedModel = migrateModel(apiConfig.model);
if (_migratedModel !== apiConfig.model) { apiConfig.model = _migratedModel; apiConfig.lastTest = null; apiConfig.lastError = ""; try { persistSave(LS.api, apiConfig); } catch (e) { } }
var syncConfig = load(LS.sync, { endpoint: "", lastPull: null });
var schoolProfile = load(LS.school, { sekolah: "", dinas: "", alamat: "", kontak: "", logo: "", logo2: "" });
var draft = defaultDraft();
try { localStorage.removeItem(LS.draft); } catch (e) { }

function defaultDraft() {
  return {
    step: 1,
    namaGuru: "", sekolah: schoolProfile.sekolah || "", jenjang: "SMK/MAK", kelas: "", semester: "Ganjil", tahun: "",
    mapel: "", jenis: "", judul: "", tanggal: "", alokasi: "",
    materiPokok: "", submateri: "", cp: "", tujuan: "", materi: "", instruksi: "",
    uploadedModul: "", uploadedMateri: "",
    kopAktif: true, kopDinas: schoolProfile.dinas || "", sekolahAlamat: schoolProfile.alamat || "", sekolahKontak: schoolProfile.kontak || "", sekolahLogo: schoolProfile.logo || "", sekolahLogo2: schoolProfile.logo2 || "",
    images: [], imageCaptions: [], useImages: true,
    jumlah: "10", bentukList: ["pg"], acak: true, durasi: "0", tampilkanSkor: true,
    kesulitan: "campuran", cognitive: ["C1", "C2", "C3"],
    kisiKisi: true, kunci: true, pembahasan: true, rubrik: true
  };
}
function typesOf(d) {
  var list = d && Array.isArray(d.bentukList) ? d.bentukList.slice() : [];
  if (!list.length && d && d.bentuk) list = [d.bentuk];
  if (!list.length) list = ["pg"];
  return list;
}
function persist() {
  persistSave(LS.assessments, assessments);
  persistSave(LS.bank, bank);
  persistSave(LS.api, apiConfig);
  persistSave(LS.sync, syncConfig);
}
function saveSchoolProfileFromDraft() {
  schoolProfile = {
    sekolah: draft.sekolah || "",
    dinas: draft.kopDinas || "",
    alamat: draft.sekolahAlamat || "",
    kontak: draft.sekolahKontak || "",
    logo: draft.sekolahLogo || "",
    logo2: draft.sekolahLogo2 || ""
  };
  persistSave(LS.school, schoolProfile);
}
function saveDraft() { }

function labelOf(list, v) {
  for (var i = 0; i < list.length; i++) { if (list[i].v === v) return list[i].l; }
  return v;
}
function bentukLabel(v) { return labelOf(BENTUK, v); }
function kesulitanLabel(v) { return labelOf(KESULITAN, v); }

function fmtDate(iso) {
  if (!iso) return "-";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  var b = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return d.getDate() + " " + b[d.getMonth()] + " " + d.getFullYear();
}
function fmtDateTime(iso) {
  if (!iso) return "-";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  var b = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  var hh = ("0" + d.getHours()).slice(-2);
  var mm = ("0" + d.getMinutes()).slice(-2);
  return d.getDate() + " " + b[d.getMonth()] + " " + d.getFullYear() + ", " + hh + ":" + mm;
}

function toast(type, title, msg) {
  var icons = { success: ICON.check, error: ICON.x, info: ICON.info, warn: ICON.alert };
  var el = document.createElement("div");
  el.className = "toast " + type;
  el.innerHTML = (icons[type] || ICON.info) +
    '<div><div class="t-title">' + esc(title) + '</div>' +
    (msg ? '<div class="t-msg">' + esc(msg) + '</div>' : "") + "</div>";
  DOM.toastWrap.appendChild(el);
  setTimeout(function () {
    el.style.transition = "opacity .3s, transform .3s";
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";
    setTimeout(function () { el.remove(); }, 320);
  }, 3600);
}

function openModal(html, opts) {
  opts = opts || {};
  var root = DOM.modalRoot;
  root.innerHTML = '<div class="modal-backdrop" data-action="closeModal"></div>' +
    '<div class="modal' + (opts.wide ? " wide" : "") + '">' + html + "</div>";
  root.classList.add("open");
  var m = root.querySelector(".modal");
  if (m) m.scrollTop = 0;
}
function closeModal() {
  DOM.modalRoot.classList.remove("open");
  DOM.modalRoot.innerHTML = "";
}
function confirmModal(title, message, confirmLabel, onConfirm) {
  openModal(
    '<div class="modal-head"><h3>' + esc(title) + "</h3>" +
    '<button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body"><p style="font-size:14px;line-height:1.6">' + esc(message) + "</p></div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-danger" data-action="confirmYes">' + esc(confirmLabel) + "</button></div>"
  );
  DOM.modalRoot.querySelector('[data-action="confirmYes"]').addEventListener("click", function () {
    closeModal();
    onConfirm();
  });
}

function apiReady() {
  var k = apiConfig.key;
  if (!k) return false;
  if (typeof k === "string" && !k.trim()) return false;
  if (!apiConfig.provider) return false;
  return true;
}

function updateConnPill() {
  var pill = DOM.sideConn;
  if (!pill) return;
  var text = pill.querySelector(".conn-text");
  pill.className = "conn-pill";
  if (apiReady()) {
    if (apiConfig.lastTest && apiConfig.lastTest.ok) {
      pill.classList.add("on");
      text.textContent = "AI terhubung (" + apiConfig.provider + ")";
    } else {
      pill.classList.add("off");
      text.textContent = "API dikonfigurasi";
    }
  } else {
    pill.classList.add("err");
    text.textContent = "Mode demo (API belum diatur)";
  }
}

function navigate(page) {
  state.page = page;
  closeSidebar();
  render();
}
function setActiveNav() {
  var items = document.querySelectorAll(".nav-item");
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle("active", items[i].getAttribute("data-page") === state.page);
  }
}
function toggleSidebar() {
  DOM.sidebar.classList.toggle("open");
  DOM.overlay.classList.toggle("show");
}
function closeSidebar() {
  DOM.sidebar.classList.remove("open");
  DOM.overlay.classList.remove("show");
}

function render() {
  if (state.student) { renderStudent(); return; }
  setActiveNav();
  updateConnPill();
  var c = DOM.content;
  var page = state.page;
  if (page === "dashboard") {
    DOM.title.textContent = "Dashboard";
    DOM.subtitle.textContent = "Kelola asesmen pembelajaran dengan mudah.";
    c.innerHTML = renderDashboard();
  } else if (page === "buat") {
    DOM.title.textContent = "Buat Asesmen";
    DOM.subtitle.textContent = "Susun asesmen baru dalam tiga langkah.";
    c.innerHTML = renderBuat();
  } else if (page === "result") {
    DOM.title.textContent = "Hasil Asesmen";
    DOM.subtitle.textContent = "Tinjau, edit, dan ekspor asesmen Anda.";
    c.innerHTML = renderResult();
  } else if (page === "riwayat") {
    DOM.title.textContent = "Riwayat Asesmen";
    DOM.subtitle.textContent = "Asesmen yang pernah Anda buat.";
    c.innerHTML = renderRiwayat();
  } else if (page === "bank") {
    DOM.title.textContent = "Bank Soal";
    DOM.subtitle.textContent = "Kumpulan soal yang tersimpan.";
    c.innerHTML = renderBank();
  } else if (page === "rekap") {
    DOM.title.textContent = "Rekap Nilai Siswa";
    DOM.subtitle.textContent = "Tarik hasil pekerjaan siswa dan unduh lembar penilaian.";
    c.innerHTML = renderRekap();
  } else if (page === "profil") {
    DOM.title.textContent = "Profil Murid";
    DOM.subtitle.textContent = "Petakan kebutuhan belajar murid untuk pembelajaran berdiferensiasi.";
    c.innerHTML = renderProfil();
  } else if (page === "api") {
    DOM.title.textContent = "Pengaturan API";
    DOM.subtitle.textContent = "Hubungkan aplikasi ke layanan AI.";
    c.innerHTML = renderApi();
  }
  if (state.pendingFocus) {
    var el = document.getElementById(state.pendingFocus.id);
    if (el) {
      el.focus();
      if (el.setSelectionRange && state.pendingFocus.pos != null) {
        try { el.setSelectionRange(state.pendingFocus.pos, state.pendingFocus.pos); } catch (e) {}
      }
    }
    state.pendingFocus = null;
  } else {
    window.scrollTo(0, 0);
  }
}

function renderDashboard() {
  var totalSoal = bank.length;
  var recent = assessments.slice().sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }).slice(0, 5);

  var connCls = apiReady() ? (apiConfig.lastTest && apiConfig.lastTest.ok ? "badge-green" : "badge-amber") : "badge-red";
  var connTxt = apiReady() ? (apiConfig.lastTest && apiConfig.lastTest.ok ? "Terhubung" : "Belum diuji") : "Mode Demo";

  var h = "";
  h += '<section class="hero"><h2>Selamat datang, Guru Hebat!</h2><p>ADIK membantu Anda menyusun asesmen pembelajaran yang relevan dengan materi, capaian pembelajaran, dan level kognitif peserta didik. Cukup isi data, pilih bentuk soal, lalu biarkan aplikasi menyusunnya.</p>' +
    '<button class="btn" data-action="nav" data-page="buat">' + ICON.sparkles + " Generate Sekarang</button></section>";

  h += '<div class="grid grid-4 mt-24">';
  h += statCard("si-blue", ICON.files, assessments.length, "Asesmen Dibuat");
  h += statCard("si-violet", ICON.book, totalSoal, "Soal di Bank Soal");
  h += '<div class="card stat"><div class="stat-icon si-green">' + ICON.key + "</div><div>" +
    '<div style="padding-top:3px"><span class="badge ' + connCls + '">' + connTxt + "</span></div>" +
    '<div class="stat-label" style="margin-top:5px">Status Koneksi AI / API</div>' +
    '<div class="stat-label">Penyedia: ' + esc(apiConfig.provider || "-") + "</div></div></div>";
  var jenisCount = uniqueCount(assessments.map(function (a) { return a.meta.jenis; }));
  h += statCard("si-amber", ICON.chart, jenisCount, "Jenis Asesmen Beragam");
  h += "</div>";

  if (!apiReady()) {
    h += '<div class="note note-warn mt-24">' + ICON.alert +
      "<div><strong>Mode Demo Aktif</strong>API AI belum dikonfigurasi. Soal yang dihasilkan disusun dengan template dari materi yang Anda masukkan, bukan oleh AI. " +
      'Atur API key di <a href="#" data-action="nav" data-page="api" style="color:inherit;font-weight:700">Pengaturan API</a> untuk mengaktifkan pembuatan soal dengan AI.</div></div>';
  }

  h += '<div class="card mt-24"><div class="card-pad">';
  h += '<div class="card-head"><div><h3>Asesmen Terakhir</h3><p>' + (recent.length ? "5 asesmen terbaru Anda" : "Belum ada asesmen") + "</p></div>" +
    (assessments.length ? '<button class="btn btn-light btn-sm" data-action="nav" data-page="riwayat">Lihat Semua</button>' : "") + "</div>";

  if (!recent.length) {
    h += emptyState(ICON.files, "Belum ada asesmen", "Mulai buat asesmen pertama Anda sekarang.", "Mulai Buat Asesmen", "nav", "buat");
  } else {
    h += '<div class="table-wrap"><table class="tbl"><thead><tr><th>Judul</th><th>Jenis</th><th>Mapel</th><th>Kelas</th><th>Soal</th><th>Dibuat</th><th></th></tr></thead><tbody>';
    for (var r = 0; r < recent.length; r++) {
      var a = recent[r];
      h += "<tr><td><strong>" + esc(a.meta.judul) + "</strong></td>" +
        '<td><span class="badge badge-blue">' + esc(a.meta.jenis) + "</span></td>" +
        "<td>" + esc(a.meta.mapel) + "</td><td>" + esc(a.meta.kelas) + "</td>" +
        "<td>" + a.questions.length + "</td><td>" + fmtDateTime(a.createdAt) + "</td>" +
        '<td><button class="btn btn-light btn-sm" data-action="viewAssessment" data-id="' + a.id + '">' + ICON.eye + " Detail</button></td></tr>";
    }
    h += "</tbody></table></div>";
  }
  h += "</div></div>";
  return h;
}

function uniqueCount(arr) {
  var seen = {}, n = 0;
  for (var i = 0; i < arr.length; i++) { if (arr[i] && !seen[arr[i]]) { seen[arr[i]] = 1; n++; } }
  return n;
}
function statCard(color, icon, value, label) {
  return '<div class="card stat"><div class="stat-icon ' + color + '">' + icon + "</div>" +
    '<div><div class="stat-value">' + esc(value) + '</div><div class="stat-label">' + esc(label) + "</div></div></div>";
}
function emptyState(icon, title, msg, btnLabel, action, page) {
  var btn = btnLabel
    ? '<button class="btn btn-primary" data-action="' + action + '"' + (page ? ' data-page="' + page + '"' : "") + ">" + ICON.plus + esc(btnLabel) + "</button>"
    : "";
  return '<div class="empty">' + icon + "<h4>" + esc(title) + "</h4><p>" + esc(msg) + "</p>" + btn + "</div>";
}
