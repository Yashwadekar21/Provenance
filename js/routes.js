(() => {
  window.APP_ROUTES = {
    dashboard: './dashboard.html',
    ask: './dash.html',
    decision: './decision-explorer.html',
    sources: './source-library.html',
    conflicts: './conflict-checker.html',
    settings: './settings.html',
    login: './login.html',
    register: './register.html'
  };

  window.bindRouteNavigation = (root = document) => {
    const items = root.querySelectorAll('[data-route]');
    items.forEach((item) => {
      item.addEventListener('click', (event) => {
        const routeKey = item.getAttribute('data-route');
        const target = window.APP_ROUTES?.[routeKey];
        if (!target) {
          return;
        }

        event.preventDefault();
        item.classList.remove('nav-click');
        // force reflow so repeated clicks replay animation
        void item.offsetWidth;
        item.classList.add('nav-click');

        window.setTimeout(() => {
          window.location.href = target;
        }, 170);
      });
    });
  };
})();
