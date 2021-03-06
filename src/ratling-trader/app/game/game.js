define(function (require) {
        var GameCommands = require('enums/commands'),
            moveCommand = require('game/commands/move-command'),
            performedCommandEvent = require('game/events/performed-command-event');
        return Game;

        function Game(levelFactory, logger, entityFactory, scheduler) {
            var self = this,
                levels = {},
                actions = getActions(),
                player,
                isCursorLockedToPlayer = true,
                isGameOver = false,
                isProcessingCommand = false
                ;
            var ui;

            self.processCommand = processCommand;
            self.enterWorld = enterWorld;
            self.getLevels = getLevels;
            self.getCurrentLevel = getCurrentLevel;
            self.setCurrentLevel = setCurrentLevel;
            self.getGameState = getGameState;
            self.updateUI = updateUI;
            self.setUI = setUI;
            self.gameOver = gameOver;
            self.acceptInput = acceptInput;

            var cursorPosition = {x: 0, y: 0};

            function setUI(value) {
                ui = value;
            }

            function acceptInput() {
                isProcessingCommand = false;
            }

            function processCommand(command) {
                if (isProcessingCommand)
                    return;

                if (!command || !(command in actions))
                    return {error: 'invalid command'};

                isProcessingCommand = true;

                var action = actions[command];
                action.execute(command, action);
                return {};
            }

            function getGameState() {
                return {
                    cursorPosition: cursorPosition,
                    level: levels.currentLevel,
                    isGameOver: isGameOver
                };
            }

            function enterWorld() {
                player = entityFactory.get({type: 'player'});
                logger.log('entering world');
                setCurrentLevel(levels.world = levelFactory.get(self, 'world'));
                logger.log('level loaded');

                player.getPositionManager().setLevel(getCurrentLevel());
                player.getPositionManager().setPosition(5, 5);
                lockCursorToPlayer();
                scheduler.resume();
                logger.log('entered world');

            }

            function gameOver() {
                scheduler.pause();
                isGameOver = true;
                updateUI();

            }

            function getLevels() {
                return levels;
            }

            function getCurrentLevel() {
                return levels.currentLevel;
            }

            function setCurrentLevel(level) {
                levels.currentLevel = level;
            }

            function getActions() {
                var actions = {};
                actions[GameCommands.GoLeft] = {execute: movePlayerOrCursor, data: {x: -1}};
                actions[GameCommands.GoRight] = {execute: movePlayerOrCursor, data: {x: 1}};
                actions[GameCommands.GoUp] = {execute: movePlayerOrCursor, data: {y: -1}};
                actions[GameCommands.GoDown] = {execute: movePlayerOrCursor, data: {y: 1}};
                actions[GameCommands.GoUpLeft] = {execute: movePlayerOrCursor, data: {x: -1, y: -1}};
                actions[GameCommands.GoUpRight] = {execute: movePlayerOrCursor, data: {x: 1, y: -1}};
                actions[GameCommands.GoDownRight] = {execute: movePlayerOrCursor, data: {x: 1, y: 1}};
                actions[GameCommands.GoDownLeft] = {execute: movePlayerOrCursor, data: {x: -1, y: 1}};
                actions[GameCommands.WaitInPlace] = {execute: movePlayerOrCursor, data: {x: 0, y: 0}};
                return actions;
            }

            function movePlayerOrCursor(command, action) {
                var wasSuccessful = player.perform(moveCommand({x: action.data.x || 0, y: action.data.y || 0}));
                player.eventHub.broadcast(performedCommandEvent(command, wasSuccessful));

                //player.eventHub.broadcast('performAction', 'move', action.data.x || 0, action.data.y || 0);
                lockCursorToPlayer();
                updateUI();
            }

            function moveCursor(command) {
                if (command === GameCommands.GoLeft)
                    cursorPosition.x--;
                if (command === GameCommands.GoRight)
                    cursorPosition.x++;
                if (command === GameCommands.GoUp)
                    cursorPosition.y--;
                if (command === GameCommands.GoDown)
                    cursorPosition.y++;
                cursorPosition.x = Math.max(0, Math.min(levels.currentLevel.map.getWidth() - 1, cursorPosition.x));
                cursorPosition.y = Math.max(0, Math.min(levels.currentLevel.map.getHeight() - 1, cursorPosition.y));
                if (isCursorLockedToPlayer)
                    player.getPositionManager().setPosition(cursorPosition.x, cursorPosition.y);
            }

            function lockCursorToPlayer() {
                cursorPosition.x = player.getPositionManager().getLastKnownPosition().x;
                cursorPosition.y = player.getPositionManager().getLastKnownPosition().y;
            }

            function updateUI(entity) {
                if (ui)
                    ui.update();
            }

        }
    }
)
;