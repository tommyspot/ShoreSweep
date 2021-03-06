// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var addWindowInViewItem, bindWindowEvents, checkInView, debounce, getBoundingClientRect, getViewportHeight, removeWindowInViewItem, trackInViewContainer, triggerInViewCallback, unbindWindowEvents, untrackInViewContainer, windowCheckInViewDebounced, windowEventsHandler, _containersControllers, _windowEventsHandlerBinded, _windowInViewItems;

  angular.module('angular-inview', []).directive('inViewContainer', function() {
    return {
      restrict: 'AC',
      controller: function($element) {
        var _this = this;

        this.items = [];
        this.addItem = function(item) {
          return this.items.push(item);
        };
        this.removeItem = function(item) {
          var i;

          return this.items = (function() {
            var _i, _len, _ref, _results;

            _ref = this.items;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              if (i !== item) {
                _results.push(i);
              }
            }
            return _results;
          }).call(this);
        };
        this.checkInViewDebounced = debounce(function () {
          return checkInView(_this.items, $element[0]);
        });
        return this;
      },
      link: function(scope, element, attrs, controller) {
        element.bind('scroll', controller.checkInViewDebounced);
        trackInViewContainer(controller);
        return scope.$on('$destroy', function () {          
          element.unbind('scroll', controller.checkInViewDebounced);
          return untrackInViewContainer(controller);
        });
      }
    };
  }).directive('inView', [
    '$parse', function($parse) {
      return {
        restrict: 'A',
        require: '?^inViewContainer',
        link: function (scope, element, attrs, containerController) {
          var inViewFunc, item, performCheckDebounced;

          if (!attrs.inView) {
            return;
          }
          inViewFunc = $parse(attrs.inView);
          item = {
            element: element,
            wasInView: false,
            offset: 0,
            callback: function($inview, $inviewpart) {
              var _this = this;

              return scope.$apply(function() {
                return inViewFunc(scope, {
                  '$element': element[0],
                  '$inview': $inview,
                  '$inviewpart': $inviewpart
                });
              });
            }
          };         

          performCheckDebounced = windowCheckInViewDebounced;
          if (containerController != null) {
            containerController.addItem(item);
            performCheckDebounced = containerController.checkInViewDebounced;
          } else {
            addWindowInViewItem(item);
          }
          performCheckDebounced();
          if (attrs.inViewOffset != null) {
            attrs.$observe('inViewOffset', function(offset) {
              item.offset = scope.$eval(offset) || 0;
              return performCheckDebounced();
            });
          }
          return scope.$on('$destroy', function() {
            if (containerController != null) {
              containerController.removeItem(item);
            }
            return removeWindowInViewItem(item);
          });
        }
      };
    }
  ]);

  _windowInViewItems = [];

  addWindowInViewItem = function(item) {
    _windowInViewItems.push(item);
    return bindWindowEvents();
  };

  removeWindowInViewItem = function(item) {
    var i;

    _windowInViewItems = (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = _windowInViewItems.length; _i < _len; _i++) {
        i = _windowInViewItems[_i];
        if (i !== item) {
          _results.push(i);
        }
      }
      return _results;
    })();
    return unbindWindowEvents();
  };

  _containersControllers = [];

  trackInViewContainer = function(controller) {
    _containersControllers.push(controller);
    return bindWindowEvents();
  };

  untrackInViewContainer = function(container) {
    var c;

    _containersControllers = (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = _containersControllers.length; _i < _len; _i++) {
        c = _containersControllers[_i];
        if (c !== container) {
          _results.push(c);
        }
      }
      return _results;
    })();
    return unbindWindowEvents();
  };

  _windowEventsHandlerBinded = false;

  windowEventsHandler = function() {
    var c, _i, _len;

    for (_i = 0, _len = _containersControllers.length; _i < _len; _i++) {
      c = _containersControllers[_i];
      c.checkInViewDebounced();
    }
    if (_windowInViewItems.length) {
      return windowCheckInViewDebounced();
    }
  };

  bindWindowEvents = function() {
    if (_windowEventsHandlerBinded) {
      return;
    }
    _windowEventsHandlerBinded = true;
    return angular.element(window).bind('checkInView click ready scroll resize', windowEventsHandler);
  };

  unbindWindowEvents = function() {
    if (!_windowEventsHandlerBinded) {
      return;
    }
    if (_windowInViewItems.length || _containersControllers.length) {
      return;
    }
    _windowEventsHandlerBinded = false;
    return angular.element(window).unbind('checkInView click ready scroll resize', windowEventsHandler);
  };

  triggerInViewCallback = function(item, inview, isTopVisible, isBottomVisible) {
    var el, inviewpart;

    if (inview) {
      el = item.element[0];
      inviewpart = (isTopVisible && 'top') || (isBottomVisible && 'bottom') || 'both';
      if (!(item.wasInView && item.wasInView === inviewpart && el.offsetTop === item.lastOffsetTop)) {
        item.lastOffsetTop = el.offsetTop;
        item.wasInView = inviewpart;
        return item.callback(true, inviewpart);
      }
    } else if (item.wasInView) {
      item.wasInView = false;
      return item.callback(false);
    }
  };

  checkInView = function(items, container) {
    var bounds, element, item, viewport, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;

    viewport = {
      top: 0,
      bottom: getViewportHeight()
    };
    if (container && container !== window) {
      bounds = getBoundingClientRect(container);
      if (bounds.top > viewport.bottom || bounds.bottom < viewport.top) {
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          triggerInViewCallback(item, false);
        }
        return;
      }
      if (bounds.top > viewport.top) {
        viewport.top = bounds.top;
      }
      if (bounds.bottom < viewport.bottom) {
        viewport.bottom = bounds.bottom;
      }
    }
    _results = [];
    for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
      item = items[_j];
      element = item.element[0];
      bounds = getBoundingClientRect(element);
      bounds.top += (_ref = (_ref1 = item.offset) != null ? _ref1[0] : void 0) != null ? _ref : item.offset;
      bounds.bottom += (_ref2 = (_ref3 = item.offset) != null ? _ref3[1] : void 0) != null ? _ref2 : item.offset;
      if (bounds.top < viewport.bottom && bounds.bottom >= viewport.top) {        
        _results.push(triggerInViewCallback(item, true, bounds.bottom > viewport.bottom, bounds.top < viewport.top));
      } else {
        _results.push(triggerInViewCallback(item, false));
      }
    }
    return _results;
  };

  getViewportHeight = function() {
    var height, mode, _ref;

    height = window.innerHeight;
    if (height) {
      return height;
    }
    mode = document.compatMode;
    if (mode || !(typeof $ !== "undefined" && $ !== null ? (_ref = $.support) != null ? _ref.boxModel : void 0 : void 0)) {
      height = mode === 'CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
    }
    return height;
  };

  getBoundingClientRect = function(element) {
    var el, parent, top;

    top = 0;
    el = element;
    while (el) {
      top += el.offsetTop;
      el = el.offsetParent;
    }
    parent = element.parentElement;
    while (parent) {
      if (parent.scrollTop != null) {
        top -= parent.scrollTop;
      }
      parent = parent.parentElement;
    }
    return {
      top: top,
      bottom: top + element.offsetHeight
    };
  };

  debounce = function(f, t) {
    var timer;

    timer = null;
    return function() {
      if (timer != null) {
        clearTimeout(timer);
      }
      return timer = setTimeout(f, t != null ? t : 100);
    };
  };

  windowCheckInViewDebounced = debounce(function () {
    return checkInView(_windowInViewItems);
  });

}).call(this);
