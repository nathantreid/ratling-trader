define(function (require) {
    var ROT = require('rot')
        ;

    return Constructor;

    function Constructor(engine, playingScreenFactory, winningScreenFactory, losingScreenFactory, logger) {
        var self = this;
        var display, screens = {}, width = 80, height = 24;

        self.init = init;
        self.getScreens = getScreens;
        self.switchScreen = switchScreen;
        self.getDisplay = getDisplay;
        self.getEngine = getEngine;
        self.getWidth = getWidth;
        self.getHeight = getHeight;

        function init() {
            display = createDisplay();
            bindInputEvents();

            screens.playingScreen = playingScreenFactory.get(display, self);
            screens.winningScreen = winningScreenFactory.get(display, self);
            screens.losingScreen = losingScreenFactory.get(display, self);
            switchScreen(screens.playingScreen);

            screens.current.render();
        }

        function createDisplay() {
            var display = new ROT.Display({width: width, height: height});
            ROT.Display.Rect.cache = true
            var container = display.getContainer();
            document.body.appendChild(container);

            return display;
        }

        function bindInputEvents() {
            bindInputEvent('keydown');
            bindInputEvent('keyup');
            bindInputEvent('keypress');

            function bindInputEvent(event) {
                window.addEventListener(event, function (e) {
                    if (screens.current !== null) {
                        screens.current.handleInput(event, e);
                    }
                });
            }
        }

        function switchScreen(screen) {
            if (!screen) {
                logger.logError('can\'t switch to undefined screen');
                return;
            }
            if (screens.current)
                screens.current.exit();

            display.clear();

            screens.current = screen;

            screens.current.enter();
            screens.current.render();
        }

        function getScreens() {
            return screens;
        }

        function getDisplay() {
            return display;
        }

        function getEngine() {
            return engine;
        }

        function getWidth() {
            return width;
        }

        function getHeight() {
            return height;
        }
    }
});