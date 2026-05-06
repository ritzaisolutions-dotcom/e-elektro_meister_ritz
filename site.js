(function () {
  var slideshow = document.querySelector('.hero-slideshow');
  if (slideshow) {
    var slides = slideshow.querySelectorAll('img');
    var current = 0;
    setInterval(function () {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 6000);
  }

  var outer = document.getElementById('reviewsCarouselOuter');
  var track = document.getElementById('reviewsCarouselTrack');
  var set   = document.getElementById('reviewsScrollSet');
  if (outer && track && set) {
    var clone = set.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    outer.addEventListener('mouseenter', function () {
      track.style.animationPlayState = 'paused';
    });
    outer.addEventListener('mouseleave', function () {
      track.style.animationPlayState = 'running';
    });
  }

  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });
  }

  document.querySelectorAll('[data-faq-trigger]').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.faq-item');
      if (!item) return;
      var open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
}());
