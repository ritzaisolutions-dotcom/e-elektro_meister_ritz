(function () {
  var state = { step: 1, projekt: null, projekttyp: null, units: 5, extras: [] };

  var PROJECTS = [
    { id: 'steckdosen',   label: 'Steckdosen / Schalter',    icon: 'electrical_services', multi: 0.90 },
    { id: 'unterverteil', label: 'Unterverteilung / Kasten',  icon: 'electric_meter',      multi: 1.20 },
    { id: 'smarthome',    label: 'Smart Home',                icon: 'home_iot_device',     multi: 1.40 },
    { id: 'pv',           label: 'PV-Anlage / Wallbox',       icon: 'solar_power',         multi: 1.60 },
    { id: 'neuinstall',   label: 'Neuinstallation komplett',  icon: 'bolt',                multi: 1.80 }
  ];

  var PROJEKTTYP = [
    { id: 'neubau',         label: 'Neubau',          sub: 'Vollständige Neuinstallation',    basePerUnit: 450 },
    { id: 'sanierung',      label: 'Sanierung',        sub: 'Umbau / Erweiterung bestehend',        basePerUnit: 320 },
    { id: 'einzelleistung', label: 'Einzelleistung',   sub: 'Einzelne Schaltpunkte / Geräte',  basePerUnit: 180 }
  ];

  var EXTRAS = [
    { id: 'unterputz', label: 'Unterputzverlegung (aufwändig)', pricePerUnit: 50,  priceFlat: 0   },
    { id: 'smarthome', label: 'Smart Home Integration',               pricePerUnit: 80,  priceFlat: 0   },
    { id: 'notstrom',  label: 'Notstromanbindung / USV',              pricePerUnit: 0,   priceFlat: 300 }
  ];

  var pg = document.getElementById('calcProjectCards');
  if (!pg) return;

  PROJECTS.forEach(function (p) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wizard-proj-card';
    btn.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">' + p.icon + '</span>' +
      '<span class="wizard-proj-label">' + p.label + '</span>';
    btn.addEventListener('click', function () {
      state.projekt = p.id;
      pg.querySelectorAll('.wizard-proj-card').forEach(function (c) { c.classList.remove('selected'); });
      btn.classList.add('selected');
      setTimeout(function () { goTo(2); }, 180);
    });
    pg.appendChild(btn);
  });

  var tg = document.getElementById('calcProjektTypCards');
  if (tg) {
    PROJEKTTYP.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wizard-mat-card';
      btn.innerHTML =
        '<span class="wizard-mat-name">' + t.label + '</span>' +
        '<span class="wizard-mat-sub">' + t.sub + '</span>';
      btn.addEventListener('click', function () {
        state.projekttyp = t.id;
        tg.querySelectorAll('.wizard-mat-card').forEach(function (c) { c.classList.remove('selected'); });
        btn.classList.add('selected');
        var err = document.getElementById('calcStep2Error');
        if (err) err.classList.remove('visible');
      });
      tg.appendChild(btn);
    });
  }

  var slider = document.getElementById('wizUnits');
  var sliderLabel = document.getElementById('wizUnitsLabel');
  if (slider && sliderLabel) {
    slider.addEventListener('input', function () {
      state.units = parseInt(slider.value, 10);
      sliderLabel.textContent = slider.value;
    });
  }

  var eg = document.getElementById('calcExtrasCards');
  if (eg) {
    EXTRAS.forEach(function (e) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wizard-extra-btn';
      var priceLabel = e.priceFlat > 0 ? '+ ' + e.priceFlat + ' € pausch.' : '+ ' + e.pricePerUnit + ' €/Einh.';
      btn.innerHTML =
        '<span class="wizard-extra-name">' + e.label + '</span>' +
        '<span class="wizard-extra-price">' + priceLabel + '</span>';
      btn.addEventListener('click', function () {
        var i = state.extras.indexOf(e.id);
        if (i === -1) { state.extras.push(e.id); btn.classList.add('selected'); }
        else { state.extras.splice(i, 1); btn.classList.remove('selected'); }
      });
      eg.appendChild(btn);
    });
  }

  function goTo(n) {
    if (n === 3) {
      if (!state.projekttyp) {
        var err = document.getElementById('calcStep2Error');
        if (err) err.classList.add('visible');
        return;
      }
      state.units = parseInt(document.getElementById('wizUnits').value, 10) || 5;
    }
    if (n === 4) { computeResult(); }
    state.step = n;
    [1, 2, 3, 4].forEach(function (s) {
      var el = document.getElementById('calcStep' + s);
      if (el) el.style.display = s === n ? '' : 'none';
    });
    refreshNav();
    refreshBar();
    var anchor = document.getElementById('kostenrechner');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function computeResult() {
    var pt   = PROJEKTTYP.filter(function (t) { return t.id === state.projekttyp; })[0];
    var proj = PROJECTS.filter(function (p) { return p.id === state.projekt; })[0];
    var base = state.units * (pt ? pt.basePerUnit : 320) * (proj ? proj.multi : 1);
    EXTRAS.forEach(function (e) {
      if (state.extras.indexOf(e.id) !== -1) {
        base += e.priceFlat > 0 ? e.priceFlat : state.units * e.pricePerUnit;
      }
    });
    var min = Math.round(base * 0.93 / 10) * 10;
    var max = Math.round(base * 1.12 / 10) * 10;
    var out = document.getElementById('wizPriceOutput');
    if (out) out.textContent = '€ ' + min.toLocaleString('de-DE') + ' – € ' + max.toLocaleString('de-DE');
    var sum = document.getElementById('calcSummaryText');
    if (sum) sum.textContent =
      (proj ? proj.label : '') + ' · ' +
      state.units + ' Räume/Schaltpunkte · ' +
      (pt ? pt.label : '') +
      (state.extras.length ? ' · inkl. Zusatzleistungen' : '');
  }

  function refreshNav() {
    var back = document.getElementById('calcBack');
    var next = document.getElementById('calcNext');
    var nav  = document.getElementById('calcNav');
    if (!back || !next || !nav) return;
    back.style.display = state.step <= 1 ? 'none' : '';
    next.style.display = (state.step === 1 || state.step === 4) ? 'none' : '';
    nav.style.display  = state.step === 4 ? 'none' : '';
  }

  function refreshBar() {
    document.querySelectorAll('.wizard-dot').forEach(function (d) {
      var s = parseInt(d.dataset.step, 10);
      d.classList.toggle('active', s <= state.step);
    });
    document.querySelectorAll('.wizard-track').forEach(function (t) {
      var s = parseInt(t.dataset.step, 10);
      t.classList.toggle('active', s < state.step);
    });
  }

  var backBtn  = document.getElementById('calcBack');
  var nextBtn  = document.getElementById('calcNext');
  var resetBtn = document.getElementById('calcReset');

  if (backBtn)  backBtn.addEventListener('click',  function () { goTo(state.step - 1); });
  if (nextBtn)  nextBtn.addEventListener('click',  function () { goTo(state.step + 1); });
  if (resetBtn) resetBtn.addEventListener('click', function () {
    state = { step: 1, projekt: null, projekttyp: null, units: 5, extras: [] };
    document.querySelectorAll('.wizard-proj-card, .wizard-mat-card, .wizard-extra-btn')
      .forEach(function (c) { c.classList.remove('selected'); });
    var sl = document.getElementById('wizUnits');
    if (sl) sl.value = 5;
    var lb = document.getElementById('wizUnitsLabel');
    if (lb) lb.textContent = '5';
    goTo(1);
  });
}());
