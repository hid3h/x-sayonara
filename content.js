(() => {
  const DEFAULT_TIMELINES = new Set(["for-you", "following"]);
  const DEFAULT_LABELS = new Set(["おすすめ", "フォロー中", "For you", "Following"]);
  const SIDEBAR_HEADINGS = new Set([
    "本日のニュース", "「いま」を見つけよう", "Today's News", "What's happening",
  ]);
  const TIMELINE_HEADINGS = new Set(["ホームタイムライン", "Home timeline", "Timeline: Your Home Timeline"]);
  const HIDDEN = "data-x-sayonara-hidden";
  const HIDE_LEGACY_TIMELINE = "data-x-sayonara-hide-home";
  let previouslyHidden = new Set();
  let pending = false;

  function legacySectionRoot(heading, boundary) {
    let candidate = null;
    for (let el = heading; el && el !== boundary && el.parentElement; el = el.parentElement) {
      if (el.parentElement.children.length >= 5) candidate = el;
    }
    return candidate;
  }

  function hideHome(hidden) {
    if (!/^\/home\/?$/.test(location.pathname)) return false;

    const tabList = document.querySelector(
      'main [role="tablist"], [data-testid="primaryColumn"] [role="tablist"]',
    );
    const tabs = [...(tabList?.querySelectorAll('[role="tab"]') ?? [])];
    const usesTimelineIds = tabs.some((tab) => tab.hasAttribute("data-pinned-timeline"));
    const defaultTabs = tabs.filter((tab) => usesTimelineIds
      ? DEFAULT_TIMELINES.has(tab.getAttribute("data-pinned-timeline"))
      : DEFAULT_LABELS.has((tab.getAttribute("aria-label") || tab.textContent).trim()));
    defaultTabs.forEach((tab) => hidden.add(tab));

    const active = tabs.find((tab) => tab.getAttribute("aria-selected") === "true");
    if (active && !defaultTabs.includes(active)) return false;

    // The current layout gives the feed its own labeled section, separate from the composer.
    for (const section of document.querySelectorAll("main section[aria-labelledby]")) {
      const heading = document.getElementById(section.getAttribute("aria-labelledby"));
      if (TIMELINE_HEADINGS.has(heading?.textContent.trim()) ||
          section.querySelector('[id^="urt:home:"]')) {
        hidden.add(section);
      }
    }
    return true;
  }

  function hideSidebar(hidden) {
    for (const heading of document.querySelectorAll("h2")) {
      if (!SIDEBAR_HEADINGS.has(heading.textContent.trim()) || heading.closest("main")) continue;
      const sidebar = heading.closest('[data-testid="sidebarColumn"]');
      const section = sidebar ? legacySectionRoot(heading, sidebar) : heading.closest("section");
      if (section) hidden.add(section);
    }
  }

  function run() {
    const hidden = new Set();
    document.documentElement.toggleAttribute(HIDE_LEGACY_TIMELINE, hideHome(hidden));
    hideSidebar(hidden);
    for (const el of previouslyHidden) {
      if (!hidden.has(el)) el.removeAttribute(HIDDEN);
    }
    for (const el of hidden) el.setAttribute(HIDDEN, "");
    previouslyHidden = hidden;
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      run();
    });
  }

  run();
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-selected", "data-pinned-timeline"],
  });
  window.addEventListener("popstate", schedule);
})();
