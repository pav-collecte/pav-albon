/* Encart « Votre avis » : un onglet discret sur le bord droit, qui ouvre un petit
   formulaire (note de simplicité 1 à 5, idée, contact facultatif). Les avis vont
   dans l'onglet « Avis » du classeur commun via n8n. Rien n'est envoyé sans clic.
   Inclusion : <script src="avis.js" data-page="collecte" defer></script>
               <script src="../avis.js" data-page="meteo" defer></script> */
(function () {
  "use strict";
  var moi = document.currentScript; if (!moi || window.__pavAvis) return; window.__pavAvis = true;
  var PAGE = moi.dataset.page || "autre";
  var BASE = new URL(".", moi.src).href;
  var URL_AVIS = "https://n8n.srv1040760.hstgr.cloud/webhook/pav-avis";
  var CLE = "pav-avis-envoye";
  var commune = "";
  fetch(BASE + "config.json", { cache: "no-cache" }).then(function (r) { return r.json(); })
    .then(function (c) { commune = (c.commune && (c.commune.nom || c.commune)) || ""; }).catch(function () {});
  function lire(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ecrire(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var dejaEnvoye = Number(lire(CLE)) > Date.now() - 30 * 864e5;

  var css = document.createElement("style");
  css.textContent =
    ".pav-avis-tab{position:fixed;right:0;top:58%;z-index:45;transform:translateY(-50%);writing-mode:vertical-rl;transform-origin:center;"
    + "background:#1F3A2E;color:#fff;border:0;border-radius:10px 0 0 10px;padding:12px 7px;font:600 13px system-ui,sans-serif;letter-spacing:.02em;"
    + "box-shadow:-2px 2px 10px rgba(0,0,0,.18);cursor:pointer;opacity:.88}"
    + ".pav-avis-tab:hover,.pav-avis-tab:focus{opacity:1}"
    + ".pav-avis-tab.discret{padding:9px 5px;font-size:12px;opacity:.6}"
    + ".pav-avis-fond{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.35);display:flex;align-items:flex-end;justify-content:center;padding:12px}"
    + "@media(min-width:600px){.pav-avis-fond{align-items:center}}"
    + ".pav-avis{background:#fff;color:#1A1F1C;width:100%;max-width:360px;border-radius:14px;padding:16px 16px 14px;box-shadow:0 10px 40px rgba(0,0,0,.3);font:15px/1.4 system-ui,sans-serif;"
    + "margin-bottom:env(safe-area-inset-bottom,0px)}"
    + ".pav-avis h3{margin:0 0 4px;font-size:1.05rem}.pav-avis p{margin:0 0 10px;color:#5d6a66;font-size:.86rem}"
    + ".pav-avis label{display:block;font-weight:600;font-size:.86rem;margin:10px 0 4px}"
    + ".pav-avis .etoiles{display:flex;gap:4px}.pav-avis .etoiles button{border:0;background:none;font-size:30px;line-height:1;color:#cfd5cf;cursor:pointer;padding:2px}"
    + ".pav-avis .etoiles button.on{color:#E08A00}"
    + ".pav-avis textarea,.pav-avis input{width:100%;box-sizing:border-box;border:1px solid #D8DCD7;border-radius:9px;padding:9px 10px;font:inherit;font-size:16px}"
    + ".pav-avis textarea{min-height:84px;resize:vertical}"
    + ".pav-avis .piege{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}"
    + ".pav-avis .act{display:flex;gap:8px;margin-top:12px}.pav-avis .act button{flex:1;border-radius:10px;padding:10px;font:600 15px system-ui,sans-serif;cursor:pointer}"
    + ".pav-avis .ok{background:#1F3A2E;color:#fff;border:0}.pav-avis .non{background:#fff;color:#1A1F1C;border:1px solid #D8DCD7}"
    + ".pav-avis .msg{font-size:.84rem;margin-top:8px;min-height:1.2em}";
  document.head.appendChild(css);

  var tab = document.createElement("button");
  tab.type = "button"; tab.className = "pav-avis-tab" + (dejaEnvoye ? " discret" : "");
  tab.textContent = dejaEnvoye ? "💡 Avis" : "💡 Votre avis";
  tab.setAttribute("aria-label", "Donner votre avis ou une idée");
  document.body.appendChild(tab);

  var note = 0;
  function ouvrir() {
    var fond = document.createElement("div"); fond.className = "pav-avis-fond";
    fond.innerHTML = '<form class="pav-avis" role="dialog" aria-modal="true" aria-labelledby="pav-avis-t">'
      + '<h3 id="pav-avis-t">Votre avis nous aide</h3>'
      + '<p>' + (PAGE === "collecte" ? "L'application de relevé est-elle simple à utiliser ?" : "Cette page est-elle claire et utile ?") + '</p>'
      + '<label>Simplicité d\'utilisation</label><div class="etoiles" role="radiogroup" aria-label="Note de 1 à 5">'
      + [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" data-n="' + i + '" role="radio" aria-checked="false" aria-label="' + i + ' sur 5">★</button>'; }).join("") + '</div>'
      + '<label for="pav-avis-idee">Une idée, une remarque ? <span style="font-weight:400;color:#5d6a66">(facultatif)</span></label>'
      + '<textarea id="pav-avis-idee" maxlength="1500" placeholder="Ce qui vous a gêné, ce qui manque, ce qui vous plaît…"></textarea>'
      + '<label for="pav-avis-contact">Pour une réponse <span style="font-weight:400;color:#5d6a66">(facultatif)</span></label>'
      + '<input id="pav-avis-contact" maxlength="120" placeholder="E-mail ou téléphone" autocomplete="email">'
      + '<input class="piege" name="site_web" tabindex="-1" autocomplete="off" aria-hidden="true">'
      + '<div class="msg" aria-live="polite"></div>'
      + '<div class="act"><button type="button" class="non">Fermer</button><button type="submit" class="ok">Envoyer</button></div></form>';
    document.body.appendChild(fond);
    var f = fond.querySelector("form"), m = fond.querySelector(".msg");
    function fermer() { fond.remove(); tab.focus(); }
    fond.addEventListener("click", function (e) { if (e.target === fond) fermer(); });
    fond.querySelector(".non").addEventListener("click", fermer);
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape" && document.body.contains(fond)) { fermer(); document.removeEventListener("keydown", esc); } });
    fond.querySelectorAll(".etoiles button").forEach(function (b) {
      b.addEventListener("click", function () {
        note = Number(b.dataset.n);
        fond.querySelectorAll(".etoiles button").forEach(function (x) { var on = Number(x.dataset.n) <= note; x.classList.toggle("on", on); x.setAttribute("aria-checked", String(Number(x.dataset.n) === note)); });
      });
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var idee = fond.querySelector("#pav-avis-idee").value.trim();
      if (!note && !idee) { m.style.color = "#B3261E"; m.textContent = "Choisissez une note ou écrivez une idée."; return; }
      var ok = f.querySelector(".ok"); ok.disabled = true; m.style.color = "#5d6a66"; m.textContent = "Envoi…";
      fetch(URL_AVIS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        page: PAGE, commune: commune, note: note || "", idee: idee, contact: fond.querySelector("#pav-avis-contact").value.trim(),
        site_web: f.querySelector(".piege").value, appareil: (navigator.userAgent || "").slice(0, 120) }) })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.motif || "Envoi impossible pour le moment.");
          ecrire(CLE, String(Date.now())); tab.classList.add("discret"); tab.textContent = "💡 Avis";
          f.innerHTML = '<h3>Merci !</h3><p>Votre avis a bien été transmis à l\'équipe du projet.</p><div class="act"><button type="button" class="ok">Fermer</button></div>';
          f.querySelector(".ok").addEventListener("click", fermer); note = 0;
        })
        .catch(function (er) { ok.disabled = false; m.style.color = "#B3261E"; m.textContent = er.message || "Envoi impossible pour le moment."; });
    });
    var premier = fond.querySelector(".etoiles button"); if (premier) premier.focus();
  }
  tab.addEventListener("click", ouvrir);
})();
