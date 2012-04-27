ig.module (
    
    'game.entities.sign'
)

.requires(
    
    'impact.entity'
)
.defines(function(){
    
		EntitySign = ig.Entity.extend({
		    size: {x: 16, y: 16},
		    type: ig.Entity.TYPE.B,
		    //message: 'This is a sign.',
		    //name: 'sign',
		    animSheet: new ig.AnimationSheet( 'media/entity-icons.png', 16, 16 ),
		    
		    init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
                        // add the animations
                        this.addAnim( 'weltmeister', 0.1, [3] );
                        this.currentAnim = this.anims.weltmeister;
		    },
		    
		    update: function() {
			// IMPORANT! DON'T TOUCH!!
			this.parent();
		    }
		});
    
})