/**
 * MODUL MONITORING NON-CONFORMANCE RECORD (NCR)
 * PT Asuka Engineering Indonesia — FR-IMS-QCA-007
 */

// Data inisial register NCR (Maksimal s/d baris ke-28, baris kosong 29-50 dieliminasi)
var INITIAL_NCR_DATA = [
  ["No","NCR No","NCR Project","Discipline","Project","Area","Description","Issued Date","Responsible Person","Due Date","Closed Date","Status","Days Remaining","Remarks","Register AEI NCR","Row Index","Doc Link"],
  ["1","NCR-QCA-AEI-0001","NCR-2505-AEI-CVL-0001","Civil/Architecture","PLTU Barru","","Not Performed Job Mix Design & Job Mix Formula as per ITP","31 Jul 2025","Ahmad Nur Fatony","7 Agu 2025","28 Agu 2025","CLOSED","0","NCR-2505-AEI-QCA-0001","NCR-2505-XXXX-AEI-CVL-0001",42,""],
  ["2","NCR-QCA-AEI-0002","NCR-2512-AEI-CVL-0001\nAEI-QC-0154-NCR-0001","Civil/Architecture","Indo Copper Project","Copper Rrefining \nPlant Phase 1","Not Performed Suboptimal concrete pouring methods, such as the uneven use of vibrators, result in non-homogeneous concrete in the final outcome, as per ITP.","25 Feb 2026","Muh Mundhir Mamduh","4 Mar 2026","26 Feb 2026","CLOSED","0","AEI-QC-0154-NCR-0001","NCR-2512-0154-AEI-CVL-0002",43,""],
  ["3","NCR-QCA-AEI-0003","AEI-QC-0154-NCR-0002","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS)","There are no bolt holes available on the rafter steel structure part number 260090101020015, so it can't be assembled as per erection drawing.","24 Apr 2026","Muh Mundhir Mamduh","30 Apr 2026","25 Apr 2026","CLOSED","0","AEI-QC-0154-NCR-0002","NCR-2512-0154-AEI-CVL-0003",44,""],
  ["4","NCR-QCA-AEI-0004","AEI-QC-0154-NCR-0003","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01020042 has no holes that connect to plate 01270043 at Line 4 Grid A-D","25 Apr 2026","Muh Mundhir Mamduh","2 Mei 2026","28 Mei 2026","CLOSED","0","AEI-QC-0154-NCR-0003","NCR-2512-0154-AEI-CVL-0004",45,""],
  ["5","NCR-QCA-AEI-0005","AEI-QC-0154-NCR-0004","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 010100332 has no holes that connect to plate 01270051 at Line 4 Grid A","7 Mei 2026","Muh Mundhir Mamduh","14 Mei 2026","14 Mei 2026","CLOSED","0","AEI-QC-0154-NCR-0004","NCR-2512-0154-AEI-CVL-0005",46,""],
  ["6","NCR-QCA-AEI-0006","AEI-QC-0154-NCR-0005","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01060011 Excess Length 300mm,\nQty 2 Pcs, At Line 1 Grid I-J & Line 8 Grid I-J","9 Mei 2026","Muh Mundhir Mamduh","16 Mei 2026","11 Mei 2026","CLOSED","0","AEI-QC-0154-NCR-0005","NCR-2512-0154-AEI-CVL-0006",47,""],
  ["7","NCR-QCA-AEI-0007","AEI-QC-0154-NCR-0006","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01050025 Deficiency Length 198mm,\nQty 4 Pcs, At Line 1 Grid G-H, Line 8 Grid G-H","10 Mei 2026","Muh Mundhir Mamduh","17 Mei 2026","12 Mei 2026","CLOSED","0","AEI-QC-0154-NCR-0006","NCR-2512-0154-AEI-CVL-0007",48,""],
  ["8","NCR-QCA-AEI-0008","AEI-QC-0154-NCR-0007","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01010054 has no holes that connect to canopy 01130014 at Line 1 Grid J.","12 Mei 2026","Muh Mundhir Mamduh","18 Mei 2026","12 Mei 2026","CLOSED","0","AEI-QC-0154-NCR-0007","NCR-2512-0154-AEI-CVL-0008",49,""],
  ["9","NCR-QCA-AEI-0009","AEI-QC-0154-NCR-0008","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01010051 holes not match to support Purlin 01270030 at Line 2 Grid G.","13 Mei 2026","Muh Mundhir Mamduh","20 Mei 2026","21 Mei 2026","CLOSED","0","AEI-QC-0154-NCR-0008","NCR-2512-0154-AEI-CVL-0009",50,""],
  ["10","NCR-QCA-AEI-0010","AEI-QC-0154-NCR-0009","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01120003 has no holes that connect to Support Purlin 01270044 at Line 2 Grid H-I.","14 Mei 2026","Muh Mundhir Mamduh","21 Mei 2026","16 Mei 2026","CLOSED","0","AEI-QC-0154-NCR-0009","NCR-2512-0154-AEI-CVL-0010",51,""],
  ["11","NCR-QCA-AEI-0011","AEI-QC-0154-NCR-0010","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01120002 has no holes that connect to Support Purlin 01270044 at Line 2 Grid H-I.","15 Mei 2026","Muh Mundhir Mamduh","21 Mei 2026","16 Mei 2026","CLOSED","0","AEI-QC-0154-NCR-0010","NCR-2512-0154-AEI-CVL-0011",52,""],
  ["12","NCR-QCA-AEI-0012","AEI-QC-0154-NCR-0011","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel structure (column) ATAD part number 01010020 (column J7) has no bolt holes to connect tie beam between column J7 and J8.","28 Mei 2026","Shaido Yayan Toro","4 Jun 2026","9 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0011","NCR-2512-0154-AEI-CVL-0012",53,""],
  ["13","NCR-QCA-AEI-0013","AEI-QC-0154-NCR-0012","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel structure (rafter) ATAD part number 01020019 bolt holes position to connect tie beam between rafter J7 and J8 is not correct","4 Jun 2026","Shaido Yayan Toro","11 Jun 2026","9 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0012","NCR-2512-0154-AEI-CVL-0013",54,""],
  ["14","NCR-QCA-AEI-0014","AEI-QC-0154-NCR-0013","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel structure ATAD part number monitor frame (01120003) angle of bolt holes to connect between frame monitor and plate support for purlin (01270044) is not correct.","4 Jun 2026","Shaido Yayan Toro","11 Jun 2026","11 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0013","NCR-2512-0154-AEI-CVL-0014",55,""],
  ["15","NCR-QCA-AEI-0015","AEI-QC-0154-NCR-0014","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel structure end plate monitor frame ATAD part number (01120007) has no bolt holes to connect to other monitor frame (01120008)","4 Jun 2026","Shaido Yayan Toro","11 Jun 2026","11 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0014","NCR-2512-0154-AEI-CVL-0015",56,""],
  ["16","NCR-QCA-AEI-0016","AEI-QC-0154-NCR-0015","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel structure rafter 7D, ATAD part number (01020014) has no holes to bolt purlin main roof (01430076) to rafter.","6 Jun 2026","Shaido Yayan Toro","14 Jun 2026","12 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0015","NCR-2512-0154-AEI-CVL-0016",57,""],
  ["17","NCR-QCA-AEI-0017","AEI-QC-0154-NCR-0016","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","The angle degree of steel structure, rafter 8 G & 8 J, ATAD part number (01020008) and (01020009) didn't same with fabrication drawing and so the length of rafter's span is insufficient to connect the 8 G and 8 J column.","6 Jun 2026","Muh Mundhir Mamduh","14 Jun 2026","12 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0016","NCR-2512-0154-AEI-CVL-0017",58,""],
  ["18","NCR-QCA-AEI-0018","AEI-QC-0154-NCR-0017","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Miss on base plate orientation at ATAD part number (01020045) for install gusset plate to connect tie beam on GL 4 and 5, found the position of hole is reversed.","7 Jun 2026","Muh Mundhir Mamduh","14 Jun 2026","8 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0017","NCR-2512-0154-AEI-CVL-0018",59,""],
  ["19","NCR-QCA-AEI-0019","AEI-QC-0154-NCR-0018","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01020045 has no holes that connect to Plat 01270047 at Line 4 Grid D-G","8 Jun 2026","Muh Mundhir Mamduh","15 Jun 2026","9 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0018","NCR-2512-0154-AEI-CVL-0019",60,""],
  ["20","NCR-QCA-AEI-0020","AEI-QC-0154-NCR-0019","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01020048 has no holes that connect to Plat 01270043 at Line 4 Grid G-J","8 Jun 2026","Muh Mundhir Mamduh","15 Jun 2026","9 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0019","NCR-2512-0154-AEI-CVL-0020",61,""],
  ["21","NCR-QCA-AEI-0021","AEI-QC-0154-NCR-0020","Mechanical/Piping","Indo Copper Project","Copper Rrefining \nPlant Phase 1  (SS - Factory Area)","Steel Structure ATAD Part Number 01020015 has no holes that connect to Plat 01270047 at Line 7 Grid D-G","9 Jun 2026","Muh Mundhir Mamduh","16 Jun 2026","10 Jun 2026","CLOSED","0","AEI-QC-0154-NCR-0020","NCR-2512-0154-AEI-CVL-0021",62,""],
  ["22","NCR-QCA-AEI-0022","NCR-2512-0132-AEI-0022","Mechanical/Piping","Coats Rejo","","","1 Jul 2026","Abiyyuda Putra","8 Jul 2026","31 Jul 2026","CLOSED","0","NCR-2512-0132-AEI-0022","NCR-2606-xxxx-AEI-xxx-0022",63,""],
  ["23","NCR-QCA-AEI-0023","NCR-2512-0132-AEI-0023","Mechanical/Piping","Coats Rejo","","","1 Jul 2026","Abiyyuda Putra","8 Jul 2026","31 Jul 2026","CLOSED","0","NCR-2512-0132-AEI-0023","",64,""],
  ["24","NCR-QCA-AEI-0024","NCR-2605-0093-AEI-0024","Fabrication/Logistic","PT Cirebon Energy Prasarana","Workshop KIG","Linear indication on web of all WF 588 members : \n- Linear indications found on the web of all WF 588 members after \n  sandblasting, and more clearly visible after primer coating.\n- Indications were NOT detectable at receiving inspection due to the \n  surface was still covered by mill scale / manufacture coating.","28 Sep 2026","David Setyo P","5 Okt 2026","31 Okt 2026","CLOSED","0","NCR-2605-0093-AEI-0024","",65,""],
  ["25","NCR-QCA-AEI-0025","AEI-FBK-2512-0156-0001","Mechanical/Piping","PT Petro Jordan Abadi","Workshop KIG","Cross Weld Joint Shell & Cone Bottom","8 Okt 2026","Muh Mundhir Mamduh","15 Okt 2026","9 Nov 2026","CLOSED","0","AEI-FBK-NCR-2512-0156-001","",66,""],
  ["26","NCR-QCA-AEI-0026","NCR-2609-0128-AEI-0001","Civil/Architecture","Coats Rejo","","Pengecoran Pilecap & Kolom Powerhouse Tanpa Slump Test","27 Okt 2026","Ahmad Nur Fatony","10 Nov 2026","","OVERDUE","-6","","",67,""],
  ["27","NCR-QCA-AEI-0027","NCR-122065-AEI-0001","Fabrication/Logistic","PT Petro Jordan Abadi","Workshop KIG","the following non-conformances were found during site inspection at PJA (laydown & fabrication area) : QC Plan to be use for the works","11 Nov 2026","Andi Reza D","25 Nov 2026","","OPEN","9","","",68,""],
  ["28","NCR-QCA-AEI-0028","AEI-2609-0128-AEI-0002","Civil/Architecture","Coats Rejo","Powerhouse","Verifikasi deviasi penulangan dan kelengkapan dokumen pendukung teknis.","12 Nov 2026","Ahmad Nur Fatony","26 Nov 2026","","OPEN","10","Dokumen dalam verifikasi","",69,""]
];

window.allNcrData = INITIAL_NCR_DATA;
window.selectedNcrRecord = null;
window.activeUploadNcrNo = null;
window.ncrStatusChartInstance = null;
window.ncrDisciplineChartInstance = null;

function loadNcrData() {
  var countInfo = document.getElementById('ncrTableCountInfo');
  var tblWrap = document.getElementById('ncrTableContainer');
  if (countInfo) countInfo.textContent = 'Menghubungkan ke master register NCR...';
  if (tblWrap) tblWrap.innerHTML = '<div class="loading-row"><span class="spinner dark"></span>Mengambil data register NCR...</div>';

  if (typeof google === 'undefined' || !google.script || !google.script.run) {
    console.log('[NCR] Running in standalone/preview mode. Rendering pre-loaded data.');
    renderNcrTable_(window.allNcrData);
    var summaryMock = calculateNcrSummaryMock_(window.allNcrData);
    renderNcrCharts_(summaryMock);
    return;
  }

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.success) {
        if (tblWrap) tblWrap.innerHTML = '<div style="padding:16px; color:#dc2626; font-weight:600;">Gagal memuat data: ' + ((res && res.error) || 'Koneksi terputus') + '</div>';
        return;
      }

      window.allNcrData = res.data || [];
      renderNcrTable_(window.allNcrData);
      loadNcrSummary();
    })
    .withFailureHandler(function(err) {
      if (tblWrap) tblWrap.innerHTML = '<div style="padding:16px; color:#dc2626; font-weight:600;">Error: ' + (err.message || 'Gagal memanggil server') + '</div>';
    })
    .getNcrData();
}
window.loadNcrData = loadNcrData;

function loadNcrSummary() {
  google.script.run
    .withSuccessHandler(function(res) {
      if (res && res.success) {
        var total = res.total || 0;
        var closed = res.closed || 0;
        var open = res.open || 0;
        var overdue = res.overdue || 0;

        if (document.getElementById('kpiNcrTotal')) document.getElementById('kpiNcrTotal').textContent = total;
        if (document.getElementById('kpiNcrClosed')) {
          var pct = total ? Math.round((closed / total) * 100) : 0;
          document.getElementById('kpiNcrClosed').innerHTML = closed + ' <span style="font-size:12px; font-weight:600; color:var(--ink-secondary);">(' + pct + '%)</span>';
        }
        if (document.getElementById('kpiNcrOpen')) document.getElementById('kpiNcrOpen').textContent = open;
        if (document.getElementById('kpiNcrOverdue')) document.getElementById('kpiNcrOverdue').textContent = overdue;

        renderNcrCharts_(res);
      }
    })
    .getNcrSummary();
}
window.loadNcrSummary = loadNcrSummary;

function renderNcrCharts_(summaryRes) {
  var container = document.getElementById('ncrChartsContainer');
  if (!container) return;
  container.style.display = 'grid';

  if (typeof Chart === 'undefined') {
    setTimeout(function() { renderNcrCharts_(summaryRes); }, 250);
    return;
  }

  // 1. Doughnut Chart: Distribusi Status NCR
  var canvasDoughnut = document.getElementById('ncrStatusDoughnutChart');
  if (canvasDoughnut) {
    if (window.ncrStatusChartInstance) {
      window.ncrStatusChartInstance.destroy();
    }

    var closedCount = summaryRes.closed || 0;
    var openCount = summaryRes.open || 0;
    var overdueCount = summaryRes.overdue || 0;

    var legendEl = document.getElementById('ncrStatusLegendSummary');
    if (legendEl) {
      legendEl.innerHTML = '<span style="color:#16a34a; font-weight:700;">' + closedCount + ' Closed</span> · <span style="color:#dc2626; font-weight:700;">' + overdueCount + ' Overdue</span>';
    }

    var ctxD = canvasDoughnut.getContext('2d');
    window.ncrStatusChartInstance = new Chart(ctxD, {
      type: 'doughnut',
      data: {
        labels: ['Closed', 'Open', 'Overdue'],
        datasets: [{
          data: [closedCount, openCount, overdueCount],
          backgroundColor: ['#16a34a', '#d97706', '#dc2626'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 8,
              font: { family: 'Plus Jakarta Sans, sans-serif', size: 10.5, weight: 600 },
              color: '#334155'
            }
          },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                var val = ctx.raw || 0;
                var total = (summaryRes.total || 1);
                var pct = Math.round((val / total) * 100);
                return ' ' + ctx.label + ': ' + val + ' NCR (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  }

  // 2. Bar Chart: NCR per Disiplin
  var canvasBar = document.getElementById('ncrDisciplineBarChart');
  if (canvasBar) {
    if (window.ncrDisciplineChartInstance) {
      window.ncrDisciplineChartInstance.destroy();
    }

    var byDisc = summaryRes.byDiscipline || {};
    var discLabels = Object.keys(byDisc);
    if (!discLabels.length) {
      discLabels = ['Civil/Architecture', 'Mechanical/Piping', 'Fabrication/Logistic', 'Electrical'];
    }

    var closedData = [];
    var openData = [];
    var overdueData = [];

    discLabels.forEach(function(dName) {
      var item = byDisc[dName] || { closed: 0, open: 0, overdue: 0 };
      closedData.push(item.closed || 0);
      openData.push(item.open || 0);
      overdueData.push(item.overdue || 0);
    });

    var ctxB = canvasBar.getContext('2d');
    window.ncrDisciplineChartInstance = new Chart(ctxB, {
      type: 'bar',
      data: {
        labels: discLabels,
        datasets: [
          {
            label: 'Closed',
            data: closedData,
            backgroundColor: '#16a34a',
            borderRadius: 3,
            barPercentage: 0.6,
            categoryPercentage: 0.75
          },
          {
            label: 'Open',
            data: openData,
            backgroundColor: '#d97706',
            borderRadius: 3,
            barPercentage: 0.6,
            categoryPercentage: 0.75
          },
          {
            label: 'Overdue',
            data: overdueData,
            backgroundColor: '#dc2626',
            borderRadius: 3,
            barPercentage: 0.6,
            categoryPercentage: 0.75
          }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              font: { size: 10, family: 'Plus Jakarta Sans, sans-serif', weight: '600' },
              color: '#0f172a'
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 10, family: 'Plus Jakarta Sans, sans-serif', weight: '600' },
              color: '#334155',
              maxRotation: 0,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 10, family: 'JetBrains Mono, monospace' } }
          }
        }
      }
    });
  }
}
window.renderNcrCharts_ = renderNcrCharts_;

function renderNcrTable_(data) {
  var tblWrap = document.getElementById('ncrTableContainer');
  if (!tblWrap) return;

  if (!data || data.length < 2) {
    tblWrap.innerHTML = '<div style="background:var(--surface-card); border:1px solid var(--border); border-radius:6px; padding:24px; text-align:center; color:var(--ink-secondary);">Belum ada data register NCR tercatat di spreadsheet.</div>';
    if (document.getElementById('ncrTableCountInfo')) document.getElementById('ncrTableCountInfo').textContent = '0 dari 0 NCR';
    return;
  }

  var projSet = {};
  var discSet = {};
  for (var i = 1; i < data.length; i++) {
    var pName = (data[i][4] || '').trim();
    var dName = (data[i][3] || '').trim();
    if (pName) projSet[pName] = true;
    if (dName) discSet[dName] = true;
  }

  var projSel = document.getElementById('ncrFilterProject');
  if (projSel) {
    var curP = projSel.value;
    var optHtmlP = '<option value="">Semua Proyek</option>';
    Object.keys(projSet).sort().forEach(function(p) {
      optHtmlP += '<option value="' + escAttr_(p) + '">' + esc(p) + '</option>';
    });
    projSel.innerHTML = optHtmlP;
    if (curP && projSet[curP]) projSel.value = curP;
  }

  var discSel = document.getElementById('ncrFilterDiscipline');
  if (discSel) {
    var curD = discSel.value;
    var optHtmlD = '<option value="">Semua Disiplin</option>';
    Object.keys(discSet).sort().forEach(function(d) {
      optHtmlD += '<option value="' + escAttr_(d) + '">' + esc(d) + '</option>';
    });
    discSel.innerHTML = optHtmlD;
    if (curD && discSet[curD]) discSel.value = curD;
  }

  filterNcrTable_();
}
window.renderNcrTable_ = renderNcrTable_;

function filterNcrTable_() {
  var data = window.allNcrData || [];
  var tblWrap = document.getElementById('ncrTableContainer');
  if (!tblWrap || data.length < 2) return;

  var q = (document.getElementById('ncrSearchInput') ? document.getElementById('ncrSearchInput').value : '').toLowerCase().trim();
  var fProj = (document.getElementById('ncrFilterProject') ? document.getElementById('ncrFilterProject').value : '').trim();
  var fDisc = (document.getElementById('ncrFilterDiscipline') ? document.getElementById('ncrFilterDiscipline').value : '').trim();
  var fStatus = (document.getElementById('ncrFilterStatus') ? document.getElementById('ncrFilterStatus').value : '').trim();

  var rowsHtml = '';
  var matchCount = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var noVal = row[0] || '';
    var ncrNo = row[1] || '';
    var ncrProj = row[2] || '';
    var disc = row[3] || '';
    var proj = row[4] || '';
    var area = row[5] || '';
    var desc = row[6] || '';
    var issuedDate = row[7] || '';
    var pic = row[8] || '';
    var dueDate = row[9] || '';
    var closedDate = row[10] || '';
    var status = (row[11] || 'OPEN').toUpperCase();
    var daysRem = row[12] || '';
    var remarks = row[13] || '';
    var docUrl = row[16] || '';

    // Cari link berkas jika belum ada di index 16 tapi tersimpan di remarks
    if (!docUrl && remarks && /https?:\/\//i.test(remarks)) {
      docUrl = remarks;
    }

    if (fProj && proj !== fProj) continue;
    if (fDisc && disc !== fDisc) continue;
    if (fStatus && status !== fStatus) continue;

    if (q) {
      var fullStr = (ncrNo + ' ' + ncrProj + ' ' + proj + ' ' + area + ' ' + desc + ' ' + pic + ' ' + disc).toLowerCase();
      if (fullStr.indexOf(q) === -1) continue;
    }

    matchCount++;

    var badgeBg = 'rgba(217, 119, 6, 0.12)';
    var badgeColor = '#b45309';
    if (status === 'CLOSED') {
      badgeBg = 'rgba(22, 163, 74, 0.12)';
      badgeColor = '#15803d';
    } else if (status === 'OVERDUE') {
      badgeBg = 'rgba(220, 38, 38, 0.12)';
      badgeColor = '#b91c1c';
    }

    var cleanDesc = esc(desc);
    var shortDesc = cleanDesc.length > 80 ? (cleanDesc.substring(0, 80) + '...') : (cleanDesc || '-');

    // Kolom Tombol Dokumen (Lihat PDF / Upload)
    var docBtnHtml = '';
    if (docUrl) {
      docBtnHtml = '<button type="button" class="btn-small" onclick="viewNcrDocModal(\'' + escAttr_(ncrNo) + '\')" style="padding:4px 8px; font-size:11px; font-weight:600; border-radius:4px; border:1px solid rgba(22,163,74,0.3); background:rgba(22,163,74,0.08); color:#15803d; cursor:pointer;" title="Lihat pratinjau dokumen PDF di Google Drive">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:3px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Lihat PDF</button>';
    } else {
      docBtnHtml = '<button type="button" class="btn-small" onclick="openNcrDocUploadModal(\'' + escAttr_(ncrNo) + '\')" style="padding:4px 8px; font-size:11px; font-weight:600; border-radius:4px; border:1px dashed var(--border, #cbd5e1); background:var(--surface-subtle, #f8fafc); color:var(--ink-secondary, #64748b); cursor:pointer;" title="Unggah dokumen PDF ke Drive qca edms v3">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>+ Upload</button>';
    }

    rowsHtml += '<tr style="border-bottom:1px solid var(--border); transition:background 0.15s ease;">' +
      '<td style="padding:10px 12px; font-variant-numeric:tabular-nums; font-size:12px; color:var(--ink-secondary); text-align:center;">' + esc(noVal) + '</td>' +
      '<td style="padding:10px 12px; white-space:nowrap;">' +
        '<div style="font-family:JetBrains Mono, monospace; font-size:12px; font-weight:700; color:#163d78;">' + esc(ncrNo) + '</div>' +
        (ncrProj ? ('<div style="font-size:10.5px; color:var(--ink-muted); font-family:JetBrains Mono, monospace;">' + esc(ncrProj) + '</div>') : '') +
      '</td>' +
      '<td style="padding:10px 12px; font-size:12px;">' +
        '<div style="font-weight:600; color:var(--ink);">' + esc(proj || '-') + '</div>' +
        (area ? ('<div style="font-size:11px; color:var(--ink-secondary);">' + esc(area) + '</div>') : '') +
      '</td>' +
      '<td style="padding:10px 12px; font-size:11.5px; color:var(--ink-secondary); white-space:nowrap;">' + esc(disc) + '</td>' +
      '<td style="padding:10px 12px; font-size:12px; color:var(--ink); max-width:300px; line-height:1.4;">' +
        '<div style="cursor:pointer;" onclick="viewNcrDetail(\'' + escAttr_(ncrNo) + '\')" title="Klik untuk lihat deskripsi lengkap">' + shortDesc + '</div>' +
      '</td>' +
      '<td style="padding:10px 12px; font-size:11.5px; font-variant-numeric:tabular-nums; white-space:nowrap;">' +
        '<div><span style="color:var(--ink-muted);">Terbit:</span> ' + esc(issuedDate || '-') + '</div>' +
        '<div><span style="color:var(--ink-muted);">Tempo:</span> <span style="font-weight:600;' + (status === 'OVERDUE' ? 'color:#dc2626;' : '') + '">' + esc(dueDate || '-') + '</span></div>' +
      '</td>' +
      '<td style="padding:10px 12px; text-align:center; white-space:nowrap;">' +
        '<span class="badge" style="background:' + badgeBg + '; color:' + badgeColor + '; font-size:11px; font-weight:700; border-radius:3px; padding:3px 8px; text-transform:uppercase;">' + esc(status) + '</span>' +
      '</td>' +
      '<td style="padding:10px 12px; font-size:12px; color:var(--ink); white-space:nowrap;">' + esc(pic || '-') + '</td>' +
      '<td style="padding:10px 12px; text-align:center; white-space:nowrap;">' + docBtnHtml + '</td>' +
      '<td style="padding:10px 12px; text-align:right; white-space:nowrap;">' +
        (function() {
        var uRole = (window.currentUser && window.currentUser.role) || (typeof currentUser !== 'undefined' && currentUser && currentUser.role) || '';
        var isClient = (uRole === 'Client/Konsultan' || uRole === 'Client' || uRole === 'Konsultan');
        var btns = '<button type="button" class="btn-small" onclick="viewNcrDetail(\'' + escAttr_(ncrNo) + '\')" style="padding:4px 8px; font-size:11px; font-weight:600; border-radius:4px; border:1px solid var(--border); background:var(--surface-card); color:var(--ink); cursor:pointer; margin-right:4px;" title="Lihat detail teknis NCR">Detail</button>';
        if (!isClient) {
          btns += '<button type="button" class="btn-small" onclick="openNcrForm(\'' + escAttr_(ncrNo) + '\')" style="padding:4px 8px; font-size:11px; font-weight:600; border-radius:4px; border:1px solid var(--border); background:var(--surface-card); color:var(--ink); cursor:pointer; margin-right:4px;" title="Edit data NCR">Edit</button>' +
                  '<button type="button" class="btn-small" onclick="deleteNcrUI(\'' + escAttr_(ncrNo) + '\')" style="padding:4px 8px; font-size:11px; font-weight:600; border-radius:4px; border:1px solid rgba(220,38,38,0.25); background:rgba(220,38,38,0.06); color:#dc2626; cursor:pointer;" title="Hapus dari register NCR">Hapus</button>';
        }
        return btns;
      })() +
      '</td>' +
    '</tr>';
  }

  var countEl = document.getElementById('ncrTableCountInfo');
  if (countEl) {
    countEl.textContent = 'Menampilkan ' + matchCount + ' dari ' + (data.length - 1) + ' data NCR';
  }

  if (matchCount === 0) {
    tblWrap.innerHTML = '<div style="background:var(--surface-card); border:1px solid var(--border); border-radius:6px; padding:24px; text-align:center; color:var(--ink-secondary);">Tidak ada data NCR yang cocok dengan kriteria pencarian/filter.</div>';
    return;
  }

  var finalHtml = '<div style="background:var(--surface-card, #ffffff); border:1px solid var(--border, #cbd5e1); border-radius:8px; padding:12px 14px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
    '<table style="width:100%; border-collapse:collapse; text-align:left; font-size:12px;">' +
      '<thead>' +
        '<tr style="border-bottom:1.5px solid var(--border); background:var(--surface-subtle, #f8fafc); color:var(--ink-secondary); font-size:11px; text-transform:uppercase; letter-spacing:0.5px;">' +
          '<th style="padding:10px 12px; width:45px; text-align:center;">No</th>' +
          '<th style="padding:10px 12px;">NCR No</th>' +
          '<th style="padding:10px 12px;">Proyek & Area</th>' +
          '<th style="padding:10px 12px;">Disiplin</th>' +
          '<th style="padding:10px 12px;">Deskripsi Temuan NCR</th>' +
          '<th style="padding:10px 12px;">Jadwal</th>' +
          '<th style="padding:10px 12px; text-align:center;">Status</th>' +
          '<th style="padding:10px 12px;">PIC</th>' +
          '<th style="padding:10px 12px; text-align:center;">Dokumen</th>' +
          '<th style="padding:10px 12px; text-align:right;">Aksi</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' + rowsHtml + '</tbody>' +
    '</table>' +
  '</div>';

  tblWrap.innerHTML = finalHtml;
}
window.filterNcrTable_ = filterNcrTable_;

// ==========================================
// FORM ADD / EDIT NCR
// ==========================================
function openNcrForm(ncrNo) {
  var m = document.getElementById('ncrModal');
  if (!m) return;
  var title = document.getElementById('ncrModalTitle');
  var f = document.getElementById('ncrForm');
  if (f) f.reset();

  var fileInput = document.getElementById('ncrFormFileInput');
  if (fileInput) fileInput.value = '';
  var fileStatus = document.getElementById('ncrFormFileStatus');
  if (fileStatus) fileStatus.textContent = '';

  var isEdit = Boolean(ncrNo);
  if (title) title.textContent = isEdit ? ('Edit Data NCR: ' + ncrNo) : 'Tambah Data NCR Baru';
  var btn = document.getElementById('ncrSubmitBtn');
  if (btn) btn.textContent = isEdit ? 'Perbarui Data NCR' : 'Simpan Data NCR';

  var noInput = document.getElementById('ncrFormNo');

  if (isEdit) {
    var data = window.allNcrData || [];
    var record = null;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim() === String(ncrNo).trim()) {
        record = data[i];
        break;
      }
    }
    if (record) {
      if (noInput) { noInput.value = record[1] || ''; noInput.readOnly = true; }
      if (document.getElementById('ncrFormProjectCode')) document.getElementById('ncrFormProjectCode').value = record[2] || '';
      if (document.getElementById('ncrFormDiscipline')) document.getElementById('ncrFormDiscipline').value = record[3] || 'Civil/Architecture';
      if (document.getElementById('ncrFormProject')) document.getElementById('ncrFormProject').value = record[4] || '';
      if (document.getElementById('ncrFormArea')) document.getElementById('ncrFormArea').value = record[5] || '';
      if (document.getElementById('ncrFormDesc')) document.getElementById('ncrFormDesc').value = record[6] || '';
      if (document.getElementById('ncrFormIssuedDate')) document.getElementById('ncrFormIssuedDate').value = record[7] || '';
      if (document.getElementById('ncrFormPic')) document.getElementById('ncrFormPic').value = record[8] || '';
      if (document.getElementById('ncrFormDueDate')) document.getElementById('ncrFormDueDate').value = record[9] || '';
      if (document.getElementById('ncrFormClosedDate')) document.getElementById('ncrFormClosedDate').value = record[10] || '';
      if (document.getElementById('ncrFormStatus')) document.getElementById('ncrFormStatus').value = (record[11] || 'OPEN').toUpperCase();
      if (document.getElementById('ncrFormRemarks')) document.getElementById('ncrFormRemarks').value = record[13] || '';
      if (fileStatus && record[16]) fileStatus.innerHTML = '<span style="color:#15803d; font-weight:600;">Dokumen terlampir</span>';
    }
  } else {
    if (noInput) {
      noInput.readOnly = false;
      var nextNum = (window.allNcrData && window.allNcrData.length) ? (window.allNcrData.length) : 1;
      noInput.value = 'NCR-QCA-AEI-' + String(nextNum).padStart(4, '0');
    }
    if (document.getElementById('ncrFormIssuedDate')) {
      var d = new Date();
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      document.getElementById('ncrFormIssuedDate').value = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }
  }

  m.style.display = 'flex';
}
window.openNcrForm = openNcrForm;

function closeNcrForm() {
  var m = document.getElementById('ncrModal');
  if (m) m.style.display = 'none';
}
window.closeNcrForm = closeNcrForm;

function saveNcrData(e) {
  if (e) e.preventDefault();
  var btn = document.getElementById('ncrSubmitBtn');
  var oldText = btn ? btn.textContent : 'Simpan';
  if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }

  var payload = {
    ncrNo:        document.getElementById('ncrFormNo').value.trim(),
    ncrProject:   document.getElementById('ncrFormProjectCode').value.trim(),
    project:      document.getElementById('ncrFormProject').value.trim(),
    area:         document.getElementById('ncrFormArea').value.trim(),
    discipline:   document.getElementById('ncrFormDiscipline').value,
    description:  document.getElementById('ncrFormDesc').value.trim(),
    pic:          document.getElementById('ncrFormPic').value.trim(),
    issuedDate:   document.getElementById('ncrFormIssuedDate').value.trim(),
    dueDate:      document.getElementById('ncrFormDueDate').value.trim(),
    closedDate:   document.getElementById('ncrFormClosedDate').value.trim(),
    status:       document.getElementById('ncrFormStatus').value,
    remarks:      document.getElementById('ncrFormRemarks').value.trim()
  };

  var fileInput = document.getElementById('ncrFormFileInput');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(evt) {
      payload.fileBase64 = evt.target.result;
      payload.fileName = file.name;
      payload.mimeType = file.type || 'application/pdf';
      executeSubmitNcr_(payload, btn, oldText);
    };
    reader.onerror = function() {
      if (typeof showToast === 'function') showToast('Gagal membaca berkas file.', 'error');
      executeSubmitNcr_(payload, btn, oldText);
    };
    reader.readAsDataURL(file);
  } else {
    executeSubmitNcr_(payload, btn, oldText);
  }
}
window.saveNcrData = saveNcrData;

function executeSubmitNcr_(payload, btn, oldText) {
  if (typeof google === 'undefined' || !google.script || !google.script.run) {
    setTimeout(function() {
      if (btn) { btn.disabled = false; btn.textContent = oldText; }
      if (typeof showToast === 'function') showToast('[Preview Mode] Data NCR ' + payload.ncrNo + ' disimulasikan tersimpan!', 'success');
      closeNcrForm();
    }, 600);
    return;
  }
  google.script.run
    .withSuccessHandler(function(res) {
      if (btn) { btn.disabled = false; btn.textContent = oldText; }
      if (res && res.success) {
        if (typeof showToast === 'function') showToast(res.message || 'Data NCR berhasil disimpan!', 'success');
        closeNcrForm();
        loadNcrData();
      } else {
        if (typeof showToast === 'function') showToast((res && (res.error || res.message)) || 'Gagal menyimpan NCR', 'error');
      }
    })
    .withFailureHandler(function(err) {
      if (btn) { btn.disabled = false; btn.textContent = oldText; }
      if (typeof showToast === 'function') showToast('Error: ' + (err.message || 'Koneksi gagal'), 'error');
    })
    .submitNcr(payload);
}

function deleteNcrUI(ncrNo) {
  if (typeof google === 'undefined' || !google.script || !google.script.run) {
    if (!confirm('Apakah Anda yakin ingin menghapus ' + ncrNo + ' dari register NCR?')) return;
    if (typeof showToast === 'function') showToast('[Preview Mode] ' + ncrNo + ' disimulasikan terhapus!', 'success');
    return;
  }
  if (!confirm('Apakah Anda yakin ingin menghapus ' + ncrNo + ' dari register NCR spreadsheet?')) return;
  if (typeof showToast === 'function') showToast('Menghapus ' + ncrNo + '...', 'info');

  google.script.run
    .withSuccessHandler(function(res) {
      if (res && res.success) {
        if (typeof showToast === 'function') showToast(res.message || 'NCR berhasil dihapus!', 'success');
        loadNcrData();
      } else {
        if (typeof showToast === 'function') showToast((res && (res.error || res.message)) || 'Gagal menghapus NCR', 'error');
      }
    })
    .withFailureHandler(function(err) {
      if (typeof showToast === 'function') showToast('Error: ' + (err.message || 'Gagal'), 'error');
    })
    .submitNcr({ ncrNo: ncrNo, isDelete: true });
}
window.deleteNcrUI = deleteNcrUI;

// ==========================================
// MODAL DETAIL TEKNIS NCR
// ==========================================
function viewNcrDetail(ncrNo) {
  var data = window.allNcrData || [];
  var record = null;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(ncrNo).trim()) {
      record = data[i];
      break;
    }
  }

  if (!record) {
    if (typeof showToast === 'function') showToast('Data NCR tidak ditemukan.', 'error');
    return;
  }

  var m = document.getElementById('ncrDetailModal');
  var titleNo = document.getElementById('ncrDetailNoText');
  var badgeEl = document.getElementById('ncrDetailBadge');
  var subEl = document.getElementById('ncrDetailSub');
  var contentEl = document.getElementById('ncrDetailContent');
  var metaEl = document.getElementById('ncrDetailFooterMeta');
  var editBtn = document.getElementById('btnNcrDetailEdit');

  var status = (record[11] || 'OPEN').toUpperCase();
  var badgeBg = status === 'CLOSED' ? '#16a34a' : (status === 'OVERDUE' ? '#dc2626' : '#d97706');
  var docUrl = record[16] || '';

  if (titleNo) titleNo.textContent = record[1];
  if (badgeEl) {
    badgeEl.textContent = status;
    badgeEl.style.background = badgeBg;
    badgeEl.style.color = '#ffffff';
  }
  if (subEl) {
    subEl.textContent = 'Proyek: ' + (record[4] || '-') + (record[5] ? (' (' + record[5] + ')') : '') + ' | Disiplin: ' + (record[3] || '-');
  }

  // Card info dokumen PDF
  var docCardHtml = '';
  if (docUrl) {
    docCardHtml = '<div style="background:rgba(22,61,120,0.06); border:1px solid rgba(22,61,120,0.2); border-radius:6px; padding:12px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">' +
      '<div>' +
        '<div style="font-size:11px; font-weight:700; color:#163d78; text-transform:uppercase;">Dokumen Bukti NCR (Google Drive)</div>' +
        '<div style="font-size:12px; color:var(--ink); margin-top:2px;">Tersimpan di folder: <code>qca edms v3 / Dokumen NCR</code></div>' +
      '</div>' +
      '<div style="display:flex; gap:6px;">' +
        '<button type="button" class="btn btn-primary btn-small" onclick="viewNcrDocModal(\'' + escAttr_(record[1]) + '\')" style="background:#163d78; border-color:#163d78; font-size:11px; font-weight:600; padding:5px 12px; border-radius:4px; cursor:pointer;">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Lihat Dokumen' +
        '</button>' +
        '<button type="button" class="btn btn-secondary btn-small" onclick="openNcrDocUploadModal(\'' + escAttr_(record[1]) + '\')" style="font-size:11px; font-weight:600; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Ganti berkas dokumen">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>';
  } else {
    docCardHtml = '<div style="background:var(--surface-subtle); border:1px dashed var(--border); border-radius:6px; padding:12px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">' +
      '<div>' +
        '<div style="font-size:11px; font-weight:700; color:var(--ink-secondary); text-transform:uppercase;">Berkas Dokumen NCR</div>' +
        '<div style="font-size:12px; color:var(--ink-muted);">Belum ada dokumen PDF dilampirkan</div>' +
      '</div>' +
      '<button type="button" class="btn btn-secondary btn-small" onclick="openNcrDocUploadModal(\'' + escAttr_(record[1]) + '\')" style="font-size:11px; font-weight:600; padding:5px 12px; border-radius:4px; cursor:pointer;">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>+ Unggah PDF ke Drive' +
      '</button>' +
    '</div>';
  }

  if (contentEl) {
    contentEl.innerHTML = docCardHtml +
      '<div style="margin-bottom:14px; background:var(--surface-subtle); padding:12px 14px; border-radius:6px; border:1px solid var(--border);">' +
        '<div style="font-size:11px; font-weight:700; color:var(--ink-secondary); text-transform:uppercase; margin-bottom:4px;">Deskripsi Ketidaksesuaian Mutu</div>' +
        '<div style="font-size:13.5px; color:var(--ink); line-height:1.6;">' + esc(record[6] || '-') + '</div>' +
      '</div>' +
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">' +
        '<div style="background:var(--surface-subtle); padding:10px 12px; border-radius:6px; border:1px solid var(--border);">' +
          '<div style="font-size:11px; color:var(--ink-muted);">Kode NCR Proyek:</div>' +
          '<div style="font-weight:600; font-family:JetBrains Mono, monospace; font-size:12px; color:var(--ink);">' + esc(record[2] || '-') + '</div>' +
        '</div>' +
        '<div style="background:var(--surface-subtle); padding:10px 12px; border-radius:6px; border:1px solid var(--border);">' +
          '<div style="font-size:11px; color:var(--ink-muted);">PIC Penanggung Jawab:</div>' +
          '<div style="font-weight:600; font-size:12.5px; color:var(--ink);">' + esc(record[8] || '-') + '</div>' +
        '</div>' +
        '<div style="background:var(--surface-subtle); padding:10px 12px; border-radius:6px; border:1px solid var(--border);">' +
          '<div style="font-size:11px; color:var(--ink-muted);">Issued Date:</div>' +
          '<div style="font-weight:600; font-size:12px; color:var(--ink); font-variant-numeric:tabular-nums;">' + esc(record[7] || '-') + '</div>' +
        '</div>' +
        '<div style="background:var(--surface-subtle); padding:10px 12px; border-radius:6px; border:1px solid var(--border);">' +
          '<div style="font-size:11px; color:var(--ink-muted);">Due Date / Target:</div>' +
          '<div style="font-weight:600; font-size:12px; font-variant-numeric:tabular-nums;' + (status === 'OVERDUE' ? 'color:#dc2626;' : 'color:var(--ink);') + '">' + esc(record[9] || '-') + '</div>' +
        '</div>' +
      '</div>' +
      (record[10] ? ('<div style="background:rgba(22,163,74,0.08); border:1px solid rgba(22,163,74,0.25); border-radius:6px; padding:8px 12px; margin-bottom:12px; font-size:12px; color:#15803d;"><b>Closed Date:</b> ' + esc(record[10]) + '</div>') : '') +
      (record[13] ? ('<div style="background:var(--surface-subtle); padding:10px 12px; border-radius:6px; border:1px solid var(--border); font-size:12px;"><b>Remarks:</b> ' + esc(record[13]) + '</div>') : '');
  }

  if (metaEl) {
    metaEl.textContent = 'Spreadsheet Row: ' + (record[15] || '-');
  }

  if (editBtn) {
    editBtn.onclick = function() {
      closeNcrDetailModal();
      openNcrForm(record[1]);
    };
  }

  if (m) m.style.display = 'flex';
}
window.viewNcrDetail = viewNcrDetail;

function closeNcrDetailModal() {
  var m = document.getElementById('ncrDetailModal');
  if (m) m.style.display = 'none';
}
window.closeNcrDetailModal = closeNcrDetailModal;

// ==========================================
// MODAL PREVIEW & UPLOAD DOKUMEN NCR (DRIVE)
// ==========================================
function viewNcrDocModal(ncrNo) {
  var data = window.allNcrData || [];
  var record = null;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(ncrNo).trim()) {
      record = data[i];
      break;
    }
  }

  window.activeUploadNcrNo = ncrNo;

  var m = document.getElementById('ncrDocPreviewModal');
  var titleEl = document.getElementById('ncrDocModalTitle');
  var subEl = document.getElementById('ncrDocModalSub');
  var iframe = document.getElementById('ncrDocIframe');
  var fallbackView = document.getElementById('ncrDocFallbackView');
  var fallbackName = document.getElementById('ncrDocFallbackName');
  var fallbackDesc = document.getElementById('ncrDocFallbackDesc');
  var newTabBtn = document.getElementById('btnNcrDocOpenNewTab');

  if (titleEl) titleEl.textContent = 'Dokumen NCR: ' + ncrNo;
  var projName = (record && record[4]) ? record[4] : 'Proyek';
  var discName = (record && record[3]) ? record[3] : 'General';
  if (subEl) subEl.textContent = 'Proyek: ' + projName + ' | Disiplin: ' + discName + ' | Folder: qca edms v3 / Dokumen NCR';

  var docUrl = record ? (record[16] || '') : '';
  if (!docUrl && record && record[13] && /https?:\/\//i.test(record[13])) {
    docUrl = record[13];
  }

  if (docUrl) {
    var previewUrl = docUrl;
    var driveMatch = docUrl.match(/[-\w]{25,}/);
    if (driveMatch && (docUrl.indexOf('drive.google.com') !== -1 || docUrl.indexOf('docs.google.com') !== -1)) {
      previewUrl = 'https://drive.google.com/file/d/' + driveMatch[0] + '/preview';
    }

    if (iframe) {
      iframe.src = previewUrl;
      iframe.style.display = 'block';
    }
    if (fallbackView) fallbackView.style.display = 'none';
    if (newTabBtn) {
      newTabBtn.href = docUrl;
      newTabBtn.style.display = 'inline-flex';
    }
  } else {
    if (iframe) {
      iframe.src = '';
      iframe.style.display = 'none';
    }
    if (fallbackView) fallbackView.style.display = 'block';
    if (fallbackName) fallbackName.textContent = 'Belum Ada Dokumen untuk ' + ncrNo;
    if (fallbackDesc) fallbackDesc.textContent = 'Silakan pilih berkas laporan NCR resmi (format PDF / scan) untuk diunggah langsung ke Google Drive root folder qca edms v3.';
    if (newTabBtn) newTabBtn.style.display = 'none';
  }

  if (m) m.style.display = 'flex';
}
window.viewNcrDocModal = viewNcrDocModal;

function openNcrDocUploadModal(ncrNo) {
  viewNcrDocModal(ncrNo);
  // Langsung tampilkan mode upload fallback
  var iframe = document.getElementById('ncrDocIframe');
  var fallbackView = document.getElementById('ncrDocFallbackView');
  if (iframe) { iframe.src = ''; iframe.style.display = 'none'; }
  if (fallbackView) fallbackView.style.display = 'block';
}
window.openNcrDocUploadModal = openNcrDocUploadModal;

function closeNcrDocModal() {
  var m = document.getElementById('ncrDocPreviewModal');
  if (m) m.style.display = 'none';
  var iframe = document.getElementById('ncrDocIframe');
  if (iframe) iframe.src = '';
  window.activeUploadNcrNo = null;
}
window.closeNcrDocModal = closeNcrDocModal;

function triggerNcrDocUploadFromPreview_() {
  var fileInput = document.getElementById('ncrDocDirectUploadInput');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}
window.triggerNcrDocUploadFromPreview_ = triggerNcrDocUploadFromPreview_;

function handleNcrDocDirectUploadSelected_(input) {
  if (!input || !input.files || !input.files[0]) return;
  var f = input.files[0];
  var ncrNo = window.currentNcrViewingDoc || 'NCR';
  if (typeof google === 'undefined' || !google.script || !google.script.run) {
    if (typeof showToast === 'function') showToast('[Preview Mode] Berkas ' + f.name + ' disimulasikan berhasil diunggah!', 'success');
    input.value = '';
    closeNcrDocModal();
    return;
  }
  if (!input || !input.files || !input.files[0]) return;
  var file = input.files[0];
  var ncrNo = window.activeUploadNcrNo;
  if (!ncrNo) {
    if (typeof showToast === 'function') showToast('Nomor NCR tidak teridentifikasi.', 'error');
    return;
  }

  var data = window.allNcrData || [];
  var record = null;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(ncrNo).trim()) {
      record = data[i];
      break;
    }
  }

  var proj = record ? (record[4] || 'Umum') : 'Umum';
  var disc = record ? (record[3] || 'General') : 'General';

  var btn = document.getElementById('btnUploadNcrDocFromPreview');
  var oldBtnHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner dark" style="vertical-align:-2px; margin-right:6px;"></span>Mengunggah ke Drive...';
  }
  if (typeof showToast === 'function') showToast('Mengunggah berkas ' + file.name + ' ke Drive qca edms v3...', 'info');

  var reader = new FileReader();
  reader.onload = function(evt) {
    var payload = {
      ncrNo: ncrNo,
      project: proj,
      discipline: disc,
      fileName: file.name,
      fileBase64: evt.target.result,
      mimeType: file.type || 'application/pdf'
    };

    if (typeof google === 'undefined' || !google.script || !google.script.run) {
      setTimeout(function() {
        if (btn) { btn.disabled = false; btn.innerHTML = oldBtnHtml; }
        if (typeof showToast === 'function') showToast('[Preview Mode] Berkas berhasil diunggah secara simulasi.', 'success');
        if (record) record[16] = 'https://drive.google.com/file/d/simulated_' + Date.now() + '/preview';
        viewNcrDocModal(ncrNo);
        renderNcrTable_(window.allNcrData);
      }, 900);
      return;
    }

    google.script.run
      .withSuccessHandler(function(res) {
        if (btn) { btn.disabled = false; btn.innerHTML = oldBtnHtml; }
        if (res && res.success) {
          if (typeof showToast === 'function') showToast(res.message || 'Dokumen NCR berhasil diunggah ke Google Drive!', 'success');
          if (record) record[16] = res.fileUrl;
          viewNcrDocModal(ncrNo);
          loadNcrData();
        } else {
          if (typeof showToast === 'function') showToast((res && (res.error || res.message)) || 'Gagal mengunggah dokumen.', 'error');
        }
      })
      .withFailureHandler(function(err) {
        if (btn) { btn.disabled = false; btn.innerHTML = oldBtnHtml; }
        if (typeof showToast === 'function') showToast('Error upload: ' + (err.message || 'Koneksi gagal'), 'error');
      })
      .uploadNcrDocument(payload);
  };
  reader.onerror = function() {
    if (btn) { btn.disabled = false; btn.innerHTML = oldBtnHtml; }
    if (typeof showToast === 'function') showToast('Gagal membaca berkas file lokal.', 'error');
  };
  reader.readAsDataURL(file);
}
window.handleNcrDocDirectUploadSelected_ = handleNcrDocDirectUploadSelected_;

// ==========================================
// HITUNG STATISTIK SUMMARY MOCK
// ==========================================
function calculateNcrSummaryMock_(data) {
  var total = 0, closed = 0, open = 0, overdue = 0;
  var byDiscipline = {};
  var byProject = {};

  for (var i = 1; i < data.length; i++) {
    total++;
    var st = (data[i][11] || 'OPEN').toUpperCase();
    var disc = data[i][3] || 'General';
    var proj = data[i][4] || 'Lainnya';

    if (st === 'CLOSED') closed++;
    else if (st === 'OVERDUE') overdue++;
    else open++;

    if (!byDiscipline[disc]) byDiscipline[disc] = { closed: 0, open: 0, overdue: 0 };
    if (st === 'CLOSED') byDiscipline[disc].closed++;
    else if (st === 'OVERDUE') byDiscipline[disc].overdue++;
    else byDiscipline[disc].open++;

    if (!byProject[proj]) byProject[proj] = { closed: 0, open: 0, overdue: 0 };
    if (st === 'CLOSED') byProject[proj].closed++;
    else if (st === 'OVERDUE') byProject[proj].overdue++;
    else byProject[proj].open++;
  }

  if (document.getElementById('kpiNcrTotal')) document.getElementById('kpiNcrTotal').textContent = total;
  if (document.getElementById('kpiNcrClosed')) {
    var pct = total ? Math.round((closed / total) * 100) : 0;
    document.getElementById('kpiNcrClosed').innerHTML = closed + ' <span style="font-size:12px; font-weight:600; color:var(--ink-secondary);">(' + pct + '%)</span>';
  }
  if (document.getElementById('kpiNcrOpen')) document.getElementById('kpiNcrOpen').textContent = open;
  if (document.getElementById('kpiNcrOverdue')) document.getElementById('kpiNcrOverdue').textContent = overdue;

  return { success: true, total: total, closed: closed, open: open, overdue: overdue, byDiscipline: byDiscipline, byProject: byProject };
}
