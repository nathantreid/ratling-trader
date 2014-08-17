define(function (require) {
    var Injector = require('injector'),
        PlayingScreenFactory = require('ui/screens/playing-screen-factory'),
        LosingScreenFactory = require('ui/screens/losing-screen-factory'),
        WinningScreenFactory = require('ui/screens/winning-screen-factory'),
        MapFactory = require('game/map/map-factory'),
        TileFactory = require('game/tiles/tile-factory'),
        PlayerFactory = require('game/entities/player-factory'),
        Game = require('game'),
        Engine = require('game/engine'),
        UI = require('ui/ui'),
        AsciiTiles = require('ui/tiles/ascii-tiles'),
        DebugLogger = require('debug-logger');

    return CompositionRoot;

    function CompositionRoot() {
        var self = this;
        var injector = self.injector = new Injector();

        injector.register('PlayingScreenFactory', PlayingScreenFactory);
        injector.register('LosingScreenFactory', LosingScreenFactory);
        injector.register('WinningScreenFactory', WinningScreenFactory);
        injector.register('AsciiTiles', AsciiTiles, true);
        injector.register('MapFactory', MapFactory);
        injector.register('TileFactory', TileFactory);
        injector.register('PlayerFactory', PlayerFactory);
        injector.register('Game', Game);
        injector.register('Engine', Engine, true);
        injector.register('Logger', DebugLogger, true);
        injector.register('UI', UI);

    }
});