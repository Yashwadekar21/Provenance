(() => {
  const defaultSettings = {
    responseMode: 'detailed',
    showReasoning: true,
    notifyEmail: true,
    notifyInApp: true
  };

  const readSettings = () => {
    try {
      const raw = localStorage.getItem('provenanceSettings');
      if (!raw) return { ...defaultSettings };
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch (error) {
      console.error('Failed to read settings.', error);
      return { ...defaultSettings };
    }
  };

  const writeSettings = (value) => {
    localStorage.setItem('provenanceSettings', JSON.stringify(value));
  };

  const settings = readSettings();

  const responseMode = document.getElementById('response-mode');
  const showReasoning = document.getElementById('show-reasoning');
  const notifyEmail = document.getElementById('notify-email');
  const notifyInApp = document.getElementById('notify-inapp');

  if (!responseMode || !showReasoning || !notifyEmail || !notifyInApp) {
    return;
  }

  responseMode.value = settings.responseMode;
  showReasoning.checked = Boolean(settings.showReasoning);
  notifyEmail.checked = Boolean(settings.notifyEmail);
  notifyInApp.checked = Boolean(settings.notifyInApp);

  const sync = () => {
    writeSettings({
      responseMode: responseMode.value,
      showReasoning: showReasoning.checked,
      notifyEmail: notifyEmail.checked,
      notifyInApp: notifyInApp.checked
    });
  };

  responseMode.addEventListener('change', sync);
  showReasoning.addEventListener('change', sync);
  notifyEmail.addEventListener('change', sync);
  notifyInApp.addEventListener('change', sync);

  if (typeof window.bindRouteNavigation === 'function') {
    window.bindRouteNavigation();
  }
})();