function cogBadge(c) { return '<span class="badge badge-violet">' + esc(c) + "</span>"; }

/* Tujuan pembelajaran tampil sebagai daftar bernomor bila pengguna menulis
   satu tujuan per baris (atau sudah menomori sendiri). */
function listHTML(text) {
  var items = String(text || "").split(/\r?\n/)
    .map(function (s) { return s.replace(/^\s*[-\*\u2022\u2013\u2014]\s*/, "").trim(); })
    .filter(function (s) { return s.length > 0; });
  if (!items.length) return "";
  var numbered = items.some(function (s) { return /^(?:\(?\d+(?:\.\d+)*[.)\]]?\)?|\(?[a-zA-Z][.)\]]\)?)\s+/.test(s); });
  if (!numbered) return '<ul class="tujuan-list">' + items.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>";
  return '<ol class="tujuan-list">' + items.map(function (s) {
    return "<li>" + esc(s.replace(/^(?:\(?\d+(?:\.\d+)*[.)\]]?\)?|\(?[a-zA-Z][.)\]]\)?)\s+/, "")) + "</li>";
  }).join("") + "</ol>";
}
function diffBadge(d) {
  var cls = d === "mudah" ? "badge-green" : d === "sulit" ? "badge-red" : "badge-amber";
  return '<span class="badge ' + cls + '">' + esc(kesulitanLabel(d)) + "</span>";
}

function renderResult() {
  var a = state.current;
  if (!a) return emptyState(ICON.sparkles, "Belum ada hasil", "Buat asesmen terlebih dahulu.", "Buat Asesmen", "nav", "buat");

  var tabs = [
    { v: "soal", l: "Lembar Soal" },
    { v: "kunci", l: "Lembar Kunci Jawaban" },
    { v: "kisi", l: "Kisi-Kisi" },
    { v: "rubrik", l: "Rubrik Penilaian" },
    { v: "cetak", l: "Preview & Cetak" }
  ];
  var h = "";
  h += '<div class="card card-pad mb-16">';
  h += '<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:flex-start">';
  h += '<div><h3 style="font-size:17px">' + esc(a.meta.judul) + '</h3><p style="color:var(--muted);font-size:13px">' +
    esc(a.meta.mapel) + " &bull; " + esc(a.meta.kelas) + " &bull; " + esc(a.meta.jenis) + " &bull; " + a.questions.length + " soal</p></div>";
  h += "<div>" + (a.source === "ai"
    ? '<span class="badge badge-green">' + ICON.sparkles + " Dibuat AI</span>"
    : '<span class="badge badge-amber">' + ICON.info + " Mode Demo</span>") +
    (a.saved ? ' <span class="badge badge-blue">Tersimpan</span>' : "") + "</div>";
  h += "</div>";
  h += '<div class="q-actions" style="margin-top:14px">';
  h += '<button class="btn btn-primary btn-sm" data-action="editMeta" data-id="' + a.id + '">' + ICON.edit + " Edit Identitas</button>";
  h += '<button class="btn btn-primary btn-sm" data-action="editTujuan" data-id="' + a.id + '" title="Ubah tujuan pembelajaran &amp; materi acuan agar asesmen ini sesuai">' + ICON.edit + " Edit Tujuan Pembelajaran</button>";
  h += '<button class="btn btn-success btn-sm" data-action="saveHistory">' + ICON.save + " Simpan ke Riwayat</button>";
  h += '<button class="btn btn-light btn-sm" data-action="saveAllToBank">' + ICON.book + " Simpan Semua ke Bank Soal</button>";
  h += '<button class="btn btn-light btn-sm" data-action="printDoc">' + ICON.printer + " Cetak</button>";
  h += '<button class="btn btn-light btn-sm" data-action="exportPDF">' + ICON.download + " Unduh PDF</button>";
  h += '<button class="btn btn-light btn-sm" data-action="exportWord">' + ICON.download + " Unduh Word</button>";
  h += '<button class="btn btn-light btn-sm" data-action="exportExcel">' + ICON.download + " Unduh Excel</button>";
  h += '<button class="btn btn-light btn-sm" data-action="shareStudent" data-id="' + a.id + '">' + ICON.send + " Bagikan ke Siswa</button>";
  h += '<button class="btn btn-light btn-sm" data-action="copyResult">' + ICON.copy + " Salin Hasil</button>";
  h += '<button class="btn btn-primary btn-sm" data-action="seriesModal" data-id="' + a.id + '" title="Buat asesmen baru dengan identitas &amp; materi yang sama (misal tingkat berikutnya)">' + ICON.sparkles + " Buat Seri Lanjutan</button>";
  h += '<button class="btn btn-ghost btn-sm" data-action="nav" data-page="buat">' + ICON.plus + " Asesmen Baru</button>";
  h += "</div></div>";

  if (a.source === "demo") {
    var _why = (typeof apiConfig !== "undefined" && apiConfig.lastError) ? String(apiConfig.lastError) : "";
    h += '<div class="note note-warn mb-16">' + ICON.alert + "<div><strong>Hasil Mode Demo</strong>Soal ini disusun dari template materi yang Anda masukkan, <b>bukan</b> keluaran AI. " +
      (_why
        ? "<b>AI sudah dicoba tetapi gagal:</b> " + esc(_why) +
          (/RESOURCE_EXHAUSTED|Kuota API Google|kuota harian|check your plan and billing/i.test(_why)
            ? "<br><b>Jangan Generate ulang dulu</b> - selama kuota habis, semua permintaan pasti ditolak (membuang kuota). Tunggu reset harian (± pukul 14.00-15.00 WIB) atau aktifkan <b>Billing</b> di aistudio.google.com, lalu klik Simpan &rarr; Uji Koneksi."
            : "<br><b>Solusi:</b> periksa internet/VPN/adblock, buka <b>Pengaturan API</b> lalu klik Simpan &rarr; Uji Koneksi sampai hijau, dan pastikan kuota Google API Anda mencukupi.") +
          ' <button class="btn btn-light btn-sm" data-action="nav" data-page="api" style="margin-top:8px">Buka Pengaturan API</button>'
        : "Atur API key di Pengaturan API untuk hasil yang lebih kontekstual.") +
      "</div></div>";
  }

  h += '<div class="tabs">';
  tabs.forEach(function (t) {
    h += '<button class="tab' + (state.resultTab === t.v ? " active" : "") + '" data-action="resultTab" data-tab="' + t.v + '">' + esc(t.l) + "</button>";
  });
  h += "</div>";

  if (state.resultTab === "soal") h += renderSoalTab(a);
  else if (state.resultTab === "kunci") h += renderKunciTab(a);
  else if (state.resultTab === "kisi") h += renderKisiTab(a);
  else if (state.resultTab === "rubrik") h += renderRubrikTab(a);
  else h += renderCetakTab(a);
  return h;
}

function isCorrectOption(q, key) {
  var ans = String(q.answer || "").trim();
  if (q.type === "pgk") {
    return ans.split(/[,\s;]+/).some(function (x) { return x.toUpperCase() === key.toUpperCase(); });
  }
  return ans.toUpperCase() === key.toUpperCase();
}

function questionCard(a, q, withActions) {
  var h = '<div class="qcard">';
  h += '<div class="qcard-head"><div class="qnum">' + q.no + "</div>" +
    '<span class="badge badge-blue">' + esc(bentukLabel(q.type)) + "</span>" +
    cogBadge(q.cognitive) + diffBadge(q.difficulty) +
    '<span class="badge badge-slate">Bobot ' + q.weight + "</span></div>";
  h += '<div class="qstem">' + nl2br(q.stem) + "</div>";
  if (q.image) h += '<div class="qimg"><img src="' + q.image + '" alt="Gambar soal ' + q.no + '"></div>';
  if (q.type === "pg" || q.type === "pgk" || q.type === "bs") {
    h += '<ul class="options">';
    q.options.forEach(function (o) {
      h += '<li class="' + (isCorrectOption(q, o.key) ? "correct" : "") + '"><span class="okey">' + esc(o.key) + '.</span><span>' + nl2br(o.text) + "</span></li>";
    });
    h += "</ul>";
  } else if (q.type === "menjodohkan") {
    h += '<div class="table-wrap"><table class="tbl" style="min-width:auto"><thead><tr><th>Istilah</th><th>Penjelasan</th></tr></thead><tbody>';
    q.pairs.forEach(function (p) { h += "<tr><td>" + esc(p.left) + "</td><td>" + esc(p.right) + "</td></tr>"; });
    h += "</tbody></table></div>";
  } else {
    h += '<div class="qmeta" style="border-top:0;margin-top:8px;padding-top:0">Soal ' + esc(bentukLabel(q.type).toLowerCase()) + " &mdash; jawab pada lembar jawaban.</div>";
  }
  if (a.meta.kunci) h += '<div class="answer-box"><strong>Kunci Jawaban</strong>' + nl2br(q.answer || "-") + "</div>";
  if (a.meta.pembahasan && q.explanation) h += '<div class="answer-box explain"><strong>Pembahasan</strong>' + nl2br(q.explanation) + "</div>";
  if (a.meta.rubrik && q.rubric) h += '<div class="answer-box explain"><strong>Pedoman Penskoran</strong>' + nl2br(q.rubric) + "</div>";
  if (withActions) {
    h += '<div class="q-actions">';
    h += '<button class="btn btn-light btn-sm" data-action="editQuestion" data-id="' + q.id + '">' + ICON.edit + " Edit Soal</button>";
    h += '<button class="btn btn-light btn-sm" data-action="regenQuestion" data-id="' + q.id + '">' + ICON.refresh + " Generate Ulang</button>";
    h += '<button class="btn btn-light btn-sm" data-action="saveQuestionToBank" data-id="' + q.id + '">' + ICON.book + " Simpan ke Bank Soal</button>";
    h += '<button class="btn btn-ghost btn-sm" data-action="delQuestion" data-id="' + q.id + '">' + ICON.trash + " Hapus</button>";
    h += "</div>";
  }
  h += "</div>";
  return h;
}

function renderSoalTab(a) {
  var h = "";
  for (var i = 0; i < a.questions.length; i++) h += questionCard(a, a.questions[i], true);
  return h;
}

function renderKunciTab(a) {
  var h = '<div class="card card-pad"><div class="card-head"><div><h3>Lembar Kunci Jawaban</h3><p>' + esc(a.meta.judul) + "</p></div></div>";
  h += '<div class="table-wrap"><table class="tbl"><thead><tr><th style="width:70px">No</th><th style="width:150px">Bentuk</th><th>Kunci</th><th style="width:80px">Bobot</th></tr></thead><tbody>';
  a.questions.forEach(function (q) {
    h += "<tr><td>" + q.no + "</td><td>" + esc(bentukLabel(q.type)) + "</td><td>" + nl2br(q.answer || "-") + "</td><td>" + q.weight + "</td></tr>";
  });
  h += "</tbody></table></div>";
  if (a.meta.rubrik) {
    h += '<div class="mt-16"><h3 style="font-size:14px;margin-bottom:10px">Pedoman Penskoran</h3>';
    a.questions.forEach(function (q) {
      if (q.rubric) h += '<div class="answer-box explain"><strong>Soal ' + q.no + "</strong>" + nl2br(q.rubric) + "</div>";
    });
    h += "</div>";
  }
  h += "</div>";
  return h;
}

function indicatorFor(q, a) {
  var act = (q.type === "uraian" || q.type === "praktik") ? "menerapkan dan menjelaskan" : "menjawab";
  var tp = String(a.meta.tujuan || "").trim();
  var parts = tp ? tp.split(/\n+/) : [];
  var item = parts.length ? parts[(Number(q.no) - 1) % parts.length].trim() : "";
  item = item.replace(/^\s*(?:(?:[-\*\u2022\u2013\u2014]\s*)|(?:\(?\d+(?:\.\d+)*[.)\]]?\s+)|(?:[a-zA-Z][.)]\s+))/, "").replace(/\s+/g, " ");
  if (item.length > 180) item = item.slice(0, 180).replace(/\s+\S*$/, "") + "\u2026";
  var kalimat = item || ("materi " + (a.meta.submateri || a.meta.materiPokok));
  // Bila tujuan sudah berbunyi "Peserta didik dapat ...", kalimat tujuan dipakai apa adanya.
  if (/\bpeserta\s+didik\b/i.test(kalimat) || /^\s*(siswa|murid)\b/i.test(kalimat)) return kalimat + " (level " + q.cognitive + ").";
  return "Peserta didik dapat " + act + " " + kalimat + " (level " + q.cognitive + ").";
}

function renderKisiTab(a) {
  var h = '<div class="card card-pad"><div class="card-head"><div><h3>Kisi-Kisi Asesmen</h3><p>' + esc(a.meta.mapel) + " &bull; " + esc(a.meta.kelas) + " &bull; " + esc(a.meta.jenis) + "</p></div></div>";
  if (String(a.meta.tujuan || "").trim()) h += '<div class="note note-info mb-16">' + ICON.info + "<div><strong>Tujuan Pembelajaran (acuan)</strong>" + listHTML(a.meta.tujuan) + "</div></div>";
  h += '<div class="table-wrap"><table class="tbl"><thead><tr><th>No</th><th>Materi</th><th>Indikator Soal</th><th>Level</th><th>Bentuk</th><th>No. Soal</th></tr></thead><tbody>';
  a.questions.forEach(function (q) {
    h += "<tr><td>" + q.no + "</td>" +
      "<td>" + esc(a.meta.materiPokok) + (a.meta.submateri ? " - " + esc(a.meta.submateri) : "") + "</td>" +
      "<td>" + esc(indicatorFor(q, a)) + "</td>" +
      "<td>" + cogBadge(q.cognitive) + "</td>" +
      "<td>" + esc(bentukLabel(q.type)) + "</td>" +
      "<td>" + q.no + "</td></tr>";
  });
  h += "</tbody></table></div>";
  if (a.meta.cp) h += '<div class="note note-info mt-16">' + ICON.info + "<div><strong>Capaian Pembelajaran / Kompetensi Dasar</strong>" + nl2br(a.meta.cp) + "</div></div>";
  h += "</div>";
  return h;
}

function renderRubrikTab(a) {
  var h = '<div class="card card-pad"><div class="card-head"><div><h3>Rubrik dan Pedoman Penskoran</h3><p>Panduan penilaian setiap soal</p></div></div>';
  var total = 0;
  a.questions.forEach(function (q) { total += Number(q.weight) || 0; });
  h += '<div class="note note-success mb-16">' + ICON.check + "<div><strong>Total Bobot: " + total + "</strong>Nilai akhir = (skor perolehan / " + total + ") &times; 100.</div></div>";
  h += '<div class="table-wrap"><table class="tbl"><thead><tr><th style="width:60px">No</th><th>Bentuk</th><th style="width:80px">Bobot</th><th>Kriteria / Pedoman Penskoran</th></tr></thead><tbody>';
  a.questions.forEach(function (q) {
    var rub = q.rubric || ((q.type === "uraian" || q.type === "praktik")
      ? "Skor 4: lengkap & tepat; 3: tepat kurang lengkap; 2: sebagian benar; 1: minimal; 0: tidak menjawab."
      : "Skor penuh jika jawaban benar, skor 0 jika salah.");
    h += "<tr><td>" + q.no + "</td><td>" + esc(bentukLabel(q.type)) + "</td><td>" + q.weight + "</td><td>" + nl2br(rub) + "</td></tr>";
  });
  h += "</tbody></table></div></div>";
  return h;
}

function renderCetakTab(a) {
  var h = '<div class="note note-info mb-16">' + ICON.printer + "<div><strong>Preview Cetak</strong>Gunakan tombol cetak untuk mencetak dalam format A4, atau unduh sebagai PDF/Word/Excel. Sidebar tidak akan tercetak.</div></div>";
  h += '<div class="card card-pad" style="background:#fff"><div class="doc">' + buildDocInner(a) + "</div></div>";
  return h;
}

/* ---------------- Question actions ---------------- */
function getCurrent() { return state.current; }
function findQuestion(id) {
  var a = getCurrent();
  if (!a) return null;
  for (var i = 0; i < a.questions.length; i++) if (a.questions[i].id === id) return a.questions[i];
  return null;
}

function editQuestionModal(id) {
  var q = findQuestion(id);
  if (!q) return;
  var optionsText = (q.options || []).map(function (o) { return o.text; }).join("\n");
  var pairsText = (q.pairs || []).map(function (p) { return p.left + " | " + p.right; }).join("\n");
  var body = "";
  body += '<div class="field"><label>Teks Soal</label><textarea id="eqStem" style="min-height:90px">' + esc(q.stem) + "</textarea></div>";
  body += '<div class="field mt-16"><label>Gambar Soal <span class="hint">(opsional &mdash; tempel URL gambar, atau kosongkan)</span></label>' +
    (q.image ? '<div class="qimg"><img src="' + q.image + '" alt="Gambar soal"></div><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="eqImageDel"> Hapus gambar ini</label>' : "") +
    '<input type="text" id="eqImage" value="' + esc(q.image && q.image.indexOf("data:") === 0 ? "" : (q.image || "")) + '" placeholder="https://contoh.com/gambar.png"></div>';
  if (q.image && q.image.indexOf("data:") === 0) {
    body += '<div class="note note-warn mt-16">' + ICON.alert + "<div><strong>Gambar ini tersimpan di dalam soal (tempelan)</strong>Ukurannya kurang lebih " +
      Math.round(String(q.image).length * 3 / 4 / 1024).toLocaleString("id-ID") +
      " KB, sehingga tautan kerja jadi sangat panjang dan <b>QR tidak bisa dibuat</b>. Bila ingin berbagi lewat QR atau tautan pendek, unggah gambar itu ke internet lalu tempel <b>URL gambar</b> di kolom di atas (URL akan menggantikan gambar tempelan). Bila tetap memakai gambar tempelan, bagikan lewat <b>Mode Offline</b> (file HTML).</div></div>";
  }
  body += '<div class="form-grid mt-16">';
  body += '<div class="field"><label>Bentuk Soal</label><select id="eqType">' + optSelect(BENTUK, q.type) + "</select></div>";
  body += '<div class="field"><label>Level Kognitif</label><select id="eqCog">' + optSelect(KOGNITIF, q.cognitive) + "</select></div>";
  body += '<div class="field"><label>Tingkat Kesulitan</label><select id="eqDiff">' + optSelect(KESULITAN.slice(0, 3), q.difficulty) + "</select></div>";
  body += '<div class="field"><label>Bobot Nilai</label><input type="number" min="1" id="eqWeight" value="' + q.weight + '"></div>';
  body += "</div>";
  body += '<div class="field mt-16"><label>Pilihan Jawaban <span class="hint">(satu per baris &mdash; huruf A, B, C... otomatis)</span></label><textarea id="eqOptions" placeholder="Opsi A\nOpsi B\nOpsi C\nOpsi D">' + esc(optionsText) + "</textarea></div>";
  body += '<div class="field mt-16"><label>Kunci Jawaban</label><input type="text" id="eqAnswer" value="' + esc(q.answer) + '" placeholder="Contoh: A atau A, C untuk kompleks"></div>';
  body += '<div class="field mt-16"><label>Pasangan Menjodohkan <span class="hint">(format: kiri | kanan per baris)</span></label><textarea id="eqPairs" placeholder="Istilah 1 | Penjelasan 1">' + esc(pairsText) + "</textarea></div>";
  body += '<div class="field mt-16"><label>Pembahasan</label><textarea id="eqExplain">' + esc(q.explanation) + "</textarea></div>";
  body += '<div class="field mt-16"><label>Pedoman Penskoran</label><textarea id="eqRubric">' + esc(q.rubric) + "</textarea></div>";

  openModal(
    '<div class="modal-head"><h3>Edit Soal ' + q.no + "</h3><button class=\"close-x\" data-action=\"closeModal\">" + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="saveQuestionEdit" data-id="' + q.id + '">' + ICON.save + " Simpan Perubahan</button></div>",
    { wide: true }
  );
}

function saveQuestionEdit(id) {
  var q = findQuestion(id);
  if (!q) return;
  q.stem = document.getElementById("eqStem").value;
  q.type = document.getElementById("eqType").value;
  q.cognitive = document.getElementById("eqCog").value;
  q.difficulty = document.getElementById("eqDiff").value;
  q.weight = Math.max(1, parseInt(document.getElementById("eqWeight").value, 10) || 1);
  q.answer = document.getElementById("eqAnswer").value;
  q.explanation = document.getElementById("eqExplain").value;
  q.rubric = document.getElementById("eqRubric").value;
  var imgEl = document.getElementById("eqImage");
  var imgDel = document.getElementById("eqImageDel");
  var imgUrl = imgEl ? imgEl.value.trim() : "";
  if (imgUrl) q.image = imgUrl;
  else if (imgDel && imgDel.checked) q.image = "";
  else if (!q.image) q.image = "";
  var optLines = document.getElementById("eqOptions").value.split("\n").map(function (s) { return s.trim(); }).filter(function (s) { return s; });
  q.options = optLines.map(function (t, i) { return { key: String.fromCharCode(65 + i), text: t }; });
  var pairLines = document.getElementById("eqPairs").value.split("\n").map(function (s) { return s.trim(); }).filter(function (s) { return s; });
  q.pairs = pairLines.map(function (line) {
    var parts = line.split("|");
    return { left: (parts[0] || "").trim(), right: (parts[1] || "").trim() };
  });
  closeModal();
  render();
  toast("success", "Soal diperbarui", "Perubahan berhasil disimpan.");
}

function regenQuestion(id) {
  var a = getCurrent();
  var q = findQuestion(id);
  if (!a || !q) return;
  var total = a.questions.length;
  var idx = a.questions.indexOf(q);
  var keepImg = q.image || "";
  if (apiReady()) {
    loadingView("Membuat ulang soal " + q.no + "...");
    // Catatan: gambar soal lama dipertahankan (lihat keepImg di bawah) dan tidak
    // dipetakan ulang ke soal baru, jadi a.meta tidak perlu memuat daftar gambar.
    apiGenerate(a.meta, total).then(function (list) {
      if (list[idx]) { a.questions[idx] = withNumber(list[idx], q.no); a.questions[idx].image = keepImg; }
      state.page = "result";
      render();
      toast("success", "Soal dibuat ulang", "Soal nomor " + q.no + " diperbarui.");
    }).catch(function () {
      regenDemo(a, idx, q);
    });
  } else {
    regenDemo(a, idx, q);
  }
}
function regenDemo(a, idx, q) {
  var keepImg = q.image || "";
  var single = demoGenerate(a.meta, a.questions.length);
  if (single[idx]) { a.questions[idx] = withNumber(single[idx], q.no); a.questions[idx].image = keepImg; }
  render();
  toast("success", "Soal dibuat ulang", "Soal nomor " + q.no + " diperbarui (mode demo).");
}
function withNumber(q, no) { q.no = no; return q; }

function deleteQuestion(id) {
  var a = getCurrent();
  if (!a) return;
  confirmModal("Hapus Soal", "Yakin ingin menghapus soal ini? Tindakan tidak dapat dibatalkan.", "Hapus", function () {
    a.questions = a.questions.filter(function (q) { return q.id !== id; });
    a.questions.forEach(function (q, i) { q.no = i + 1; });
    render();
    toast("success", "Soal dihapus", "Soal berhasil dihapus.");
  });
}

function questionToBank(a, q) {
  return {
    id: uid(),
    stem: q.stem, type: q.type, cognitive: q.cognitive, difficulty: q.difficulty,
    weight: q.weight, options: q.options, answer: q.answer, explanation: q.explanation,
    pairs: q.pairs, rubric: q.rubric, image: q.image || "",
    mapel: a.meta.mapel, kelas: a.meta.kelas, materi: a.meta.materiPokok || a.meta.submateri || "",
    createdAt: new Date().toISOString()
  };
}

function saveOneToBank(id) {
  var a = getCurrent();
  var q = findQuestion(id);
  if (!a || !q) return;
  bank.push(questionToBank(a, q));
  persist();
  toast("success", "Soal tersimpan", "Soal ditambahkan ke Bank Soal.");
}

function saveAllToBank() {
  var a = getCurrent();
  if (!a) return;
  for (var i = 0; i < a.questions.length; i++) bank.push(questionToBank(a, a.questions[i]));
  persist();
  toast("success", "Tersimpan ke Bank Soal", a.questions.length + " soal ditambahkan ke Bank Soal.");
}

function saveHistory() {
  var a = getCurrent();
  if (!a) return;
  if (a.saved) { toast("info", "Sudah tersimpan", "Asesmen ini sudah ada di riwayat."); return; }
  a.saved = true;
  a.savedAt = new Date().toISOString();
  assessments.push(a);
  persist();
  render();
  toast("success", "Disimpan ke riwayat", "Asesmen \"" + a.meta.judul + "\" berhasil disimpan.");
}

/* ---------------- Document builder ---------------- */
var DOC_CSS =
  "body{font-family:'Segoe UI',Arial,sans-serif;color:#111;margin:0}" +
  ".doc{font-size:11.5pt;line-height:1.55;color:#111}" +
  ".doc h1{font-size:15pt;text-align:center;margin:0 0 2px}" +
  ".doc .sub{text-align:center;font-size:10pt;color:#333;margin:0}" +
  ".doc .kop{display:flex;align-items:center;gap:16px;margin:0 0 2px}" +
  ".doc .kop-logo{width:76px;height:76px;object-fit:contain;flex:none}" +
  ".doc .kop-txt{flex:1;text-align:center;line-height:1.28}" +
  ".doc .kop-dinas{font-size:11pt;font-weight:600;text-transform:uppercase}" +
  ".doc .kop-sekolah{font-size:15pt;font-weight:800;text-transform:uppercase;letter-spacing:.3px}" +
  ".doc .kop-alamat{font-size:9pt;color:#222}" +
  ".doc .kop-line{border:0;border-top:3px solid #111;border-bottom:1px solid #111;height:2px;margin:6px 0 12px}" +
  ".doc hr{border:0;border-top:2px solid #111;margin:10px 0 12px}" +
  ".doc .idbox{display:flex;flex-wrap:wrap;gap:3px 28px;font-size:10.5pt;margin:0 0 12px}" +
  ".doc .tujuan{font-size:10.5pt;margin:0 0 10px;padding:7px 10px;border:1px solid #999;background:#f6f8fb}" +
  ".doc .tujuan ul,.doc .tujuan ol{margin:4px 0 0;padding-left:20px}" +
  ".doc h2{font-size:12.5pt;margin:16px 0 8px;border-bottom:1px solid #999;padding-bottom:3px}" +
  ".doc .q{margin:0 0 12px;page-break-inside:avoid}" +
  ".doc .q .s{white-space:pre-wrap}" +
".doc .docimg{margin:6px 0 8px}" +
".doc .docimg img{max-width:420px;max-height:320px;border:1px solid #999}" +
  ".doc .opt{margin:2px 0 2px 20px}" +
  ".doc .meta{font-size:9pt;color:#555;margin-top:2px}" +
  ".doc .ans{font-size:10.5pt;margin:4px 0}" +
  ".doc table{width:100%;border-collapse:collapse;font-size:10pt;margin:6px 0}" +
  ".doc th,.doc td{border:1px solid #888;padding:5px 7px;text-align:left;vertical-align:top}" +
  ".doc th{background:#eef2f7}" +
  ".doc .break{page-break-before:always}" +
  "@media print{@page{size:A4;margin:14mm}body{margin:0}.doc .break{page-break-before:always}}";

function buildDocInner(a) {
  var m = a.meta;
  var h = '<div class="doc">';
  if (m.kopAktif !== false) {
    h += '<div class="kop">';
    if (m.sekolahLogo) h += '<img class="kop-logo" src="' + m.sekolahLogo + '" alt="Logo">';
    h += '<div class="kop-txt">';
    if (m.kopDinas) h += '<div class="kop-dinas">' + esc(m.kopDinas) + "</div>";
    h += '<div class="kop-sekolah">' + esc(m.sekolah || "Asesmen") + "</div>";
    if (m.sekolahAlamat) h += '<div class="kop-alamat">' + esc(m.sekolahAlamat) + "</div>";
    if (m.sekolahKontak) h += '<div class="kop-alamat">' + esc(m.sekolahKontak) + "</div>";
    h += "</div>";
    if (m.sekolahLogo2) h += '<img class="kop-logo" src="' + m.sekolahLogo2 + '" alt="Logo">';
    h += "</div>";
    h += '<div class="kop-line"></div>';
  } else {
    h += "<h1>" + esc(m.sekolah || "Asesmen") + "</h1>";
  }
  h += '<p class="sub">' + esc(m.jenis) + " &mdash; " + esc(m.mapel) + "</p>";
  h += '<p class="sub">Tahun Ajaran ' + esc(m.tahun || "-") + " &bull; Semester " + esc(m.semester || "-") + "</p>";
  h += "<hr>";
  h += '<h2 style="text-align:center;border:0">' + esc(m.judul) + "</h2>";
  if (String(m.tujuan || "").trim()) {
    h += '<div class="tujuan">';
    h += "<b>Tujuan Pembelajaran:</b>" + listHTML(m.tujuan);
    h += "</div>";
  }
  h += '<div class="idbox"><span><b>Mata Pelajaran:</b> ' + esc(m.mapel) + "</span>" +
    "<span><b>Kelas/Fase:</b> " + esc(m.kelas) + "</span>" +
    "<span><b>Guru:</b> " + esc(m.namaGuru) + "</span>" +
    "<span><b>Alokasi Waktu:</b> " + esc(m.alokasi || "-") + "</span>" +
    "<span><b>Tanggal:</b> " + esc(m.tanggal || "-") + "</span></div>";

  h += "<h2>A. Lembar Soal</h2>";
  h += '<p style="font-size:10pt;margin:0 0 8px">Petunjuk: kerjakan seluruh soal dengan teliti dan tuliskan jawaban pada lembar yang tersedia.</p>';
  a.questions.forEach(function (q) {
    h += '<div class="q">';
    h += "<div><b>" + q.no + ".</b> <span class=\"s\">" + nl2br(q.stem) + "</span></div>";
    if (q.image) h += '<div class="docimg"><img src="' + q.image + '" alt="Gambar soal ' + q.no + '"></div>';
    if (q.type === "pg" || q.type === "pgk" || q.type === "bs") {
      q.options.forEach(function (o) { h += '<div class="opt">' + esc(o.key) + ". " + nl2br(o.text) + "</div>"; });
    } else if (q.type === "menjodohkan") {
      h += '<table><tr><th>Istilah</th><th>Penjelasan</th></tr>';
      q.pairs.forEach(function (p) { h += "<tr><td>" + esc(p.left) + "</td><td>" + esc(p.right) + "</td></tr>"; });
      h += "</table>";
    }
    h += '<div class="meta">Bentuk: ' + esc(bentukLabel(q.type)) + " | Level: " + esc(q.cognitive) + " | Kesulitan: " + esc(kesulitanLabel(q.difficulty)) + " | Bobot: " + q.weight + "</div>";
    h += "</div>";
  });

  if (m.kunci) {
    h += '<div class="break"></div><h2>B. Lembar Kunci Jawaban</h2>';
    h += "<table><tr><th>No</th><th>Bentuk</th><th>Kunci Jawaban</th><th>Bobot</th></tr>";
    a.questions.forEach(function (q) {
      h += "<tr><td>" + q.no + "</td><td>" + esc(bentukLabel(q.type)) + "</td><td>" + nl2br(q.answer || "-") + "</td><td>" + q.weight + "</td></tr>";
    });
    h += "</table>";
    if (m.pembahasan) {
      h += "<h2>Pembahasan</h2>";
      a.questions.forEach(function (q) {
        if (q.explanation) h += '<div class="ans"><b>' + q.no + ".</b> " + nl2br(q.explanation) + "</div>";
      });
    }
  }

  if (m.kisiKisi) {
    h += '<div class="break"></div><h2>C. Kisi-Kisi Asesmen</h2>';
    if (String(m.tujuan || "").trim()) {
      h += '<div class="tujuan"><b>Tujuan Pembelajaran (acuan):</b>' + listHTML(m.tujuan) + "</div>";
    }
    h += "<table><tr><th>No</th><th>Materi</th><th>Indikator Soal</th><th>Level</th><th>Bentuk</th><th>No. Soal</th></tr>";
    a.questions.forEach(function (q) {
      h += "<tr><td>" + q.no + "</td><td>" + esc(m.materiPokok) + "</td><td>" + esc(indicatorFor(q, a)) + "</td><td>" + esc(q.cognitive) + "</td><td>" + esc(bentukLabel(q.type)) + "</td><td>" + q.no + "</td></tr>";
    });
    h += "</table>";
  }

  if (m.rubrik) {
    h += '<div class="break"></div><h2>D. Rubrik dan Pedoman Penskoran</h2>';
    var total = 0;
    a.questions.forEach(function (q) { total += Number(q.weight) || 0; });
    h += '<p style="font-size:10pt">Total bobot: ' + total + ". Nilai akhir = (skor perolehan / " + total + ") x 100.</p>";
    h += "<table><tr><th>No</th><th>Bentuk</th><th>Bobot</th><th>Kriteria</th></tr>";
    a.questions.forEach(function (q) {
      var rub = q.rubric || "Jawaban benar mendapat skor penuh, salah mendapat skor 0.";
      h += "<tr><td>" + q.no + "</td><td>" + esc(bentukLabel(q.type)) + "</td><td>" + q.weight + "</td><td>" + nl2br(rub) + "</td></tr>";
    });
    h += "</table>";
  }

  h += '<p style="margin-top:20px;font-size:9pt;color:#666;text-align:center">Dibuat dengan ADIK - Asesmen Digital Interaktif Kuliner</p>';
  h += "</div>";
  return h;
}

function safeName(a) {
  return String(a.meta.judul || "asesmen").replace(/[\\/:*?"<>|]+/g, "-").slice(0, 60);
}
function downloadBlob(blob, filename) {
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}

function dataUrlParts(u) {
  var m = /^data:([^;,]*)(;base64)?,([\s\S]*)$/.exec(String(u || ""));
  if (!m) return null;
  var mime = m[1] || "image/png";
  try {
    var bin = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
    return { mime: mime, bin: bin };
  } catch (e) { return null; }
}
function b64wrap(s) { return String(s).replace(/(.{76})/g, "$1\r\n"); }
function strToB64(s) { return btoa(unescape(encodeURIComponent(s))); }

function exportWord(a) {
  a = a || getCurrent();
  var docInner = buildDocInner(a);
  var title = esc(a.meta.judul);
  var hasImg = (a.questions || []).some(function (q) { return q.image; });
  var head = "<meta charset='utf-8'><title>" + title + "</title><style>" + DOC_CSS + "</style>";
  if (!hasImg) {
    var html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head>" + head + "</head><body>" + docInner + "</body></html>";
    downloadBlob(new Blob(["\ufeff", html], { type: "application/msword" }), safeName(a) + ".doc");
    toast("success", "Word diunduh", "Berkas .doc berhasil dibuat.");
    return;
  }
  var origin = "file:///C:/adik/";
  var map = {};
  var counter = 0;
  var docHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head>" + head + "</head><body>" + docInner + "</body></html>";
  docHtml = docHtml.replace(/src="data:[^"]+"/g, function (m) {
    var du = m.slice(5, -1);
    if (!map[du]) {
      var p = dataUrlParts(du);
      var ext = (p && p.mime.split("/")[1]) || "png";
      map[du] = { loc: "image" + (++counter) + "." + ext, part: p };
    }
    return 'src="' + origin + map[du].loc + '"';
  });
  var boundary = "----=_NextPart_ADIK";
  var parts = [];
  parts.push("Content-Location: " + origin + "doc.htm\r\n" +
    "Content-Type: text/html; charset=\"utf-8\"\r\n" +
    "Content-Transfer-Encoding: base64\r\n\r\n" + b64wrap(strToB64(docHtml)) + "\r\n");
  Object.keys(map).forEach(function (du) {
    var p = map[du].part;
    if (!p) return;
    parts.push("Content-Location: " + origin + map[du].loc + "\r\n" +
      "Content-Type: " + p.mime + "\r\n" +
      "Content-Transfer-Encoding: base64\r\n\r\n" + b64wrap(btoa(p.bin)) + "\r\n");
  });
  var mht = "MIME-Version: 1.0\r\n" +
    "Content-Type: multipart/related; boundary=\"" + boundary + "\"; type=\"text/html\"\r\n\r\n" +
    "--" + boundary + "\r\n" + parts.join("--" + boundary + "\r\n") + "--" + boundary + "--\r\n";
  downloadBlob(new Blob([mht], { type: "application/msword" }), safeName(a) + ".doc");
  toast("success", "Word diunduh", "Berkas .doc dibuat beserta gambar.");
}

function exportExcel(a) {
  a = a || getCurrent();
  var m = a.meta;
  var html = "<html xmlns:x='urn:schemas-microsoft-com:office:excel'><head><meta charset='utf-8'>" +
    "<style>td,th{border:1px solid #999;padding:4px;font-family:Arial;font-size:11px;vertical-align:top}th{background:#dbeafe}</style></head><body>";
  html += "<table><tr><th colspan='10'>" + esc(m.judul) + "</th></tr>";
  html += "<tr><td>Mapel</td><td colspan='9'>" + esc(m.mapel) + "</td></tr>";
  html += "<tr><td>Kelas</td><td colspan='9'>" + esc(m.kelas) + "</td></tr>";
  html += "<tr><td>Jenis</td><td colspan='9'>" + esc(m.jenis) + "</td></tr>";
  if (String(m.tujuan || "").trim()) html += "<tr><td>Tujuan</td><td colspan='9'>" + esc(String(m.tujuan).replace(/\s*\n+\s*/g, " | ")) + "</td></tr>";
  html += "</table><br>";
  html += "<table><tr><th>No</th><th>Bentuk</th><th>Level</th><th>Kesulitan</th><th>Bobot</th><th>Soal</th><th>Pilihan</th><th>Kunci</th><th>Pembahasan</th><th>Materi</th><th>Indikator / Tujuan</th></tr>";
  a.questions.forEach(function (q) {
    var opsi = (q.options || []).map(function (o) { return o.key + ". " + o.text; }).join(" | ");
    html += "<tr><td>" + q.no + "</td><td>" + esc(bentukLabel(q.type)) + "</td><td>" + esc(q.cognitive) + "</td><td>" + esc(kesulitanLabel(q.difficulty)) + "</td><td>" + q.weight + "</td><td>" + esc(q.stem) + "</td><td>" + esc(opsi) + "</td><td>" + esc(q.answer || "") + "</td><td>" + esc(q.explanation || "") + "</td><td>" + esc(m.materiPokok) + "</td><td>" + esc(indicatorFor(q, a)) + "</td></tr>";
  });
  html += "</table></body></html>";
  downloadBlob(new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" }), safeName(a) + ".xls");
  toast("success", "Excel diunduh", "Berkas .xls berhasil dibuat.");
}

function exportPDF(a) {
  a = a || getCurrent();
  if (!window.html2canvas || !window.jspdf) {
    toast("warn", "Pustaka PDF belum siap", 'Gunakan tombol Cetak lalu pilih "Simpan sebagai PDF".');
    return;
  }
  toast("info", "Menyiapkan PDF", "Mohon tunggu sebentar...");
  var holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fff;padding:32px;box-sizing:border-box";
  holder.innerHTML = "<style>" + DOC_CSS + "</style>" + buildDocInner(a);
  document.body.appendChild(holder);
  window.html2canvas(holder, { scale: 2, backgroundColor: "#ffffff", useCORS: true }).then(function (canvas) {
    var jsPDF = window.jspdf.jsPDF;
    var pdf = new jsPDF("p", "mm", "a4");
    var pw = pdf.internal.pageSize.getWidth();
    var ph = pdf.internal.pageSize.getHeight();
    var imgW = pw;
    var imgH = canvas.height * imgW / canvas.width;
    var img = canvas.toDataURL("image/jpeg", 0.9);
    var heightLeft = imgH;
    var position = 0;
    pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
    heightLeft -= ph;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
      heightLeft -= ph;
    }
    pdf.save(safeName(a) + ".pdf");
    holder.remove();
    toast("success", "PDF diunduh", "Berkas PDF berhasil dibuat.");
  }).catch(function (err) {
    holder.remove();
    toast("error", "Gagal membuat PDF", String(err && err.message ? err.message : err).slice(0, 140));
  });
}

function printDoc(a) {
  a = a || getCurrent();
  var frame = DOM.printFrame;
  var doc = frame.contentWindow.document;
  doc.open();
  doc.write("<!DOCTYPE html><html><head><meta charset='utf-8'><title>" + esc(a.meta.judul) + "</title><style>" + DOC_CSS + "</style></head><body>" + buildDocInner(a) + "</body></html>");
  doc.close();
  setTimeout(function () {
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }, 450);
}

function copyResult() {
  var a = getCurrent();
  if (!a) return;
  var lines = [];
  lines.push(a.meta.judul);
  lines.push(a.meta.mapel + " | " + a.meta.kelas + " | " + a.meta.jenis);
  lines.push("Guru: " + a.meta.namaGuru + " - " + a.meta.sekolah);
  lines.push("");
  a.questions.forEach(function (q) {
    lines.push(q.no + ". " + q.stem);
    if (q.options && q.options.length) q.options.forEach(function (o) { lines.push("   " + o.key + ". " + o.text); });
    if (q.pairs && q.pairs.length) q.pairs.forEach(function (p) { lines.push("   " + p.left + " -> " + p.right); });
    if (a.meta.kunci) lines.push("   Kunci: " + (q.answer || "-"));
    if (a.meta.pembahasan && q.explanation) lines.push("   Pembahasan: " + q.explanation);
    lines.push("");
  });
  var text = lines.join("\n");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      toast("success", "Disalin", "Hasil asesmen disalin ke clipboard.");
    }).catch(function () { fallbackCopy(text); });
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); toast("success", "Disalin", "Hasil asesmen disalin ke clipboard."); }
  catch (e) { toast("error", "Gagal menyalin", "Browser tidak mengizinkan akses clipboard."); }
  document.body.removeChild(ta);
}
