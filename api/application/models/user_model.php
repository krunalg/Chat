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

    function select( $id ) {

        $query = $this->db->get_where( 'users', array('id' => $id) );

        $result = $query->result();
        $result = $result[0];

        $this->id     = $id;
        $this->user   = $result->user;
        $this->x      = $result->x;
        $this->y      = $result->y;
        $this->facing = $result->facing;
        $this->skin   = $result->skin;
        $this->state  = $result->state;
        $this->map    = $result->map;

        return $result;

    }

    function insert() {

        $this->title   = $_POST['title']; // please read the below note
        $this->content = $_POST['content'];
        $this->date    = time();

        $this->db->insert('entries', $this);

    }

    function update() {

        $this->title   = $_POST['title'];
        $this->content = $_POST['content'];
        $this->date    = time();

        $this->db->update('entries', $this, array('id' => $_POST['id']));

    }

}

?>