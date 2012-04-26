ig.module (
    
    'game.entities.sign'
)

.requires(
    
    'impact.entity'
)
.defines(function(){
    
		EntitySign = ig.Entity.extend({
		    size: {x: 16, y: 16},
		    type: ig.Entity.TYPE.A,
		    message: 'This is a sign.',
		    //name: 'sign',
		    checkAgainst: ig.Entity.TYPE.NONE,
		    collides: ig.Entity.COLLIDES.PASSIVE,
		    animSheet: new ig.AnimationSheet( 'media/entities/sign.png', 16, 16 ),
		    
		    init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			// add the animations
			this.addAnim( 'defaultState', 0.1, [0] );
			this.currentAnim = this.anims.defaultState;
		    },
		    
		    update: function() {
			// IMPORANT! DON'T TOUCH!!
			this.parent();
		    }
		});
    
})