<?php

// This script extracts attack moves copied from Chrome browser at:
// http://pokemondb.net/move/generation/3

$attacks = "Aerial Ace	FLYING
Physical
60	-1	20
Air Cutter	FLYING
Special
55	95	25
Arm Thrust	FIGHTING
Physical
15	100	20
Aromatherapy	GRASS
Status
-	-	5
Assist	NORMAL
Status
-	-	20
Astonish	GHOST
Physical
30	100	15
Blast Burn	FIRE
Special
150	90	5
Blaze Kick	FIRE
Physical
85	90	10
Block	NORMAL
Status
-	-	5
Bounce	FLYING
Physical
85	85	5
Brick Break	FIGHTING
Physical
75	100	30
Bulk Up	FIGHTING
Status
-	-	20
Bullet Seed	GRASS
Physical
25	100	30
Calm Mind	PSYCHIC
Status
-	-	20
Camouflage	NORMAL
Status
-	-	20
Charge	ELECTRIC
Status
-	-	20
Cosmic Power	PSYCHIC
Status
-	-	20
Covet	NORMAL
Physical
60	100	40
Crush Claw	NORMAL
Physical
75	95	10
Dive	WATER
Physical
80	100	10
Doom Desire	STEEL
Special
140	100	5
Dragon Claw	DRAGON
Physical
80	100	15
Dragon Dance	DRAGON
Status
-	-	20
Endeavor	NORMAL
Physical
-	100	5
Eruption	FIRE
Special
150	100	5
Extrasensory	PSYCHIC
Special
80	100	30
Facade	NORMAL
Physical
70	100	20
Fake Out	NORMAL
Physical
40	100	10
Fake Tears	DARK
Status
-	100	20
FeatherDance	FLYING
Status
-	100	15
Flatter	DARK
Status
-	100	15
Focus Punch	FIGHTING
Physical
150	100	20
Follow Me	NORMAL
Status
-	-	20
Frenzy Plant	GRASS
Special
150	90	5
GrassWhistle	GRASS
Status
-	55	15
Grudge	GHOST
Status
-	-	5
Hail	ICE
Status
-	-	10
Heat Wave	FIRE
Special
100	90	10
Helping Hand	NORMAL
Status
-	-	20
Howl	NORMAL
Status
-	-	40
Hydro Cannon	WATER
Special
150	90	5
Hyper Voice	NORMAL
Special
90	100	10
Ice Ball	ICE
Physical
30	90	20
Icicle Spear	ICE
Physical
25	100	30
Imprison	PSYCHIC
Status
-	-	10
Ingrain	GRASS
Status
-	-	20
Iron Defense	STEEL
Status
-	-	15
Knock Off	DARK
Physical
20	100	20
Leaf Blade	GRASS
Physical
90	100	15
Luster Purge	PSYCHIC
Special
70	100	5
Magic Coat	PSYCHIC
Status
-	-	15
Magical Leaf	GRASS
Special
60	-1	20
Memento	DARK
Status
-	100	10
Metal Sound	STEEL
Status
-	85	40
Meteor Mash	STEEL
Physical
100	85	10
Mist Ball	PSYCHIC
Special
70	100	5
Mud Shot	GROUND
Special
55	95	15
Mud Sport	GROUND
Status
-	-	15
Muddy Water	WATER
Special
95	85	10
Nature Power	NORMAL
Status
-	-	20
Needle Arm	GRASS
Physical
60	100	15
Odor Sleuth	NORMAL
Status
-	-	40
Overheat	FIRE
Special
140	90	5
Poison Fang	POISON
Physical
50	100	15
Poison Tail	POISON
Physical
50	100	25
Psycho Boost	PSYCHIC
Special
140	90	5
Recycle	NORMAL
Status
-	-	10
Refresh	NORMAL
Status
-	-	20
Revenge	FIGHTING
Physical
60	100	10
Rock Blast	ROCK
Physical
25	90	10
Rock Tomb	ROCK
Physical
50	80	10
Role Play	PSYCHIC
Status
-	-	15
Sand Tomb	GROUND
Physical
35	85	15
Secret Power	NORMAL
Physical
70	100	20
Shadow Punch	GHOST
Physical
60	-1	20
Sheer Cold	ICE
Special
-	-	5
Shock Wave	ELECTRIC
Special
60	-1	20
Signal Beam	BUG
Special
75	100	15
Silver Wind	BUG
Special
60	100	5
Skill Swap	PSYCHIC
Status
-	-	10
Sky Uppercut	FIGHTING
Physical
85	90	15
Slack Off	NORMAL
Status
-	-	10
SmellingSalt	NORMAL
Physical
60	100	10
Snatch	DARK
Status
-	-	10
Spit Up	NORMAL
Special
-	100	10
Stockpile	NORMAL
Status
-	-	20
Superpower	FIGHTING
Physical
120	100	5
Swallow	NORMAL
Status
-	-	10
Tail Glow	BUG
Status
-	-	20
Taunt	DARK
Status
-	100	20
Teeter Dance	NORMAL
Status
-	100	20
Tickle	NORMAL
Status
-	100	20
Torment	DARK
Status
-	100	15
Trick	PSYCHIC
Status
-	100	10
Uproar	NORMAL
Special
90	100	10
Volt Tackle	ELECTRIC
Physical
120	100	15
Water Pulse	WATER
Special
60	100	20
Water Sport	WATER
Status
-	-	15
Water Spout	WATER
Special
150	100	5
Weather Ball	NORMAL
Special
50	100	10
Will-O-Wisp	FIRE
Status
-	75	15
Wish	NORMAL
Status
-	-	10
Yawn	NORMAL
Status
-	-	10";

// Map out word-to-ID conversions.

$cat_id = Array( 'Special' => 1, 'Status' => 2, 'Physical' => 3 );

$type_id = Array(

	'bug'      => 1,

	'dark'     => 2,

	'dragon'   => 3,

	'electric' => 4,

	'fighting' => 5,

	'fire'     => 6,

	'flying'   => 7,

	'ghost'    => 8,

	'grass'    => 9,

	'ground'   => 10,

	'ice'      => 11,

	'normal'   => 12,

	'poison'   => 13,

	'psychic'  => 14,

	'rock'     => 15,

	'steel'    => 16,

	'water'    => 17

);

// Begin extracting attacks.

$attacks = explode( "\n", $attacks );

// Rebuild related lines.
$rebuilt = Array();

for( $i = 0; $i < count( $attacks ); $i += 3 ) {

	$rebuilt[] = trim( $attacks[ $i ] ) . '/' . trim( $attacks[ $i + 1 ] ) . '/' . trim( $attacks[ $i + 2] );

}

// Put a slash between attack name and type.
for( $i = 0; $i < count( $rebuilt ); $i++ ) {

	$rebuilt = preg_replace( "/\t/", "/", $rebuilt );

}

// To eventually be echoed.
$output = "";

// Extract meaningful information from array.
for( $i = 0; $i < count( $rebuilt ); $i++ ) {

	$attack = explode( "/", $rebuilt[$i] );

	$name = $attack[0];

	$type = strtolower( $attack[1] );

	$category = $attack[2];

	$power = $attack[3];

	$accuracy = $attack[4];

	$pp = $attack[5];

	// Create SQL query.

	$table = 'attacks';

	$sql = "INSERT INTO `$table` "
	     	. "(`name`, `type`, `cat_id`, `power`, `accuracy`, `pp`) "
	     . "VALUES ( "
		     . " '$name', "
		     . " '" . $type_id[ $type ] . "', "
		     . " '" . $cat_id[ $category ] ."', "
		     . ( $power == '-' ? 'NULL,' : "'$power'," )
		     . ( $accuracy == '-' ? 'NULL,' : "'$accuracy'," )
		     . " '$pp' "
	     . " );";

	// Add to output.
	$output .= $sql . "\n";

}



?>

<pre>
<?php

//print_r( $rebuilt );

echo $output;

?>
</pre>