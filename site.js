// Shared by every page: highlight the visitor's own computer, and fill the download buttons from the
// latest release of the public downloads repo (real version and size; "not up yet" if a file is missing).
const REPO = "KeeganCostley/soulsearch-downloads";

const ua = navigator.userAgent || "";
const platform = navigator.platform || ua;
const onMac = /Mac/i.test(platform) && !/iPhone|iPad/i.test(ua);
const onWin = /Win/i.test(platform);
const mine = onMac ? "mac" : onWin ? "win" : "";
for (const el of document.querySelectorAll(`[data-os="${mine}"]`)) {
  if (el.matches("details")) el.setAttribute("open", "");
  else el.classList.add("mine");
}

const cards = [...document.querySelectorAll(".dl[data-asset]")];
const bar = document.querySelector("[data-count]");
if (cards.length || bar) {
  fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, { headers: { Accept: "application/vnd.github+json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((all) => {
      const rel = all.find((x) => !x.draft && !x.prerelease);
      if (!rel) return Promise.reject("no release");
      // GitHub counts every download of every release file; add them all up.
      const total = all.reduce((n, x) => n + (x.assets || []).reduce((m, a) => m + a.download_count, 0), 0);
      const when0 = new Date(rel.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      if (bar) {
        const bits = [rel.tag_name, `updated ${when0}`];
        if (total > 0) bits.push(`${total.toLocaleString("en-GB")} download${total === 1 ? "" : "s"}`);
        bar.textContent = bits.join(" · ");
      }
      const when = new Date(rel.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      for (const card of cards) {
        const asset = (rel.assets || []).find((a) => a.name === card.dataset.asset);
        const meta = card.querySelector("[data-meta]");
        if (asset) {
          card.href = asset.browser_download_url;
          meta.textContent = `${rel.tag_name} · ${(asset.size / 1048576).toFixed(0)} MB · ${when}`;
        } else {
          card.classList.add("soon");
          meta.textContent = "Not up yet";
        }
      }
    })
    .catch(() => { for (const card of cards) card.href = `https://github.com/${REPO}/releases/latest`; });
}
