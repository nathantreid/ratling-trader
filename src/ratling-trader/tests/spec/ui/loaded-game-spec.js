define(function (require) {
    var ROT = require('rot');
    var GameRoot = require('game/game-root');
    var UiRoot = require('ui/ui-root');
    var when = require('when');
    var TestDisplay = require('tests/helpers/test-display');
    var Game = require('game/game');
    'use strict';

    describe('ui - a loaded game', function () {
        it('should draw each tile', function (done) {
            var gameRoot = new GameRoot();
            var uiRoot = new UiRoot();
            var uiToGameBridge;
            var gameToUiBridge;

            var currentLevel = {
                size: {width: 2, height: 2},
                tiles: [
                    ['dirtFloor', 'dirtFloor'],
                    ['dirtFloor', 'dirtFloor'],
                ]
            };
            var asciiTiles = [
                ['.', '.'],
                ['.', '.'],
            ];
            var gameData = {
                levels: [
                    currentLevel
                ],
                currentLevel: 0
            };

            var targetNumberOfDrawCalls = currentLevel.size.width * currentLevel.size.height;
            var numberOfDrawCalls = 0;
            when.all([uiRoot.init(), gameRoot.init()])
                .then(function () {
                    var SavedGameFactory = getSavedGameFactory(gameData);
                    uiRoot._private.injector.register('display', new TestDisplay(drawCallback));
                    gameRoot._private.injector.register('savedGameFactory', SavedGameFactory);
                    var ui = uiRoot.injector.resolve('ui');
                    uiToGameBridge = ui.uiBridge;
                    gameToUiBridge = gameRoot.injector.resolve('GameToUiBridge');

                    gameToUiBridge.uiBridge = uiToGameBridge;
                    uiToGameBridge.gameBridge = gameToUiBridge;

                    uiToGameBridge.initUi();
                    ui.screens.currentScreen.loadGame();

                });

            var nextTileX = 0;
            var nextTileY = 0;

            function drawCallback(x, y, character) {
                if (nextTileX >= currentLevel.tiles.length)
                    return;
                if (character === asciiTiles[nextTileX][nextTileY]) {
                    nextTileY++;
                    if (nextTileY >= currentLevel.tiles[nextTileX].length) {
                        nextTileX++;
                        nextTileY = 0;
                    }
                    numberOfDrawCalls++;
                }
                //console.log(numberOfDrawCalls + ' / ' + targetNumberOfDrawCalls);
                if (numberOfDrawCalls === targetNumberOfDrawCalls)
                    done();
            }

            function getSavedGameFactory(gameData) {

                function SavedGameFactory(levelFactory, entityFactory) {
                    this._private = {
                        gameData: gameData,
                        levelFactory: levelFactory,
                        entityFactory: entityFactory
                    };
                }

                SavedGameFactory.prototype.create = function create(gameToUiBridge) {
                    return new Game(gameToUiBridge, this._private.levelFactory, this._private.entityFactory, gameData);
                };

                return SavedGameFactory;
            }

        });
    });
});