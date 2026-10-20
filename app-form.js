function fieldError(key) {
  return formErrors[key] ? '<span class="err-msg">' + esc(formErrors[key]) + "</span>" : "";
}
function invalidCls(key) { return formErrors[key] ? " invalid" : ""; }

function renderBuat() {
  var h = stepperHTML(draft.step);
  h += '<div class="card"><div class="card-pad">';
  if (draft.step === 1) h += renderStep1();
  else if (draft.step === 2) h += renderStep2();
  else h += renderStep3();
  h += "</div></div>";
  return h;
}

function stepperHTML(step) {
  var steps = [
    { n: 1, t: "Identitas Asesmen", s: "Data guru, sekolah & mata pelajaran" },
    { n: 2, t: "Materi Pembelajaran", s: "Materi, submateri & bahan ajar" },
    { n: 3, t: "Bentuk & Pengaturan Soal", s: "Jumlah, bentuk & level kognitif" }
  ];
  var h = '<div class="stepper">';
  for (var i = 0; i < steps.length; i++) {
    var st = steps[i];
    var cls = st.n === step ? "active" : (st.n < step ? "done" : "");
    h += '<div class="step ' + cls + '"><div class="num">' + (st.n < step ? ICON.check : st.n) + "</div>" +
      '<div class="s-txt"><strong>' + esc(st.t) + "</strong><span>" + esc(st.s) + "</span></div></div>";
    if (i < steps.length - 1) h += '<div class="step-line ' + (st.n < step ? "done" : "") + '"></div>';
  }
  h += "</div>";
  return h;
}

function optSelect(list, selected) {
  var h = "", found = false;
  for (var i = 0; i < list.length; i++) {
    var v = list[i].v != null ? list[i].v : list[i];
    var l = list[i].l != null ? list[i].l : list[i];
    if (String(selected) === String(v)) found = true;
    h += '<option value="' + esc(v) + '"' + (String(selected) === String(v) ? " selected" : "") + ">" + esc(l) + "</option>";
  }
  if (!found && selected != null && String(selected) !== "") {
    h = '<option value="' + esc(selected) + '" selected>' + esc(selected) + "</option>" + h;
  }
  return h;
}

function fieldText(name, label, value, req, hint, type) {
  var lbl = "<label>" + esc(label) + (req ? ' <span class="req">*</span>' : "") + "</label>";
  var input = '<input type="' + (type || "text") + '" data-field="' + name + '" value="' + esc(value) + '" class="' + invalidCls(name).trim() + '"' +
    (hint ? ' placeholder="' + esc(hint) + '"' : "") + ">";
  return '<div class="field">' + lbl + input + fieldError(name) + "</div>";
}

function renderStep1() {
  var h = '<div class="card-head"><div><h3>Langkah 1 &mdash; Identitas Asesmen</h3><p>Isi informasi dasar asesmen yang akan dibuat.</p></div></div>';
  if (assessments.length && !String(draft.materiPokok || "").trim() && !String(draft.materi || "").trim()) {
    h += '<div class="note note-info" style="margin-bottom:16px">' + ICON.sparkles +
      "<div><strong>Punya asesmen sebelumnya?</strong>Lanjutkan dengan identitas &amp; materi yang sama tanpa mengetik ulang (misalnya untuk membuat soal tingkat sedang &amp; sulit dari materi yang sama)." +
      '<br><button class="btn btn-light btn-sm" data-action="lastAssessModal" style="margin-top:8px">' + ICON.history + " Pilih Asesmen Sebelumnya</button></div></div>";
  }
  h += '<div class="form-grid">';
  h += fieldText("namaGuru", "Nama Guru", draft.namaGuru, true, "Nama lengkap guru penyusun");
  h += fieldText("sekolah", "Nama Sekolah", draft.sekolah, true, "Contoh: SMA Negeri 1 Jakarta");
  h += '<div class="field"><label>Jenjang Pendidikan <span class="req">*</span></label><select data-field="jenjang" class="' + invalidCls("jenjang").trim() + '"><option value="">Pilih jenjang</option>' + optSelect(JENJANG, draft.jenjang) + "</select>" + fieldError("jenjang") + "</div>";
  h += '<div class="field"><label>Kelas <span class="req">*</span></label><select data-field="kelas" class="' + invalidCls("kelas").trim() + '"><option value="">Pilih kelas</option>' + optSelect(KELAS_BOGA, draft.kelas) + "</select>" + fieldError("kelas") + "</div>";
  h += '<div class="field"><label>Semester <span class="req">*</span></label><select data-field="semester">' + optSelect(SEMESTER, draft.semester) + "</select></div>";
  h += '<div class="field"><label>Tahun Ajaran <span class="req">*</span></label><select data-field="tahun" class="' + invalidCls("tahun").trim() + '"><option value="">Pilih tahun ajaran</option>' + optSelect(TAHUN_AJARAN, draft.tahun) + "</select>" + fieldError("tahun") + "</div>";
  h += '<div class="field"><label>Mata Pelajaran <span class="req">*</span></label><select data-field="mapel" class="' + invalidCls("mapel").trim() + '"><option value="">Pilih mata pelajaran</option>' + optSelect(MAPEL_BOGA, draft.mapel) + "</select>" + fieldError("mapel") + "</div>";
  h += '<div class="field"><label>Jenis Asesmen <span class="req">*</span></label><select data-field="jenis" class="' + invalidCls("jenis").trim() + '"><option value="">Pilih jenis asesmen</option>' + optSelect(ASSESSMENT_TYPES, draft.jenis) + "</select>" + fieldError("jenis") + "</div>";
  h += '<div class="field full">' + fieldText("judul", "Judul Asesmen", draft.judul, true, "Contoh: Asesmen Formatif Sistem Pencernaan") + "</div>";
  h += fieldText("tanggal", "Tanggal Pelaksanaan", draft.tanggal, false, "", "date");
  h += fieldText("alokasi", "Alokasi Waktu", draft.alokasi, false, "Contoh: 60 menit");
  h += '<div class="field full"><label>Kop Surat Sekolah <span class="hint">(opsional &mdash; tampil di bagian atas file soal yang diunduh)</span></label>' +
    switchRow("kopAktif", "Tampilkan Kop Surat pada File Soal", "Kop dicetak di header dokumen (PDF / Word / Cetak)", draft.kopAktif !== false) + "</div>";
  h += '<div class="field full"><label>Baris Instansi / Dinas</label><input type="text" data-field="kopDinas" value="' + esc(draft.kopDinas) + '" placeholder="PEMERINTAH PROVINSI ... - DINAS PENDIDIKAN"></div>';
  h += '<div class="field full"><label>Alamat Sekolah</label><input type="text" data-field="sekolahAlamat" value="' + esc(draft.sekolahAlamat) + '" placeholder="Jl. ... No. ..., Kota, Kode Pos"></div>';
  h += '<div class="field full"><label>Kontak / Identitas Sekolah <span class="hint">(NPSN, Telepon, Email, Website)</span></label><input type="text" data-field="sekolahKontak" value="' + esc(draft.sekolahKontak) + '" placeholder="NPSN: ... | Telp: ... | Email: ..."></div>';
  h += logoControl("sekolahLogo", "Logo Sekolah (kiri)");
  h += logoControl("sekolahLogo2", "Logo Kedua (kanan, opsional)");
  h += "</div>";
  h += '<div class="form-nav"><span></span><button class="btn btn-primary" data-action="stepNext">Selanjutnya ' + ICON.arrowRight + "</button></div>";
  return h;
}

function dropzoneHTML(id, target, uploadedName, hint) {
  return '<div class="dropzone" data-target="' + target + '">' + ICON.upload +
    '<div><strong>Pilih file atau seret ke sini</strong><span>' + esc(hint) + "</span>" +
    (uploadedName ? '<b class="dzuploaded">' + ICON.check + " " + esc(uploadedName) + "</b>" : "") + "</div>" +
    '<input type="file" id="' + id + '" accept=".txt,.md,.docx,.pdf,.doc">' + "</div>";
}

function logoControl(name, label) {
  var url = draft[name] || "";
  var inner = url
    ? '<img src="' + url + '" alt="Logo"><button type="button" class="img-x" data-action="removeLogo" data-field="' + name + '" title="Hapus logo">' + ICON.close + "</button>"
    : '<span class="logo-ph">' + ICON.upload + "<em>Pilih file logo</em></span>";
  return '<div class="field"><label>' + esc(label) + "</label>" +
    '<div class="logo-upload' + (url ? " has" : "") + '" data-action="pickLogo" data-field="' + name + '">' + inner + "</div>" +
    '<input type="file" accept="image/*" class="logo-file" id="' + name + 'File"></div>';
}

function handleLogoUpload(input) {
  var name = String(input.id || "").replace(/File$/, "");
  if (!name) return;
  var f = input.files && input.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function () {
    shrinkImage(String(reader.result)).then(function (url) {
      if (!url) { toast("error", "Gagal memuat logo", "Pastikan file berupa gambar."); return; }
      draft[name] = url;
      saveSchoolProfileFromDraft();
      render();
      toast("success", "Logo tersimpan", "Logo akan tampil pada kop surat file soal.");
    });
  };
  reader.readAsDataURL(f);
  input.value = "";
}

function removeLogoNow(field) {
  if (!field) return;
  draft[field] = "";
  saveSchoolProfileFromDraft();
  render();
  toast("info", "Logo dihapus", "Logo dikeluarkan dari kop surat.");
}

function renderStep2() {
  var h = '<div class="card-head"><div><h3>Langkah 2 &mdash; Tujuan &amp; Materi Pembelajaran</h3><p>Tempel <b>Tujuan Pembelajaran</b> dari modul ajar (atau ambil otomatis dari file), lalu isi materi. Soal disusun agar sesuai dengan tujuan tersebut.</p></div></div>';
  h += '<div class="form-grid">';
  h += '<div class="field full"><label>Tujuan Pembelajaran <span class="hint">(satu tujuan per baris &mdash; boleh tempel dari modul ajar)</span></label>' +
    '<textarea data-field="tujuan" style="min-height:120px" placeholder="Contoh:\n1. Peserta didik dapat menjelaskan fungsi bahan pengembang pada pembuatan kue.\n2. Peserta didik dapat menganalisis penyebab kegagalan adonan.">' + esc(draft.tujuan) + "</textarea>" +
    '<div class="tp-file">' +
      '<label class="btn btn-light btn-sm" for="fileUploadModul">' + ICON.upload + " Ambil dari File Modul Ajar</label>" +
      '<input type="file" id="fileUploadModul" accept=".txt,.md,.docx,.pdf,.doc" style="display:none">' +
      (draft.uploadedModul
        ? '<span class="hint">' + ICON.check + " " + esc(draft.uploadedModul) + " &mdash; tujuan pembelajaran terisi otomatis, tetap bisa diedit.</span>"
        : '<span class="hint">Opsional &mdash; format .txt, .docx, atau .pdf.</span>') +
    "</div>" +
    '<span class="hint">Tujuan pembelajaran menjadi acuan utama AI agar soal yang dibuat benar-benar sesuai, bukan sekadar mengikuti materi.</span></div>';
  h += fieldText("materiPokok", "Materi Pokok", draft.materiPokok, true, "Contoh: Sistem Pencernaan Manusia");
  h += fieldText("submateri", "Submateri", draft.submateri, false, "Contoh: Organ dan enzim pencernaan");
  h += '<div class="field full"><label>Materi Pelajaran / Ringkasan Materi <span class="req">*</span> <span class="hint">(bisa unggah bahan ajar di bawah)</span></label>' +
    dropzoneHTML("fileUploadMateri", "materi", draft.uploadedMateri, "Format: .txt, .docx, atau .pdf") +
    '<textarea data-field="materi" class="' + invalidCls("materi").trim() + '" style="min-height:150px" placeholder="Tempelkan materi atau ringkasan yang menjadi acuan pembuatan soal...">' + esc(draft.materi) + "</textarea>" + fieldError("materi") + "</div>";
  h += renderImageGallery();
  h += '<div class="field full"><label>Instruksi Tambahan untuk Generator <span class="hint">(opsional)</span></label><textarea data-field="instruksi" placeholder="Contoh: gunakan konteks kehidupan sehari-hari, sertakan stimulus berupa tabel, hindari soal hafalan murni...">' + esc(draft.instruksi) + "</textarea></div>";
  h += "</div>";
  h += '<div class="form-nav"><button class="btn btn-light" data-action="stepPrev">' + ICON.arrowLeft + ' Kembali</button><button class="btn btn-primary" data-action="stepNext">Selanjutnya ' + ICON.arrowRight + "</button></div>";
  return h;
}

function switchRow(field, title, sub, on) {
  return '<div class="switch-row" style="margin-bottom:10px"><div class="txt"><strong>' + esc(title) + "</strong><span>" + esc(sub) + "</span></div>" +
    '<label class="switch"><input type="checkbox" data-field="' + field + '"' + (on ? " checked" : "") + '><span class="slider"></span></label></div>';
}

function renderStep3() {
  var h = '<div class="card-head"><div><h3>Langkah 3 &mdash; Bentuk dan Pengaturan Soal</h3><p>Tentukan jumlah, jenis soal, tingkat kesulitan, dan level kognitif.</p></div></div>';
  h += '<div class="form-grid">';
  h += '<div class="field"><label>Jumlah Soal <span class="req">*</span></label><input type="number" min="1" max="50" data-field="jumlah" value="' + esc(draft.jumlah) + '" class="' + invalidCls("jumlah").trim() + '">' + fieldError("jumlah") +
    '<span class="hint">Maks. 50 soal. Jumlah di atas 10 otomatis diproses bertahap oleh AI (per 10 soal), jadi aman dipakai untuk 30&ndash;50 soal.</span></div>';
  h += '<div class="field"><label>Durasi Pengerjaan <span class="hint">(menit, 0 = tanpa batas)</span></label><input type="number" min="0" max="300" data-field="durasi" value="' + esc(draft.durasi) + '"></div>';
  h += '<div class="field full"><label>Jenis / Bentuk Soal <span class="req">*</span> <span class="hint">(boleh pilih lebih dari satu)</span></label><div class="checks">';
  for (var b = 0; b < BENTUK.length; b++) {
    var bk = BENTUK[b];
    var onB = draft.bentukList.indexOf(bk.v) >= 0;
    h += '<label class="chk' + (onB ? " checked" : "") + '"><input type="checkbox" data-field="bentukList" data-value="' + bk.v + '"' + (onB ? " checked" : "") + "> " + esc(bk.l) + "</label>";
  }
  h += "</div>" + fieldError("bentukList") + "</div>";
  h += '<div class="field full"><label>Tingkat Kesulitan <span class="req">*</span></label><div class="checks">';
  for (var k = 0; k < KESULITAN.length; k++) {
    var ks = KESULITAN[k];
    h += '<label class="chk' + (draft.kesulitan === ks.v ? " checked" : "") + '"><input type="radio" name="kesulitan" data-field="kesulitan" value="' + ks.v + '"' + (draft.kesulitan === ks.v ? " checked" : "") + "> " + esc(ks.l) + "</label>";
  }
  h += "</div>" + fieldError("kesulitan") + "</div>";
  h += '<div class="field full"><label>Level Kognitif <span class="req">*</span> <span class="hint">(boleh pilih lebih dari satu)</span></label><div class="checks">';
  for (var g = 0; g < KOGNITIF.length; g++) {
    var ko = KOGNITIF[g];
    var on = draft.cognitive.indexOf(ko.v) >= 0;
    h += '<label class="chk' + (on ? " checked" : "") + '"><input type="checkbox" data-field="cognitive" data-value="' + ko.v + '"' + (on ? " checked" : "") + "> " + esc(ko.l) + "</label>";
  }
  h += "</div>" + fieldError("cognitive") + "</div>";
  h += '<div class="field full"><label>Kelengkapan Hasil</label>';
  h += switchRow("kisiKisi", "Sertakan Kisi-Kisi", "Tabel kisi-kisi dan indikator soal", draft.kisiKisi);
  h += switchRow("kunci", "Sertakan Kunci Jawaban", "Jawaban benar untuk setiap soal", draft.kunci);
  h += switchRow("pembahasan", "Sertakan Pembahasan", "Penjelasan singkat jawaban", draft.pembahasan);
  h += switchRow("rubrik", "Sertakan Rubrik / Pedoman Penskoran", "Panduan penilaian dan bobot", draft.rubrik);
  h += "</div>";
  h += '<div class="field full"><label>Pengaturan Mode Kerjakan Online</label>';
  h += switchRow("acak", "Acak Urutan Pilihan Jawaban", "Posisi jawaban benar diacak sehingga tidak selalu A", draft.acak);
  h += switchRow("tampilkanSkor", "Tampilkan Skor ke Siswa", "Siswa melihat nilai setelah selesai mengerjakan", draft.tampilkanSkor);
  h += "</div>";
  h += "</div>";
  h += '<div class="form-nav"><button class="btn btn-light" data-action="stepPrev">' + ICON.arrowLeft + ' Kembali</button><button class="btn btn-primary" data-action="showSummary">' + ICON.sparkles + " Lihat Ringkasan & Generate</button></div>";
  return h;
}

function validateStep(step) {
  formErrors = {};
  if (step === 1) {
    reqCheck(["namaGuru", "sekolah", "jenjang", "kelas", "mapel", "jenis", "judul", "tahun"]);
  } else if (step === 2) {
    reqCheck(["materiPokok", "materi"]);
  } else if (step === 3) {
    var n = parseInt(draft.jumlah, 10);
    if (!n || n < 1) formErrors.jumlah = "Masukkan jumlah soal (minimal 1).";
    else if (n > 50) formErrors.jumlah = "Maksimal 50 soal.";
    if (!draft.bentukList || !draft.bentukList.length) formErrors.bentukList = "Pilih minimal satu jenis soal.";
    if (!draft.kesulitan) formErrors.kesulitan = "Pilih tingkat kesulitan.";
    if (!draft.cognitive.length) formErrors.cognitive = "Pilih minimal satu level kognitif.";
  }
  return Object.keys(formErrors).length === 0;
}
function reqCheck(keys) {
  for (var i = 0; i < keys.length; i++) {
    if (!String(draft[keys[i]] || "").trim()) formErrors[keys[i]] = "Wajib diisi.";
  }
}
function stepNext() {
  if (!validateStep(draft.step)) {
    toast("warn", "Lengkapi data", "Beberapa kolom wajib belum diisi dengan benar.");
    render();
    return;
  }
  draft.step = Math.min(3, draft.step + 1);
  saveDraft();
  render();
}
function stepPrev() {
  formErrors = {};
  draft.step = Math.max(1, draft.step - 1);
  saveDraft();
  render();
}

function summaryModal() {
  var rows = [
    ["Nama Guru", draft.namaGuru], ["Sekolah", draft.sekolah], ["Jenjang", draft.jenjang],
    ["Kelas/Fase", draft.kelas], ["Semester", draft.semester], ["Tahun Ajaran", draft.tahun],
    ["Mata Pelajaran", draft.mapel], ["Jenis Asesmen", draft.jenis], ["Judul", draft.judul],
    ["Tanggal", draft.tanggal || "-"], ["Alokasi Waktu", draft.alokasi || "-"],
    ["Materi Pokok", draft.materiPokok], ["Submateri", draft.submateri || "-"],
    ["Tujuan Pembelajaran", draft.tujuan || "-"],
    ["Materi", draft.materi],
    ["Instruksi Tambahan", draft.instruksi || "-"],
    ["Jumlah Soal", draft.jumlah], ["Jenis Soal", typesOf(draft).map(bentukLabel).join(", ")],
    ["Kesulitan", kesulitanLabel(draft.kesulitan)], ["Level Kognitif", draft.cognitive.join(", ")],
    ["Acak Pilihan Jawaban", draft.acak ? "Ya" : "Tidak"],
    ["Durasi", (parseInt(draft.durasi, 10) > 0 ? draft.durasi + " menit" : "Tanpa batas")],
    ["Kisi-kisi", draft.kisiKisi ? "Ya" : "Tidak"], ["Kunci Jawaban", draft.kunci ? "Ya" : "Tidak"],
    ["Pembahasan", draft.pembahasan ? "Ya" : "Tidak"], ["Rubrik", draft.rubrik ? "Ya" : "Tidak"]
  ];
  var body = '<div class="summary-list">';
  var fullKeys = ["Tujuan Pembelajaran", "Materi", "Instruksi Tambahan"];
  for (var i = 0; i < rows.length; i++) {
    var full = fullKeys.indexOf(rows[i][0]) >= 0;
    body += '<div class="summary-item' + (full ? " full" : "") + '"><span>' + esc(rows[i][0]) + "</span><strong>" + nl2br(rows[i][1] || "-") + "</strong></div>";
  }
  body += "</div>";
  if (!apiReady()) {
    body += '<div class="note note-warn mt-16">' + ICON.alert + "<div><strong>Mode Demo</strong>API AI belum diatur, soal akan disusun dengan template materi (bukan AI). Anda dapat mengaturnya di Pengaturan API.</div></div>";
  } else {
    body += '<div class="note note-info mt-16">' + ICON.sparkles + "<div><strong>Siap generate dengan AI</strong>Soal akan dibuat menggunakan " + esc(apiConfig.provider) + " (" + esc(apiConfig.model) + ").</div></div>";
  }
  openModal(
    '<div class="modal-head"><h3>Ringkasan Input</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Perbaiki</button>' +
    '<button class="btn btn-primary" data-action="doGenerate">' + ICON.sparkles + " Generate Asesmen</button></div>",
    { wide: true }
  );
}

/* ---------------- Seri Lanjutan ----------------
   Kasus umam: 10 soal MUDAH -> 10 soal SEDANG -> 10 soal SULIT dengan materi
   yang sama. Pengguna memilih asesmen sebelumnya, aplikasi menyalin identitas,
   materi, dan pengaturan; hanya jumlah/tingkat/judul baru yang diminta. */

function seriesNextLevel(v) {
  if (v === "mudah") return "sedang";
  if (v === "sedang") return "sulit";
  if (v === "sulit") return "campuran";
  return v || "campuran";
}

/* true bila draft di memori masih berisi materi/judul milik asesmen ini
   (berarti baris terakhir membuat asesmen di sesi ini - gambar masih ada). */
function draftMatches(a) {
  if (!a || !a.meta || !draft) return false;
  var m = a.meta;
  return String(draft.judul || "") === String(m.judul || "") &&
    String(draft.materiPokok || "") === String(m.materiPokok || "") &&
    String(draft.materi || "") === String(m.materi || "");
}

function buildSeriesDraft(a, salinGambar) {
  var m = a.meta;
  var src = draftMatches(a) ? draft : null;
  var nd = defaultDraft();
  ["namaGuru", "sekolah", "jenjang", "kelas", "semester", "tahun", "mapel", "jenis", "judul", "tanggal", "alokasi",
    "kopAktif", "kopDinas", "sekolahAlamat", "sekolahKontak", "sekolahLogo", "sekolahLogo2",
    "materiPokok", "submateri", "cp", "tujuan", "materi", "instruksi"].forEach(function (k) {
      if (m[k] != null && m[k] !== "") nd[k] = m[k];
    });
  nd.bentukList = (Array.isArray(m.bentukList) && m.bentukList.length) ? m.bentukList.slice() : nd.bentukList;
  nd.cognitive = (Array.isArray(m.cognitive) && m.cognitive.length) ? m.cognitive.slice() : nd.cognitive;
  if (m.kesulitan) nd.kesulitan = m.kesulitan;
  nd.acak = m.acak !== false;
  nd.tampilkanSkor = m.tampilkanSkor !== false;
  nd.kisiKisi = m.kisiKisi !== false;
  nd.kunci = m.kunci !== false;
  nd.pembahasan = m.pembahasan !== false;
  nd.rubrik = m.rubrik !== false;
  if (m.durasi != null && m.durasi !== "") nd.durasi = String(m.durasi);
  if (src) {
    nd.jumlah = src.jumlah || nd.jumlah;
    nd.useImages = src.useImages !== false;
    if (salinGambar) { nd.images = (src.images || []).slice(); nd.imageCaptions = (src.imageCaptions || []).slice(); }
  } else {
    nd.jumlah = String(a.questions.length || 10);
  }
  nd.step = 3;
  return nd;
}

/* Editor tujuan pembelajaran & materi acuan. Dipakai tombol "Edit Tujuan
   Pembelajaran" pada halaman hasil, supaya asesmen yang sudah dibuat bisa
   disesuaikan tanpa mengulang seluruh langkah. */
function editTujuanModal(id) {
  var a = resolveAssessment(id);
  if (!a) { toast("warn", "Asesmen tidak ditemukan", "Buka asesmen terlebih dahulu."); return; }
  var m = a.meta;
  var body = '<div class="note note-info" style="margin-bottom:14px">' + ICON.info +
    "<div><strong>Acuan pembuatan soal</strong>Isian ini dipakai saat membuat asesmen berikutnya lewat <b>Buat Seri Lanjutan</b> agar tetap sesuai tujuan pembelajaran dan materi yang sama.</div></div>";
  body += '<div class="field full"><label>Tujuan Pembelajaran <span class="hint">(satu tujuan per baris)</span></label>' +
    '<textarea id="etTujuan" style="min-height:130px" placeholder="Contoh:\n1. Peserta didik dapat menjelaskan fungsi bahan pengembang pada pembuatan kue.">' + esc(m.tujuan || "") + "</textarea></div>";
  body += '<div class="field full"><label>Materi Pokok</label><input type="text" id="etPokok" value="' + esc(m.materiPokok || "") + '"></div>';
  body += '<div class="field full"><label>Submateri</label><input type="text" id="etSub" value="' + esc(m.submateri || "") + '"></div>';
  body += '<div class="field full"><label>Materi Pelajaran / Ringkasan</label><textarea id="etMateri" style="min-height:120px">' + esc(m.materi || "") + "</textarea></div>";
  openModal(
    '<div class="modal-head"><h3>Edit Tujuan Pembelajaran</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body"><div class="form-grid">' + body + "</div></div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="saveTujuan" data-id="' + a.id + '">' + ICON.save + " Simpan</button></div>",
    { wide: true }
  );
}

function saveTujuan(id) {
  var a = resolveAssessment(id);
  if (!a) return;
  var m = a.meta;
  m.tujuan = document.getElementById("etTujuan").value;
  m.materiPokok = document.getElementById("etPokok").value;
  m.submateri = document.getElementById("etSub").value;
  m.materi = document.getElementById("etMateri").value;
  if (findAssessment(id)) persist();
  closeModal();
  render();
  toast("success", "Acuan diperbarui", "Tujuan pembelajaran & materi berhasil disimpan.");
}

function seriesModal(id) {  var a = resolveAssessment(id);
  if (!a) { toast("warn", "Asesmen tidak ditemukan", "Buka asesmen yang sudah dibuat terlebih dahulu."); return; }
  var m = a.meta;
  var same = draftMatches(a);
  var level = seriesNextLevel(m.kesulitan);
  var jumlah = same ? (draft.jumlah || String(a.questions.length || 10)) : String(a.questions.length || 10);
  var judulBase = String(m.judul || "").replace(/\s*[-\u2013\u2014]\s*(Mudah|Sedang|Sulit|Campuran)\s*$/i, "");
  var saran = judulBase + " \u2014 " + kesulitanLabel(level);

  var body = '<div class="note note-info" style="margin-bottom:16px">' + ICON.check +
    "<div><strong>Identitas &amp; materi dipakai ulang</strong>Tidak perlu mengetik ulang data guru, sekolah, maupun materi. Anda hanya menentukan jumlah soal, tingkat kesulitan, dan judul.</div></div>";
  body += '<div class="summary-list">';
  body += '<div class="summary-item"><span>Mata Pelajaran</span><strong>' + esc(m.mapel || "-") + "</strong></div>";
  body += '<div class="summary-item"><span>Jenis Asesmen</span><strong>' + esc(m.jenis || "-") + "</strong></div>";
  body += '<div class="summary-item"><span>Materi Pokok</span><strong>' + esc(m.materiPokok || "-") + "</strong></div>";
  if (String(m.tujuan || "").trim()) body += '<div class="summary-item full"><span>Tujuan Pembelajaran</span><strong>' + listHTML(m.tujuan) + "</strong></div>";
  body += '<div class="summary-item"><span>Tingkat Sebelumnya</span><strong>' + esc(kesulitanLabel(m.kesulitan)) + "</strong></div>";
  body += '<div class="summary-item"><span>Jumlah Sebelumnya</span><strong>' + a.questions.length + " soal</strong></div>";
  body += "</div>";
  body += '<div class="form-grid" style="margin-top:16px">';
  body += '<div class="field"><label>Jumlah Soal <span class="req">*</span></label>' +
    '<input type="number" min="1" max="50" id="srJumlah" value="' + esc(jumlah) + '">' +
    '<span class="hint">Di atas 10 soal diproses otomatis bertahap oleh AI (per 10 soal), aman untuk 30&ndash;50 soal.</span></div>';
  body += '<div class="field"><label>Tingkat Kesulitan Baru <span class="req">*</span></label><select id="srLevel">' +
    optSelect(KESULITAN, level) + "</select></div>";
  body += '<div class="field full"><label>Judul Asesmen Baru <span class="req">*</span></label><input type="text" id="srJudul" value="' + esc(saran) + '"></div>';
  if (same && (draft.images || []).length) {
    body += '<div class="field full"><label class="chk checked"><input type="checkbox" id="srImages" checked> Salin ' +
      draft.images.length + ' gambar materi dari asesmen ini</label></div>';
  } else if (!same) {
    body += '<div class="field full"><div class="note note-warn">' + ICON.alert +
      "<div><strong>Gambar tidak ikut tersalin</strong>Gambar disimpan di sesi browser. Unggah ulang di Langkah 2 bila soal perlu bergambar (identitas &amp; materi teks tetap tersalin semua).</div></div></div>";
  }
  body += "</div>";

  openModal(
    '<div class="modal-head"><h3>Buat Seri Lanjutan</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="seriesStart" data-id="' + a.id + '">' + ICON.sparkles + " Lanjut ke Pengaturan Soal</button></div>",
    { wide: true }
  );
  var cb = document.getElementById("srImages");
  if (cb && cb.addEventListener) cb.addEventListener("change", function () {
    var lbl = cb.closest(".chk");
    if (lbl) lbl.classList.toggle("checked", cb.checked);
  });
}

function seriesStart(id) {
  var a = resolveAssessment(id);
  if (!a) return;
  var jumlahEl = document.getElementById("srJumlah");
  var levelEl = document.getElementById("srLevel");
  var judulEl = document.getElementById("srJudul");
  var imgEl = document.getElementById("srImages");
  var nd = buildSeriesDraft(a, imgEl ? imgEl.checked : false);
  nd.jumlah = String(parseInt(jumlahEl && jumlahEl.value, 10) || 10);
  if (levelEl && levelEl.value) nd.kesulitan = levelEl.value;
  nd.judul = (judulEl && String(judulEl.value).trim()) || nd.judul;
  nd.step = 1;
  draft = nd;
  formErrors = {};
  closeModal();
  state.page = "buat";
  if (!validateStep(1)) {
    draft.step = 1; saveDraft(); render();
    toast("warn", "Lengkapi data identitas", "Beberapa kolom wajib di Langkah 1 belum terisi.");
    return;
  }
  if (!validateStep(2)) {
    draft.step = 2; saveDraft(); render();
    toast("warn", "Lengkapi materi", "Materi pokok dan ringkasan materi wajib diisi pada Langkah 2.");
    return;
  }
  draft.step = 3;
  saveDraft();
  render();
  toast("success", "Seri lanjutan disiapkan", "Identitas & materi disalin. Tinjau pengaturan lalu klik Lihat Ringkasan & Generate.");
}

function lastAssessModal() {
  var list = assessments.slice().sort(function (x, y) { return new Date(y.createdAt) - new Date(x.createdAt); }).slice(0, 6);
  if (!list.length) { toast("info", "Belum ada asesmen", "Belum ada riwayat yang bisa dipakai ulang."); return; }
  var body = '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Identitas dan materi dari asesmen berikut disalin otomatis &mdash; Anda hanya menentukan jumlah soal dan tingkat kesulitan baru.</p>';
  list.forEach(function (a) {
    body += '<div style="display:flex;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid rgba(127,127,127,.18)">' +
      '<div style="flex:1;min-width:0"><strong style="font-size:13.5px">' + esc(a.meta.judul) + "</strong>" +
      '<div class="hint">' + esc(a.meta.mapel || "-") + " &middot; " + esc(a.meta.jenis || "-") + " &middot; " +
      a.questions.length + " soal &middot; " + esc(kesulitanLabel(a.meta.kesulitan)) + " &middot; " + esc(fmtDate(a.createdAt)) + "</div></div>" +
      '<button class="btn btn-primary btn-sm" data-action="seriesModal" data-id="' + a.id + '">Pakai</button></div>';
  });
  openModal(
    '<div class="modal-head"><h3>Gunakan Asesmen Sebelumnya</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Tutup</button></div>'
  );
}

function loadingView(label) {
  DOM.content.innerHTML = '<div class="loading"><div class="spinner"></div>' +
    '<div style="font-weight:600;color:var(--ink)">' + esc(label) + "</div>" +
    '<div class="progress"><i></i></div>' +
    '<p style="font-size:12.5px">Menyusun soal yang relevan dengan materi Anda...</p></div>';
}

function generateAssessment() {
  closeModal();
  var total = Math.max(1, Math.min(50, parseInt(draft.jumlah, 10) || 10));
  var useAI = apiReady();
  loadingView(useAI ? "Menyusun asesmen dengan AI..." : "Menyusun asesmen (mode demo)...");
  if (useAI) {
    var job;
    try {
      job = apiGenerate(draft, total);
    } catch (syncErr) {
      job = Promise.reject(syncErr);
    }
    job.then(function (questions) {
      finishGenerate(questions, "ai");
    }).catch(function (err) {
      var friendly = describeApiError(err, false);
      apiConfig.lastError = friendly.slice(0, 600);
      persist();
      toast("error", "Gagal generate dengan AI", friendly.slice(0, 140));
      finishGenerate(demoGenerate(draft, total), "demo");
      toast("info", "Beralih ke mode demo", "Soal disusun dengan template. Penyebab kegagalan tampil di halaman hasil.");
    });
  } else {
    setTimeout(function () { finishGenerate(demoGenerate(draft, total), "demo"); }, 650);
  }
}

function finishGenerate(questions, source) {
  assignQuestionImages(questions, draft, source);
  state.current = {
    id: uid(),
    meta: {
      namaGuru: draft.namaGuru, sekolah: draft.sekolah, jenjang: draft.jenjang, kelas: draft.kelas,
      semester: draft.semester, tahun: draft.tahun, mapel: draft.mapel, jenis: draft.jenis,
      judul: draft.judul, tanggal: draft.tanggal, alokasi: draft.alokasi,
      kopAktif: draft.kopAktif !== false, kopDinas: draft.kopDinas, sekolahAlamat: draft.sekolahAlamat,
      sekolahKontak: draft.sekolahKontak, sekolahLogo: draft.sekolahLogo, sekolahLogo2: draft.sekolahLogo2,
      materiPokok: draft.materiPokok, submateri: draft.submateri, cp: draft.cp,
      tujuan: draft.tujuan, materi: draft.materi, instruksi: draft.instruksi,
      bentuk: typesOf(draft)[0], bentukList: typesOf(draft), acak: !!draft.acak,
      durasi: draft.durasi, tampilkanSkor: !!draft.tampilkanSkor,
      kesulitan: draft.kesulitan, cognitive: draft.cognitive.slice(),
      kisiKisi: draft.kisiKisi, kunci: draft.kunci, pembahasan: draft.pembahasan, rubrik: draft.rubrik
    },
    questions: questions,
    source: source,
    saved: false,
    createdAt: new Date().toISOString()
  };
  state.page = "result";
  state.resultTab = "soal";
  render();
  toast(source === "ai" ? "success" : "info",
    source === "ai" ? "Asesmen berhasil dibuat" : "Asesmen demo dibuat",
    questions.length + " soal siap ditinjau.");
  if (source !== "ai" && draft.useImages !== false && (draft.images || []).length) {
    toast("info", "Gambar belum disisipkan", "Mode demo tidak dapat menyelaraskan gambar dengan soal. Aktifkan API AI agar gambar disisipkan sesuai isinya, atau tambahkan gambar manual pada tiap soal.");
  }
}

function splitSentences(text) {
  return String(text || "").replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s.length > 25 && s.length < 300; });
}

var STOPWORDS = ("dan atau dari untuk pada dengan yang adalah ini itu sebagai tidak bukan akan dapat oleh secara bahwa dalam ke di se para agar karena juga serta yaitu antara terhadap kepada suatu satu dua lebih sangat memiliki merupakan berdasarkan melalui namun sedangkan sehingga adapun maka apabila jika ketika saat bagi tiap setiap setelah sebelum contoh misalnya hanya harus").split(/\s+/);
var STOP = {};
STOPWORDS.forEach(function (w) { STOP[w] = 1; });

function keyTerms(text) {
  var words = String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter(function (w) { return w.length > 4 && !STOP[w]; });
  var freq = {}, order = [];
  words.forEach(function (w) {
    if (!freq[w]) { freq[w] = 0; order.push(w); }
    freq[w]++;
  });
  order.sort(function (a, b) { return freq[b] - freq[a]; });
  return order.slice(0, 30);
}

function pickDifficulty(d, i) {
  if (d.kesulitan !== "campuran") return d.kesulitan;
  var arr = ["mudah", "sedang", "sedang", "sulit"];
  return arr[i % arr.length];
}
function pickCognitive(d, i) {
  var list = d.cognitive && d.cognitive.length ? d.cognitive : ["C1"];
  return list[i % list.length];
}

function assignTypes(d, total) {
  var types = typesOf(d);
  var out = [];
  var per = Math.floor(total / types.length);
  var rem = total % types.length;
  for (var t = 0; t < types.length; t++) {
    var n = per + (t < rem ? 1 : 0);
    for (var j = 0; j < n; j++) out.push(types[t]);
  }
  return out;
}

function shuffleArr(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function shuffleOptions(q) {
  if (!q.options || q.options.length < 2) return;
  var correctSet = {};
  String(q.answer || "").split(/[,\s;]+/).forEach(function (x) { if (x) correctSet[x.toUpperCase()] = true; });
  var opts = q.options.map(function (o) { return { text: o.text, correct: !!correctSet[String(o.key).toUpperCase()] }; });
  shuffleArr(opts);
  q.options = opts.map(function (o, idx) { return { key: String.fromCharCode(65 + idx), text: o.text }; });
  var ans = [];
  opts.forEach(function (o, idx) { if (o.correct) ans.push(String.fromCharCode(65 + idx)); });
  if (ans.length) q.answer = ans.join(", ");
}

function demoGenerate(d, total) {
  var sents = splitSentences(d.materi);
  var terms = keyTerms(d.materi);
  var topic = d.submateri || d.materiPokok || d.mapel;
  var qs = [];
  var assign = assignTypes(d, total);

  for (var i = 0; i < total; i++) {
    var cog = pickCognitive(d, i);
    var diff = pickDifficulty(d, i);
    var type = assign[i];
    var q = { id: uid(), no: i + 1, type: type, cognitive: cog, difficulty: diff, weight: 1, stem: "", options: [], answer: "", explanation: "", pairs: [], rubric: "" };

    if (type === "pg" || type === "pgk") {
      var correct = sents.length ? sents[i % sents.length] : ("Konsep utama dalam materi " + topic + " sesuai dengan sumber belajar.");
      var distract = [];
      for (var s = 0; s < sents.length && distract.length < 3; s++) {
        var cand = sents[(i + s + 1) % sents.length];
        if (cand && cand !== correct && distract.indexOf(cand) < 0) distract.push(cand);
      }
      while (distract.length < 3) distract.push("Pernyataan " + (distract.length + 1) + " tidak sesuai dengan materi " + topic + ".");
      var all = [correct].concat(distract);
      var keys = ["A", "B", "C", "D", "E"];
      for (var a = 0; a < all.length && a < 5; a++) q.options.push({ key: keys[a], text: all[a] });
      q.stem = "Perhatikan pernyataan berikut. Manakah pernyataan yang paling tepat berkaitan dengan " + topic + "?";
      q.answer = type === "pgk" ? "A" : "A";
      q.explanation = "Pernyataan A sesuai dengan materi: \u201c" + correct + "\u201d";
      q.rubric = "Skor " + q.weight + " jika jawaban benar (A), skor 0 jika salah.";
    } else if (type === "bs") {
      var trueStmt = sents.length ? sents[i % sents.length] : ("Materi " + topic + " dipelajari pada mata pelajaran " + d.mapel + ".");
      q.stem = "Tentukan Benar atau Salah: \u201c" + trueStmt + "\u201d";
      q.options = [{ key: "B", text: "Benar" }, { key: "S", text: "Salah" }];
      q.answer = "B";
      q.explanation = "Pernyataan sesuai dengan materi pembelajaran: \u201c" + trueStmt + "\u201d";
      q.rubric = "Skor " + q.weight + " jika menjawab Benar, skor 0 jika salah.";
    } else if (type === "menjodohkan") {
      var n = Math.min(5, Math.max(3, terms.length || 4));
      q.stem = "Jodohkan istilah pada kolom kiri dengan penjelasan yang tepat pada kolom kanan.";
      for (var m = 0; m < n; m++) {
        var term = terms[m] || ("Istilah " + (m + 1));
        var def = sents.length ? sents[m % sents.length] : ("Penjelasan untuk " + term);
        q.pairs.push({ left: term, right: def });
      }
      q.answer = "Lihat pasangan pada lembar kunci.";
      q.explanation = "Pencocokan didasarkan pada definisi istilah dalam materi " + topic + ".";
      q.rubric = "Skor " + q.weight + " untuk setiap pasangan yang benar.";
    } else if (type === "isian") {
      var sen = sents.length ? sents[i % sents.length] : ("Konsep penting dalam " + topic + " adalah kunci pembelajaran.");
      var t = terms.length ? terms[i % terms.length] : topic;
      var re = new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
      var blanked = sen.replace(re, "__________");
      if (blanked === sen) blanked = sen.replace(/\b\w{5,}\b/, "__________");
      q.stem = "Isilah bagian rumpang berikut.\n" + blanked;
      q.answer = t;
      q.explanation = "Jawaban yang tepat adalah \u201c" + t + "\u201d sesuai materi.";
      q.rubric = "Skor " + q.weight + " jika jawaban benar dan ejaan tepat, skor 0 jika salah.";
    } else if (type === "uraian") {
      q.stem = "Jelaskan secara rinci " + (i % 2 === 0 ? "konsep utama" : "hubungan antar konsep") + " pada materi " + topic + " berdasarkan pemahaman Anda. Sertakan contoh yang relevan.";
      q.answer = "Jawaban uraian terbuka. Acuan: " + (sents[0] || topic) + " beserta contoh yang sesuai.";
      q.explanation = "Penilaian memperhatikan ketepatan konsep, kelengkapan, dan contoh.";
      q.rubric = "Skor 4: lengkap & tepat; 3: tepat kurang lengkap; 2: sebagian benar; 1: minimal; 0: tidak menjawab.";
      q.weight = 4;
    } else {
      q.stem = "Lakukan kegiatan/praktik berkaitan dengan " + topic + ". Tuliskan langkah kerja dan hasil pengamatan Anda sesuai prosedur yang benar.";
      q.answer = "Penilaian berdasarkan lembar kerja dan hasil pengamatan praktik.";
      q.explanation = "Gunakan rubrik praktik pada lembar rubrik penilaian.";
      q.rubric = "Persiapan (4) + Pelaksanaan (4) + Hasil (4) + Sikap (4) = 16.";
      q.weight = 4;
    }
    if (d.acak && (type === "pg" || type === "pgk")) shuffleOptions(q);
    qs.push(q);
  }
  return qs;
}

var TYPE_MAP = {
  "pilihan ganda": "pg", "pg": "pg", "pilihan_ganda": "pg",
  "pilihan ganda kompleks": "pgk", "pgk": "pgk", "pilihan_ganda_kompleks": "pgk",
  "benar/salah": "bs", "benar salah": "bs", "bs": "bs", "benar_salah": "bs",
  "menjodohkan": "menjodohkan", "matching": "menjodohkan", "memasangkan": "menjodohkan",
  "isian singkat": "isian", "isian": "isian", "jawaban singkat": "isian", "short answer": "isian",
  "uraian": "uraian", "essay": "uraian", "esai": "uraian",
  "praktik": "praktik", "praktikum": "praktik", "unjuk kerja": "praktik"
};
function normalizeType(t, fallback) {
  if (!t) return fallback || "pg";
  return TYPE_MAP[String(t).toLowerCase().trim()] || fallback || "pg";
}

/* Batas aman jumlah soal per satu permintaan AI. Permintaan yang terlalu besar
   membuat keluaran terpotong / kosong (finishReason MAX_TOKENS) sehingga JSON
   tidak lengkap. Gejala khasnya: 10 soal berhasil, 15 soal jatuh ke mode demo. */
var API_BATCH_SIZE = 10;

function isOutputSizeError(err) {
  var msg = String(err && err.message ? err.message : err);
  return /MAX_TOKENS|Respons AI kosong|JSON tidak valid|Format respons AI|Data soal AI tidak lengkap|AI tidak mengembalikan soal|Waktu tunggu/i.test(msg);
}

function apiGenerate(d, total) {
  total = Math.max(1, Math.min(50, parseInt(total, 10) || 10));
  return apiGenerateOnce(d, total, 0, total, null).catch(function (err) {
    if (total > API_BATCH_SIZE && isOutputSizeError(err)) {
      // Cadangan terakhir untuk jumlah soal besar: pecah menjadi beberapa
      // permintaan kecil. Nomor soal dan gambar tetap memakai urutan global.
      return apiGenerateBatched(d, total);
    }
    throw err;
  });
}

function apiGenerateBatched(d, total) {
  var jobs = [];
  for (var off = 0; off < total; off += API_BATCH_SIZE) {
    jobs.push({ offset: off, count: Math.min(API_BATCH_SIZE, total - off) });
  }
  var out = [];
  function step(i) {
    if (i >= jobs.length) return Promise.resolve(out);
    var job = jobs[i];
    try { loadingView("Menyusun soal " + (job.offset + 1) + "-" + (job.offset + job.count) + " dari " + total + "..."); } catch (e) { }
    var avoid = out.slice(-10).map(function (q) { return q.stem; });
    return apiGenerateOnce(d, job.count, job.offset, total, avoid).then(function (qs) {
      out = out.concat(qs);
      return step(i + 1);
    }).catch(function (err) {
      if (!out.length) throw err;
      // Sebagian soal sudah jadi - pakai yang ada daripada beralih ke demo semua.
      try {
        toast("warn", "Sebagian soal gagal dibuat",
          "Soal nomor " + (job.offset + 1) + "-" + (job.offset + job.count) + " gagal: " +
          String(err && err.message ? err.message : err).slice(0, 120));
      } catch (e) { }
      return out;
    });
  }
  return step(0).then(function (qs) {
    qs.forEach(function (q, i) { q.no = i + 1; });
    return qs;
  });
}

function apiGenerateOnce(d, count, offset, totalAll, avoidStems) {
  var types = typesOf(d);
  var assign = assignTypes(d, count);
  var typeCount = {};
  assign.forEach(function (t) { typeCount[t] = (typeCount[t] || 0) + 1; });
  var mix = types.map(function (t) { return bentukLabel(t) + " (" + t + ") x " + (typeCount[t] || 0); }).join("; ");
  // Gambar: nomor di dalam satu permintaan bersifat lokal (1..k) lalu dipetakan
  // kembali ke nomor global agar penempelan gambar ke soal tetap tepat.
  var imgGlobal = usedImageIndices(d, offset + count).slice(offset, offset + count);
  var imgParts = [];
  var imgNote = "";
  if (imgGlobal.length) {
    var imgPairs = [];
    imgGlobal.forEach(function (idx, li) {
      var part = dataUrlToInlinePart((d.images || [])[idx]);
      if (!part) return;
      var cap = ((d.imageCaptions || [])[idx] || "").trim();
      var label = "GAMBAR " + (li + 1) + (cap ? " (keterangan: " + cap + ")" : "");
      imgParts.push({ text: label + " \u2014 gambar ini WAJIB dipakai oleh soal yang menyertakan field \"imageIndex\": " + (li + 1) });
      imgParts.push(part);
      imgPairs.push("GAMBAR " + (li + 1) + (cap ? " [" + cap + "]" : "") + " \u2192 soal dengan imageIndex " + (li + 1));
    });
    if (imgPairs.length) {
      imgNote = "\n- Pesan ini menyertakan " + imgPairs.length + " GAMBAR. Buat tepat satu soal ber-gambar untuk SETIAP gambar, dan setiap soal tersebut WAJIB menyertakan field \"imageIndex\" berisi nomor gambar yang dipakai. Pemetaan gambar: " +
        imgPairs.join("; ") +
        ". Awali teks soal bergambar dengan \"Perhatikan gambar berikut.\" lalu tulis pertanyaan yang benar-benar mengacu pada ISI gambar tersebut (ciri, bagian, prosedur, atau analisis yang tampak pada gambar). Jangan menulis soal yang tidak berhubungan dengan gambar. Soal lain tanpa gambar dan tanpa imageIndex.";
    }
  }
  var bagianNote = offset > 0
    ? "Ini adalah soal nomor " + (offset + 1) + "-" + (offset + count) + " dari total " + totalAll + " soal yang diminta.\n"
    : "";
  var avoidNote = (avoidStems && avoidStems.length)
    ? "SOAL YANG SUDAH DIBUAT (jangan diulang atau dibuat mirip):\n" +
      avoidStems.map(function (s) { return "- " + String(s || "").replace(/\s+/g, " ").slice(0, 110); }).join("\n") + "\n\n"
    : "";
  var prompt = "Anda adalah guru ahli penyusun asesmen pembelajaran di Indonesia.\n" +
    "Buatlah " + count + " soal untuk asesmen berikut.\n" + bagianNote + "\n" + avoidNote +
    "IDENTITAS:\n- Mata pelajaran: " + d.mapel + "\n- Jenjang: " + d.jenjang + "\n- Kelas/Fase: " + d.kelas +
    "\n- Jenis asesmen: " + d.jenis + "\n- Judul: " + d.judul + "\n\n" +
    "MATERI:\n- Materi pokok: " + d.materiPokok + "\n- Submateri: " + d.submateri +
    (String(d.tujuan || "").trim() ? "\n- Tujuan pembelajaran (acuan utama):\n" + String(d.tujuan).trim() : "") +
    "\n- Ringkasan materi: " + d.materi + "\n\n" +
    (String(d.tujuan || "").trim()
      ? "ACUAN TUJUAN:\nSetiap soal harus mengukur atau mendukung salah satu tujuan pembelajaran di atas. Jangan membuat soal di luar tujuan tersebut.\n\n"
      : "") +
    "SPESIFIKASI SOAL:\n- Jenis soal yang harus dibuat (campuran): " + mix + "\n- Total: " + count +
    " soal\n- Tingkat kesulitan: " + kesulitanLabel(d.kesulitan) +
    "\n- Level kognitif yang dicakup: " + d.cognitive.join(", ") + imgNote +
    (d.instruksi ? "\n- Instruksi tambahan: " + d.instruksi : "") + "\n\n" +
    "ATURAN:\n" +
    "1. Soal harus relevan dengan materi, mapel, dan tingkat peserta didik. Jangan membuat soal di luar materi.\n" +
    "2. Hindari soal berulang, ambigu, atau tidak sesuai tingkat peserta didik.\n" +
    "3. Setiap soal memiliki satu level kognitif (C1-C6) sesuai pilihan.\n" +
    "4. Setiap item wajib memuat field \"type\" yang tepat sesuai campuran di atas.\n" +
    "5. Untuk pilihan ganda sediakan 4-5 opsi (A-E), tepat satu jawaban benar; variasikan posisi jawaban benar (jangan selalu A).\n" +
    "6. Untuk pilihan ganda kompleks, jawaban benar boleh lebih dari satu (tulis kunci dipisah koma, mis. \"A, C\").\n" +
    "7. Untuk bentuk menjodohkan sediakan array pairs berisi objek left/right.\n" +
    "8. Sertakan kunci jawaban, pembahasan singkat, dan bobot nilai (weight).\n" +
    "9. JANGAN keluar dari format JSON. Tidak boleh menggunakan markdown (```json ... ```). Tidak boleh ada koma setelah elemen terakhir di array maupun objek.\n\n" +
    "STRUKTUR JSON:\n" +
    '{"questions":[{"type":"pg","cognitive":"C1","difficulty":"mudah","weight":1,"stem":"teks soal","imageIndex":null,"options":[{"key":"A","text":"..."}],"answer":"A","explanation":"pembahasan","pairs":[{"left":"...","right":"..."}],"rubric":"pedoman penskoran"}]}';

  // Validasi hasil diteruskan ke callGemini agar kegagalan parse/JSON tidak
  // valid dapat dicoba ulang otomatis dengan konfigurasi alternatif.
  return callGemini(prompt, imgParts, count, function (text) {
    var data = parseJSON(text);
    var list = data.questions || data.soal || data;
    if (!Array.isArray(list)) throw new Error("Format respons AI tidak dikenali.");
    var usable = list.slice(0, count);
    if (!usable.length) throw new Error("AI tidak mengembalikan soal.");
    return usable.map(function (item, i) {
      var q;
      try { q = normalizeQuestion(item, d, i); } catch (e) {
        throw new Error("Data soal AI tidak lengkap: " + (e && e.message ? e.message : e));
      }
      if (q.imageIndex != null) {
        q.imageIndex = (q.imageIndex >= 1 && q.imageIndex <= imgGlobal.length) ? (imgGlobal[q.imageIndex - 1] + 1) : null;
      }
      q.no = offset + i + 1;
      return q;
    });
  });
}

function dataUrlToInlinePart(url) {
  var m = /^data:([^;,]+);base64,(.+)$/.exec(String(url || ""));
  if (!m) return null;
  return { inlineData: { mimeType: m[1] || "image/jpeg", data: m[2] } };
}

/* Gemini 3.x/4.x sudah tidak lagi merekomendasikan parameter sampling lama
   (temperature, topP, topK) dan token berpikir (thinking) ikut dihitung dari
   maxOutputTokens - akibatnya jawaban bisa berakhir kosong (finishReason
   MAX_TOKENS) sehingga generate jatuh ke mode demo. Karena itu konfigurasi
   dibuat sesuai generasi model, lengkap dengan cadangan percobaan. */
function isModernGemini(model) {
  var m = String(model || "").trim().toLowerCase();
  var mm = /^gemini-(\d+)/.exec(m);
  return !!mm && parseInt(mm[1], 10) >= 3;
}

function geminiConfigLadder(model, total) {
  var n = Math.max(1, parseInt(total, 10) || 10);
  var maxTokens = Math.min(65536, 6144 + n * 1000);
  // Cadangan memakai anggaran 2x lipat, bukan angka maksimum yang sama, supaya
  // bila nilai tertinggi ditolak API masih ada percobaan yang masuk akal.
  var big = Math.min(65536, maxTokens * 2);
  if (isModernGemini(model)) {
    return [
      { responseMimeType: "application/json", maxOutputTokens: maxTokens, thinkingConfig: { thinkingLevel: "LOW" } },
      { responseMimeType: "application/json", maxOutputTokens: big, thinkingConfig: { thinkingLevel: "LOW" } },
      { responseMimeType: "application/json", maxOutputTokens: big }
    ];
  }
  return [
    { temperature: 0.7, topP: 0.9, topK: 40, responseMimeType: "application/json", maxOutputTokens: maxTokens },
    { responseMimeType: "application/json", maxOutputTokens: big }
  ];
}

function isModelMissing(err) {
  var msg = String(err && err.message ? err.message : err);
  return !!err && (err.status === 404 || /is not found for API version|MODEL_NOT_FOUND|not found.*generateContent/i.test(msg));
}

function geminiRetryable(err) {
  if (!err) return false;
  if (err.timedOut || err.network) return false;
  var msg = String(err.message || "");
  if (/API_KEY_INVALID|API key not valid|API key expired|PERMISSION_DENIED|INVALID_ARGUMENT: API/i.test(msg)) return false;
  if (isModelMissing(err)) return false;
  if (/Permintaan diblokir/.test(msg)) return false;
  if (err.empty) return true;
  if (err.status === 400 || err.status === 500 || err.status === 503) return true;
  if (/JSON tidak valid|Format respons AI|Data soal AI tidak lengkap|AI tidak mengembalikan soal/.test(msg)) return true;
  return false;
}

function geminiFetch(model, key, parts, genConfig, timeoutMs) {
  var url = "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);
  var timedOut = false;
  var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
  var timer = ctrl ? setTimeout(function () { timedOut = true; try { ctrl.abort(); } catch (e) { } }, timeoutMs || 90000) : null;
  function done() { if (timer) clearTimeout(timer); }
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: parts }],
      generationConfig: genConfig
    }),
    signal: ctrl ? ctrl.signal : undefined
  }).then(function (res) {
    done();
    return res.json().then(function (data) {
      if (!res.ok) {
        var e = new Error(data && data.error ? (data.error.status ? data.error.status + ": " + data.error.message : data.error.message) : ("HTTP " + res.status));
        e.status = res.status;
        throw e;
      }
      var cand = data.candidates && data.candidates[0];
      if (!cand) {
        var pf = data.promptFeedback && data.promptFeedback.blockReason;
        var e2 = new Error(pf ? ("Permintaan diblokir: " + pf) : "AI tidak mengembalikan hasil.");
        e2.status = res.status;
        throw e2;
      }
      if (cand.finishReason && cand.finishReason !== "STOP" && cand.finishReason !== "MAX_TOKENS" && cand.finishReason !== "FINISH_REASON_UNSPECIFIED") {
        var e3 = new Error("Respons AI dihentikan: " + cand.finishReason);
        e3.status = res.status;
        throw e3;
      }
      var ps = (cand.content && cand.content.parts) || [];
      var text = ps.map(function (p) { return p.text || ""; }).join("");
      if (!text.trim()) {
        var e4 = new Error("Respons AI kosong (finishReason: " + (cand.finishReason || "?") + "). Coba lagi atau turunkan jumlah soal.");
        e4.status = res.status;
        e4.empty = true;
        throw e4;
      }
      return text;
    });
  }).catch(function (err) {
    done();
    if (timedOut) {
      var te = new Error("Waktu tunggu habis - server Google tidak menjawab.");
      te.timedOut = true;
      throw te;
    }
    if (err && (err.timedOut || err.status != null || err.empty)) throw err;
    var ne = new Error(String(err && err.message ? err.message : err));
    ne.network = true;
    throw ne;
  });
}

function callGemini(prompt, imageParts, total, validate) {
  var key = apiConfig.key;
  if (typeof key === "string") key = key.trim();
  if (!key) throw new Error("API key belum diisi.");
  var parts = [{ text: prompt }];
  if (imageParts && imageParts.length) parts = [{ text: prompt }].concat(imageParts);

  var primary = String(apiConfig.model || MODEL_DEFAULT);
  var attempts = [];
  function pushModel(m) {
    geminiConfigLadder(m, total).forEach(function (cfg) { attempts.push({ model: m, cfg: cfg }); });
  }
  pushModel(primary);
  if (primary.toLowerCase() !== String(MODEL_DEFAULT).toLowerCase()) pushModel(MODEL_DEFAULT);

  var i = 0, last = null;
  function finalError() {
    var e = last || new Error("Tidak dapat menghubungi layanan AI.");
    return new Error(describeApiError(e, !!(e && e.timedOut), 90));
  }
  function next() {
    if (i >= attempts.length) return Promise.reject(finalError());
    var a = attempts[i++];
    return geminiFetch(a.model, key, parts, a.cfg).then(function (text) {
      var out = validate ? validate(text) : text;
      if (a.model !== primary) {
        apiConfig.model = a.model;
        try { persist(); } catch (e) { }
        try { toast("warn", "Model AI diganti", "Model " + primary + " tidak tersedia, memakai " + a.model + "."); } catch (e) { }
      }
      return out;
    }).catch(function (err) {
      last = err;
      var retry = false;
      if (isModelMissing(err)) {
        // Lewati sisa konfigurasi model yang tidak ada, langsung ke model cadangan.
        while (i < attempts.length && attempts[i].model === a.model) i++;
        retry = i < attempts.length;
      } else {
        retry = geminiRetryable(err);
      }
      if (!retry) return Promise.reject(finalError());
      return next();
    });
  }
  return next();
}

function parseJSON(text) {
  var t = String(text || "").trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  var s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  t = t.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(t); } catch (err) {
    var msg = err && err.message ? err.message : String(err);
    throw new Error("AI mengembalikan format JSON tidak valid: " + msg + ". Coba ulang atau kurangi jumlah soal.");
  }
}

function normalizeQuestion(item, d, i) {
  var type = normalizeType(item.type, typesOf(d)[0]);
  var opts = [];
  if (Array.isArray(item.options)) {
    item.options.forEach(function (o, idx) {
      if (typeof o === "string") opts.push({ key: String.fromCharCode(65 + idx), text: o });
      else opts.push({ key: o && o.key ? String(o.key) : String.fromCharCode(65 + idx), text: (o && (o.text || o.value)) || "" });
    });
  }
  var pairs = [];
  if (Array.isArray(item.pairs)) {
    item.pairs.forEach(function (p) { if (p) pairs.push({ left: p.left || p.kiri || "", right: p.right || p.kanan || "" }); });
  }
  var cog = String(item.cognitive || "").toUpperCase().replace(/\s+/g, "");
  if (!/^C[1-6]$/.test(cog)) cog = pickCognitive(d, i);
  var diff = String(item.difficulty || "").toLowerCase();
  if (["mudah", "sedang", "sulit"].indexOf(diff) < 0) diff = pickDifficulty(d, i);
  var q = {
    id: uid(), no: i + 1, type: type, cognitive: cog, difficulty: diff,
    weight: Number(item.weight) > 0 ? Number(item.weight) : 1,
    stem: item.stem || item.question || item.soal || "",
    options: opts,
    answer: item.answer != null ? String(item.answer) : "",
    explanation: item.explanation || item.pembahasan || "",
    pairs: pairs,
    rubric: item.rubric || item.pedoman || ""
  };
  var itag = null;
  if (item.imageIndex != null) itag = Number(item.imageIndex);
  else if (item.image_index != null) itag = Number(item.image_index);
  else if (item.gambar != null) itag = Number(item.gambar);
  q.imageIndex = (itag != null && isFinite(itag) && itag > 0) ? Math.round(itag) : null;
  if (d.acak && (q.type === "pg" || q.type === "pgk")) shuffleOptions(q);
  return q;
}

function describeApiError(err, timedOut, secs) {
  var msg = String(err && err.message ? err.message : err);
  if (timedOut) return "Waktu tunggu " + (secs || 90) + " detik habis - server Google tidak menjawab. Periksa internet, VPN, atau adblock. Solusi: periksa internet/VPN/adblock, buka Pengaturan API lalu klik Simpan → Uji Koneksi sampai hijau, dan pastikan kuota Google API Anda mencukupi.";
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "Perangkat sedang offline - tidak ada koneksi internet. Coba lagi setelah tersambung.";
  // Kuota / billing dicek lebih dulu: pesan asli Google memuat tautan
  // "rate-limits" sehingga akan ikut tercakup regex jaringan generik di bawah,
  // dan anjurannya justru berbeda (menunggu reset / mengaktifkan Billing,
  // bukan mencoba lagi terus-menerus yang hanya membuang kuota).
  if (/RESOURCE_EXHAUSTED|exceeded your current quota|check your plan and billing details|Quota failed|Usage limit exceeded/i.test(msg)) {
    var qs = "Kuota API Google terlampaui (RESOURCE_EXHAUSTED). ";
    if (/PerMinute|PerHour|per minute|per hour|Rate limit exceeded/i.test(msg)) qs += "Batas permintaan per menit tercapai - tunggu sekitar 1 menit lalu coba lagi. ";
    else if (/PerDay|per day|daily|Usage limit/i.test(msg)) qs += "Batas harian tercapai - kuota gratis (free tier) direset setiap hari pukul 00.00 waktu Pacific, sekitar pukul 14.00-15.00 WIB. ";
    else qs += "Kemungkinan kuota harian gratis (free tier) sudah habis, atau penagihan (Billing) belum diaktifkan. ";
    return qs + "Solusi: (1) tunggu reset harian lalu generate lagi, (2) aktifkan Billing / upgrade plan di aistudio.google.com agar kuota jauh lebih besar, (3) hemat kuota - 10 soal cukup 1 permintaan, jangan klik Generate berulang, dan tombol Uji Koneksi pun ikut menghitung kuota. Selama kuota habis, hasil mode demo tetap bisa dipakai.";
  }
  if (/Load failed|Failed to fetch|NetworkError|ERR_INTERNET|ERR_NETWORK|ERR_NAME|ERR_CONNECTION|aborted|UNAVAILABLE|SERVICE_UNAVAILABLE|503|429|rate limit|high demand|exceeded quota|quota exceeded|overloaded|DNS|ETIMEDOUT|ECONN/i.test(msg + " " + ((err && err.name) || ""))) {
    return msg + ". Solusi: coba lagi beberapa saat (kadang lonjakan permintaan sementara), turunkan jumlah soal, atau ganti model lain di Pengaturan API. Juga periksa kuota Google Gemini Anda.";
  }
  if (/API_KEY_INVALID|API key not valid|API key expired|PERMISSION_DENIED/i.test(msg)) {
    return msg + ". Solusi: API key tidak valid atau kedaluwarsa - buat key baru di Google AI Studio (aistudio.google.com), tempel di Pengaturan API, lalu klik Simpan → Uji Koneksi.";
  }
  if (/MAX_TOKENS|Respons AI kosong/i.test(msg)) {
    return msg + ". Solusi: jumlah soal/konteks terlalu besar untuk sekali kirim - turunkan jumlah soal, atau coba lagi (aplikasi otomatis mengulang dengan anggaran token lebih besar).";
  }
  if (/INVALID_ARGUMENT|Request contains an invalid argument/i.test(msg)) {
    return msg + ". Solusi: konfigurasi model tidak cocok dengan permintaan - coba ganti model lain di Pengaturan API lalu klik Simpan → Uji Koneksi.";
  }
  return msg || "Tidak ada detail error.";
}

function testConnection() {
  var key = apiConfig.key;
  if (typeof key === "string") key = key.trim();
  if (!key) {
    toast("warn", "API key kosong", "Masukkan API key terlebih dahulu.");
    return;
  }
  var btn = document.getElementById("apiTestBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Menguji..."; }
  var model = String(apiConfig.model || MODEL_DEFAULT);
  var probe = [{ text: "Balas dengan satu kata: OK" }];
  function finish(ok, message, title) {
    apiConfig.lastTest = { ok: ok, at: new Date().toISOString(), error: (message || "").slice(0, 600) };
    if (ok) apiConfig.lastError = "";
    persist();
    toast(ok ? (title ? "warn" : "success") : "error",
      title || (ok ? "Koneksi berhasil" : "Koneksi gagal"),
      message || (ok ? "AI siap digunakan." : ""));
    render();
  }
  // Uji memakai konfigurasi yang sama dengan generator, agar hasil uji
  // benar-benar mewakili saat generate soal (bukan sekadar key valid).
  geminiFetch(model, key, probe, geminiConfigLadder(model, 3)[0], 20000).then(function () {
    finish(true, "", "");
  }).catch(function (err) {
    if (!geminiRetryable(err)) {
      finish(false, describeApiError(err, !!err.timedOut, 20), "");
      return;
    }
    // Key & jaringan baik, tetapi konfigurasi utama ditolak API. Generator
    // tetap bisa berjalan karena otomatis memakai konfigurasi cadangan.
    geminiFetch(model, key, probe, {}, 20000).then(function () {
      finish(true, "Konfigurasi utama ditolak: " + describeApiError(err, !!err.timedOut, 20) +
        " Saat generate, aplikasi otomatis memakai konfigurasi cadangan.", "Koneksi berhasil (konfigurasi cadangan)");
    }).catch(function (err2) {
      finish(false, describeApiError(err2, !!err2.timedOut, 20), "");
    });
  });
}

function classifyHeading(t) {
  var body = String(t)
    .replace(/^\(\s*\d+(?:\.\d+)*\s*\)\s*/, "")
    .replace(/^\[\s*[^\]]+\]\s*/, "")
    .replace(/^\d+(?:\.\d+)*[.)]\s*/, "")
    .replace(/^[A-Za-z][.)]\s*/, "")
    .replace(/^[-â€“â€¢Â·]\s*/, "").trim();
  var key = body.toLowerCase();
  if (/^(cp|capaian pembelajaran|kompetensi dasar|kompetensi inti dan kompetensi dasar|kd|ipk)\b/.test(key) && key.length <= 90) {
    var inline = body.replace(/^(cp|capaian pembelajaran|kompetensi dasar|kompetensi inti dan kompetensi dasar|kd|ipk)\b\s*[:.\-â€“]*\s*/i, "").trim();
    return { section: "cp", inline: inline };
  }
  if (/^(tp|tujuan pembelajaran|tujuan belajar)\b/.test(key) && key.length <= 90) {
    var inline2 = body.replace(/^(tp|tujuan pembelajaran|tujuan belajar)\b\s*[:.\-â€“]*\s*/i, "").trim();
    return { section: "tp", inline: inline2 };
  }
  if (/^(materi pembelajar|materi\b|uraian materi|bahan ajar|isi materi|ringkasan materi|pembahasan materi|topik|submateri|pokok bahasan)/.test(key) && key.length <= 90) {
    var inline3 = body.replace(/^(materi pembelajar|materi|uraian materi|bahan ajar|isi materi|ringkasan materi|pembahasan materi|topik|submateri|pokok bahasan)\b\s*[:.\-â€“]*\s*/i, "").trim();
    return { section: "materi", inline: inline3 };
  }
  return null;
}

function analyzeText(text) {
  var lines = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  var section = "materi", cp = [], tp = [], mt = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var h = classifyHeading(line);
    if (h) {
      section = h.section;
      if (h.inline) (section === "cp" ? cp : section === "tp" ? tp : mt).push(h.inline);
      continue;
    }
    (section === "cp" ? cp : section === "tp" ? tp : mt).push(line);
  }
  var cpT = cp.join("\n").trim();
  var tpT = tp.join("\n").trim();
  var mtT = mt.join("\n").trim();
  return { cp: cpT, tujuan: tpT, materi: mtT || String(text || "").trim() };
}

function extractLabeled(text, labels) {
  var lines = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    for (var j = 0; j < labels.length; j++) {
      var lab = labels[j].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var re = new RegExp("^[\\s\\-\\*â€¢.()0-9]*" + lab + "\\b\\s*[:\\-â€“]?\\s*(.*)$", "i");
      var m = line.match(re);
      if (m) {
        var val = (m[1] || "").trim();
        if (!val) {
          for (var k = i + 1; k < lines.length; k++) { if (lines[k].trim()) { val = lines[k].trim(); break; } }
        }
        if (val) return val.slice(0, 140);
      }
    }
  }
  return "";
}

function cleanFileName(name) {
  return String(name || "").replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
}

function firstTitleLine(text) {
  var lines = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i].trim();
    if (!t || t.length < 3 || t.length > 80) continue;
    if (/^\d+[.)]?$/.test(t)) continue;
    if (classifyHeading(t)) continue;
    var cleaned = t.replace(/^(modul\s+ajar|bahan\s+ajar|lkpd|e-?modul|materi\s+ajar)\s*[:\-â€“]?\s*/i, "").trim();
    if (cleaned.length >= 3) return cleaned.slice(0, 140);
  }
  return "";
}

var MAX_IMAGES = 10;
var IMG_MAX_W = 900;

function dataUrlMime(u) {
  var m = /^data:([^;,]+)[;,]/.exec(String(u || ""));
  return m ? m[1] : "image/png";
}

function shrinkImage(dataUrl) {
  return new Promise(function (resolve) {
    try {
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
          var scale = w > IMG_MAX_W ? IMG_MAX_W / w : 1;
          var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
          var cv = document.createElement("canvas");
          cv.width = cw; cv.height = ch;
          var cx = cv.getContext("2d");
          cx.fillStyle = "#ffffff"; cx.fillRect(0, 0, cw, ch);
          cx.drawImage(img, 0, 0, cw, ch);
          resolve(cv.toDataURL("image/jpeg", 0.82));
        } catch (e) { resolve(dataUrl); }
      };
      img.onerror = function () { resolve(""); };
      img.src = dataUrl;
    } catch (e) { resolve(""); }
  });
}

function shrinkAll(urls) {
  var out = [];
  var chain = Promise.resolve();
  urls.forEach(function (u) {
    chain = chain.then(function () {
      return shrinkImage(u).then(function (s) { if (s) out.push(s); });
    });
  });
  return chain.then(function () { return out; });
}

function extractDocxImages(buf) {
  if (!window.mammoth || !mammoth.convertToHtml || !mammoth.images || !mammoth.images.imgElement) return Promise.resolve([]);
  var raw = [];
  var convert = mammoth.images.imgElement(function (image) {
    return image.read("base64").then(function (b64) {
      raw.push("data:" + (image.contentType || "image/png") + ";base64," + b64);
      return { src: "" };
    });
  });
  return mammoth.convertToHtml({ arrayBuffer: buf }, { convertImage: convert })
    .then(function () { return shrinkAll(raw.slice(0, MAX_IMAGES)); })
    .catch(function () { return []; });
}

function extractPdfImages(pdf) {
  var pdfjs = window.pdfjsLib;
  var raw = [];
  var pages = Math.min(pdf.numPages, 12);
  var tasks = [];
  for (var p = 1; p <= pages; p++) {
    (function (pageNum) {
      tasks.push(pdf.getPage(pageNum).then(function (page) {
        return page.getOperatorList().then(function (ops) {
          var seen = {};
          var imgTasks = [];
          for (var i = 0; i < ops.fnArray.length; i++) {
            var fn = ops.fnArray[i];
            if (fn === pdfjs.OPS.paintImageXObject || fn === pdfjs.OPS.paintJpegXObject) {
              var name = ops.argsArray[i] && ops.argsArray[i][0];
              if (!name || seen[name]) continue;
              seen[name] = 1;
              imgTasks.push(new Promise(function (resolve) {
                try {
                  page.objs.get(name, function (obj) {
                    try {
                      if (!obj) return resolve();
                      if (obj.bitmap) { resolve(obj.bitmap); return; }
                      if (obj.data && obj.width && obj.height) {
                        var cv = document.createElement("canvas");
                        cv.width = obj.width; cv.height = obj.height;
                        var cx = cv.getContext("2d");
                        var imgData = cx.createImageData(obj.width, obj.height);
                        var src = obj.data;
                        var kind = obj.kind;
                        if (src.length === obj.width * obj.height * 4) { imgData.data.set(src); }
                        else if (kind === pdfjs.ImageKind.RGB_24BPP && src.length === obj.width * obj.height * 3) {
                          for (var j = 0, k = 0; j < src.length; j += 3, k += 4) { imgData.data[k] = src[j]; imgData.data[k + 1] = src[j + 1]; imgData.data[k + 2] = src[j + 2]; imgData.data[k + 3] = 255; }
                        } else { return resolve(); }
                        cx.putImageData(imgData, 0, 0);
                        resolve(cv.toDataURL("image/png"));
                      } else resolve();
                    } catch (e) { resolve(); }
                  });
                } catch (e) { resolve(); }
              }));
            }
          }
          return Promise.all(imgTasks);
        }).then(function (urls) {
          urls.forEach(function (r) {
            if (typeof r === "string") { raw.push(r); return; }
            if (r && r.width && r.height) {
              try {
                var cv2 = document.createElement("canvas");
                cv2.width = r.width; cv2.height = r.height;
                cv2.getContext("2d").drawImage(r, 0, 0);
                raw.push(cv2.toDataURL("image/png"));
              } catch (e) { }
            }
          });
        }).catch(function () { });
      }));
    })(p);
  }
  return Promise.all(tasks).then(function () { return shrinkAll(raw.slice(0, MAX_IMAGES)); });
}

function setDraftImages(list, name, append) {
  list = list || [];
  var prevImgs = draft.images || [];
  var prevCaps = draft.imageCaptions || [];
  var capByUrl = {};
  prevImgs.forEach(function (u, i) { capByUrl[u] = prevCaps[i] || ""; });
  if (append && prevImgs.length) {
    var seen = {};
    prevImgs.forEach(function (u) { seen[u] = 1; });
    list = prevImgs.concat(list.filter(function (u) { return !seen[u]; }));
  }
  draft.images = list.slice(0, MAX_IMAGES);
  draft.imageCaptions = draft.images.map(function (u) { return capByUrl[u] || ""; });
  if (name) draft.uploadedImages = name;
  saveDraft();
}

function renderImageGallery() {
  var imgs = draft.images || [];
  var caps = draft.imageCaptions || [];
  var h = '<div class="field full"><label>Gambar Otomatis dari Bahan Ajar <span class="hint">(terdeteksi dari file yang diunggah)</span></label>';
  if (!imgs.length) {
    h += '<div class="note note-info">' + ICON.info + "<div><strong>Belum ada gambar</strong>Unggah bahan ajar (.docx/.pdf) yang memuat gambar &mdash; gambar akan terdeteksi otomatis dan dapat dipakai pada soal.</div></div>";
  } else {
    h += '<div class="note note-info">' + ICON.info + "<div><strong>Beri keterangan tiap gambar</strong>Tulis keterangan singkat (mis. \u201cpotongan daging sapi\u201d, \u201cdiagram alur pengolahan\u201d) lalu hapus gambar yang tidak perlu. Keterangan ini membantu AI menempelkan gambar yang tepat pada soalnya.</div></div>";
    h += '<div class="img-gallery mt-8">';
    imgs.forEach(function (u, i) {
      var cap = caps[i] || "";
      h += '<div class="img-cell"><div class="img-thumb"><img src="' + u + '" alt="Gambar ' + (i + 1) + '"><button type="button" class="img-x" title="Hapus gambar" data-action="removeImage" data-idx="' + i + '">' + ICON.close + "</button></div>" +
        '<input type="text" class="img-cap" data-action="imageCaption" data-idx="' + i + '" value="' + esc(cap) + '" placeholder="Keterangan gambar ' + (i + 1) + '" autocomplete="off"></div>';
    });
    h += "</div>";
    h += '<div class="mt-8">' + switchRow("useImages", "Sisipkan Gambar ke Soal", imgs.length + " gambar terdeteksi; hanya disisipkan saat mode AI aktif agar sesuai dengan soal", draft.useImages !== false) + "</div>";
  }
  h += "</div>";
  return h;
}

function removeDraftImage(idx) {
  if (!draft.images) return;
  draft.images.splice(idx, 1);
  if (draft.imageCaptions) draft.imageCaptions.splice(idx, 1);
  saveDraft();
  render();
  toast("success", "Gambar dihapus", "Gambar dikeluarkan dari daftar.");
}

function usedImageIndices(d, total) {
  if (!d || d.useImages === false) return [];
  var n = Math.min((d.images || []).length, total);
  var out = [];
  for (var i = 0; i < n; i++) out.push(i);
  return out;
}

function assignQuestionImages(questions, d, source) {
  var imgs = (d && d.images) || [];
  questions.forEach(function (q) {
    q.image = "";
    if (q.stem) q.stem = q.stem.replace(/^\s*perhatikan gambar berikut(?: ini)?\s*[.,;:!]?\s*/i, "").trim();
  });
  // Gambar hanya disisipkan pada mode AI, karena hanya AI yang bisa "melihat"
  // isi gambar sehingga soal dijamin cocok dengan gambarnya. Mode demo tidak
  // menyisipkan gambar agar tidak ada gambar yang tidak sesuai dengan soal.
  if (source !== "ai") return questions;
  var idxs = usedImageIndices(d, questions.length);
  var taken = {};
  // 1) Utamakan penanda "imageIndex" dari AI: gambar ditempel ke soal yang
  //    benar-benar mengacu pada gambar tersebut, bukan sekadar urutan posisi.
  questions.forEach(function (q) {
    var tag = q.imageIndex;
    if (tag == null || !isFinite(tag)) return;
    var i = Math.round(tag) - 1;
    if (i >= 0 && i < imgs.length && idxs.indexOf(i) >= 0 && !taken[i] && imgs[i]) {
      q.image = imgs[i];
      taken[i] = true;
    }
  });
  // 2) Sisa gambar dipasangkan berurutan ke soal yang belum bergambar.
  var free = idxs.filter(function (i) { return !taken[i]; });
  questions.forEach(function (q) {
    if (q.image || !free.length) return;
    var i = free.shift();
    if (!imgs[i]) return;
    q.image = imgs[i];
    taken[i] = true;
  });
  // 3) Pastikan tiap soal bergambar diawali arahan mengamati gambar.
  questions.forEach(function (q) {
    if (q.image && !/gambar berikut/i.test(q.stem)) q.stem = "Perhatikan gambar berikut.\n" + q.stem;
  });
  return questions;
}

function processModuleText(text, name) {
  var info = analyzeText(text);
  var tp = String(info.tujuan || "").trim();
  draft.uploadedModul = name;
  if (!tp) {
    saveDraft();
    render();
    toast("warn", "Tujuan pembelajaran tidak ditemukan", '"' + name + '" berhasil dibaca, tetapi bagian "Tujuan Pembelajaran" tidak terdeteksi. Tempel atau ketik tujuan pembelajaran secara manual.');
    return;
  }
  draft.tujuan = tp.slice(0, 4000);
  saveDraft();
  render();
  toast("success", "Tujuan pembelajaran terisi", '"' + name + '" dibaca. Tujuan pembelajaran dimuat otomatis \u2014 periksa dan sesuaikan bila perlu.');
}

function processMateriText(text, name) {
  var info = analyzeText(text);
  var raw = info.materi || String(text || "").trim();
  var MAX = 25000;
  var truncated = raw.length > MAX;
  draft.materi = raw.slice(0, MAX);
  draft.uploadedMateri = name;
  saveDraft();
  render();
  toast("success", "Bahan ajar dimuat", '"' + name + '" dibaca (' + text.length + " karakter). Materi pelajaran terisi otomatis." + (truncated ? " Teks dipangkas ke " + MAX + " karakter." : ""));
}

function processUploadedText(text, name, target) {
  text = String(text || "");
  if (!text.trim()) { toast("error", "File kosong", "Tidak ada teks yang bisa dibaca dari file ini."); return; }
  if (target === "module") processModuleText(text, name);
  else processMateriText(text, name);
}

function handleUploadFile(file, target) {
  if (!file) return;
  target = target || "materi";
  var name = file.name || "file";
  var ext = name.split(".").pop().toLowerCase();
  if (ext === "doc") { toast("warn", "Format .doc lama tidak didukung", "Simpan sebagai .docx atau .txt lalu unggah kembali."); return; }
  if (ext === "txt" || ext === "md") {
    var reader = new FileReader();
    reader.onload = function () {
      try { processUploadedText(String(reader.result || ""), name, target); }
      catch (err) { toast("error", "Gagal membaca file", String(err && err.message ? err.message : err).slice(0, 120)); }
    };
    reader.onerror = function () { toast("error", "Gagal membaca file", ""); };
    reader.readAsText(file);
  } else if (ext === "docx") {
    if (!window.mammoth || !window.mammoth.extractRawText) { toast("error", "Pustaka .docx belum siap", "Periksa koneksi internet lalu muat ulang halaman."); return; }
    file.arrayBuffer().then(function (buf) {
      return Promise.all([
        window.mammoth.extractRawText({ arrayBuffer: buf }),
        extractDocxImages(buf).catch(function () { return []; })
      ]);
    }).then(function (res) {
      var text = (res[0] && res[0].value) || "";
      var imgs = res[1] || [];
      if (imgs.length) setDraftImages(imgs, name, target === "module");
      processUploadedText(text, name, target);
      if (imgs.length) toast("info", imgs.length + " gambar terdeteksi", "Gambar dari bahan ajar siap disisipkan ke soal.");
    }).catch(function (err) {
      toast("error", "Gagal membaca .docx", String(err && err.message ? err.message : err).slice(0, 120));
    });
  } else if (ext === "pdf") {
    handlePdfUpload(file, name, target);
  } else {
    toast("info", "Format belum didukung", "Gunakan file .txt, .docx, atau .pdf.");
  }
}

function handlePdfUpload(file, name, target) {
  if (!window.pdfjsLib) { toast("error", "Pustaka PDF belum siap", "Periksa koneksi internet lalu muat ulang halaman."); return; }
  var pdfjs = window.pdfjsLib;
  var WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  function ensureWorker(cb) {
    if (pdfjs.__workerReady) { cb(); return; }
    var setFallback = function () {
      try { if (pdfjs.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL; } catch (e) { }
      pdfjs.__workerReady = true; cb();
    };
    if (!window.fetch || !window.Blob || !window.URL || !URL.createObjectURL) { setFallback(); return; }
    fetch(WORKER_URL).then(function (r) { return r.text(); }).then(function (code) {
      var url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
      try { if (pdfjs.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = url; } catch (e) { }
      pdfjs.__workerReady = true; cb();
    }).catch(setFallback);
  }
  function parse(buf) {
    try {
      pdfjs.getDocument({ data: new Uint8Array(buf) }).promise.then(function (pdf) {
        var tasks = [];
        for (var p = 1; p <= pdf.numPages; p++) {
          (function (pageNum) {
            tasks.push(pdf.getPage(pageNum).then(function (page) {
              return page.getTextContent().then(function (tc) {
                var items = tc.items, lines = [], cur = "", lastY = null;
                for (var i = 0; i < items.length; i++) {
                  var it = items[i];
                  var y = it.transform ? it.transform[5] : null;
                  if (lastY !== null && y !== null && Math.abs(y - lastY) > 2 && cur) { lines.push(cur); cur = ""; }
                  cur += it.str || "";
                  if (it.hasEOL) { lines.push(cur); cur = ""; }
                  if (y !== null) lastY = y;
                }
                if (cur) lines.push(cur);
                return lines.join("\n");
              });
            }));
          })(p);
        }
        return Promise.all(tasks).then(function (parts) { return { parts: parts, pdf: pdf }; });
      }).then(function (r) {
        processUploadedText(r.parts.join("\n"), name, target);
        return extractPdfImages(r.pdf).catch(function () { return []; });
      }).then(function (imgs) {
        if (imgs && imgs.length) { setDraftImages(imgs, name, target === "module"); toast("info", imgs.length + " gambar terdeteksi", "Gambar dari bahan ajar siap disisipkan ke soal."); }
      }).catch(function (err) { toast("error", "Gagal membaca PDF", String(err && err.message ? err.message : err).slice(0, 120)); });
    } catch (err) { toast("error", "Gagal membaca PDF", String(err && err.message ? err.message : err).slice(0, 120)); }
  }
  var reader = new FileReader();
  reader.onload = function () { ensureWorker(function () { parse(reader.result); }); };
  reader.onerror = function () { toast("error", "Gagal membaca file", ""); };
  reader.readAsArrayBuffer(file);
}
