define(function () {

    function MixinMap(entity, loadedMixins) {
        this._private = {
            entity: entity,
            map: new Map(),
            loadedMixins: loadedMixins
        };

    }

    MixinMap.prototype.add = function add(value) {
        var mixin = this._private.loadedMixins.get(value);
        if (!mixin) {
            rat.logger.logWarning(value + ' is not a valid mixin.');
            return;
        }
        rat.logger.logInfo(value + ' mixin loaded.');
        mixin.applyTo(this._private.entity);
        this._private.map.set(mixin.constructor.name, mixin);
    };


    function MixinMapFactory(loadedMixins) {
        this._private = {
            loadedMixins: loadedMixins
        };
    }

    MixinMapFactory.prototype.create = function create(entity) {
        return new MixinMap(entity, this._private.loadedMixins);
    };

    return MixinMapFactory;
});