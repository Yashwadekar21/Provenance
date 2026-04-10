document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.querySelector('.search-wrap input');
  const items = Array.from(document.querySelectorAll('[data-search-item]'));
  const emptyState = document.querySelector('[data-empty-state]');
  const quickActions = Array.from(document.querySelectorAll('.quick-action'));
  const toggles = Array.from(document.querySelectorAll('[data-collapsible]'));

  function filterItems() {
    if (!searchInput || !items.length) return;
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    items.forEach(function (item) {
      const haystack = (item.getAttribute('data-search-item') || item.innerText || '').toLowerCase();
      const match = !query || haystack.includes(query);
      item.style.display = match ? '' : 'none';
      if (match) visible += 1;
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterItems);
  }

  quickActions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!searchInput) return;
      searchInput.value = btn.innerText;
      filterItems();
      searchInput.focus();
    });
  });

  toggles.forEach(function (toggle) {
    const targetId = toggle.getAttribute('data-collapsible');
    if (!targetId) return;
    const panel = document.getElementById(targetId);
    if (!panel) return;

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') !== 'false';
      toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.classList.toggle('hidden', expanded);
    });
  });

  document.querySelectorAll('.card, .content-item').forEach(function (node) {
    node.classList.add('reveal-item');
  });

  filterItems();
});
