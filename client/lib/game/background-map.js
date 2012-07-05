/*  Minor framerate optimization which customizes the repeating border draws 
 *  so that only they are only drawn where maps are not already drawn.  */

ig.module('game.background-map')

.requires('impact.background-map')

.defines(function() {

    ig.BackgroundMap.inject({

        drawTiled: function() {
            var tile = 0,
                anim = null,
                tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
                tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
                pxOffsetX = this.scroll.x % this.tilesize,
                pxOffsetY = this.scroll.y % this.tilesize,
                pxMinX = -pxOffsetX - this.tilesize,
                pxMinY = -pxOffsetY - this.tilesize,
                pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
                pxMaxY = ig.system.height + this.tilesize - pxOffsetY;

            // Used only for repeating-border draw skipping.
            var mapWidth = ig.game.collisionMap.width;
            var mapHeight = ig.game.collisionMap.height;

            for (var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
                var tileY = mapY + tileOffsetY;

                // Repeat Y?
                if (tileY >= this.height || tileY < 0) {
                    if (!this.repeat) {
                        continue;
                    }
                    tileY = tileY > 0 ? tileY % this.height : ((tileY + 1) % this.height) + this.height - 1;
                }

                for (var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize) {
                    var tileX = mapX + tileOffsetX;

                    // Repeat X?
                    if (tileX >= this.width || tileX < 0) {
                        if (!this.repeat) {
                            continue;
                        }
                        tileX = tileX > 0 ? tileX % this.width : ((tileX + 1) % this.width) + this.width - 1;
                    }

                    // Draw!
                    if ((tile = this.data[tileY][tileX])) {

                        // Start custom border draw check.
                        if (this.name == 'border' && typeof ig.game.borderLookup !== 'undefined') {

                                lookupX = mapX + tileOffsetX;
                                lookupY = mapY + tileOffsetY;

                                if (lookupX >= 0 && lookupX < mapWidth && lookupY >= 0 && lookupY < mapHeight && ig.game.borderLookup[lookupX][lookupY]) {
                                   
                                    continue;
                                }

                        } // End custom border draw check.

                        if ((anim = this.anims[tile - 1])) {
                            anim.draw(pxX, pxY);
                        } else {
                            this.tiles.drawTile(pxX, pxY, tile - 1, this.tilesize);
                        }
                    }
                } // end for x
            } // end for y
        }
    });

})