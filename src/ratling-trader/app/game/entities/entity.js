define(function (require) {
    var Uuid = require('uuid'),
        inherit = require('helpers/inherit'),
        stringFormat = require('stringformat'),
        ROT = require('rot'),
        extend = require('lib/extend/extend');

    return Entity;

    function Entity(data, entityAttributes, loadedMixins, loadedBehaviors, logger) {
        var self = this,
            id = data.id || Uuid.v4(),
            currentState,
            mixins = {},
            states = {},
            entityBase = {},
            events = [];


        setPublicMethods();

        addMixins();
        initAI();
        init();

        function init() {
            entityAttributes.setAttributes(data.attributes);
        }

        function setPublicMethods() {
            entityBase.getLogger = getLogger;
            entityBase.getData = getData;
            entityBase.getState = getState;
            entityBase.getId = getId;
            entityBase.getType = getType;
            entityBase.getPosition = getPosition;
            entityBase.setPosition = setPosition;
            entityBase.getTile = getTile;
            entityBase.setTile = setTile;
            entityBase.getLevel = getLevel;
            entityBase.setLevel = setLevel;
            entityBase.kill = kill;
            entityBase.act = act;
            entityBase.hasMixin = hasMixin;
            entityBase.raiseEvent = raiseEvent;
            entityBase.getAttributes = getAttributes;

            extend(self, entityBase);
        }

        function initAI() {

            addStates();
            setInitialState();

            function addStates() {
                extend(true, states, self.getData().states);
                var keys = Object.keys(states);
                for (var i = 0; i < keys.length; i++) {
                    processBehaviors(states[keys[i]]);
                }
            }

            function setInitialState() {
                currentState = getData().initialState;
            }

            function processBehaviors(state) {
                for (var i = 0; i < state.behaviors.length; i++) {
                    var behavior = state.behaviors[i];
                    if (!('probability' in  behavior ))
                        behavior.probability = 1;
                    behavior.execute = loadedBehaviors.get(behavior.name).execute;
                }
            }

        }

        function addMixins() {
            var mixins = self.getData().mixins;
            for (var i = 0; i < mixins.length; i++)
                addMixin(mixins[i]);
        }

        function addMixin(name) {
            var mixin = loadedMixins.get(name);

            if (!mixin) {
                logger.logWarning(stringFormat('Invalid mixin: {name}', {name: name}));
                return;
            }

            mixins[name] = true;
            var eventKeys = Object.keys(mixin);
            for (var i = 0; i < eventKeys.length; i++) {
                var event = eventKeys[i];
                addEventHandler(event, mixin[event]);
            }

            function addEventHandler(name, handler) {
                if (!(name in events))
                    events[name] = {handlers: []};
                events[name].handlers.push(handler);
            }

        }

        function hasMixin(name) {
            return name in mixins;
        }

        function getData() {
            return data;
        }

        function getState() {
            return states[currentState];
        }

        function getId() {
            return id;
        }

        function getType() {
            return data.type;
        }

        function getAttributes() {
            return entityAttributes;
        }

        function getPosition() {
            return data.position;
        }

        function setPosition(x, y) {
            removeSelfFromCurrentTile();

            var newTile = getLevel().getMap().getTile(x, y);
            addSelfToTile(newTile);
        }

        function setTile(newTile) {
            removeSelfFromCurrentTile();
            addSelfToTile(newTile);
        }

        function addSelfToTile(tile) {
            data.position.x = tile.getPosition().x;
            data.position.y = tile.getPosition().y;

            tile.setCreature(self);
        }

        function getTile() {
            return getLevel().getMap().getTile(getPosition().x, getPosition().y);
        }

        function removeSelfFromCurrentTile() {
            var tile = getLevel().getMap().getTile(getPosition().x, getPosition().y);
            if (tile && tile.getCreature() === self)
                tile.setCreature(null);
        }

        function setLevel(level) {
            data.level = level;
            level.addEntity(self);
        }

        function getLevel() {
            return data.level;
        }

        function getLogger() {
            return logger;
        }


        function kill() {
            self.state = 'dead';
            raiseEvent('killed');
            removeSelfFromCurrentTile();
            getLevel().removeEntity(self);
        }

        function act() {
            if (self.raiseEvent('act'))
                return;

            if (!self.hasAlreadyActed)
                decideOnAction();
            self.hasAlreadyActed = false;
        }

        function decideOnAction() {
            for (var i = 0; i < getState().behaviors.length; i++) {
                var behavior = getState().behaviors[i];
                if (behavior.probability >= ROT.RNG.getUniform())
                    if (self.hasAlreadyActed = performAction(behavior))
                        return;
            }
            logger.log('do nothing');
        }

        function performAction(behavior) {
            var result = behavior.execute(self);
            if (result === undefined)
                result = true;
            return result;
        }

        function raiseEvent(name) {
            var args = Array.prototype.slice.call(arguments, 1);
            var event = events[name];
            if (!event)
                return false;

            var result = {
                metSuccess: false,
                metFailure: false
            };

            for (var i = 0; i < event.handlers.length; i++) {
                var handlerResult = event.handlers[i].apply(self, args);
                if (handlerResult === undefined) handlerResult = true;
                if (!result.metSuccess && handlerResult)
                    result.metSuccess = true;
                if (!result.metFailure && !handlerResult)
                    result.metSuccess = true;
            }

            return result;
        }
    }
});