'use strict';

/**
 * CartDrawer DOM / AJAX integration tests.
 *
 * Strategy: replicate the CartDrawer object from init.js in a jsdom
 * environment with a jQuery stub so we can test open/close behaviour
 * and AJAX calls without a real browser.
 */

// --------------- jQuery-like stub ---------------
function make$() {
  // Track elements by selector for assertions
  var store = {};

  function getEl(selector) {
    if (!store[selector]) {
      store[selector] = { classes: [], css: {}, text: '', html: '', shown: true };
    }
    return store[selector];
  }

  function $wrapper(selector) {
    var el = getEl(selector);
    return {
      length: 1,
      addClass: function(cls) { el.classes.push(cls); return this; },
      removeClass: function(cls) {
        el.classes = el.classes.filter(function(c) { return c !== cls; });
        return this;
      },
      hasClass: function(cls) { return el.classes.indexOf(cls) !== -1; },
      css: function(prop, val) { el.css[prop] = val; return this; },
      text: function(val) { if (val !== undefined) { el.text = val; return this; } return el.text; },
      html: function(val) { if (val !== undefined) { el.html = val; return this; } return el.html; },
      show: function() { el.shown = true; return this; },
      hide: function() { el.shown = false; return this; },
      find: function(sel) { return $wrapper(selector + ' ' + sel); },
      on: function() { return this; },
      each: function() { return this; }
    };
  }

  // $.ajax / $.getJSON tracking
  $wrapper.ajaxCalls = [];
  $wrapper.ajax = function(opts) {
    $wrapper.ajaxCalls.push(opts);
    if (opts.success) opts.success({});
  };
  $wrapper.getJSON = function(url, cb) {
    $wrapper.ajaxCalls.push({ type: 'GET', url: url });
    if (typeof cb === 'function') cb({ item_count: 0, total_price: 0, items: [] });
  };

  // expose store for assertions
  $wrapper._store = store;
  $wrapper._getEl = getEl;

  return $wrapper;
}

// --------------- Build a minimal CartDrawer (mirrors init.js) ---------------
function createCartDrawer($) {
  return {
    $drawer: $('[data-cart-drawer]'),

    open: function() {
      this.$drawer.addClass('is-open');
      $('body').css('overflow', 'hidden');
    },

    close: function() {
      this.$drawer.removeClass('is-open');
      $('body').css('overflow', '');
    },

    updateItem: function(line, quantity) {
      var self = this;
      $.ajax({
        type: 'POST',
        url: '/cart/change.js',
        data: { line: line, quantity: quantity },
        dataType: 'json',
        success: function(cart) {
          self.refreshCart(cart);
        }
      });
    },

    addItem: function(variantId, quantity) {
      var self = this;
      quantity = quantity || 1;
      $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: { id: variantId, quantity: quantity },
        dataType: 'json',
        success: function() {
          $.getJSON('/cart.js', function(cart) {
            self.refreshCart(cart);
            self.open();
          });
        }
      });
    },

    refreshCart: function(cart) {
      $('[data-cart-count]').text(cart.item_count);
      $('[data-cart-count-badge]').text(cart.item_count);
      if (cart.item_count > 0) {
        $('[data-cart-count-badge]').show();
      } else {
        $('[data-cart-count-badge]').hide();
      }
    }
  };
}

// ======================== Tests ========================

describe('CartDrawer', function() {
  var $, CartDrawer;

  beforeEach(function() {
    $ = make$();
    CartDrawer = createCartDrawer($);
  });

  // --- open / close ---
  describe('open()', function() {
    it('adds is-open class to the drawer', function() {
      CartDrawer.open();
      expect(CartDrawer.$drawer.hasClass('is-open')).toBe(true);
    });

    it('sets body overflow to hidden', function() {
      CartDrawer.open();
      expect($._getEl('body').css.overflow).toBe('hidden');
    });
  });

  describe('close()', function() {
    it('removes is-open class from the drawer', function() {
      CartDrawer.open();
      CartDrawer.close();
      expect(CartDrawer.$drawer.hasClass('is-open')).toBe(false);
    });

    it('resets body overflow', function() {
      CartDrawer.open();
      CartDrawer.close();
      expect($._getEl('body').css.overflow).toBe('');
    });
  });

  // --- AJAX: updateItem ---
  describe('updateItem()', function() {
    it('sends POST to /cart/change.js', function() {
      CartDrawer.updateItem(1, 3);
      var call = $.ajaxCalls[0];
      expect(call.type).toBe('POST');
      expect(call.url).toBe('/cart/change.js');
      expect(call.data).toEqual({ line: 1, quantity: 3 });
    });

    it('sends quantity 0 for item removal', function() {
      CartDrawer.updateItem(2, 0);
      expect($.ajaxCalls[0].data.quantity).toBe(0);
    });
  });

  // --- AJAX: addItem ---
  describe('addItem()', function() {
    it('sends POST to /cart/add.js', function() {
      CartDrawer.addItem(12345, 2);
      var call = $.ajaxCalls[0];
      expect(call.type).toBe('POST');
      expect(call.url).toBe('/cart/add.js');
      expect(call.data).toEqual({ id: 12345, quantity: 2 });
    });

    it('defaults quantity to 1', function() {
      CartDrawer.addItem(99);
      expect($.ajaxCalls[0].data.quantity).toBe(1);
    });

    it('fetches /cart.js after adding', function() {
      CartDrawer.addItem(99);
      var getCall = $.ajaxCalls.find(function(c) { return c.url === '/cart.js'; });
      expect(getCall).toBeDefined();
    });

    it('opens the drawer after adding', function() {
      CartDrawer.addItem(99);
      expect(CartDrawer.$drawer.hasClass('is-open')).toBe(true);
    });
  });

  // --- refreshCart badge logic ---
  describe('refreshCart()', function() {
    it('updates cart count text', function() {
      CartDrawer.refreshCart({ item_count: 5, total_price: 2500, items: [] });
      expect($._getEl('[data-cart-count]').text).toBe(5);
    });

    it('shows badge when count > 0', function() {
      CartDrawer.refreshCart({ item_count: 3, total_price: 1500, items: [] });
      expect($._getEl('[data-cart-count-badge]').shown).toBe(true);
    });

    it('hides badge when cart is empty', function() {
      CartDrawer.refreshCart({ item_count: 0, total_price: 0, items: [] });
      expect($._getEl('[data-cart-count-badge]').shown).toBe(false);
    });
  });
});
