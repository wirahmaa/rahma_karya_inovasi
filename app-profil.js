/* =====================================================================
   PROFIL MURID - Pemetaan kebutuhan belajar (Pembelajaran Berdiferensiasi)
   Tiga aspek profil: Kesiapan belajar, Minat, Profil belajar (gaya, cara kerja).
   Tiga aspek diferensiasi: Konten, Proses, Produk.
   ===================================================================== */
var LS_PROFIL = "adik_profil_v1";
var profil = load(LS_PROFIL, []);
function profilPersist() { persistSave(LS_PROFIL, profil); }

state.filter.profil = { q: "", kelas: "", kesiapan: "", gs: "4" };
state.profilTab = "daftar";
state.profilGroups = null;
state.pfAngketId = null;

var PF_KESIAPAN = [
  { v: "dasar", l: "Perlu Penguatan (Dasar)" },
  { v: "cakap", l: "Sedang (Berkembang)" },
  { v: "mahir", l: "Mahir (Siap Pengayaan)" }
];
var PF_GAYA = [
  { v: "visual", l: "Visual" },
  { v: "auditori", l: "Auditori" },
  { v: "kinestetik", l: "Kinestetik" },
  { v: "campuran", l: "Campuran" }
];
var PF_MINAT = [
  "Masakan Nusantara", "Masakan Internasional", "Pastry & Bakery", "Minuman & Barista",
  "Tata Hidang & Layanan", "Plating & Dekorasi", "Kewirausahaan Kuliner", "Konten & Fotografi Makanan"
];
var PF_KERJA = [
  { v: "individu", l: "Mandiri / individu" },
  { v: "berpasangan", l: "Berpasangan" },
  { v: "kelompok", l: "Kelompok" }
];
var PF_RITME = [
  { v: "bertahap", l: "Bertahap (perlu waktu lebih)" },
  { v: "sedang", l: "Sedang" },
  { v: "cepat", l: "Cepat" }
];
var PF_PRODUK = [
  { v: "tulis", l: "Tulisan / laporan" },
  { v: "lisan", l: "Lisan / presentasi" },
  { v: "visual", l: "Visual (poster, video, infografis)" },
  { v: "praktik", l: "Praktik / unjuk kerja" }
];
var PF_DUKUNGAN = [
  { v: "fokus", l: "Perlu bantuan menjaga fokus" },
  { v: "percaya", l: "Perlu penguatan percaya diri" },
  { v: "baca", l: "Perlu bantuan memahami teks panjang" },
  { v: "alat", l: "Perlu bimbingan keselamatan & alat dapur" },
  { v: "cepat", l: "Cepat selesai, perlu tugas tantangan" },
  { v: "absen", l: "Perlu pemantauan kehadiran" }
];

var PF_ANGKET = [
  { q: "Saat belajar resep baru, saya paling mudah paham jika...", v: "melihat gambar atau video langkah-langkahnya", a: "mendengar penjelasan dari guru", k: "langsung mencoba memasaknya" },
  { q: "Untuk mengingat bahan dan takaran, saya...", v: "membayangkan tulisan atau gambar resepnya", a: "menyebutnya berulang-ulang", k: "mengingat dari gerakan saat membuatnya" },
  { q: "Ketika guru mendemonstrasikan teknik memotong, saya...", v: "memperhatikan gerakan tangan guru dengan saksama", a: "menyimak penjelasan lisan guru", k: "ingin segera memegang alat dan mencoba" },
  { q: "Saat menunggu giliran praktik, saya biasanya...", v: "mencatat atau menggambar alur kerja", a: "berdiskusi dengan teman", k: "gelisah dan ingin bergerak" },
  { q: "Cara belajar saya menjelang ujian...", v: "membuat mind map atau memberi warna pada catatan", a: "membaca keras atau berdiskusi", k: "mempraktikkan atau membuat model" },
  { q: "Jika harus menjelaskan resep kepada teman, saya...", v: "menunjukkan gambar atau menggambarnya", a: "menjelaskan dengan kata-kata", k: "memperagakan langsung" },
  { q: "Tugas yang paling saya sukai adalah...", v: "membuat poster, infografis, atau video", a: "presentasi, wawancara, atau podcast", k: "proyek praktik dengan produk nyata" },
  { q: "Menghadapi instruksi yang rumit, saya...", v: "mencari diagram atau tabel", a: "meminta dijelaskan secara lisan", k: "langsung mencoba dan belajar dari kesalahan" },
  { q: "Suasana yang membuat saya fokus adalah...", v: "ruang rapi dengan tampilan visual yang jelas", a: "suasana tenang agar dapat mendengar penjelasan", k: "bebas bergerak dan tidak duduk terlalu lama" },
  { q: "Saya mudah mengingat sesuatu karena...", v: "melihatnya", a: "mendengarnya", k: "melakukannya sendiri" },
  { q: "Media belajar yang saya pilih...", v: "video tutorial", a: "penjelasan lisan dan diskusi", k: "praktik langsung di dapur" },
  { q: "Belajar menata hidangan (plating), saya paling terbantu oleh...", v: "melihat contoh foto hidangan", a: "mendengar arahan dari chef atau guru", k: "mencoba menata berulang kali" }
];

/* ---------------- Helpers ---------------- */
function pfFind(id) {
  for (var i = 0; i < profil.length; i++) if (profil[i].id === id) return profil[i];
  return null;
}
function pfVal(id) { var e = document.getElementById(id); return e ? String(e.value || "").trim() : ""; }
function pfChecked(cls) {
  var els = document.querySelectorAll("input." + cls + ":checked");
  return Array.prototype.map.call(els, function (e) { return e.value; });
}
function pfNorm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
function pfLabel(list, v) {
  for (var i = 0; i < list.length; i++) if (list[i].v === v) return list[i].l;
  return v || "-";
}
function pfKesiapanBadge(v) {
  if (!v) return '<span class="badge badge-slate">Belum diases</span>';
  var cls = v === "dasar" ? "badge-amber" : v === "mahir" ? "badge-green" : "badge-blue";
  return '<span class="badge ' + cls + '">' + esc(pfLabel(PF_KESIAPAN, v)) + "</span>";
}
function pfGayaBadge(v) {
  if (!v) return '<span class="badge badge-slate">Belum diketahui</span>';
  return '<span class="badge badge-violet">' + esc(pfLabel(PF_GAYA, v)) + "</span>";
}
function pfCompleteness(s) {
  var n = 0;
  if (s.kesiapan) n++;
  if (s.gaya) n++;
  if (s.minat && s.minat.length) n++;
  if (s.kerja) n++;
  if (s.ritme) n++;
  if (s.produk) n++;
  return Math.round(n / 6 * 100);
}
function pfFiltered() {
  var f = state.filter.profil;
  var q = String(f.q || "").toLowerCase();
  return profil.filter(function (s) {
    var match = !q || (s.nama + " " + (s.minat || []).join(" ")).toLowerCase().indexOf(q) >= 0;
    return match && (!f.kelas || s.kelas === f.kelas) && (!f.kesiapan || (f.kesiapan === "-" ? !s.kesiapan : s.kesiapan === f.kesiapan));
  }).sort(function (a, b) {
    return (a.kelas + String(a.absen || "").padStart(3, "0") + a.nama).localeCompare(b.kelas + String(b.absen || "").padStart(3, "0") + b.nama);
  });
}
function pfCountBy(list, fn) {
  var out = {};
  list.forEach(function (s) {
    var r = fn(s);
    if (!r) return;
    (Array.isArray(r) ? r : [r]).forEach(function (k) { out[k] = (out[k] || 0) + 1; });
  });
  return out;
}
function pfUnique(arr) {
  var seen = {}, out = [];
  arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
  return out;
}

/* ---------------- Rekomendasi diferensiasi (berbasis aturan) ---------------- */
function pfRekomendasi(s) {
  var k = [], p = [], o = [];
  if (s.kesiapan === "dasar") {
    k.push("Sajikan materi dalam potongan kecil dengan lembar langkah kerja bertahap dan istilah kuliner disertai gambar.");
    p.push("Beri scaffolding: contoh lebih dulu, pendampingan guru atau tutor sebaya, dan checklist langkah kerja.");
    o.push("Tugas terstruktur dengan target kompetensi inti dan kriteria keberhasilan yang jelas.");
  } else if (s.kesiapan === "cakap") {
    k.push("Gunakan materi inti sesuai tujuan pembelajaran dengan contoh yang bervariasi.");
    p.push("Kerja mandiri atau berpasangan dengan bimbingan seperlunya dan refleksi singkat.");
    o.push("Tugas sesuai tujuan pembelajaran dengan pilihan cara menunjukkan pemahaman.");
  } else if (s.kesiapan === "mahir") {
    k.push("Perluas materi dengan studi kasus tingkat lanjut (variasi menu, costing, standar industri).");
    p.push("Beri tantangan terbuka dan peran sebagai tutor sebaya atau ketua tim praktik.");
    o.push("Proyek kreatif atau inovasi produk dengan kriteria mutu yang lebih tinggi.");
  }
  if (s.gaya === "visual") {
    k.push("Gunakan video demo, infografis, flowchart resep, dan foto hasil akhir sebagai model.");
    p.push("Minta murid membuat mind map atau alur kerja berwarna sebelum praktik.");
    o.push("Pilihan produk: poster, infografis, atau video singkat.");
  } else if (s.gaya === "auditori") {
    k.push("Berikan penjelasan lisan, diskusi, dan rekaman audio penjelasan singkat.");
    p.push("Beri ruang berdiskusi dan menjelaskan ulang (think-pair-share).");
    o.push("Pilihan produk: presentasi lisan, wawancara, atau podcast resep.");
  } else if (s.gaya === "kinestetik") {
    k.push("Sediakan demonstrasi langsung dan stasiun praktik.");
    p.push("Prioritaskan belajar sambil praktik, simulasi, dan rotasi stasiun.");
    o.push("Pilihan produk: unjuk kerja langsung dan produk nyata.");
  } else if (s.gaya === "campuran") {
    k.push("Padukan media visual, penjelasan lisan, dan demonstrasi.");
    p.push("Sediakan pilihan jalur belajar: menonton, mendengar, atau mencoba.");
    o.push("Beri kebebasan memilih bentuk produk.");
  }
  if (s.minat && s.minat.length) {
    k.push("Kaitkan konteks dan studi kasus dengan minat murid: " + s.minat.slice(0, 3).join(", ") + ".");
  }
  if (s.kerja === "individu") p.push("Beri tugas mandiri dengan target waktu jelas; sesekali libatkan dalam kelompok kecil.");
  else if (s.kerja === "berpasangan") p.push("Gunakan kerja berpasangan (pair work) dengan pembagian tugas yang adil.");
  else if (s.kerja === "kelompok") p.push("Tempatkan dalam kelompok dengan peran jelas (mis. chef, sous chef, plating, kontrol mutu).");
  if (s.ritme === "bertahap") p.push("Beri tambahan waktu dan tenggat antara untuk tugas yang panjang.");
  if (s.ritme === "cepat") o.push("Siapkan tugas pengayaan (variasi resep, perhitungan biaya, inovasi menu).");
  if (s.produk === "tulis") o.push("Tawarkan laporan tertulis atau jurnal praktik sebagai bukti belajar.");
  if (s.produk === "lisan") o.push("Tawarkan presentasi atau tanya jawab lisan sebagai bukti belajar.");
  if (s.produk === "visual") o.push("Tawarkan karya visual (foto proses, poster, video) sebagai bukti belajar.");
  if (s.produk === "praktik") o.push("Tawarkan unjuk kerja praktik dengan rubrik sebagai bukti belajar.");
  var dk = s.dukungan || [];
  if (dk.indexOf("fokus") >= 0) p.push("Beri instruksi singkat satu per satu dan target kecil untuk menjaga fokus.");
  if (dk.indexOf("percaya") >= 0) p.push("Berikan umpan balik positif yang spesifik dan mulai dari peran kecil yang pasti berhasil.");
  if (dk.indexOf("baca") >= 0) k.push("Sediakan ringkasan poin-poin bergambar dan bacakan instruksi penting.");
  if (dk.indexOf("alat") >= 0) p.push("Berikan pendampingan keselamatan kerja dan demo ulang penggunaan alat.");
  if (dk.indexOf("cepat") >= 0) o.push("Berikan tugas tantangan dan peran tutor sebaya.");
  if (dk.indexOf("absen") >= 0) p.push("Pantau kehadiran, siapkan materi susulan, dan koordinasikan dengan wali kelas.");
  return { konten: pfUnique(k), proses: pfUnique(p), produk: pfUnique(o) };
}

function pfSaranAsesmen(level) {
  if (level === "dasar") return { kesulitan: "mudah", cognitive: ["C1", "C2"], bentukList: ["pg", "bs", "menjodohkan"], label: "Mudah, C1-C2, Pilihan Ganda / Benar-Salah / Menjodohkan" };
  if (level === "mahir") return { kesulitan: "sulit", cognitive: ["C4", "C5", "C6"], bentukList: ["pgk", "uraian", "praktik"], label: "Sulit, C4-C6, PG Kompleks / Uraian / Praktik" };
  return { kesulitan: "sedang", cognitive: ["C2", "C3"], bentukList: ["pg", "pgk", "isian"], label: "Sedang, C2-C3, Pilihan Ganda / PG Kompleks / Isian" };
}

function pfUseAssess(level) {
  var sg = pfSaranAsesmen(level);
  draft.kesulitan = sg.kesulitan;
  draft.cognitive = sg.cognitive.slice();
  draft.bentukList = sg.bentukList.slice();
  var note = "Susun soal untuk murid dengan kesiapan \"" + pfLabel(PF_KESIAPAN, level) + "\" (asesmen berdiferensiasi).";
  if (String(draft.instruksi || "").indexOf("asesmen berdiferensiasi") < 0) {
    draft.instruksi = (draft.instruksi ? draft.instruksi + "\n" : "") + note;
  }
  navigate("buat");
  toast("success", "Pengaturan soal disiapkan", "Lengkapi identitas dan materi; pengaturan kesulitan, level kognitif, dan bentuk soal sudah terisi di Langkah 3.");
}

/* ---------------- Halaman utama ---------------- */
function renderProfil() {
  var tabs = [
    { v: "daftar", l: "Daftar & Profil Murid" },
    { v: "peta", l: "Peta Kebutuhan Kelas" },
    { v: "panduan", l: "Panduan Diferensiasi" }
  ];
  var h = '<div class="card card-pad mb-16"><div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:center">';
  h += '<div><h3 style="font-size:17px">Profil Murid</h3><p style="color:var(--muted);font-size:13px">' + profil.length + " murid terdata &bull; data tersimpan hanya di browser ini</p></div>";
  h += '<div class="q-actions" style="margin:0">';
  h += '<button class="btn btn-primary btn-sm" data-action="pfAdd">' + ICON.plus + " Tambah Murid</button>";
  h += '<button class="btn btn-light btn-sm" data-action="pfBulk">' + ICON.users + " Tambah Banyak</button>";
  h += '<button class="btn btn-light btn-sm" data-action="pfFormImport">' + ICON.cloud + " Impor Angket Google Form</button>";
  h += '<button class="btn btn-light btn-sm" data-action="pfImportRekap">' + ICON.refresh + " Isi Kesiapan dari Rekap Nilai</button>";
  h += '<button class="btn btn-light btn-sm" data-action="pfExport">' + ICON.download + " Unduh Excel</button>";
  h += "</div></div></div>";

  h += '<div class="tabs">';
  tabs.forEach(function (t) {
    h += '<button class="tab' + (state.profilTab === t.v ? " active" : "") + '" data-action="profilTab" data-tab="' + t.v + '">' + esc(t.l) + "</button>";
  });
  h += "</div>";

  if (state.profilTab === "peta") h += renderProfilPeta();
  else if (state.profilTab === "panduan") h += renderProfilPanduan();
  else h += renderProfilDaftar();
  if (pfFormCfg.auto && pfFormCfg.sheet && !state.pfAutoDone && !state.pfAutoBusy) {
    setTimeout(function () { try { pfFormAutoPull(); } catch (e) { } }, 400);
  }
  return h;
}

function renderProfilDaftar() {
  var f = state.filter.profil;
  var h = '<div class="card card-pad mb-16"><div class="toolbar" style="margin:0">';
  h += '<div class="search">' + ICON.search + '<input type="text" id="pq" data-filter="profil" data-key="q" value="' + esc(f.q) + '" placeholder="Cari nama atau minat murid..."></div>';
  h += '<select data-filter="profil" data-key="kelas"><option value="">Semua kelas</option>' + optSelect(KELAS_BOGA, f.kelas) + "</select>";
  h += '<select data-filter="profil" data-key="kesiapan"><option value="">Semua kesiapan</option>' + optSelect(PF_KESIAPAN, f.kesiapan) + '<option value="-"' + (f.kesiapan === "-" ? " selected" : "") + ">Belum diases</option></select>";
  h += "</div></div>";

  if (!profil.length) {
    h += '<div class="card"><div class="empty">' + ICON.users + "<h4>Belum ada data murid</h4><p>Tambahkan murid satu per satu, atau tempel daftar nama sekaligus lalu lengkapi profilnya.</p>" +
      '<button class="btn btn-primary" data-action="pfAdd">' + ICON.plus + " Tambah Murid</button></div></div>";
    return h;
  }
  var rows = pfFiltered();
  h += '<div class="table-wrap"><table class="tbl"><thead><tr><th>Nama</th><th>Kelas</th><th>Kesiapan</th><th>Gaya Belajar</th><th>Minat</th><th>Kelengkapan</th><th>Aksi</th></tr></thead><tbody>';
  if (!rows.length) h += '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px">Tidak ada murid yang cocok dengan filter.</td></tr>';
  rows.forEach(function (s) {
    var c = pfCompleteness(s);
    h += "<tr><td><strong>" + esc(s.nama) + "</strong>" + (s.absen ? ' <span class="badge badge-slate">' + esc(s.absen) + "</span>" : "") + "</td>" +
      "<td>" + esc(s.kelas) + "</td><td>" + pfKesiapanBadge(s.kesiapan) + "</td><td>" + pfGayaBadge(s.gaya) + "</td>" +
      "<td>" + esc((s.minat || []).slice(0, 2).join(", ") || "-") + ((s.minat || []).length > 2 ? " +" + (s.minat.length - 2) : "") + "</td>" +
      '<td><div class="pf-track" style="min-width:80px"><i style="width:' + c + '%"></i></div><span style="font-size:11px;color:var(--muted)">' + c + "%</span></td>" +
      '<td><div class="tbl-actions">' +
      '<button class="btn btn-light btn-sm" data-action="pfDetail" data-id="' + s.id + '" title="Lihat profil &amp; rekomendasi">' + ICON.eye + "</button>" +
      '<button class="btn btn-light btn-sm" data-action="pfAngket" data-id="' + s.id + '" title="Angket gaya belajar">' + ICON.sparkles + "</button>" +
      '<button class="btn btn-light btn-sm" data-action="pfEdit" data-id="' + s.id + '" title="Edit">' + ICON.edit + "</button>" +
      '<button class="btn btn-danger btn-sm" data-action="pfDel" data-id="' + s.id + '" title="Hapus">' + ICON.trash + "</button>" +
      "</div></td></tr>";
  });
  h += "</tbody></table></div>";
  return h;
}

function pfBars(counts, order, total, labelFn) {
  var h = "";
  order.forEach(function (k) {
    var n = counts[k] || 0;
    var pct = total ? Math.round(n / total * 100) : 0;
    h += '<div class="pf-bar"><span>' + esc(labelFn(k)) + '</span><div class="pf-track"><i style="width:' + pct + '%"></i></div><b>' + n + "</b></div>";
  });
  return h;
}

function pfGroupCard(title, sub, members, level) {
  var h = '<div class="card card-pad"><div class="card-head" style="margin-bottom:10px"><div><h3>' + esc(title) + "</h3><p>" + esc(sub) + "</p></div>" +
    '<span class="badge badge-slate">' + members.length + " murid</span></div>";
  if (!members.length) h += '<p style="font-size:12.5px;color:var(--muted)">Belum ada murid.</p>';
  else {
    h += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
    members.forEach(function (s) {
      h += '<button class="pf-chip" data-action="pfDetail" data-id="' + s.id + '">' + esc(s.nama) + "</button>";
    });
    h += "</div>";
  }
  if (level) {
    var sg = pfSaranAsesmen(level);
    h += '<div class="answer-box explain" style="margin-top:12px"><strong>Saran asesmen</strong>' + esc(sg.label) +
      '</div><div class="q-actions"><button class="btn btn-light btn-sm" data-action="pfUseAssess" data-level="' + level + '">' + ICON.sparkles + " Pakai di Buat Asesmen</button></div>";
  }
  h += "</div>";
  return h;
}

function renderProfilPeta() {
  var f = state.filter.profil;
  var list = profil.filter(function (s) { return !f.kelas || s.kelas === f.kelas; });
  var h = '<div class="card card-pad mb-16"><div class="toolbar" style="margin:0">';
  h += '<select data-filter="profil" data-key="kelas"><option value="">Semua kelas</option>' + optSelect(KELAS_BOGA, f.kelas) + "</select>";
  h += '<span style="font-size:12.5px;color:var(--muted)">Peta dihitung dari ' + list.length + " murid" + (f.kelas ? " kelas " + esc(f.kelas) : "") + ".</span></div></div>";
  if (!list.length) {
    return h + '<div class="card"><div class="empty">' + ICON.chart + "<h4>Belum ada data untuk dipetakan</h4><p>Tambahkan murid dan lengkapi kesiapan serta gaya belajarnya.</p>" +
      '<button class="btn btn-primary" data-action="pfAdd">' + ICON.plus + " Tambah Murid</button></div></div>";
  }
  var nKes = list.filter(function (s) { return s.kesiapan; }).length;
  var cKes = pfCountBy(list, function (s) { return s.kesiapan; });
  var cGaya = pfCountBy(list, function (s) { return s.gaya; });
  var cMinat = pfCountBy(list, function (s) { return s.minat; });
  var cProduk = pfCountBy(list, function (s) { return s.produk; });
  var minatOrder = Object.keys(cMinat).sort(function (a, b) { return cMinat[b] - cMinat[a]; }).slice(0, 6);

  h += '<div class="grid grid-4 mb-16">';
  h += statCard("si-blue", ICON.users, list.length, "Jumlah Murid");
  h += statCard("si-amber", ICON.alert, cKes.dasar || 0, "Perlu Penguatan");
  h += statCard("si-violet", ICON.check, cKes.cakap || 0, "Sedang");
  h += statCard("si-green", ICON.sparkles, cKes.mahir || 0, "Siap Pengayaan");
  h += "</div>";
  if (nKes < list.length) {
    h += '<div class="note note-warn mb-16">' + ICON.alert + "<div><strong>" + (list.length - nKes) + " murid belum diases kesiapannya</strong>Lengkapi lewat asesmen diagnostik atau tombol Isi Kesiapan dari Rekap Nilai agar pengelompokan akurat.</div></div>";
  }

  h += '<div class="grid grid-2 mb-16">';
  h += '<div class="card card-pad"><div class="card-head" style="margin-bottom:10px"><div><h3>Sebaran Gaya Belajar</h3><p>Dasar memilih media dan proses</p></div></div>' +
    pfBars(cGaya, ["visual", "auditori", "kinestetik", "campuran"], list.length, function (k) { return pfLabel(PF_GAYA, k); }) + "</div>";
  h += '<div class="card card-pad"><div class="card-head" style="margin-bottom:10px"><div><h3>Minat Terbanyak</h3><p>Dasar mengaitkan konteks materi</p></div></div>' +
    (minatOrder.length ? pfBars(cMinat, minatOrder, list.length, function (k) { return k; }) : '<p style="font-size:12.5px;color:var(--muted)">Belum ada data minat.</p>') + "</div>";
  h += '<div class="card card-pad"><div class="card-head" style="margin-bottom:10px"><div><h3>Preferensi Produk</h3><p>Dasar memberi pilihan bukti belajar</p></div></div>' +
    pfBars(cProduk, ["tulis", "lisan", "visual", "praktik"], list.length, function (k) { return pfLabel(PF_PRODUK, k); }) + "</div>";
  h += "</div>";

  h += '<h3 style="font-size:15px;margin:22px 0 10px">Kelompok Berdasarkan Kesiapan <span style="font-weight:500;color:var(--muted);font-size:12.5px">(untuk tugas atau asesmen bertingkat)</span></h3>';
  h += '<div class="grid grid-3 mb-16">';
  h += pfGroupCard("Perlu Penguatan", "Butuh scaffolding dan langkah bertahap", list.filter(function (s) { return s.kesiapan === "dasar"; }), "dasar");
  h += pfGroupCard("Sedang", "Sesuai tujuan pembelajaran", list.filter(function (s) { return s.kesiapan === "cakap"; }), "cakap");
  h += pfGroupCard("Siap Pengayaan", "Tantangan dan proyek lanjutan", list.filter(function (s) { return s.kesiapan === "mahir"; }), "mahir");
  h += "</div>";

  h += '<h3 style="font-size:15px;margin:22px 0 10px">Kelompok Berdasarkan Gaya Belajar <span style="font-weight:500;color:var(--muted);font-size:12.5px">(untuk stasiun belajar atau pilihan media)</span></h3>';
  h += '<div class="grid grid-3 mb-16">';
  h += pfGroupCard("Visual", "Video, infografis, flowchart", list.filter(function (s) { return s.gaya === "visual"; }), "");
  h += pfGroupCard("Auditori", "Diskusi, penjelasan lisan, presentasi", list.filter(function (s) { return s.gaya === "auditori"; }), "");
  h += pfGroupCard("Kinestetik", "Praktik langsung, simulasi", list.filter(function (s) { return s.gaya === "kinestetik"; }), "");
  h += "</div>";

  h += '<div class="card card-pad"><div class="card-head"><div><h3>Susun Kelompok Campuran (Heterogen)</h3><p>Setiap kelompok berisi gabungan murid dari berbagai tingkat kesiapan untuk kerja tim praktik</p></div></div>';
  h += '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end"><div class="field" style="width:170px"><label>Anggota per kelompok</label>' +
    '<input type="number" min="2" max="10" id="pgs" data-filter="profil" data-key="gs" value="' + esc(f.gs) + '"></div>' +
    '<button class="btn btn-primary" data-action="pfGroups">' + ICON.shuffle + " Susun Kelompok</button></div>";
  if (state.profilGroups && state.profilGroups.length) {
    h += '<div class="grid grid-3 mt-16">';
    state.profilGroups.forEach(function (g, i) {
      h += '<div class="qcard" style="margin:0"><div class="qcard-head"><div class="qnum">' + (i + 1) + "</div><strong>Kelompok " + (i + 1) + "</strong></div>";
      g.forEach(function (id) {
        var s = pfFind(id);
        if (!s) return;
        h += '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:5px 0;border-bottom:1px dashed var(--line);font-size:13px"><span>' + esc(s.nama) + "</span>" + pfKesiapanBadge(s.kesiapan) + "</div>";
      });
      h += "</div>";
    });
    h += "</div>";
  }
  h += "</div>";

  var map = state.pfSoalMap;
  h += '<div class="card card-pad mt-16"><div class="card-head" style="margin-bottom:10px"><div><h3>Petakan Soal ke Kebutuhan Murid</h3><p>Ubah hasil profiling ini menjadi paket soal siap dibagikan per kelompok</p></div></div>' +
    '<p style="font-size:13px;color:#334155;line-height:1.75;margin:0 0 12px">Pilih <b>satu atau beberapa asesmen</b> (atau Bank Soal) &mdash; misalnya seri 10 soal mudah + 10 sedang + 10 sulit, boleh dari beberapa kali generate AI. Semua soal digabung, lalu aplikasi membaginya ke tingkat <b>Perlu Penguatan</b>, <b>Sedang</b>, dan <b>Siap Pengayaan</b> berdasarkan kesulitan dan level kognitifnya. Hasilnya <b>satu tautan kelas</b> (murid langsung dapat tautan/QR yang sama) plus paket per kelompok bila diperlukan.</p>' +
    '<div class="q-actions" style="justify-content:flex-start;margin:0">' +
    '<button class="btn btn-primary btn-sm" data-action="pfSoalMap">' + ICON.layers + " Petakan Soal Sekarang</button>" +
    (map ? '<button class="btn btn-light btn-sm" data-action="pfSoalMapModal">' + ICON.eye + " Lihat Pemetaan Terakhir</button>" : "") +
    "</div>" +
    (map ? '<p style="font-size:12.5px;color:var(--muted);margin:10px 0 0">Pemetaan terakhir: <b>' + esc(map.sumber.l) + "</b> &bull; " + esc(pfSoalMapRingkas()) + "</p>" : "") +
    "</div>";
  return h;
}

function renderProfilPanduan() {
  var h = '<div class="grid grid-2 mb-16">';
  h += '<div class="card card-pad"><div class="card-head"><div><h3>Apa yang dipetakan?</h3><p>Tiga aspek profil murid</p></div></div>' +
    '<ul style="font-size:13.5px;line-height:1.8;padding-left:20px;color:#334155">' +
    "<li><b>Kesiapan belajar</b> &mdash; sejauh mana murid sudah menguasai prasyarat dan materi. Diisi dari asesmen diagnostik atau hasil nilai.</li>" +
    "<li><b>Minat</b> &mdash; topik kuliner yang memotivasi murid, dipakai untuk mengaitkan konteks soal dan proyek.</li>" +
    "<li><b>Profil belajar</b> &mdash; gaya belajar (visual, auditori, kinestetik), cara kerja, ritme, dan bentuk produk yang diminati.</li></ul></div>";
  h += '<div class="card card-pad"><div class="card-head"><div><h3>Apa yang dideferensiasi?</h3><p>Tiga aspek pembelajaran</p></div></div>' +
    '<ul style="font-size:13.5px;line-height:1.8;padding-left:20px;color:#334155">' +
    "<li><b>Konten</b> &mdash; apa yang dipelajari: kedalaman materi, media, dan konteks.</li>" +
    "<li><b>Proses</b> &mdash; bagaimana murid belajar: tingkat pendampingan, kerja mandiri atau tim, urutan kegiatan.</li>" +
    "<li><b>Produk</b> &mdash; bagaimana murid menunjukkan pemahaman: tulisan, lisan, visual, atau praktik.</li></ul></div>";
  h += "</div>";
  h += '<div class="card card-pad mb-16"><div class="card-head"><div><h3>Alur penggunaan yang disarankan</h3></div></div>' +
    '<ol style="font-size:13.5px;line-height:1.9;padding-left:20px;color:#334155">' +
    "<li>Tambahkan murid (satu per satu atau tempel daftar nama sekaligus).</li>" +
    "<li>Minta murid mengisi angket gaya belajar (tombol bintang pada tiap murid), atau pilih gaya secara manual berdasarkan pengamatan.</li>" +
    "<li>Isi kesiapan dari asesmen diagnostik, atau tarik otomatis dari Rekap Nilai (80+ = Mahir, 60-79 = Sedang, di bawah 60 = Perlu Penguatan).</li>" +
    "<li>Buka tab Peta Kebutuhan Kelas untuk melihat sebaran, kelompok, dan susun kelompok campuran.</li>" +
    "<li>Pada tab yang sama, klik <b>Petakan Soal Sekarang</b>: pilih asesmen yang sudah dibuat (atau Bank Soal), lalu aplikasi membagi soal menjadi paket <b>Perlu Penguatan</b>, <b>Sedang</b>, dan <b>Siap Pengayaan</b>. Setiap paket punya tautan/QR dan file soal sendiri, plus catatan media sesuai gaya belajar kelompok itu.</li>" +
    "<li>Ingin mengumpulkan profil langsung dari siswa? Gunakan tombol <b>Impor Angket Google Form</b>: bagikan Google Form (pertanyaannya bisa disalin dari jendela impor), lalu tarik responsnya ke sini — gaya belajar, kesiapan, dan minat terisi otomatis.</li>" +
    "<li>Gunakan rekomendasi pada profil tiap murid untuk merancang konten, proses, dan produk; gunakan tombol Pakai di Buat Asesmen untuk soal bertingkat.</li></ol></div>";
  h += '<div class="card card-pad mb-16"><div class="card-head"><div><h3>Tiga cara membedakan tugas untuk kelompok pemula, menengah, dan mahir</h3><p>Pilih sesuai tujuan: tugas harian, asesmen formatif, atau sumatif</p></div></div>' +
    '<div class="grid grid-3">' +
    '<div class="card card-pad" style="box-shadow:none;border:1px solid var(--line)"><h3 style="font-size:13.5px;margin-bottom:6px">1. Tiga paket berbeda (tiga rangkap)</h3>' +
    "<p style=\"font-size:12.5px;color:#475569;line-height:1.7;margin:0\">Tiap kelompok mengerjakan soal yang berbeda: pemula soal mudah dengan bantuan bertahap, menengah soal inti, mahir soal tantangan. Tiap kelompok menerima <b>tautan/QR atau file soal sendiri</b>.<br><b>Cocok untuk:</b> tugas harian dan latihan (LKPD).<br><b>Di aplikasi:</b> Petakan Soal <b>tanpa</b> centang soal inti bersama.</p></div>";
  h += '<div class="card card-pad"><div class="card-head"><div><h3>2. Satu inti, tambahan berbeda</h3><p>Paling aman untuk penilaian</p></div></div>' +
    '<p style="font-size:13px;line-height:1.75;color:#334155;margin:0">Semua kelompok mengerjakan <b>soal inti yang sama</b> (tingkat Sedang), lalu setiap kelompok menerima tambahan sesuai tingkatnya: pemula dapat soal mudah dengan scaffolding, mahir dapat soal tantangan. Capaian inti semua murid tetap terukur, sehingga penilaiannya adil dan bisa dibandingkan.<br><b>Cara di aplikasi:</b> Petakan Soal dengan centang <b>soal inti bersama</b>.</div>';
  h += '<div class="card card-pad"><div class="card-head"><div><h3>3. Tugas sama, dukungan berbeda</h3><p>Diferensiasi proses, bukan soal</p></div></div>' +
    '<p style="font-size:13px;color:#334155;line-height:1.75">Semua murid mengerjakan soal yang sama dengan satu tautan. Yang dibedakan: waktu, contoh/contoh terbimbing, tutor sebaya, media, dan jumlah butir wajib. Cocok untuk materi baru, kelas kecil, atau saat ingin menonjolkan kerja kelompok campuran. Media tetap dapat diganti tanpa mengubah soal, sesuai catatan gaya belajar pada paket.</p></div>';
  h += "</div>";
  h += '<div class="note note-info" style="margin-top:14px">' + ICON.info + "<div><strong>Yang tetap sama, yang berbeda</strong> Tetap sama untuk semua kelompok: <b>kompetensi, indikator, dan bobot penilaian</b>. Yang berbeda: kedalaman soal, jumlah bantuan, media penyajian, dan bentuk bukti belajar. Hindari memberi label tingkat di depan murid &mdash; gunakan nama paket netral seperti <b>Paket A / B / C</b>.</div></div>";
  h += "</div>";
  h += '<div class="note note-warn">' + ICON.alert + "<div><strong>Catatan penting</strong>Profil ini bersifat dinamis dan <b>bukan label permanen</b>; perbarui secara berkala. Rekomendasi dibuat dengan aturan sederhana sebagai titik awal, keputusan akhir tetap pada pertimbangan guru. Hindari mencatat diagnosis medis atau informasi sensitif; cukup tuliskan kebutuhan dukungan belajar yang teramati. Data tersimpan di browser perangkat ini saja.</div></div>";
  return h;
}

/* ---------------- Form murid ---------------- */
function pfCheckList(cls, items, selected, isObj) {
  var h = '<div class="checks">';
  items.forEach(function (it) {
    var v = isObj ? it.v : it, l = isObj ? it.l : it;
    var on = (selected || []).indexOf(v) >= 0;
    h += '<label class="chk' + (on ? " checked" : "") + '"><input type="checkbox" class="' + cls + '" value="' + esc(v) + '"' + (on ? " checked" : "") +
      " onchange=\"this.parentNode.classList.toggle('checked',this.checked)\"> " + esc(l) + "</label>";
  });
  return h + "</div>";
}

function pfFormModal(existing) {
  var s = existing || { nama: "", kelas: "", absen: "", kesiapan: "", gaya: "", minat: [], kerja: "", ritme: "", produk: "", dukungan: [], catatan: "" };
  var body = '<div class="form-grid">';
  body += '<div class="field"><label>Nama Murid <span class="req">*</span></label><input type="text" id="pfNama" value="' + esc(s.nama) + '"></div>';
  body += '<div class="field"><label>Kelas <span class="req">*</span></label><select id="pfKelas"><option value="">Pilih kelas</option>' + optSelect(KELAS_BOGA, s.kelas) + "</select></div>";
  body += '<div class="field"><label>Nomor Absen</label><input type="text" id="pfAbsen" value="' + esc(s.absen) + '"></div>';
  body += '<div class="field"><label>Tingkat Kesiapan Belajar</label><select id="pfKesiapan"><option value="">Belum diases</option>' + optSelect(PF_KESIAPAN, s.kesiapan) + "</select></div>";
  body += '<div class="field"><label>Gaya Belajar Dominan</label><select id="pfGaya"><option value="">Belum diketahui</option>' + optSelect(PF_GAYA, s.gaya) + '</select><span class="hint">Atau gunakan angket pada tombol bintang di daftar murid.</span></div>';
  body += '<div class="field"><label>Cara Kerja Favorit</label><select id="pfKerja"><option value="">-</option>' + optSelect(PF_KERJA, s.kerja) + "</select></div>";
  body += '<div class="field"><label>Ritme Belajar</label><select id="pfRitme"><option value="">-</option>' + optSelect(PF_RITME, s.ritme) + "</select></div>";
  body += '<div class="field"><label>Bentuk Produk Favorit</label><select id="pfProduk"><option value="">-</option>' + optSelect(PF_PRODUK, s.produk) + "</select></div>";
  body += '<div class="field full"><label>Minat Kuliner <span class="hint">(boleh lebih dari satu)</span></label>' + pfCheckList("pfMinat", PF_MINAT, s.minat, false) + "</div>";
  body += '<div class="field full"><label>Kebutuhan Dukungan Belajar <span class="hint">(opsional, berdasarkan pengamatan)</span></label>' + pfCheckList("pfDukungan", PF_DUKUNGAN, s.dukungan, true) + "</div>";
  body += '<div class="field full"><label>Catatan Guru</label><textarea id="pfCatatan" placeholder="Hasil observasi, kekuatan murid, atau strategi yang sudah berhasil...">' + esc(s.catatan) + "</textarea></div>";
  body += "</div>";
  openModal(
    '<div class="modal-head"><h3>' + (existing ? "Edit Profil Murid" : "Tambah Murid") + '</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="pfSave" data-id="' + (existing ? existing.id : "") + '">' + ICON.save + " Simpan</button></div>",
    { wide: true }
  );
}

function pfSave(id) {
  var nama = pfVal("pfNama"), kelas = pfVal("pfKelas");
  if (!nama) { toast("warn", "Nama kosong", "Nama murid wajib diisi."); return; }
  if (!kelas) { toast("warn", "Kelas belum dipilih", "Pilih kelas murid."); return; }
  var s = id ? pfFind(id) : null;
  var isNew = !s;
  if (!s) s = { id: uid(), createdAt: new Date().toISOString(), gayaSkor: null };
  s.nama = nama;
  s.kelas = kelas;
  s.absen = pfVal("pfAbsen");
  s.kesiapan = pfVal("pfKesiapan");
  s.gaya = pfVal("pfGaya");
  s.kerja = pfVal("pfKerja");
  s.ritme = pfVal("pfRitme");
  s.produk = pfVal("pfProduk");
  s.minat = pfChecked("pfMinat");
  s.dukungan = pfChecked("pfDukungan");
  s.catatan = pfVal("pfCatatan");
  s.updatedAt = new Date().toISOString();
  if (isNew) profil.push(s);
  profilPersist();
  state.profilGroups = null;
  closeModal();
  render();
  toast("success", isNew ? "Murid ditambahkan" : "Profil diperbarui", s.nama + " tersimpan.");
}

function pfDelete(id) {
  var s = pfFind(id);
  if (!s) return;
  confirmModal("Hapus Murid", "Yakin ingin menghapus profil \"" + s.nama + "\"? Tindakan tidak dapat dibatalkan.", "Hapus", function () {
    profil = profil.filter(function (x) { return x.id !== id; });
    profilPersist();
    state.profilGroups = null;
    render();
    toast("success", "Profil dihapus", "Data murid telah dihapus.");
  });
}

/* ---------------- Tambah banyak ---------------- */
function pfBulkModal() {
  var body = '<div class="note note-info mb-16">' + ICON.info + "<div><strong>Tambah banyak sekaligus</strong>Tempel daftar nama (satu nama per baris). Profil lainnya dapat dilengkapi kemudian.</div></div>";
  body += '<div class="form-grid"><div class="field"><label>Kelas <span class="req">*</span></label><select id="pbKelas"><option value="">Pilih kelas</option>' + optSelect(KELAS_BOGA) + "</select></div></div>";
  body += '<div class="field mt-16"><label>Daftar Nama</label><textarea id="pbNama" style="min-height:180px" placeholder="Nama murid 1\nNama murid 2\nNama murid 3"></textarea></div>';
  openModal(
    '<div class="modal-head"><h3>Tambah Banyak Murid</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="pfBulkSave">' + ICON.check + " Tambahkan</button></div>"
  );
}

function pfBulkSave() {
  var kelas = pfVal("pbKelas");
  if (!kelas) { toast("warn", "Kelas belum dipilih", "Pilih kelas untuk seluruh nama."); return; }
  var names = String(document.getElementById("pbNama").value || "").split(/\n/).map(function (n) { return n.replace(/^\s*\d+[.)]\s*/, "").trim(); }).filter(Boolean);
  if (!names.length) { toast("warn", "Daftar kosong", "Tempel minimal satu nama."); return; }
  var added = 0, skipped = 0;
  names.forEach(function (n) {
    var dup = profil.some(function (s) { return s.kelas === kelas && pfNorm(s.nama) === pfNorm(n); });
    if (dup) { skipped++; return; }
    profil.push({ id: uid(), nama: n, kelas: kelas, absen: "", kesiapan: "", gaya: "", gayaSkor: null, minat: [], kerja: "", ritme: "", produk: "", dukungan: [], catatan: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    added++;
  });
  profilPersist();
  closeModal();
  render();
  toast("success", added + " murid ditambahkan", skipped ? skipped + " nama dilewati karena sudah ada." : "Lengkapi profil masing-masing murid.");
}

/* ---------------- Angket gaya belajar ---------------- */
function pfAngketModal(id) {
  var s = pfFind(id);
  if (!s) return;
  state.pfAngketId = id;
  var body = '<div class="note note-info mb-16">' + ICON.info + "<div><strong>Angket untuk " + esc(s.nama) + "</strong>Pilih satu jawaban yang paling menggambarkan kebiasaan belajar murid pada setiap nomor. Tidak ada jawaban benar atau salah.</div></div>";
  PF_ANGKET.forEach(function (it, i) {
    body += '<div class="qcard"><div class="qstem"><b>' + (i + 1) + ".</b> " + esc(it.q) + "</div><ul class=\"options\">";
    [["v", it.v], ["a", it.a], ["k", it.k]].forEach(function (o) {
      body += '<li><label style="display:flex;gap:10px;cursor:pointer;width:100%"><input type="radio" name="aq' + i + '" value="' + o[0] + '"> <span>' + esc(o[1]) + "</span></label></li>";
    });
    body += "</ul></div>";
  });
  openModal(
    '<div class="modal-head"><h3>Angket Gaya Belajar</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="pfAngketSave">' + ICON.check + " Hitung &amp; Simpan</button></div>",
    { wide: true }
  );
}

function pfAngketSave() {
  var s = pfFind(state.pfAngketId);
  if (!s) return;
  var sc = { v: 0, a: 0, k: 0 }, missing = 0;
  for (var i = 0; i < PF_ANGKET.length; i++) {
    var el = document.querySelector('input[name="aq' + i + '"]:checked');
    if (!el) missing++; else sc[el.value]++;
  }
  if (missing) { toast("warn", "Angket belum lengkap", missing + " nomor belum dijawab."); return; }
  var arr = [["visual", sc.v], ["auditori", sc.a], ["kinestetik", sc.k]].sort(function (x, y) { return y[1] - x[1]; });
  s.gayaSkor = sc;
  s.gaya = (arr[0][1] - arr[1][1] <= 1) ? "campuran" : arr[0][0];
  s.updatedAt = new Date().toISOString();
  profilPersist();
  state.profilGroups = null;
  closeModal();
  render();
  toast("success", "Gaya belajar tersimpan", s.nama + ": " + pfLabel(PF_GAYA, s.gaya) + " (V " + sc.v + " / A " + sc.a + " / K " + sc.k + ").");
}

/* ---------------- Detail & rekomendasi ---------------- */
function pfDetailModal(id) {
  var s = pfFind(id);
  if (!s) return;
  var r = pfRekomendasi(s);
  var body = '<div class="summary-list">';
  body += '<div class="summary-item"><span>Nama</span><strong>' + esc(s.nama) + (s.absen ? " (absen " + esc(s.absen) + ")" : "") + "</strong></div>";
  body += '<div class="summary-item"><span>Kelas</span><strong>' + esc(s.kelas) + "</strong></div>";
  body += '<div class="summary-item"><span>Kesiapan</span><strong>' + esc(s.kesiapan ? pfLabel(PF_KESIAPAN, s.kesiapan) : "Belum diases") + "</strong>" +
    (s.kesiapanSumber ? '<div style="font-size:11px;color:var(--muted)">' + esc(s.kesiapanSumber) + "</div>" : "") + "</div>";
  body += '<div class="summary-item"><span>Gaya Belajar</span><strong>' + esc(s.gaya ? pfLabel(PF_GAYA, s.gaya) : "Belum diketahui") + "</strong>" +
    (s.gayaSkor ? '<div style="font-size:11px;color:var(--muted)">Skor angket: V ' + s.gayaSkor.v + " / A " + s.gayaSkor.a + " / K " + s.gayaSkor.k + "</div>" : "") + "</div>";
  body += '<div class="summary-item"><span>Cara Kerja / Ritme</span><strong>' + esc(pfLabel(PF_KERJA, s.kerja)) + " / " + esc(pfLabel(PF_RITME, s.ritme)) + "</strong></div>";
  body += '<div class="summary-item"><span>Produk Favorit</span><strong>' + esc(pfLabel(PF_PRODUK, s.produk)) + "</strong></div>";
  body += '<div class="summary-item full"><span>Minat</span><strong>' + esc((s.minat || []).join(", ") || "-") + "</strong></div>";
  if ((s.dukungan || []).length) {
    body += '<div class="summary-item full"><span>Kebutuhan Dukungan</span><strong>' + esc(s.dukungan.map(function (d) { return pfLabel(PF_DUKUNGAN, d); }).join("; ")) + "</strong></div>";
  }
  if (s.catatan) body += '<div class="summary-item full"><span>Catatan Guru</span><strong>' + nl2br(s.catatan) + "</strong></div>";
  body += "</div>";

  body += '<h3 style="font-size:15px;margin:20px 0 10px">Rekomendasi Pembelajaran Berdiferensiasi</h3>';
  if (!r.konten.length && !r.proses.length && !r.produk.length) {
    body += '<div class="note note-warn">' + ICON.alert + "<div>Lengkapi kesiapan, gaya belajar, atau minat untuk mendapatkan rekomendasi.</div></div>";
  } else {
    [["Konten (apa yang dipelajari)", r.konten], ["Proses (cara belajar)", r.proses], ["Produk (bukti belajar)", r.produk]].forEach(function (g) {
      body += '<div class="answer-box explain"><strong>' + g[0] + "</strong>";
      body += g[1].length ? "<ul style=\"margin:4px 0 0;padding-left:18px;line-height:1.6\">" + g[1].map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "-";
      body += "</div>";
    });
  }
  if (s.kesiapan) {
    body += '<div class="note note-info mt-16">' + ICON.sparkles + "<div><strong>Saran pengaturan asesmen</strong>" + esc(pfSaranAsesmen(s.kesiapan).label) + ".</div></div>";
  }
  openModal(
    '<div class="modal-head"><h3>Profil &amp; Rekomendasi</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Tutup</button>' +
    '<button class="btn btn-light" data-action="pfAngket" data-id="' + s.id + '">' + ICON.sparkles + " Angket</button>" +
    '<button class="btn btn-primary" data-action="pfEdit" data-id="' + s.id + '">' + ICON.edit + " Edit</button></div>",
    { wide: true }
  );
}

/* ---------------- Kelompok campuran ---------------- */
function pfBuildGroups() {
  var f = state.filter.profil;
  var size = Math.max(2, Math.min(10, parseInt(f.gs, 10) || 4));
  var list = profil.filter(function (s) { return !f.kelas || s.kelas === f.kelas; });
  if (list.length < 2) { toast("warn", "Murid terlalu sedikit", "Minimal 2 murid untuk membuat kelompok."); return; }
  var score = { mahir: 3, cakap: 2, dasar: 1 };
  var shuffled = shuffleArr(list.slice());
  shuffled.sort(function (a, b) { return (score[b.kesiapan] || 2) - (score[a.kesiapan] || 2); });
  var k = Math.ceil(list.length / size);
  var groups = [];
  for (var i = 0; i < k; i++) groups.push([]);
  shuffled.forEach(function (s, idx) {
    var round = Math.floor(idx / k), pos = idx % k;
    var gi = round % 2 === 0 ? pos : k - 1 - pos;
    groups[gi].push(s.id);
  });
  state.profilGroups = groups;
  render();
  toast("success", k + " kelompok disusun", "Anggota tiap kelompok dibuat seimbang berdasarkan kesiapan. Klik lagi untuk susunan baru.");
}

/* ---------------- Isi kesiapan dari Rekap Nilai ---------------- */
function pfImportRekap() {
  var rows = (state.rekap && state.rekap.pulled) || [];
  if (!rows.length) {
    toast("warn", "Belum ada data nilai", "Tarik hasil atau impor kode hasil di menu Rekap Nilai terlebih dahulu.");
    return;
  }
  var updated = 0, added = 0;
  rows.forEach(function (r) {
    if (!r.nama) return;
    var pct = r.total ? r.benar / r.total * 100 : 0;
    var level = pct >= 80 ? "mahir" : pct >= 60 ? "cakap" : "dasar";
    var target = null;
    for (var i = 0; i < profil.length; i++) {
      if (pfNorm(profil[i].nama) === pfNorm(r.nama) && (!r.kelas || !profil[i].kelas || profil[i].kelas === r.kelas)) { target = profil[i]; break; }
    }
    var src = "Dari rekap nilai \"" + (r.judul || "asesmen") + "\" (" + Math.round(pct) + "% benar)";
    if (target) { target.kesiapan = level; target.kesiapanSumber = src; target.updatedAt = new Date().toISOString(); updated++; }
    else {
      profil.push({ id: uid(), nama: r.nama, kelas: r.kelas || "", absen: r.absen || "", kesiapan: level, kesiapanSumber: src, gaya: "", gayaSkor: null, minat: [], kerja: "", ritme: "", produk: "", dukungan: [], catatan: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      added++;
    }
  });
  profilPersist();
  state.profilGroups = null;
  render();
  toast("success", "Kesiapan diperbarui", updated + " murid diperbarui, " + added + " murid baru ditambahkan. Murid baru tanpa kelas perlu dilengkapi.");
}

/* ---------------- Ekspor Excel ---------------- */
function pfExport() {
  if (!profil.length) { toast("warn", "Belum ada data", "Tambahkan murid terlebih dahulu."); return; }
  var list = pfFiltered();
  var html = "<html xmlns:x='urn:schemas-microsoft-com:office:excel'><head><meta charset='utf-8'>" +
    "<style>td,th{border:1px solid #999;padding:4px;font-family:Arial;font-size:11px;vertical-align:top}th{background:#dbeafe}</style></head><body>";
  html += "<table><tr><th colspan='13'>PROFIL MURID - PEMETAAN KEBUTUHAN BELAJAR (PEMBELAJARAN BERDIFERENSIASI)</th></tr></table><br>";
  html += "<table><tr><th>No</th><th>Nama</th><th>Kelas</th><th>Absen</th><th>Kesiapan</th><th>Gaya Belajar</th><th>Minat</th><th>Cara Kerja</th><th>Ritme</th><th>Produk Favorit</th><th>Rekomendasi Konten</th><th>Rekomendasi Proses</th><th>Rekomendasi Produk</th></tr>";
  list.forEach(function (s, i) {
    var r = pfRekomendasi(s);
    html += "<tr><td>" + (i + 1) + "</td><td>" + esc(s.nama) + "</td><td>" + esc(s.kelas) + "</td><td>" + esc(s.absen) + "</td><td>" + esc(s.kesiapan ? pfLabel(PF_KESIAPAN, s.kesiapan) : "") +
      "</td><td>" + esc(s.gaya ? pfLabel(PF_GAYA, s.gaya) : "") + "</td><td>" + esc((s.minat || []).join(", ")) + "</td><td>" + esc(s.kerja ? pfLabel(PF_KERJA, s.kerja) : "") +
      "</td><td>" + esc(s.ritme ? pfLabel(PF_RITME, s.ritme) : "") + "</td><td>" + esc(s.produk ? pfLabel(PF_PRODUK, s.produk) : "") +
      "</td><td>" + esc(r.konten.join(" | ")) + "</td><td>" + esc(r.proses.join(" | ")) + "</td><td>" + esc(r.produk.join(" | ")) + "</td></tr>";
  });
  html += "</table></body></html>";
  downloadBlob(new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" }), "Profil Murid - Pemetaan Belajar.xls");
  toast("success", "Excel diunduh", list.length + " murid beserta rekomendasinya diekspor.");
}

/* =====================================================================
   IMPOR OTOMATIS ANGKET DARI GOOGLE FORM
   Alur yang dipakai guru:
     1. Buat Google Form dengan pertanyaan dari tombol "Lihat Pertanyaan Angket".
     2. Di Google Form: tab Respons -> Link to Sheets (terbentuk spreadsheet).
     3. Bagikan spreadsheet: Share -> Anyone with the link -> Viewer.
     4. Tempel tautan spreadsheet di jendela impor -> Ambil Respons.
     5. Aplikasi menarik respons (JSONP gviz, tanpa server sendiri),
        memetakan jawaban ke gaya belajar, kesiapan, dan minat, lalu
        menyimpannya ke Profil Murid.
   Alternatif tanpa tautan: tempel tabel (copy dari Google Sheets) atau
   pilih berkas CSV. Keduanya memakai pemetaan kolom yang sama.
   ===================================================================== */
var LS_PROFIL_FORM = "adik_profil_form_v1";
var pfFormCfg = load(LS_PROFIL_FORM, { sheet: "", sheetName: "" });
function pfFormPersist() { persistSave(LS_PROFIL_FORM, pfFormCfg); }
state.pfFormMap = null;

/* ---------- teks pertanyaan angket untuk disalin ke Google Form ---------- */
function pfAngketTemplateText() {
  var t = "ANGKET PROFIL MURID - KARAKTERISTIK & KEBUTUHAN BELAJAR\n";
  t += "(Buat di Google Form. Jenis jawaban sudah ditulis di tiap nomor. Jangan ubah teks pertanyaan/pilihan agar jawaban bisa dipetakan otomatis.)\n\n";
  t += "Judul form : Angket Karakteristik & Kebutuhan Belajar\n";
  t += "Deskripsi  : Isi dengan jujur. Tidak ada jawaban benar atau salah. Hasil dipakai guru untuk menyesuaikan cara belajar.\n\n";
  t += "1. Nama Lengkap  [Jawaban singkat - wajib diisi]\n";
  t += "2. Kelas         [Jawaban singkat, mis. X / XI / XII]\n";
  t += "3. Nomor Absen   [Jawaban singkat]\n\n";
  t += "4. Minat kuliner  [Kotak centang - boleh lebih dari satu]\n";
  PF_MINAT.forEach(function (m) { t += "   - " + m + "\n"; });
  t += "\n5. Bagaimana kesiapanmu memahami materi praktik dapur terakhir?  [Pilihan ganda]\n";
  PF_KESIAPAN.forEach(function (k) { t += "   - " + k.l + "\n"; });
  t += "\nBAGIAN GAYA BELAJAR (jenis jawaban: Pilihan ganda). Tiap nomor memakai 3 pilihan berikut:\n\n";
  PF_ANGKET.forEach(function (it, i) {
    t += (i + 6) + ". " + it.q + "\n   A. " + it.v + "\n   B. " + it.a + "\n   C. " + it.k + "\n\n";
  });
  t += "Catatan: pertanyaan nomor 1 wajib diisi (Required), agar setiap respons punya nama murid.\n";
  return t;
}

/* ---------- jendela impor ---------- */
function pfFormImportModal() {
  var body = '<div class="note note-info mb-16">' + ICON.cloud + "<div><strong>Impor otomatis dari Google Form</strong>Siswa mengisi angket lewat Google Form, respons masuk ke Google Sheet, lalu aplikasi menariknya ke sini. <b>Gaya belajar, kesiapan, dan minat</b> murid akan terisi sendiri.</div></div>";
  body += '<div class="card card-pad" style="box-shadow:none;border:1px solid var(--line)"><h3 style="font-size:14px;margin-bottom:8px">Siapkan di Google (sekali saja)</h3>' +
    '<ol style="font-size:13px;line-height:1.85;padding-left:20px;color:#334155;margin:0">' +
    "<li>Buat <b>Google Form</b> baru, lalu tambahkan pertanyaan sesuai tombol <b>Lihat Pertanyaan Angket</b>.</li>" +
    "<li>Buka tab <b>Respons</b> &rarr; klik ikon <b>Sheets</b> &rarr; <b>Link to Sheets</b>. Terbentuk spreadsheet respons.</li>" +
    "<li>Di spreadsheet itu: <b>Share</b> &rarr; <b>Anyone with the link</b> &rarr; <b>Viewer</b> &rarr; <b>Copy link</b>.</li>" +
    "<li>Tempel tautan di kolom bawah, klik <b>Ambil Respons</b>, lalu <b>Terapkan ke Profil Murid</b>.</li></ol>" +
    '<div class="q-actions" style="margin-top:12px">' +
    '<button class="btn btn-light btn-sm" data-action="pfFormTemplate">' + ICON.eye + " Lihat Pertanyaan Angket</button>" +
    '<button class="btn btn-light btn-sm" data-action="pfFormCopyTemplate">' + ICON.copy + " Salin Pertanyaan</button></div></div>";

  body += '<div class="form-grid mt-16">' +
    '<div class="field full"><label>Tautan Google Sheet respons</label><input type="text" id="pfSheetUrl" value="' + esc(pfFormCfg.sheet) + '" placeholder="https://docs.google.com/spreadsheets/d/...../edit#gid=0"></div>' +
    '<div class="field"><label>Nama sheet <span class="hint">(opsional)</span></label><input type="text" id="pfSheetName" value="' + esc(pfFormCfg.sheetName) + '" placeholder="Form Responses 1"></div>' +
    '<div class="field full"><label>Otomatis</label><label style="display:flex;gap:9px;align-items:flex-start;font-size:13px;color:#334155;padding-top:2px;cursor:pointer"><input type="checkbox" id="pfAutoTarik"' + (pfFormCfg.auto ? " checked" : "") + '><span>Tarik respons otomatis setiap membuka halaman <b>Profil Murid</b> (link tersimpan di browser ini).</span></label></div>' +
    '<div class="field"><label>Cara lain</label><div class="q-actions" style="justify-content:flex-start;margin:0">' +
    '<button class="btn btn-light btn-sm" data-action="pfFormPaste">' + ICON.table + " Impor Tempelan</button>" +
    '<button class="btn btn-light btn-sm" data-action="pfFormFile">' + ICON.upload + " Pilih CSV</button></div></div>" +
    "</div>";
  body += '<div class="q-actions" style="justify-content:flex-start;margin-top:4px">' +
    '<button class="btn btn-primary btn-sm" data-action="pfFormPull">' + ICON.refresh + " Ambil Respons</button>" +
    '<span class="hint">Spreadsheet harus dibagikan \"Anyone with the link: Viewer\".</span></div>';
  body += '<div class="field mt-16"><label>Atau tempel tabel di sini <span class="hint">(copy dari Google Sheets / Excel, termasuk baris judul)</span></label>' +
    '<textarea id="pfTablePaste" placeholder="Nama Lengkap&#9;Kelas&#9;Nomor Absen&#9;..." style="min-height:110px;font-family:ui-monospace,Consolas,monospace;font-size:12px"></textarea></div>';
  body += '<input type="file" id="pfCsvFile" accept=".csv,.tsv,.txt" style="display:none">';
  body += '<div id="pfFormResult"></div>';

  openModal(
    '<div class="modal-head"><h3>Impor Angket dari Google Form</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Tutup</button></div>',
    { wide: true }
  );
  var fi = document.getElementById("pfCsvFile");
  if (fi) fi.onchange = function () { pfFormReadFile(this); };
  var ck = document.getElementById("pfAutoTarik");
  if (ck) ck.onchange = function () {
    pfFormCfg.auto = !!this.checked;
    pfFormPersist();
    toast("success", this.checked ? "Tarik otomatis aktif" : "Tarik otomatis nonaktif",
      this.checked ? "Respons akan ditarik sendiri saat halaman Profil Murid dibuka." : "Respons hanya ditarik saat tombol Ambil Respons diklik.");
  };
}

function pfFormTemplateModal() {
  openModal(
    '<div class="modal-head"><h3>Pertanyaan Angket untuk Google Form</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body"><div class="note note-info mb-16">' + ICON.info + "<div>Buat pertanyaan di Google Form sesuai penomoran, pilih jenis jawaban yang tertulis, dan <b>jangan ubah teks pertanyaan maupun pilihan</b> supaya hasilnya terbaca otomatis.</div></div>" +
    '<textarea readonly id="pfTpl" style="width:100%;min-height:320px;font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:1.6;padding:12px;border:1px solid var(--line);border-radius:10px">' + esc(pfAngketTemplateText()) + "</textarea></div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Tutup</button>' +
    '<button class="btn btn-primary" data-action="pfFormCopyTemplate">' + ICON.copy + " Salin Semua Pertanyaan</button></div>",
    { wide: true }
  );
}

function pfFormCopyTemplate() {
  pfFormCopy(pfAngketTemplateText(), "Pertanyaan disalin", "Tempel ke Google Form (jenis jawaban sudah tertulis di tiap nomor).");
}

function pfFormCopy(text, judul, pesan) {
  var viaTextarea = function () {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast("success", judul, pesan);
    } catch (e) { toast("error", "Gagal menyalin", "Browser tidak mengizinkan akses clipboard; salin manual dari kotaknya."); }
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("success", judul, pesan); }, viaTextarea);
      return;
    }
  } catch (e) { }
  viaTextarea();
}

/* ---------- tarik respons dari Google Sheet (JSONP gviz) ---------- */
function pfFormPull() {
  var url = pfVal("pfSheetUrl");
  if (!url && pfFormCfg.sheet) url = pfFormCfg.sheet;
  if (!url) { toast("warn", "Tautan kosong", "Tempel tautan Google Sheet respons terlebih dahulu."); return; }
  if (/\/forms\/|forms\.gle/.test(url)) {
    toast("warn", "Itu tautan Google Form", "Buka tab Respons -> Link to Sheets, lalu tempel tautan spreadsheet-nya.");
    return;
  }
  var sheetName = pfVal("pfSheetName");
  pfFormCfg.sheet = url;
  pfFormCfg.sheetName = sheetName;
  pfFormPersist();

  var box = document.getElementById("pfFormResult");
  if (box) box.innerHTML = '<div class="note note-info mt-16">' + ICON.refresh + "<div>Menarik respons dari Google Sheet&hellip; (beberapa detik)</div></div>";

  pfSheetPull(
    url,
    sheetName,
    function (parsed) { pfFormSetData(parsed, "Google Sheet"); },
    function (judul, pesan) { pfFormGagal(judul, pesan); }
  );
}

/* Tarik data dari Google Sheet via JSONP gviz (tanpa server sendiri).
   onData(parsed) dipanggil bila berhasil; onFail(judul, pesan) bila gagal. */
function pfSheetPull(url, sheetName, onData, onFail) {
  var m = String(url || "").match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!m) { onFail("Tautan tidak dikenali", "Tempel tautan dari Google Sheets (docs.google.com/spreadsheets/d/...)."); return; }
  var id = m[1];
  var gid = (String(url).match(/[#&?]gid=([0-9]+)/) || [])[1] || "";
  var cb = "adikPfForm" + Date.now().toString(36) + Math.floor(Math.random() * 100000);
  var sc = document.createElement("script");
  var selesai = false;
  var bersihkan = function () {
    try { delete window[cb]; } catch (e) { window[cb] = undefined; }
    if (sc.parentNode) sc.parentNode.removeChild(sc);
  };
  var timer = setTimeout(function () {
    if (selesai) return;
    selesai = true;
    bersihkan();
    onFail("Spreadsheet tidak dapat diakses", "Pastikan spreadsheet dibagikan <b>Anyone with the link &rarr; Viewer</b>, lalu klik Ambil Respons lagi. Jika tetap gagal, gunakan <b>Impor Tempelan</b> (copy tabel dari Google Sheets).");
  }, 20000);

  window[cb] = function (data) {
    if (selesai) return;
    selesai = true;
    clearTimeout(timer);
    bersihkan();
    var parsed = pfGvizParse(data);
    if (!parsed) { onFail("Respons tidak terbaca", "Format respons tidak dikenali. Coba <b>Impor Tempelan</b>."); return; }
    onData(parsed);
  };

  var q = "https://docs.google.com/spreadsheets/d/" + id + "/gviz/tq?tqx=out:json;responseHandler:" + cb + "&headers=1";
  if (gid) q += "&gid=" + gid;
  else if (sheetName) q += "&sheet=" + encodeURIComponent(sheetName);
  sc.src = q;
  sc.onerror = function () {
    if (selesai) return;
    selesai = true;
    clearTimeout(timer);
    bersihkan();
    onFail("Gagal menghubungi Google", "Periksa koneksi internet, lalu coba lagi. Alternatif: <b>Impor Tempelan</b> atau <b>Pilih CSV</b>.");
  };
  document.body.appendChild(sc);
}

/* Tarik otomatis sekali per sesi saat halaman Profil Murid dibuka. */
function pfFormAutoPull() {
  if (!pfFormCfg.auto || !pfFormCfg.sheet) return;
  if (state.pfAutoBusy || state.pfAutoDone) return;
  if (document.querySelector("#modalRoot .modal-body")) return;
  state.pfAutoBusy = true;
  pfSheetPull(
    pfFormCfg.sheet,
    pfFormCfg.sheetName,
    function (parsed) {
      state.pfAutoBusy = false;
      state.pfAutoDone = true;
      var map = pfFormMapBuild(parsed.headers, parsed.rows, "Google Sheet (otomatis)");
      if (!map.list.length) return;
      state.pfFormMap = map;
      pfFormImportModal();
      setTimeout(function () {
        pfFormPreview();
        var box = document.getElementById("pfFormResult");
        if (!box) return;
        var f = document.createElement("div");
        f.className = "note note-info mt-16";
        f.innerHTML = ICON.sparkles + "<div><b>" + map.list.length + " respons terbaca otomatis</b> dari Google Sheet. Periksa daftar di bawah, lalu klik <b>Terapkan ke Profil Murid</b>.</div>";
        box.insertBefore(f, box.firstChild);
      }, 80);
    },
    function () { state.pfAutoBusy = false; state.pfAutoDone = true; }
  );
}

function pfFormGagal(judul, pesan) {
  var box = document.getElementById("pfFormResult");
  if (box) box.innerHTML = '<div class="note note-warn mt-16">' + ICON.alert + "<div><strong>" + judul + "</strong>" + pesan + "</div></div>";
}

function pfGvizParse(data) {
  if (!data) return null;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch (e) { return null; } }
  if (data.status === "error") return null;
  var t = data.table;
  if (!t) return null;
  var headers = (t.cols || []).map(function (c) { return String((c && (c.label || c.id)) || "").trim(); });
  var rows = (t.rows || []).map(function (r) {
    return (r.c || []).map(function (c) {
      if (!c) return "";
      if (c.v === null || c.v === undefined) return (c.f === null || c.f === undefined) ? "" : String(c.f);
      return String(c.v);
    });
  });
  return { headers: headers, rows: rows };
}

/* ---------- tempelan / berkas CSV ---------- */
function pfFormPaste() {
  var ta = document.getElementById("pfTablePaste");
  var txt = ta ? ta.value : "";
  if (!String(txt).trim()) { toast("warn", "Belum ada tempelan", "Copy dulu sel tabel dari Google Sheets, lalu tempel di kotak."); return; }
  var parsed = pfFormParseText(txt);
  if (!parsed) { pfFormGagal("Data tidak terbaca", "Pastikan baris pertama adalah judul kolom dan ada minimal satu baris data."); return; }
  pfFormSetData(parsed, "Tempelan tabel");
}

function pfFormFile() {
  var fi = document.getElementById("pfCsvFile");
  if (fi) fi.click();
}

function pfFormReadFile(input) {
  var f = input && input.files && input.files[0];
  if (!f) return;
  var fr = new FileReader();
  fr.onload = function () {
    var parsed = pfFormParseText(fr.result);
    if (!parsed) { pfFormGagal("Berkas tidak terbaca", "Pastikan baris pertama berisi judul kolom dan ada data di bawahnya."); return; }
    pfFormSetData(parsed, f.name);
  };
  fr.onerror = function () { pfFormGagal("Gagal membaca berkas", "Coba simpan ulang sebagai CSV lalu pilih lagi."); };
  fr.readAsText(f, "utf-8");
  input.value = "";
}

function pfFormSplitLine(line, delim) {
  var out = [], cur = "", q = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line.charAt(i);
    if (q) {
      if (ch === '"') { if (line.charAt(i + 1) === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === delim) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(function (x) { return String(x).trim(); });
}

function pfFormParseText(text) {
  text = String(text || "").replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "").trim();
  if (!text) return null;
  var lines = text.split("\n").filter(function (l) { return l.trim() !== ""; });
  if (lines.length < 2) return null;
  var head = lines[0];
  var delim = head.indexOf("\t") >= 0 ? "\t" : (head.split(";").length > head.split(",").length ? ";" : ",");
  var rows = lines.map(function (l) { return pfFormSplitLine(l, delim); });
  var headers = rows.shift();
  var width = headers.length;
  rows = rows.map(function (r) { while (r.length < width) r.push(""); return r.slice(0, width); });
  return { headers: headers, rows: rows };
}

/* ---------- pemetaan kolom -> field profil ---------- */
function pfMatchAngket(header) {
  var h = pfNorm(header);
  if (!h) return -1;
  for (var i = 0; i < PF_ANGKET.length; i++) {
    var q = pfNorm(PF_ANGKET[i].q);
    if (!q) continue;
    if (h === q || h.indexOf(q) >= 0) return i;
    if (q.length > 25 && h.indexOf(q.slice(0, 25)) >= 0) return i;
  }
  return -1;
}

function pfAnsVAK(item, val) {
  if (!item) return "";
  var t = pfNorm(val);
  if (!t) return "";
  var v = pfNorm(item.v), a = pfNorm(item.a), k = pfNorm(item.k);
  if (v && (t === v || t.indexOf(v) >= 0)) return "v";
  if (a && (t === a || t.indexOf(a) >= 0)) return "a";
  if (k && (t === k || t.indexOf(k) >= 0)) return "k";
  if (/melihat|gambar|video|foto|visual|membayangkan|mindmap|warna|diagram|poster|infografis/.test(text2(t))) return "v";
  if (/mendengar|penjelasan|diskusi|lisan|menyebut|kata|arahan|podcast|wawancara/.test(text2(t))) return "a";
  if (/mencoba|memasak|praktik|gerakan|bergerak|memegang|memperagakan|melakukan|unjuk/.test(text2(t))) return "k";
  return "";
}
function text2(t) { return String(t || "").toLowerCase(); }

function pfPilihan(list, val) {
  var t = pfNorm(val);
  if (!t) return "";
  for (var i = 0; i < list.length; i++) {
    var L = pfNorm(list[i].l), V = pfNorm(list[i].v);
    if (t === L || t === V || t.indexOf(L) >= 0 || (t.length > 3 && L.indexOf(t) >= 0)) return list[i].v;
  }
  if (list === PF_KERJA) {
    if (t.indexOf("sendiri") >= 0 || t.indexOf("mandiri") >= 0 || t.indexOf("individu") >= 0) return "individu";
    if (t.indexOf("pasang") >= 0 || t.indexOf("duaorang") >= 0) return "berpasangan";
    if (t.indexOf("kelompok") >= 0 || t.indexOf("tim") >= 0) return "kelompok";
  }
  if (list === PF_RITME) {
    if (t.indexOf("cepat") >= 0) return "cepat";
    if (t.indexOf("lambat") >= 0 || t.indexOf("bertahap") >= 0 || t.indexOf("perlahan") >= 0) return "bertahap";
    if (t.indexOf("sedang") >= 0 || t.indexOf("biasa") >= 0) return "sedang";
  }
  if (list === PF_PRODUK) {
    if (t.indexOf("tulis") >= 0 || t.indexOf("laporan") >= 0 || t.indexOf("makalah") >= 0) return "tulis";
    if (t.indexOf("lisan") >= 0 || t.indexOf("presentasi") >= 0 || t.indexOf("bicara") >= 0) return "lisan";
    if (t.indexOf("visual") >= 0 || t.indexOf("poster") >= 0 || t.indexOf("video") >= 0 || t.indexOf("infografis") >= 0) return "visual";
    if (t.indexOf("praktik") >= 0 || t.indexOf("unjuk") >= 0 || t.indexOf("produk") >= 0) return "praktik";
  }
  return "";
}

function pfGayaText(val) {
  var t = pfNorm(val);
  if (!t) return "";
  if (t.indexOf("campur") >= 0 || t.indexOf("mixed") >= 0) return "campuran";
  if (t.indexOf("visual") >= 0 || t.indexOf("melihat") >= 0) return "visual";
  if (t.indexOf("auditori") >= 0 || t.indexOf("auditor") >= 0 || t.indexOf("mendengar") >= 0) return "auditori";
  if (t.indexOf("kinestetik") >= 0 || t.indexOf("gerak") >= 0 || t.indexOf("praktik") >= 0) return "kinestetik";
  return "";
}

function pfKesiapanText(val) {
  var t = pfNorm(val);
  if (!t) return "";
  if (t.indexOf("dasar") >= 0 || t.indexOf("penguatan") >= 0 || t.indexOf("kurang") >= 0 || t.indexOf("rendah") >= 0 || t.indexOf("bawah") >= 0) return "dasar";
  if (t.indexOf("mahir") >= 0 || t.indexOf("pengayaan") >= 0 || t.indexOf("tinggi") >= 0 || t.indexOf("atas") >= 0) return "mahir";
  if (t.indexOf("cakap") >= 0 || t.indexOf("berkembang") >= 0 || t.indexOf("sedang") >= 0) return "cakap";
  return "";
}

function pfKelasBersih(v) {
  var raw = String(v || "").trim();
  var t = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  var m = t.match(/^(XII|XI|X)/) || t.match(/(XII|XI|X)/);
  if (m) return m[1];
  return raw.slice(0, 12);
}

function pfMinatCell(v) {
  var s = String(v || "").trim();
  if (!s) return [];
  var ns = pfNorm(s);
  var out = [];
  PF_MINAT.forEach(function (m) {
    if (ns.indexOf(pfNorm(m)) >= 0) out.push(m);
  });
  if (out.length) return out;
  String(s).split(/[;,|]/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (p) {
    var n = pfNorm(p);
    for (var j = 0; j < PF_MINAT.length; j++) {
      var k = pfNorm(PF_MINAT[j]);
      if (n && (n.indexOf(k) >= 0 || k.indexOf(n) >= 0)) { out.push(PF_MINAT[j]); return; }
    }
    out.push(p);
  });
  return pfUnique(out);
}

function pfFormMapBuild(headers, rows, sumber) {
  var map = { sumber: sumber || "", headers: headers || [], kolom: {}, angket: {}, list: [], cacat: [], baris: (rows || []).length };
  var idx = function (tests) {
    for (var i = 0; i < headers.length; i++) {
      var h = pfNorm(headers[i]);
      if (!h) continue;
      for (var j = 0; j < tests.length; j++) if (h.indexOf(tests[j]) >= 0) return i;
    }
    return -1;
  };
  map.kolom.nama = idx(["namalengkap", "namamurid", "namasiswa", "nama"]);
  map.kolom.kelas = idx(["kelas"]);
  map.kolom.absen = idx(["absen", "nomorabsen", "noabsen"]);
  map.kolom.minat = idx(["minat"]);
  map.kolom.kesiapan = idx(["kesiapan"]);
  map.kolom.skor = idx(["nilaibenar", "jumlahbenar", "jawabanbenar", "benar", "nilai", "skor", "score"]);
  map.kolom.gaya = idx(["gayabelajar", "gaya"]);
  map.kolom.kerja = idx(["carakerja", "belajarbareng", "bekerjasama"]);
  map.kolom.ritme = idx(["ritme", "kecepatanbelajar", "kecepatan"]);
  map.kolom.produk = idx(["produk"]);
  map.kolom.catatan = idx(["catatan", "saran", "pesan"]);

  if (map.kolom.nama < 0) map.cacat.push("Kolom nama tidak ditemukan. Pastikan Google Form menanyakan \"Nama Lengkap\".");
  if (map.kolom.kelas < 0) map.cacat.push("Kolom kelas tidak ditemukan (boleh dilanjut, pilih Kelas default saat menerapkan).");

  headers.forEach(function (h, i) {
    var k = pfMatchAngket(h);
    if (k >= 0 && map.angket[k] === undefined) map.angket[k] = i;
  });
  if (!Object.keys(map.angket).length && map.kolom.gaya < 0) map.cacat.push("Kolom jawaban gaya belajar tidak ditemukan. Pastikan pertanyaan angket disalin persis dari template.");

  rows.forEach(function (r) {
    var nama = map.kolom.nama >= 0 ? String(r[map.kolom.nama] || "").trim() : "";
    if (!nama) return;
    var nn = pfNorm(nama);
    if (nn === "namalengkap" || nn === "nama") return;
    var m = {
      nama: nama,
      kelas: map.kolom.kelas >= 0 ? pfKelasBersih(r[map.kolom.kelas]) : "",
      absen: map.kolom.absen >= 0 ? String(r[map.kolom.absen] || "").trim() : "",
      minat: map.kolom.minat >= 0 ? pfMinatCell(r[map.kolom.minat]) : [],
      gaya: map.kolom.gaya >= 0 ? pfGayaText(r[map.kolom.gaya]) : "",
      gayaSkor: null,
      kesiapan: "",
      kesiapanSumber: "",
      kerja: map.kolom.kerja >= 0 ? pfPilihan(PF_KERJA, r[map.kolom.kerja]) : "",
      ritme: map.kolom.ritme >= 0 ? pfPilihan(PF_RITME, r[map.kolom.ritme]) : "",
      produk: map.kolom.produk >= 0 ? pfPilihan(PF_PRODUK, r[map.kolom.produk]) : "",
      catatan: map.kolom.catatan >= 0 ? String(r[map.kolom.catatan] || "").trim() : ""
    };

    var jml = Object.keys(map.angket).length;
    if (jml) {
      var sc = { v: 0, a: 0, k: 0 }, n = 0;
      Object.keys(map.angket).forEach(function (q) {
        var v = pfAnsVAK(PF_ANGKET[parseInt(q, 10)], r[map.angket[q]]);
        if (v) { sc[v]++; n++; }
      });
      if (n >= 6) {
        var arr = [["visual", sc.v], ["auditori", sc.a], ["kinestetik", sc.k]].sort(function (x, y) { return y[1] - x[1]; });
        m.gayaSkor = sc;
        m.gaya = (arr[0][1] - arr[1][1] <= 1) ? "campuran" : arr[0][0];
        m.gayaSumber = "Angket Google Form (" + n + "/" + PF_ANGKET.length + " nomor)";
      } else if (n > 0) {
        m.gayaSkor = sc;
        m.catatan = (m.catatan ? m.catatan + "\n" : "") + "Angket baru terisi " + n + " dari " + PF_ANGKET.length + " nomor.";
      }
    }

    if (map.kolom.kesiapan >= 0) {
      var lv = pfKesiapanText(r[map.kolom.kesiapan]);
      if (lv) { m.kesiapan = lv; m.kesiapanSumber = "Dari angket Google Form"; }
    }
    if (!m.kesiapan && map.kolom.skor >= 0) {
      var num = parseFloat(String(r[map.kolom.skor] || "").replace(/[^0-9.,]/g, "").replace(",", "."));
      if (!isNaN(num)) {
        var pct = num > 100 ? Math.min(100, num) : num;
        m.kesiapan = pct >= 80 ? "mahir" : pct >= 60 ? "cakap" : "dasar";
        m.kesiapanSumber = "Dari nilai angket (" + Math.round(pct) + "%)";
      }
    }
    map.list.push(m);
  });
  return map;
}

function pfFindByName(nama, kelas) {
  for (var i = 0; i < profil.length; i++) {
    if (pfNorm(profil[i].nama) !== pfNorm(nama)) continue;
    if (kelas && profil[i].kelas && profil[i].kelas !== kelas) continue;
    return profil[i];
  }
  return null;
}

function pfOptChecked(id, def) {
  var e = document.getElementById(id);
  return e ? !!e.checked : def;
}

/* ---------- pratinjau & terapkan ---------- */
function pfFormSetData(parsed, sumber) {
  var map = pfFormMapBuild(parsed.headers, parsed.rows, sumber);
  state.pfFormMap = map;
  pfFormPreview();
}

function pfFormPreview() {
  var box = document.getElementById("pfFormResult");
  if (!box) return;
  var m = state.pfFormMap;
  if (!m) { box.innerHTML = ""; return; }
  var h = '<div style="margin-top:18px;border-top:1px solid var(--line);padding-top:14px">';
  if (!m.list.length) {
    m.cacat.forEach(function (c) { h += '<div class="note note-warn mt-16">' + ICON.alert + "<div>" + esc(c) + "</div></div>"; });
    box.innerHTML = h + "</div>";
    return;
  }
  var upd = 0, add = 0;
  m.list.forEach(function (r) { if (pfFindByName(r.nama, r.kelas)) upd++; else add++; });
  h += '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline">' +
    '<h3 style="font-size:14px;margin:0">Hasil pemetaan</h3>' +
    '<span style="font-size:12px;color:var(--muted)">Sumber: ' + esc(m.sumber || "-") + " &bull; " + (m.baris || 0) + " baris dibaca</span></div>";
  h += '<div class="note note-info mt-16">' + ICON.check + "<div><b>" + m.list.length + "</b> murid terbaca &bull; " + upd + " akan diperbarui &bull; " + add + " murid baru.";
  if (m.kolom.nama >= 0) h += '<div style="font-size:12px;color:var(--muted);margin-top:4px">Kolom terpakai: nama &ldquo;' + esc(m.headers[m.kolom.nama]) + "&rdquo;" + (m.kolom.kelas >= 0 ? ', kelas &ldquo;' + esc(m.headers[m.kolom.kelas]) + "&rdquo;" : "") + (Object.keys(m.angket).length ? ", angket " + Object.keys(m.angket).length + " nomor" : "") + "</div>";
  h += "</div></div>";
  m.cacat.forEach(function (c) { h += '<div class="note note-warn mt-16">' + ICON.alert + "<div>" + esc(c) + "</div></div>"; });

  h += '<div class="table-wrap" style="margin-top:12px"><table class="tbl"><thead><tr><th>Nama</th><th>Kelas</th><th>Gaya</th><th>Kesiapan</th><th>Minat</th><th>Status</th></tr></thead><tbody>';
  m.list.slice(0, 10).forEach(function (r) {
    var ex = pfFindByName(r.nama, r.kelas);
    h += "<tr><td><strong>" + esc(r.nama) + "</strong>" + (r.absen ? ' <span class="badge badge-slate">' + esc(r.absen) + "</span>" : "") + "</td>" +
      "<td>" + esc(r.kelas || "-") + "</td><td>" + pfGayaBadge(r.gaya) + "</td><td>" + pfKesiapanBadge(r.kesiapan) + "</td>" +
      "<td>" + esc((r.minat || []).join(", ") || "-") + "</td>" +
      '<td><span class="badge ' + (ex ? "badge-blue" : "badge-green") + '">' + (ex ? "Perbarui" : "Murid baru") + "</span></td></tr>";
  });
  h += "</tbody></table></div>";
  if (m.list.length > 10) h += '<p style="font-size:12px;color:var(--muted);margin-top:6px">' + (m.list.length - 10) + " murid lainnya tidak ditampilkan (tetap akan diimpor).</p>";

  var kelasKosong = m.list.some(function (r) { return !r.kelas; });
  h += '<div class="form-grid" style="margin-top:14px">';
  if (kelasKosong) h += '<div class="field"><label>Kelas default <span class="hint">(untuk baris tanpa kelas)</span></label><select id="pfApplyKelas"><option value="">Pilih kelas</option>' + optSelect(KELAS_BOGA, "") + "</select></div>";
  h += '<div class="field"><label>Opsi impor</label><div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;padding-top:6px">' +
    '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="pfOptUpdate" checked> Perbarui murid yang sudah ada</label>' +
    '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="pfOptAdd" checked> Tambahkan murid baru</label></div></div>';
  h += "</div>";
  h += '<div class="q-actions" style="justify-content:flex-end;margin-top:14px"><button class="btn btn-primary" data-action="pfFormApply">' + ICON.check + " Terapkan ke Profil Murid</button></div>";
  h += "</div>";
  box.innerHTML = h;
}

function pfFormApply() {
  var m = state.pfFormMap;
  if (!m || !m.list.length) { toast("warn", "Belum ada data", "Ambil respons atau tempel tabel terlebih dahulu."); return; }
  var mauUpdate = pfOptChecked("pfOptUpdate", true);
  var mauTambah = pfOptChecked("pfOptAdd", true);
  var defKelas = pfVal("pfApplyKelas");
  var nUpd = 0, nAdd = 0, nSkip = 0, nTanpaKelas = 0;
  m.list.forEach(function (r) {
    var target = pfFindByName(r.nama, r.kelas);
    if (target) {
      if (!mauUpdate) { nSkip++; return; }
      if (r.gaya) { target.gaya = r.gaya; if (r.gayaSkor) target.gayaSkor = r.gayaSkor; }
      if (r.kesiapan) { target.kesiapan = r.kesiapan; if (r.kesiapanSumber) target.kesiapanSumber = r.kesiapanSumber; }
      if (r.minat && r.minat.length) target.minat = pfUnique((target.minat || []).concat(r.minat));
      if (r.absen && !target.absen) target.absen = r.absen;
      if (r.kelas && !target.kelas) target.kelas = r.kelas;
      if (r.kerja && !target.kerja) target.kerja = r.kerja;
      if (r.ritme && !target.ritme) target.ritme = r.ritme;
      if (r.produk && !target.produk) target.produk = r.produk;
      if (r.catatan) target.catatan = (target.catatan ? target.catatan + "\n" : "") + r.catatan;
      target.updatedAt = new Date().toISOString();
      nUpd++;
      return;
    }
    if (!mauTambah) { nSkip++; return; }
    var kelas = r.kelas || defKelas || "";
    if (!kelas) nTanpaKelas++;
    profil.push({
      id: uid(), nama: r.nama, kelas: kelas, absen: r.absen || "",
      kesiapan: r.kesiapan || "", kesiapanSumber: r.kesiapanSumber || "",
      gaya: r.gaya || "", gayaSkor: r.gayaSkor || null,
      minat: r.minat || [], kerja: r.kerja || "", ritme: r.ritme || "", produk: r.produk || "",
      dukungan: [], catatan: r.catatan || "",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    nAdd++;
  });
  profilPersist();
  state.profilGroups = null;
  state.pfFormMap = null;
  closeModal();
  state.profilTab = "daftar";
  render();
  var msg = nUpd + " diperbarui, " + nAdd + " ditambahkan";
  if (nSkip) msg += ", " + nSkip + " dilewati";
  toast("success", "Impor angket selesai", msg + "." + (nTanpaKelas ? " " + nTanpaKelas + " murid belum punya kelas, lengkapi kelasnya." : ""));
}

/* =====================================================================
   PEMETAAN SOAL KE KEBUTUHAN MURID
   Menjembatani hasil profiling dengan soal yang akan diberikan:
   1) Tiap soal dinilai kesesuaiannya terhadap tiga tingkat kebutuhan
      (Perlu Penguatan, Sedang, Siap Pengayaan) memakai tingkat kesulitan,
      level kognitif, dan bentuk soal.
   2) Soal dikelompokkan ke tingkat yang paling sesuai, lalu setiap
      kelompok memperoleh paket soal sendiri (tautan/QR, file HTML, atau
      salinan teks untuk lembar kerja).
   3) Catatan media disesuaikan dengan gaya belajar terbanyak di kelompok.
   ===================================================================== */
state.pfSoalMap = null;
state.pfPkgReg = state.pfPkgReg || {};

var PF_TINGKAT = [
  { v: "dasar", l: "Perlu Penguatan", warna: "badge-amber", ket: "Butuh scaffolding dan langkah bertahap" },
  { v: "cakap", l: "Sedang", warna: "badge-blue", ket: "Sesuai tujuan pembelajaran" },
  { v: "mahir", l: "Siap Pengayaan", warna: "badge-green", ket: "Perlu tantangan lanjutan" }
];

var PF_SOAL_FIT = {
  visual: { ket: "Tampilkan gambar, bagan, atau tabel; instruksi boleh dibacakan sambil menunjuk bagan.", cocok: function (q) { return !!q.image; } },
  auditori: { ket: "Bacakan instruksi, beri ruang diskusi atau jawaban lisan, dan minta murid menjelaskan ulang.", cocok: function (q) { return q.type === "uraian" || q.type === "isian" || q.type === "praktik"; } },
  kinestetik: { ket: "Sediakan stasiun praktik; utamakan soal unjuk kerja atau studi kasus yang perlu simulasi.", cocok: function (q) { return q.type === "praktik" || q.type === "uraian" || q.type === "menjodohkan"; } },
  campuran: { ket: "Padukan gambar, penjelasan lisan, dan praktik, lalu beri pilihan cara menunjukkan pemahaman.", cocok: function () { return true; } }
};

function pfTingkatLabel(v) { return pfLabel(PF_TINGKAT, v); }

function pfSumberSoal() {
  var out = [];
  if (bank.length) out.push({ v: "bank", id: "bank", l: "Bank Soal \u2014 " + bank.length + " soal", soal: bank, meta: null });
  assessments.forEach(function (a) {
    var m = a.meta || {};
    out.push({
      v: "a:" + a.id, id: a.id, soal: a.questions, meta: m,
      l: (m.judul || "Asesmen") + " \u2014 " + a.questions.length + " soal" + (m.kelas ? " \u2014 kelas " + m.kelas : "")
    });
  });
  return out;
}

/* Sumber yang tercentang pada modal pemetaan. Boleh lebih dari satu
   (mis. seri 10 soal mudah + 10 sedang + 10 sulit) untuk digabung menjadi
   satu tautan kelas. */
function pfSrcTerpilih() {
  var list = pfSumberSoal(), out = [];
  var els = document.querySelectorAll(".pfmSrc:checked");
  Array.prototype.forEach.call(els, function (e) {
    for (var i = 0; i < list.length; i++) if (list[i].v === e.value) { out.push(list[i]); return; }
  });
  return out;
}

/* Tombol "Pilih semua" / "Kosongkan" pada daftar sumber soal. */
function pfSrcPilih(semua) {
  var els = document.querySelectorAll("#pfmSrcBox .pfmSrc");
  Array.prototype.forEach.call(els, function (e) {
    e.checked = !!semua;
    e.parentNode.classList.toggle("checked", !!semua);
  });
  pfSrcHitung();
}

/* Ringkasan live: berapa sumber dan berapa soal yang akan digabung. */
function pfSrcHitung() {
  var el = document.getElementById("pfmSrcTotal");
  if (!el) return;
  var dipilih = pfSrcTerpilih(), n = 0;
  dipilih.forEach(function (s) { n += (s.soal || []).length; });
  el.textContent = dipilih.length
    ? "Terpilih: " + dipilih.length + " sumber, " + n + " soal" + (dipilih.length > 1 ? " (digabung jadi satu tautan)" : "")
    : "Belum ada sumber dipilih";
}

/* Gabungkan beberapa sumber menjadi satu objek sumber: id untuk paket,
   label untuk laporan, dan meta (kop/materi) dari asesmen pertama. */
function pfGabungSumber(dipilih, soal) {
  if (dipilih.length === 1) return dipilih[0];
  var juduls = dipilih.map(function (s) {
    return s.v === "bank" ? "Bank Soal" : (String((s.meta && s.meta.judul) || "").trim() || "Asesmen");
  });
  var unik = juduls.filter(function (j, i) { return juduls.indexOf(j) === i; });
  var nama = unik.length === 1
    ? unik[0] + " (" + dipilih.length + " bagian)"
    : unik.slice(0, 3).join(" + ") + (unik.length > 3 ? " +" + (unik.length - 3) + " lainnya" : "");
  var berMeta = dipilih.filter(function (s) { return !!s.meta; });
  var meta = null;
  if (berMeta.length) {
    meta = {};
    Object.keys(berMeta[0].meta).forEach(function (k) { meta[k] = berMeta[0].meta[k]; });
    meta.judul = nama;
  }
  return {
    v: dipilih.map(function (s) { return s.v; }).join("|"),
    id: "multi" + dipilih.map(function (s) { return String(s.id || ""); }).join(""),
    l: nama + " \u2014 " + soal.length + " soal (" + dipilih.length + " sumber)",
    soal: soal, meta: meta
  };
}

/* Skor kesesuaian satu soal terhadap satu tingkat kebutuhan. */
function pfSkorSoal(q, level) {
  var sg = pfSaranAsesmen(level);
  var urut = ["mudah", "sedang", "sulit"];
  var d = urut.indexOf(String(q.difficulty || ""));
  var t = urut.indexOf(String(sg.kesulitan || ""));
  var beda = (d < 0 || t < 0) ? 2 : Math.abs(d - t);
  var skor = beda === 0 ? 6 : (beda === 1 ? 2 : 0);
  var k = parseInt(String(q.cognitive || "").replace(/[^0-9]/g, ""), 10);
  var terbaik = 0;
  if (k) (sg.cognitive || []).forEach(function (c) {
    var tc = parseInt(String(c).replace(/[^0-9]/g, ""), 10);
    var bedaC = Math.abs(k - tc);
    var s = bedaC === 0 ? 3 : (bedaC === 1 ? 1 : 0);
    if (s > terbaik) terbaik = s;
  });
  skor += terbaik;
  if ((sg.bentukList || []).indexOf(q.type) >= 0) skor += 1;
  return skor;
}

/* Tingkat dengan skor tertinggi; bila seri, dipilih tingkat tengah (Sedang). */
function pfTingkatSoalSkor(q) {
  var urut = ["cakap", "dasar", "mahir"];
  var pilih = "cakap", tertinggi = -1;
  urut.forEach(function (lv) {
    var s = pfSkorSoal(q, lv);
    if (s > tertinggi) { tertinggi = s; pilih = lv; }
  });
  return pilih;
}

/* Soal berlabel tingkat tinggi: kesulitan "sulit" atau level kognitif C4-C6. */
function pfSoalTinggi(q) {
  var d = String((q && q.difficulty) || "").toLowerCase();
  var k = parseInt(String((q && q.cognitive) || "").replace(/[^0-9]/g, ""), 10) || 0;
  return d === "sulit" || k >= 4;
}

/* Tingkat akhir soal + PAGAR KEAMANAN:
   soal berlabel sulit / C4-C6 DIKUNCI hanya untuk paket "Siap Pengayaan" (mahir),
   sehingga murid tingkat bawah maupun tengah tidak mungkin menerima soal tingkat mahir. */
function pfTingkatSoal(q) {
  if (pfSoalTinggi(q)) return "mahir";
  return pfTingkatSoalSkor(q);
}

/* Soal yang "dikunci" pagar keamanan: berlabel tinggi, padahal skor kesesuaiannya
   condong ke tingkat bawah (indikasi label soal perlu diperiksa). */
function pfSoalDipagar(q) {
  return pfSoalTinggi(q) && pfTingkatSoalSkor(q) !== "mahir";
}

/* Ambil sejumlah soal dari satu kumpulan. Soal diambil merata (indeks
   berselang) supaya semua bagian materi terwakili. Bila daftar "aman"
   diberikan, soal di luar daftar itu hanya dipakai sebagai cadangan terakhir. */
function batasiSoal(daftar, batas, aman) {
  var arr = (daftar || []).slice();
  if (!batas || arr.length <= batas) return arr;
  var boleh = {};
  (aman || []).forEach(function (q) { boleh[q.id] = 1; });
  var utama = [], cadangan = [];
  arr.forEach(function (q) { (boleh[q.id] ? utama : cadangan).push(q); });
  if (!aman || !aman.length) utama = arr.slice(), cadangan = [];
  return utama.slice(0, batas).concat(cadangan.slice(0, Math.max(0, batas - utama.length)));
}

function pfMuridKelas() {
  var f = state.filter.profil;
  return profil.filter(function (s) { return !f.kelas || s.kelas === f.kelas; });
}

function pfGayaTerbanyak(members) {
  var c = {};
  (members || []).forEach(function (s) { if (s.gaya) c[s.gaya] = (c[s.gaya] || 0) + 1; });
  var best = "", n = 0;
  Object.keys(c).forEach(function (k) { if (c[k] > n) { n = c[k]; best = k; } });
  return best || "campuran";
}

function pfMinatTerbanyak(members) {
  var c = {};
  (members || []).forEach(function (s) {
    (s.minat || []).forEach(function (mi) { c[mi] = (c[mi] || 0) + 1; });
  });
  var best = "", n = 0;
  Object.keys(c).forEach(function (k) { if (c[k] > n) { n = c[k]; best = k; } });
  return best;
}

function pfNomorSoal(qs) {
  if (!qs || !qs.length) return "belum ada";
  return qs.map(function (q) { return q.no; }).join(", ");
}

function pfNamaRingkas(members, maks) {
  maks = parseInt(maks, 10) || 22;
  var nm = (members || []).map(function (s) { return (s && s.nama) ? s.nama : String(s || ""); });
  if (!nm.length) return "";
  if (nm.length <= maks) return nm.join(", ");
  return nm.slice(0, maks).join(", ") + ", +" + (nm.length - maks) + " lainnya";
}

/* Paket soal sebagai asesmen sementara, supaya bisa dibagikan/diunduh
   memakai jalur yang sudah ada (tautan, QR, file HTML). */
function pfPaketMeta(srcMeta, nama, n) {
  var kunci = ["namaGuru", "sekolah", "jenjang", "kelas", "semester", "tahun", "mapel", "jenis", "tanggal",
    "alokasi", "kopAktif", "kopDinas", "sekolahAlamat", "sekolahKontak", "sekolahLogo", "sekolahLogo2",
    "materiPokok", "submateri", "cp", "tujuan", "materi", "bentuk", "bentukList", "tampilkanSkor",
    "kesulitan", "cognitive", "kisiKisi", "kunci", "pembahasan", "rubrik"];
  var m = {};
  kunci.forEach(function (k) { if (srcMeta && srcMeta[k] !== undefined && srcMeta[k] !== null) m[k] = srcMeta[k]; });
  if (!m.bentukList || !m.bentukList.length) m.bentukList = ["pg"];
  m.bentuk = m.bentukList[0];
  m.acak = false;
  m.judul = ((srcMeta && srcMeta.judul) || "Asesmen") + " \u2014 " + nama;
  m.instruksi = (m.instruksi ? String(m.instruksi) + "\n" : "") + "Kerjakan " + nama + " sesuai arahan guru.";
  m.jumlah = n;
  m.paket = nama;
  if (!m.durasi) m.durasi = "0";
  return m;
}

/* Pasang kunci akses pada paket per kelompok: hanya murid yang terdaftar di
   paket itu yang boleh masuk lewat tautan paket tersebut. Murid yang menulis
   nama dari paket lain akan ditolak di halaman Pesawat Tempur. */
function pfPasangKunciPaket(p, o) {
  o = o || {};
  var boleh = (p.anggota || []).map(function (s) { return s.nama; });
  var peta = {};
  var idsPaket = (p.pkg.questions || []).map(function (q) { return q.id; });
  boleh.forEach(function (nama) {
    peta[pfNorm(nama)] = { nama: nama, lv: p.kode, ids: idsPaket.slice() };
  });
  p.pkg.meta.terkunci = true;
  p.pkg.meta.paketKode = o.kode || p.kode;
  p.pkg.meta.paketLabel = o.label || (p.level ? p.tingkat.l : p.nama);
  p.pkg.meta.paketAkses = Object.keys(peta).map(function (k) { return peta[k]; });
  p.pkg.meta.semuaIds = (p.pkg.questions || []).map(function (q) { return q.id; });
  if (o.safety && p.level) (p.pkg.questions || []).forEach(function (q) {
    if (pfSoalTinggi(q)) { q.aman = false; q.catatanTingkat = p.pkg.meta.paketLabel; }
  });
}

function pfPaketAssess(src, nama, kode, qs) {
  var pkg = {
    id: "pkg-" + String(src.id || "src").replace(/[^a-zA-Z0-9]/g, "") + "-" + kode,
    saved: false,
    createdAt: new Date().toISOString(),
    meta: pfPaketMeta(src.meta, nama, qs.length),
    questions: qs.map(function (q, i) {
      var n = {};
      Object.keys(q).forEach(function (k) { n[k] = q[k]; });
      n.id = "pkg" + kode + i + "-" + String(q.id || "q").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
      n.no = i + 1;
      return n;
    })
  };
  state.pfPkgReg[pkg.id] = pkg;
  return pkg;
}

/* Hitungan isi paket: jumlah mudah/sedang/sulit, rentang kognitif, dan jumlah soal tingkat tinggi. */
function pfPaketHitung(p) {
  var r = { mudah: 0, sedang: 0, sulit: 0, lain: 0, kmin: 9, kmax: 0, tinggi: 0, tanpaCog: 0 };
  (p.qs || []).forEach(function (q) {
    var v = String(q.difficulty || "").toLowerCase();
    if (r[v] != null) r[v]++; else r.lain++;
    var k = parseInt(String(q.cognitive || "").replace(/[^0-9]/g, ""), 10) || 0;
    if (k) { if (k < r.kmin) r.kmin = k; if (k > r.kmax) r.kmax = k; } else r.tanpaCog++;
    if (pfSoalTinggi(q)) r.tinggi++;
  });
  return r;
}

function pfPaketBagian(r) {
  var bagian = [];
  if (r.mudah) bagian.push(r.mudah + " mudah");
  if (r.sedang) bagian.push(r.sedang + " sedang");
  if (r.sulit) bagian.push(r.sulit + " sulit");
  if (r.lain) bagian.push(r.lain + " tanpa label kesulitan");
  return bagian;
}

/* Ringkasan isi paket (HTML) untuk kartu paket. */
function pfPaketIsi(p) {
  var r = pfPaketHitung(p), bagian = pfPaketBagian(r);
  var h = "<b>Isi paket:</b> " + (bagian.length ? bagian.join(", ") : "belum ada soal");
  if (r.kmin <= r.kmax) h += " &bull; kognitif C" + r.kmin + (r.kmax > r.kmin ? "\u2013C" + r.kmax : "");
  if (r.tanpaCog) h += " &bull; " + r.tanpaCog + " soal belum berlabel kognitif";
  if (!p.level) return h;
  if (p.kode === "dasar" && !r.tinggi) h += " &bull; <b>tidak ada soal sulit/C4-C6</b>";
  else if (p.kode === "cakap" && !r.tinggi) h += " &bull; tanpa soal sulit/C4-C6";
  return h;
}

/* Versi teks biasa untuk "Salin Pemetaan". */
function pfPaketIsiText(p) {
  var r = pfPaketHitung(p);
  var s = pfPaketBagian(r).join(", ") || "belum ada soal";
  if (r.kmin <= r.kmax) s += " (kognitif C" + r.kmin + (r.kmax > r.kmin ? "-C" + r.kmax : "") + ")";
  if (r.tanpaCog) s += ", " + r.tanpaCog + " soal belum berlabel kognitif";
  if (p.level && p.kode === "dasar" && !r.tinggi) s += " - bebas soal sulit/C4-C6";
  return s;
}

/* Pesan peringatan bila paket tingkat bawah memuat soal tingkat tinggi (harusnya tidak terjadi). */
function pfPaketPeriksa(p) {
  if (!p.level || p.kode === "mahir") return "";
  var bad = [];
  (p.qs || []).forEach(function (q, i) { if (pfSoalTinggi(q)) bad.push(i + 1); });
  if (!bad.length) return "";
  return "Paket ini memuat " + bad.length + " soal berlabel sulit/C4-C6 (nomor " + bad.join(", ") +
    "). Murid tingkat ini sebaiknya tidak menerima soal tersebut &mdash; perbaiki label soal lewat Edit Soal, lalu petakan ulang.";
}

function pfPaketCatatan(p, m) {
  var out = [];
  if (p.level) {
    if (p.kode === "dasar") out.push("Beri scaffolding: kerjakan contoh serupa lebih dulu, bacakan instruksi, dan sediakan lembar langkah kerja.");
    else if (p.kode === "cakap") out.push("Kerjakan mandiri atau berpasangan dengan bimbingan seperlunya.");
    else out.push("Berikan sebagai tantangan lanjutan; dapat dilanjutkan dengan peran tutor sebaya atau ketua tim.");
    if (m.inti && p.kode === "cakap") out.push("Paket ini menjadi capaian inti bersama seluruh kelas.");
    else if (p.adaInti) out.push("Termasuk soal inti (tingkat Sedang) agar capaian kompetensi dasar tetap terukur.");
  } else {
    out.push("Semua kelompok mengerjakan soal yang sama; yang dibedakan media, proses, dan bentuk bukti belajarnya.");
  }
  var g = pfGayaTerbanyak(p.anggota);
  var gl = pfLabel(PF_GAYA, g);
  out.push("Media & proses untuk kelompok ini (gaya terbanyak: " + gl + "). " + PF_SOAL_FIT[g].ket);
  var cocok = p.qs.filter(PF_SOAL_FIT[g].cocok);
  if (cocok.length) out.push("Soal yang paling cocok dengan gaya " + gl + ": no. " + pfNomorSoal(cocok) + ".");
  else out.push("Belum ada soal yang paling cocok dengan gaya " + gl + "; sesuaikan medianya (media dapat diganti tanpa mengubah soal).");
  var mi = pfMinatTerbanyak(p.anggota);
  if (mi) out.push("Kaitkan konteks soal dengan minat terbanyak kelompok: " + mi + ".");
  if (!p.anggota.length) out.push("Belum ada murid pada kelompok ini; paket tetap bisa dipakai saat kelompoknya terbentuk.");
  return out;
}

function pfNamaSiswa(mode, p, idx) {
  if (mode === "desk") return p.level ? p.tingkat.l : p.nama;
  if (mode === "misi") return p.level ? ({ dasar: "Paket Latihan", cakap: "Paket Utama", mahir: "Paket Tantangan" })[p.kode] : ("Tugas " + (idx + 1));
  return "Paket " + String.fromCharCode(65 + idx);
}

function pfSoalMapModal() {
  var srcs = pfSumberSoal();
  if (!srcs.length) {
    toast("warn", "Belum ada soal", "Buat asesmen lebih dulu, atau simpan soal ke Bank Soal, lalu petakan.");
    return;
  }
  var prev = state.pfSoalMap;
  var prevVals = (prev && prev.sumber && prev.sumber.v) ? String(prev.sumber.v).split("|") : [];
  if (!srcs.filter(function (s) { return prevVals.indexOf(s.v) >= 0; }).length) prevVals = srcs.length ? [srcs[0].v] : [];
  var opts = "";
  srcs.forEach(function (s) {
    var on = prevVals.indexOf(s.v) >= 0;
    opts += '<label class="chk' + (on ? " checked" : "") + '"><input type="checkbox" class="pfmSrc" value="' + esc(s.v) + '"' +
      (on ? " checked" : "") + ' onchange="this.parentNode.classList.toggle(\'checked\',this.checked);pfSrcHitung()"> ' + esc(s.l) + "</label>";
  });
  var basis = prev ? prev.basis : "kesiapan";
  var inti = prev ? !!prev.inti : true;
  var batas = (prev && prev.batas) ? String(prev.batas) : "";
  var namaMode = prev ? (prev.namaMode || "abc") : "abc";
  var body = '<div class="note note-info mb-16">' + ICON.layers + "<div><strong>Cara kerja pemetaan</strong>Setiap soal dinilai kesesuaiannya dengan tiga tingkat kebutuhan murid berdasarkan <b>tingkat kesulitan</b>, <b>level kognitif</b>, dan <b>bentuk soal</b>. Hasilnya: <b>satu tautan kelas</b> (soal menyesuaikan otomatis setelah murid menulis nama di halaman Pesawat Tempur) dan <b>paket per kelompok</b> bila ingin tautan terpisah tiap tingkat.<br><b>Banyak sumber:</b> centang beberapa asesmen sekaligus (misalnya seri 10 soal mudah + 10 sedang + 10 sulit) &mdash; semua soal digabung menjadi <b>satu tautan kelas</b> berisi 30 soal.<br><b>Pagar keamanan:</b> soal berlabel <b>sulit</b> atau <b>C4-C6</b> dikunci hanya untuk paket <b>Siap Pengayaan</b>, sehingga murid tingkat dasar tidak mungkin menerima soal tingkat mahir.</div></div>";
  body += '<div class="form-grid">' +
    '<div class="field full"><label>Sumber soal <span style="font-weight:400;color:var(--muted)">&mdash; boleh centang lebih dari satu</span></label>' +
    '<div id="pfmSrcBox" class="checks" style="max-height:168px;overflow:auto;padding:8px;border:1px solid var(--line);border-radius:10px">' + opts + "</div>" +
    '<div class="q-actions" style="justify-content:flex-start;margin:8px 0 0">' +
    '<button class="btn btn-light btn-sm" data-action="pfSrcAll">Pilih semua</button>' +
    '<button class="btn btn-light btn-sm" data-action="pfSrcNone">Kosongkan</button>' +
    '<span class="hint" id="pfmSrcTotal"></span></div></div>' +
    '<div class="field"><label>Dasar pengelompokan</label><select id="pfmBasis">' +
    '<option value="kesiapan"' + (basis === "kesiapan" ? " selected" : "") + ">Kesiapan belajar &mdash; soal bertingkat</option>" +
    '<option value="gaya"' + (basis === "gaya" ? " selected" : "") + ">Gaya belajar &mdash; media dan proses berbeda</option>" +
    "</select></div>" +
    '<div class="field"><label>Nama paket yang dilihat murid</label><select id="pfmNama">' +
    '<option value="abc"' + (namaMode === "abc" ? " selected" : "") + ">Paket A / B / C &mdash; netral (disarankan)</option>" +
    '<option value="misi"' + (namaMode === "misi" ? " selected" : "") + ">Latihan / Utama / Tantangan</option>" +
    '<option value="desk"' + (namaMode === "desk" ? " selected" : "") + ">Deskriptif (Perlu Penguatan / Sedang / Siap Pengayaan)</option>" +
    "</select></div>" +
    '<div class="field"><label>Soal inti bersama</label><label style="display:flex;gap:9px;align-items:flex-start;font-size:13px;color:#334155;padding-top:2px;cursor:pointer"><input type="checkbox" id="pfmInti"' + (inti ? " checked" : "") + '><span>Semua kelompok juga mengerjakan soal tingkat <b>Sedang</b> sebagai capaian inti bersama. <b>Hilangkan centang</b> bila ingin tiap murid hanya mengerjakan soal tingkatnya sendiri (misalnya 10 soal per murid).</span></label></div>' +
    '<div class="field"><label>Batasi jumlah soal per murid</label><select id="pfmBatas">' +
    '<option value="">Semua soal paketnya</option>' +
    ["5", "10", "15", "20"].map(function (n) {
      return '<option value="' + n + '"' + (batas === n ? " selected" : "") + ">" + n + " soal</option>";
    }).join("") +
    '</select><span class="hint">Menjaga permainan tetap singkat: bila paket murid memuat lebih banyak soal, soal dipilih otomatis dari tingkatnya.</span></div>' +
    "</div>";
  body += '<div class="q-actions" style="justify-content:flex-start;margin:0 0 4px">' +
    '<button class="btn btn-primary btn-sm" data-action="pfSoalMapRun">' + ICON.sparkles + " Petakan Soal</button>" +
    '<span class="hint">Murid diambil dari kelas <b>' + esc(state.filter.profil.kelas || "semua kelas") + "</b> yang sudah terdata.</span></div>";
  body += '<div id="pfmHasil" style="margin-top:14px"></div>';
  openModal(
    '<div class="modal-head"><h3>Pemetaan Soal ke Kebutuhan Murid</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Tutup</button></div>',
    { wide: true }
  );
  pfSrcHitung();
  if (state.pfSoalMap) pfSoalMapRender();
}

function pfSoalMapRun() {
  var dipilih = pfSrcTerpilih();
  if (!dipilih.length) { toast("warn", "Sumber soal belum dipilih", "Centang minimal satu asesmen atau Bank Soal."); return; }
  var soal = [], kembar = 0, sudahPunya = {};
  dipilih.forEach(function (s) {
    (s.soal || []).forEach(function (q) {
      var stem = String((q && q.stem) || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (dipilih.length > 1 && stem) {
        var kunci = String((q && q.type) || "") + "|" + stem;
        if (sudahPunya[kunci]) { kembar++; return; }
        sudahPunya[kunci] = 1;
      }
      var n = {};
      Object.keys(q).forEach(function (k) { n[k] = q[k]; });
      soal.push(n);
    });
  });
  soal.forEach(function (q, i) { q.no = i + 1; });
  if (!soal.length) { toast("warn", "Sumber soal kosong", "Pilih sumber soal lain yang sudah berisi soal."); return; }
  var src = pfGabungSumber(dipilih, soal);
  var basis = pfVal("pfmBasis") || "kesiapan";
  var intiEl = document.getElementById("pfmInti");
  var pakaiInti = !intiEl || !!intiEl.checked;
  var namaMode = pfVal("pfmNama") || "abc";
  var batas = parseInt(pfVal("pfmBatas"), 10) || 0;
  var murid = pfMuridKelas();
  var m = {
    sumber: {
      v: src.v, l: src.l,
      rincian: dipilih.map(function (s) { return { l: s.l, n: (s.soal || []).length }; })
    },
    basis: basis, inti: pakaiInti, batas: batas || "", namaMode: namaMode, soal: soal, kembar: kembar,
    murid: murid.length, kelasNama: state.filter.profil.kelas || "", paket: []
  };

  var bucket = { dasar: [], cakap: [], mahir: [] };
  soal.forEach(function (q) { bucket[pfTingkatSoal(q)].push(q); });
  m.belumAses = murid.filter(function (s) { return !s.kesiapan; }).length;
  m.dipagar = soal.filter(function (q) { return pfSoalDipagar(q); }).length;

  if (basis === "gaya") {
    m.belumGaya = murid.filter(function (s) { return !s.gaya; }).length;
    ["visual", "auditori", "kinestetik", "campuran"].forEach(function (g) {
      var anggota = murid.filter(function (s) { return s.gaya === g; });
      if (!anggota.length) return;
      m.paket.push({ kode: g, nama: pfLabel(PF_GAYA, g), anggota: anggota, qs: soal, level: false, fit: g });
    });
    if (!m.paket.length) {
      toast("warn", "Belum ada data gaya belajar", "Isi angket gaya belajar murid, atau pilih dasar pengelompokan kesiapan belajar.");
      return;
    }
    var soalg = batas > 0 ? soal.slice(0, batas) : soal.slice();
    m.paket.forEach(function (p) {
      p.qs = soalg.slice();
      p.idx = p.qs.map(function (q) { return soal.indexOf(q); });
      p.pkg = pfPaketAssess(src, p.siswa || p.nama, p.kode, p.qs);
      p.catatan = pfPaketCatatan(p, m);
    });
  } else {
    /* Soal inti bersama hanya diambil dari soal Sedang yang BUKAN soal tingkat tinggi,
       supaya paket Perlu Penguatan tetap bebas dari soal sulit/C4-C6. */
    var intiAman = bucket.cakap.filter(function (q) { return !pfSoalTinggi(q); });
    PF_TINGKAT.forEach(function (t) {
      var anggota = murid.filter(function (s) { return s.kesiapan === t.v; });
      var intiPaket = t.v === "mahir" ? bucket.cakap : intiAman;
      var qs = pakaiInti && t.v !== "cakap" ? bucket[t.v].concat(intiPaket) : bucket[t.v].slice();
      m.paket.push({ kode: t.v, nama: t.l, tingkat: t, anggota: anggota, qs: qs, level: true, adaInti: pakaiInti && (t.v === "cakap" || intiPaket.length > 0) });
    });
    m.bucketKosong = ["dasar", "cakap", "mahir"].filter(function (k) { return !bucket[k].length; });
  }

  m.paket.forEach(function (p, i) {
    p.siswa = pfNamaSiswa(m.namaMode, p, i);
    p.idx = p.qs.map(function (q) { return soal.indexOf(q); });
    p.pkg = pfPaketAssess(src, p.siswa, p.kode, p.qs);
    p.catatan = pfPaketCatatan(p, m);
  });

  /* Batasi jumlah soal per murid supaya permainan tetap singkat. Soal dipilih
     merata: sebagian dari soal yang paling sesuai dengan tingkat murid, sisanya
     dari soal lain pada paket yang sama, dan soal tingkat tinggi tidak pernah
     masuk ke paket bawah (pagar keamanan tetap berlaku). */
  if (batas > 0) {
    m.paket.forEach(function (p) {
      var aman = p.level ? p.qs.filter(function (q) { return !pfSoalTinggi(q); }) : null;
      var pilih = batasiSoal(p.qs, batas, aman);
      p.qs = pilih;
      p.idx = p.qs.map(function (q) { return soal.indexOf(q); });
      p.pkg.questions = p.qs.map(function (q, i) {
        var nn = {};
        Object.keys(q).forEach(function (k) { nn[k] = q[k]; });
        nn.id = "pkg" + p.kode + i + "-" + String(q.id || "q").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
        nn.no = i + 1;
        return nn;
      });
      p.pkg.meta.jumlah = p.qs.length;
      p.pkg.meta.semuaIds = p.pkg.questions.map(function (q) { return q.id; });
    });
  }

  /* KUNCI PAKET: tiap tautan/QR per kelompok hanya boleh dibuka murid yang
     benar-benar terdaftar di kelompok itu. Payload tiap tautan memuat daftar
     nama yang diizinkan + label paketnya, sehingga murid dari paket lain
     ditolak saat menulis namanya di halaman Pesawat Tempur. */
  m.paket.forEach(function (p) {
    pfPasangKunciPaket(p, {
      kode: p.kode,
      label: p.level ? p.tingkat.l : p.nama,
      nama: (m.kelas ? (m.kelas.perMurid || []) : []).filter(function (x) { return !x.belum && (!(p.anggota || []).length || (p.anggota || []).indexOf(x) >= 0); }),
      safety: m.basis === "kesiapan"
    });
  });

  if (m.basis === "kesiapan") {
    var pkKelas = pfPaketAssess(src, "Tugas Kelas", "kelas", soal.slice());
    pkKelas.meta.judul = ((src.meta && src.meta.judul) || "Asesmen") + " \u2014 Tugas Kelas";
    pkKelas.meta.kelasOtomatis = true;
    var mapIdKelas = {};
    pkKelas.questions.forEach(function (q, i) { mapIdKelas[i] = q.id; });
    var perMuridKelas = murid.filter(function (s) { return !s.kesiapan; }).map(function (s) {
      return {
        nama: s.nama, lv: "", lvLabel: "Belum terdata", belum: true,
        idx: [], qs: [],
        ids: []
      };
    });
    murid.filter(function (s) { return !!s.kesiapan; }).forEach(function (s) {
      var lv = s.kesiapan || "cakap";
      var grup = null, i;
      for (i = 0; i < m.paket.length; i++) if (m.paket[i].kode === lv) grup = m.paket[i];
      var idx = grup ? grup.idx.slice() : [];
      perMuridKelas.push({
        nama: s.nama, lv: lv, lvLabel: pfTingkatLabel(lv), belum: false,
        idx: idx, qs: grup ? grup.qs.slice() : [],
        ids: idx.map(function (j) { return mapIdKelas[j]; })
      });
    });
    var pkCakap = null, pkDasar = null, kk;
    for (kk = 0; kk < m.paket.length; kk++) if (m.paket[kk].kode === "cakap") pkCakap = m.paket[kk];
    for (kk = 0; kk < m.paket.length; kk++) if (m.paket[kk].kode === "dasar") pkDasar = m.paket[kk];
    var defIdx = (pkCakap && pkCakap.idx.length) ? pkCakap.idx.slice()
      : ((pkDasar && pkDasar.idx.length) ? pkDasar.idx.slice() : soal.map(function (q2, i2) { return i2; }));
    pkKelas.meta.perMurid = perMuridKelas.map(function (x) { return { nama: x.nama, lv: x.lv, ids: x.ids }; });
    pkKelas.meta.defaultIds = defIdx.map(function (j) { return mapIdKelas[j]; });
    m.kelas = {
      kode: "kelas", nama: "Tugas Kelas", siswa: "Tugas Kelas", level: false,
      anggota: murid, qs: pkKelas.questions.slice(),
      idx: soal.map(function (q3, i3) { return i3; }),
      pkg: pkKelas, perMurid: perMuridKelas,
      catatan: [
        "Satu tautan untuk seluruh kelas; soal menyesuaikan otomatis setelah murid menulis nama lengkap di halaman Pesawat Tempur.",
        "Murid tidak pernah memilih paket dan tidak melihat label tingkatnya.",
        "Murid yang kesiapannya belum terdata menerima soal inti bersama (tingkat Sedang)."
      ]
    };
    /* Kunci tautan kelas: hanya nama yang terdaftar yang dapat masuk. */
    pkKelas.meta.semuaIds = pkKelas.questions.map(function (q) { return q.id; });
    pkKelas.meta.terkunci = true;
    pkKelas.meta.paketAkses = (perMuridKelas || []).filter(function (x) { return !x.belum; }).map(function (x) {
      return { nama: x.nama, lv: x.lv, ids: (x.ids || []).slice() };
    });
    m.batasAktif = batas;
  }

  state.pfSoalMap = m;
  pfSoalMapRender();
  render();
  if (kembar) toast("info", "Soal kembar dilewati", kembar + " soal identik antar sumber tidak dihitung dua kali.");
}

function pfSoalMapRender() {
  var box = document.getElementById("pfmHasil");
  var m = state.pfSoalMap;
  if (!box || !m) return;
  var h = "";
  h += '<div class="note note-info mb-16">' + ICON.chart + "<div><strong>" + esc(m.sumber.l) + "</strong>" +
    m.soal.length + " soal dipetakan &bull; " + m.murid + " murid " + (m.kelasNama ? "kelas " + esc(m.kelasNama) : "(semua kelas terdata)") +
    " &bull; dasar pengelompokan: <b>" + (m.basis === "gaya" ? "gaya belajar" : "kesiapan belajar") + "</b>.</div></div>";
  if (m.basis === "gaya" && m.belumGaya) {
    h += '<div class="note note-warn mb-16">' + ICON.alert + "<div><strong>" + m.belumGaya + " murid belum diketahui gaya belajarnya</strong>Lengkapi lewat angket (tombol bintang pada daftar murid) agar mereka punya kelompok.</div></div>";
  }
  if (m.basis === "kesiapan" && m.belumAses) {
    h += '<div class="note note-warn mb-16">' + ICON.alert + "<div><strong>" + m.belumAses + " murid belum diases kesiapannya</strong>Mereka belum masuk kelompok mana pun. Isi kesiapan lewat angket, asesmen diagnostik, atau tombol <i>Isi Kesiapan dari Rekap Nilai</i>.</div></div>";
  }
  if (m.basis === "kesiapan" && m.bucketKosong && m.bucketKosong.length) {
    h += '<div class="note note-warn mb-16">' + ICON.alert + "<div><strong>Belum ada soal tingkat " + m.bucketKosong.map(function (k) { return pfTingkatLabel(k); }).join(" dan ") + "</strong>Tambahkan soal pada tingkat itu lewat tombol <i>Siapkan Soal Tingkat Ini</i> pada paket di bawah, supaya semua kelompok terlayani.</div></div>";
  }
  if (m.basis === "kesiapan" && m.dipagar) {
    var nomorPagar = [];
    m.soal.forEach(function (q, i) { if (pfSoalDipagar(q)) nomorPagar.push(i + 1); });
    h += '<div class="note note-info mb-16">' + ICON.alert + "<div><strong>Pagar keamanan tingkat aktif</strong>" +
      m.dipagar + " soal (nomor " + nomorPagar.join(", ") + ") berlabel <b>sulit atau level kognitif C4-C6</b> sehingga dikunci hanya untuk paket <b>Siap Pengayaan</b>. Kelompok Perlu Penguatan dan Sedang tidak menerima soal tersebut. Bila label soal itu keliru (misalnya sebenarnya sedang), perbaiki lewat Edit Soal lalu petakan ulang.</div></div>";
  }

  if (m.basis === "kesiapan") {
    h += '<div class="note note-info mb-16">' + ICON.check + "<div><strong>Aturan tetap:</strong> soal berlabel <b>sulit</b> atau <b>C4-C6</b> tidak pernah masuk paket <b>Perlu Penguatan</b> maupun <b>Sedang</b>; paket Perlu Penguatan paling tinggi berisi soal <b>sedang</b> (soal inti bersama). Periksa kolom <i>Masuk paket</i> di bawah sebagai bukti.</div></div>";
    h += '<div class="table-wrap mb-16"><table class="tbl"><thead><tr><th>No</th><th>Soal</th><th>Kesulitan</th><th>Kognitif</th><th>Bentuk</th><th>Masuk paket</th></tr></thead><tbody>';
    m.soal.forEach(function (q, i) {
      var masuk = [];
      m.paket.forEach(function (p) {
        if (p.idx.indexOf(i) < 0) return;
        masuk.push(p.level ? (p.siswa && p.siswa !== p.tingkat.l ? p.siswa + " (" + p.tingkat.l + ")" : p.tingkat.l) : p.nama);
      });
      var ringkas = String(q.stem || "").slice(0, 70) + (String(q.stem || "").length > 70 ? "\u2026" : "");
      h += "<tr><td><b>" + (i + 1) + "</b>" + (pfSoalDipagar(q) ? ' <span class="badge badge-slate">dipagar</span>' : "") + "</td><td>" + esc(ringkas) + "</td><td>" + diffBadge(q.difficulty) + "</td><td>" + cogBadge(q.cognitive || "-") + "</td><td>" + esc(bentukLabel(q.type)) + "</td><td>" +
        (masuk.length ? esc(masuk.join(", ")) : '<span style="color:var(--muted)">di luar paket</span>') + "</td></tr>";
    });
    h += "</tbody></table></div>";
  }

  if (m.basis === "kesiapan" && m.kelas) {
    var jmlMurid = m.kelas.perMurid.filter(function (x) { return !x.belum; }).map(function (x) { return x.qs.length; });
    var jMin = jmlMurid.length ? Math.min.apply(null, jmlMurid) : 0;
    var jMax = jmlMurid.length ? Math.max.apply(null, jmlMurid) : 0;
    var jTeks = jMin === jMax ? String(jMin) : jMin + "\u2013" + jMax;
    h += '<div class="card card-pad mb-16" style="border:2px solid #93c5fd">';
    h += '<div class="card-head" style="margin-bottom:8px"><div><h3>Satu tautan kelas &mdash; soal menyesuaikan otomatis</h3><p>' +
      m.kelas.anggota.length + " murid &bull; " + m.kelas.qs.length + " soal tersedia &bull; tiap murid menerima <b>" + jTeks + " soal</b>" +
      (m.inti ? " (soal tingkatnya + inti bersama)" : " (soal tingkatnya sendiri)") +
      (m.batasAktif ? " &bull; dibatasi " + m.batasAktif + " soal/murid" : "") + "</p></div>" +
      '<span class="badge badge-blue">Cara termudah</span></div>';
    if (m.inti && jMin !== jMax) {
      h += '<div style="font-size:12px;color:var(--muted);line-height:1.6;margin:0 0 8px">Ingin tiap murid hanya mengerjakan soal tingkatnya sendiri (misalnya 10 soal)? <b>Petakan ulang</b> dan lepas centang <b>Soal inti bersama</b>.</div>';
    }
    h += '<div style="font-size:12.5px;color:#334155;line-height:1.7">Bagikan <b>satu tautan/QR</b> ini ke seluruh kelas. Murid menulis nama lengkapnya di halaman Pesawat Tempur, lalu <b>soal otomatis menyesuaikan tingkat kesiapannya</b> (dari Profil Murid). Murid tidak memilih paket dan tidak melihat label tingkatnya, dan murid tingkat dasar tidak akan menerima soal sulit/C4-C6.</div>';
    h += '<div class="table-wrap mt-16 mb-16"><table class="tbl"><thead><tr><th>No</th><th>Nama murid</th><th>Tingkat (untuk guru)</th><th>Jumlah soal</th><th>Nomor soal yang diterima</th></tr></thead><tbody>';
    m.kelas.perMurid.forEach(function (x, i2) {
      h += "<tr><td>" + (i2 + 1) + "</td><td><strong>" + esc(x.nama) + "</strong></td><td>" +
        '<span class="badge ' + (x.lv === "dasar" ? "badge-amber" : x.lv === "mahir" ? "badge-green" : "badge-blue") + '">' + esc(x.lvLabel) + "</span>" +
        (x.belum ? ' <span class="badge badge-slate">belum terdata &mdash; pakai soal inti</span>' : "") + "</td><td>" + x.qs.length + "</td><td>" +
        esc(x.qs.length ? pfNomorSoal(x.qs) : "belum ada soal inti") + "</td></tr>";
    });
    h += "</tbody></table></div>";
    h += '<div class="q-actions" style="justify-content:flex-start;margin:0">' +
      '<button class="btn btn-primary btn-sm" data-action="pfPkgShare" data-k="kelas">' + ICON.share + " Bagikan (Tautan/QR)</button>" +
      '<button class="btn btn-light btn-sm" data-action="pfPkgUnduh" data-k="kelas">' + ICON.download + " File Soal (Offline)</button>" +
      '<button class="btn btn-light btn-sm" data-action="pfPkgSalin" data-k="kelas">' + ICON.copy + " Salin Semua Soal</button></div>";
    h += "</div>";
  }

  h += '<h3 style="margin:2px 0 12px;font-size:15px">Paket per kelompok <span style="color:var(--muted);font-weight:400;font-size:13px">&mdash; tautan/QR tiap paket hanya untuk murid paket itu</span></h3>';
  h += '<div class="note note-info mb-16">' + ICON.alert + "<div><strong>Tautan paket itu terkunci</strong>Murid hanya dapat masuk lewat tautan paketnya sendiri. Bila murid menulis namanya di tautan paket lain, ia <b>tidak dapat memulai permainan</b> dan diminta memakai tautan dari gurunya.</div></div>";
  h += '<div class="grid grid-2">';
  m.paket.forEach(function (p) {
    h += '<div class="card card-pad">';
    h += '<div class="card-head" style="margin-bottom:8px"><div><h3>' + esc(p.level ? p.tingkat.l : p.nama) + "</h3><p>" +
      p.anggota.length + " murid &bull; " + p.qs.length + " soal" + (p.level ? " &bull; " + esc(p.tingkat.ket) : "") + "</p></div>" +
      '<span class="badge ' + (p.level ? p.tingkat.warna : "badge-violet") + '">' + esc(p.level ? "Paket soal" : "Media berbeda") + "</span></div>";
    h += '<div style="font-size:12.5px;color:var(--muted);margin-bottom:4px">Nama untuk murid: <b>' + esc(p.siswa || "-") + "</b></div>";
    h += '<div style="font-size:12.5px;color:#334155;line-height:1.7"><b>Nomor soal:</b> ' + pfNomorSoal(p.qs) + "</div>";
    h += '<div style="font-size:12.5px;color:#334155;line-height:1.7">' + pfPaketIsi(p) + "</div>";
    if (m.dipagar && p.level && p.kode !== "mahir") h += '<div style="font-size:12px;color:var(--muted);line-height:1.6;margin-top:2px">' + m.dipagar + " soal berlabel sulit/C4-C6 dikunci untuk paket <b>Siap Pengayaan</b> &mdash; tidak dibagikan ke kelompok ini.</div>";
    var periksaPkg = pfPaketPeriksa(p);
    if (periksaPkg) h += '<div class="note note-warn" style="margin:10px 0 0">' + ICON.alert + "<div><strong>Periksa paket ini</strong>" + esc(periksaPkg) + "</div></div>";
    h += '<ul style="font-size:12.5px;line-height:1.7;padding-left:18px;color:#475569;margin:8px 0 10px">' +
      p.catatan.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>";
    if (p.level) {
      var bolehPaket = (m.kelas ? m.kelas.perMurid : []).filter(function (x) { return !x.belum && p.anggota.indexOf(x) >= 0; });
      h += '<div style="font-size:12.5px;color:#334155;line-height:1.7"><b>Boleh masuk lewat tautan ini:</b> ' + (bolehPaket.length ? esc(pfNamaRingkas(bolehPaket, 40)) : '<span style="color:var(--muted)">belum ada murid terdata</span>') + "</div>";
    }
    if (p.anggota.length) h += '<div style="font-size:12px;color:var(--muted);line-height:1.6">Murid: ' + esc(pfNamaRingkas(p.anggota)) + "</div>";
    if (!p.qs.length) {
      h += '<div class="note note-warn mt-16" style="margin-bottom:10px">' + ICON.alert + "<div><strong>Paket masih kosong</strong>Belum ada soal yang cocok dengan tingkat ini.</div></div>";
      if (p.level) h += '<div class="q-actions" style="justify-content:flex-start;margin:0"><button class="btn btn-primary btn-sm" data-action="pfUseTingkat" data-k="' + p.kode + '">' + ICON.sparkles + " Siapkan Soal Tingkat Ini</button></div>";
      h += "</div>";
      return;
    }
    h += '<div class="q-actions" style="justify-content:flex-start;margin:0">' +
      '<button class="btn btn-primary btn-sm" data-action="pfPkgShare" data-k="' + p.kode + '">' + ICON.share + " Bagikan (Tautan/QR)</button>" +
      '<button class="btn btn-light btn-sm" data-action="pfPkgUnduh" data-k="' + p.kode + '">' + ICON.download + " File Soal</button>" +
      '<button class="btn btn-light btn-sm" data-action="pfPkgSalin" data-k="' + p.kode + '">' + ICON.copy + " Salin Soal</button></div>";
    h += "</div>";
  });
  h += "</div>";

  h += '<div class="q-actions" style="justify-content:flex-start;margin-top:14px">' +
    '<button class="btn btn-light btn-sm" data-action="pfSoalMapCopy">' + ICON.copy + " Salin Pemetaan (teks)</button>" +
    '<button class="btn btn-light btn-sm" data-action="pfSoalMapModal">' + ICON.refresh + " Petakan Ulang</button></div>";
  box.innerHTML = h;
}

function pfPkgByKode(k) {
  var m = state.pfSoalMap;
  if (!m) return null;
  if (k === "kelas" && m.kelas) return m.kelas;
  for (var i = 0; i < m.paket.length; i++) if (m.paket[i].kode === k) return m.paket[i];
  return null;
}

function pfPaketText(pkg, judul) {
  var t = judul + "\n" + new Array(judul.length + 1).join("=") + "\n\n";
  (pkg.questions || []).forEach(function (q) {
    t += q.no + ". " + String(q.stem || "").replace(/\s+/g, " ") + "\n";
    if (q.image) t += "   [soal disertai gambar]\n";
    (q.options || []).forEach(function (o) { t += "   " + o.key + ". " + o.text + "\n"; });
    (q.pairs || []).forEach(function (p) { t += "   " + p.left + "  ->  " + p.right + "\n"; });
    t += "   Kunci: " + (q.answer || "-") + "\n";
    if (q.rubric) t += "   Rubrik: " + String(q.rubric).replace(/\s+/g, " ") + "\n";
    if (q.explanation) t += "   Pembahasan: " + String(q.explanation).replace(/\s+/g, " ") + "\n";
    t += "\n";
  });
  return t;
}

function pfPkgSalin(k) {
  var p = pfPkgByKode(k);
  if (!p || !p.qs.length) { toast("warn", "Paket kosong", "Belum ada soal pada paket ini."); return; }
  pfFormCopy(pfPaketText(p.pkg, "PAKET SOAL: " + p.pkg.meta.judul), "Paket disalin",
    "Tempel ke lembar kerja, WhatsApp, atau dokumen lain (" + p.qs.length + " soal).");
}

function pfPkgUnduh(k) {
  var p = pfPkgByKode(k);
  if (!p || !p.qs.length) { toast("warn", "Paket kosong", "Belum ada soal pada paket ini."); return; }
  var html = buildStudentHTML(buildSharePayload(p.pkg));
  downloadBlob(new Blob([html], { type: "text/html" }), safeName(p.pkg) + ".html");
  toast("success", "File paket diunduh", "Paket " + p.nama + " (" + p.qs.length + " soal) siap dibagikan, termasuk saat tanpa internet.");
}

function pfPkgShare(k) {
  var p = pfPkgByKode(k);
  if (!p || !p.pkg) return;
  if (!p.qs.length) { toast("warn", "Paket kosong", "Belum ada soal pada paket ini."); return; }
  shareModal(p.pkg);
}

function pfUseTingkat(k) {
  closeModal();
  pfUseAssess(k);
}

function pfSoalMapText(m) {
  var pp = function (p) { return p.siswa || (p.level ? p.tingkat.l : p.nama); };
  var t = "PEMETAAN SOAL KE KEBUTUHAN MURID\n================================\n\n";
  t += "Sumber soal        : " + m.sumber.l + "\n";
  if (m.sumber.rincian && m.sumber.rincian.length > 1) {
    m.sumber.rincian.forEach(function (r) { t += "   + " + r.l + "\n"; });
  }
  t += "Dasar pengelompokan: " + (m.basis === "gaya" ? "Gaya belajar" : "Kesiapan belajar") + "\n";
  t += "Kelas              : " + (m.kelasNama || "semua kelas") + " (" + m.murid + " murid terdata)\n";
  t += "Soal inti bersama  : " + (m.inti && m.basis === "kesiapan" ? "ya (tingkat Sedang dikerjakan semua kelompok)" : "tidak") + "\n";
  if (m.basis === "kesiapan" && m.kelas && m.kelas.perMurid && m.kelas.perMurid.length) {
    var jm = m.kelas.perMurid.filter(function (x) { return !x.belum; }).map(function (x) { return x.qs.length; });
    if (jm.length) {
      var lo = Math.min.apply(null, jm), hi = Math.max.apply(null, jm);
      t += "Soal per murid     : " + (lo === hi ? lo : lo + "-" + hi) + " soal (dari " + m.kelas.qs.length + " soal tersedia)\n";
    }
  }
  var sec = 0;
  var L = function () { sec++; return String.fromCharCode(64 + sec) + ". "; };
  if (m.basis === "kesiapan") {
    t += "\n" + L() + "TABEL PEMETAAN SOAL\n\n";
    t += "No | Kesulitan | Kognitif | Bentuk | Masuk paket | Cuplikan soal\n";
    m.soal.forEach(function (q, i) {
      var masuk = [];
      m.paket.forEach(function (p) { if (p.idx.indexOf(i) >= 0) masuk.push(p.tingkat.l); });
      t += (i + 1) + " | " + kesulitanLabel(q.difficulty) + " | " + (q.cognitive || "-") + " | " + bentukLabel(q.type) + " | " +
        (masuk.join(" + ") || "di luar paket") + (pfSoalDipagar(q) ? " [dikunci ke Siap Pengayaan]" : "") + " | " +
        String(q.stem || "").replace(/\s+/g, " ").slice(0, 60) + "\n";
    });
    if (m.kelas) {
      t += "\n" + L() + "SATU TAUTAN KELAS (SOAL MENYESUAIKAN OTOMATIS)\n\n";
      t += "Bagikan satu tautan/QR ini ke seluruh kelas. Murid menulis nama lengkap di halaman\n";
      t += "Pesawat Tempur, lalu soal otomatis menyesuaikan tingkat kesiapannya.\n\n";
      t += "Total soal tersedia: " + m.kelas.qs.length + " soal (setiap murid hanya menerima soal tingkatnya).\n\n";
      t += "Daftar murid dan soal yang akan diterimanya:\n";
      m.kelas.perMurid.forEach(function (x, i2) {
        t += "  " + (i2 + 1) + ". " + x.nama + " \u2014 " + x.lvLabel + " \u2014 " + x.qs.length + " soal" +
          (x.belum ? " (kesiapan belum terdata, memakai soal inti)" : "") + "\n";
        t += "     Nomor soal: " + (x.qs.length ? pfNomorSoal(x.qs) : "belum ada soal inti") + "\n";
      });
    }
  }
  t += "\n" + L() + "PAKET PER KELOMPOK\n\n";
  m.paket.forEach(function (p, i) {
    t += (i + 1) + ". " + (p.level ? p.tingkat.l : p.nama) + " \u2014 " + p.anggota.length + " murid \u2014 " + p.qs.length + " soal\n";
    t += "   Nama untuk murid: " + pp(p) + "\n";
    t += "   Isi soal       : " + p.qs.length + " soal \u2014 " + pfPaketIsiText(p) + "\n";
    t += "   Nomor soal     : " + pfNomorSoal(p.qs) + "\n";
    t += "   Anggota        : " + (pfNamaRingkas(p.anggota, 40) || "belum ada") + "\n";
    p.catatan.forEach(function (c) { t += "   - " + c + "\n"; });
    t += "\n";
  });
  t += "Keterangan nama paket (untuk murid): " + m.paket.map(function (p) { return pp(p) + " = " + (p.level ? p.tingkat.l : p.nama); }).join("; ") + "\n";
  if (m.basis === "kesiapan") {
    var nomorPagar = [];
    m.soal.forEach(function (q, i) { if (pfSoalDipagar(q)) nomorPagar.push(i + 1); });
    t += "Aturan keamanan tingkat: soal berlabel sulit atau C4-C6 dikunci hanya untuk paket Siap Pengayaan" +
      (nomorPagar.length ? ", yaitu nomor " + nomorPagar.join(", ") + " (label soal perlu diperiksa)" : "") +
      ". Jadi paket Perlu Penguatan dan Sedang bebas dari soal tingkat mahir.\n";
  }
  t += "Yang sama untuk semua kelompok: kompetensi, indikator, dan bobot penilaian. Yang berbeda: kedalaman soal, jumlah bantuan, media, dan bentuk bukti belajar.\n";
  t += "Catatan: pemetaan ini dibuat otomatis dari data Profil Murid sebagai titik awal. Guru tetap dapat memindahkan soal antar paket sesuai pertimbangan profesional.\n";
  return t;
}

function pfSoalMapCopy() {
  var m = state.pfSoalMap;
  if (!m) { toast("warn", "Belum ada pemetaan", "Klik Petakan Soal terlebih dahulu."); return; }
  pfFormCopy(pfSoalMapText(m), "Pemetaan disalin", "Tempelkan ke dokumen Karya Inovasi atau lembar kerja guru.");
}

function pfSoalMapRingkas() {
  var m = state.pfSoalMap;
  if (!m) return "";
  return m.paket.map(function (p) { return p.nama + ": " + p.qs.length + " soal"; }).join(" \u2022 ");
}

