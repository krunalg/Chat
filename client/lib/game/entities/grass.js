ig.module(
	'game.entities.grass'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityGrass = ig.Entity.extend({
	size: {x: 16, y: 16},
	
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(196, 255, 0, 0.7)',
	
	//target: null,
	wait: -1,
	waitTimer: null,
	canFire: true,
	
	//type: ig.Entity.TYPE.NONE,
	//checkAgainst: ig.Entity.TYPE.A,
	//collides: ig.Entity.COLLIDES.NEVER,
	
	
	init: function( x, y, settings ) {
		if( settings.checks ) {
			this.checkAgainst = ig.Entity.TYPE[settings.checks.toUpperCase()] || ig.Entity.TYPE.A;
			delete settings.check;
		}
		
		this.parent( x, y, settings );
		this.waitTimer = new ig.Timer();
	},
	
	
	check: function( other ) {
		/*if( this.canFire && this.waitTimer.delta() >= 0 ) {
			if( typeof(this.target) == 'object' ) {
				for( var t in this.target ) {
					var ent = ig.game.getEntityByName( this.target[t] );
					if( ent && typeof(ent.triggeredBy) == 'function' ) {
						ent.triggeredBy( other, this );
					}
				}
			}
			
			if( this.wait == -1 ) {
				this.canFire = false;
			}
			else {
				this.waitTimer.set( this.wait );
			}
		}*/
	},
	
	draw: function() {
		this.parent();

		var mapTilesize = ig.game.collisionMap.tilesize;

		ig.system.context.strokeStyle = 'rgba(255,0,0,0.5)';
		ig.system.context.lineWidth = 4.0;

		ig.system.context.beginPath();

		ig.system.context.moveTo(
		ig.system.getDrawPos(this.pos.x + this.size.x / 2 - ig.game.screen.x), ig.system.getDrawPos(this.pos.y + this.size.y / 2 - ig.game.screen.y));

		for (var i = 0; i < this.path.length; i++) {
		    ig.system.context.lineTo(
		    ig.system.getDrawPos(this.path[i].x + mapTilesize / 2 - ig.game.screen.x), ig.system.getDrawPos(this.path[i].y + mapTilesize / 2 - ig.game.screen.y));
		}

		ig.system.context.stroke();
		ig.system.context.closePath();
	},
	
	
	update: function(){}
});

});