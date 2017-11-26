/***
 * @author Ralf Hannuschka
 * @version 1.0
 *
 * jQuery AxjaxInterceptor to intercept all ajax requests
 *
 * subscribe to all Ajax Events with 
 *
 * AjaxInterceptor.subscribe('*', callbackFunction)
 *
 * subscribe to only fetch specific Ajax Events
 *
 * AjaxInterceptor.subscribe('*', {
 *   success: callback
 * });
 *
 * subscribe to specific URL 
 *
 * AjaxInterceptor.subscribe('urltoInterceptAjaxCall', callbackFunction);
 *
 * or 
 *
 * AjaxInterceptor.subscribe('urlToInterceptAjaxCall', { ... });
 *
 * possible ajax events are 
 *
 * before
 * complete
 * success
 * error
 *
 * known Bugs in jQuery 1.8 and fixed with 1.9.1
 * 
 * return false on before callback will abort the XHR request
 * this will cause 'error' and 'complete' will called twice
 */
;(function (global, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if ( typeof  module === 'object' && module.exports ) {
        module.exports = factory( require('jQuery') );
    } else {
        global.AjaxInterceptor = factory();
    }

}( window !== 'undefined' ? window : this, function () {

    var subscribers,

        validHandlers;

    // initialize
    (function init() {
        /**
         * all subscribers
         */
        subscribers = {
            '*': {
                'before'  : [],
                'complete': [],
                'success' : [],
                'error'   : []
            }
        };
 
        validHandlers = ['before', 'error', 'success', 'complete'];

        decorateXMLHttpRequestOpen ( XMLHttpRequest.prototype.open );
        decorateXMLHttpRequestSend ( XMLHttpRequest.prototype.send );
    }());

    /**
     * decorate XMLHttpRequest open method
     *
     * @param {Function} send, the current XMLHttpRequest.open method
     */
    function decorateXMLHttpRequestOpen ( open ) 
    {
        XMLHttpRequest.prototype.open = function(method, url) {

            var request = {
                method: method,
                url   : url,
                data  : null
            };

            Object.defineProperty( this, 'ajaxInterceptor', {
                get: function() {
                    return request;
                },
                'enumerable': false
            });

            this.addEventListener('readystatechange', onXMLHttpChangeState);
            open.apply(this, arguments);
        };
    }

    /**
     * decorate XMLHttpRequest send method
     *
     * @param {Function} send, the current XMLHttpRequest.send method
     */
    function decorateXMLHttpRequestSend(send) 
    {
        XMLHttpRequest.prototype.send = function(data) {

            this.ajaxInterceptor.data = data ;
            Object.freeze(this.ajaxInterceptor);

            _onXMLHttpRequestSend(this, this.ajaxInterceptor.url );
            send.apply(this, arguments);
        };
    }

    /**
     * on request state change 
     *
     * @scope XMLHttpRequest Object
     * @param {String} url
     */
    function onXMLHttpChangeState (url) 
    {
        if ( this.readyState === XMLHttpRequest.DONE ) {
            _onXMLHttpRequestDone ( this, this.ajaxInterceptor.url);
        }
    }

    /**
     * called before an ajax request is sending
     * if subscriber returns false, the request will be aborted
     *
     * @param {Object} event
     * @param {Object} jqxhr
     * @param {Object} settings
     */
    function _onXMLHttpRequestSend (xhr, url) 
    {
        var subs;

        subs = _getStateSubscribers(url, 'before');
        notifySubscriber(subs, xhr, 'before', url);
    }

    function _onXMLHttpRequestDone (xhr, url) 
    {
        var subs;

        if ( xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ) {
            subs = _getStateSubscribers(url, 'success');
            notifySubscriber(subs, xhr, 'success', url);
        } else {
            subs = _getStateSubscribers(url, 'error');
            notifySubscriber(subs, xhr, 'error', url);
        }

        subs = _getStateSubscribers(url, 'complete');
        notifySubscriber(subs, xhr, 'complete', url);
    }

    function type ( object ) {
        var _type = Object.prototype.toString.call(object).slice(8, -1);
        return _type ? _type.toLowerCase() : undefined;
    }

    /**
     * sanitize handler to create allways an object
     * @param {mixed} handlers either an object or function
     * @return {object} handler
     */
    function sanitizeHandler (handlers) 
    {
        var handler, 
            keys;

        if ( type(handlers) === 'function' ) 
        {
            handler = {
                'success' : handlers,
                'before'  : handlers,
                'error'   : handlers,
                'complete': handlers
            };
        }

        if ( type(handlers) === 'object' )
        {
            keys = Object.keys(handlers);

            for(var i = 0, key,  ln = keys.length; i < ln; i++ ) 
            {
                key = keys[i];

                if ( validHandlers.indexOf( key ) === -1 ||  type( handlers[key] ) !== 'function' ) 
                {
                    delete handlers[ key ];
                    continue;
                }
            }

            // if we delete to much and nothing left 
            // set handler to null
            handler = Object.keys(handlers).length ? handlers : null;
        }
        return handler;
    }

    /**
     * notify all subscribers 
     *
     * @param Function[] subscriber 
     * @param {Object} jqxhr
     * @param {String} state
     */
    function notifySubscriber( subscriber, xhr, state, url, data)
    {
        var subs;

        subs = _getStateSubscribers('*', state);
        subs = subs.concat(subscriber);

        for( var i = 0, ln = subs.length; i < ln; i++ ) {
            subs[i](xhr, state, url, data);
        }
    }

    /**
     * get subscribers
     *
     * @param {String} url
     */
    function _getSubscribers(url) {

        var subs = {};

        if ( subscribers.hasOwnProperty(url) ) {
            subs = subscribers[url];
        }

        return subs;
    }

    /**
     * get subscribers for a specific state
     *
     * @param {String} url
     * @param {String} state
     */
    function _getStateSubscribers( url, state) {

        var subs;
        subs = _getSubscribers(url);

        if ( state && subs.hasOwnProperty(state) ) {
            subs = subs[state];
        } else {
            subs = [];
        }
        return subs;
    }

    /**
     * register subscribers
     *
     * @param {String} url 
     * @param {Object} handlers 
     * @return {boolean}
     */
    function registerSubscriber(url, handler) 
    {
        var callbacks;

        if ( !subscribers.hasOwnProperty(url) ) 
        {
            subscribers[url] = {
                'success' : [],
                'error'   : [],
                'before'  : [],
                'complete': []
            };
        }
        
        // handler is an object
        for ( var key in handler ) {

            if ( handler.hasOwnProperty( key ) ) {

                callbacks = subscribers[url][key];

                if ( callbacks.indexOf(handler[key]) === -1 ) {
                    callbacks.push (handler[key]);
                }

            }
        }
        return true;
    }

    /**
     * subscribe
     *
     * @oaram {String} url the url to catch ajax events or * 
     * @param {mixed|*} handler 
     */
    function _subscribe (url, handler) 
    {
        var subscribed = false;
        handler = sanitizeHandler( handler );

        subscribed = handler;
        subscribed = subscribed && registerSubscriber(url, handler);

        return !!subscribed;
    }

    /**
     * unsubscribe
     *
     * @param {String} url unsubscribe from specicif url or * 
     * @param {Function} fn callback function to unsubscribe
     * @param {String} state only unsbscibe from a specific state
     */
    function _unsubscribe(url, fn, state) 
    {
        var subs,
            _subscribers;

        if ( !subscribers.hasOwnProperty(url) || type(fn) !== 'function' ) {
            return;
        }

        if ( state && subscribers[url].hasOwnProperty(state) ) {

            subs = _getStateSubscribers(url, state);
            subs.splice( subs.indexOf(fn), 1);
            return;
        }

        subs = _getSubscribers(url);

        for(var url in subs ) {
            _subscribers = subs[url];
            _subscribers.splice( _subscribers.indexOf(fn), 1);
        }
    }

    return {
        subscribe: _subscribe,

        unsubscribe: _unsubscribe
    }
}));
