(function () {
  var state = { step: 1, projekt: null, flaeche: null, material: null, extras: [] };

  var PROJECTS = [
    { id: 'steckdosen',   label: 'Steckdosen / Schalter',    icon: 'electrical_services', multi: 0.90 },
    { id: 'unterverteil', label: 'Unterverteilung / Kasten',  icon: 'electric_meter',      multi: 1.20 },
    { id: 'smarthome',    label: 'Smart Home',                icon: 'home_iot_device',     multi: 1.40 },
    { id: 'pv',           label: 'PV-Anlage / Wallbox',       icon: 'solar_power',         multi: 1.60 },
    { id: 'neuinstall',   label: 'Neuinstallation komplett',  icon: 'bolt',                multi: 1.80 }
  ];

  var MATERIALS = [
    { id: 'basis',    label: 'Basis',    sub: 'Standardausstattung ca. 25 €/m²',  price: 25 },
    { id: 'komfort',  label: 'Komfort',  sub: 'Erweitert ca. 45 €/m²',             price: 45 },
    { id: 'premium',  label: 'Premium',  sub: 'Smart Home ca. 75 €/m²',            price: 75 }
  ];

  var EXTRAS = [
    { id: 'unterputz', label: 'Unterputzverlegung (aufwändig)', price: 15 },
    { id: 'smarthome', label: 'Smart Home Integration',               price: 20 },
    { id: 'notstrom',  label: 'Notstromanbindung / USV',              price: 10 }
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

  var mg = document.getElementById('calcMaterialCards');
  MATERIALS.forEach(function (m) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wizard-mat-card';
    btn.innerHTML =
      '<span class="wizard-mat-name">' + m.label + '</span>' +
      '<span class="wizard-mat-sub">' + m.sub + '</span>';
    btn.addEventListener('click', function () {
      state.material = m.id;
      mg.querySelectorAll('.wizard-mat-card').forEach(function (c) { c.classList.remove('selected'); });
      btn.classList.add('selected');
      var err = document.getElementById('calcStep2Error');
      if (err) err.classList.remove('visible');
    });
    mg.appendChild(btn);
  });

  var eg = document.getElementById('calcExtrasCards');
  EXTRAS.forEach(function (e) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wizard-extra-btn';
    btn.innerHTML =
      '<span class="wizard-extra-name">' + e.label + '</span>' +
      '<span class="wizard-extra-price">+ ' + e.price + ' €/m²</span>';
    btn.addEventListener('click', function () {
      var i = state.extras.indexOf(e.id);
      if (i === -1) { state.extras.push(e.id); btn.classList.add('selected'); }
      else { state.extras.splice(i, 1); btn.classList.remove('selected'); }
    });
    eg.appendChild(btn);
  });

  function goTo(n) {
    if (n === 3) {
      var fl = parseFloat(document.getElementById('wizFlaeche').value);
      if (!fl || fl < 1 || !state.material) {
        var err = document.getElementById('calcStep2Error');
        if (err) err.classList.add('visible');
        return;
      }
      state.flaeche = fl;
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
    var mat  = MATERIALS.filter(function (m) { return m.id === state.material; })[0];
    var proj = PROJECTS.filter(function (p) { return p.id === state.projekt; })[0];
    var base = state.flaeche * (mat ? mat.price : 25) * (proj ? proj.multi : 1);
    EXTRAS.forEach(function (e) {
      if (state.extras.indexOf(e.id) !== -1) base += state.flaeche * e.price;
    });
    var min = Math.round(base * 0.93 / 10) * 10;
    var max = Math.round(base * 1.12 / 10) * 10;
    var out = document.getElementById('wizPriceOutput');
    if (out) out.textContent = '€ ' + min.toLocaleString('de-DE') + ' – € ' + max.toLocaleString('de-DE');
    var sum = document.getElementById('calcSummaryText');
    if (sum) sum.textContent =
      (proj ? proj.label : '') + ' · ' +
      state.flaeche + ' m² · ' +
      (mat ? mat.label : '') +
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
    state = { step: 1, projekt: null, flaeche: null, material: null, extras: [] };
    document.querySelectorAll('.wizard-proj-card, .wizard-mat-card, .wizard-extra-btn')
      .forEach(function (c) { c.classList.remove('selected'); });
    var inp = document.getElementById('wizFlaeche');
    if (inp) inp.value = '';
    goTo(1);
  });
}());
