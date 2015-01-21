define(function () {
    function ScreenStack() {
        this._private = {
            stack: []
        };
    }

    ScreenStack.prototype = {
        get currentScreen() {
            var stack = this._private.stack;
            return stack[stack.length - 1];
        },
        push: function (screen) {
            this._private.stack.push(screen);
            screen.render();
        },
    };

    return ScreenStack;
});