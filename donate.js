// Tip jar: a "Tip jar" button opens a pop-up with two ways to tip.
//   - link buttons (Ko-fi / Buy Me a Coffee / PayPal.me) for people paying by card or PayPal;
//   - crypto: pick a coin, then a network, then copy the address or scan the QR code.
// Everything comes from donate.json. The button stays hidden until "enabled" is true and there is
// at least one link with a url or one coin with an address, so a half-finished tip jar never shows.
(async () => {
  const btn = document.querySelector("[data-tip]");
  const dlg = document.getElementById("tip");
  if (!btn || !dlg) return;
  let cfg;
  try { cfg = await (await fetch("donate.json", { cache: "no-cache" })).json(); } catch (e) { return; }
  if (!cfg.enabled) return;

  const links = (cfg.links || []).filter((l) => l.url);
  const coins = (cfg.coins || []).filter((c) => c.networks.some((n) => n.address));
  if (!links.length && !coins.length) return;
  btn.hidden = false;
  btn.addEventListener("click", () => dlg.showModal());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });   // a click on the dark backdrop closes it

  if (links.length) {
    const box = dlg.querySelector(".tip-links");
    for (const l of links) {
      const a = document.createElement("a");
      a.href = l.url;
      a.textContent = l.name;
      a.target = "_blank";
      a.rel = "noopener";
      box.append(a);
    }
    box.hidden = false;
  }

  if (coins.length) {
    const wrap = dlg.querySelector(".tip-crypto");
    const chips = wrap.querySelector(".tip-coins");
    const netLabel = wrap.querySelector(".tip-net");
    const select = netLabel.querySelector("select");
    const addr = wrap.querySelector(".tip-addr");
    const qr = wrap.querySelector(".tip-qr");
    const warn = wrap.querySelector(".tip-warn");
    const copy = wrap.querySelector(".tip-copy");
    let coin = coins[0];
    const nets = () => coin.networks.filter((n) => n.address);

    const showNetwork = () => {
      const n = nets().find((x) => x.id === select.value) || nets()[0];
      addr.value = n.address;
      qr.src = `qr/${coin.id}-${n.id}.png`;
      qr.alt = `QR code for the ${coin.name} address on ${n.name}`;
      warn.textContent = `Send only ${coin.name} on the ${n.name} network to this address. Anything else can't be recovered.`;
      copy.textContent = "Copy";
    };
    const showCoin = (c) => {
      coin = c;
      for (const b of chips.children) b.setAttribute("aria-pressed", String(b.dataset.id === c.id));
      select.innerHTML = "";
      for (const n of nets()) select.add(new Option(n.name, n.id));
      netLabel.hidden = nets().length < 2;
      showNetwork();
    };

    for (const c of coins) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = c.name;
      b.dataset.id = c.id;
      b.addEventListener("click", () => showCoin(c));
      chips.append(b);
    }
    select.addEventListener("change", showNetwork);
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(addr.value); }
      catch (e) { addr.select(); document.execCommand("copy"); }
      copy.textContent = "Copied";
      setTimeout(() => { copy.textContent = "Copy"; }, 1800);
    });
    addr.addEventListener("focus", () => addr.select());
    wrap.hidden = false;
    showCoin(coins[0]);
  }

  if (location.hash === "#tip") dlg.showModal();
})();
