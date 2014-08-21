define(function (require) {
    var Uuid = require('uuid'),
        inherit = require('helpers/inherit'),
        stringFormat = require('stringformat');

    return Constructor;

    function Constructor(data, logger) {
        var self = this;




        self.move = move;
        self.act = act;


        function move(dX, dY) {
            var newTile = self.getTile().getNeighbor(dX, dY);
            if (newTile.isWalkable())
                self.setTile(newTile);
            else if (newTile.isDiggable())
                newTile.dig();
        }

        function act() {
            self.getLevel().getEngine().updateUI(self);
        }

    }
});