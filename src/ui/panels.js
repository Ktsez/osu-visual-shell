export function createPanelController({ app, idleAfterMs = 6000, blankDismissDelayMs = 300, now = () => performance.now() }) {
  let lastInteraction = now();
  let lastUiActionAt = 0;

  function markUiAction() {
    lastUiActionAt = now();
  }

  function setIdlePanel() {
    lastInteraction = now();
    app.dataset.panel = 'idle';
    document.body.classList.add('is-idle');
  }

  function touch(panel = null) {
    lastInteraction = now();
    if (panel || app.dataset.panel !== 'idle') document.body.classList.remove('is-idle');
    if (panel) {
      markUiAction();
      app.dataset.panel = panel;
    }
  }

  function setPanel(panel) {
    if (panel === 'idle') {
      markUiAction();
      setIdlePanel();
      return;
    }
    touch(panel);
  }

  function maybeIdle() {
    if (now() - lastInteraction > idleAfterMs && app.dataset.panel !== 'idle') {
      app.dataset.panel = 'idle';
      document.body.classList.add('is-idle');
    }
  }

  function canBlankDismiss(target) {
    const isInterfaceTarget = Boolean(target?.closest?.('.core, .control-panel, .float-panel, button, input, label, .track, [role="button"]'));
    if (isInterfaceTarget) {
      markUiAction();
      return false;
    }
    return app.dataset.panel !== 'idle' && now() - lastUiActionAt >= blankDismissDelayMs;
  }

  return { touch, setPanel, setIdlePanel, markUiAction, maybeIdle, canBlankDismiss };
}
