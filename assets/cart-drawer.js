class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;

    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') &&
      this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);

      if (!sectionElement) return;
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });

    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);

/**
 * =========================================================
 * GESTION AUTOMATIQUE DU PRODUIT CADEAU
 * =========================================================
 *
 * Fonctionnalité :
 * - Ajoute un cadeau automatiquement au panier lorsque le seuil de 100€ est atteint.
 * - Supprime le cadeau si le montant redescend en dessous du seuil.
 * - Met à jour le cart drawer en temps réel sans rechargement de page.
 *
 * Technologies utilisées :
 * - Shopify AJAX API (/cart.js, /cart/add.js, /cart/change.js)
 * - JavaScript Vanilla
 *
 * Bonnes pratiques :
 * - Utilisation d'un débounce pour éviter les requêtes excessives.
 * - Vérification et mise à jour fluide et optimisée du panier.
 * - Utilisation d'événements pour une mise à jour réactive du cart drawer.
 */

document.addEventListener('DOMContentLoaded', function () {
  /**
   * ID du produit cadeau
   * @constant {number}
   */
  const GIFT_PRODUCT_ID = 50110566924553;

  /**
   * Seuil en euros pour ajouter le cadeau.
   * @constant {number}
   */
  const GIFT_THRESHOLD = 100;

  /**
   * Variable pour éviter les requêtes multiples simultanées.
   * @type {boolean}
   */
  let isUpdatingCart = false;

  /**
   * Fonction de debounce pour limiter la fréquence des appels AJAX.
   * @param {Function} func - La fonction à exécuter après le délai.
   * @param {number} delay - Temps d'attente avant l'exécution (en ms).
   * @returns {Function} - Fonction debouncée.
   */
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Met à jour le cart drawer sans recharger la page.
   * Vérifie si la méthode onCartUpdate est disponible et l'exécute.
   * Sinon, déclenche un événement global cart:updated.
   */
  function updateCartDrawer() {
    const drawerItems = document.querySelector('cart-drawer-items');
    if (drawerItems && typeof drawerItems.onCartUpdate === 'function') {
      drawerItems.onCartUpdate();
    } else {
      document.dispatchEvent(new Event('cart:updated'));
    }
  }

  /**
   * Gère l'ajout et la suppression automatique du cadeau.
   * - Ajoute le cadeau si le total atteint le seuil et qu'il n'est pas déjà dans le panier.
   * - Supprime le cadeau si le total redescend sous le seuil.
   */
  function updateGiftProduct() {
    if (isUpdatingCart) return; // Empêche les requêtes multiples simultanées
    isUpdatingCart = true;

    fetch('/cart.js')
      .then((response) => response.json())
      .then((cart) => {
        const total = cart.total_price / 100; // Convertit en euros
        const giftItem = cart.items.find((item) => item.variant_id === GIFT_PRODUCT_ID);

        // Ajout du cadeau si seuil atteint et cadeau absent
        if (total >= GIFT_THRESHOLD && !giftItem) {
          fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: GIFT_PRODUCT_ID, quantity: 1 }),
          })
            .then((response) => {
              if (!response.ok) throw new Error("Erreur lors de l'ajout du cadeau");
              return response.json();
            })
            .then(() => {
              setTimeout(updateCartDrawer, 1000); // Met à jour le cart drawer après 1s
            })
            .catch((error) => console.error("Erreur lors de l'ajout du cadeau:", error))
            .finally(() => {
              isUpdatingCart = false;
            });
        }

        // Suppression du cadeau si seuil non atteint et cadeau présent
        else if (total < GIFT_THRESHOLD && giftItem) {
          if (!giftItem.key) {
            console.error('Clé `key` introuvable pour suppression.');
            isUpdatingCart = false;
            return;
          }

          fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: giftItem.key, quantity: 0 }), // Utilisation de `key`
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Erreur suppression cadeau (HTTP ${response.status})`);
              }
              return response.json();
            })
            .then(() => {
              setTimeout(updateCartDrawer, 1000);
            })
            .catch((error) => console.error('Erreur lors de la suppression du cadeau:', error))
            .finally(() => {
              isUpdatingCart = false;
            });
        } else {
          isUpdatingCart = false;
        }
      })
      .catch((error) => console.error('Erreur lors de la récupération du panier:', error))
      .finally(() => {
        setTimeout(() => {
          isUpdatingCart = false; // Réinitialisation après 1 seconde pour éviter le spam
        }, 1000);
      });
  }

  /**
   * Initialise et écoute les événements pour la mise à jour du panier.
   * - `cart:updated` : Déclenché lorsqu'un changement est détecté dans le panier.
   * - `Shopify AJAX API` : Surveille les ajouts et modifications du panier.
   * - Utilisation d'un debounce pour éviter les appels API en rafale.
   */
  const debouncedUpdateGiftProduct = debounce(updateGiftProduct, 500);

  updateGiftProduct(); // Vérification au chargement de la page

  document.addEventListener('cart:updated', debouncedUpdateGiftProduct);

  // Écoute les mises à jour du panier via l'API Shopify
  if (typeof PUB_SUB_EVENTS !== 'undefined' && typeof subscribe === 'function') {
    subscribe(PUB_SUB_EVENTS.cartUpdate, debouncedUpdateGiftProduct);
  }

  // Détecte les ajouts de produits au panier
  document.querySelectorAll('form[action^="/cart/add"]').forEach((form) => {
    form.addEventListener('submit', function () {
      setTimeout(debouncedUpdateGiftProduct, 1500); // Délai pour éviter le spam
    });
  });

  // Détecte les changements de quantité et met à jour dynamiquement
  document.addEventListener('change', function (e) {
    if (e.target.matches('input[data-quantity-variant-id]')) {
      debouncedUpdateGiftProduct();
    }
  });
});
