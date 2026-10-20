function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64decode(str) {
  return decodeURIComponent(escape(atob(str)));
}
function encodeCode(obj) {
  return b64encode(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeCode(s) {
  s = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return JSON.parse(b64decode(s));
}

function endpointUrl() { return String(syncConfig.endpoint || "").trim(); }

function studentQuiz(a) {
  var m = a.meta;
  return {
    id: a.id,
    meta: {
      judul: m.judul, mapel: m.mapel, kelas: m.kelas, jenis: m.jenis,
      guru: m.namaGuru, sekolah: m.sekolah, tahun: m.tahun, semester: m.semester,
      alokasi: m.alokasi, durasi: m.durasi, instruksi: m.instruksi,
      tampilkanSkor: !!m.tampilkanSkor, paket: m.paket, paketLabel: m.paketLabel
    },
    questions: a.questions.map(function (q) {
      return {
        id: q.id, no: q.no, type: q.type, weight: q.weight, stem: q.stem,
        image: q.image || "",
        options: (q.options || []).map(function (o) { return { key: o.key, text: o.text }; }),
        pairs: (q.pairs || []).map(function (p) { return { left: p.left, right: p.right }; }),
        answer: q.answer
      };
    })
  };
}

function buildSharePayload(a, opts) {
  var p = { v: 1, endpoint: endpointUrl(), quiz: studentQuiz(a) };
  var m = (a && a.meta) || {};
  if (m.perMurid && m.perMurid.length) {
    p.quiz.perMurid = m.perMurid.map(function (x) { return { nama: x.nama, lv: x.lv || "", ids: (x.ids || []).slice() }; });
    if (m.defaultIds && m.defaultIds.length) p.quiz.defaultIds = m.defaultIds.slice();
  }
  /* Payload terkunci: hanya nama dalam daftar paket ini yang boleh mengerjakan,
     dan semua soal yang dibagikan pasti milik paket ini (sisanya disembunyikan). */
  if (m.terkunci) {
    p.lock = {
      kode: m.paketKode || m.paket || "",
      label: m.paketLabel || m.paket || "",
      akses: (m.paketAkses || []).map(function (x) { return { nama: x.nama, lv: x.lv || "", ids: (x.ids || []).slice() }; })
    };
    if (m.semuaIds && m.semuaIds.length) p.quiz.semuaIds = m.semuaIds.slice();
    else p.quiz.semuaIds = (a.questions || []).map(function (q) { return q.id; });
  }
  if (opts && opts.debug) p.debug = true;
  return p;
}

function studentLink(a) {
  var base = location.href.split("#")[0];
  return base + "#kerjakan=" + encodeCode(buildSharePayload(a));
}

/* Kompres payload tautan (gzip) supaya tautan jauh lebih pendek.
   Awalan "gz~" membedakan kode terkompresi dari kode base64 lama. */
function gzipCode(str) {
  try {
    if (typeof CompressionStream === "undefined" || typeof TextEncoder === "undefined" || typeof Response === "undefined") return Promise.resolve(null);
    var stream = new CompressionStream("gzip");
    var writer = stream.writable.getWriter();
    writer.write(new TextEncoder().encode(str));
    writer.close();
    return new Response(stream.readable).arrayBuffer().then(function (buf) {
      var bytes = new Uint8Array(buf), s = "", i = 0;
      for (; i + 8192 <= bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
      if (i < bytes.length) s += String.fromCharCode.apply(null, bytes.subarray(i));
      return "gz~" + btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }).catch(function () { return null; });
  } catch (e) { return Promise.resolve(null); }
}

function ungzipCode(code) {
  try {
    code = String(code || "");
    if (code.indexOf("gz~") !== 0) return Promise.resolve(null);
    if (typeof DecompressionStream === "undefined" || typeof Response === "undefined") return Promise.resolve(null);
    var b = code.slice(3).replace(/-/g, "+").replace(/_/g, "/");
    while (b.length % 4) b += "=";
    var bin = atob(b);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var stream = new DecompressionStream("gzip");
    var writer = stream.writable.getWriter();
    writer.write(bytes);
    writer.close();
    return new Response(stream.readable).text().catch(function () { return null; });
  } catch (e) { return Promise.resolve(null); }
}

function studentLinkAsync(a, cb) {
  var base = location.href.split("#")[0];
  var payload = null, json = "";
  try { payload = buildSharePayload(a); json = JSON.stringify(payload); } catch (e) { }
  if (!json) { cb(studentLink(a), false, 0); return; }
  var plain = base + "#kerjakan=" + encodeCode(payload);
  gzipCode(json).then(function (g) {
    if (g) cb(base + "#kerjakan=" + g, true, plain.length);
    else cb(plain, false, plain.length);
  }).catch(function () { cb(plain, false, plain.length); });
}

function normAns(s) { return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]+/g, "").trim(); }

function autoScoreQuestion(q, ans) {
  var t = q.type;
  if (t === "pg" || t === "bs") return ans != null && String(ans).toUpperCase() === String(q.answer || "").toUpperCase();
  if (t === "pgk") {
    var a = (Array.isArray(ans) ? ans : []).map(function (x) { return String(x).toUpperCase(); }).sort().join(",");
    var c = String(q.answer || "").split(/[,\s]+/).filter(Boolean).map(function (x) { return x.toUpperCase(); }).sort().join(",");
    return a !== "" && a === c;
  }
  if (t === "isian") return normAns(ans) === normAns(q.answer);
  return null;
}

var RUNTIME_JS = `
(function(){
  var P=window.__PAYLOAD__;
  var root=document.getElementById('app');
  if(!P||!P.quiz){root.innerHTML='<div class="wrap"><div class="card center"><h1 class="title">Soal tidak ditemukan</h1><p class="muted">Kode atau tautan tidak valid.</p></div></div>';return;}
  var quiz=P.quiz, meta=quiz.meta||{}, endpoint=P.endpoint||'';
  var QS=quiz.questions||[], NQ=QS.length, PER=5, MAX_LIVES=5;
  /* Nyawa menyesuaikan jumlah soal: paket 10 soal cukup 3 nyawa, bukan 5. */
  var NYAWA=Math.max(2,Math.min(MAX_LIVES,Math.ceil(NQ/4)||MAX_LIVES));
  var SHUFFLE=!P.noShuffle;
  var PM=quiz.perMurid||[], DEF=quiz.defaultIds||null, lastMiss='';
  /* Kunci paket: bila tautan ini milik satu paket kelompok, hanya murid yang
     terdaftar di paket itu yang boleh masuk. Murid dari paket lain ditolak. */
  var LOCK=P.lock||null, LAKSES=(LOCK&&LOCK.akses)||[], SEMUA=quiz.semuaIds||null;
  if(LOCK){
    var benar=function(id){return !SEMUA||SEMUA.indexOf(id)>=0;};
    /* Cocokkan nama: persis dulu, lalu awalan (mis. nama depan saja) bila hasilnya
       tunggal. Bila ambigu, murid yang bersangkutan diminta menulis nama lengkap. */
    var cariNama=function(nama){
      var key=normNama(nama),i;
      if(!key)return {hit:null,ambigu:false};
      for(i=0;i<LAKSES.length;i++){if(normNama(LAKSES[i].nama)===key)return {hit:LAKSES[i],ambigu:false};}
      var kandidat=[];
      for(i=0;i<LAKSES.length;i++){var k=normNama(LAKSES[i].nama);if(k&&(k.indexOf(key)===0||key.indexOf(k)===0))kandidat.push(LAKSES[i]);}
      if(kandidat.length===1)return {hit:kandidat[0],ambigu:false};
      if(kandidat.length>1)return {hit:null,ambigu:true};
      return {hit:null,ambigu:false};
    };
    if(SEMUA){
      var milik=[],j2;
      for(j2=0;j2<QS.length;j2++){if(benar(QS[j2].id))milik.push(QS[j2]);}
      QS=milik;NQ=QS.length;
    }
    PM=LAKSES;DEF=null;
    NYAWA=Math.max(2,Math.min(MAX_LIVES,Math.ceil(NQ/4)||MAX_LIVES));
    if(!NQ){
      root.innerHTML='<div class="wrap"><div class="card center"><h1 class="title">Soal belum tersedia</h1><p class="muted">'+
        'Paket '+(LOCK.label||'')+' belum memiliki soal. Hubungi gurumu.</p></div></div>';return;
    }
    LOCK.cari=function(nama){
      var r=cariNama(nama);
      if(!r.hit)return {miss:true,ambigu:r.ambigu,set:null};
      var set=subSet(r.hit.ids);
      /* pagar keamanan: murid tidak boleh menerima soal tingkat tinggi */
      if(set){var aman=[],i;for(i=0;i<set.length;i++){if(set[i].aman!==false)aman.push(set[i]);}set=aman;}
      if(!set||!set.length)return {miss:true,ambigu:false,kosong:true,set:null};
      return {hit:r.hit,set:set};
    };
    LOCK.cek=function(nama){var r=LOCK.cari(nama);return r&&r.set&&!r.miss;};
  }
  var mode='gate', violation=0, fsWanted=false, timerId=null, left=0, submitted=false, started=Date.now(), lastViol=0;

  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function nl2br(s){return esc(s).replace(/\\n/g,'<br>');}
  function b64(s){try{return btoa(unescape(encodeURIComponent(s)));}catch(e){return encodeURIComponent(s);}}
  function val(id){var e=document.getElementById(id);return e?String(e.value||'').trim():'';}
  function typeLabel(t){return({pg:'Pilihan Ganda',pgk:'Pilihan Ganda Kompleks',bs:'Benar/Salah',menjodohkan:'Menjodohkan',isian:'Isian Singkat',uraian:'Uraian',praktik:'Praktik'})[t]||t;}
  function fmtClock(sec){var m=Math.floor(sec/60),s=sec%60;return(m<10?'0':'')+m+':'+(s<10?'0':'')+s;}

  var W=800,H=600,DPR=1,shipR=15,baseSpd=190,scale=1;
  var cv=null, ctx=null, keys={};
  var G={shipX:150,shipY:300,targetY:300,lives:NYAWA,invuln:0,ast:[],rocks:[],stars:[],box:null,finish:null,correct:0,answered:0,answers:{},manual:0,shake:0,flash:0,missT:0,damage:0,hitT:0,hitMsg:'',hudLives:null,lastTs:0,raf:0,qIndex:0,spawnT:0};

  var HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  function livesHTML(n,breakIdx){var h='';for(var i=0;i<NYAWA;i++){var cls=(i<n?'on':'off');if(breakIdx!=null&&i===breakIdx)cls='breaking';h+='<span class="life '+cls+'">'+HEART+'</span>';}return h;}

  function shuffleArr(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function randomizeQuestions(){shuffleArr(QS);}

  function normNama(s){return String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]+/g,'');}
  function subSet(ids){if(!ids||!ids.length)return null;var out=[],i;for(i=0;i<QS.length;i++){if(ids.indexOf(QS[i].id)>=0)out.push(QS[i]);}return out.length?out:null;}
  function setUntuk(nama){
    var key=normNama(nama),hit=null,i;
    for(i=0;i<PM.length;i++){if(normNama(PM[i].nama)===key){hit=PM[i];break;}}
    if(!hit&&key){for(i=0;i<PM.length;i++){var k=normNama(PM[i].nama);if(k&&(k.indexOf(key)===0||key.indexOf(k)===0)){hit=PM[i];break;}}}
    if(hit)return {found:true,set:subSet(hit.ids)};
    return {found:false,set:subSet(DEF)};
  }
  if(P.debug){window.__adik={qs:function(){return QS;},nq:function(){return NQ;},pm:function(){return PM;}};}

  function gateHTML(){
    return '<div class="wrap gatewrap">'+
      '<div class="card center gate-card">'+
      '<div class="game-logo"><span class="rock r1"></span><span class="rock r2"></span><span class="rock r3"></span>'+jetSVG(120)+'</div>'+
      '<h1 class="title game-title">PESAWAT TEMPUR</h1>'+
      '<p class="muted">'+esc(meta.judul||'Kuis Antariksa')+'</p>'+
      '<div class="conn-pill" id="connPill"></div>'+
      '<p class="gate-sub">Kemudikan pesawat untuk menghampiri kotak soal yang melayang, hindari batu antariksa (2x tabrakan = 1 nyawa hilang), dan jangan melewatkan kotak soal (nyawa berkurang)! Kumpulkan hingga garis finish.</p>'+
      '<div class="idbox"><label>Nama Lengkap</label><input id="stNama" placeholder="Tulis nama lengkap" autocomplete="off">'+
      '<label>Kelas</label><select id="stKelas"><option value="">Pilih kelas</option><option value="X"'+(meta.kelas==='X'?' selected':'')+'>X</option><option value="XI"'+(meta.kelas==='XI'?' selected':'')+'>XI</option><option value="XII"'+(meta.kelas==='XII'?' selected':'')+'>XII</option></select>'+
      '<label>Nomor Absen</label><input id="stAbsen" placeholder="(opsional)" autocomplete="off"></div>'+
      (PM.length?'<p class="tiny" style="color:#1d4ed8;font-weight:600">'+(LOCK?'Tulis nama lengkapmu. Hanya murid paket '+(LOCK.label||'ini')+' yang dapat masuk lewat tautan ini.':'Soal otomatis disesuaikan dengan kebutuhan belajarmu setelah nama ditulis.')+'</p>':'')+
      '<p class="warn" id="gateWarn"></p>'+
      '<button class="btn big" id="btnStart">Mulai Terbang</button>'+
      '<p class="tiny">Layar akan masuk mode penuh. Berpindah tab/aplikasi atau keluar dari layar penuh membuat permainan diulang dari awal dan skor menjadi 0. Pelanggaran berikutnya membuat nilai otomatis 0.</p></div></div>';
  }

  function connInfo(){
    if(!endpoint)return {cls:'man',txt:'Mode manual - salin kode hasil setelah selesai'};
    return navigator.onLine===false?{cls:'off',txt:'Offline - hasil disimpan, terkirim saat online'}:{cls:'on',txt:'Online - hasil terkirim otomatis ke guru'};
  }
  function updateConnPill(){var p=document.getElementById('connPill');if(!p)return;var c=connInfo();p.className='conn-pill '+c.cls;p.textContent=c.txt;}

  function jetSVG(w){
    return '<svg class="jetlogo" viewBox="0 0 130 80" width="'+w+'" height="'+Math.round(w*0.62)+'" aria-hidden="true">'+
      '<defs><linearGradient id="jlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a9d6ff"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs>'+
      '<path d="M6 40 L-2 30 L-2 50 Z" fill="#fbbf24"/>'+
      '<path d="M10 40 L-6 34 L-2 40 L-6 46 Z" fill="#fde68a"/>'+
      '<path d="M60 34 L76 8 L88 10 L84 34 Z" fill="#cbd8ff"/>'+
      '<path d="M60 46 L76 72 L88 70 L84 46 Z" fill="#cbd8ff"/>'+
      '<path d="M112 40 Q80 24 48 30 Q34 33 32 40 Q34 47 48 50 Q80 56 112 40 Z" fill="url(#jlg)" stroke="#1e3a8a" stroke-width="2"/>'+
      '<path d="M40 32 L26 22 L30 34 Z" fill="#ef4444"/>'+
      '<ellipse cx="84" cy="39" rx="9" ry="6" fill="#0b2a5a"/><ellipse cx="86" cy="37" rx="4" ry="3" fill="#9fd0ff"/>'+
      '</svg>';
  }

  function optionsHTML(q){
    var t=q.type,h='';
    if(t==='pg'||t==='bs'){q.options.forEach(function(o){h+='<label class="opt"><input type="radio" name="sq_'+q.id+'" value="'+esc(o.key)+'"><span><b>'+esc(o.key)+'.</b> '+esc(o.text)+'</span></label>';});}
    else if(t==='pgk'){q.options.forEach(function(o){h+='<label class="opt"><input type="checkbox" name="sq_'+q.id+'" value="'+esc(o.key)+'"><span><b>'+esc(o.key)+'.</b> '+esc(o.text)+'</span></label>';});}
    else if(t==='isian'){h+='<input class="fill" id="in_'+q.id+'" placeholder="Tulis jawaban singkat" autocomplete="off">';}
    else if(t==='uraian'||t==='praktik'){h+='<textarea class="fill" id="in_'+q.id+'" rows="4" placeholder="Tulis jawaban Anda"></textarea>';}
    else if(t==='menjodohkan'){var rights=q.pairs.map(function(p){return p.right;});q.pairs.forEach(function(p,idx){h+='<div class="match"><span class="left">'+esc(p.left)+'</span><select id="mj_'+q.id+'_'+idx+'"><option value="">-- pilih --</option>';rights.forEach(function(r){h+='<option value="'+esc(r)+'">'+esc(r)+'</option>';});h+='</select></div>';});}
    return h;
  }

  function render(){
    root.innerHTML='<div id="gatewrap">'+gateHTML()+'</div>'+
      '<div id="quizwrap" style="display:none"><canvas id="cv"></canvas>'+
        '<div class="hud"><div class="hud-top">'+
          '<div class="hud-id" id="whoCard"></div>'+
          '<div class="hud-mid"><span id="hudCount">Soal 1 / '+NQ+'</span><div class="hud-prog"><div id="hudBar"></div></div></div>'+
          '<div class="hud-right"><span class="hud-score">Skor <b id="hudScore">0</b></span><span class="lives" id="lives">'+livesHTML(NYAWA)+'</span><span class="hud-timer" id="timer"></span></div>'+
        '</div>'+
        '<div class="hud-warn" id="hudWarn">Peringatan! 1x tabrakan lagi = 1 nyawa berkurang</div>'+
        '<div class="hud-hint" id="hudHint">Naik/turun: tombol panah, W/S, atau geser layar.</div>'+
        '<div class="pad"><button class="pbtn" id="upBtn" aria-label="Naik">&#8593;</button><button class="pbtn" id="downBtn" aria-label="Turun">&#8595;</button></div>'+
      '</div>'+
      '<div class="overlay" id="qOv" style="display:none"></div>'+
      '<div class="overlay" id="crashOv" style="display:none"></div>'+
      '<div class="overlay" id="secOv" style="display:none"></div>'+
      '</div>'+
      '<div id="result" class="resultwrap" style="display:none"></div>';
    document.getElementById('btnStart').addEventListener('click',start);
    updateConnPill();
    if(!window.__connWired){window.__connWired=1;
      window.addEventListener('online',function(){updateConnPill();flushQueue();});
      window.addEventListener('offline',updateConnPill);
      try{flushQueue();}catch(e){}}
  }

  function start(){
    var nama=val('stNama'),kelas=val('stKelas'),w=document.getElementById('gateWarn');
    if(!nama){w.textContent='Isi nama lengkap terlebih dahulu.';return;}
    if(!kelas){w.textContent='Pilih kelas (X/XI/XII).';return;}
    if(LOCK){
      var rk=LOCK.cari(nama);
      if(!rk||!rk.set){
        var pk=LOCK.label||'ini';
        if(rk&&rk.ambigu){
          w.textContent='Ada lebih dari satu murid bernama serupa di paket '+pk+'. Tulis nama lengkapmu (nama depan dan belakang) supaya tidak tertukar dengan temanmu.';
        } else if(rk&&rk.kosong){
          w.textContent='Kamu terdaftar di paket '+pk+', tetapi soal paket ini belum siap. Hubungi gurumu.';
        } else {
          var kelasLink=(LOCK.kode==='kelas');
          w.textContent=kelasLink
            ? 'Nama "'+nama+'" belum terdaftar di kelas ini. Periksa ejaan nama lengkapmu (tulis sesuai daftar hadir). Bila namamu memang sudah terdaftar, hubungi gurumu \u2014 nama pada daftar Profil Murid perlu diperbaiki dulu.'
            : 'Nama "'+nama+'" tidak terdaftar di paket '+pk+'. Periksa ejaan nama lengkapmu. Bila namamu memang terdaftar, mintalah tautan atau QR dari gurumu sesuai paketmu \u2014 tautan paket lain tidak dapat dibuka.';
        }
        return;
      }
      QS=rk.set;NQ=QS.length;NYAWA=Math.max(2,Math.min(MAX_LIVES,Math.ceil(NQ/4)||MAX_LIVES));
    } else if(PM.length){
      var r=setUntuk(nama);
      if(r.set){QS=r.set;NQ=QS.length;NYAWA=Math.max(2,Math.min(MAX_LIVES,Math.ceil(NQ/4)||MAX_LIVES));}
      else if(lastMiss!==nama){lastMiss=nama;w.textContent='Nama "'+nama+'" belum terdaftar di kelas ini. Periksa ejaan nama lengkap (sama seperti yang ditulis guru), atau klik Mulai Terbang sekali lagi untuk mengerjakan soal inti bersama.';return;}
    }
    w.textContent='';
    document.getElementById('gatewrap').style.display='none';
    document.getElementById('quizwrap').style.display='block';
    document.getElementById('whoCard').innerHTML='<b>'+esc(nama)+'</b><span class="dotsep"></span>Kelas '+esc(kelas)+(val('stAbsen')?'<span class="dotsep"></span>Absen '+esc(val('stAbsen')):'');
    initCanvas();
    resetGame();
    requestFS(); startTimer();
    if(!G.raf)G.raf=requestAnimationFrame(frame);
  }

  function initCanvas(){
    if(cv)return;
    cv=document.getElementById('cv'); ctx=cv.getContext('2d');
    resize(); window.addEventListener('resize',resize);
    G.stars=[]; for(var i=0;i<150;i++)G.stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.7+0.4,l:i%3});
    G.rocks=[]; for(var j=0;j<10;j++)G.rocks.push({x:Math.random()*W,y:Math.random()*H,r:18+Math.random()*46,a:Math.random()*6.28,rot:(Math.random()-0.5)*0.5,verts:makeRockVerts()});
    cv.addEventListener('pointerdown',onPointerMove);
    cv.addEventListener('pointermove',onPointerMove);
    document.getElementById('upBtn').addEventListener('pointerdown',function(e){e.preventDefault();keys.up=1;});
    document.getElementById('downBtn').addEventListener('pointerdown',function(e){e.preventDefault();keys.down=1;});
    window.addEventListener('pointerup',function(){keys.up=0;keys.down=0;});
    window.addEventListener('pointercancel',function(){keys.up=0;keys.down=0;});
  }

  function onPointerMove(e){
    if(mode!=='play')return;
    if(e.clientY==null)return;
    var r=cv.getBoundingClientRect();
    G.targetY=Math.max(shipR+6,Math.min(H-shipR-6,e.clientY-r.top));
  }

  function resize(){
    if(!cv)return;
    var p=cv.parentNode;
    W=Math.max(320,Math.round(p.clientWidth||window.innerWidth||800));
    H=Math.max(320,Math.round(p.clientHeight||window.innerHeight||600));
    DPR=Math.min(2,window.devicePixelRatio||1);
    cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    scale=Math.max(0.72,Math.min(1.25,Math.min(W,H)/720));
    baseSpd=Math.max(150,Math.min(300,W*0.26));
    shipR=Math.round(15*scale);
    G.shipX=Math.max(70,Math.round(W*0.22));
    G.targetY=Math.max(shipR+6,Math.min(H-shipR-6,G.targetY||H/2));
    G.shipY=Math.max(shipR+6,Math.min(H-shipR-6,G.shipY||H/2));
  }

  function resetGame(){
    if(SHUFFLE)randomizeQuestions();
    G.correct=0;G.answered=0;G.answers={};G.manual=0;G.qIndex=0;G.lives=NYAWA;G.invuln=0;G.ast=[];G.box=null;G.finish=null;G.shake=0;G.flash=0;G.missT=0;G.damage=0;G.hitT=0;G.hudLives=null;G.spawnT=0.35;G.lastTs=0;
    G.shipY=H/2;G.targetY=H/2;
    hideEl('qOv'); hideEl('crashOv'); hideEl('result');
    document.getElementById('quizwrap').style.display='block';
    if(NQ>0)G.box={x:W+90,y:boxY()}; else G.finish={x:W+140};
    mode='play'; updateHud();
  }

  function updateHud(){
    var c=document.getElementById('hudCount'); if(c)c.textContent='Soal '+Math.min(NQ,G.qIndex+1)+' / '+NQ;
    var b=document.getElementById('hudBar'); if(b)b.style.width=(NQ?Math.round(G.answered/NQ*100):0)+'%';
    var s=document.getElementById('hudScore'); if(s)s.textContent=G.correct*PER;
    var l=document.getElementById('lives');
    if(l&&G.hudLives!==G.lives){
      var bi=(G.hudLives!=null&&G.lives<G.hudLives)?G.lives:null;
      l.innerHTML=livesHTML(G.lives,bi); G.hudLives=G.lives;
    }
    var w=document.getElementById('hudWarn'); if(w)w.style.display=G.damage>0?'block':'none';
  }

  function frame(ts){
    if(!G.lastTs)G.lastTs=ts;
    var dt=Math.min(0.05,(ts-G.lastTs)/1000); G.lastTs=ts;
    if(mode==='play')stepPlay(dt);
    scrollStars(dt);
    draw();
    G.raf=requestAnimationFrame(frame);
  }

  function stepPlay(dt){
    var spd=baseSpd+Math.min(150,G.qIndex*11);
    if(keys.up)G.targetY-=520*dt;
    if(keys.down)G.targetY+=520*dt;
    G.targetY=Math.max(shipR+6,Math.min(H-shipR-6,G.targetY));
    G.shipY+=(G.targetY-G.shipY)*Math.min(1,dt*11);
    if(G.invuln>0)G.invuln-=dt;
    if(G.shake>0)G.shake-=dt;
    if(G.flash>0)G.flash-=dt;
    for(var i=0;i<G.ast.length;i++){var a=G.ast[i];a.x-=spd*a.f*dt;a.rot+=a.rotv*dt;}
    G.spawnT-=dt;
    if(G.spawnT<=0 && !(G.box && G.box.x<W*0.6)){
      spawnAst(); if(Math.random()<0.55)spawnAst(); if(Math.random()<0.25)spawnAst();
      G.spawnT=(0.28+Math.random()*0.46)*Math.max(0.4,0.95-G.qIndex*0.06);
    }
    if(G.missT>0)G.missT-=dt;
    if(G.hitT>0)G.hitT-=dt;
    if(G.box){
      G.box.x-=spd*dt;
      if(G.box.x<=G.shipX+6){
        if(Math.abs(G.shipY-G.box.y)<=shipR+26*scale+8){G.box=null;openQuestion(QS[G.qIndex]);return;}
        G.box=null;missBox();return;
      }
    }
    if(G.finish){
      G.finish.x-=spd*dt;
      if(G.finish.x<=G.shipX+6){G.finish=null;submit();return;}
    }
    if(G.invuln<=0){
      for(var j=0;j<G.ast.length;j++){var b=G.ast[j];var dx=b.x-G.shipX,dy=b.y-G.shipY;
        if(Math.sqrt(dx*dx+dy*dy)<b.r+shipR-3){hitShip(j);break;}}
    }
    G.ast=G.ast.filter(function(x){return x.x>-100;});
  }

  function spawnAst(){
    var r=(12+Math.random()*20)*scale;
    G.ast.push({x:W+40+Math.random()*140,y:r+8+Math.random()*(H-2*r-16),r:r,f:0.9+Math.random()*0.5,rot:Math.random()*6.28,rotv:(Math.random()-0.5)*2.2,verts:makeRockVerts()});
  }

  function hitShip(idx){
    var a=G.ast[idx]; if(!a)return;
    G.ast.splice(idx,1);
    G.invuln=1.6; G.shake=0.5; G.flash=0.45;
    G.damage=(G.damage||0)+1;
    if(G.damage>=2){
      G.damage=0; G.lives--; G.hitT=1.5; G.hitMsg='Tabrakan! Nyawa -1';
    } else {
      G.hitT=1.5; G.hitMsg='Peringatan! 1x lagi menabrak = nyawa -1';
    }
    updateHud();
    if(G.lives<=0)crash();
  }

  function boxY(){return Math.max(70,Math.min(H-70,H*0.5+(Math.random()-0.5)*H*0.7));}

  function missBox(){
    G.lives--; G.invuln=1.4; G.shake=0.5; G.flash=0.5; G.missT=1.4;
    updateHud();
    if(G.lives<=0){crash();return;}
    G.box={x:W+90,y:boxY()}; G.targetY=G.shipY;
  }

  function crash(){
    mode='crash';
    var ov=document.getElementById('crashOv');
    ov.innerHTML='<div class="ovcard nice"><div class="boom"></div><h2>Pesawat Rusak!</h2><p>Nyawa habis karena menabrak batu atau melewatkan kotak soal. Misi diulang dari soal pertama dengan urutan soal baru. Semangat!</p><button class="btn" id="crashBtn">Coba Lagi</button></div>';
    ov.style.display='flex';
    document.getElementById('crashBtn').addEventListener('click',restartMission);
  }

  function restartMission(){
    hideEl('crashOv');
    G.qIndex=0;G.correct=0;G.answered=0;G.answers={};G.manual=0;
    if(SHUFFLE)randomizeQuestions();
    G.lives=NYAWA;G.invuln=2;G.ast=[];G.shake=0;G.flash=0;G.missT=0;G.damage=0;G.hitT=0;G.hudLives=null;
    G.finish=null;G.box=null;
    if(NQ>0)G.box={x:W+90,y:boxY()}; else G.finish={x:W+140};
    mode='play'; updateHud();
  }

  function openQuestion(q){
    mode='question';
    var ov=document.getElementById('qOv');
    var h='<div class="qcard"><div class="qhead"><span class="qbadge">Kotak Soal '+q.no+'</span><span class="qtype">'+typeLabel(q.type)+'</span></div>'+
      '<div class="qstem">'+nl2br(q.stem)+'</div>'+
      (q.image?'<div class="qimg"><img src="'+esc(q.image)+'" alt="Gambar soal '+q.no+'"></div>':'')+
      '<div class="qopts" id="qOpts">'+optionsHTML(q)+'</div>'+
      '<div class="qfoot" id="qFoot"><button class="btn" id="qSubmit">Kirim Jawaban</button><span class="qhint">1x kesempatan &bull; benar +'+PER+' poin</span></div></div>';
    ov.innerHTML=h; ov.style.display='flex';
    document.getElementById('qSubmit').addEventListener('click',qSubmit);
    updateHud();
  }

  function readAnswer(q){
    var t=q.type;
    if(t==='pg'||t==='bs'){var el=document.querySelector('#qOv input[name="sq_'+q.id+'"]:checked');return el?el.value:'';}
    if(t==='pgk'){var els=document.querySelectorAll('#qOv input[name="sq_'+q.id+'"]:checked');return Array.prototype.map.call(els,function(e){return e.value;});}
    if(t==='menjodohkan'){var m={};(q.pairs||[]).forEach(function(p,i){var s=document.getElementById('mj_'+q.id+'_'+i);m[i]=s?s.value:'';});return m;}
    var e2=document.getElementById('in_'+q.id);return e2?e2.value:'';
  }

  function scoreAnswer(q,ans){
    var t=q.type;
    if(t==='pg'||t==='bs')return ans!=null&&String(ans).toUpperCase()===String(q.answer||'').toUpperCase();
    if(t==='pgk'){var a=(Array.isArray(ans)?ans:[]).map(function(x){return String(x).toUpperCase();}).sort().join(',');var c=String(q.answer||'').split(/[,\\s]+/).filter(Boolean).map(function(x){return String(x).toUpperCase();}).sort().join(',');return a!==''&&a===c;}
    if(t==='isian'){function n(s){return String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]+/g,'').trim();}return n(ans)===n(q.answer);}
    if(t==='menjodohkan'){var ok=(q.pairs||[]).length>0;(q.pairs||[]).forEach(function(p,i){if(String((ans||{})[i]||'')!==String(p.right||''))ok=false;});return ok;}
    return null;
  }

  function correctText(q){
    var t=q.type;
    if(t==='pg'||t==='bs'){var opt=(q.options||[]).filter(function(o){return String(o.key).toUpperCase()===String(q.answer||'').toUpperCase();});return opt.length?opt[0].key+'. '+esc(opt[0].text):esc(q.answer||'');}
    if(t==='pgk')return esc(String(q.answer||'').split(/[,\\s]+/).filter(Boolean).join(', '));
    if(t==='isian')return esc(q.answer||'');
    if(t==='menjodohkan')return esc((q.pairs||[]).map(function(p){return p.left+' \\u2192 '+p.right;}).join('; '));
    return '';
  }

  function qSubmit(){
    var q=QS[G.qIndex]; if(!q)return;
    var ans=readAnswer(q), s=scoreAnswer(q,ans);
    G.answers[q.id]=ans; G.answered++;
    if(s===true)G.correct++; else if(s===null)G.manual++;
    var opts=document.getElementById('qOpts');
    if(opts){Array.prototype.forEach.call(opts.querySelectorAll('input,textarea,select'),function(el){el.disabled=true;});}
    var fb;
    if(s===true)fb='<p class="fb ok">Benar! +'+PER+' poin</p>';
    else if(s===false){fb='<p class="fb no">Belum tepat. Poin tidak bertambah.</p><p class="fbc">Kunci jawaban tidak ditampilkan. Tetap semangat!</p>';}
    else fb='<p class="fb">Jawaban tersimpan. Soal ini akan dinilai guru.</p>';
    var foot=document.getElementById('qFoot');
    if(foot)foot.innerHTML=fb+'<button class="btn" id="qNext">'+(G.qIndex+1>=NQ?'Lihat Hasil':'Lanjut Terbang')+'</button>';
    document.getElementById('qNext').addEventListener('click',closeQuestion);
    updateHud();
  }

  function closeQuestion(){
    hideEl('qOv');
    G.qIndex++;
    if(G.qIndex>=NQ)G.finish={x:W+140};
    else G.box={x:W+90,y:boxY()};
    mode='play'; G.targetY=G.shipY; updateHud();
  }

  function requestFS(){
    try{var el=document.documentElement;if(el.requestFullscreen){fsWanted=true;var p=el.requestFullscreen();if(p&&p.catch)p.catch(function(){});}}catch(e){}
  }
  function startTimer(){
    var el=document.getElementById('timer');
    if(!(Number(meta.durasi)>0)){if(el)el.style.display='none';return;}
    left=Number(meta.durasi)*60;
    if(timerId)clearInterval(timerId);
    tick();timerId=setInterval(tick,1000);
  }
  function tick(){
    if(submitted){if(timerId)clearInterval(timerId);return;}
    var el=document.getElementById('timer');if(!el)return;
    el.textContent='Sisa Waktu '+fmtClock(left);
    if(left<=0){submit();return;}
    left--;
  }
  function resetTimer(){left=Number(meta.durasi)>0?Number(meta.durasi)*60:0;var el=document.getElementById('timer');if(el&&left)el.textContent='Sisa Waktu '+fmtClock(left);}
  function resumeTimer(){if(!(Number(meta.durasi)>0))return;if(timerId)clearInterval(timerId);timerId=setInterval(tick,1000);}

  function activePhase(){return mode==='play'||mode==='question';}

  function makeData(ans,benar,total,skor,manual,extra){
    var d={id:quiz.id,judul:meta.judul||'',nama:val('stNama'),kelas:val('stKelas'),absen:val('stAbsen'),answers:ans,benar:benar,total:total,skor:skor,manual:manual,violation:violation,jenis:'pesawat-tempur',startedAt:started,submittedAt:Date.now(),durasi:Math.round((Date.now()-started)/1000)};
    if(extra)for(var k in extra)d[k]=extra[k];
    return d;
  }
  function stopLoop(){if(G.raf){cancelAnimationFrame(G.raf);G.raf=0;}if(timerId)clearInterval(timerId);}

  function submit(){
    if(submitted)return;submitted=true;stopLoop();
    var data=makeData(G.answers,G.correct,NQ,G.correct*PER,G.manual,{forced:false});
    window.__lastData=data; window.__sendState=send(data); showResult(data,false);
  }
  function forceZero(reason){
    if(submitted)return;submitted=true;stopLoop();
    var data=makeData(G.answers,0,NQ,0,G.manual,{forced:true,reason:reason||''});
    window.__lastData=data; window.__sendState=send(data); showResult(data,true);
  }

  var QKEY='adik_pending_v1';
  function readQueue(){try{var q=JSON.parse(localStorage.getItem(QKEY)||'[]');return Array.isArray(q)?q:[];}catch(e){return [];}}
  function writeQueue(q){try{localStorage.setItem(QKEY,JSON.stringify(q));}catch(e){}}
  function queueSize(){return readQueue().length;}
  function postResult(d){
    var fd=new URLSearchParams();fd.append('action','submit');fd.append('payload',b64(JSON.stringify(d)));
    if(navigator.sendBeacon){return!!navigator.sendBeacon(endpoint,fd);}
    try{fetch(endpoint,{method:'POST',mode:'no-cors',body:fd});return true;}catch(e){return false;}
  }
  function send(data){
    if(!endpoint)return 'none';
    var ok=false;
    try{if(navigator.onLine!==false)ok=postResult(data);}catch(e){ok=false;}
    if(!ok){var q=readQueue();q.push({t:Date.now(),d:data});writeQueue(q);}
    return ok?'sent':'queued';
  }
  function flushQueue(){
    if(!endpoint||navigator.onLine===false)return 0;
    var q=readQueue();if(!q.length)return 0;
    var left=[];
    for(var i=0;i<q.length;i++){var ok=false;try{ok=postResult(q[i].d);}catch(e){}if(!ok)left.push(q[i]);}
    writeQueue(left);
    var sent=q.length-left.length;
    if(sent>0&&window.__sendState==='queued')window.__sendState='sent';
    patchResult();
    return sent;
  }
  function patchResult(){
    var m=document.getElementById('resMsg');
    if(m&&window.__sendState==='sent'&&/Tidak ada koneksi/.test(m.textContent)){m.className='muted';m.textContent='Jawaban sudah terkirim ke guru.';}
    var qq=document.getElementById('resQueue');
    if(qq){var n=queueSize();if(n){qq.style.display='block';qq.textContent='Menunggu koneksi: '+n+' jawaban sedang antre dikirim ke guru.';}else{qq.style.display='none';qq.textContent='';}}
  }

  function showResult(data,forced){
    var code=b64(JSON.stringify({id:data.id,judul:data.judul,nama:data.nama,kelas:data.kelas,absen:data.absen,benar:data.benar,total:data.total,skor:data.skor,manual:data.manual||0,jenis:data.jenis,waktu:new Date(data.submittedAt||Date.now()).toISOString().slice(0,16)})).split('+').join('-').split('/').join('_').replace(/=+$/,'');
    var r=document.getElementById('result');
    var total=data.total||NQ, pct=total?Math.round(data.benar*100/total):0;
    var stars=forced?0:(pct>=80?3:pct>=60?2:pct>=40?1:0);
    var starHtml='';
    for(var s=0;s<3;s++){starHtml+='<span class="'+(s<stars?'on':'off')+'">&#9733;</span>';}
    var cheer=forced?'Tetap semangat! Jangan menyerah, coba lagi ya!':(pct>=80?'Luar biasa, kamu pilot hebat!':pct>=60?'Hebat! Teruskan semangat belajar!':pct>=40?'Bagus! Sedikit lagi pasti bisa!':'Jangan menyerah, coba lagi ya!');
    var h='<div class="card done result-card">';
    h+='<div class="res-stars">'+starHtml+'</div>';
    h+='<div class="res-medal'+(forced?' bad':'')+'"><span class="res-num">'+data.skor+'</span><span class="res-unit">poin</span></div>';
    h+='<h2>'+(forced?'Misi Dihentikan':'Finish! Misi Selesai')+'</h2>';
    h+='<p class="res-cheer">'+cheer+'</p>';
    if(forced){h+='<p class="muted">Nilai otomatis 0 karena meninggalkan aplikasi atau keluar dari layar penuh.</p>';}
    else{h+='<p class="muted">'+data.benar+' dari '+total+' jawaban benar'+(data.manual?' &bull; '+data.manual+' soal dinilai guru':'')+'</p>';}
    var st=window.__sendState||(endpoint?'sent':'none');
    var msg=st==='sent'?'Jawaban sudah terkirim ke guru.':
      st==='queued'?'Tidak ada koneksi - jawaban disimpan di perangkatmu dan otomatis terkirim saat kembali online.':
      'Belum ada endpoint guru - salin kode hasil di bawah, lalu kirim ke guru agar hasilmu direkap.';
    h+='<p class="muted'+(st==='queued'?' res-warn':'')+'" id="resMsg">'+msg+'</p>';
    var qs=queueSize();
    h+='<p class="tiny muted" id="resQueue" style="'+(qs?'':'display:none')+'">'+(qs?'Menunggu koneksi: '+qs+' jawaban sedang antre dikirim ke guru.':'')+'</p>';
    var base=location.href.split('#')[0],hosted=/^https?:/i.test(base);
    h+='<div class="res-share"><label>Kode hasil untuk guru</label>';
    h+='<textarea class="code res-link" id="rescode" readonly>'+esc(code)+'</textarea>';
    h+='<div class="res-share-btns"><button class="btn" id="copycode">Salin Kode</button></div>';
    if(hosted){
      h+='<label>Link untuk guru</label>';
      h+='<textarea class="code res-link" id="reslink" readonly>'+esc(base+'#nilai='+code)+'</textarea>';
      h+='<div class="res-share-btns"><button class="btn" id="copylink">Salin Link</button></div>';
    }else{
      h+='<p class="tiny muted">File dibuka secara lokal, jadi link tidak tersedia. Cukup kirim kode di atas ke guru.</p>';
    }
    h+='</div></div>';
    r.innerHTML=h; r.style.display='block';
    hideEl('quizwrap'); hideEl('qOv'); hideEl('crashOv');
    function copyEl(id,btn,label){var t=document.getElementById(id);if(!t)return;t.select();try{document.execCommand('copy');}catch(e){}if(navigator.clipboard)navigator.clipboard.writeText(t.value||t.textContent);btn.textContent=label||'Tersalin';}
    var cc=document.getElementById('copycode');if(cc)cc.addEventListener('click',function(){copyEl('rescode',cc);});
    var cl=document.getElementById('copylink');if(cl)cl.addEventListener('click',function(){copyEl('reslink',cl);});
    window.scrollTo(0,0);
  }

  function hideEl(id){var e=document.getElementById(id);if(e)e.style.display='none';}
  function showEl(id){var e=document.getElementById(id);if(e)e.style.display='block';}

  function showOverlay(title,msg,btn,cb){
    var ov=document.getElementById('secOv');
    ov.innerHTML='<div class="ovcard"><h2>'+esc(title)+'</h2><p>'+msg+'</p><button class="btn" id="ovBtn">'+esc(btn)+'</button></div>';
    ov.style.display='flex';
    document.getElementById('ovBtn').onclick=cb;
  }
  function hideOverlay(){hideEl('secOv');}

  function triggerViol(reason){
    if(!activePhase()||submitted)return;
    var now=Date.now();if(now-lastViol<1500)return;lastViol=now;
    onViolation(reason);
  }
  function onViolation(reason){
    if(!activePhase()||submitted)return;
    violation++;
    if(timerId)clearInterval(timerId);
    if(violation>=2){forceZero(reason);return;}
    mode='paused';
    showOverlay('Peringatan Keamanan','Anda terdeteksi <b>'+esc(reason)+'</b>. Permainan diulang dari awal dan skor menjadi <b>0</b>. Jika terulang lagi, jawaban langsung dikumpulkan dengan nilai <b>0</b>.','Mulai Ulang',function(){
      hideOverlay();resetGame();requestFS();resumeTimer();
    });
  }

  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  document.addEventListener('copy',function(e){if(e.target&&(e.target.id==='rescode'||e.target.id==='reslink'))return;e.preventDefault();});
  document.addEventListener('cut',function(e){e.preventDefault();});
  document.addEventListener('paste',function(e){if(mode!=='gate')e.preventDefault();});
  document.addEventListener('selectstart',function(e){var t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;e.preventDefault();});
  document.addEventListener('dragstart',function(e){e.preventDefault();});
  document.addEventListener('keydown',function(e){
    var k=String(e.key||'').toLowerCase(), mod=e.ctrlKey||e.metaKey, b=false;
    if(k==='arrowup'||k==='w'){keys.up=1;if(mode==='play')e.preventDefault();}
    if(k==='arrowdown'||k==='s'){keys.down=1;if(mode==='play')e.preventDefault();}
    if(e.key==='F12')b=true;
    if(mod&&['c','v','x','a','p','s','u','g','f'].indexOf(k)>=0)b=true;
    if(mod&&e.shiftKey&&['i','j','c','k'].indexOf(k)>=0)b=true;
    if(b){e.preventDefault();return false;}
  });
  document.addEventListener('keyup',function(e){var k=String(e.key||'').toLowerCase();if(k==='arrowup'||k==='w')keys.up=0;if(k==='arrowdown'||k==='s')keys.down=0;});
  document.addEventListener('fullscreenchange',function(){var fs=!!document.fullscreenElement;if(activePhase()&&fsWanted&&!fs){triggerViol('keluar dari layar penuh');}});
  document.addEventListener('visibilitychange',function(){if(activePhase()&&document.hidden){triggerViol('berpindah tab/aplikasi');}});
  window.addEventListener('blur',function(){if(!activePhase())return;setTimeout(function(){if(activePhase()&&!document.hasFocus())triggerViol('keluar dari aplikasi');},160);});

  function makeRockVerts(){var n=7+Math.floor(Math.random()*4),v=[];for(var i=0;i<n;i++){v.push({a:i/n*6.283,l:0.78+Math.random()*0.4});}return v;}
  function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function drawNebula(x,y,color,r){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();}
  function drawPlanet(x,y,r){var g=ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.2,x,y,r);g.addColorStop(0,'#a5b4fc');g.addColorStop(0.6,'#6d28d9');g.addColorStop(1,'#2e1065');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();ctx.save();ctx.translate(x,y);ctx.rotate(-0.35);ctx.strokeStyle='rgba(196,181,253,0.55)';ctx.lineWidth=Math.max(2,r*0.09);ctx.beginPath();ctx.ellipse(0,0,r*1.6,r*0.5,0,0,6.283);ctx.stroke();ctx.restore();}
  function drawRock(x,y,r,rot,fill,stroke,verts){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.beginPath();for(var i=0;i<verts.length;i++){var p=verts[i],px=Math.cos(p.a)*r*p.l,py=Math.sin(p.a)*r*p.l;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.closePath();var g=ctx.createRadialGradient(-r*0.3,-r*0.3,r*0.15,0,0,r*1.1);g.addColorStop(0,fill);g.addColorStop(1,stroke);ctx.fillStyle=g;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.stroke();ctx.fillStyle='rgba(0,0,0,0.16)';ctx.beginPath();ctx.arc(-r*0.2,-r*0.1,r*0.22,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(r*0.25,r*0.2,r*0.15,0,6.283);ctx.fill();ctx.restore();}
  function drawBox(x,y){var s=Math.max(20,26*scale),pulse=1+Math.sin(Date.now()/280)*0.06;ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);var g=ctx.createRadialGradient(0,0,0,0,0,s*2.4);g.addColorStop(0,'rgba(255,206,84,0.55)');g.addColorStop(1,'rgba(255,206,84,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,s*2.4,0,6.283);ctx.fill();roundRect(-s,-s,s*2,s*2,9);var bg=ctx.createLinearGradient(-s,-s,s,s);bg.addColorStop(0,'#ffd24a');bg.addColorStop(1,'#ff9f1c');ctx.fillStyle=bg;ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#b45309';ctx.stroke();ctx.strokeStyle='rgba(180,83,9,0.75)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(0,s);ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.stroke();ctx.fillStyle='#7c2d12';ctx.font='bold '+Math.round(s*1.2)+'px Segoe UI, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',0,1);ctx.restore();}
  function drawFinish(x){var w=Math.max(90,110*scale),hh=H*0.72,top=(H-hh)/2;ctx.save();ctx.translate(x,0);var g=ctx.createLinearGradient(0,top,0,top+hh);g.addColorStop(0,'rgba(52,211,153,0.12)');g.addColorStop(0.5,'rgba(52,211,153,0.5)');g.addColorStop(1,'rgba(52,211,153,0.12)');ctx.fillStyle=g;ctx.fillRect(-w/2,top,w,hh);ctx.fillStyle='#34d399';ctx.fillRect(-w/2-8,top,8,hh);ctx.fillRect(w/2,top,8,hh);ctx.save();ctx.translate(0,H/2);ctx.rotate(-Math.PI/2);ctx.fillStyle='#eafff5';ctx.font='bold '+Math.round(26*scale)+'px Segoe UI, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('FINISH',0,0);ctx.restore();ctx.restore();}
  function drawShip(){var blink=G.invuln>0&&Math.floor(Date.now()/110)%2===0;ctx.save();ctx.translate(G.shipX,G.shipY);ctx.scale(scale,scale);var fl=1+Math.sin(Date.now()/45)*0.3;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-26*fl,-7);ctx.lineTo(-20,0);ctx.lineTo(-26*fl,7);ctx.closePath();ctx.fillStyle='rgba(255,170,60,0.95)';ctx.fill();ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-18*fl,-4);ctx.lineTo(-14,0);ctx.lineTo(-18*fl,4);ctx.closePath();ctx.fillStyle='rgba(255,240,170,0.95)';ctx.fill();if(blink){ctx.restore();return;}ctx.beginPath();ctx.moveTo(2,-4);ctx.lineTo(-8,-20);ctx.lineTo(4,-18);ctx.lineTo(10,-4);ctx.closePath();ctx.fillStyle='#cbd8ff';ctx.fill();ctx.beginPath();ctx.moveTo(2,4);ctx.lineTo(-8,20);ctx.lineTo(4,18);ctx.lineTo(10,4);ctx.closePath();ctx.fillStyle='#cbd8ff';ctx.fill();ctx.beginPath();ctx.moveTo(24,0);ctx.quadraticCurveTo(6,-11,-10,-7);ctx.quadraticCurveTo(-16,0,-10,7);ctx.quadraticCurveTo(6,11,24,0);ctx.closePath();var bg=ctx.createLinearGradient(-10,-10,24,10);bg.addColorStop(0,'#9fd0ff');bg.addColorStop(1,'#3b82f6');ctx.fillStyle=bg;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#1e3a8a';ctx.stroke();ctx.beginPath();ctx.ellipse(8,-1,6,4,0,0,6.283);ctx.fillStyle='#0b2a5a';ctx.fill();ctx.fillStyle='rgba(159,208,255,0.85)';ctx.beginPath();ctx.ellipse(9,-2,3,2,0,0,6.283);ctx.fill();ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(-16,-14);ctx.lineTo(-10,-6);ctx.closePath();ctx.fillStyle='#ef4444';ctx.fill();ctx.restore();}

  function scrollStars(dt){
    var s=baseSpd*(mode==='play'?1:0.45);
    for(var i=0;i<G.stars.length;i++){var st=G.stars[i];st.x-=(s*(0.15+st.l*0.18))*dt;if(st.x<-4){st.x=W+4;st.y=Math.random()*H;}}
    for(var j=0;j<G.rocks.length;j++){var rk=G.rocks[j];rk.x-=(s*0.22)*dt;rk.a+=rk.rot*dt;if(rk.x<-rk.r){rk.x=W+rk.r;rk.y=Math.random()*H;}}
  }

  function draw(){
    if(!ctx)return;
    ctx.save();
    if(G.shake>0){var m=G.shake*10;ctx.translate((Math.random()-0.5)*m,(Math.random()-0.5)*m);}
    var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0f2e');bg.addColorStop(0.5,'#12184a');bg.addColorStop(1,'#1b1145');ctx.fillStyle=bg;ctx.fillRect(-20,-20,W+40,H+40);
    drawNebula(W*0.25,H*0.3,'rgba(99,102,241,0.30)',W*0.5);
    drawNebula(W*0.82,H*0.72,'rgba(236,72,153,0.20)',W*0.45);
    drawNebula(W*0.6,H*0.14,'rgba(34,211,238,0.16)',W*0.4);
    drawPlanet(W*0.82,H*0.24,Math.max(46,H*0.10));
    for(var j=0;j<G.rocks.length;j++){var rk=G.rocks[j];drawRock(rk.x,rk.y,rk.r*0.7,rk.a,'#3a4170','#252a4d',rk.verts);}
    for(var i=0;i<G.stars.length;i++){var st=G.stars[i];ctx.globalAlpha=0.35+st.l*0.25;ctx.fillStyle='#dbeafe';ctx.beginPath();ctx.arc(st.x,st.y,st.r,0,6.283);ctx.fill();}
    ctx.globalAlpha=1;
    for(var k=0;k<G.ast.length;k++){var a=G.ast[k];drawRock(a.x,a.y,a.r,a.rot,'#9aa0ad','#5c6173',a.verts);}
    if(G.box)drawBox(G.box.x,G.box.y);
    if(G.finish)drawFinish(G.finish.x);
    if(G.damage>0){var pu=0.5+0.5*Math.sin(Date.now()/200);ctx.save();ctx.globalAlpha=0.4+pu*0.45;ctx.strokeStyle='#ff4d6d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(G.shipX,G.shipY,shipR+11+pu*5,0,6.283);ctx.stroke();ctx.restore();}
    drawShip();
    if(G.flash>0){ctx.fillStyle='rgba(255,80,80,'+(G.flash*0.55)+')';ctx.fillRect(0,0,W,H);}
    if(G.hitT>0){ctx.globalAlpha=Math.min(1,G.hitT);ctx.fillStyle='#ffe0e6';ctx.font='bold '+Math.round(22*scale)+'px Segoe UI, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(G.hitMsg,W/2,H*0.24);ctx.globalAlpha=1;}
    if(G.missT>0){ctx.globalAlpha=Math.min(1,G.missT);ctx.fillStyle='#ffd7d7';ctx.font='bold '+Math.round(24*scale)+'px Segoe UI, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Kotak Soal Terlewat! -1 Nyawa',W/2,H*0.15);ctx.globalAlpha=1;}
    ctx.restore();
  }

  if(P.test){
    window.__g={
      setGate:function(n,k,a){var e=document.getElementById('stNama');if(e)e.value=n;var kk=document.getElementById('stKelas');if(kk)kk.value=k;var aa=document.getElementById('stAbsen');if(aa)aa.value=a||'';},
      start:function(){var b=document.getElementById('btnStart');if(b)b.click();},
      calm:function(){G.ast=[];G.invuln=9999;G.spawnT=9999;},
      queue:function(){return queueSize();},
      flush:function(){return flushQueue();},
      sendState:function(){return window.__sendState||null;},
      setEndpoint:function(v){endpoint=v||'';},
      connPill:function(){var p=document.getElementById('connPill');return p?{cls:p.className,txt:p.textContent}:null;},
      jump:function(){if(G.box){G.box.x=G.shipX-2;G.box.y=G.shipY;}stepPlay(0.016);},
      moving:function(){return !!G.box;},
      current:function(){var q=QS[G.qIndex];return q?{id:q.id,no:q.no,type:q.type,answer:q.answer}:null;},
      order:function(){return QS.map(function(q){return q.id;});},
      reshuffle:function(){if(mode!=='gate'&&mode!=='crash')return QS.map(function(q){return q.id;});if(SHUFFLE)randomizeQuestions();return QS.map(function(q){return q.id;});},
      finishNow:function(){if(G.finish){G.finish.x=G.shipX-2;}stepPlay(0.016);},
      state:function(){return {mode:mode,qIndex:G.qIndex,correct:G.correct,score:G.correct*PER,lives:G.lives,answered:G.answered,finished:submitted,overlay:document.getElementById('qOv').style.display==='flex'};},
      pick:function(key){var q=QS[G.qIndex];if(!q)return;if(q.type==='pg'||q.type==='bs'||q.type==='pgk'){var els=document.querySelectorAll('#qOv input[name="sq_'+q.id+'"]');for(var i=0;i<els.length;i++){if(els[i].value===key)els[i].checked=true;}}else{var ip=document.getElementById('in_'+q.id);if(ip)ip.value=key;var mj=document.getElementById('mj_'+q.id+'_'+key);if(mj)mj.value=key;}},
      confirm:function(){var b=document.getElementById('qSubmit');if(b&&!b.disabled)b.click();},
      next:function(){var b=document.getElementById('qNext');if(b)b.click();},
      danger:function(){G.invuln=0;G.ast=[];G.ast.push({x:G.shipX,y:G.shipY,r:20,f:0,rot:0,rotv:0,verts:makeRockVerts()});stepPlay(0.016);},
      lives:function(){return G.lives;},
      crashOpen:function(){return document.getElementById('crashOv').style.display==='flex';},
      crashBtn:function(){var b=document.getElementById('crashBtn');if(b)b.click();},
      data:function(){return window.__lastData||null;}
    };
  }

  render();
})();
`;

var RUNTIME_CSS = `
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,Arial,sans-serif;color:#e7ecff;background:#050718;min-height:100vh;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;overflow-x:hidden}
.wrap{max-width:820px;margin:0 auto;padding:22px 15px 60px;position:relative;z-index:1}
.card{background:rgba(17,23,52,.72);border:1px solid rgba(125,165,255,.22);border-radius:18px;padding:20px;margin-bottom:16px;box-shadow:0 14px 46px rgba(2,6,23,.6),inset 0 0 0 1px rgba(255,255,255,.03);backdrop-filter:blur(6px)}
.card.center{text-align:center}
.title{margin:0 0 6px;font-size:22px;letter-spacing:.4px;background:linear-gradient(90deg,#7dd3fc,#a78bfa,#f0abfc);-webkit-background-clip:text;background-clip:text;color:transparent}
.muted{color:#9fb0d6;font-size:13px}
.tiny{color:#8794b8;font-size:11.5px;line-height:1.5;margin-top:12px}
.warn{color:#fca5a5;font-size:13px;min-height:18px;margin:8px 0 0}

/* gate */
.gatewrap::before{content:'';position:fixed;inset:0;z-index:-3;background-image:radial-gradient(1px 1px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 120px 90px,#cfe3ff,transparent),radial-gradient(1.6px 1.6px at 210px 50px,#fff,transparent),radial-gradient(1px 1px at 300px 170px,#a5b4fc,transparent),radial-gradient(1px 1px at 90px 210px,#fff,transparent),radial-gradient(1.3px 1.3px at 260px 260px,#fff,transparent);background-size:360px 300px;opacity:.85;animation:tw 7s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.5}50%{opacity:1}}
.gatewrap::after{content:'';position:fixed;inset:0;z-index:-2;background:radial-gradient(60% 45% at 12% 8%,rgba(56,189,248,.20),transparent 70%),radial-gradient(50% 50% at 92% 18%,rgba(167,139,250,.22),transparent 70%),radial-gradient(70% 60% at 50% 112%,rgba(236,72,153,.16),transparent 70%)}
.gate-card{padding-top:26px}
.game-logo{position:relative;width:180px;height:96px;margin:0 auto 6px}
.game-logo .rock{position:absolute;border-radius:40%;background:radial-gradient(circle at 32% 30%,#8a8f9c,#4b5062);box-shadow:inset 0 0 0 2px rgba(0,0,0,.2)}
.game-logo .r1{width:26px;height:24px;left:6px;top:12px}
.game-logo .r2{width:18px;height:17px;right:14px;top:6px}
.game-logo .r3{width:22px;height:20px;left:22px;bottom:8px}
.game-logo svg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);filter:drop-shadow(0 8px 18px rgba(59,130,246,.5))}
.game-title{font-size:30px;letter-spacing:2px;font-weight:900;background:linear-gradient(90deg,#7dd3fc,#a78bfa,#f0abfc);-webkit-background-clip:text;background-clip:text;color:transparent}
.gate-sub{color:#c7d2fe;font-size:13.5px;line-height:1.6;max-width:440px;margin:10px auto 4px}
.idbox{text-align:left;max-width:420px;margin:14px auto 0}
.idbox label{display:block;font-size:12.5px;font-weight:600;color:#c7d2fe;margin:12px 0 6px}
.idbox input,.idbox select,.fill{width:100%;padding:12px 13px;border:1px solid rgba(125,165,255,.3);border-radius:12px;font-size:16px;font-family:inherit;background:rgba(8,12,30,.85);color:#eef2ff;-webkit-user-select:text;user-select:text}
.idbox input:focus,.fill:focus{outline:none;border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,.2)}
option{background:#0b1224;color:#eef2ff}
.btn{background:linear-gradient(90deg,#2563eb,#7c3aed);color:#fff;border:0;padding:13px 28px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 10px 30px rgba(79,70,229,.5);letter-spacing:.3px}
.btn:hover{filter:brightness(1.1)}
.btn.big{width:100%;max-width:420px;margin-top:18px}
.btn.ghost{background:rgba(148,163,184,.2);color:#e7ecff;box-shadow:none}

/* game */
#quizwrap{position:fixed;inset:0;background:#050718;z-index:5}
#cv{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.hud{position:absolute;inset:0;pointer-events:none;z-index:6}
.hud-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:linear-gradient(180deg,rgba(5,8,24,.78),rgba(5,8,24,0))}
.hud-id{font-size:12.5px;color:#dbe4ff;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.hud-id b{color:#fff}
.dotsep{width:5px;height:5px;border-radius:50%;background:#7dd3fc;display:inline-block}
.hud-mid{flex:1;max-width:420px;text-align:center}
.hud-mid span{font-size:12px;color:#bcd0ff;font-weight:700}
.hud-prog{height:8px;background:rgba(148,163,184,.22);border-radius:99px;margin-top:6px;overflow:hidden}
.hud-prog>div{height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#a78bfa);transition:width .3s;box-shadow:0 0 14px rgba(56,189,248,.7)}
.hud-right{display:flex;align-items:center;gap:12px}
.hud-score{font-size:12.5px;color:#dbe4ff}.hud-score b{font-size:17px;color:#ffd24a}
.lives{display:inline-flex;gap:4px}
.lives{display:inline-flex;align-items:center;gap:5px}
.life{width:19px;height:19px;line-height:0;display:inline-block}
.life svg{width:100%;height:100%;display:block;transition:fill .2s,opacity .2s}
.life.on svg{fill:#ff4d6d;filter:drop-shadow(0 0 5px rgba(255,77,109,.85))}
.life.off svg{fill:#3b3b55;opacity:.7}
.life.breaking svg{fill:#ff4d6d;transform-origin:50% 60%;animation:heartbreak .95s cubic-bezier(.4,0,.6,1) forwards}
@keyframes heartbreak{0%{transform:scale(1) rotate(0);opacity:1}18%{transform:scale(1.4) rotate(-10deg)}34%{transform:scale(1.18) rotate(10deg)}52%{transform:scale(1.28) rotate(-14deg);opacity:.95}72%{transform:scale(.9) rotate(18deg);opacity:.6}100%{transform:scale(.45) rotate(32deg);opacity:0}}
.hud-warn{display:none;position:absolute;left:50%;top:62px;transform:translateX(-50%);max-width:88vw;font-size:12.5px;font-weight:700;color:#ffd7d7;background:rgba(120,10,30,.75);border:1px solid rgba(255,77,109,.6);padding:6px 14px;border-radius:99px;text-align:center;line-height:1.3;animation:pulseWarn 1s ease-in-out infinite}
@keyframes pulseWarn{0%,100%{opacity:.72}50%{opacity:1}}
.hud-timer{font-size:12.5px;font-weight:700;color:#7dd3fc;white-space:nowrap}
.hud-hint{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);font-size:12px;color:#a9b8e0;background:rgba(5,8,24,.55);padding:6px 12px;border-radius:99px;white-space:nowrap}
.pad{display:none}
.pbtn{pointer-events:auto;width:64px;height:64px;border-radius:50%;border:0;font-size:26px;font-weight:800;color:#0b1224;background:radial-gradient(circle at 35% 30%,#eaf2ff,#b9c9ff);box-shadow:0 8px 20px rgba(0,0,0,.4);cursor:pointer}
.pbtn:active{transform:scale(.94)}
@media (hover:none),(max-width:820px){
  .pad{display:flex;position:absolute;left:0;right:0;bottom:18px;justify-content:space-between;padding:0 18px;gap:12px}
  #downBtn{margin-left:auto}
  .hud-hint{bottom:96px}
  .hud-top{padding:8px 10px;gap:6px}
  .hud-id{font-size:11.5px;gap:4px}
  .hud-mid span{font-size:11px}
  .hud-right{gap:8px}
  .hud-score{font-size:11.5px}.hud-score b{font-size:15px}
  .hud-timer{font-size:11.5px}
  .lives{gap:3px}
  .life{width:15px;height:15px}
  .hud-warn{font-size:11px;padding:5px 11px;top:54px}
}

/* question overlay */
.overlay{position:fixed;inset:0;z-index:20;background:rgba(3,6,20,.82);display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(5px);overflow:auto}
.qcard{width:100%;max-width:580px;max-height:92vh;overflow:auto;background:linear-gradient(180deg,rgba(28,36,78,.98),rgba(17,22,52,.98));border:1px solid rgba(125,165,255,.35);border-radius:20px;padding:20px;box-shadow:0 24px 70px rgba(2,6,23,.75)}
.qhead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
.qbadge{background:linear-gradient(90deg,#f59e0b,#ef4444);padding:4px 14px;border-radius:99px;font-size:12.5px;font-weight:800;color:#fff}
.qtype{color:#a9b8e0;font-size:12px}
.qstem{font-size:16px;line-height:1.7;margin-bottom:14px}
.qimg{margin:0 0 14px}
.qimg img{max-width:100%;max-height:320px;border-radius:12px;border:1px solid rgba(125,165,255,.3);display:block;margin:0 auto}
.qopts .opt{display:flex;gap:11px;align-items:flex-start;padding:12px 14px;border:1px solid rgba(125,165,255,.22);border-radius:13px;margin-bottom:9px;cursor:pointer;background:rgba(8,12,30,.5);transition:.15s}
.qopts .opt:hover{border-color:#38bdf8;background:rgba(56,189,248,.1)}
.qopts .opt input{margin-top:3px;accent-color:#7c3aed}
.qopts .match{display:flex;gap:11px;align-items:center;margin-bottom:9px;flex-wrap:wrap}
.qopts .match .left{flex:1;min-width:120px;font-size:14px}
.qopts .match select{padding:10px;border:1px solid rgba(125,165,255,.3);border-radius:11px;font-size:16px;flex:1;min-width:150px;background:rgba(8,12,30,.85);color:#eef2ff}
textarea.fill{resize:vertical;min-height:90px}
.qfoot{margin-top:16px;display:flex;flex-direction:column;gap:10px;align-items:center}
.qhint{color:#8794b8;font-size:11.5px}
.fb{font-size:15px;font-weight:700;margin:0;text-align:center}
.fb.ok{color:#4ade80}.fb.no{color:#fca5a5}
.fbc{font-size:13.5px;color:#dbe4ff;text-align:center;margin:0}

/* crash */
.ovcard{max-width:460px;background:rgba(24,18,44,.97);border:1px solid rgba(248,113,113,.5);border-radius:18px;padding:26px;text-align:center;box-shadow:0 0 60px rgba(248,113,113,.35)}
.ovcard h2{margin:10px 0;color:#fca5a5}
.ovcard p{color:#e7ecff;font-size:14px;line-height:1.6}
.ovcard.nice{border-color:rgba(96,165,250,.5);box-shadow:0 0 60px rgba(96,165,250,.35)}
.ovcard.nice h2{color:#93c5fd}
.boom{width:64px;height:64px;margin:0 auto;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff,#fca5a5 45%,#ef4444);box-shadow:0 0 40px rgba(239,68,68,.8)}

/* result */
.resultwrap{position:fixed;inset:0;z-index:30;overflow:auto;padding:20px 15px 60px;background:radial-gradient(70% 60% at 50% 0%,rgba(56,189,248,.15),transparent 70%),#050718}
.done{text-align:center;max-width:640px;margin:20px auto 0}
.result-card{padding-top:26px}
.finish-flag{margin:0 auto 6px;width:96px}
.done h2{margin:0 0 8px;font-size:22px;background:linear-gradient(90deg,#7dd3fc,#a78bfa,#f0abfc);-webkit-background-clip:text;background-clip:text;color:transparent}
.score{font-size:16px}.score b{font-size:30px;color:#4ade80;text-shadow:0 0 18px rgba(74,222,128,.6)}
.zero b{color:#f87171;text-shadow:0 0 18px rgba(248,113,113,.6)}
.code{width:100%;height:120px;font-family:monospace;font-size:11px;margin:12px 0;padding:10px;border:1px solid rgba(125,165,255,.3);border-radius:12px;background:rgba(8,12,30,.85);color:#eef2ff;-webkit-user-select:text;user-select:text}
.result-card{background:linear-gradient(180deg,rgba(30,41,89,.97),rgba(17,22,52,.99));border:1px solid rgba(125,165,255,.42)}
.res-stars{font-size:40px;letter-spacing:8px;line-height:1;margin:0 0 10px}
.res-stars span{color:#3b3b55}
.res-stars span.on{color:#ffd24a;text-shadow:0 0 22px rgba(255,210,74,.75)}
.res-medal{width:150px;height:150px;margin:4px auto 14px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 40% 32%,#7dd3fc,#7c3aed 58%,#4c1d95);box-shadow:0 0 0 8px rgba(125,165,255,.14),0 18px 46px rgba(79,70,229,.6);animation:pop .5s ease}
.res-medal.bad{background:radial-gradient(circle at 40% 32%,#fca5a5,#ef4444 58%,#991b1b);box-shadow:0 0 0 8px rgba(248,113,113,.16),0 18px 46px rgba(153,27,27,.6)}
.res-num{font-size:56px;font-weight:900;color:#fff;line-height:1;text-shadow:0 4px 16px rgba(0,0,0,.45)}
.res-unit{font-size:12px;font-weight:800;letter-spacing:3px;color:#e6ecff;text-transform:uppercase;margin-top:2px}
.res-cheer{font-size:17px;font-weight:800;margin:8px 0 4px;color:#7dd3fc}
.res-id{margin:8px 0 0;font-weight:700}
.result-card label{display:block;font-size:12px;font-weight:700;color:#c7d2fe;margin:14px 0 6px;text-align:left}
.conn-pill{display:inline-block;font-size:12px;font-weight:700;padding:5px 13px;border-radius:99px;margin:4px 0 2px;border:1px solid transparent}
.conn-pill.on{background:rgba(34,197,94,.16);color:#86efac;border-color:rgba(34,197,94,.45)}
.conn-pill.off{background:rgba(245,158,11,.18);color:#fcd34d;border-color:rgba(245,158,11,.45)}
.conn-pill.man{background:rgba(148,163,184,.18);color:#cbd5e1;border-color:rgba(148,163,184,.4)}
.res-warn{color:#fcd34d !important;font-weight:600}
.res-share{margin-top:8px}
.res-link{height:96px}
.res-share-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px}
@keyframes pop{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
@media print{body{display:none!important}}
`.trim();


function buildStudentHTML(payload) {
  var json = JSON.stringify(payload).replace(/</g, "\\u003c");
  var head = "<!DOCTYPE html><html lang=\"id\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
    "<title>" + esc((payload.quiz && payload.quiz.meta && payload.quiz.meta.judul) || "Asesmen") + "</title>" +
    "<style>" + RUNTIME_CSS + "</style></head><body><div id=\"app\"></div>";
  var script = "<script>window.__PAYLOAD__=" + json + ";</" + "script>" +
    "<script>" + RUNTIME_JS + "</" + "script></body></html>";
  return head + script;
}

function shareModal(a) {
  a = a || getCurrent();
  if (!a) return;
  var hosted = /^https?:/i.test(location.href) && !/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(\/|$)/i.test(location.href);
  var hasEp = !!endpointUrl();
  var body = "";
  body += '<div class="mode-box mode-online">' +
    '<div class="mode-hd">' + ICON.send + "<b>MODE ONLINE</b> &mdash; Bagikan lewat Tautan</div>" +
    '<p class="mode-sub">Siswa membuka tautan di browser (butuh internet). Jawaban masuk Google Sheet secara otomatis' +
    (hasEp ? ".</p>" : " setelah endpoint diatur di menu <b>Rekap Nilai</b>.</p>") +
    '<div class="field"><label>Tautan kerjakan untuk siswa</label><textarea id="shLink" readonly style="min-height:64px;font-size:11px">Menyiapkan tautan...</textarea><span class="hint" id="shLinkInfo">Mengompres isi soal agar tautan sependek mungkin&hellip;</span></div>' +
    '<div class="q-actions"><button class="btn btn-light btn-sm" data-action="copyShare">' + ICON.copy + " Salin Tautan</button>" +
    '<button class="btn btn-light btn-sm" data-action="shareQR" data-id="' + a.id + '">' + ICON.qr + " QR untuk Siswa</button>" +
    '<button class="btn btn-light btn-sm" data-action="previewShare" data-id="' + a.id + '">' + ICON.eye + " Pratinjau</button>" +
    (hosted ? "" : '<span class="badge badge-amber">' + ICON.alert + " Belum di-hosting, tautan hanya terbuka di komputer ini</span>") +
    "</div>" +
    '<div id="shQR" class="qr-box" style="display:none"></div></div>';
  body += '<div class="mode-box mode-offline">' +
    '<div class="mode-hd">' + ICON.download + "<b>MODE OFFLINE</b> &mdash; Bagikan lewat File HTML</div>" +
    '<p class="mode-sub">Siswa <b>tidak perlu internet</b>. Unduh file, bagikan lewat WhatsApp/Google Drive/Bluetooth, lalu siswa buka file itu di browser apa pun.</p>' +
    '<ol class="mode-steps">' +
    "<li>Unduh file soal (tombol di bawah).</li>" +
    "<li>Kirim file ke siswa.</li>" +
    "<li>Siswa isi nama lalu kerjakan soal tanpa koneksi.</li>" +
    "<li>" + (hasEp
      ? "Waktu mengumpulkan: bila siswa <b>online</b> jawaban terkirim otomatis; bila <b>offline</b> hasil disimpan di perangkat dan terkirim saat kembali online, atau siswa <b>salin kode hasil</b> lalu kirim ke Anda."
      : "Setelah selesai, siswa <b>salin kode hasil</b> lalu kirim ke Anda.") + "</li>" +
    "<li>Guru: menu <b>Rekap Nilai</b> &rarr; <b>Impor Hasil</b> &rarr; tempel kode &rarr; Impor.</li>" +
    "</ol>" +
    '<div class="q-actions"><button class="btn btn-primary btn-sm" data-action="downloadShare" data-id="' + a.id + '">' + ICON.download + " Unduh File Soal (HTML)</button></div>" +
    "</div>";
  body += '<div class="field mt-16"><label>Status pengumpulan</label>' +
    '<div style="font-size:13px">' + (hasEp
      ? '<span class="badge badge-green">' + ICON.check + ' Endpoint Google Apps Script aktif</span> Jawaban siswa otomatis masuk ke Google Sheet.'
      : '<span class="badge badge-amber">' + ICON.alert + ' Endpoint belum diatur</span> Atur di menu <b>Rekap Nilai</b> agar jawaban otomatis terkumpul. Tanpa endpoint, siswa mengirim "kode hasil" untuk Anda impor.') + "</div></div>";
  if (!hosted) {
    body += '<div class="note note-warn mt-16">' + ICON.alert + "<div><strong>Aplikasi belum di-hosting</strong>Tautan Mode Online hanya bisa dibuka dari komputer ini. Untuk kelas, gunakan <b>Mode Offline</b> (unduh file), atau hosting dulu lewat Netlify Drop / GitHub Pages. Lihat <b>Panduan</b> di menu Rekap Nilai.</div></div>";
  }
  openModal(
    '<div class="modal-head"><h3>Bagikan Asesmen ke Siswa</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Tutup</button></div>',
    { wide: true }
  );
  studentLinkAsync(a, function (link, compressed, plainLen) {
    var el = document.getElementById("shLink");
    if (el) el.value = link;
    var info = document.getElementById("shLinkInfo");
    if (!info) return;
    var n = link.length, s = n.toLocaleString("id-ID") + " karakter";
    if (compressed && plainLen && plainLen > n) s += " (tanpa kompresi: " + plainLen.toLocaleString("id-ID") + ")";
    var ei = embedImgInfo(a);
    if (n > 2000) {
      info.style.color = "var(--red)";
      info.textContent = "\u26A0 " + s + " \u2014 tautan sangat panjang, rawan terpotong saat dibagikan, dan QR tidak bisa dibuat" +
        (ei.n ? " karena soal ini memuat " + ei.n + " gambar tempel (kurang lebih " + ei.kb.toLocaleString("id-ID") + " KB)" : "") +
        ". WhatsApp membatasi satu pesan sekitar 65.000 karakter, jadi tautan ini pun bisa gagal terkirim. " +
        "Solusinya: bagikan lewat Mode Offline (file HTML) di bawah, atau ganti gambar tempel dengan tautan gambar (URL).";
    } else {
      info.textContent = s + " \u2014 ringkas dan aman dibagikan." + (ei.n ? " Soal ini memuat " + ei.n + " gambar tempel." : "");
    }
  });
}

/* ---- QR untuk siswa: muat pustaka QR hanya saat dibutuhkan ---- */
function loadQrLib() {
  if (typeof qrcode === "function") return Promise.resolve(true);
  if (loadQrLib._p) return loadQrLib._p;
  loadQrLib._p = new Promise(function (res) {
    var done = false;
    var fin = function (ok) { if (done) return; done = true; res(ok); };
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js";
    s.onload = function () { fin(typeof qrcode === "function"); };
    s.onerror = function () { fin(false); };
    document.head.appendChild(s);
    setTimeout(function () { fin(typeof qrcode === "function"); }, 9000);
  }).then(function (ok) { if (!ok) loadQrLib._p = null; return ok; });
  return loadQrLib._p;
}

/* Coba buat QR pada tingkat koreksi ec; typeNumber 1..40 (pustaka tanpa mode auto).
   Error "code length overflow" = kapasitas versi itu kurang -> lanjut ke versi berikut. */
function tryQr(text, ec) {
  var start = Math.max(1, Math.floor(text.length / 120));
  for (var tn = start; tn <= 40; tn++) {
    try {
      var qr = qrcode(tn, ec);
      qr.addData(text);
      qr.make();
      var m = /src="([^"]+)"/.exec(qr.createImgTag(4, 2));
      if (m && /^data:image\//i.test(m[1])) return m[1];
      return null;
    } catch (e) { /* kapasitas belum cukup -> coba versi QR berikutnya */ }
  }
  return null;
}

/* Hasil: data URL PNG (pustaka lokal) atau URL layanan QR (cadangan), atau null jika mustahil. */
function qrImageData(text) {
  text = String(text || "");
  return loadQrLib().then(function (ok) {
    var src = null;
    if (ok && typeof qrcode === "function") src = tryQr(text, "M") || tryQr(text, "L");
    if (src) return src;
    if (text.length <= 1500) return "https://api.qrserver.com/v1/create-qr-code/?size=440x440&margin=14&data=" + encodeURIComponent(text);
    return null;
  });
}

/* Hitung gambar yang tersimpan di dalam soal (base64 "data:") dan perkirakan ukurannya. */
function embedImgInfo(a) {
  var n = 0, bytes = 0;
  ((a && a.questions) || []).forEach(function (q) {
    var u = (q && q.image) || "";
    if (/^data:image\//i.test(u)) { n++; bytes += Math.round(String(u).length * 3 / 4); }
  });
  return { n: n, kb: Math.round(bytes / 1024) };
}

function shareQR(id) {
  var a = resolveAssessment(id) || getCurrent();
  var box = document.getElementById("shQR");
  if (!box) return;
  if (box.style.display !== "none") { box.style.display = "none"; box.innerHTML = ""; return; }
  box.style.display = "block";
  box.innerHTML = '<div class="qr-status">Menyiapkan QR&hellip;</div>';
  var show = function (lnk) {
    qrImageData(lnk).then(function (src) {
      if (!src) {
        var ei = embedImgInfo(a);
        box.innerHTML = '<div class="qr-status qr-fail">' + ICON.alert + "<div><strong>QR tidak bisa dibuat untuk soal bergambar.</strong>" +
          "Tautan ini " + lnk.length.toLocaleString("id-ID") + " karakter, sedangkan satu QR hanya mampu memuat sekitar <b>2.900 karakter</b>" +
          (ei.n ? "; soal ini memuat <b>" + ei.n + " gambar tempel</b> (kurang lebih " + ei.kb.toLocaleString("id-ID") + " KB)" : "") +
          ". Jadi bukan soal kualitas QR-nya &mdash; kapasitas QR memang tidak cukup untuk data gambar.</div></div>" +
          '<div class="q-actions">' +
          '<button class="btn btn-primary btn-sm" data-action="downloadShare" data-id="' + a.id + '">' + ICON.download + " Unduh File Soal (HTML) &mdash; Mode Offline</button>" +
          '<button class="btn btn-light btn-sm" data-action="copyShare">' + ICON.copy + " Salin Tautan</button>" +
          "</div>" +
          '<div class="qr-status" style="text-align:left;margin-top:12px">Pilih salah satu:<br>' +
          "1. <b>Kirim file HTML</b> (tombol di atas) lewat WhatsApp / Google Classroom / Drive &mdash; siswa tidak perlu internet.<br>" +
          "2. <b>Unggah file HTML itu ke Netlify Drop</b> lalu QR tautan pendeknya (mis. <i>soal-boga.netlify.app</i>) &mdash; siswa perlu internet.<br>" +
          "3. <b>Ganti gambar tempel dengan tautan gambar (URL)</b> di <i>Edit Soal</i>, agar tautan kembali pendek dan QR bisa dibuat.</div>";
        return;
      }
      var ext = String((/^data:image\/(\w+)/i.exec(src) || [null, "png"])[1] || "png").toLowerCase();
      box.innerHTML = '<img class="qr-img" src="' + src + '" alt="QR tautan kerjakan siswa">' +
        '<div class="qr-status">Pindai dengan kamera HP; ' + lnk.length.toLocaleString("id-ID") + " karakter tautan terbuka otomatis tanpa mengetik.</div>" +
        '<div class="q-actions"><a class="btn btn-primary btn-sm" href="' + src + '" download="QR-ADIK.' + ext + '">' + ICON.download + " Unduh QR (" + ext.toUpperCase() + ")</a></div>";
      var img = box.querySelector(".qr-img");
      if (img && /^https?:/i.test(img.src)) {
        img.onerror = function () {
          box.innerHTML = '<div class="qr-status qr-fail">' + ICON.alert + " Gambar QR gagal dimuat (layanan QR tidak terjangkau dari jaringan ini). Salin tautan manual atau gunakan Mode Offline.</div>";
        };
      }
    });
  };
  var el = document.getElementById("shLink");
  var cur = el && /^https?:/i.test(String(el.value || "")) ? String(el.value).trim() : "";
  if (cur) show(cur);
  else if (a) studentLinkAsync(a, function (lnk) { show(lnk); });
}

function previewShare(id) {
  var a = resolveAssessment(id) || getCurrent();
  if (!a) return;
  var html = buildStudentHTML(buildSharePayload(a));
  openModal(
    '<div class="modal-head"><h3>Pratinjau Tampilan Siswa</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body" style="padding:0"><iframe id="studentFrame" title="Pratinjau siswa" allowfullscreen style="width:100%;height:70vh;border:0;border-radius:0 0 14px 14px"></iframe></div>',
    { wide: true }
  );
  var f = document.getElementById("studentFrame");
  if (f) f.srcdoc = html;
}

function downloadShare(id) {
  var a = resolveAssessment(id) || getCurrent();
  if (!a) return;
  var html = buildStudentHTML(buildSharePayload(a));
  downloadBlob(new Blob([html], { type: "text/html" }), safeName(a) + " - Soal Siswa.html");
  toast("success", "File soal diunduh", "Bagikan file HTML ini ke siswa.");
}

function copyShare() {
  var el = document.getElementById("shLink");
  if (!el) return;
  el.select();
  try { document.execCommand("copy"); } catch (e) { }
  if (navigator.clipboard) navigator.clipboard.writeText(el.value);
  toast("success", "Tautan disalin", "Kirim tautan ini ke siswa.");
}

function pullResults(aid, cb) {
  var url = endpointUrl();
  if (!url) { cb(new Error("Endpoint belum diatur.")); return; }
  var cbName = "__rekap_cb_" + Math.floor(Math.random() * 1e9);
  var script = document.createElement("script");
  var done = false;
  function cleanup() {
    try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
    if (script.parentNode) script.parentNode.removeChild(script);
  }
  window[cbName] = function (resp) { if (done) return; done = true; cleanup(); cb(null, resp); };
  script.onerror = function () { if (done) return; done = true; cleanup(); cb(new Error("Tidak dapat menghubungi endpoint.")); };
  var sep = url.indexOf("?") >= 0 ? "&" : "?";
  script.src = url + sep + "action=pull&aid=" + encodeURIComponent(aid || "") + "&callback=" + cbName + "&t=" + Date.now();
  document.head.appendChild(script);
  setTimeout(function () { if (!done) { done = true; cleanup(); cb(new Error("Waktu habis menunggu respons.")); } }, 20000);
}

function normalizeRow(r) {
  var answers = {};
  try { if (r.detail) answers = JSON.parse(b64decode(r.detail)); } catch (e) { }
  if (r.answers && !r.detail) answers = r.answers;
  return {
    waktu: r.waktu || r.timestamp || "",
    id: r.id || r.aid || "",
    judul: r.judul || "",
    nama: r.nama || "",
    kelas: r.kelas || "",
    absen: r.absen || "",
    benar: Number(r.benar) || 0,
    total: Number(r.total) || 0,
    skor: Number(r.skor) || 0,
    manual: Number(r.manual) || 0,
    answers: answers
  };
}

function importResultsModal() {
  var body = '<div class="note note-info mb-16">' + ICON.info + "<div><strong>Impor Hasil</strong>Tempel tautan atau kode hasil dari siswa (satu per baris). Tempel seluruh tautan yang dibagikan siswa, sistem akan membaca kodenya otomatis.</div></div>";
  body += '<div class="field"><label>Tautan / kode hasil siswa</label><textarea id="impCodes" style="min-height:160px;font-size:11px" placeholder="Tempel satu atau lebih tautan/kode di sini (satu per baris)..."></textarea></div>';
  openModal(
    '<div class="modal-head"><h3>Impor Kode Hasil</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Batal</button>' +
    '<button class="btn btn-primary" data-action="doImportResults">' + ICON.check + " Impor</button></div>",
    { wide: true }
  );
}

function doImportResults() {
  var raw = (document.getElementById("impCodes").value || "").split(/\s*\n\s*/).filter(Boolean);
  var added = 0, failed = 0;
  raw.forEach(function (code) {
    try {
      var mm = String(code).match(/nilai=([^&#\s]+)/);
      var c = mm ? decodeURIComponent(mm[1]) : String(code).trim();
      var data = decodeCode(c);
      state.rekap.pulled.push(normalizeRow(data));
      added++;
    } catch (e) { failed++; }
  });
  closeModal();
  render();
  toast(added ? "success" : "warn", added + " hasil diimpor", failed ? failed + " kode tidak valid." : "Data siap direkap.");
}

function guideModal() {
  var appsScript = [
    "const SHEET_NAME = 'Respon';",
    "function sh_(){var ss=SpreadsheetApp.getActiveSpreadsheet();var s=ss.getSheetByName(SHEET_NAME);",
    "if(!s){s=ss.insertSheet(SHEET_NAME);s.appendRow(['waktu','id','judul','nama','kelas','absen','benar','total','skor','manual','detail']);}return s;}",
    "function doGet(e){var p=e.parameter||{};",
    "if((p.action||'pull')==='submit'){return save_(p);}",
    "var sh=sh_();var v=sh.getDataRange().getValues();var head=v[0];var rows=[];",
    "for(var i=1;i<v.length;i++){if(p.aid&&String(v[i][1])!==String(p.aid))continue;var o={};for(var j=0;j<head.length;j++){o[head[j]]=v[i][j];}rows.push(o);}",
    "var out=JSON.stringify({ok:true,rows:rows});",
    "if(p.callback){return ContentService.createTextOutput(p.callback+'('+out+');').setMimeType(ContentService.MimeType.JAVASCRIPT);}",
    "return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);}",
    "function doPost(e){return save_(e.parameter||{});}",
    "function save_(p){var d={};try{d=JSON.parse(Utilities.newBlob(Utilities.base64Decode(p.payload)).getDataAsString());}catch(err){}",
    "var sh=sh_();sh.appendRow([new Date(),d.id||'',d.judul||'',d.nama||'',d.kelas||'',d.absen||'',d.benar||0,d.total||0,d.skor||0,d.manual||0,p.payload||'']);",
    "var out=JSON.stringify({ok:true});",
    "if(p.callback){return ContentService.createTextOutput(p.callback+'('+out+');').setMimeType(ContentService.MimeType.JAVASCRIPT);}",
    "return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);}"
  ].join("\n");
  var body = "";
  body += '<div class="note note-info mb-16">' + ICON.info + "<div><strong>Dua langkah agar hasil siswa otomatis terekap</strong>1) Buat endpoint Google Apps Script. 2) Hosting aplikasi agar siswa bisa membuka tautan.</div></div>";
  body += "<h3 style=\"font-size:15px;margin:16px 0 8px\">A. Menyiapkan endpoint (Google Apps Script)</h3>";
  body += "<ol style=\"font-size:13.5px;line-height:1.7;padding-left:20px;margin:0 0 10px\">" +
    "<li>Buka <b>sheets.google.com</b> lalu buat Spreadsheet baru (beri nama, mis. <i>Respon ADIK</i>).</li>" +
    "<li>Menu <b>Extensions &rarr; Apps Script</b>.</li>" +
    "<li>Hapus isi editor, tempel kode di bawah, lalu <b>Save</b>.</li>" +
    "<li>Klik <b>Deploy &rarr; New deployment</b>, pilih type <b>Web app</b>.</li>" +
    "<li>Set <b>Execute as: Me</b>, <b>Who has access: Anyone</b>, lalu <b>Deploy</b> dan izinkan akses.</li>" +
    "<li>Salin <b>Web app URL</b> (berakhir <b>/exec</b>) lalu tempel di kolom Endpoint pada menu <b>Rekap Nilai</b>.</li></ol>";
  body += '<div class="field"><label>Kode Google Apps Script (Code.gs)</label><textarea id="gscode" readonly style="min-height:200px;font-size:11px;font-family:monospace">' + esc(appsScript) + "</textarea></div>";
  body += '<div class="q-actions mb-16"><button class="btn btn-light btn-sm" data-action="copyGuideCode">' + ICON.copy + " Salin Kode</button></div>";
  body += "<h3 style=\"font-size:15px;margin:16px 0 8px\">B. Hosting aplikasi (pilih salah satu, gratis)</h3>";
  body += "<ol style=\"font-size:13.5px;line-height:1.7;padding-left:20px;margin:0\">" +
    "<li><b>Netlify Drop</b> (paling mudah): buka <b>app.netlify.com/drop</b>, seret folder aplikasi ini, tunggu, dapat URL publik. Bagikan URL tersebut.</li>" +
    "<li><b>GitHub Pages</b>: buat repository, unggah file aplikasi, buka <b>Settings &rarr; Pages</b>, pilih branch <b>main</b>, simpan. URL akan muncul (mis. <i>https://nama.github.io/repo</i>).</li>" +
    "<li><b>Vercel</b>: buka <b>vercel.com</b>, impor folder/repo, deploy.</li></ol>";
  body += '<div class="note note-success mt-16">' + ICON.check + "<div><strong>Setelah online</strong>Buka aplikasi pada URL hosting, atur endpoint di Rekap Nilai, lalu gunakan tombol Bagikan ke Siswa. Siswa membuka tautan, mengerjakan, dan hasilnya masuk ke Google Sheet &amp; menu Rekap Nilai.</div></div>";
  openModal(
    '<div class="modal-head"><h3>Panduan Lengkap</h3><button class="close-x" data-action="closeModal">' + ICON.close + "</button></div>" +
    '<div class="modal-body">' + body + "</div>" +
    '<div class="modal-foot"><button class="btn btn-light" data-action="closeModal">Tutup</button></div>',
    { wide: true }
  );
}

function copyGuideCode() {
  var el = document.getElementById("gscode");
  if (!el) return;
  el.select();
  try { document.execCommand("copy"); } catch (e) { }
  if (navigator.clipboard) navigator.clipboard.writeText(el.value);
  toast("success", "Kode disalin", "Tempel ke Apps Script.");
}

function startStudentMode(code, payloadIn) {
  var payload = payloadIn || null;
  if (!payload) {
    try { payload = decodeCode(code); } catch (e) { payload = null; }
  }
  if (!payload || !payload.quiz) state.student = { error: true };
  else state.student = { payload: payload };
  document.body.classList.add("student-mode");
  document.title = (payload && payload.quiz && payload.quiz.meta && payload.quiz.meta.judul) || "Kerjakan Soal";
  render();
}

function renderStudent() {
  var s = state.student;
  if (!s || s.error) {
    DOM.content.innerHTML = emptyState(ICON.alert, "Soal tidak ditemukan", "Kode atau tautan tidak valid. Minta guru mengirim ulang tautan.", "", "", "");
    return;
  }
  DOM.content.innerHTML = '<iframe id="studentFrame" title="Kerjakan Soal" allowfullscreen style="width:100%;height:100vh;border:0;display:block;background:#050718"></iframe>';
  var f = document.getElementById("studentFrame");
  if (f) f.srcdoc = buildStudentHTML(s.payload);
}

