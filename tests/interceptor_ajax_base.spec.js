describe('Interceptor: intercept single ajax events', function (){
    
    function noop () {
    }

    function triggerRequest(url, cb) 
    {
        var xhr = new XMLHttpRequest(),
            url = url || 'http://jsonplaceholder.typicode.com/posts/1',
            callback = cb || noop;

        xhr.open('GET', url);
        xhr.onreadystatechange = function () {

            if ( this.readyState == XMLHttpRequest.DONE ) 
            {
                callback(this.response);
            }
        };
        xhr.send();
    }

    it( 'it will notified on before', function(done) {

        var states = [],
            url = 'http://jsonplaceholder.typicode.com/posts/1';

        server.respondWith("GET", url,
                [200, { "Content-Type": "application/json" },
                '{ "success": false}']);

        AjaxInterceptor.subscribe(url, {
            before: function singleBefore (request, state) {

                expect( request.readyState ).to.be.equal( XMLHttpRequest.OPENED );
                expect( state ).to.be.equal( 'before' );

                AjaxInterceptor.unsubscribe(url, singleBefore, 'before');
                done();
            }
        }); 

        triggerRequest(url);
        server.respond();
    });

    it( 'it will notified on error', function(done) {

        var states = [],
            url = '/interceptor/error';

        server.respondWith("GET", url,
                [404, { "Content-Type": "application/json" },
                '{ "success": false}']);

        AjaxInterceptor.subscribe(url, {
            error: function singleError (request, state) {
                AjaxInterceptor.unsubscribe(url, singleError, 'error');
                done();
            }
        }); 

        triggerRequest(url);
        server.respond();
    });

    it( 'it will notified on success ', function(done) {
        var states = [],
            url    = 'interceptor/success';

        server.respondWith("GET", url,
                [200, { "Content-Type": "application/json" },
                '{ "success": false}']);

        AjaxInterceptor.subscribe(url, {
            success: function singleSuccess (request, state) {
                var success; 
                success = request.readyState === XMLHttpRequest.DONE;
                success = success && (request.status >= 200 && request.status < 300 || request.status === 304);
                AjaxInterceptor.unsubscribe(url, singleSuccess, 'success');
                expect(success).to.be.true;
                done();
            }
        }); 
        triggerRequest(url);
        server.respond();
    });

    it( 'it will notified on all States', function(done) {
        var states = [];

        var url = 'interceptor/all';

        server.respondWith("GET", url,
                [200, { "Content-Type": "application/json" },
                '{ "success": false}']);

        AjaxInterceptor.subscribe(url, function xhrAllStates (request, state) {

            states.push(state);

            if ( request.readyState === XMLHttpRequest.DONE && state === 'complete' ) {
                expect(states).to.deep.equal(['before', 'success', 'complete']);
                AjaxInterceptor.unsubscribe(url, xhrAllStates);
                done();
            }
        }); 
        triggerRequest(url);
        server.respond();
    });
});
