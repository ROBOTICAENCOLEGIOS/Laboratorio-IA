/* ════════════════════════════════════════════════════════════════════════
 * patch-pirubot-gallery.js
 * ────────────────────────────────────────────────────────────────────────
 * Script INDEPENDIENTE (no toca js/editor.js).
 *
 * Responsabilidades:
 *   1. Inyectar la tarjeta de PIRU-BOT en el 2do lugar de la galería de
 *      extensiones (justo después de "Robot Jeep Virtual").
 *   2. Renderizar badges de metadatos pedagógicos (🎯 Edad / 🔌 Requisitos)
 *      al pie de cada tarjeta reconocida en EXTENSIONS_META.
 *
 * Debe cargarse en editor.html DESPUÉS de js/editor.js, por ejemplo:
 *   <script src="js/editor.js"></script>
 *   <script src="extensionesrec/patch-pirubot-gallery.js"></script>
 *
 * Estrategia de detección de DOM:
 *   El bundle usa CSS Modules con clases hasheadas (p.ej.
 *   "library-item_library-item_1nZBu"). En vez de depender del hash exacto
 *   (que puede cambiar entre builds), se usan selectores por sub-cadena
 *   (`[class*="..."]`), el mismo patrón que ya usa el propio bundle en su
 *   MutationObserver de traducción de tarjetas REC.
 * ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ============================================================
   * 1. ESTRUCTURA BASE Y MAPEO DE EXTENSIONES (11 extensiones)
   *    Clave = extensionId real usado por vm.extensionManager
   * ============================================================ */
  var PIRUBOT_EXTENSION_ID = 'pirubotREC';
  var PIRUBOT_ICON_URL = 'extensionesrec/pirubot.png';

  // Misma estrategia de resolución de ruta que usan las extensiones REC
  // (ver recLocalLoader en editor.html / _recLocalBase en robotjeepvirtual.js):
  // funciona tanto en desarrollo local como en producción (GitHub Pages),
  // sin depender de una ruta relativa estática.
  function getPirubotExtensionUrl() {
    var baseUrl =
      window._recLocalBase ||
      window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    return baseUrl + 'extensionesrec/pirubot.js';
  }

  var EXTENSIONS_META = {
    robotJeepVirtualREC: { age: '9+', hwKey: 'hw_none' },
    pirubotREC: { age: '5+', hwKey: 'hw_none', isNew: true },
    moduloIoTREC: { age: '12+', hwKey: 'hw_none' },
    recr2d2arduino: { age: '10+', hwKey: 'hw_arturito' },
    robottachov4: { age: '5+', hwKey: 'hw_tachin' },
    iaVisionRECPro: { age: '10+', hwKey: 'hw_webcam' },
    iaEmocionesREC: { age: '10+', hwKey: 'hw_webcam' },
    iaSenalesTransitoV7: { age: '10+', hwKey: 'hw_webcam' },
    iaObjetosREC: { age: '10+', hwKey: 'hw_webcam' },
    vozTextoREC: { age: '10+', hwKey: 'hw_mic' },
    iaTeachableREC: { age: '12+', hwKey: 'hw_webcam_net' }
  };

  var PIRUBOT_NAME = { es: 'PIRU-BOT', en: 'PIRU-BOT' };
  var PIRUBOT_DESC = {
    es: 'Programá a PIRU-BOT: el compañero robot pensado para los más chiquitos del aula.',
    en: 'Program PIRU-BOT: the robot companion designed for the youngest students.'
  };
  var NEW_BADGE_TEXT = { es: 'NUEVO', en: 'NEW' };
  var PIRUBOT_LOADED_MSG = {
    es: '¡Bloques de PIRU-BOT cargados con éxito!',
    en: 'PIRU-BOT blocks loaded successfully!'
  };

  /* ============================================================
   * 2. DICCIONARIO I18N_DICTIONARY (es / en)
   * ============================================================ */
  var I18N_DICTIONARY = {
    es: {
      label_age: '🎯 Edad',
      label_hw: '🔌 Requisitos',
      hw_none: 'Sin hardware',
      hw_arturito: 'Robot Arturito',
      hw_tachin: 'Robot Tachín',
      hw_webcam: 'Cámara web',
      hw_mic: 'Micrófono',
      hw_webcam_net: 'Cámara web + Internet'
    },
    en: {
      label_age: '🎯 Age',
      label_hw: '🔌 Requirements',
      hw_none: 'No hardware',
      hw_arturito: 'Arturito Robot',
      hw_tachin: 'Tachín Robot',
      hw_webcam: 'Webcam',
      hw_mic: 'Microphone',
      hw_webcam_net: 'Webcam + Internet'
    }
  };

  function getLocale() {
    var raw =
      (document.documentElement && document.documentElement.lang) ||
      (window.Scratch && window.Scratch.gui && window.Scratch.gui.language) ||
      window.currentRecLocale ||
      'es';
    var short = String(raw).toLowerCase().slice(0, 2);
    return I18N_DICTIONARY[short] ? short : 'es';
  }

  function t(key) {
    var dict = I18N_DICTIONARY[getLocale()] || I18N_DICTIONARY.es;
    return dict[key] || I18N_DICTIONARY.es[key] || key;
  }

  /* ============================================================
   * 2b. TOAST DE CARGA (estilo Robot Jeep Virtual)
   * ============================================================ */
  var pirubotToastCssInjected = false;
  function injectPirubotToastCSS() {
    if (pirubotToastCssInjected) return;
    pirubotToastCssInjected = true;
    var style = document.createElement('style');
    style.id = 'rec-pirubot-toast-css';
    style.textContent =
      '#rec-pirubot-toast { position: fixed; bottom: 20px; left: 20px; z-index: 9999; max-width: 320px;' +
      ' background: rgba(40,40,40,0.95); color: #fff; border-left: 4px solid #FF6B35; border-radius: 0.75rem;' +
      ' padding: 0.75rem 1rem; font-family: system-ui, sans-serif; font-size: 0.95rem; line-height: 1.4;' +
      ' box-shadow: 0 6px 20px rgba(0,0,0,0.35); opacity: 0; transform: translateY(20px);' +
      ' transition: opacity 0.4s ease, transform 0.4s ease; pointer-events: none; }' +
      '#rec-pirubot-toast.rec-pirubot-toast-visible { opacity: 1; transform: translateY(0); }' +
      '#rec-pirubot-toast.rec-pirubot-toast-hiding { opacity: 0; transform: translateY(10px); }' +
      '#rec-pirubot-toast .rec-pirubot-toast-icon { display: inline-block; margin-right: 0.5rem; font-size: 1.1rem; vertical-align: middle; }' +
      '#rec-pirubot-toast .rec-pirubot-toast-text { vertical-align: middle; display: inline; }';
    document.head.appendChild(style);
  }

  function showPirubotLoadedToast() {
    if (!document.body) return;
    injectPirubotToastCSS();

    var existing = document.getElementById('rec-pirubot-toast');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var msg = PIRUBOT_LOADED_MSG[getLocale()] || PIRUBOT_LOADED_MSG.es;

    var toast = document.createElement('div');
    toast.id = 'rec-pirubot-toast';
    toast.setAttribute('role', 'status');

    var icon = document.createElement('span');
    icon.className = 'rec-pirubot-toast-icon';
    icon.textContent = '🤖';

    var text = document.createElement('span');
    text.className = 'rec-pirubot-toast-text';
    text.textContent = msg;

    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);

    // Forzar reflow para que la transición de entrada se dispare.
    // eslint-disable-next-line no-unused-expressions
    toast.offsetWidth;
    toast.classList.add('rec-pirubot-toast-visible');

    setTimeout(function () {
      toast.classList.remove('rec-pirubot-toast-visible');
      toast.classList.add('rec-pirubot-toast-hiding');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3500);
  }

  /* ============================================================
   * 3. HELPERS DE DETECCIÓN DEL MODAL / GRILLA DE EXTENSIONES
   * ============================================================ */
  function findExtensionLibraryModal() {
    var modals = document.querySelectorAll('[class*="modal_modal-content_"]');
    for (var i = 0; i < modals.length; i++) {
      var modal = modals[i];
      if (
        modal.querySelector('[class*="library_library-scroll-grid_"]') ||
        modal.querySelector('[class*="library-item_library-item_"]')
      ) {
        return modal;
      }
    }
    return null;
  }

  function getGrid(modal) {
    return modal.querySelector('[class*="library_library-scroll-grid_"]') || modal;
  }

  // Cierra el modal de la Extension Library con 3 estrategias en cascada:
  //   1) Redux (la más confiable): despacha la misma acción CLOSE_MODAL que
  //      usa el botón "X" nativo de scratch-gui (ver reducers/modals.js:
  //      closeExtensionLibrary() -> { type: CLOSE_MODAL, modal: 'extensionLibrary' }).
  //      editor.js expone el store en window._reduxStore / window.ReduxStore
  //      (ver getReduxStore() usado por el propio bundle).
  //   2) DOM: click nativo sobre el botón de cierre visible.
  //   3) Tecla Escape como último recurso.
  function closeExtensionLibraryModal() {
    var store = window._reduxStore || window.ReduxStore || null;
    if (store && typeof store.dispatch === 'function') {
      try {
        store.dispatch({ type: 'scratch-gui/modals/CLOSE_MODAL', modal: 'extensionLibrary' });
        return;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[patch-pirubot-gallery] Fallo al despachar CLOSE_MODAL, probando fallback DOM:', e);
      }
    }

    var closeBtn =
      document.querySelector('button[class*="close-button"]') ||
      document.querySelector('[class*="modal_back-button"]') ||
      document.querySelector('[class*="close-button"]') ||
      document.querySelector('[aria-label="Close"]');
    if (closeBtn) {
      closeBtn.click();
      return;
    }

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
  }

  function getCards(grid) {
    return grid.querySelectorAll('[class*="library-item_library-item_"]');
  }

  function getNameSpan(card) {
    return card.querySelector('[class*="library-item_library-item-name_"]');
  }

  function getDescriptionSpan(card) {
    return card.querySelector('[class*="library-item_featured-description_"]');
  }

  // "Robot Jeep Virtual" no se traduce entre idiomas dentro de este bundle,
  // por lo que buscar el sustring "Jeep" es una forma robusta e
  // independiente del locale de encontrar la tarjeta de referencia.
  function findJeepCard(grid) {
    var nameSpans = grid.querySelectorAll('[class*="library-item_library-item-name_"]');
    for (var i = 0; i < nameSpans.length; i++) {
      var text = (nameSpans[i].textContent || '').trim();
      if (text.indexOf('Jeep') !== -1) {
        return nameSpans[i].closest('[class*="library-item_library-item_"]');
      }
    }
    return null;
  }

  // Deduce el extensionId de una tarjeta ya renderizada a partir de su
  // nombre visible (no hay atributo data-* con el extensionId en el DOM).
  function resolveCardExtensionId(card) {
    if (card.dataset && card.dataset.pirubotMetaId) {
      return card.dataset.pirubotMetaId;
    }
    var nameSpan = getNameSpan(card);
    var text = nameSpan ? (nameSpan.textContent || '').trim() : '';
    if (!text) return null;
    if (text.indexOf('Jeep') !== -1) return 'robotJeepVirtualREC';
    if (text.indexOf('Arturito') !== -1 || text.indexOf('R2D2') !== -1) return 'recr2d2arduino';
    if (text.indexOf('Tach') !== -1) return 'robottachov4';
    if (text.indexOf('IoT') !== -1) return 'moduloIoTREC';
    if (text.indexOf('Manos') !== -1) return 'iaVisionRECPro';
    if (text.indexOf('Señal') !== -1 || text.indexOf('Transit') !== -1) return 'iaSenalesTransitoV7';
    if (text.indexOf('Voz') !== -1) return 'vozTextoREC';
    if (text.indexOf('Emocion') !== -1) return 'iaEmocionesREC';
    if (text.indexOf('Objeto') !== -1) return 'iaObjetosREC';
    if (text.indexOf('Teachable') !== -1) return 'iaTeachableREC';
    if (text.indexOf('PIRU') !== -1) return PIRUBOT_EXTENSION_ID;
    return null;
  }

  /* ============================================================
   * 4. CONSTRUCCIÓN DE LA TARJETA DE PIRU-BOT
   *    Se clona la tarjeta de Jeep (misma estructura/clases del build
   *    actual) y solo se reemplazan textos, imagen y el handler de click.
   * ============================================================ */
  function buildPirubotCard(templateCard) {
    var card = templateCard.cloneNode(true);
    card.setAttribute('data-pirubot-meta-id', PIRUBOT_EXTENSION_ID);

    // Limpiar cualquier badge clonado del template antes de reconstruir
    var staleBadges = card.querySelector('.extension-meta-badges');
    if (staleBadges && staleBadges.parentNode) {
      staleBadges.parentNode.removeChild(staleBadges);
    }

    var img = card.querySelector('img');
    if (img) {
      img.src = PIRUBOT_ICON_URL;
      img.alt = 'PIRU-BOT';
      img.removeAttribute('srcset');
    }

    var nameSpan = getNameSpan(card);
    if (nameSpan) {
      nameSpan.textContent = PIRUBOT_NAME[getLocale()] || PIRUBOT_NAME.es;
    }

    var descSpan = getDescriptionSpan(card);
    if (descSpan) {
      descSpan.textContent = PIRUBOT_DESC[getLocale()] || PIRUBOT_DESC.es;
    }

    if (card.style) {
      card.style.position = card.style.position || 'relative';
    }

    var newBadge = document.createElement('div');
    newBadge.className = 'pirubot-new-ribbon';
    newBadge.textContent = NEW_BADGE_TEXT[getLocale()] || NEW_BADGE_TEXT.es;
    newBadge.style.position = 'absolute';
    newBadge.style.top = '6px';
    newBadge.style.right = '6px';
    newBadge.style.background = '#ff5252';
    newBadge.style.color = '#fff';
    newBadge.style.fontSize = '10px';
    newBadge.style.fontWeight = '700';
    newBadge.style.padding = '2px 8px';
    newBadge.style.borderRadius = '10px';
    newBadge.style.zIndex = '5';
    newBadge.style.pointerEvents = 'none';
    card.appendChild(newBadge);

    card.addEventListener(
      'click',
      function (evt) {
        evt.preventDefault();
        evt.stopPropagation();

        var vm = window.vm;
        if (!vm || !vm.extensionManager || typeof vm.extensionManager.loadExtensionURL !== 'function') {
          // eslint-disable-next-line no-console
          console.warn('[patch-pirubot-gallery] window.vm.extensionManager no está disponible todavía.');
          return;
        }

        var alreadyLoaded =
          typeof vm.extensionManager.isExtensionLoaded === 'function' &&
          vm.extensionManager.isExtensionLoaded(PIRUBOT_EXTENSION_ID);

        if (alreadyLoaded) {
          // eslint-disable-next-line no-alert
          alert('Esta extensión ya se encuentra cargada en el proyecto.');
          return;
        }

        // pirubot.js dispara su propio toast interno al inicializarse; lo
        // suprimimos una vez para no duplicar el aviso con el toast estilo
        // Jeep que mostramos abajo al resolver la promesa.
        window.__pirubotSuppressOwnToast = true;

        vm.extensionManager
          .loadExtensionURL(getPirubotExtensionUrl())
          .then(function () {
            showPirubotLoadedToast();
            closeExtensionLibraryModal();
          })
          .catch(function (err) {
            window.__pirubotSuppressOwnToast = false;
            // eslint-disable-next-line no-console
            console.error('[patch-pirubot-gallery] No se pudo cargar PIRU-BOT:', err);
            // eslint-disable-next-line no-alert
            alert(err);
          });
      },
      true
    );

    return card;
  }

  function ensurePirubotCard(modal) {
    var grid = getGrid(modal);
    if (grid.querySelector('[data-pirubot-meta-id="' + PIRUBOT_EXTENSION_ID + '"]')) {
      return;
    }

    var jeepCard = findJeepCard(grid);
    if (!jeepCard) {
      return; // La grilla todavía no terminó de renderizar
    }

    var pirubotCard = buildPirubotCard(jeepCard);
    if (jeepCard.nextSibling) {
      grid.insertBefore(pirubotCard, jeepCard.nextSibling);
    } else {
      grid.appendChild(pirubotCard);
    }
  }

  /* ============================================================
   * 5. BADGES DE METADATOS PEDAGÓGICOS AL PIE DE CADA TARJETA
   * ============================================================ */
  function styleBadge(el) {
    el.style.fontSize = '11px';
    el.style.fontWeight = '600';
    el.style.padding = '2px 8px';
    el.style.borderRadius = '10px';
    el.style.background = 'rgba(0, 0, 0, 0.08)';
    el.style.color = 'inherit';
    el.style.whiteSpace = 'nowrap';
  }

  function updateBadgeContainer(container, meta) {
    var ageBadge = container.querySelector('.extension-meta-badge-age');
    var hwBadge = container.querySelector('.extension-meta-badge-hw');
    if (ageBadge) ageBadge.textContent = t('label_age') + ': ' + meta.age;
    if (hwBadge) hwBadge.textContent = t('label_hw') + ': ' + t(meta.hwKey);
  }

  function createBadgeContainer(meta) {
    var container = document.createElement('div');
    container.className = 'extension-meta-badges';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '6px';
    container.style.margin = '6px 8px 4px';

    var ageBadge = document.createElement('span');
    ageBadge.className = 'extension-meta-badge extension-meta-badge-age';
    styleBadge(ageBadge);

    var hwBadge = document.createElement('span');
    hwBadge.className = 'extension-meta-badge extension-meta-badge-hw';
    styleBadge(hwBadge);

    container.appendChild(ageBadge);
    container.appendChild(hwBadge);
    updateBadgeContainer(container, meta);
    return container;
  }

  function injectBadges(modal) {
    var grid = getGrid(modal);
    var cards = getCards(grid);

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var extensionId = resolveCardExtensionId(card);
      var meta = extensionId && EXTENSIONS_META[extensionId];
      if (!meta) continue; // Solo tarjetas mapeadas en EXTENSIONS_META

      var existing = card.querySelector('.extension-meta-badges');
      if (existing) {
        // Ya existe: solo refrescar textos (soporta cambios de idioma)
        updateBadgeContainer(existing, meta);
        continue;
      }

      card.appendChild(createBadgeContainer(meta));
    }
  }

  /* ============================================================
   * 6. ORQUESTACIÓN + MUTATIONOBSERVER
   * ============================================================ */
  function tryPatch() {
    var modal = findExtensionLibraryModal();
    if (!modal) return;
    ensurePirubotCard(modal);
    injectBadges(modal);
  }

  var rafHandle = null;
  function schedulePatch() {
    if (rafHandle) return;
    rafHandle = window.requestAnimationFrame(function () {
      rafHandle = null;
      tryPatch();
    });
  }

  function start() {
    var bodyObserver = new MutationObserver(schedulePatch);
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    // Re-ejecutar badges/tarjeta si el idioma de la UI cambia en caliente.
    if (typeof window.updateRECUI === 'function') {
      var originalUpdateRECUI = window.updateRECUI;
      window.updateRECUI = function (locale) {
        originalUpdateRECUI(locale);
        schedulePatch();
      };
    }

    schedulePatch();
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }
})();
