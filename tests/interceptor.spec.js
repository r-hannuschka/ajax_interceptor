describe('Interceptor: initial testing', function() {

    function noop () {}

    it('public api subscribe and unsubscribe exists', function() {
        expect(AjaxInterceptor.subscribe).to.be.a('function');
        expect(AjaxInterceptor.unsubscribe).to.be.a('function');
    });

    it('we could subscibe an url for all evens', function () {

        // register listener for all operations
        action = AjaxInterceptor.subscribe('myAwesomeUrl', function () {
        });
        expect(action).to.be.true;

        // 2 operations registered before and error
        action = AjaxInterceptor.subscribe('myAwesomeUrl', {
            before: noop,
            error:  noop
        });
        expect(action).to.be.true;

        // no operation will passed because this are no valid hooks 
        action = AjaxInterceptor.subscribe('myAwesomeUrl', {
            foobar: noop,
            barfoo: noop
        });
        expect(action).to.be.false;

        // one operation will passed the other will deleted
        // so this one can be registered
        action = AjaxInterceptor.subscribe('myAwesomeUrl2', {
            foobar: noop,
            barfoo: noop,
            before: noop
        });
        expect(action).to.be.true;
    });
});
