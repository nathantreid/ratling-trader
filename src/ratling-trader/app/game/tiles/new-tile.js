define(function (require) {

    function Tile(level, position, intentHandlers) {
        this._private = {
            entities: new Set(),
            level: level,
            position: position,

            intentHandlers: intentHandlers
        };
    }

    Tile.prototype = {
        get entities() {
            return this._private.entities;
        },
        get intentHandlers() {
            return this._private.intentHandlers;
        },
        get level() {
            return this._private.level;
        },
        get position() {
            return this._private.position;
        },
        getNeighbor: function getNeighbor(direction) {
            return this.level.getTileAt(this.position.x + direction.x, this.position.y + direction.y);
        },

    };


    return Tile;

});