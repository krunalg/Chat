ig.module(

'game.entities.non-weltmeister.player')

.requires(

'impact.entity')

.defines(function() {

	EntityPlayer = ig.Entity.extend({

		//  vvvvvvv           vvvvvvvaaaaaaaaaaaaa  rrrrr   rrrrrrrrr       ssssssssss   
		//   v:::::v         v:::::v a::::::::::::a r::::rrr:::::::::r    ss::::::::::s  
		//    v:::::v       v:::::v  aaaaaaaaa:::::ar:::::::::::::::::r ss:::::::::::::s 
		//     v:::::v     v:::::v            a::::arr::::::rrrrr::::::rs::::::ssss:::::s
		//      v:::::v   v:::::v      aaaaaaa:::::a r:::::r     r:::::r s:::::s  ssssss 
		//       v:::::v v:::::v     aa::::::::::::a r:::::r     rrrrrrr   s::::::s      
		//        v:::::v:::::v     a::::aaaa::::::a r:::::r                  s::::::s   
		//         v:::::::::v     a::::a    a:::::a r:::::r            ssssss   s:::::s 
		//          v:::::::v      a::::a    a:::::a r:::::r            s:::::ssss::::::s
		//           v:::::v       a:::::aaaa::::::a r:::::r            s::::::::::::::s 
		//            v:::v         a::::::::::aa:::ar:::::r             s:::::::::::ss  
		//             vvv           aaaaaaaaaa  aaaarrrrrrr              sssssssssss    
		//
		// Size of collision box.
		size: {
			x: 16,
			y: 16
		},

		// Layering priority relative to other entities.
		zPriority: 0,

		// Missleading name because NPC's are technically local also.
		isLocal: false,

		// True when over water; False on land.
		swimming: false,

		// Current speed of player.
		speed: null,

		// Speed when walking.
		walkSpeed: 69,

		// Speed when jumping.
		jumpSpeed: 69,

		// Speed when running.
		runSpeed: (138 * 8),

		// Speed when swimming.
		swimSpeed: 138,

		// Direction player is currently facing.
		facing: 'down',

		// Current movement state.
		moveState: 'idle',

		// Load Weltmeister icon resource.
		animSheet: new ig.AnimationSheet('media/entity-icons.png', 16, 16),

		// Used to send network move updates when move state changes.
		lastState: '',

		// Is the player moving or not.
		isMove: false,

		// Used to know when to move extra distance.
		isJump: false,

		// Used to alternate between step animations.
		leftFoot: true,

		// Movement destination (either on x or y axis).
		destination: 0,

		//    iiii                     iiii          tttt          
		//   i::::i                   i::::i      ttt:::t          
		//    iiii                     iiii       t:::::t          
		//                                        t:::::t          
		//  iiiiiiinnnn  nnnnnnnn    iiiiiiittttttt:::::ttttttt    
		//  i:::::in:::nn::::::::nn  i:::::it:::::::::::::::::t    
		//   i::::in::::::::::::::nn  i::::it:::::::::::::::::t    
		//   i::::inn:::::::::::::::n i::::itttttt:::::::tttttt    
		//   i::::i  n:::::nnnn:::::n i::::i      t:::::t          
		//   i::::i  n::::n    n::::n i::::i      t:::::t          
		//   i::::i  n::::n    n::::n i::::i      t:::::t          
		//   i::::i  n::::n    n::::n i::::i      t:::::t    tttttt
		//  i::::::i n::::n    n::::ni::::::i     t::::::tttt:::::t
		//  i::::::i n::::n    n::::ni::::::i     tt::::::::::::::t
		//  i::::::i n::::n    n::::ni::::::i       tt:::::::::::tt
		//  iiiiiiii nnnnnn    nnnnnniiiiiiii         ttttttttttt         
		//                                                      
		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set the players appearance.
			this.reskin(this.skin);

			// Set max velocity equal to run speed.
			this.maxVel.x = this.maxVel.y = this.runSpeed;
		},

		//                                                                                                                       
		//                                                   dddddddd                                                            
		//                                                   d::::::d                          tttt                              
		//                                                   d::::::d                       ttt:::t                              
		//                                                   d::::::d                       t:::::t                              
		//                                                   d:::::d                        t:::::t                              
		//  uuuuuu    uuuuuu ppppp   ppppppppp       ddddddddd:::::d   aaaaaaaaaaaaa  ttttttt:::::ttttttt        eeeeeeeeeeee    
		//  u::::u    u::::u p::::ppp:::::::::p    dd::::::::::::::d   a::::::::::::a t:::::::::::::::::t      ee::::::::::::ee  
		//  u::::u    u::::u p:::::::::::::::::p  d::::::::::::::::d   aaaaaaaaa:::::at:::::::::::::::::t     e::::::eeeee:::::ee
		//  u::::u    u::::u pp::::::ppppp::::::pd:::::::ddddd:::::d            a::::atttttt:::::::tttttt    e::::::e     e:::::e
		//  u::::u    u::::u  p:::::p     p:::::pd::::::d    d:::::d     aaaaaaa:::::a      t:::::t          e:::::::eeeee::::::e
		//  u::::u    u::::u  p:::::p     p:::::pd:::::d     d:::::d   aa::::::::::::a      t:::::t          e:::::::::::::::::e 
		//  u::::u    u::::u  p:::::p     p:::::pd:::::d     d:::::d  a::::aaaa::::::a      t:::::t          e::::::eeeeeeeeeee  
		//  u:::::uuuu:::::u  p:::::p    p::::::pd:::::d     d:::::d a::::a    a:::::a      t:::::t    tttttte:::::::e           
		//  u:::::::::::::::uup:::::ppppp:::::::pd::::::ddddd::::::dda::::a    a:::::a      t::::::tttt:::::te::::::::e          
		//   u:::::::::::::::up::::::::::::::::p  d:::::::::::::::::da:::::aaaa::::::a      tt::::::::::::::t e::::::::eeeeeeee  
		//    uu::::::::uu:::up::::::::::::::pp    d:::::::::ddd::::d a::::::::::aa:::a       tt:::::::::::tt  ee:::::::::::::e  
		//      uuuuuuuu  uuuup::::::pppppppp       ddddddddd   ddddd  aaaaaaaaaa  aaaa         ttttttttttt      eeeeeeeeeeeeee  
		//                    p:::::p                                                                                            
		//                    p:::::p                                                                                            
		//                   p:::::::p                                                                                           
		//                   p:::::::p                                                                                           
		//                   p:::::::p                                                                                           
		//                   ppppppppp   
		//                                                                                        
		update: function() {

			// Set zIndex dynamically using Y position and priority.
			this.zIndex = this.pos.y + this.zPriority;

			// Call parent.
			this.parent();
		},

		//                                                                                                                                                                           
		//                                                                                                                                                                           
		//                                                   tttt      TTTTTTTTTTTTTTTTTTTTTTT  iiii  lllllll                   PPPPPPPPPPPPPPPPP                                    
		//                                                ttt:::t      T:::::::::::::::::::::T i::::i l:::::l                   P::::::::::::::::P                                   
		//                                                t:::::t      T:::::::::::::::::::::T  iiii  l:::::l                   P::::::PPPPPP:::::P                                  
		//                                                t:::::t      T:::::TT:::::::TT:::::T        l:::::l                   PP:::::P     P:::::P                                 
		//     ggggggggg   ggggg    eeeeeeeeeeee    ttttttt:::::tttttttTTTTTT  T:::::T  TTTTTTiiiiiii  l::::l     eeeeeeeeeeee    P::::P     P:::::P  ooooooooooo       ssssssssss   
		//    g:::::::::ggg::::g  ee::::::::::::ee  t:::::::::::::::::t        T:::::T        i:::::i  l::::l   ee::::::::::::ee  P::::P     P:::::Poo:::::::::::oo   ss::::::::::s  
		//   g:::::::::::::::::g e::::::eeeee:::::eet:::::::::::::::::t        T:::::T         i::::i  l::::l  e::::::eeeee:::::eeP::::PPPPPP:::::Po:::::::::::::::oss:::::::::::::s 
		//  g::::::ggggg::::::gge::::::e     e:::::etttttt:::::::tttttt        T:::::T         i::::i  l::::l e::::::e     e:::::eP:::::::::::::PP o:::::ooooo:::::os::::::ssss:::::s
		//  g:::::g     g:::::g e:::::::eeeee::::::e      t:::::t              T:::::T         i::::i  l::::l e:::::::eeeee::::::eP::::PPPPPPPPP   o::::o     o::::o s:::::s  ssssss 
		//  g:::::g     g:::::g e:::::::::::::::::e       t:::::t              T:::::T         i::::i  l::::l e:::::::::::::::::e P::::P           o::::o     o::::o   s::::::s      
		//  g:::::g     g:::::g e::::::eeeeeeeeeee        t:::::t              T:::::T         i::::i  l::::l e::::::eeeeeeeeeee  P::::P           o::::o     o::::o      s::::::s   
		//  g::::::g    g:::::g e:::::::e                 t:::::t    tttttt    T:::::T         i::::i  l::::l e:::::::e           P::::P           o::::o     o::::ossssss   s:::::s 
		//  g:::::::ggggg:::::g e::::::::e                t::::::tttt:::::t  TT:::::::TT      i::::::il::::::le::::::::e        PP::::::PP         o:::::ooooo:::::os:::::ssss::::::s
		//   g::::::::::::::::g  e::::::::eeeeeeee        tt::::::::::::::t  T:::::::::T      i::::::il::::::l e::::::::eeeeeeeeP::::::::P         o:::::::::::::::os::::::::::::::s 
		//    gg::::::::::::::g   ee:::::::::::::e          tt:::::::::::tt  T:::::::::T      i::::::il::::::l  ee:::::::::::::eP::::::::P          oo:::::::::::oo  s:::::::::::ss  
		//      gggggggg::::::g     eeeeeeeeeeeeee            ttttttttttt    TTTTTTTTTTT      iiiiiiiillllllll    eeeeeeeeeeeeeePPPPPPPPPP            ooooooooooo     sssssssssss    
		//              g:::::g                                                                                                                                                      
		//  gggggg      g:::::g                                                                                                                                                      
		//  g:::::gg   gg:::::g                                                                                                                                                      
		//   g::::::ggg:::::::g                                                                                                                                                      
		//    gg:::::::::::::g                                                                                                                                                       
		//      ggg::::::ggg                                                                                                                                                         
		//         gggggg                                                                                                                                                            
		/*
		 * Calculate and returns an object containing the x and y position of a tile
		 * relative to a given X and Y position.
		 *
		 * @param  x 		 integer X origin in pixels.
		 * @param  y         integer Y origin in pixels.
		 * @param  direction string  One of the following: up, right, down, left.
		 * @param  distance  integer Number of tiles from source position.
		 * @return           object  with two properties, x and y, pixel coordinates.
		 */
		getTilePos: function(x, y, direction, distance) {

			// Start offset off at zero.
			var offsetX = offsetY = 0;

			// Get the map tilesize.
			var tilesize = ig.game.collisionMap.tilesize;

			// Update offset based on direction.
			switch (direction) {
			case 'left':
				offsetX--;
				break;
			case 'right':
				offsetX++;
				break;
			case 'up':
				offsetY--;
				break;
			case 'down':
				offsetY++;
				break;
			}

			// Create JavaScript object.
			var position = new Object();

			// Set X coordinate.
			position.x = x + (offsetX * tilesize * distance);

			// Set Y coordinate.
			position.y = y + (offsetY * tilesize * distance);

			// Return new position.
			return position;
		},

		//                                                                                                                                                                                      
		//                                                                                                                                                                                      
		//                                                   tttt      TTTTTTTTTTTTTTTTTTTTTTT  iiii  lllllll                                        iiii                                       
		//                                                ttt:::t      T:::::::::::::::::::::T i::::i l:::::l                                       i::::i                                      
		//                                                t:::::t      T:::::::::::::::::::::T  iiii  l:::::l                                        iiii                                       
		//                                                t:::::t      T:::::TT:::::::TT:::::T        l:::::l                                                                                   
		//     ggggggggg   ggggg    eeeeeeeeeeee    ttttttt:::::tttttttTTTTTT  T:::::T  TTTTTTiiiiiii  l::::l     eeeeeeeeeeee        ssssssssss   iiiiiii zzzzzzzzzzzzzzzzz    eeeeeeeeeeee    
		//    g:::::::::ggg::::g  ee::::::::::::ee  t:::::::::::::::::t        T:::::T        i:::::i  l::::l   ee::::::::::::ee    ss::::::::::s  i:::::i z:::::::::::::::z  ee::::::::::::ee  
		//   g:::::::::::::::::g e::::::eeeee:::::eet:::::::::::::::::t        T:::::T         i::::i  l::::l  e::::::eeeee:::::eess:::::::::::::s  i::::i z::::::::::::::z  e::::::eeeee:::::ee
		//  g::::::ggggg::::::gge::::::e     e:::::etttttt:::::::tttttt        T:::::T         i::::i  l::::l e::::::e     e:::::es::::::ssss:::::s i::::i zzzzzzzz::::::z  e::::::e     e:::::e
		//  g:::::g     g:::::g e:::::::eeeee::::::e      t:::::t              T:::::T         i::::i  l::::l e:::::::eeeee::::::e s:::::s  ssssss  i::::i       z::::::z   e:::::::eeeee::::::e
		//  g:::::g     g:::::g e:::::::::::::::::e       t:::::t              T:::::T         i::::i  l::::l e:::::::::::::::::e    s::::::s       i::::i      z::::::z    e:::::::::::::::::e 
		//  g:::::g     g:::::g e::::::eeeeeeeeeee        t:::::t              T:::::T         i::::i  l::::l e::::::eeeeeeeeeee        s::::::s    i::::i     z::::::z     e::::::eeeeeeeeeee  
		//  g::::::g    g:::::g e:::::::e                 t:::::t    tttttt    T:::::T         i::::i  l::::l e:::::::e           ssssss   s:::::s  i::::i    z::::::z      e:::::::e           
		//  g:::::::ggggg:::::g e::::::::e                t::::::tttt:::::t  TT:::::::TT      i::::::il::::::le::::::::e          s:::::ssss::::::si::::::i  z::::::zzzzzzzze::::::::e          
		//   g::::::::::::::::g  e::::::::eeeeeeee        tt::::::::::::::t  T:::::::::T      i::::::il::::::l e::::::::eeeeeeee  s::::::::::::::s i::::::i z::::::::::::::z e::::::::eeeeeeee  
		//    gg::::::::::::::g   ee:::::::::::::e          tt:::::::::::tt  T:::::::::T      i::::::il::::::l  ee:::::::::::::e   s:::::::::::ss  i::::::iz:::::::::::::::z  ee:::::::::::::e  
		//      gggggggg::::::g     eeeeeeeeeeeeee            ttttttttttt    TTTTTTTTTTT      iiiiiiiillllllll    eeeeeeeeeeeeee    sssssssssss    iiiiiiiizzzzzzzzzzzzzzzzz    eeeeeeeeeeeeee  
		//              g:::::g                                                                                                                                                                 
		//  gggggg      g:::::g                                                                                                                                                                 
		//  g:::::gg   gg:::::g                                                                                                                                                                 
		//   g::::::ggg:::::::g                                                                                                                                                                 
		//    gg:::::::::::::g                                                                                                                                                                  
		//      ggg::::::ggg                                                                                                                                                                    
		//         gggggg                                                                                                                                                                       
		/*
		 * Returns the game tilesize.
		 *
		 * @return integer pixel size of game tiles.
		 */
		getTilesize: function() {

			// Get tilesize from collisionMap.
			var tilesize = ig.game.collisionMap.tilesize;

			// Return tilesize.
			return tilesize;
		},

		//                                                tttt          MMMMMMMM               MMMMMMMM                                                           SSSSSSSSSSSSSSS      tttt                                    tttt                              
		//                                             ttt:::t          M:::::::M             M:::::::M                                                         SS:::::::::::::::S  ttt:::t                                 ttt:::t                              
		//                                             t:::::t          M::::::::M           M::::::::M                                                        S:::::SSSSSS::::::S  t:::::t                                 t:::::t                              
		//                                             t:::::t          M:::::::::M         M:::::::::M                                                        S:::::S     SSSSSSS  t:::::t                                 t:::::t                              
		//      ssssssssss       eeeeeeeeeeee    ttttttt:::::ttttttt    M::::::::::M       M::::::::::M   ooooooooooo vvvvvvv           vvvvvvv eeeeeeeeeeee   S:::::S        ttttttt:::::ttttttt      aaaaaaaaaaaaa  ttttttt:::::ttttttt        eeeeeeeeeeee    
		//    ss::::::::::s    ee::::::::::::ee  t:::::::::::::::::t    M:::::::::::M     M:::::::::::M oo:::::::::::oov:::::v         v:::::vee::::::::::::ee S:::::S        t:::::::::::::::::t      a::::::::::::a t:::::::::::::::::t      ee::::::::::::ee  
		//  ss:::::::::::::s  e::::::eeeee:::::eet:::::::::::::::::t    M:::::::M::::M   M::::M:::::::Mo:::::::::::::::ov:::::v       v:::::ve::::::eeeee:::::eeS::::SSSS     t:::::::::::::::::t      aaaaaaaaa:::::at:::::::::::::::::t     e::::::eeeee:::::ee
		//  s::::::ssss:::::se::::::e     e:::::etttttt:::::::tttttt    M::::::M M::::M M::::M M::::::Mo:::::ooooo:::::o v:::::v     v:::::ve::::::e     e:::::e SS::::::SSSSStttttt:::::::tttttt               a::::atttttt:::::::tttttt    e::::::e     e:::::e
		//   s:::::s  ssssss e:::::::eeeee::::::e      t:::::t          M::::::M  M::::M::::M  M::::::Mo::::o     o::::o  v:::::v   v:::::v e:::::::eeeee::::::e   SSS::::::::SS    t:::::t              aaaaaaa:::::a      t:::::t          e:::::::eeeee::::::e
		//     s::::::s      e:::::::::::::::::e       t:::::t          M::::::M   M:::::::M   M::::::Mo::::o     o::::o   v:::::v v:::::v  e:::::::::::::::::e       SSSSSS::::S   t:::::t            aa::::::::::::a      t:::::t          e:::::::::::::::::e 
		//        s::::::s   e::::::eeeeeeeeeee        t:::::t          M::::::M    M:::::M    M::::::Mo::::o     o::::o    v:::::v:::::v   e::::::eeeeeeeeeee             S:::::S  t:::::t           a::::aaaa::::::a      t:::::t          e::::::eeeeeeeeeee  
		//  ssssss   s:::::s e:::::::e                 t:::::t    ttttttM::::::M     MMMMM     M::::::Mo::::o     o::::o     v:::::::::v    e:::::::e                      S:::::S  t:::::t    tttttta::::a    a:::::a      t:::::t    tttttte:::::::e           
		//  s:::::ssss::::::se::::::::e                t::::::tttt:::::tM::::::M               M::::::Mo:::::ooooo:::::o      v:::::::v     e::::::::e         SSSSSSS     S:::::S  t::::::tttt:::::ta::::a    a:::::a      t::::::tttt:::::te::::::::e          
		//  s::::::::::::::s  e::::::::eeeeeeee        tt::::::::::::::tM::::::M               M::::::Mo:::::::::::::::o       v:::::v       e::::::::eeeeeeee S::::::SSSSSS:::::S  tt::::::::::::::ta:::::aaaa::::::a      tt::::::::::::::t e::::::::eeeeeeee  
		//   s:::::::::::ss    ee:::::::::::::e          tt:::::::::::ttM::::::M               M::::::M oo:::::::::::oo         v:::v         ee:::::::::::::e S:::::::::::::::SS     tt:::::::::::tt a::::::::::aa:::a       tt:::::::::::tt  ee:::::::::::::e  
		//    sssssssssss        eeeeeeeeeeeeee            ttttttttttt  MMMMMMMM               MMMMMMMM   ooooooooooo            vvv            eeeeeeeeeeeeee  SSSSSSSSSSSSSSS         ttttttttttt    aaaaaaaaaa  aaaa         ttttttttttt      eeeeeeeeeeeeee  
		//
		/*
		 * Update player speed and move state.
		 *
		 * @param  state     string The current movement state of player.
		 * @return undefined
		 */
		setMoveState: function(state) {

			// Check that a speed value matches input.
			if (typeof this[state + 'Speed'] != 'undefined') {

				// Set player speed.
				this.speed = this[state + 'Speed'];

				// Update player movement state.
				this.moveState = state;

			}

			// Throw an error if unexpected input.
			else throw "No speed value set for for state: " + state;
		},

		//                                                                                                                    SSSSSSSSSSSSSSS                                         ffffffffffffffff  
		//                                                                                                                  SS:::::::::::::::S                                       f::::::::::::::::f 
		//                                                                                                                 S:::::SSSSSS::::::S                                      f::::::::::::::::::f
		//                                                                                                                 S:::::S     SSSSSSS                                      f::::::fffffff:::::f
		//      ssssssssss   ppppp   ppppppppp     aaaaaaaaaaaaawwwwwww           wwwww           wwwwwwwnnnn  nnnnnnnn    S:::::S            uuuuuu    uuuuuu rrrrr   rrrrrrrrr    f:::::f       ffffff
		//    ss::::::::::s  p::::ppp:::::::::p    a::::::::::::aw:::::w         w:::::w         w:::::w n:::nn::::::::nn  S:::::S            u::::u    u::::u r::::rrr:::::::::r   f:::::f             
		//  ss:::::::::::::s p:::::::::::::::::p   aaaaaaaaa:::::aw:::::w       w:::::::w       w:::::w  n::::::::::::::nn  S::::SSSS         u::::u    u::::u r:::::::::::::::::r f:::::::ffffff       
		//  s::::::ssss:::::spp::::::ppppp::::::p           a::::a w:::::w     w:::::::::w     w:::::w   nn:::::::::::::::n  SS::::::SSSSS    u::::u    u::::u rr::::::rrrrr::::::rf::::::::::::f       
		//   s:::::s  ssssss  p:::::p     p:::::p    aaaaaaa:::::a  w:::::w   w:::::w:::::w   w:::::w      n:::::nnnn:::::n    SSS::::::::SS  u::::u    u::::u  r:::::r     r:::::rf::::::::::::f       
		//     s::::::s       p:::::p     p:::::p  aa::::::::::::a   w:::::w w:::::w w:::::w w:::::w       n::::n    n::::n       SSSSSS::::S u::::u    u::::u  r:::::r     rrrrrrrf:::::::ffffff       
		//        s::::::s    p:::::p     p:::::p a::::aaaa::::::a    w:::::w:::::w   w:::::w:::::w        n::::n    n::::n            S:::::Su::::u    u::::u  r:::::r             f:::::f             
		//  ssssss   s:::::s  p:::::p    p::::::pa::::a    a:::::a     w:::::::::w     w:::::::::w         n::::n    n::::n            S:::::Su:::::uuuu:::::u  r:::::r             f:::::f             
		//  s:::::ssss::::::s p:::::ppppp:::::::pa::::a    a:::::a      w:::::::w       w:::::::w          n::::n    n::::nSSSSSSS     S:::::Su:::::::::::::::uur:::::r            f:::::::f            
		//  s::::::::::::::s  p::::::::::::::::p a:::::aaaa::::::a       w:::::w         w:::::w           n::::n    n::::nS::::::SSSSSS:::::S u:::::::::::::::ur:::::r            f:::::::f            
		//   s:::::::::::ss   p::::::::::::::pp   a::::::::::aa:::a       w:::w           w:::w            n::::n    n::::nS:::::::::::::::SS   uu::::::::uu:::ur:::::r            f:::::::f            
		//    sssssssssss     p::::::pppppppp      aaaaaaaaaa  aaaa        www             www             nnnnnn    nnnnnn SSSSSSSSSSSSSSS       uuuuuuuu  uuuurrrrrrr            fffffffff            
		//                    p:::::p                                                                                                                                                                   
		//                    p:::::p                                                                                                                                                                   
		//                   p:::::::p                                                                                                                                                                  
		//                   p:::::::p                                                                                                                                                                  
		//                   p:::::::p                                                                                                                                                                  
		//                   ppppppppp                                                                                                                                                                  
		//
		// Spawns a surf entity on the tile currently faced.
		spawnSurf: function() {

			// Get position of faced tile.
			var position = this.getTilePos(this.pos.x, this.pos.y, this.facing, 1);

			// Player entity reference to pass into surf entity.
			var player = this;

			// Spawn a surf entity.
			ig.game.spawnEntity(EntitySurf, position.x, position.y, {

				// Use players faced direction.
				facing: this.facing,

				// Pass a reference of the player.
				follow: player
			});
		},

		//           tttt                                                      SSSSSSSSSSSSSSS                                                                                                iiii                                               GGGGGGGGGGGGG                                                                     
		//        ttt:::t                                                    SS:::::::::::::::S                                                                                              i::::i                                           GGG::::::::::::G                                                                     
		//        t:::::t                                                   S:::::SSSSSS::::::S                                                                                               iiii                                          GG:::::::::::::::G                                                                     
		//        t:::::t                                                   S:::::S     SSSSSSS                                                                                                                                            G:::::GGGGGGGG::::G                                                                     
		//  ttttttt:::::ttttttt   rrrrr   rrrrrrrrryyyyyyy           yyyyyyyS:::::S           ppppp   ppppppppp     aaaaaaaaaaaaawwwwwww           wwwww           wwwwwwwnnnn  nnnnnnnn    iiiiiiinnnn  nnnnnnnn       ggggggggg   ggggg G:::::G       GGGGGGrrrrr   rrrrrrrrr   aaaaaaaaaaaaa      ssssssssss       ssssssssss   
		//  t:::::::::::::::::t   r::::rrr:::::::::ry:::::y         y:::::y S:::::S           p::::ppp:::::::::p    a::::::::::::aw:::::w         w:::::w         w:::::w n:::nn::::::::nn  i:::::in:::nn::::::::nn    g:::::::::ggg::::gG:::::G              r::::rrr:::::::::r  a::::::::::::a   ss::::::::::s    ss::::::::::s  
		//  t:::::::::::::::::t   r:::::::::::::::::ry:::::y       y:::::y   S::::SSSS        p:::::::::::::::::p   aaaaaaaaa:::::aw:::::w       w:::::::w       w:::::w  n::::::::::::::nn  i::::in::::::::::::::nn  g:::::::::::::::::gG:::::G              r:::::::::::::::::r aaaaaaaaa:::::ass:::::::::::::s ss:::::::::::::s 
		//  tttttt:::::::tttttt   rr::::::rrrrr::::::ry:::::y     y:::::y     SS::::::SSSSS   pp::::::ppppp::::::p           a::::a w:::::w     w:::::::::w     w:::::w   nn:::::::::::::::n i::::inn:::::::::::::::ng::::::ggggg::::::ggG:::::G    GGGGGGGGGGrr::::::rrrrr::::::r         a::::as::::::ssss:::::ss::::::ssss:::::s
		//        t:::::t          r:::::r     r:::::r y:::::y   y:::::y        SSS::::::::SS  p:::::p     p:::::p    aaaaaaa:::::a  w:::::w   w:::::w:::::w   w:::::w      n:::::nnnn:::::n i::::i  n:::::nnnn:::::ng:::::g     g:::::g G:::::G    G::::::::G r:::::r     r:::::r  aaaaaaa:::::a s:::::s  ssssss  s:::::s  ssssss 
		//        t:::::t          r:::::r     rrrrrrr  y:::::y y:::::y            SSSSSS::::S p:::::p     p:::::p  aa::::::::::::a   w:::::w w:::::w w:::::w w:::::w       n::::n    n::::n i::::i  n::::n    n::::ng:::::g     g:::::g G:::::G    GGGGG::::G r:::::r     rrrrrrraa::::::::::::a   s::::::s         s::::::s      
		//        t:::::t          r:::::r               y:::::y:::::y                  S:::::Sp:::::p     p:::::p a::::aaaa::::::a    w:::::w:::::w   w:::::w:::::w        n::::n    n::::n i::::i  n::::n    n::::ng:::::g     g:::::g G:::::G        G::::G r:::::r           a::::aaaa::::::a      s::::::s         s::::::s   
		//        t:::::t    ttttttr:::::r                y:::::::::y                   S:::::Sp:::::p    p::::::pa::::a    a:::::a     w:::::::::w     w:::::::::w         n::::n    n::::n i::::i  n::::n    n::::ng::::::g    g:::::g  G:::::G       G::::G r:::::r          a::::a    a:::::assssss   s:::::s ssssss   s:::::s 
		//        t::::::tttt:::::tr:::::r                 y:::::::y        SSSSSSS     S:::::Sp:::::ppppp:::::::pa::::a    a:::::a      w:::::::w       w:::::::w          n::::n    n::::ni::::::i n::::n    n::::ng:::::::ggggg:::::g   G:::::GGGGGGGG::::G r:::::r          a::::a    a:::::as:::::ssss::::::ss:::::ssss::::::s
		//        tt::::::::::::::tr:::::r                  y:::::y         S::::::SSSSSS:::::Sp::::::::::::::::p a:::::aaaa::::::a       w:::::w         w:::::w           n::::n    n::::ni::::::i n::::n    n::::n g::::::::::::::::g    GG:::::::::::::::G r:::::r          a:::::aaaa::::::as::::::::::::::s s::::::::::::::s 
		//          tt:::::::::::ttr:::::r                 y:::::y          S:::::::::::::::SS p::::::::::::::pp   a::::::::::aa:::a       w:::w           w:::w            n::::n    n::::ni::::::i n::::n    n::::n  gg::::::::::::::g      GGG::::::GGG:::G r:::::r           a::::::::::aa:::as:::::::::::ss   s:::::::::::ss  
		//            ttttttttttt  rrrrrrr                y:::::y            SSSSSSSSSSSSSSS   p::::::pppppppp      aaaaaaaaaa  aaaa        www             www             nnnnnn    nnnnnniiiiiiii nnnnnn    nnnnnn    gggggggg::::::g         GGGGGG   GGGG rrrrrrr            aaaaaaaaaa  aaaa sssssssssss      sssssssssss    
		//                                               y:::::y                               p:::::p                                                                                                                           g:::::g                                                                                           
		//                                              y:::::y                                p:::::p                                                                                                               gggggg      g:::::g                                                                                           
		//                                             y:::::y                                p:::::::p                                                                                                              g:::::gg   gg:::::g                                                                                           
		//                                            y:::::y                                 p:::::::p                                                                                                               g::::::ggg:::::::g                                                                                           
		//                                           yyyyyyy                                  p:::::::p                                                                                                                gg:::::::::::::g                                                                                            
		//                                                                                    ppppppppp                                                                                                                  ggg::::::ggg                                                                                              
		//                                                                                                                                                                                                                  gggggg                                                                                                 
		/*
		 * Return the grass entity (if it exists) at the tile faced by the player. If it
		 * does not exist and the tile is of grass type, spawn a grass entity and return it.
		 *
		 * @return EntityGrass if one exists or is spawned, else return undefined.
		 */
		trySpawningGrass: function() {

			// Get position of faced tile.
			var position = this.getTilePos(this.pos.x, this.pos.y, this.facing, 1);

			// Get map tilesize.
			var tilesize = ig.game.collisionMap.tilesize;

			// Do not spawn a grass entity if one already exists there.
			var allGrass = ig.game.getEntitiesByType(EntityGrass);
			if (allGrass) {
				for (var i = 0; i < allGrass.length; i++) {
					if (allGrass[i].pos.x == position.x && allGrass[i].pos.y == position.y && !allGrass[i]._killed) {

						// Save from being killed if marked for death.
						if (allGrass[i].markedForDeath) allGrass[i].revive();

						// Return grass entity.
						return allGrass[i];
					}
				}
			}

			// Check if the faced tile is grass.
			if (ig.game.isSpecialTile(
			(position.x / tilesize), (position.y / tilesize), specialTiles['grass'], 'lower')) {

				// Debug message.
				console.debug("Creating grass entity at: " + position.x + "," + position.y);

				// Spawn new grass entity and return it.
				return ig.game.spawnEntity(EntityGrass, position.x, position.y, {});
			}
		},

		//                                                                                                                     
		//                                                                                                                     
		//    iiii                           GGGGGGGGGGGGG                                                                     
		//   i::::i                       GGG::::::::::::G                                                                     
		//    iiii                      GG:::::::::::::::G                                                                     
		//                             G:::::GGGGGGGG::::G                                                                     
		//  iiiiiiinnnn  nnnnnnnn     G:::::G       GGGGGGrrrrr   rrrrrrrrr   aaaaaaaaaaaaa      ssssssssss       ssssssssss   
		//  i:::::in:::nn::::::::nn  G:::::G              r::::rrr:::::::::r  a::::::::::::a   ss::::::::::s    ss::::::::::s  
		//   i::::in::::::::::::::nn G:::::G              r:::::::::::::::::r aaaaaaaaa:::::ass:::::::::::::s ss:::::::::::::s 
		//   i::::inn:::::::::::::::nG:::::G    GGGGGGGGGGrr::::::rrrrr::::::r         a::::as::::::ssss:::::ss::::::ssss:::::s
		//   i::::i  n:::::nnnn:::::nG:::::G    G::::::::G r:::::r     r:::::r  aaaaaaa:::::a s:::::s  ssssss  s:::::s  ssssss 
		//   i::::i  n::::n    n::::nG:::::G    GGGGG::::G r:::::r     rrrrrrraa::::::::::::a   s::::::s         s::::::s      
		//   i::::i  n::::n    n::::nG:::::G        G::::G r:::::r           a::::aaaa::::::a      s::::::s         s::::::s   
		//   i::::i  n::::n    n::::n G:::::G       G::::G r:::::r          a::::a    a:::::assssss   s:::::s ssssss   s:::::s 
		//  i::::::i n::::n    n::::n  G:::::GGGGGGGG::::G r:::::r          a::::a    a:::::as:::::ssss::::::ss:::::ssss::::::s
		//  i::::::i n::::n    n::::n   GG:::::::::::::::G r:::::r          a:::::aaaa::::::as::::::::::::::s s::::::::::::::s 
		//  i::::::i n::::n    n::::n     GGG::::::GGG:::G r:::::r           a::::::::::aa:::as:::::::::::ss   s:::::::::::ss  
		//  iiiiiiii nnnnnn    nnnnnn        GGGGGG   GGGG rrrrrrr            aaaaaaaaaa  aaaa sssssssssss      sssssssssss    
		//                                                                                                                     
		inGrass: function()
		/*
		 * Return the grass entity located at the tile where the player is.
		 *
		 * @return EntityGrass if one exists, else return undefined.
		 */
		{
			// Search all grass entities for one that shares the players position.
			var allGrass = ig.game.getEntitiesByType(EntityGrass);
			if (allGrass) {
				for (var i = 0; i < allGrass.length; i++) {

					// Compare grass entity position to the player's.
					if (allGrass[i].pos.x == this.pos.x && allGrass[i].pos.y == this.pos.y) {

						// Return matching grass entity.
						return allGrass[i];
					}
				}
			}
		},

		//                                                                                                                                                                                     dddddddd                                                        
		//                                                                                                                    SSSSSSSSSSSSSSS hhhhhhh                                          d::::::d                                                        
		//                                                                                                                  SS:::::::::::::::Sh:::::h                                          d::::::d                                                        
		//                                                                                                                 S:::::SSSSSS::::::Sh:::::h                                          d::::::d                                                        
		//                                                                                                                 S:::::S     SSSSSSSh:::::h                                          d:::::d                                                         
		//      ssssssssss   ppppp   ppppppppp     aaaaaaaaaaaaawwwwwww           wwwww           wwwwwwwnnnn  nnnnnnnn    S:::::S             h::::h hhhhh         aaaaaaaaaaaaa      ddddddddd:::::d    ooooooooooo wwwwwww           wwwww           wwwwwww
		//    ss::::::::::s  p::::ppp:::::::::p    a::::::::::::aw:::::w         w:::::w         w:::::w n:::nn::::::::nn  S:::::S             h::::hh:::::hhh      a::::::::::::a   dd::::::::::::::d  oo:::::::::::oow:::::w         w:::::w         w:::::w 
		//  ss:::::::::::::s p:::::::::::::::::p   aaaaaaaaa:::::aw:::::w       w:::::::w       w:::::w  n::::::::::::::nn  S::::SSSS          h::::::::::::::hh    aaaaaaaaa:::::a d::::::::::::::::d o:::::::::::::::ow:::::w       w:::::::w       w:::::w  
		//  s::::::ssss:::::spp::::::ppppp::::::p           a::::a w:::::w     w:::::::::w     w:::::w   nn:::::::::::::::n  SS::::::SSSSS     h:::::::hhh::::::h            a::::ad:::::::ddddd:::::d o:::::ooooo:::::o w:::::w     w:::::::::w     w:::::w   
		//   s:::::s  ssssss  p:::::p     p:::::p    aaaaaaa:::::a  w:::::w   w:::::w:::::w   w:::::w      n:::::nnnn:::::n    SSS::::::::SS   h::::::h   h::::::h    aaaaaaa:::::ad::::::d    d:::::d o::::o     o::::o  w:::::w   w:::::w:::::w   w:::::w    
		//     s::::::s       p:::::p     p:::::p  aa::::::::::::a   w:::::w w:::::w w:::::w w:::::w       n::::n    n::::n       SSSSSS::::S  h:::::h     h:::::h  aa::::::::::::ad:::::d     d:::::d o::::o     o::::o   w:::::w w:::::w w:::::w w:::::w     
		//        s::::::s    p:::::p     p:::::p a::::aaaa::::::a    w:::::w:::::w   w:::::w:::::w        n::::n    n::::n            S:::::S h:::::h     h:::::h a::::aaaa::::::ad:::::d     d:::::d o::::o     o::::o    w:::::w:::::w   w:::::w:::::w      
		//  ssssss   s:::::s  p:::::p    p::::::pa::::a    a:::::a     w:::::::::w     w:::::::::w         n::::n    n::::n            S:::::S h:::::h     h:::::ha::::a    a:::::ad:::::d     d:::::d o::::o     o::::o     w:::::::::w     w:::::::::w       
		//  s:::::ssss::::::s p:::::ppppp:::::::pa::::a    a:::::a      w:::::::w       w:::::::w          n::::n    n::::nSSSSSSS     S:::::S h:::::h     h:::::ha::::a    a:::::ad::::::ddddd::::::ddo:::::ooooo:::::o      w:::::::w       w:::::::w        
		//  s::::::::::::::s  p::::::::::::::::p a:::::aaaa::::::a       w:::::w         w:::::w           n::::n    n::::nS::::::SSSSSS:::::S h:::::h     h:::::ha:::::aaaa::::::a d:::::::::::::::::do:::::::::::::::o       w:::::w         w:::::w         
		//   s:::::::::::ss   p::::::::::::::pp   a::::::::::aa:::a       w:::w           w:::w            n::::n    n::::nS:::::::::::::::SS  h:::::h     h:::::h a::::::::::aa:::a d:::::::::ddd::::d oo:::::::::::oo         w:::w           w:::w          
		//    sssssssssss     p::::::pppppppp      aaaaaaaaaa  aaaa        www             www             nnnnnn    nnnnnn SSSSSSSSSSSSSSS    hhhhhhh     hhhhhhh  aaaaaaaaaa  aaaa  ddddddddd   ddddd   ooooooooooo            www             www           
		//                    p:::::p                                                                                                                                                                                                                          
		//                    p:::::p                                                                                                                                                                                                                          
		//                   p:::::::p                                                                                                                                                                                                                         
		//                   p:::::::p                                                                                                                                                                                                                         
		//                   p:::::::p                                                                                                                                                                                                                         
		//                   ppppppppp                                                                                                                                                                                                                         
		//                                                                                                                                                                                                                                                     
		/*
		 * Spawn a jump entity (shadow) at the players position.
		 *
		 * @return EntityJump
		 */
		spawnShadow: function() {

			// Create and return a jump entity.
			return ig.game.spawnEntity(EntityJump, this.pos.x, this.pos.y, {

				// Face same direction as player.
				direction: this.facing
			});
		},

		//                                                         MMMMMMMM               MMMMMMMM                                                         
		//                                                         M:::::::M             M:::::::M                                                         
		//                                                         M::::::::M           M::::::::M                                                         
		//                                                         M:::::::::M         M:::::::::M                                                         
		//      cccccccccccccccc  aaaaaaaaaaaaa  nnnn  nnnnnnnn    M::::::::::M       M::::::::::M   ooooooooooo vvvvvvv           vvvvvvv eeeeeeeeeeee    
		//    cc:::::::::::::::c  a::::::::::::a n:::nn::::::::nn  M:::::::::::M     M:::::::::::M oo:::::::::::oov:::::v         v:::::vee::::::::::::ee  
		//   c:::::::::::::::::c  aaaaaaaaa:::::an::::::::::::::nn M:::::::M::::M   M::::M:::::::Mo:::::::::::::::ov:::::v       v:::::ve::::::eeeee:::::ee
		//  c:::::::cccccc:::::c           a::::ann:::::::::::::::nM::::::M M::::M M::::M M::::::Mo:::::ooooo:::::o v:::::v     v:::::ve::::::e     e:::::e
		//  c::::::c     ccccccc    aaaaaaa:::::a  n:::::nnnn:::::nM::::::M  M::::M::::M  M::::::Mo::::o     o::::o  v:::::v   v:::::v e:::::::eeeee::::::e
		//  c:::::c               aa::::::::::::a  n::::n    n::::nM::::::M   M:::::::M   M::::::Mo::::o     o::::o   v:::::v v:::::v  e:::::::::::::::::e 
		//  c:::::c              a::::aaaa::::::a  n::::n    n::::nM::::::M    M:::::M    M::::::Mo::::o     o::::o    v:::::v:::::v   e::::::eeeeeeeeeee  
		//  c::::::c     ccccccca::::a    a:::::a  n::::n    n::::nM::::::M     MMMMM     M::::::Mo::::o     o::::o     v:::::::::v    e:::::::e           
		//  c:::::::cccccc:::::ca::::a    a:::::a  n::::n    n::::nM::::::M               M::::::Mo:::::ooooo:::::o      v:::::::v     e::::::::e          
		//   c:::::::::::::::::ca:::::aaaa::::::a  n::::n    n::::nM::::::M               M::::::Mo:::::::::::::::o       v:::::v       e::::::::eeeeeeee  
		//    cc:::::::::::::::c a::::::::::aa:::a n::::n    n::::nM::::::M               M::::::M oo:::::::::::oo         v:::v         ee:::::::::::::e  
		//      cccccccccccccccc  aaaaaaaaaa  aaaa nnnnnn    nnnnnnMMMMMMMM               MMMMMMMM   ooooooooooo            vvv            eeeeeeeeeeeeee  
		//                                                                                                                                                 
		/*
		 * Check if the player is allowed to move in the faced direction.
		 *
		 * @return boolean true if no collision, else false.
		 */
		canMove: function() {
			// Get position of faced tile.
			var position = this.getTilePos(this.pos.x, this.pos.y, this.facing, 1);

			var velocityX = velocityY = 0; // velocity
			switch (this.facing) {
			case 'left':
				velocityX = -1;
				break;
			case 'right':
				velocityX = 1;
				break;
			case 'up':
				velocityY = -1;
				break;
			case 'down':
				velocityY = 1;
				break;
			}

			// Check map for collision.
			var res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, velocityX, velocityY, this.size.x, this.size.y);

			// Did a collision occur?
			if (res.collision.x || res.collision.y) {

				// Collision occured.
				return false;
			}

			// Check for collision against an NPC.
			var npcs = ig.game.getEntitiesByType(EntityNpc);
			if (npcs) {
				for (var i = 0; i < npcs.length; i++) {
					if ((npcs[i].pos.x == position.x) && (npcs[i].pos.y == position.y)) {

						// Collision occured.
						return false;
					}
				}
			}

			// No collisions.
			return true;
		},

		//                                                                                                                                               
		//                                                                                                                                               
		//                                                            SSSSSSSSSSSSSSS                                      iiii                          
		//                                                          SS:::::::::::::::S                                    i::::i                         
		//                                                         S:::::SSSSSS::::::S                                     iiii                          
		//                                                         S:::::S     SSSSSSS                                                                   
		//      cccccccccccccccc  aaaaaaaaaaaaa  nnnn  nnnnnnnn    S:::::S      wwwwwww           wwwww           wwwwwwwiiiiiii    mmmmmmm    mmmmmmm   
		//    cc:::::::::::::::c  a::::::::::::a n:::nn::::::::nn  S:::::S       w:::::w         w:::::w         w:::::w i:::::i  mm:::::::m  m:::::::mm 
		//   c:::::::::::::::::c  aaaaaaaaa:::::an::::::::::::::nn  S::::SSSS     w:::::w       w:::::::w       w:::::w   i::::i m::::::::::mm::::::::::m
		//  c:::::::cccccc:::::c           a::::ann:::::::::::::::n  SS::::::SSSSS w:::::w     w:::::::::w     w:::::w    i::::i m::::::::::::::::::::::m
		//  c::::::c     ccccccc    aaaaaaa:::::a  n:::::nnnn:::::n    SSS::::::::SSw:::::w   w:::::w:::::w   w:::::w     i::::i m:::::mmm::::::mmm:::::m
		//  c:::::c               aa::::::::::::a  n::::n    n::::n       SSSSSS::::Sw:::::w w:::::w w:::::w w:::::w      i::::i m::::m   m::::m   m::::m
		//  c:::::c              a::::aaaa::::::a  n::::n    n::::n            S:::::Sw:::::w:::::w   w:::::w:::::w       i::::i m::::m   m::::m   m::::m
		//  c::::::c     ccccccca::::a    a:::::a  n::::n    n::::n            S:::::S w:::::::::w     w:::::::::w        i::::i m::::m   m::::m   m::::m
		//  c:::::::cccccc:::::ca::::a    a:::::a  n::::n    n::::nSSSSSSS     S:::::S  w:::::::w       w:::::::w        i::::::im::::m   m::::m   m::::m
		//   c:::::::::::::::::ca:::::aaaa::::::a  n::::n    n::::nS::::::SSSSSS:::::S   w:::::w         w:::::w         i::::::im::::m   m::::m   m::::m
		//    cc:::::::::::::::c a::::::::::aa:::a n::::n    n::::nS:::::::::::::::SS     w:::w           w:::w          i::::::im::::m   m::::m   m::::m
		//      cccccccccccccccc  aaaaaaaaaa  aaaa nnnnnn    nnnnnn SSSSSSSSSSSSSSS        www             www           iiiiiiiimmmmmm   mmmmmm   mmmmmm
		//                                                                                                                                               
		//                                                                                                                                               
		//                                                                                                                                               
		//                                                                                                                                               
		//                                                                                                                                               
		//                                                                                                                                               
		/*
		 * Check if the players faced tile is swimmable.
		 *
		 * @return boolean true if swimmable, else false.
		 */
		canSwim: function() {

			// Get position of faced tile.
			var position = this.getTilePos(this.pos.x, this.pos.y, this.facing, 1);

			// Get game tilesize.
			var tilesize = this.getTilesize();

			// Check if faced tile is of water type.
			if (ig.game.isSpecialTile((position.x / tilesize), (position.y / tilesize), specialTiles['water'], 'lower')) {

				// Faced tile is water.
				return true;
			}

			// Faced tile is not water.
			return false;
		},

		//                                                                   JJJJJJJJJJJ                                                            
		//                                                                   J:::::::::J                                                            
		//                                                                   J:::::::::J                                                            
		//                                                                   JJ:::::::JJ                                                            
		//      cccccccccccccccc  aaaaaaaaaaaaa  nnnn  nnnnnnnn                J:::::Juuuuuu    uuuuuu     mmmmmmm    mmmmmmm   ppppp   ppppppppp   
		//    cc:::::::::::::::c  a::::::::::::a n:::nn::::::::nn              J:::::Ju::::u    u::::u   mm:::::::m  m:::::::mm p::::ppp:::::::::p  
		//   c:::::::::::::::::c  aaaaaaaaa:::::an::::::::::::::nn             J:::::Ju::::u    u::::u  m::::::::::mm::::::::::mp:::::::::::::::::p 
		//  c:::::::cccccc:::::c           a::::ann:::::::::::::::n            J:::::ju::::u    u::::u  m::::::::::::::::::::::mpp::::::ppppp::::::p
		//  c::::::c     ccccccc    aaaaaaa:::::a  n:::::nnnn:::::n            J:::::Ju::::u    u::::u  m:::::mmm::::::mmm:::::m p:::::p     p:::::p
		//  c:::::c               aa::::::::::::a  n::::n    n::::nJJJJJJJ     J:::::Ju::::u    u::::u  m::::m   m::::m   m::::m p:::::p     p:::::p
		//  c:::::c              a::::aaaa::::::a  n::::n    n::::nJ:::::J     J:::::Ju::::u    u::::u  m::::m   m::::m   m::::m p:::::p     p:::::p
		//  c::::::c     ccccccca::::a    a:::::a  n::::n    n::::nJ::::::J   J::::::Ju:::::uuuu:::::u  m::::m   m::::m   m::::m p:::::p    p::::::p
		//  c:::::::cccccc:::::ca::::a    a:::::a  n::::n    n::::nJ:::::::JJJ:::::::Ju:::::::::::::::uum::::m   m::::m   m::::m p:::::ppppp:::::::p
		//   c:::::::::::::::::ca:::::aaaa::::::a  n::::n    n::::n JJ:::::::::::::JJ  u:::::::::::::::um::::m   m::::m   m::::m p::::::::::::::::p 
		//    cc:::::::::::::::c a::::::::::aa:::a n::::n    n::::n   JJ:::::::::JJ     uu::::::::uu:::um::::m   m::::m   m::::m p::::::::::::::pp  
		//      cccccccccccccccc  aaaaaaaaaa  aaaa nnnnnn    nnnnnn     JJJJJJJJJ         uuuuuuuu  uuuummmmmm   mmmmmm   mmmmmm p::::::pppppppp    
		//                                                                                                                       p:::::p            
		//                                                                                                                       p:::::p            
		//                                                                                                                      p:::::::p           
		//                                                                                                                      p:::::::p           
		//                                                                                                                      p:::::::p           
		//                                                                                                                      ppppppppp           
		//                                                                                                                                          
		/*
		 * Check if the players faced tile is jumpable.
		 *
		 * @return boolean true if jumpable, else false.
		 */
		canJump: function() {
			// Get position of faced tile.
			var position = this.getTilePos(this.pos.x, this.pos.y, this.facing, 1);

			// Get collision map.
			var collisionMap = ig.game.collisionMap;

			// Define Weltmeister jump tile values.
			switch (this.facing) {
			case 'left':
				var jumpTile = 45;
				break;
			case 'right':
				var jumpTile = 34;
				break;
			case 'up':
				var jumpTile = 12;
				break;
			case 'down':
				var jumpTile = 23;
				break;
			}

			// Check if tile is a jump tile.
			if (collisionMap.getTile(position.x, position.y) == jumpTile) {
				// Tile is jumpable.
				return true;
			}

			// Tile is not jumpable.
			return false;
		},

		//      ffffffffffffffff    iiii                     iiii                  hhhhhhh             MMMMMMMM               MMMMMMMM                                                         
		//     f::::::::::::::::f  i::::i                   i::::i                 h:::::h             M:::::::M             M:::::::M                                                         
		//    f::::::::::::::::::f  iiii                     iiii                  h:::::h             M::::::::M           M::::::::M                                                         
		//    f::::::fffffff:::::f                                                 h:::::h             M:::::::::M         M:::::::::M                                                         
		//    f:::::f       ffffffiiiiiiinnnn  nnnnnnnn    iiiiiii     ssssssssss   h::::h hhhhh       M::::::::::M       M::::::::::M   ooooooooooo vvvvvvv           vvvvvvv eeeeeeeeeeee    
		//    f:::::f             i:::::in:::nn::::::::nn  i:::::i   ss::::::::::s  h::::hh:::::hhh    M:::::::::::M     M:::::::::::M oo:::::::::::oov:::::v         v:::::vee::::::::::::ee  
		//   f:::::::ffffff        i::::in::::::::::::::nn  i::::i ss:::::::::::::s h::::::::::::::hh  M:::::::M::::M   M::::M:::::::Mo:::::::::::::::ov:::::v       v:::::ve::::::eeeee:::::ee
		//   f::::::::::::f        i::::inn:::::::::::::::n i::::i s::::::ssss:::::sh:::::::hhh::::::h M::::::M M::::M M::::M M::::::Mo:::::ooooo:::::o v:::::v     v:::::ve::::::e     e:::::e
		//   f::::::::::::f        i::::i  n:::::nnnn:::::n i::::i  s:::::s  ssssss h::::::h   h::::::hM::::::M  M::::M::::M  M::::::Mo::::o     o::::o  v:::::v   v:::::v e:::::::eeeee::::::e
		//   f:::::::ffffff        i::::i  n::::n    n::::n i::::i    s::::::s      h:::::h     h:::::hM::::::M   M:::::::M   M::::::Mo::::o     o::::o   v:::::v v:::::v  e:::::::::::::::::e 
		//    f:::::f              i::::i  n::::n    n::::n i::::i       s::::::s   h:::::h     h:::::hM::::::M    M:::::M    M::::::Mo::::o     o::::o    v:::::v:::::v   e::::::eeeeeeeeeee  
		//    f:::::f              i::::i  n::::n    n::::n i::::i ssssss   s:::::s h:::::h     h:::::hM::::::M     MMMMM     M::::::Mo::::o     o::::o     v:::::::::v    e:::::::e           
		//   f:::::::f            i::::::i n::::n    n::::ni::::::is:::::ssss::::::sh:::::h     h:::::hM::::::M               M::::::Mo:::::ooooo:::::o      v:::::::v     e::::::::e          
		//   f:::::::f            i::::::i n::::n    n::::ni::::::is::::::::::::::s h:::::h     h:::::hM::::::M               M::::::Mo:::::::::::::::o       v:::::v       e::::::::eeeeeeee  
		//   f:::::::f            i::::::i n::::n    n::::ni::::::i s:::::::::::ss  h:::::h     h:::::hM::::::M               M::::::M oo:::::::::::oo         v:::v         ee:::::::::::::e  
		//   fffffffff            iiiiiiii nnnnnn    nnnnnniiiiiiii  sssssssssss    hhhhhhh     hhhhhhhMMMMMMMM               MMMMMMMM   ooooooooooo            vvv            eeeeeeeeeeeeee  
		//                                                                                                                                                                                     
		/*
		 * Stops player if he has reached his destination or move him if he has not.
		 *
		 * @return undefined
		 */
		finishMove: function() {

			// Animate the players vertical offset to simulate jumping.
			if (this.isJump) {

				// Get how much time into the jump has elapsed.
				var jumpTime = this.jumpStart.delta();

				// This is a mess! Consider replacing this whole thing with tweens.
				// The number 16 is used irresponsibly and should be the players 
				// 'resting' y-offset.
				if (jumpTime >= 0 && jumpTime < (2 / 60)) this.offset.y = 16 + 4;
				else if (jumpTime >= (2 / 60) && jumpTime < (4 / 60)) this.offset.y = 16 + 6;
				else if (jumpTime >= (4 / 60) && jumpTime < (6 / 60)) this.offset.y = 16 + 8;
				else if (jumpTime >= (6 / 60) && jumpTime < (8 / 60)) this.offset.y = 16 + 10;
				else if (jumpTime >= (8 / 60) && jumpTime < (10 / 60)) this.offset.y = 16 + 12;
				else if (jumpTime >= (10 / 60) && jumpTime < (16 / 60)) this.offset.y = 16 + 14;
				else if (jumpTime >= (16 / 60) && jumpTime < (18 / 60)) this.offset.y = 16 + 12;
				else if (jumpTime >= (18 / 60) && jumpTime < (20 / 60)) this.offset.y = 16 + 10;
				else if (jumpTime >= (20 / 60) && jumpTime < (22 / 60)) this.offset.y = 16 + 8;
				else if (jumpTime >= (22 / 60) && jumpTime < (24 / 60)) this.offset.y = 16 + 6;
				else if (jumpTime >= (24 / 60) && jumpTime < (26 / 60)) this.offset.y = 16 + 4;
				else this.offset.y = 16 + 0;
			}

			// Check if player has reached his destination.
			if (this.destinationReached()) {
				// Player is not jumping.
				this.isJump = false;

				// Snap player to legal destination coordinates.
				this.alignToGrid();

				// Prevent Impact from moving the player further.
				this.vel.x = this.vel.y = 0;

				// Assess whether to try moving again or rest.
				this.goAgain();

				// Check if player is a local human player.
				if (this.isLocal) {
					// Update repeating border to reflect current location.
					updateBorder(this);
				}
			} else {
				// Have not reached destination, keep moving.
				this.setVelocity(this.speed);
			}
		},

		//                                                                                                                                                                       dddddddd
		//                    lllllll   iiii                                    TTTTTTTTTTTTTTTTTTTTTTT                      GGGGGGGGGGGGG                     iiii              d::::::d
		//                    l:::::l  i::::i                                   T:::::::::::::::::::::T                   GGG::::::::::::G                    i::::i             d::::::d
		//                    l:::::l   iiii                                    T:::::::::::::::::::::T                 GG:::::::::::::::G                     iiii              d::::::d
		//                    l:::::l                                           T:::::TT:::::::TT:::::T                G:::::GGGGGGGG::::G                                       d:::::d 
		//    aaaaaaaaaaaaa    l::::l iiiiiii    ggggggggg   gggggnnnn  nnnnnnnnTTTTTT  T:::::T  TTTTTTooooooooooo    G:::::G       GGGGGGrrrrr   rrrrrrrrr  iiiiiii     ddddddddd:::::d 
		//    a::::::::::::a   l::::l i:::::i   g:::::::::ggg::::gn:::nn::::::::nn      T:::::T      oo:::::::::::oo G:::::G              r::::rrr:::::::::r i:::::i   dd::::::::::::::d 
		//    aaaaaaaaa:::::a  l::::l  i::::i  g:::::::::::::::::gn::::::::::::::nn     T:::::T     o:::::::::::::::oG:::::G              r:::::::::::::::::r i::::i  d::::::::::::::::d 
		//             a::::a  l::::l  i::::i g::::::ggggg::::::ggnn:::::::::::::::n    T:::::T     o:::::ooooo:::::oG:::::G    GGGGGGGGGGrr::::::rrrrr::::::ri::::i d:::::::ddddd:::::d 
		//      aaaaaaa:::::a  l::::l  i::::i g:::::g     g:::::g   n:::::nnnn:::::n    T:::::T     o::::o     o::::oG:::::G    G::::::::G r:::::r     r:::::ri::::i d::::::d    d:::::d 
		//    aa::::::::::::a  l::::l  i::::i g:::::g     g:::::g   n::::n    n::::n    T:::::T     o::::o     o::::oG:::::G    GGGGG::::G r:::::r     rrrrrrri::::i d:::::d     d:::::d 
		//   a::::aaaa::::::a  l::::l  i::::i g:::::g     g:::::g   n::::n    n::::n    T:::::T     o::::o     o::::oG:::::G        G::::G r:::::r            i::::i d:::::d     d:::::d 
		//  a::::a    a:::::a  l::::l  i::::i g::::::g    g:::::g   n::::n    n::::n    T:::::T     o::::o     o::::o G:::::G       G::::G r:::::r            i::::i d:::::d     d:::::d 
		//  a::::a    a:::::a l::::::li::::::ig:::::::ggggg:::::g   n::::n    n::::n  TT:::::::TT   o:::::ooooo:::::o  G:::::GGGGGGGG::::G r:::::r           i::::::id::::::ddddd::::::dd
		//  a:::::aaaa::::::a l::::::li::::::i g::::::::::::::::g   n::::n    n::::n  T:::::::::T   o:::::::::::::::o   GG:::::::::::::::G r:::::r           i::::::i d:::::::::::::::::d
		//   a::::::::::aa:::al::::::li::::::i  gg::::::::::::::g   n::::n    n::::n  T:::::::::T    oo:::::::::::oo      GGG::::::GGG:::G r:::::r           i::::::i  d:::::::::ddd::::d
		//    aaaaaaaaaa  aaaalllllllliiiiiiii    gggggggg::::::g   nnnnnn    nnnnnn  TTTTTTTTTTT      ooooooooooo           GGGGGG   GGGG rrrrrrr           iiiiiiii   ddddddddd   ddddd
		//                                                g:::::g                                                                                                                        
		//                                    gggggg      g:::::g                                                                                                                        
		//                                    g:::::gg   gg:::::g                                                                                                                        
		//                                     g::::::ggg:::::::g                                                                                                                        
		//                                      gg:::::::::::::g                                                                                                                         
		//                                        ggg::::::ggg                                                                                                                           
		//                                           gggggg                                                                                                                              
		/*
		 * Snap player to legal destination coordinates.
		 *
		 * @return undefined
		 */
		alignToGrid: function() {

			// Select which axis players destination is on.
			switch (this.facing) {
			case 'left':
			case 'right':

				// Horizontal move.
				this.pos.x = this.destination;
				break;

			case 'up':
			case 'down':

				// Vertical move.
				this.pos.y = this.destination;
				break;

			}
		},

		//                                                tttt          MMMMMMMM               MMMMMMMM                                                       DDDDDDDDDDDDD                                                      tttt            iiii                                             tttt            iiii                                     
		//                                             ttt:::t          M:::::::M             M:::::::M                                                       D::::::::::::DDD                                                ttt:::t           i::::i                                         ttt:::t           i::::i                                    
		//                                             t:::::t          M::::::::M           M::::::::M                                                       D:::::::::::::::DD                                              t:::::t            iiii                                          t:::::t            iiii                                     
		//                                             t:::::t          M:::::::::M         M:::::::::M                                                       DDD:::::DDDDD:::::D                                             t:::::t                                                          t:::::t                                                     
		//      ssssssssss       eeeeeeeeeeee    ttttttt:::::ttttttt    M::::::::::M       M::::::::::M   ooooooooooo vvvvvvv           vvvvvvv eeeeeeeeeeee    D:::::D    D:::::D     eeeeeeeeeeee        ssssssssss   ttttttt:::::ttttttt    iiiiiiinnnn  nnnnnnnn      aaaaaaaaaaaaa  ttttttt:::::ttttttt    iiiiiii    ooooooooooo   nnnn  nnnnnnnn    
		//    ss::::::::::s    ee::::::::::::ee  t:::::::::::::::::t    M:::::::::::M     M:::::::::::M oo:::::::::::oov:::::v         v:::::vee::::::::::::ee  D:::::D     D:::::D  ee::::::::::::ee    ss::::::::::s  t:::::::::::::::::t    i:::::in:::nn::::::::nn    a::::::::::::a t:::::::::::::::::t    i:::::i  oo:::::::::::oo n:::nn::::::::nn  
		//  ss:::::::::::::s  e::::::eeeee:::::eet:::::::::::::::::t    M:::::::M::::M   M::::M:::::::Mo:::::::::::::::ov:::::v       v:::::ve::::::eeeee:::::eeD:::::D     D:::::D e::::::eeeee:::::eess:::::::::::::s t:::::::::::::::::t     i::::in::::::::::::::nn   aaaaaaaaa:::::at:::::::::::::::::t     i::::i o:::::::::::::::on::::::::::::::nn 
		//  s::::::ssss:::::se::::::e     e:::::etttttt:::::::tttttt    M::::::M M::::M M::::M M::::::Mo:::::ooooo:::::o v:::::v     v:::::ve::::::e     e:::::eD:::::D     D:::::De::::::e     e:::::es::::::ssss:::::stttttt:::::::tttttt     i::::inn:::::::::::::::n           a::::atttttt:::::::tttttt     i::::i o:::::ooooo:::::onn:::::::::::::::n
		//   s:::::s  ssssss e:::::::eeeee::::::e      t:::::t          M::::::M  M::::M::::M  M::::::Mo::::o     o::::o  v:::::v   v:::::v e:::::::eeeee::::::eD:::::D     D:::::De:::::::eeeee::::::e s:::::s  ssssss       t:::::t           i::::i  n:::::nnnn:::::n    aaaaaaa:::::a      t:::::t           i::::i o::::o     o::::o  n:::::nnnn:::::n
		//     s::::::s      e:::::::::::::::::e       t:::::t          M::::::M   M:::::::M   M::::::Mo::::o     o::::o   v:::::v v:::::v  e:::::::::::::::::e D:::::D     D:::::De:::::::::::::::::e    s::::::s            t:::::t           i::::i  n::::n    n::::n  aa::::::::::::a      t:::::t           i::::i o::::o     o::::o  n::::n    n::::n
		//        s::::::s   e::::::eeeeeeeeeee        t:::::t          M::::::M    M:::::M    M::::::Mo::::o     o::::o    v:::::v:::::v   e::::::eeeeeeeeeee  D:::::D     D:::::De::::::eeeeeeeeeee        s::::::s         t:::::t           i::::i  n::::n    n::::n a::::aaaa::::::a      t:::::t           i::::i o::::o     o::::o  n::::n    n::::n
		//  ssssss   s:::::s e:::::::e                 t:::::t    ttttttM::::::M     MMMMM     M::::::Mo::::o     o::::o     v:::::::::v    e:::::::e           D:::::D    D:::::D e:::::::e           ssssss   s:::::s       t:::::t    tttttt i::::i  n::::n    n::::na::::a    a:::::a      t:::::t    tttttt i::::i o::::o     o::::o  n::::n    n::::n
		//  s:::::ssss::::::se::::::::e                t::::::tttt:::::tM::::::M               M::::::Mo:::::ooooo:::::o      v:::::::v     e::::::::e        DDD:::::DDDDD:::::D  e::::::::e          s:::::ssss::::::s      t::::::tttt:::::ti::::::i n::::n    n::::na::::a    a:::::a      t::::::tttt:::::ti::::::io:::::ooooo:::::o  n::::n    n::::n
		//  s::::::::::::::s  e::::::::eeeeeeee        tt::::::::::::::tM::::::M               M::::::Mo:::::::::::::::o       v:::::v       e::::::::eeeeeeeeD:::::::::::::::DD    e::::::::eeeeeeee  s::::::::::::::s       tt::::::::::::::ti::::::i n::::n    n::::na:::::aaaa::::::a      tt::::::::::::::ti::::::io:::::::::::::::o  n::::n    n::::n
		//   s:::::::::::ss    ee:::::::::::::e          tt:::::::::::ttM::::::M               M::::::M oo:::::::::::oo         v:::v         ee:::::::::::::eD::::::::::::DDD       ee:::::::::::::e   s:::::::::::ss          tt:::::::::::tti::::::i n::::n    n::::n a::::::::::aa:::a       tt:::::::::::tti::::::i oo:::::::::::oo   n::::n    n::::n
		//    sssssssssss        eeeeeeeeeeeeee            ttttttttttt  MMMMMMMM               MMMMMMMM   ooooooooooo            vvv            eeeeeeeeeeeeeeDDDDDDDDDDDDD            eeeeeeeeeeeeee    sssssssssss              ttttttttttt  iiiiiiii nnnnnn    nnnnnn  aaaaaaaaaa  aaaa         ttttttttttt  iiiiiiii   ooooooooooo     nnnnnn    nnnnnn
		//                                                                                                                                                                                                                                                                                                                                                 
		/*
		 * Set the players destination.
		 *
		 * @return undefined
		 */
		setMoveDestination: function() {

			// Specify distance based on move type.
			if (this.isJump) var distance = 2;
			else var distance = 1;

			// Get destination position.
			var position = this.getTilePos(this.pos.x, this.pos.y, this.facing, distance);

			// Dertermine which axis move is over.
			switch (this.facing) {
			case 'left':
			case 'right':

				// Set horizontal destination.
				this.destination = position.x;
				break;

			case 'up':
			case 'down':

				// Set vertical destination.
				this.destination = position.y;
				break;

			}
		},

		//                                                                                                                                                                                                   
		//                                                                                                                                                                                                   
		//                                                tttt     VVVVVVVV           VVVVVVVV               lllllll                                        iiii          tttt                               
		//                                             ttt:::t     V::::::V           V::::::V               l:::::l                                       i::::i      ttt:::t                               
		//                                             t:::::t     V::::::V           V::::::V               l:::::l                                        iiii       t:::::t                               
		//                                             t:::::t     V::::::V           V::::::V               l:::::l                                                   t:::::t                               
		//      ssssssssss       eeeeeeeeeeee    ttttttt:::::tttttttV:::::V           V:::::V eeeeeeeeeeee    l::::l    ooooooooooo       cccccccccccccccciiiiiiittttttt:::::tttttttyyyyyyy           yyyyyyy
		//    ss::::::::::s    ee::::::::::::ee  t:::::::::::::::::t V:::::V         V:::::Vee::::::::::::ee  l::::l  oo:::::::::::oo   cc:::::::::::::::ci:::::it:::::::::::::::::t y:::::y         y:::::y 
		//  ss:::::::::::::s  e::::::eeeee:::::eet:::::::::::::::::t  V:::::V       V:::::Ve::::::eeeee:::::eel::::l o:::::::::::::::o c:::::::::::::::::c i::::it:::::::::::::::::t  y:::::y       y:::::y  
		//  s::::::ssss:::::se::::::e     e:::::etttttt:::::::tttttt   V:::::V     V:::::Ve::::::e     e:::::el::::l o:::::ooooo:::::oc:::::::cccccc:::::c i::::itttttt:::::::tttttt   y:::::y     y:::::y   
		//   s:::::s  ssssss e:::::::eeeee::::::e      t:::::t          V:::::V   V:::::V e:::::::eeeee::::::el::::l o::::o     o::::oc::::::c     ccccccc i::::i      t:::::t          y:::::y   y:::::y    
		//     s::::::s      e:::::::::::::::::e       t:::::t           V:::::V V:::::V  e:::::::::::::::::e l::::l o::::o     o::::oc:::::c              i::::i      t:::::t           y:::::y y:::::y     
		//        s::::::s   e::::::eeeeeeeeeee        t:::::t            V:::::V:::::V   e::::::eeeeeeeeeee  l::::l o::::o     o::::oc:::::c              i::::i      t:::::t            y:::::y:::::y      
		//  ssssss   s:::::s e:::::::e                 t:::::t    tttttt   V:::::::::V    e:::::::e           l::::l o::::o     o::::oc::::::c     ccccccc i::::i      t:::::t    tttttt   y:::::::::y       
		//  s:::::ssss::::::se::::::::e                t::::::tttt:::::t    V:::::::V     e::::::::e         l::::::lo:::::ooooo:::::oc:::::::cccccc:::::ci::::::i     t::::::tttt:::::t    y:::::::y        
		//  s::::::::::::::s  e::::::::eeeeeeee        tt::::::::::::::t     V:::::V       e::::::::eeeeeeee l::::::lo:::::::::::::::o c:::::::::::::::::ci::::::i     tt::::::::::::::t     y:::::y         
		//   s:::::::::::ss    ee:::::::::::::e          tt:::::::::::tt      V:::V         ee:::::::::::::e l::::::l oo:::::::::::oo   cc:::::::::::::::ci::::::i       tt:::::::::::tt    y:::::y          
		//    sssssssssss        eeeeeeeeeeeeee            ttttttttttt         VVV            eeeeeeeeeeeeee llllllll   ooooooooooo       cccccccccccccccciiiiiiii         ttttttttttt     y:::::y           
		//                                                                                                                                                                                y:::::y            
		//                                                                                                                                                                               y:::::y             
		//                                                                                                                                                                              y:::::y              
		//                                                                                                                                                                             y:::::y               
		//                                                                                                                                                                            yyyyyyy                
		//                                                                                                                                                                                                   
		//                                                                                                                                                                                                   
		/*
		 * Set players velocity to equal his current set speed.
		 *
		 * @param  speed integer Pixels per second to move.
		 * @return       undefined
		 */
		setVelocity: function(speed) {

			// Check which direction the player is facing.
			switch (this.facing) {
			case 'left':
				this.vel.x = -speed;
				break;
			case 'right':
				this.vel.x = +speed;
				break;
			case 'up':
				this.vel.y = -speed;
				break;
			case 'down':
				this.vel.y = +speed;
				break;
			}
		},

		//              dddddddd                                                                                                                                                                                                                                                                                                      dddddddd
		//              d::::::d                                              tttt            iiii                                             tttt            iiii                                     RRRRRRRRRRRRRRRRR                                                         hhhhhhh                                             d::::::d
		//              d::::::d                                           ttt:::t           i::::i                                         ttt:::t           i::::i                                    R::::::::::::::::R                                                        h:::::h                                             d::::::d
		//              d::::::d                                           t:::::t            iiii                                          t:::::t            iiii                                     R::::::RRRRRR:::::R                                                       h:::::h                                             d::::::d
		//              d:::::d                                            t:::::t                                                          t:::::t                                                     RR:::::R     R:::::R                                                      h:::::h                                             d:::::d 
		//      ddddddddd:::::d     eeeeeeeeeeee        ssssssssss   ttttttt:::::ttttttt    iiiiiiinnnn  nnnnnnnn      aaaaaaaaaaaaa  ttttttt:::::ttttttt    iiiiiii    ooooooooooo   nnnn  nnnnnnnn      R::::R     R:::::R    eeeeeeeeeeee    aaaaaaaaaaaaa      cccccccccccccccch::::h hhhhh           eeeeeeeeeeee        ddddddddd:::::d 
		//    dd::::::::::::::d   ee::::::::::::ee    ss::::::::::s  t:::::::::::::::::t    i:::::in:::nn::::::::nn    a::::::::::::a t:::::::::::::::::t    i:::::i  oo:::::::::::oo n:::nn::::::::nn    R::::R     R:::::R  ee::::::::::::ee  a::::::::::::a   cc:::::::::::::::ch::::hh:::::hhh      ee::::::::::::ee    dd::::::::::::::d 
		//   d::::::::::::::::d  e::::::eeeee:::::eess:::::::::::::s t:::::::::::::::::t     i::::in::::::::::::::nn   aaaaaaaaa:::::at:::::::::::::::::t     i::::i o:::::::::::::::on::::::::::::::nn   R::::RRRRRR:::::R  e::::::eeeee:::::eeaaaaaaaaa:::::a c:::::::::::::::::ch::::::::::::::hh   e::::::eeeee:::::ee d::::::::::::::::d 
		//  d:::::::ddddd:::::d e::::::e     e:::::es::::::ssss:::::stttttt:::::::tttttt     i::::inn:::::::::::::::n           a::::atttttt:::::::tttttt     i::::i o:::::ooooo:::::onn:::::::::::::::n  R:::::::::::::RR  e::::::e     e:::::e         a::::ac:::::::cccccc:::::ch:::::::hhh::::::h e::::::e     e:::::ed:::::::ddddd:::::d 
		//  d::::::d    d:::::d e:::::::eeeee::::::e s:::::s  ssssss       t:::::t           i::::i  n:::::nnnn:::::n    aaaaaaa:::::a      t:::::t           i::::i o::::o     o::::o  n:::::nnnn:::::n  R::::RRRRRR:::::R e:::::::eeeee::::::e  aaaaaaa:::::ac::::::c     ccccccch::::::h   h::::::he:::::::eeeee::::::ed::::::d    d:::::d 
		//  d:::::d     d:::::d e:::::::::::::::::e    s::::::s            t:::::t           i::::i  n::::n    n::::n  aa::::::::::::a      t:::::t           i::::i o::::o     o::::o  n::::n    n::::n  R::::R     R:::::Re:::::::::::::::::e aa::::::::::::ac:::::c             h:::::h     h:::::he:::::::::::::::::e d:::::d     d:::::d 
		//  d:::::d     d:::::d e::::::eeeeeeeeeee        s::::::s         t:::::t           i::::i  n::::n    n::::n a::::aaaa::::::a      t:::::t           i::::i o::::o     o::::o  n::::n    n::::n  R::::R     R:::::Re::::::eeeeeeeeeee a::::aaaa::::::ac:::::c             h:::::h     h:::::he::::::eeeeeeeeeee  d:::::d     d:::::d 
		//  d:::::d     d:::::d e:::::::e           ssssss   s:::::s       t:::::t    tttttt i::::i  n::::n    n::::na::::a    a:::::a      t:::::t    tttttt i::::i o::::o     o::::o  n::::n    n::::n  R::::R     R:::::Re:::::::e         a::::a    a:::::ac::::::c     ccccccch:::::h     h:::::he:::::::e           d:::::d     d:::::d 
		//  d::::::ddddd::::::dde::::::::e          s:::::ssss::::::s      t::::::tttt:::::ti::::::i n::::n    n::::na::::a    a:::::a      t::::::tttt:::::ti::::::io:::::ooooo:::::o  n::::n    n::::nRR:::::R     R:::::Re::::::::e        a::::a    a:::::ac:::::::cccccc:::::ch:::::h     h:::::he::::::::e          d::::::ddddd::::::dd
		//   d:::::::::::::::::d e::::::::eeeeeeee  s::::::::::::::s       tt::::::::::::::ti::::::i n::::n    n::::na:::::aaaa::::::a      tt::::::::::::::ti::::::io:::::::::::::::o  n::::n    n::::nR::::::R     R:::::R e::::::::eeeeeeeea:::::aaaa::::::a c:::::::::::::::::ch:::::h     h:::::h e::::::::eeeeeeee   d:::::::::::::::::d
		//    d:::::::::ddd::::d  ee:::::::::::::e   s:::::::::::ss          tt:::::::::::tti::::::i n::::n    n::::n a::::::::::aa:::a       tt:::::::::::tti::::::i oo:::::::::::oo   n::::n    n::::nR::::::R     R:::::R  ee:::::::::::::e a::::::::::aa:::a cc:::::::::::::::ch:::::h     h:::::h  ee:::::::::::::e    d:::::::::ddd::::d
		//     ddddddddd   ddddd    eeeeeeeeeeeeee    sssssssssss              ttttttttttt  iiiiiiii nnnnnn    nnnnnn  aaaaaaaaaa  aaaa         ttttttttttt  iiiiiiii   ooooooooooo     nnnnnn    nnnnnnRRRRRRRR     RRRRRRR    eeeeeeeeeeeeee  aaaaaaaaaa  aaaa   cccccccccccccccchhhhhhh     hhhhhhh    eeeeeeeeeeeeee     ddddddddd   ddddd
		//                                                                                                                                                                                                                                                                                                                                    
		/*
		 * Checks if player has arrive at or passed his destination.
		 *
		 * @return boolean true if destination has been reached, else false.
		 */
		destinationReached: function() {
			// Check which axis destination is on.
			switch (this.facing) {

			case 'left':
				return this.pos.x <= this.destination;
				break;
			case 'right':
				return this.pos.x >= this.destination;
				break;
			case 'up':
				return this.pos.y <= this.destination;
				break;
			case 'down':
				return this.pos.y >= this.destination;
				break;
			}

			// Player has not yet arrived.
			return false;
		},

		//                                                                                                AAA                                 iiii                             SSSSSSSSSSSSSSS      tttt                                                        tttt          
		//                                                                                               A:::A                               i::::i                          SS:::::::::::::::S  ttt:::t                                                     ttt:::t          
		//                                                                                              A:::::A                               iiii                          S:::::SSSSSS::::::S  t:::::t                                                     t:::::t          
		//                                                                                             A:::::::A                                                            S:::::S     SSSSSSS  t:::::t                                                     t:::::t          
		//     mmmmmmm    mmmmmmm      ooooooooooo vvvvvvv           vvvvvvv eeeeeeeeeeee             A:::::::::A         nnnn  nnnnnnnn    iiiiiii    mmmmmmm    mmmmmmm   S:::::S        ttttttt:::::ttttttt      aaaaaaaaaaaaa  rrrrr   rrrrrrrrr   ttttttt:::::ttttttt    
		//   mm:::::::m  m:::::::mm  oo:::::::::::oov:::::v         v:::::vee::::::::::::ee          A:::::A:::::A        n:::nn::::::::nn  i:::::i  mm:::::::m  m:::::::mm S:::::S        t:::::::::::::::::t      a::::::::::::a r::::rrr:::::::::r  t:::::::::::::::::t    
		//  m::::::::::mm::::::::::mo:::::::::::::::ov:::::v       v:::::ve::::::eeeee:::::ee       A:::::A A:::::A       n::::::::::::::nn  i::::i m::::::::::mm::::::::::m S::::SSSS     t:::::::::::::::::t      aaaaaaaaa:::::ar:::::::::::::::::r t:::::::::::::::::t    
		//  m::::::::::::::::::::::mo:::::ooooo:::::o v:::::v     v:::::ve::::::e     e:::::e      A:::::A   A:::::A      nn:::::::::::::::n i::::i m::::::::::::::::::::::m  SS::::::SSSSStttttt:::::::tttttt               a::::arr::::::rrrrr::::::rtttttt:::::::tttttt    
		//  m:::::mmm::::::mmm:::::mo::::o     o::::o  v:::::v   v:::::v e:::::::eeeee::::::e     A:::::A     A:::::A       n:::::nnnn:::::n i::::i m:::::mmm::::::mmm:::::m    SSS::::::::SS    t:::::t              aaaaaaa:::::a r:::::r     r:::::r      t:::::t          
		//  m::::m   m::::m   m::::mo::::o     o::::o   v:::::v v:::::v  e:::::::::::::::::e     A:::::AAAAAAAAA:::::A      n::::n    n::::n i::::i m::::m   m::::m   m::::m       SSSSSS::::S   t:::::t            aa::::::::::::a r:::::r     rrrrrrr      t:::::t          
		//  m::::m   m::::m   m::::mo::::o     o::::o    v:::::v:::::v   e::::::eeeeeeeeeee     A:::::::::::::::::::::A     n::::n    n::::n i::::i m::::m   m::::m   m::::m            S:::::S  t:::::t           a::::aaaa::::::a r:::::r                  t:::::t          
		//  m::::m   m::::m   m::::mo::::o     o::::o     v:::::::::v    e:::::::e             A:::::AAAAAAAAAAAAA:::::A    n::::n    n::::n i::::i m::::m   m::::m   m::::m            S:::::S  t:::::t    tttttta::::a    a:::::a r:::::r                  t:::::t    tttttt
		//  m::::m   m::::m   m::::mo:::::ooooo:::::o      v:::::::v     e::::::::e           A:::::A             A:::::A   n::::n    n::::ni::::::im::::m   m::::m   m::::mSSSSSSS     S:::::S  t::::::tttt:::::ta::::a    a:::::a r:::::r                  t::::::tttt:::::t
		//  m::::m   m::::m   m::::mo:::::::::::::::o       v:::::v       e::::::::eeeeeeee  A:::::A               A:::::A  n::::n    n::::ni::::::im::::m   m::::m   m::::mS::::::SSSSSS:::::S  tt::::::::::::::ta:::::aaaa::::::a r:::::r                  tt::::::::::::::t
		//  m::::m   m::::m   m::::m oo:::::::::::oo         v:::v         ee:::::::::::::e A:::::A                 A:::::A n::::n    n::::ni::::::im::::m   m::::m   m::::mS:::::::::::::::SS     tt:::::::::::tt a::::::::::aa:::ar:::::r                    tt:::::::::::tt
		//  mmmmmm   mmmmmm   mmmmmm   ooooooooooo            vvv            eeeeeeeeeeeeeeAAAAAAA                   AAAAAAAnnnnnn    nnnnnniiiiiiiimmmmmm   mmmmmm   mmmmmm SSSSSSSSSSSSSSS         ttttttttttt    aaaaaaaaaa  aaaarrrrrrr                      ttttttttttt  
		//                                                                                                                                                                                                                                                                    
		/*
		 * Plays the players movement animation.
		 *
		 * @return undefined
		 */
		moveAnimStart: function(alternateFeet) {

			// State to use for animation.
			var state = this.moveState;

			if (this.swimming) // Water
			{
				// Set current animation.
				this.currentAnim = this.anims['swim' + ig.game.capitaliseFirstLetter(this.facing)];

				// Debug animation.
				console.debug('Current animation: ' + 'swim' + ig.game.capitaliseFirstLetter(this.facing));
			} else // Land
			{
				// Determine which foot to put forward.
				var foot = '';
				if (state != 'idle') foot = this.leftFoot ? 'A' : 'B';

				// Over-ride jump to share same animation as walk.
				if (state == 'jump') state = 'walk';

				// Set current animation.
				this.currentAnim = this.anims[state + ig.game.capitaliseFirstLetter(this.facing) + foot];

				// Debug animation.
				console.debug('Current animation: ' + state + ig.game.capitaliseFirstLetter(this.facing) + foot);

				// Play from first frame.
				this.currentAnim.rewind();

				// Switch foot for next time.
				if (alternateFeet) this.leftFoot = !this.leftFoot;
			}
		},

		//                                                                                                AAA                                 iiii                             SSSSSSSSSSSSSSS      tttt                                               
		//                                                                                               A:::A                               i::::i                          SS:::::::::::::::S  ttt:::t                                               
		//                                                                                              A:::::A                               iiii                          S:::::SSSSSS::::::S  t:::::t                                               
		//                                                                                             A:::::::A                                                            S:::::S     SSSSSSS  t:::::t                                               
		//     mmmmmmm    mmmmmmm      ooooooooooo vvvvvvv           vvvvvvv eeeeeeeeeeee             A:::::::::A         nnnn  nnnnnnnn    iiiiiii    mmmmmmm    mmmmmmm   S:::::S        ttttttt:::::ttttttt       ooooooooooo   ppppp   ppppppppp   
		//   mm:::::::m  m:::::::mm  oo:::::::::::oov:::::v         v:::::vee::::::::::::ee          A:::::A:::::A        n:::nn::::::::nn  i:::::i  mm:::::::m  m:::::::mm S:::::S        t:::::::::::::::::t     oo:::::::::::oo p::::ppp:::::::::p  
		//  m::::::::::mm::::::::::mo:::::::::::::::ov:::::v       v:::::ve::::::eeeee:::::ee       A:::::A A:::::A       n::::::::::::::nn  i::::i m::::::::::mm::::::::::m S::::SSSS     t:::::::::::::::::t    o:::::::::::::::op:::::::::::::::::p 
		//  m::::::::::::::::::::::mo:::::ooooo:::::o v:::::v     v:::::ve::::::e     e:::::e      A:::::A   A:::::A      nn:::::::::::::::n i::::i m::::::::::::::::::::::m  SS::::::SSSSStttttt:::::::tttttt    o:::::ooooo:::::opp::::::ppppp::::::p
		//  m:::::mmm::::::mmm:::::mo::::o     o::::o  v:::::v   v:::::v e:::::::eeeee::::::e     A:::::A     A:::::A       n:::::nnnn:::::n i::::i m:::::mmm::::::mmm:::::m    SSS::::::::SS    t:::::t          o::::o     o::::o p:::::p     p:::::p
		//  m::::m   m::::m   m::::mo::::o     o::::o   v:::::v v:::::v  e:::::::::::::::::e     A:::::AAAAAAAAA:::::A      n::::n    n::::n i::::i m::::m   m::::m   m::::m       SSSSSS::::S   t:::::t          o::::o     o::::o p:::::p     p:::::p
		//  m::::m   m::::m   m::::mo::::o     o::::o    v:::::v:::::v   e::::::eeeeeeeeeee     A:::::::::::::::::::::A     n::::n    n::::n i::::i m::::m   m::::m   m::::m            S:::::S  t:::::t          o::::o     o::::o p:::::p     p:::::p
		//  m::::m   m::::m   m::::mo::::o     o::::o     v:::::::::v    e:::::::e             A:::::AAAAAAAAAAAAA:::::A    n::::n    n::::n i::::i m::::m   m::::m   m::::m            S:::::S  t:::::t    tttttto::::o     o::::o p:::::p    p::::::p
		//  m::::m   m::::m   m::::mo:::::ooooo:::::o      v:::::::v     e::::::::e           A:::::A             A:::::A   n::::n    n::::ni::::::im::::m   m::::m   m::::mSSSSSSS     S:::::S  t::::::tttt:::::to:::::ooooo:::::o p:::::ppppp:::::::p
		//  m::::m   m::::m   m::::mo:::::::::::::::o       v:::::v       e::::::::eeeeeeee  A:::::A               A:::::A  n::::n    n::::ni::::::im::::m   m::::m   m::::mS::::::SSSSSS:::::S  tt::::::::::::::to:::::::::::::::o p::::::::::::::::p 
		//  m::::m   m::::m   m::::m oo:::::::::::oo         v:::v         ee:::::::::::::e A:::::A                 A:::::A n::::n    n::::ni::::::im::::m   m::::m   m::::mS:::::::::::::::SS     tt:::::::::::tt oo:::::::::::oo  p::::::::::::::pp  
		//  mmmmmm   mmmmmm   mmmmmm   ooooooooooo            vvv            eeeeeeeeeeeeeeAAAAAAA                   AAAAAAAnnnnnn    nnnnnniiiiiiiimmmmmm   mmmmmm   mmmmmm SSSSSSSSSSSSSSS         ttttttttttt     ooooooooooo    p::::::pppppppp    
		//                                                                                                                                                                                                                          p:::::p            
		//                                                                                                                                                                                                                          p:::::p            
		//                                                                                                                                                                                                                         p:::::::p           
		//                                                                                                                                                                                                                         p:::::::p           
		//                                                                                                                                                                                                                         p:::::::p           
		//                                                                                                                                                                                                                         ppppppppp           
		/*
		 * Plays the players idle (non-movement) animation.
		 *
		 * @return undefined
		 */
		moveAnimStop: function() {
			// Use faced direction to determine the animation.
			switch (this.facing) {
			case 'left':
			case 'right':
			case 'up':
			case 'down':

				// Swimming idle.
				if (this.swimming) this.currentAnim = this.anims['swim' + ig.game.capitaliseFirstLetter(this.facing)];

				// Land idle.
				else this.currentAnim = this.anims['idle' + ig.game.capitaliseFirstLetter(this.facing)];

				break;
			};
		},

		//                                                           kkkkkkkk             iiii                   
		//                                                           k::::::k            i::::i                  
		//                                                           k::::::k             iiii                   
		//                                                           k::::::k                                    
		//  rrrrr   rrrrrrrrr       eeeeeeeeeeee        ssssssssss    k:::::k    kkkkkkkiiiiiiinnnn  nnnnnnnn    
		//  r::::rrr:::::::::r    ee::::::::::::ee    ss::::::::::s   k:::::k   k:::::k i:::::in:::nn::::::::nn  
		//  r:::::::::::::::::r  e::::::eeeee:::::eess:::::::::::::s  k:::::k  k:::::k   i::::in::::::::::::::nn 
		//  rr::::::rrrrr::::::re::::::e     e:::::es::::::ssss:::::s k:::::k k:::::k    i::::inn:::::::::::::::n
		//   r:::::r     r:::::re:::::::eeeee::::::e s:::::s  ssssss  k::::::k:::::k     i::::i  n:::::nnnn:::::n
		//   r:::::r     rrrrrrre:::::::::::::::::e    s::::::s       k:::::::::::k      i::::i  n::::n    n::::n
		//   r:::::r            e::::::eeeeeeeeeee        s::::::s    k:::::::::::k      i::::i  n::::n    n::::n
		//   r:::::r            e:::::::e           ssssss   s:::::s  k::::::k:::::k     i::::i  n::::n    n::::n
		//   r:::::r            e::::::::e          s:::::ssss::::::sk::::::k k:::::k   i::::::i n::::n    n::::n
		//   r:::::r             e::::::::eeeeeeee  s::::::::::::::s k::::::k  k:::::k  i::::::i n::::n    n::::n
		//   r:::::r              ee:::::::::::::e   s:::::::::::ss  k::::::k   k:::::k i::::::i n::::n    n::::n
		//   rrrrrrr                eeeeeeeeeeeeee    sssssssssss    kkkkkkkk    kkkkkkkiiiiiiii nnnnnn    nnnnnn
		//
		/*
		 * Loads and sets players current skin.
		 *
		 * @return undefined
		 */
		reskin: function() {

			// Check if current skin is allowed.
			switch (this.skin) {

				// These skins are allowed.
			case 'boy':
			case 'girl':
			case 'fat':
			case 'kid':
			case 'labgeek':

				// Selected skin is good, use it.
				var allowedSkin = true;
				break;

				// Skin is not allowed.
			default:

				// Use the default skin.
				var allowedSkin = false;
				break;

			}

			// Position image to world.
			this.offset = {
				x: 8,
				y: 16
			};

			// Set the default skin.
			if (!allowedSkin) this.skin = 'boy';

			// Load skin image resource.
			this.animSheet = new ig.AnimationSheet('media/people/rs.' + this.skin + '.png', 32, 32);

			// Add movement animations.
			this.addAnim('walkUpA', 0.13333, [3, 0], true);
			this.addAnim('walkUpB', 0.13333, [6, 0], true);
			this.addAnim('walkDownA', 0.13333, [5, 2], true);
			this.addAnim('walkDownB', 0.13333, [8, 2], true);
			this.addAnim('walkLeftA', 0.13333, [4, 1], true);
			this.addAnim('walkLeftB', 0.13333, [7, 1], true);
			this.addAnim('walkRightA', 0.13333, [4, 1], true);
			this.addAnim('walkRightB', 0.13333, [7, 1], true);
			this.addAnim('runUpA', 0.08333, [12, 9], true);
			this.addAnim('runUpB', 0.08333, [15, 9], true);
			this.addAnim('runDownA', 0.08333, [14, 11], true);
			this.addAnim('runDownB', 0.08333, [17, 11], true);
			this.addAnim('runLeftA', 0.08333, [13, 10], true);
			this.addAnim('runLeftB', 0.08333, [16, 10], true);
			this.addAnim('runRightA', 0.08333, [16, 10], true);
			this.addAnim('runRightB', 0.08333, [13, 10], true);
			this.addAnim('slowUp', 0.26667, [3, 0, 6, 0]);
			this.addAnim('slowDown', 0.26667, [5, 2, 8, 2]);
			this.addAnim('slowLeft', 0.26667, [4, 1, 7, 1]);
			this.addAnim('slowRight', 0.26667, [7, 1, 4, 1]);
			this.addAnim('swimUp', 0.53333, [18, 21], true);
			this.addAnim('swimDown', 0.53333, [20, 23], true);
			this.addAnim('swimLeft', 0.53333, [19, 22], true);
			this.addAnim('swimRight', 0.53333, [19, 22], true);
			this.addAnim('idleUp', 0.1, [0], true);
			this.addAnim('idleDown', 0.1, [2], true);
			this.addAnim('idleLeft', 0.1, [1], true);
			this.addAnim('idleRight', 0.1, [1], true);

			// Right-side animations are simply a mirror of the left.
			this.anims.walkRightA.flip.x = true;
			this.anims.walkRightB.flip.x = true;
			this.anims.runRightA.flip.x = true;
			this.anims.runRightB.flip.x = true;
			this.anims.slowRight.flip.x = true;
			this.anims.swimRight.flip.x = true;
			this.anims.idleRight.flip.x = true;

			// Set current animation.
			this.moveAnimStop();
		}


	});
})