<?php

include('inc.globals.php');
require('inc.functions.php');


    /*
     * List each collision type and the tiles that below to each type.
     *
     */
    
    // we'll need master tilesheet info to translate hashes into tile positions
    $masterTilesheetByHash = getTilesheetHashTable($globalMasterTilesheetJSON);

    // previously saved collisions will be needed
    $collisions = getCollisionsFromFile($globalCollisionsFile); // read from file
    $collisions = buildHashIndexCollisions($collisions); // use hashes as indexes
    
    // build array of collision types for easy lookup
    $collisionIndex = 0;
    $indexOfCollisionByName = array();
    $nameOfCollisionByIndex = array();
    foreach($globalCollisions as $collisionName => $collision)
    {
        $indexOfCollisionByName[$collisionName] = $collisionIndex;
        $nameOfCollisionByIndex[$collisionIndex] = $collisionName;
        $collisionIndex++;
    }

    // build array of all tiles and what collision types they belong to
    $tilesByCollisionType = array();
    foreach($collisions as $tileHash => $collisionType)
    {
        $currentCollisionName = $nameOfCollisionByIndex[$collisionType];
        if($currentCollisionName=='grass')
        {
            if( !isset( $tilesByCollisionType[ $currentCollisionName ] ))
                $tilesByCollisionType[ $currentCollisionName ] = array();
            
            $tilePosInTilesheet = $masterTilesheetByHash[$tileHash] + $globalWMTileOffset; 
            array_push( $tilesByCollisionType[ $currentCollisionName ], $tilePosInTilesheet );
        }
    }

    print_r($tilesByCollisionType);

    

?>