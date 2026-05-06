(function () {
  var form = document.getElementById('contactForm');
  var status = document.getElementById('contactStatus');
  if (!form || !status) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      status.textContent = 'Bitte fuellen Sie die Pflichtfelder vollstaendig aus.';
      status.classList.add('is-visible');
      form.reportValidity();
      return;
    }

    status.innerHTML = 'Danke. Ihre Nachricht ist in dieser Demo nicht versendet worden. Im Live-System wird hier Web3Forms, ein CRM oder eine direkte E-Mail-Anbindung genutzt.';
    status.classList.add('is-visible');
    form.reset();
  });
}());
