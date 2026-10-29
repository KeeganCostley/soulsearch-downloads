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
if (cards.length) {
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
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
