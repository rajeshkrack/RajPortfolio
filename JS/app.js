(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.AOS = factory();
    }
}
(this, function () {
    'use strict';
    
    var isBrowser = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var toString = Object.prototype.toString;
    var MAX_SAFE_INTEGER = 9007199254740991;

    function isObject(value) {
        var type = typeof value;
        return value !== null && (type === 'object' || type === 'function');
    }

    function toInteger(value) {
        var number = Number(value);
        if (isNaN(number)) {
            return 0;
        }
        if (number === 0 || !isFinite(number)) {
            return number;
        }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    }

    function parseInt(string, radix) {
        if (radix === undefined) {
            radix = 0;
        } else if (radix !== 0 && (radix < 2 || radix > 36)) {
            throw new RangeError('Invalid radix');
        }
        string = String(string).trim();
        if (radix === 0) {
            if (/^0x/i.test(string)) {
                radix = 16;
            } else if (/^0b/i.test(string)) {
                radix = 2;
            } else {
                radix = 10;
            }
        }
        return Number(string);
    }

    var now = function () {
        return isBrowser.Date.now();
    };

    function debounce(func, wait, options) {
        var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0,
            leading = false,
            maxing = false,
            trailing = true;

        if (typeof func !== 'function') {
            throw new TypeError('Expected a function');
        }
        wait = toInteger(wait) || 0;
        if (isObject(options)) {
            leading = !!options.leading;
            maxing = 'maxWait' in options;
            maxWait = maxing ? Math.max(toInteger(options.maxWait) || 0, wait) : maxWait;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
            var args = lastArgs,
                thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function leadingEdge(time) {
            lastInvokeTime = time;
            timerId = setTimeout(timerExpired, wait);
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
            var timeSinceLastCall = time - lastCallTime,
                timeSinceLastInvoke = time - lastInvokeTime,
                timeWaiting = wait - timeSinceLastCall;

            return maxing ?
                Math.min(timeWaiting, maxWait - timeSinceLastInvoke) :
                timeWaiting;
        }

        function shouldInvoke(time) {
            var timeSinceLastCall = time - lastCallTime,
                timeSinceLastInvoke = time - lastInvokeTime;

            return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
                (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
            var time = now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timerId = undefined;

            if (trailing && lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel() {
            if (timerId !== undefined) {
                clearTimeout(timerId);
            }
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
            return timerId === undefined ? result : trailingEdge(now());
        }

        function debounced() {
            var time = now(),
                isInvoking = shouldInvoke(time);

            lastArgs = arguments;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking) {
                if (timerId === undefined) {
                    return leadingEdge(lastCallTime);
                }
                if (maxing) {
                    timerId = setTimeout(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined) {
                timerId = setTimeout(timerExpired, wait);
            }
            return result;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
    }

    function isSupported() {
        return !!getMutationObserver();
    }

    function ready(fn, cb) {
        var doc = isBrowser.document;
        var observer = new getMutationObserver()(function (mutations) {
            observer.disconnect();
            cb();
        });
        fn(observer).observe(doc.documentElement, {
            childList: true,
            subtree: true,
            removedNodes: true
        });
    }

    function getMutationObserver() {
        return isBrowser.MutationObserver || isBrowser.WebKitMutationObserver || isBrowser.MozMutationObserver;
    }

    var MutationObserverService = {
        isSupported: isSupported,
        ready: ready
    };

    var defineProperty = Object.defineProperty;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) {
            defineProperties(Constructor.prototype, protoProps);
        }
        if (staticProps) {
            defineProperties(Constructor, staticProps);
        }
        return Constructor;
    }

    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            defineProperty(target, descriptor.key, descriptor);
        }
    }

    var isMobile = new (function () {
        function _class() {
            _classCallCheck(this, _class);
        }
        _createClass(_class, [{
            key: "phone",
            value: function phone() {
                var userAgent = this.getUserAgent();
                return !!((/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm
