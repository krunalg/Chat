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

    // Returns TRUE if there exists a column by that name.
    // Else returns FALSE.
    function has_column( $col ) {

        return $this->db->field_exists( $col, 'users' );

    }

    // Updates an existing user.
    function update( $id, $data ) {

        $this->db->update( 'users', $data, array('id' => $id) );

    }

    // Removes a user from the database.
    function delete( $id ) {

        $this->db->delete( 'users', array( 'id' => $id ) );

    }

}

?>