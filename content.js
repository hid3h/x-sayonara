(() => {
  const HIDE_TABS = ["おすすめ", "フォロー中"];
  const HIDE_SECTIONS = ["本日のニュース", "「いま」を見つけよう"];

  function hide(el) {
    if (el) el.style.setProperty("display", "none", "important");
  }

  function findSectionRoot(heading, boundary) {
    let el = heading;
    let candidate = null;
    while (el && el !== boundary && el.parentElement) {
      if (el.parentElement.children.length >= 5) candidate = el;
      el = el.parentElement;
    }
    return candidate;
  }

  let pending = false;

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      run();
    });
  }

  function run() {
    document.querySelectorAll('[role="tab"]').forEach((tab) => {
      if (HIDE_TABS.includes(tab.textContent.trim())) hide(tab);
    });

    const sidebar = document.querySelector('[data-testid="sidebarColumn"]');
    if (!sidebar) return;
    sidebar.querySelectorAll("h2").forEach((h2) => {
      if (HIDE_SECTIONS.includes(h2.textContent.trim())) {
        hide(findSectionRoot(h2, sidebar));
      }
    });
  }

  run();
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
