define(function (require) {
    var AbstractMixin = require('game/mixins/abstract-mixin');
    var ItemPickupCommand = require('game/commands/item-pickup-command');
    var DropItemsCommand = require('game/commands/drop-items-command');
    var DroppedItemsEvent = require('game/events/dropped-items-event');

    function InventoryManager() {
        AbstractMixin.apply(this);

        this.addCommandHandler(ItemPickupCommand, pickupItem);
        this.addCommandHandler(DropItemsCommand, dropItems);
    }


    function dropItems(command, entity){
        var droppedItems = [];
        for (var i = 0; i < command.itemsToDrop.length; i++)
        {
            var item = entity.inventory.removeAt(command.itemsToDrop[i]);
            item.tile = entity.tile;
            droppedItems.push(item);
        }
        var event = new DroppedItemsEvent(entity, droppedItems);
        event.notifyEntity(entity);
    }

    InventoryManager.prototype = Object.create(AbstractMixin.prototype);

    function pickupItem(command, entity) {
        var item = entity.tile.entities.floorSpace[command.itemIndex];
        if (!item)
            return;
        entity.inventory.add(item);
        item.tile = null;
    }

    return InventoryManager;
});