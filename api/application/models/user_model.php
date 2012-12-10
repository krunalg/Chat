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

    function get( $id ) {

        $query = $this->db->get_where( 'users', array('id' => $id) );

        // Return the first in the array.
        return array_shift( $query->result() );

    }

    function list_users( $criteria, $limit, $offset ) {

        $query = $this->db->get_where( 'users', $criteria, $limit, $offset );

        return $query->result();

    }

    function insert( $data ) {

        $this->db->insert( 'users', $data );

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

    function set_position( $x, $y ) {

        $data = array( 'x' => $x,  'y' => $y );

        $this->db->where('id', $id);
        $this->db->update('users', $data);

    }

}

?>