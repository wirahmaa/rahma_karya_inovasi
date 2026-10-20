function handleFieldInput(e) {
  var el = e.target;
  if (el.getAttribute && el.getAttribute("data-action") === "imageCaption") {
    var ci = Number(el.getAttribute("data-idx"));
    if (!draft.imageCaptions) draft.imageCaptions = [];
    draft.imageCaptions[ci] = el.value;
    saveDraft();
    return;
  }
  var f = el.dataset ? el.dataset.field : null;
  if (!f) return;
  var tag = el.tagName, type = el.type;
  if (tag === "TEXTAREA" || type === "text" || type === "number" || type === "date" || type === "password") {
    draft[f] = el.value;
    saveDraft();
    if (f === "sekolah" || f === "kopDinas" || f === "sekolahAlamat" || f === "sekolahKontak") saveSchoolProfileFromDraft();
  }
}

function handleFieldChange(e) {
  var el = e.target;
  var action = el.getAttribute ? el.getAttribute("data-action") : null;
  if (action === "bankSelect") {
    var id = el.getAttribute("data-id");
    if (el.checked) state.bankSelect[id] = true; else delete state.bankSelect[id];
    render();
    return;
  }
  var f = el.dataset ? el.dataset.field : null;
  if (!f) return;
  if (f === "cognitive" || f === "bentukList") {
    var v = el.getAttribute("data-value");
    if (!draft[f]) draft[f] = [];
    if (el.checked) { if (draft[f].indexOf(v) < 0) draft[f].push(v); }
    else draft[f] = draft[f].filter(function (x) { return x !== v; });
    saveDraft();
    var lbl = el.closest(".chk");
    if (lbl) lbl.classList.toggle("checked", el.checked);
    return;
  }
  if (el.type === "checkbox") {
    draft[f] = el.checked;
    saveDraft();
    return;
  }
  draft[f] = el.value;
  saveDraft();
  if (el.type === "radio" && el.name) {
    var group = DOM.content.querySelectorAll('input[name="' + el.name + '"]');
    for (var i = 0; i < group.length; i++) {
      var lab = group[i].closest(".chk");
      if (lab) lab.classList.toggle("checked", group[i].checked);
    }
  }
}

function handleFilter(e) {
  var el = e.target;
  var scope = el.dataset ? el.dataset.filter : null;
  if (!scope) return;
  var key = el.dataset.key;
  state.filter[scope][key] = el.value;
  state.pendingFocus = { id: el.id, pos: el.selectionStart };
  render();
}

function viewAssessment(id) {
  var a = findAssessment(id);
  if (!a) return;
  state.current = a;
  state.page = "result";
  state.resultTab = "soal";
  render();
}

function dupAssessment(id) {
  var a = findAssessment(id);
  if (!a) return;
  var copy = JSON.parse(JSON.stringify(a));
  copy.id = uid();
  copy.createdAt = new Date().toISOString();
  copy.saved = false;
  copy.meta.judul = a.meta.judul + " (Salinan)";
  copy.questions.forEach(function (q) { q.id = uid(); });
  state.current = copy;
  state.page = "result";
  state.resultTab = "soal";
  render();
  toast("success", "Asesmen diduplikasi", "Salinan dibuat. Klik Simpan ke Riwayat bila perlu.");
}

function deleteAssessment(id) {
  var a = findAssessment(id);
  if (!a) return;
  confirmModal("Hapus Asesmen", "Yakin ingin menghapus asesmen \"" + a.meta.judul + "\"? Tindakan tidak dapat dibatalkan.", "Hapus", function () {
    assessments = assessments.filter(function (x) { return x.id !== id; });
    persist();
    render();
    toast("success", "Asesmen dihapus", "Asesmen berhasil dihapus dari riwayat.");
  });
}

function handleClick(e) {
  var dz = e.target.closest ? e.target.closest(".dropzone") : null;
  if (dz && e.target.tagName !== "INPUT") {
    var inp = dz.querySelector('input[type="file"]');
    if (inp) { inp.click(); return; }
  }
  var target = e.target.closest ? e.target.closest("[data-action]") : null;
  if (!target) return;
  var action = target.getAttribute("data-action");
  switch (action) {
    case "nav":
      e.preventDefault();
      navigate(target.getAttribute("data-page"));
      break;
    case "toggleSidebar": toggleSidebar(); break;
    case "closeSidebar": closeSidebar(); break;
    case "stepNext": stepNext(); break;
    case "stepPrev": stepPrev(); break;
    case "showSummary": summaryModal(); break;
    case "doGenerate": generateAssessment(); break;
    case "closeModal": closeModal(); break;
    case "resultTab": state.resultTab = target.getAttribute("data-tab"); render(); break;
    case "editQuestion": editQuestionModal(target.getAttribute("data-id")); break;
    case "saveQuestionEdit": saveQuestionEdit(target.getAttribute("data-id")); break;
    case "regenQuestion": regenQuestion(target.getAttribute("data-id")); break;
    case "delQuestion": deleteQuestion(target.getAttribute("data-id")); break;
    case "saveQuestionToBank": saveOneToBank(target.getAttribute("data-id")); break;
    case "saveAllToBank": saveAllToBank(); break;
    case "saveHistory": saveHistory(); break;
    case "printDoc": printDoc(); break;
    case "exportPDF": exportPDF(); break;
    case "exportWord": exportWord(); break;
    case "exportExcel": exportExcel(); break;
    case "copyResult": copyResult(); break;
    case "editMeta": editMetaModal(target.getAttribute("data-id")); break;
    case "editTujuan": editTujuanModal(target.getAttribute("data-id")); break;
    case "saveTujuan": saveTujuan(target.getAttribute("data-id")); break;
    case "seriesModal": seriesModal(target.getAttribute("data-id")); break;
    case "seriesStart": seriesStart(target.getAttribute("data-id")); break;
    case "lastAssessModal": lastAssessModal(); break;
    case "saveMeta": saveMeta(target.getAttribute("data-id")); break;
    case "viewAssessment": viewAssessment(target.getAttribute("data-id")); break;
    case "dupAssessment": dupAssessment(target.getAttribute("data-id")); break;
    case "delAssessment": deleteAssessment(target.getAttribute("data-id")); break;
    case "exportWordById": var a = findAssessment(target.getAttribute("data-id")); if (a) exportWord(a); break;
    case "addBank": bankFormModal(null); break;
    case "editBank": bankFormModal(findBank(target.getAttribute("data-id"))); break;
    case "saveBank": saveBank(target.getAttribute("data-id")); break;
    case "delBank": deleteBank(target.getAttribute("data-id")); break;
    case "bankCreateAssessment": bankCreateAssessmentModal(); break;
    case "confirmBankAssessment": confirmBankAssessment(); break;
    case "bankClearSelect": state.bankSelect = {}; render(); break;
    case "apiSave": apiSave(); break;
    case "apiTest": testConnection(); break;
    case "apiChangeKey": state.apiEditingKey = true; render(); break;
    case "apiRemove": apiRemove(); break;
    case "profilTab": state.profilTab = target.getAttribute("data-tab"); render(); break;
    case "pfAdd": pfFormModal(null); break;
    case "pfEdit": pfFormModal(pfFind(target.getAttribute("data-id"))); break;
    case "pfSave": pfSave(target.getAttribute("data-id")); break;
    case "pfDetail": pfDetailModal(target.getAttribute("data-id")); break;
    case "pfDel": pfDelete(target.getAttribute("data-id")); break;
    case "pfAngket": pfAngketModal(target.getAttribute("data-id")); break;
    case "pfAngketSave": pfAngketSave(); break;
    case "pfBulk": pfBulkModal(); break;
    case "pfBulkSave": pfBulkSave(); break;
    case "pfImportRekap": pfImportRekap(); break;
    case "pfFormImport": pfFormImportModal(); break;
    case "pfFormTemplate": pfFormTemplateModal(); break;
    case "pfFormCopyTemplate": pfFormCopyTemplate(); break;
    case "pfFormPull": pfFormPull(); break;
    case "pfFormPaste": pfFormPaste(); break;
    case "pfFormFile": pfFormFile(); break;
    case "pfFormApply": pfFormApply(); break;
    case "pfExport": pfExport(); break;
    case "pfGroups": pfBuildGroups(); break;
    case "pfSoalMap": pfSoalMapModal(); break;
    case "pfSoalMapRun": pfSoalMapRun(); break;
    case "pfSoalMapCopy": pfSoalMapCopy(); break;
    case "pfSoalMapModal": pfSoalMapModal(); break;
    case "pfSrcAll": pfSrcPilih(true); break;
    case "pfSrcNone": pfSrcPilih(false); break;
    case "pfPkgShare": pfPkgShare(target.getAttribute("data-k")); break;
    case "pfPkgUnduh": pfPkgUnduh(target.getAttribute("data-k")); break;
    case "pfPkgSalin": pfPkgSalin(target.getAttribute("data-k")); break;
    case "pfUseTingkat": pfUseTingkat(target.getAttribute("data-k")); break;
    case "pfUseAssess": pfUseAssess(target.getAttribute("data-level")); break;
    case "shareStudent": var sh = findAssessment(target.getAttribute("data-id")); if (sh) shareModal(sh); break;
    case "previewShare": previewShare(target.getAttribute("data-id")); break;
    case "shareQR": shareQR(target.getAttribute("data-id")); break;
    case "downloadShare": downloadShare(target.getAttribute("data-id")); break;
    case "copyShare": copyShare(); break;
    case "guide": guideModal(); break;
    case "copyGuideCode": copyGuideCode(); break;
    case "importResults": importResultsModal(); break;
    case "doImportResults": doImportResults(); break;
    case "epSave": epSave(); break;
    case "epClear": epClear(); break;
    case "pullResults": pullResultsAction(); break;
    case "exportPenilaian": exportPenilaian(); break;
    case "rekapDetail": rekapDetailModal(Number(target.getAttribute("data-ri"))); break;
    case "removeImage": removeDraftImage(Number(target.getAttribute("data-idx"))); break;
    case "pickLogo": var lp = document.getElementById(target.getAttribute("data-field") + "File"); if (lp) lp.click(); break;
    case "removeLogo": removeLogoNow(target.getAttribute("data-field")); break;
  }
}

function handleRekapInput(e) {
  var el = e.target;
  if (!el.getAttribute) return;
  if (el.getAttribute("data-action") === "rekapScore") {
    rekapManualScore(Number(el.getAttribute("data-ri")), el.getAttribute("data-qid"), el.value);
  }
}

function handleRekapChange(e) {
  var el = e.target;
  if (!el.id) return;
  if (el.id === "rekapAid") { state.rekap.aid = el.value; }
}

function init() {
  var hm = String(location.hash || "").match(/kerjakan=([^&\s]+)/);
  if (hm && typeof startStudentMode === "function") {
    document.body.classList.add("student-mode");
    var rawCode = decodeURIComponent(hm[1]);
    if (typeof ungzipCode === "function") {
      ungzipCode(rawCode).then(function (json) {
        var payload = null;
        try { payload = json ? JSON.parse(json) : null; } catch (e) { payload = null; }
        if (payload && payload.quiz) startStudentMode(null, payload);
        else startStudentMode(rawCode);
      }).catch(function () { startStudentMode(rawCode); });
    } else {
      startStudentMode(rawCode);
    }
    return;
  }
  var importedName = "";
  var nm = String(location.hash || "").match(/nilai=([^&\s]+)/);
  if (nm && typeof decodeCode === "function" && typeof normalizeRow === "function") {
    try {
      var nd = decodeCode(decodeURIComponent(nm[1]));
      state.rekap.pulled = state.rekap.pulled || [];
      state.rekap.pulled.push(normalizeRow(nd));
      state.page = "rekap";
      importedName = nd.nama || "Siswa";
      try { persist(); } catch (e) { }
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { }
    } catch (e) { }
  }
  document.addEventListener("click", handleClick);
  DOM.content.addEventListener("input", handleFieldInput);
  DOM.content.addEventListener("change", handleFieldChange);
  DOM.content.addEventListener("input", handleFilter);
  DOM.content.addEventListener("change", handleFilter);
  DOM.content.addEventListener("input", handleRekapInput);
  DOM.content.addEventListener("change", handleRekapChange);
  DOM.content.addEventListener("change", function (e) {
    var id = e.target && e.target.id;
    if (id === "fileUploadModul") handleUploadFile(e.target.files && e.target.files[0], "module");
    else if (id === "fileUploadMateri") handleUploadFile(e.target.files && e.target.files[0], "materi");
    else if (e.target && e.target.classList && e.target.classList.contains("logo-file")) handleLogoUpload(e.target);
  });
  DOM.content.addEventListener("dragover", function (e) {
    var dz = e.target.closest ? e.target.closest(".dropzone") : null;
    if (dz) { e.preventDefault(); dz.classList.add("over"); }
  });
  DOM.content.addEventListener("dragleave", function (e) {
    var dz = e.target.closest ? e.target.closest(".dropzone") : null;
    if (dz) dz.classList.remove("over");
  });
  DOM.content.addEventListener("drop", function (e) {
    var dz = e.target.closest ? e.target.closest(".dropzone") : null;
    if (dz) {
      e.preventDefault();
      dz.classList.remove("over");
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleUploadFile(f, dz.getAttribute("data-target") || "materi");
    }
  });
  updateConnPill();
  render();
  if (importedName) {
    setTimeout(function () { toast("success", "Nilai diterima", "Hasil " + importedName + " ditambahkan ke Rekap Nilai."); }, 80);
  }
}

init();
