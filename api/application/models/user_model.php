<?php

class User_model extends CI_Model {

    var $id     = '';
    var $user   = '';
    var $x      = '';
    var $y      = '';
    var $facing = '';
    var $skin   = '';
    var $state  = '';
    var $map    = '';

    function __construct() {

        parent::__construct();

    }

    // Returns an array containing info about a specific user.
    function get( $id ) {

        $query = $this->db->get_where( 'users', array('id' => $id) );

        // Return the first in the array.
        return array_shift( $query->result() );

    }

    // Returns an array of arrays like the one that get() returns.
    function get_list( $criteria, $limit, $offset ) {

        $query = $this->db->get_where( 'users', $criteria, $limit, $offset );

        return $query->result();

    }

    // Adds a new user to the database.
    function insert( $data ) {

        $this->db->insert( 'users', $data );

    }

    // Returns TRUE if a user with that ID exists.
    // Else returns FALSE.
    function does_exist( $id ) {

        $query = $this->db->get_where( 'users', array('id' => $id) );

        return $query->num_rows() > 0;

    }

    function update( $id ) {

        $this->id     = $id;
        $this->user   = $_POST['user'];
        $this->x      = $_POST['x'];
        $this->y      = $_POST['y'];
        $this->facing = $_POST['facing'];
        $this->skin   = $_POST['skin'];
        $this->state  = $_POST['state'];
        $this->map    = $_POST['map'];

        $this->db->update( 'users', $this, array('id' => $id) );

    }

    // Removes a user from the database.
    function delete( $id ) {

        $this->db->delete( 'users', array( 'id' => $id ) );

    }

    function set_position( $x, $y ) {

        $data = array( 'x' => $x,  'y' => $y );

        $this->db->where('id', $id);
        $this->db->update('users', $data);

    }

}

?>