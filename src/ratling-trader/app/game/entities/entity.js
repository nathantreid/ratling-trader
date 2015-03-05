define(function () {


    function Entity(data, mixinMapFactory) {
        this._private = {
            type: data.type,
            attributes: new Map(),
            characteristics: new Set(),
            mixins: mixinMapFactory.create(this),
        };
        this.tile = data.tile;
        initMixins(data.mixins, this.mixins);


    }

    Entity.prototype = {
        get attributes() {
            return this._private.attributes;
        },
        get characteristics() {
            return this._private.characteristics;
        },
        get mixins() {
            return this._private.mixins;
        },
        get tile() {
            return this._private.tile;
        },
        set tile(tile) {
            tile.entities.add(this);
            this._private.tile = tile;
        },
        get type() {
            return this._private.type;
        }

    };


    return Entity;

    function initMixins(mixins, mixinMap) {
        if (!mixins)
            return;
        for (var i = 0; i < mixins.length; i++)
            mixinMap.add(mixins[i]);
    }
});