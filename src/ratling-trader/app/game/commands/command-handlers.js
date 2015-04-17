define(function (require) {
    function CommandHandlers() {
        this._private = {commands: {}};
    }

    CommandHandlers.prototype.notify = function notify(command) {
        var commands = this._private.commands;
        var subscriptions = commands[command.constructor.name];
        if (subscriptions === undefined)
            return false;

        for (var i = 0; i < subscriptions.length; i++) {
            var subscription = subscriptions[i];
            subscription.handler(command, subscription.entity);
        }
        return true;
    };

    CommandHandlers.prototype.subscribe = function subscribe(entity, command) {
        var commands = this._private.commands;
        if (!(command.class.name in commands))
            commands[command.class.name] = [];
        commands[command.class.name].push({entity: entity, handler: command.handler});
    };

    CommandHandlers.prototype.unsubscribe = function unsubscribe(entity, command) {
        var commands = this._private.commands;
        var subscriptions = commands[command.constructor.name];
        if (subscriptions === undefined)
            return;

        for (var i = 0; i < subscriptions.length; i++) {
            var subscription = subscriptions[i];
            if (entity === subscription.entity)
                subscriptions.splice(entity, 1);
        }
    };

    return CommandHandlers;

});