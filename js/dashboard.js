document.addEventListener('DOMContentLoaded', function () {
  const chips = Array.from(document.querySelectorAll('.chip'));
  const cards = Array.from(document.querySelectorAll('.panel-card'));
  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  const refreshBtn = document.getElementById('refresh-metrics');

  function animateCounter(node) {
    const target = Number(node.getAttribute('data-counter') || '0');
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const value = Math.round(progress * target);
      node.textContent = String(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function runCounters() {
    counters.forEach(animateCounter);
  }

  function setFilter(kind) {
    cards.forEach(function (card) {
      const match = kind === 'all' || card.getAttribute('data-kind') === kind;
      card.classList.toggle('hidden', !match);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (el) {
        el.classList.remove('active');
      });
      chip.classList.add('active');
      const kind = chip.getAttribute('data-filter') || 'all';
      setFilter(kind);
    });
  });

  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
      runCounters();
      refreshBtn.classList.add('spinning');
      window.setTimeout(function () {
        refreshBtn.classList.remove('spinning');
      }, 700);
    });
  }

  runCounters();
});
