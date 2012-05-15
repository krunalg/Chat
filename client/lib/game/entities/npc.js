ig.module (
    
    'game.entities.npc'
)

.requires(
    
    'game.ents.player'
)
.defines(function(){
   
    EntityNpc = EntityPlayer.extend({
	
	// recorded travel time of 9 units (144px)
	// in 2.100 seconds in VBA.
	// ie 144/2.1 = 68.571428 or ~69
	speed: 69,
	size: {x: 16, y: 16},
	type: ig.Entity.TYPE.A,
	animSheet: new ig.AnimationSheet( 'media/entity-icons.png', 16, 16 ),
	
	skin: 'fat',
	
	facing: "down",
	facingLast: "down",
	facingUpdated: false,
	isMove: false, // waiting for move key-press
	leftFoot: true, // used to alternate step animations
	destination: 0, // used for both x and y planes
	
	// NPC movement patterns
	movePattern: [], // no pattern by default
	moveNext: 0,
	moveTimer: null,
	moveDelay: 2, // delay in seconds between moves
	
	faceNextMove: function()
	{
	    this.facing = this.movePattern[this.moveNext];
	    this.moveAnimStop();
	},
	justMoved: function()
	{
	    this.moveNext++;
	    if(this.moveNext >= this.movePattern.length)
	    this.moveNext = 0; // cycle pattern
	},
	
	startMove: function()
	{
	    var newGrass = facingGrass(this);
	    if(newGrass) newGrass.play();
	    
	    this.isMove = true;
	    this.setMoveDestination();
	    this.moveAnimStart();
	},
	
	finishMove: function()
	{
	
	    // check if reached destination
	    if(this.destinationReached()) {
		
		// ensure player is at legal coordinates
		this.alignToGrid();
		
		// end move state
		this.isMove = false;
		this.vel.x = this.vel.y = 0;
		this.moveAnimStop();
		this.moveTimer.set(this.moveDelay);
	
	    }
	    // continue to destination
	    else
	    {
		this.move(this);
	    }  
	},
	
	init: function( x, y, settings ) {
	    this.parent( x, y, settings );
	    
	    this.moveTimer = new ig.Timer();
	    this.moveTimer.set(Math.random()*3); // desync NPC's from each other
	    
	    if(this.behaviour=='a')
	    {
		this.movePattern = ['up','down','up','right','down','down',
			       'left','left','left','right','right',
			       'left','up','right'];
	    }
	    else if(this.behaviour=='b')
	    {
		this.movePattern = ['down','left','right',
			       'left','right','up'];
	    }
	    
	    // weltmeister icon
	    this.addAnim( 'weltmeister', 0.1, [1] );
	    this.currentAnim = this.anims.weltmeister;
	},
	
	ready: function()
	{
	    this.offset = { x: 0, y: 16 };
	    
	    this.animSheet = new ig.AnimationSheet( 'media/people/rs.fat.png', 16, 32 );
	    
	    this.reskin();
	    
	    // create a name entity to follow this one
	    ig.game.spawnEntity(
		EntityName,
		this.pos.x,
		this.pos.y,
		{ follow: this.name, color: 'green' }
	    );
	},
	
	reskin: function()
	{
	    if(this.skin)
	    {
		switch(this.skin)
		{
		    // kind of like enum
		    case 'fat':
		    case 'kid':
		    case 'hat':
		    case 'labgeek':
			this.animSheet = new ig.AnimationSheet( 'media/people/rs.' + this.skin + '.png', 16, 32 );
			break;
		}
		// add the animations
		var walkRate = 0.13125;
		this.addAnim( 'walkUpA', walkRate, [2,0,0] );
		this.addAnim( 'walkUpB', walkRate, [1,0,0] );
		this.addAnim( 'walkDownA', walkRate, [8,6,6] );
		this.addAnim( 'walkDownB', walkRate, [7,6,6] );
		this.addAnim( 'walkLeftA', walkRate, [5,3,3] );
		this.addAnim( 'walkLeftB', walkRate, [4,3,3] );
		this.addAnim( 'walkRightA', walkRate, [5,3,3] );
		this.addAnim( 'walkRightB', walkRate, [4,3,3] );
		this.addAnim( 'idleup', 0.1, [0] );
		this.addAnim( 'idledown', 0.1, [6] );
		this.addAnim( 'idleleft', 0.1, [3] );
		this.addAnim( 'idleright', 0.1, [3] );
		// flip right-facing animations
		this.anims.walkRightA.flip.x = true;
		this.anims.walkRightB.flip.x = true;
		this.anims.idleright.flip.x = true;
		// set initial animation
		this.currentAnim = this.anims.idledown;
	    }
	},
	
	draw: function()
	{
	    this.parent();
	},
	
	update: function() {
	    
	    this.zIndex = this.pos.y + 1;
	    
	    this.parent();
	    
	    if(this.isMove)
	    {
		this.finishMove(this);
	    }
	    else
	    {
		if(this.moveTimer.delta()>=0)
		{
		    this.faceNextMove();
		    if(canMove(this))
		    {
			this.startMove();
			this.justMoved();
		    }
		}
	    }

		
	}
    });

    
})