/* Customize repeating border draws to only draw where maps are not already drawn. */

ig.module('game.background-map')

.requires()

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
                
            
            // FIXME: could be sped up for non-repeated maps: restrict the for loops
            // to the map size instead of to the screen size and skip the 'repeat'
            // checks inside the loop.
            
            for( var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
                var tileY = mapY + tileOffsetY;
                    
                // Repeat Y?
                if( tileY >= this.height || tileY < 0 ) {
                    if( !this.repeat ) { continue; }
                    tileY = tileY > 0
                        ? tileY % this.height
                        : ((tileY+1) % this.height) + this.height - 1;
                }
                
                for( var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize ) {
                    var tileX = mapX + tileOffsetX;
                    
                    // Repeat X?
                    if( tileX >= this.width || tileX < 0 ) {
                        if( !this.repeat ) { continue; }
                        tileX = tileX > 0
                            ? tileX % this.width
                            : ((tileX+1) % this.width) + this.width - 1;
                    }
                    
                    // Draw!
                    if( (tile = this.data[tileY][tileX]) ) {
                        
                        // Begin custom code.
                        if( typeof ig.game.borderLookup !== 'undefined') {

                            if( this.name == 'border' ) {

                                lookupX = mapX + tileOffsetX;
                                lookupY = mapY + tileOffsetY;

                                if( lookupX >= 0 && 
                                    lookupX < ig.game.collisionMap.width &&
                                    lookupY >= 0 && 
                                    lookupY < ig.game.collisionMap.height &&
                                    ig.game.borderLookup[ lookupX ][ lookupY ] ) continue;
                            }
                        } // End custom code.

                        if( (anim = this.anims[tile-1]) ) { 
                            anim.draw( pxX, pxY );
                        }
                        else {
                            this.tiles.drawTile( pxX, pxY, tile-1, this.tilesize );
                        }
                    }
                } // end for x
            } // end for y
        }
    });

})