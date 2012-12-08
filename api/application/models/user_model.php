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

    function get_user( $id ) {

        $query = $this->db->get_where( 'users', array('id' => $id) );

        // Return the first in the array.
        return array_shift( $query->result() );

    }

    function list_users() {

        $limit = 10;

        $offset = 0;

        // returns all GET items with XSS filter
        $get = $this->input->get(NULL, TRUE);

        if( isset( $get[ 'limit' ] ) ) {

            $limit = $get[ 'limit' ];

            unset( $get[ 'limit' ] );

        }

        if( isset( $get[ 'offset' ] ) ) {

            $offset = $get[ 'offset' ];

            unset( $get[ 'offset' ] );

        }

        $where = array();

        if( $get ) {

            foreach( $get as $key => $value ) {

                $where[ $key ] = $value;

            }

        }

        $query = $this->db->get_where( 'users', $where, $limit, $offset );

        return $query->result();

    }

    function insert() {

        $this->user   = $this->input->post('user');
        $this->x      = $this->input->post('x');
        $this->y      = $this->input->post('y');
        $this->facing = $this->input->post('facing');
        $this->skin   = $this->input->post('skin');
        $this->state  = $this->input->post('state');
        $this->map    = $this->input->post('map');

        $this->db->insert('users', $this);

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