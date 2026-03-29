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

  function isHiddenTabActive() {
    const active = document.querySelector('[role="tab"][aria-selected="true"]');
    return !active || HIDE_TABS.includes(active.textContent.trim());
  }

  function hideHomePosts() {
    if (location.pathname !== "/home") return;
    if (!isHiddenTabActive()) return;
    const primary = document.querySelector('[data-testid="primaryColumn"]');
    if (!primary) return;
    primary.querySelectorAll('[data-testid="cellInnerDiv"]').forEach((cell) => {
      hide(cell);
    });
    primary.querySelectorAll('[role="progressbar"]').forEach((el) => {
      hide(el);
    });
  }

  function run() {
    hideHomePosts();

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
