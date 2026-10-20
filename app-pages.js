function uniqueValues(arr) {
  var seen = {}, out = [];
  arr.forEach(function (v) { if (v && !seen[v]) { seen[v] = 1; out.push(v); } });
  out.sort();
  return out;
}

/* ---------------- Riwayat ---------------- */
function renderRiwayat() {
  var f = state.filter.riwayat;
  var mapels = uniqueValues(assessments.map(function (a) { return a.meta.mapel; }));
  var jenises = uniqueValues(assessments.map(function (a) { return a.meta.jenis; }));

  var h = '<div class="card card-pad mb-16"><div class="toolbar" style="margin:0">';
  h += '<div class="search">' + ICON.search + '<input type="text" id="rq" data-filter="riwayat" data-key="q" value="' + esc(f.q) + '" placeholder="Cari judul, mapel, atau kelas..."></div>';
  h += '<select data-filter="riwayat" data-key="jenis"><option value="">Semua jenis</option>' + optSelect(jenises, f.jenis) + "</select>";
  h += '<select data-filter="riwayat" data-key="mapel"><option value="">Semua mapel</option>' + optSelect(mapels, f.mapel) + "</select>";
  h += "</div></div>";

  if (!assessments.length) {
    h += '<div class="card"><div class="empty">' + ICON.history + "<h4>Belum ada riwayat</h4><p>Asesmen yang Anda simpan akan muncul di sini.</p>" +
      '<button class="btn btn-primary" data-action="nav" data-page="buat">' + ICON.plus + " Buat Asesmen</button></div></div>";
    return h;
  }

  var rows = assessments.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).filter(function (a) {
    var q = f.q.toLowerCase();
    var match = !q || (a.meta.judul + " " + a.meta.mapel + " " + a.meta.kelas + " " + a.meta.jenis).toLowerCase().indexOf(q) >= 0;
    return match && (!f.jenis || a.meta.jenis === f.jenis) && (!f.mapel || a.meta.mapel === f.mapel);
  });

  h += '<div class="table-wrap"><table class="tbl"><thead><tr><th>Judul</th><th>Jenis</th><th>Mapel</th><th>Kelas</th><th>Soal</th><th>Dibuat</th><th>Aksi</th></tr></thead><tbody>';
  if (!rows.length) {
    h += '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px">Tidak ada data yang cocok dengan filter.</td></tr>';
  }
  rows.forEach(function (a) {
    h += "<tr><td><strong>" + esc(a.meta.judul) + "</strong></td>" +
      '<td><span class="badge badge-blue">' + esc(a.meta.jenis) + "</span></td>" +
      "<td>" + esc(a.meta.mapel) + "</td><td>" + esc(a.meta.kelas) + "</td>" +
      "<td>" + a.questions.length + "</td><td>" + fmtDateTime(a.createdAt) + "</td>" +
      '<td><div class="tbl-actions">' +
      '<button class="btn btn-light btn-sm" data-action="seriesModal" data-id="' + a.id + '" title="Buat Seri Lanjutan — identitas &amp; materi sama, ganti tingkat kesulitan">' + ICON.sparkles + "</button>" +
      '<button class="btn btn-light btn-sm" data-action="viewAssessment" data-id="' + a.id + '" title="Lihat detail">' + ICON.eye + "</button>" +
      '<button class="btn btn-light btn-sm" data-action="editMeta" data-id="' + a.id + '" title="Edit">' + ICON.edit + "</button>" +
      '<button class="btn btn-light btn-sm" data-action="dupAssessment" data-id="' + a.id + '" title="Duplikasi">' + ICON.copy + "</button>" +
      '<button class="btn btn-light btn-sm" data-action="exportWordById" data-id="' + a.id + '" title="Unduh Word">' + ICON.download + "</button>" +
      '<button class="btn btn-danger btn-sm" data-action="delAssessment" data-id="' + a.id + '" title="Hapus">' + ICON.trash + "</button>" +
      "</div></td></tr>";
  });
  h += "</tbody></table></div>";
  return h;
}

function findAssessment(id) {
  for (var i = 0; i < assessments.length; i++) if (assessments[i].id === id) return assessments[i];
  return null;
}

function resolveAssessment(id) {
  var a = findAssessment(id);
  if (!a && state.current && state.current.id === id) a = state.current;
  if (!a && state.pfPkgReg && state.pfPkgReg[id]) a = state.pfPkgReg[id];
  return a;
}

function editMetaModal(id) {
  var a = resolveAssessment(id);
  if (!a) return;
  var m = a.meta;
  var body = "";
  body += '<div class="form-grid">';
  body += '<div class="field full"><label>Judul Asesmen</label><input type="text" id="emJudul" value="' + esc(m.judul) + '"></div>';
  body += '<div class="field"><label>Nama Guru</label><input type="text" id="emGuru" value="' + esc(m.namaGuru) + '"></div>';
  body += '<div class="field"><label>Nama Sekolah</label><input type="text" id="emSekolah" value="' + esc(m.sekolah) + '"></div>';
  body += '<div class="field"><label>Jenjang</label><select id="emJenjang">' + optSelect(JENJANG, m.jenjang) + "</select></div>";
  body += '<div class="field"><label>Kelas</label><select id="emKelas"><option value="">-</option>' + optSelect(KELAS_BOGA, m.kelas) + "</select></div>";
  body += '<div class="field"><label>Mata Pelajaran</label><select id="emMapel"><option value="">-</option>' + optSelect(MAPEL_BOGA, m.mapel) + "</select></div>";
  body += '<div class="field"><label>Jenis Asesmen</label><select id="emJenis">' + optSelect(ASSESSMENT_TYPES, m.jenis) + "</select></div>";
  body += '<div class="field"><label>Semester</label><select id="emSemester">' + optSelect(SEMESTER, m.semester) + "</select></div>";
  body += '<div class="field"><label>Tahun Ajaran</label><select id="emTahun"><option value="">-</option>' + optSelect(TAHUN_AJARAN, m.tahun) + "</select></div>";
  body += '<div class="field"><label>Tanggal Pelaksanaan</label><input type="date" id="emTanggal" value="' + esc(m.tanggal || "") + '"></div>';
  body += '<div class="field"><label>Alokasi Waktu</label><input type="text" id="emAlokasi" value="' + esc(m.alokasi || "") + '"></div>';
  body += '<div class="field full"><label>Kop &mdash; Baris Instansi/Dinas</label><input type="text" id="emDinas" value="' + esc(m.kopDinas || "") + '"></div>';
  body += '<div class="field full"><label>Kop &mdash; Alamat Sekolah</label><input type="text" id="emAlamat" value="' + esc(m.sekolahAlamat || "") + '"></div>';
  body += '<div class="field full"><label>Kop &mdash; Kontak / Identitas</label><input type="text" id="emKontak" value="' + esc(m.sekolahKontak || "") + '"></div>';
  body += "</div>";
  openModal(
    '<div class="modal-head"><h3>Edit Identitas Asesmen</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="saveMeta" data-id="' + a.id + '">' + ICON.save + " Simpan</button></div>",
    { wide: true }
  );
}

function saveMeta(id) {
  var a = resolveAssessment(id);
  if (!a) return;
  var m = a.meta;
  m.judul = document.getElementById("emJudul").value;
  m.namaGuru = document.getElementById("emGuru").value;
  m.sekolah = document.getElementById("emSekolah").value;
  m.jenjang = document.getElementById("emJenjang").value;
  m.kelas = document.getElementById("emKelas").value;
  m.mapel = document.getElementById("emMapel").value;
  m.jenis = document.getElementById("emJenis").value;
  m.semester = document.getElementById("emSemester").value;
  m.tahun = document.getElementById("emTahun").value;
  m.tanggal = document.getElementById("emTanggal").value;
  m.alokasi = document.getElementById("emAlokasi").value;
  m.kopDinas = document.getElementById("emDinas").value;
  m.sekolahAlamat = document.getElementById("emAlamat").value;
  m.sekolahKontak = document.getElementById("emKontak").value;
  if (findAssessment(id)) persist();
  closeModal();
  render();
  toast("success", "Identitas diperbarui", "Data asesmen berhasil diperbarui.");
}

/* ---------------- Bank Soal ---------------- */
function bankCount() {
  var n = 0;
  for (var k in state.bankSelect) if (state.bankSelect.hasOwnProperty(k)) n++;
  state.bankSelectSize = n;
  return n;
}

function renderBank() {
  var f = state.filter.bank;
  var mapels = uniqueValues(bank.map(function (b) { return b.mapel; }));
  var selCount = bankCount();

  var h = '<div class="card card-pad mb-16"><div class="toolbar" style="margin:0">';
  h += '<div class="search">' + ICON.search + '<input type="text" id="bq" data-filter="bank" data-key="q" value="' + esc(f.q) + '" placeholder="Cari soal, materi, atau kunci..."></div>';
  h += '<select data-filter="bank" data-key="mapel"><option value="">Semua mapel</option>' + optSelect(mapels, f.mapel) + "</select>";
  h += '<select data-filter="bank" data-key="bentuk"><option value="">Semua bentuk</option>' + optSelect(BENTUK, f.bentuk) + "</select>";
  h += "</div>";
  h += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">';
  h += '<button class="btn btn-primary btn-sm" data-action="addBank">' + ICON.plus + " Tambah Soal Manual</button>";
  if (selCount) {
    h += '<button class="btn btn-success btn-sm" data-action="bankCreateAssessment">' + ICON.sparkles + " Buat Asesmen dari " + selCount + " Soal Terpilih</button>";
    h += '<button class="btn btn-ghost btn-sm" data-action="bankClearSelect">Batal Pilih</button>';
  }
  h += "</div></div>";

  if (!bank.length) {
    h += '<div class="card"><div class="empty">' + ICON.book + "<h4>Bank soal masih kosong</h4><p>Simpan soal dari hasil generate atau tambahkan soal manual.</p>" +
      '<button class="btn btn-primary" data-action="addBank">' + ICON.plus + " Tambah Soal Manual</button></div></div>";
    return h;
  }

  var rows = bank.filter(function (b) {
    var q = f.q.toLowerCase();
    var match = !q || (b.stem + " " + (b.materi || "") + " " + (b.answer || "")).toLowerCase().indexOf(q) >= 0;
    return match && (!f.mapel || b.mapel === f.mapel) && (!f.bentuk || b.type === f.bentuk);
  });

  h += '<div class="grid grid-2">';
  if (!rows.length) {
    h += '<div class="card card-pad" style="grid-column:1/-1;text-align:center;color:var(--muted)">Tidak ada soal yang cocok dengan filter.</div>';
  }
  rows.forEach(function (b) {
    var sel = !!state.bankSelect[b.id];
    h += '<div class="qcard" style="' + (sel ? "border-color:var(--blue-400);box-shadow:0 0 0 3px rgba(59,130,246,.12)" : "") + '">';
    h += '<div class="qcard-head"><label class="chk' + (sel ? " checked" : "") + '"><input type="checkbox" data-action="bankSelect" data-id="' + b.id + '"' + (sel ? " checked" : "") + "> Pilih</label>" +
      '<span class="badge badge-blue">' + esc(bentukLabel(b.type)) + "</span>" + cogBadge(b.cognitive) + diffBadge(b.difficulty) + "</div>";
    h += '<div class="qstem">' + nl2br(b.stem) + "</div>";
    if (b.options && b.options.length) {
      h += '<ul class="options">';
      b.options.forEach(function (o) {
        h += '<li class="' + (isCorrectOption(b, o.key) ? "correct" : "") + '"><span class="okey">' + esc(o.key) + '.</span><span>' + nl2br(o.text) + "</span></li>";
      });
      h += "</ul>";
    }
    if (b.pairs && b.pairs.length) {
      h += '<div class="table-wrap mt-16"><table class="tbl" style="min-width:auto"><thead><tr><th>Istilah</th><th>Penjelasan</th></tr></thead><tbody>';
      b.pairs.forEach(function (p) { h += "<tr><td>" + esc(p.left) + "</td><td>" + esc(p.right) + "</td></tr>"; });
      h += "</tbody></table></div>";
    }
    h += '<div class="qmeta"><span><b>Mapel:</b> ' + esc(b.mapel || "-") + "</span><span><b>Kelas:</b> " + esc(b.kelas || "-") + "</span><span><b>Materi:</b> " + esc(b.materi || "-") + "</span></div>";
    if (b.answer) h += '<div class="answer-box"><strong>Kunci</strong>' + nl2br(b.answer) + "</div>";
    if (b.explanation) h += '<div class="answer-box explain"><strong>Pembahasan</strong>' + nl2br(b.explanation) + "</div>";
    h += '<div class="q-actions"><button class="btn btn-light btn-sm" data-action="editBank" data-id="' + b.id + '">' + ICON.edit + " Edit</button>" +
      '<button class="btn btn-danger btn-sm" data-action="delBank" data-id="' + b.id + '">' + ICON.trash + " Hapus</button></div>";
    h += "</div>";
  });
  h += "</div>";
  return h;
}

function findBank(id) {
  for (var i = 0; i < bank.length; i++) if (bank[i].id === id) return bank[i];
  return null;
}

function bankFormModal(existing) {
  var b = existing || { type: "pg", cognitive: "C2", difficulty: "sedang", weight: 1, mapel: "", kelas: "", materi: "", stem: "", options: [], answer: "", explanation: "", pairs: [] };
  var optionsText = (b.options || []).map(function (o) { return o.text; }).join("\n");
  var pairsText = (b.pairs || []).map(function (p) { return p.left + " | " + p.right; }).join("\n");
  var body = "";
  body += '<div class="form-grid">';
  body += '<div class="field"><label>Mata Pelajaran</label><select id="bkMapel"><option value="">-</option>' + optSelect(MAPEL_BOGA, b.mapel) + "</select></div>";
  body += '<div class="field"><label>Kelas</label><select id="bkKelas"><option value="">-</option>' + optSelect(KELAS_BOGA, b.kelas) + "</select></div>";
  body += '<div class="field full"><label>Materi</label><input type="text" id="bkMateri" value="' + esc(b.materi) + '"></div>';
  body += '<div class="field"><label>Bentuk Soal</label><select id="bkType">' + optSelect(BENTUK, b.type) + "</select></div>";
  body += '<div class="field"><label>Level Kognitif</label><select id="bkCog">' + optSelect(KOGNITIF, b.cognitive) + "</select></div>";
  body += '<div class="field"><label>Tingkat Kesulitan</label><select id="bkDiff">' + optSelect(KESULITAN.slice(0, 3), b.difficulty) + "</select></div>";
  body += '<div class="field"><label>Bobot Nilai</label><input type="number" min="1" id="bkWeight" value="' + b.weight + '"></div>';
  body += "</div>";
  body += '<div class="field mt-16"><label>Teks Soal</label><textarea id="bkStem" style="min-height:90px">' + esc(b.stem) + "</textarea></div>";
  body += '<div class="field mt-16"><label>Pilihan Jawaban <span class="hint">(satu per baris)</span></label><textarea id="bkOptions">' + esc(optionsText) + "</textarea></div>";
  body += '<div class="field mt-16"><label>Kunci Jawaban</label><input type="text" id="bkAnswer" value="' + esc(b.answer) + '"></div>';
  body += '<div class="field mt-16"><label>Pasangan Menjodohkan <span class="hint">(kiri | kanan per baris)</span></label><textarea id="bkPairs">' + esc(pairsText) + "</textarea></div>";
  body += '<div class="field mt-16"><label>Pembahasan</label><textarea id="bkExplain">' + esc(b.explanation) + "</textarea></div>";

  openModal(
    '<div class="modal-head"><h3>' + (existing ? "Edit Soal" : "Tambah Soal Manual") + '</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="saveBank" data-id="' + (existing ? existing.id : "") + '">' + ICON.save + " Simpan</button></div>",
    { wide: true }
  );
}

function saveBank(id) {
  var existing = id ? findBank(id) : null;
  var stem = document.getElementById("bkStem").value.trim();
  if (!stem) { toast("warn", "Soal kosong", "Teks soal wajib diisi."); return; }
  var obj = existing || { id: uid(), createdAt: new Date().toISOString() };
  obj.mapel = document.getElementById("bkMapel").value;
  obj.kelas = document.getElementById("bkKelas").value;
  obj.materi = document.getElementById("bkMateri").value;
  obj.type = document.getElementById("bkType").value;
  obj.cognitive = document.getElementById("bkCog").value;
  obj.difficulty = document.getElementById("bkDiff").value;
  obj.weight = Math.max(1, parseInt(document.getElementById("bkWeight").value, 10) || 1);
  obj.stem = stem;
  obj.answer = document.getElementById("bkAnswer").value;
  obj.explanation = document.getElementById("bkExplain").value;
  obj.options = document.getElementById("bkOptions").value.split("\n").map(function (s) { return s.trim(); }).filter(function (s) { return s; })
    .map(function (t, i) { return { key: String.fromCharCode(65 + i), text: t }; });
  obj.pairs = document.getElementById("bkPairs").value.split("\n").map(function (s) { return s.trim(); }).filter(function (s) { return s; })
    .map(function (line) { var p = line.split("|"); return { left: (p[0] || "").trim(), right: (p[1] || "").trim() }; });
  if (!existing) bank.push(obj);
  persist();
  closeModal();
  render();
  toast("success", existing ? "Soal diperbarui" : "Soal ditambahkan", "Bank Soal berhasil diperbarui.");
}

function deleteBank(id) {
  confirmModal("Hapus Soal", "Yakin ingin menghapus soal ini dari Bank Soal?", "Hapus", function () {
    bank = bank.filter(function (b) { return b.id !== id; });
    delete state.bankSelect[id];
    persist();
    render();
    toast("success", "Soal dihapus", "Soal berhasil dihapus dari Bank Soal.");
  });
}

function bankCreateAssessmentModal() {
  var ids = Object.keys(state.bankSelect);
  if (!ids.length) { toast("warn", "Belum ada soal dipilih", "Pilih minimal satu soal."); return; }
  var body = '<div class="note note-info mb-16">' + ICON.info + "<div><strong>" + ids.length + " soal terpilih</strong>Lengkapi identitas asesmen untuk soal-soal ini.</div></div>";
  body += '<div class="form-grid">';
  body += '<div class="field"><label>Nama Guru <span class="req">*</span></label><input type="text" id="caGuru"></div>';
  body += '<div class="field"><label>Nama Sekolah <span class="req">*</span></label><input type="text" id="caSekolah"></div>';
  body += '<div class="field"><label>Jenjang <span class="req">*</span></label><select id="caJenjang"><option value="">Pilih</option>' + optSelect(JENJANG) + "</select></div>";
  body += '<div class="field"><label>Kelas <span class="req">*</span></label><select id="caKelas"><option value="">Pilih</option>' + optSelect(KELAS_BOGA) + "</select></div>";
  body += '<div class="field"><label>Mata Pelajaran <span class="req">*</span></label><select id="caMapel"><option value="">Pilih</option>' + optSelect(MAPEL_BOGA) + "</select></div>";
  body += '<div class="field"><label>Jenis Asesmen <span class="req">*</span></label><select id="caJenis"><option value="">Pilih</option>' + optSelect(ASSESSMENT_TYPES) + "</select></div>";
  body += '<div class="field full"><label>Judul Asesmen <span class="req">*</span></label><input type="text" id="caJudul"></div>';
  body += '<div class="field"><label>Semester</label><select id="caSemester">' + optSelect(SEMESTER, "Ganjil") + "</select></div>";
  body += '<div class="field"><label>Tahun Ajaran</label><select id="caTahun"><option value="">-</option>' + optSelect(TAHUN_AJARAN) + "</select></div>";
  body += "</div>";

  openModal(
    '<div class="modal-head"><h3>Buat Asesmen dari Bank Soal</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="confirmBankAssessment">' + ICON.check + " Buat Asesmen</button></div>",
    { wide: true }
  );
}

function confirmBankAssessment() {
  var guru = document.getElementById("caGuru").value.trim();
  var sekolah = document.getElementById("caSekolah").value.trim();
  var jenjang = document.getElementById("caJenjang").value;
  var kelas = document.getElementById("caKelas").value.trim();
  var mapel = document.getElementById("caMapel").value.trim();
  var jenis = document.getElementById("caJenis").value;
  var judul = document.getElementById("caJudul").value.trim();
  if (!guru || !sekolah || !jenjang || !kelas || !mapel || !jenis || !judul) {
    toast("warn", "Lengkapi data", "Semua kolom bertanda * wajib diisi.");
    return;
  }
  var ids = Object.keys(state.bankSelect);
  var questions = [];
  ids.forEach(function (id) {
    var b = findBank(id);
    if (b) questions.push({
      id: uid(), no: questions.length + 1, type: b.type, cognitive: b.cognitive, difficulty: b.difficulty,
      weight: b.weight || 1, stem: b.stem, options: b.options || [], answer: b.answer || "",
      explanation: b.explanation || "", pairs: b.pairs || [], rubric: b.rubric || ""
    });
  });
  state.current = {
    id: uid(),
    meta: {
      namaGuru: guru, sekolah: sekolah, jenjang: jenjang, kelas: kelas,
      semester: document.getElementById("caSemester").value, tahun: document.getElementById("caTahun").value,
      mapel: mapel, jenis: jenis, judul: judul, tanggal: "", alokasi: "",
      materiPokok: bank[0] ? bank[0].materi || "" : "", submateri: "", cp: "", tujuan: "", materi: "", instruksi: "",
      bentuk: questions[0] ? questions[0].type : "pg", kesulitan: "campuran", cognitive: [],
      kisiKisi: true, kunci: true, pembahasan: true, rubrik: true
    },
    questions: questions,
    source: bank[0] && bank[0].source === "ai" ? "ai" : "demo",
    saved: false,
    createdAt: new Date().toISOString()
  };
  state.bankSelect = {};
  state.page = "result";
  state.resultTab = "soal";
  closeModal();
  render();
  toast("success", "Asesmen dibuat", questions.length + " soal dari Bank Soal siap ditinjau.");
}

/* ---------------- API settings ---------------- */
function renderApi() {
  var masked = apiConfig.key ? "&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" + esc(apiConfig.key.slice(-4)) : "";
  var statusHtml;
  if (apiReady() && apiConfig.lastTest && apiConfig.lastTest.ok) {
    statusHtml = '<div class="note note-success">' + ICON.check + "<div><strong>Koneksi Aktif</strong>API berhasil diuji pada " + fmtDateTime(apiConfig.lastTest.at) + ". Generator akan menggunakan AI.</div></div>";
    if (apiConfig.lastTest.error) {
      statusHtml += '<div class="note note-warn mt-16">' + ICON.alert + "<div><strong>Konfigurasi Utama Ditolak</strong>" + esc(apiConfig.lastTest.error) + "</div></div>";
    }
  } else if (apiReady() && apiConfig.lastTest && apiConfig.lastTest.ok === false) {
    var _netErr = /Request tidak sampai|Waktu tunggu|offline|tidak dapat/i.test(apiConfig.lastTest.error || "");
    var _advice = _netErr
      ? "Ini masalah jaringan, bukan API key. Buka aplikasi dari alamat https hasil publish (bukan file lokal), matikan VPN/adblock sementara, lalu uji ulang."
      : "Periksa API key, nama model, dan status generative language API di project Google Anda.";
    var _errMsg = String(apiConfig.lastTest.error || "tidak ada detail").replace(/[\s.]+$/, "");
    statusHtml = '<div class="note note-error">' + ICON.alert + "<div><strong>Koneksi Gagal</strong>Uji koneksi terakhir gagal pada " + fmtDateTime(apiConfig.lastTest.at) + ". Pesan: <b>" + esc(_errMsg) + "</b>. " + _advice + "</div></div>";
  } else if (apiReady()) {
    statusHtml = '<div class="note note-warn">' + ICON.alert + "<div><strong>Belum Diuji</strong>API key tersimpan. Klik \u201cUji Koneksi\u201d untuk memastikan konfigurasi benar.</div></div>";
  } else {
    statusHtml = '<div class="note note-warn">' + ICON.alert + "<div><strong>Mode Demo</strong>API AI belum dikonfigurasi. Aplikasi tetap berjalan dan menyusun soal dengan template materi. Untuk hasil berbasis AI, masukkan API key Gemini di bawah.</div></div>";
  }

  var h = '<div class="grid grid-2">';
  h += '<div class="card card-pad">';
  h += '<div class="card-head"><div><h3>Konfigurasi AI</h3><p>Hubungkan ke penyedia layanan AI</p></div></div>';
  h += statusHtml;
  if (apiConfig.lastError) {
    h += '<div class="note note-error mt-16">' + ICON.alert + "<div><strong>Gagal Generate Terakhir</strong>" + esc(apiConfig.lastError) + ". Materi tetap bisa disusun dengan mode demo.</div></div>";
  }
  h += '<div class="field mt-16"><label>Penyedia AI</label><select id="apiProvider"><option value="gemini"' + (apiConfig.provider === "gemini" ? " selected" : "") + ">Google Gemini</option></select></div>";
  h += '<div class="field mt-16"><label>Model</label><input type="text" id="apiModel" value="' + esc(apiConfig.model) + '" placeholder="' + esc(MODEL_DEFAULT) + '"><span class="hint">Model default: <b>' + esc(MODEL_DEFAULT) + '</b>. Google menonaktifkan model lama (mis. gemini-2.5-flash) untuk pengguna baru, jadi gunakan model terbaru.</span></div>';

  if (apiConfig.key && !state.apiEditingKey) {
    h += '<div class="field mt-16"><label>API Key tersimpan</label><div style="display:flex;gap:10px;align-items:center"><input type="text" value="' + masked + '" disabled><button class="btn btn-light" data-action="apiChangeKey">Ganti</button></div><span class="hint">Demi keamanan, API key tidak ditampilkan kembali.</span></div>';
  } else {
    h += '<div class="field mt-16"><label>API Key</label><input type="password" id="apiKey" placeholder="Masukkan API key Gemini"><span class="hint">Kunci disimpan di penyimpanan lokal browser Anda dan hanya dikirim ke penyedia AI yang dipilih.</span></div>';
  }

  h += '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">';
  h += '<button class="btn btn-primary" data-action="apiSave">' + ICON.save + " Simpan</button>";
  h += '<button class="btn btn-light" id="apiTestBtn" data-action="apiTest">' + ICON.refresh + " Uji Koneksi</button>";
  if (apiConfig.key) h += '<button class="btn btn-danger" data-action="apiRemove">' + ICON.trash + " Hapus Key</button>";
  h += "</div>";
  h += '<div class="hint" style="margin-top:14px">Versi generator: <b>' + esc(APP_BUILD) + "</b>. Jika versi ini tidak tampil, muat ulang halaman dengan Ctrl+Shift+R (Ctrl+F5).</div>";
  h += "</div>";

  h += '<div class="card card-pad">';
  h += '<div class="card-head"><div><h3>Panduan &amp; Keamanan</h3><p>Langkah mendapatkan API key Gemini</p></div></div>';
  h += '<ol style="font-size:13.5px;line-height:1.9;padding-left:20px;color:#334155">' +
    "<li>Buka Google AI Studio (aistudio.google.com) dan masuk dengan akun Google.</li>" +
    "<li>Pilih menu <b>Get API key</b> lalu buat API key baru.</li>" +
    "<li>Salin API key dan tempel pada kolom, lalu klik <b>Simpan</b>.</li>" +
    "<li>Klik <b>Uji Koneksi</b> untuk memastikan API key valid.</li></ol>";
  h += '<div class="note note-warn mt-16">' + ICON.alert + "<div><strong>Catatan Keamanan</strong>API key disimpan secara lokal di browser ini (localStorage). Untuk penggunaan bersama atau publik, letakkan key pada backend/server agar tidak terekspos. Jangan pernah membagikan API key kepada orang lain.</div></div>";
  h += '<div class="note note-info mt-16">' + ICON.info + "<div><strong>Tentang Mode Demo</strong>Tanpa API key, aplikasi membuat soal menggunakan template dari materi yang Anda masukkan. Hasil demo diberi label jelas dan <b>tidak</b> diklaim sebagai keluaran AI.</div></div>";
  h += "</div>";
  h += "</div>";
  return h;
}

function apiSave() {
  var modelEl = document.getElementById("apiModel");
  var keyEl = document.getElementById("apiKey");
  var providerEl = document.getElementById("apiProvider");
  if (providerEl) apiConfig.provider = providerEl.value;
  if (modelEl) {
    var newModel = modelEl.value.trim() || MODEL_DEFAULT;
    if (newModel !== apiConfig.model) { apiConfig.model = newModel; apiConfig.lastTest = null; apiConfig.lastError = ""; }
  }
  if (keyEl && keyEl.value.trim()) {
    apiConfig.key = keyEl.value.trim();
    apiConfig.lastTest = null;
    apiConfig.lastError = "";
    state.apiEditingKey = false;
  } else if (!apiConfig.key || (typeof apiConfig.key === "string" && !apiConfig.key.trim())) {
    toast("warn", "API key kosong", "Masukkan API key untuk mengaktifkan AI.");
    return;
  }
  persist();
  render();
  toast("success", "Pengaturan disimpan", "Konfigurasi AI berhasil disimpan.");
}

function apiRemove() {
  confirmModal("Hapus API Key", "Menghapus API key akan mengembalikan aplikasi ke mode demo. Lanjutkan?", "Hapus", function () {
    apiConfig.key = "";
    apiConfig.lastTest = null;
    apiConfig.lastError = "";
    state.apiEditingKey = false;
    persist();
    render();
    toast("success", "API key dihapus", "Aplikasi kembali ke mode demo.");
  });
}

/* ---------------- Rekap Nilai ---------------- */
function rekapAssessment() {
  var id = state.rekap.aid;
  if (!id) return state.current && assessments.indexOf(state.current) >= 0 ? state.current : null;
  return resolveAssessment(id);
}

/* Tingkat kesiapan murid pada paket "satu tautan kelas" (label untuk guru). */
function rekapRowLevel(a, row) {
  var pm = (a && a.meta && a.meta.perMurid) || null;
  if (!pm || !pm.length) return "";
  var key = normAns(row && row.nama);
  for (var i = 0; i < pm.length; i++) if (normAns(pm[i].nama) === key) return pfTingkatLabel(pm[i].lv);
  return "";
}

/* Soal yang benar-benar diterima satu murid.
   Untuk paket "satu tautan kelas" (meta.perMurid), setiap murid hanya menerima
   soal tingkatnya, jadi penilaian harus dihitung dari himpunan soal itu saja. */
function rekapRowQuestions(a, row) {
  if (!a) return [];
  var pm = (a.meta && a.meta.perMurid) || null;
  if (!pm || !pm.length) return a.questions;
  var key = normAns(row && row.nama);
  var i;
  for (i = 0; i < pm.length; i++) {
    if (normAns(pm[i].nama) === key) {
      var ids = pm[i].ids || [];
      var sub = a.questions.filter(function (q) { return ids.indexOf(q.id) >= 0; });
      if (sub.length) return sub;
      break;
    }
  }
  var keys = Object.keys((row && row.answers) || {});
  var sub2 = a.questions.filter(function (q) { return keys.indexOf(q.id) >= 0; });
  return sub2.length ? sub2 : a.questions;
}

function rekapScoreFor(ri, q) {
  var entry = state.rekap.scores[ri];
  return entry && entry[q.id] != null ? entry[q.id] : null;
}

function rekapFinalScore(row, a) {
  var obj = 0, total = 0;
  if (!a) return { auto: row.skor, total: row.total, nilai: null };
  rekapRowQuestions(a, row).forEach(function (q) {
    var w = Number(q.weight) || 1; total += w;
    var s = autoScoreQuestion(q, row.answers[q.id]);
    if (s === true) obj += w;
  });
  return { auto: obj, total: total || row.total };
}

function renderRekap() {
  var ep = endpointUrl();
  var h = "";
  h += '<div class="card card-pad mb-16">';
  h += '<div class="card-head"><div><h3>Endpoint Google Apps Script</h3><p>Alamat yang menerima jawaban siswa dan menyimpannya ke Google Sheet</p></div>' +
    '<button class="btn btn-light btn-sm" data-action="guide">' + ICON.info + " Panduan Lengkap</button></div>";
  h += '<div class="field"><label>Web App URL (berakhir <b>/exec</b>)</label><input type="text" id="epUrl" value="' + esc(ep) + '" placeholder="https://script.google.com/macros/s/XXXX/exec"><span class="hint">' + (ep ? "Endpoint aktif: <b>" + esc(ep) + "</b> &mdash; dipakai untuk menerima jawaban siswa dan tombol Tarik Hasil." : "Belum diatur. Tarik Hasil belum bisa dipakai; siswa akan menerima kode hasil untuk diimpor manual.") + "</span></div>";
  h += '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">' +
    '<button class="btn btn-primary" data-action="epSave">' + ICON.save + " Simpan Endpoint</button>" +
    (ep ? '<button class="btn btn-light" data-action="epClear">' + ICON.close + " Kosongkan</button>" : "") +
    '<button class="btn btn-light" data-action="importResults">' + ICON.upload + " Impor Kode Hasil</button>" +
    "</div></div>";

  var list = assessments.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  if (!list.length && !state.rekap.aid) {
    h += emptyState(ICON.users, "Belum ada asesmen", "Buat dan simpan asesmen dulu, lalu bagikan ke siswa.", "Buat Asesmen", "nav", "buat");
    return h;
  }
  h += '<div class="card card-pad mb-16"><div class="card-head"><div><h3>Tarik Hasil</h3><p>Pilih asesmen atau paket pemetaan, lalu klik Tarik Hasil</p></div></div>';
  var paketReg = Object.keys(state.pfPkgReg || {}).map(function (k) { return state.pfPkgReg[k]; });
  h += '<div class="form-grid"><div class="field"><label>Asesmen / paket</label><select id="rekapAid">' +
    '<option value=""' + (!state.rekap.aid ? " selected" : "") + ">Semua hasil (semua asesmen &amp; paket)</option>";
  list.forEach(function (a) {
    h += '<option value="' + a.id + '"' + (state.rekap.aid === a.id ? " selected" : "") + ">" + esc(a.meta.judul) + " &mdash; " + esc(a.meta.kelas) + "</option>";
  });
  if (paketReg.length) {
    h += '<optgroup label="Paket pemetaan (sesi ini)">';
    paketReg.forEach(function (p) {
      h += '<option value="' + esc(p.id) + '"' + (state.rekap.aid === p.id ? " selected" : "") + ">" + esc(p.meta.judul) + " &mdash; " + p.questions.length + " soal</option>";
    });
    h += "</optgroup>";
  }
  h += "</select><span class=\"hint\">" +
    (paketReg.length ? "Paket hasil <b>Petakan Soal</b> muncul di sini selama sesi ini; setelah halaman ditutup, gunakan pilihan <b>Semua hasil</b>. Paket <b>Tugas Kelas</b> menilai tiap murid hanya dari soal tingkatnya." : "Paket hasil <b>Petakan Soal</b> (tugas bertingkat) akan muncul di daftar ini.") +
    "</span></div>";
  h += '<div class="field" style="display:flex;align-items:flex-end;gap:10px"><button class="btn btn-primary" data-action="pullResults">' + ICON.refresh + " Tarik Hasil</button>";
  if (state.rekap.pulled.length) h += '<button class="btn btn-light" data-action="exportPenilaian">' + ICON.download + " Unduh Lembar Penilaian</button>";
  h += "</div></div></div>";

  var rows = state.rekap.pulled;
  if (state.rekap.loading) {
    h += '<div class="loading"><div class="spinner"></div><div style="font-weight:600;color:var(--ink)">Menarik hasil dari endpoint...</div></div>';
    return h;
  }
  if (!rows.length) {
    h += '<div class="note note-info">' + ICON.info + "<div><strong>Belum ada hasil</strong>Bagikan asesmen ke siswa (menu Hasil Asesmen &rarr; Bagikan ke Siswa), lalu klik Tarik Hasil setelah siswa mengumpulkan jawaban.</div></div>";
    return h;
  }

  var activeA = rekapAssessment();
  var scores = [], autoScores = [];
  rows.forEach(function (r) {
    var fs = rekapFinalScore(r, activeA);
    autoScores.push(fs.auto);
  });
  var avg = autoScores.reduce(function (s, x) { return s + x; }, 0) / autoScores.length;
  var maxS = Math.max.apply(null, autoScores), minS = Math.min.apply(null, autoScores);

  h += '<div class="grid grid-4 mb-16">';
  h += statCard("si-blue", ICON.users, rows.length, "Jumlah Siswa");
  h += statCard("si-green", ICON.chart, rows[0] ? rows[0].total : 0, "Total Bobot");
  h += statCard("si-violet", ICON.check, (Math.round(avg * 10) / 10), "Rata-rata Skor Objektif");
  h += statCard("si-amber", ICON.chart, maxS + " / " + minS, "Tertinggi / Terendah");
  h += "</div>";

  h += '<div class="card"><div class="card-pad"><div class="card-head"><div><h3>Daftar Jawaban Siswa</h3><p>' + rows.length + " respons" + (activeA ? " &bull; " + esc(activeA.meta.judul) : " &bull; semua paket/asesmen") + "</p></div></div>";
  h += '<div class="table-wrap"><table class="tbl"><thead><tr><th>No</th><th>Nama</th><th>Kelas</th>' + (activeA ? "" : "<th>Paket / Asesmen</th>") + '<th>Benar (objektif)</th><th>Skor</th><th>Waktu</th><th></th></tr></thead><tbody>';
  rows.forEach(function (r, i) {
    var lvl = activeA ? rekapRowLevel(activeA, r) : "";
    h += "<tr><td>" + (i + 1) + "</td><td><strong>" + esc(r.nama) + "</strong>" + (r.absen ? " <span class=\"badge badge-slate\">" + esc(r.absen) + "</span>" : "") + (lvl ? " <span class=\"badge badge-blue\">" + esc(lvl) + "</span>" : "") + "</td>" +
      "<td>" + esc(r.kelas) + "</td>" + (activeA ? "" : "<td>" + esc(r.judul || "-") + "</td>") + "<td>" + r.benar + " / " + r.total + "</td><td>" + r.skor + "</td><td>" + fmtDateTime(r.waktu) + "</td>" +
      '<td><button class="btn btn-light btn-sm" data-action="rekapDetail" data-ri="' + i + '">' + ICON.eye + " Detail</button></td></tr>";
  });
  h += "</tbody></table></div></div></div>";
  return h;
}

function rekapDetailModal(ri) {
  var row = state.rekap.pulled[ri];
  if (!row) return;
  var a = rekapAssessment();
  var body = '<div class="note note-info mb-16">' + ICON.info + "<div><strong>" + esc(row.nama) + "</strong>" + esc(row.kelas) + " &bull; Dikumpulkan " + fmtDateTime(row.waktu) + "</div></div>";
  if (!a) {
    body += '<div class="note note-warn">' + ICON.alert + "<div>Asesmen ini tidak ditemukan pada riwayat lokal, sehingga pembanding kunci tidak tersedia. Skor dihitung dari data siswa.</div></div>";
    body += '<div class="answer-box"><strong>Skor objektif</strong>' + row.skor + " / " + row.total + "</div>";
    body += '<div class="answer-box"><strong>Jawaban</strong><pre style="white-space:pre-wrap;font-size:11px">' + esc(JSON.stringify(row.answers, null, 1)) + "</pre></div>";
    openModal('<div class="modal-head"><h3>Detail Jawaban</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div><div class=\"modal-body\">" + body + "</div><div class=\"modal-foot\"><button class=\"btn btn-light\" data-action=\"closeModal\">Tutup</button></div>", { wide: true });
    return;
  }
  body += '<div class="table-wrap"><table class="tbl"><thead><tr><th>No</th><th>Soal</th><th>Jawaban Siswa</th><th>Kunci</th><th>Skor</th></tr></thead><tbody>';
  rekapRowQuestions(a, row).forEach(function (q) {
    var ans = row.answers[q.id];
    var ansText = Array.isArray(ans) ? ans.join(", ") : (ans && typeof ans === "object" ? Object.keys(ans).map(function (k) { return ans[k]; }).join("; ") : (ans || "-"));
    var auto = autoScoreQuestion(q, ans);
    var manualVal = rekapScoreFor(ri, q);
    var scoreCell;
    if (auto === null) {
      var val = manualVal == null ? 0 : manualVal;
      scoreCell = '<input type="number" min="0" max="' + (Number(q.weight) || 1) + '" step="0.5" value="' + val + '" data-action="rekapScore" data-ri="' + ri + '" data-qid="' + q.id + '" style="width:70px"> / ' + (Number(q.weight) || 1);
    } else {
      scoreCell = auto ? '<span class="badge badge-green">' + (Number(q.weight) || 1) + "</span>" : '<span class="badge badge-red">0</span>';
    }
    body += "<tr><td>" + q.no + "</td><td>" + esc(bentukLabel(q.type)) + "</td><td>" + esc(ansText) + "</td><td>" + esc(Array.isArray(q.answer) ? q.answer.join(", ") : (q.answer || "-")) + "</td><td>" + scoreCell + "</td></tr>";
  });
  body += "</tbody></table></div>";
  body += '<div class="mt-16" style="text-align:right"><strong id="rekapLive">' + rekapNilaiText(ri) + "</strong></div>";
  openModal(
    '<div class="modal-head"><h3>Detail Jawaban &amp; Penilaian</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Tutup</button><button class="btn btn-primary" data-action="exportPenilaian">' + ICON.download + " Unduh Lembar Penilaian</button></div>",
    { wide: true }
  );
}

function rekapManualScore(ri, qid, val) {
  if (!state.rekap.scores[ri]) state.rekap.scores[ri] = {};
  state.rekap.scores[ri][qid] = Number(val) || 0;
  var live = document.getElementById("rekapLive");
  if (live) live.textContent = rekapNilaiText(ri);
}

function rekapNilaiText(ri) {
  var row = state.rekap.pulled[ri];
  var a = rekapAssessment();
  if (!row || !a) return "";
  var got = 0, total = 0;
  rekapRowQuestions(a, row).forEach(function (q) {
    var w = Number(q.weight) || 1; total += w;
    var s = autoScoreQuestion(q, row.answers[q.id]);
    if (s === true) got += w;
    else if (s === null) { var m = rekapScoreFor(ri, q); got += (m == null ? 0 : m); }
  });
  var nilai = total ? Math.round((got / total) * 1000) / 10 : 0;
  return "Total skor: " + got + " / " + total + " &bull; Nilai: " + nilai;
}

function rekapNilai(ri) {
  var row = state.rekap.pulled[ri];
  var a = rekapAssessment();
  if (!row) return { got: 0, total: 0, nilai: 0 };
  if (!a) return { got: row.skor, total: row.total, nilai: row.total ? Math.round((row.skor / row.total) * 1000) / 10 : 0 };
  var got = 0, total = 0;
  rekapRowQuestions(a, row).forEach(function (q) {
    var w = Number(q.weight) || 1; total += w;
    var s = autoScoreQuestion(q, row.answers[q.id]);
    if (s === true) got += w;
    else if (s === null) { var m = rekapScoreFor(ri, q); got += (m == null ? 0 : m); }
  });
  return { got: got, total: total, nilai: total ? Math.round((got / total) * 1000) / 10 : 0 };
}

function epSave() {
  var el = document.getElementById("epUrl");
  if (!el) return;
  var v = el.value.trim();
  if (!v) {
    toast("warn", "URL masih kosong", "Tempel Web App URL Google Apps Script, atau klik Kosongkan untuk menghapus endpoint.");
    return;
  }
  syncConfig.endpoint = v;
  persist();
  render();
  toast("success", "Endpoint disimpan", "Menguji koneksi ke spreadsheet...");
  pullResults("", function (err, resp) {
    if (err) {
      var m = String(err.message || err).replace(/[.\s]+$/, "");
      var hint = m.indexOf("Waktu habis") >= 0
        ? "Respons pertama Google biasanya lambat. Klik Tarik Hasil sekali lagi."
        : "Periksa: URL harus berakhir /exec, akses deployment = Anyone, dan kode Apps Script sudah di-Deploy (New version).";
      toast("error", "Tersimpan, tapi belum terhubung", m + ". " + hint);
    } else {
      var n = resp && resp.rows ? resp.rows.length : 0;
      toast("success", "Endpoint terhubung", n + " baris data ditemukan di spreadsheet. Tombol Tarik Hasil siap dipakai.");
    }
    render();
  });
}

function epClear() {
  syncConfig.endpoint = "";
  persist();
  render();
  toast("success", "Endpoint dikosongkan", "Siswa akan mengirim kode hasil untuk diimpor manual.");
}

function pullResultsAction() {
  var sel = document.getElementById("rekapAid");
  if (sel) state.rekap.aid = sel.value;
  if (!endpointUrl() && !state.rekap.pulled.length) {
    toast("warn", "Endpoint belum diatur", "Atur Web App URL Google Apps Script dulu, atau gunakan Impor Kode Hasil.");
    return;
  }
  state.rekap.loading = true;
  state.rekap.pulled = [];
  render();
  pullResults(state.rekap.aid, function (err, resp) {
    state.rekap.loading = false;
    if (err) {
      render();
      toast("error", "Gagal menarik hasil", String(err.message || err).slice(0, 140));
      return;
    }
    var list = (resp && resp.rows) || [];
    state.rekap.pulled = list.map(normalizeRow);
    state.rekap.lastPull = new Date().toISOString();
    render();
    toast("success", state.rekap.pulled.length + " hasil ditarik", "Data dari Google Sheet siap direkap.");
  });
}

function exportPenilaian() {
  var rows = state.rekap.pulled;
  if (!rows.length) { toast("warn", "Belum ada data", "Tarik hasil atau impor kode dulu."); return; }
  var a = rekapAssessment();
  var m = a ? a.meta : { judul: rows[0].judul, mapel: "", kelas: "" };
  var html = "<html xmlns:x='urn:schemas-microsoft-com:office:excel'><head><meta charset='utf-8'>" +
    "<style>td,th{border:1px solid #999;padding:4px;font-family:Arial;font-size:11px;vertical-align:top}th{background:#dbeafe}</style></head><body>";
  html += "<table><tr><th colspan='20'>LEMBAR PENILAIAN - " + esc(m.judul) + "</th></tr>";
  html += "<tr><td>Mapel</td><td colspan='19'>" + esc(m.mapel || "") + "</td></tr>";
  html += "<tr><td>Kelas</td><td colspan='19'>" + esc(m.kelas || "") + "</td></tr>";
  html += "<tr><td>Guru</td><td colspan='19'>" + esc(m.namaGuru || "") + "</td></tr></table><br>";
  html += "<table><tr><th>No</th><th>Nama</th><th>Kelas</th>";
  if (a) a.questions.forEach(function (q) { html += "<th>S" + q.no + " (" + q.weight + ")</th>"; });
  html += "<th>Total Skor</th><th>Total Bobot</th><th>Nilai</th></tr>";
  rows.forEach(function (r, i) {
    html += "<tr><td>" + (i + 1) + "</td><td>" + esc(r.nama) + "</td><td>" + esc(r.kelas) + "</td>";
    if (a) {
      var setIds = {};
      rekapRowQuestions(a, r).forEach(function (q) { setIds[q.id] = 1; });
      a.questions.forEach(function (q) {
        if (!setIds[q.id]) { html += "<td>&mdash;</td>"; return; }
        var s = autoScoreQuestion(q, r.answers[q.id]);
        var val;
        if (s === true) val = Number(q.weight) || 1;
        else if (s === false) val = 0;
        else { var mm = rekapScoreFor(i, q); val = mm == null ? "" : mm; }
        html += "<td>" + val + "</td>";
      });
    }
    var fn = rekapNilai(i);
    html += "<td>" + fn.got + "</td><td>" + fn.total + "</td><td>" + fn.nilai + "</td></tr>";
  });
  html += "</table></body></html>";
  var name = "Lembar Penilaian - " + String(m.judul || "asesmen").replace(/[\\/:*?"<>|]+/g, "-").slice(0, 50);
  downloadBlob(new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" }), name + ".xls");
  toast("success", "Lembar penilaian diunduh", "Berkas Excel berhasil dibuat.");
}

