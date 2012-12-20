<?php

class User_model extends CI_Model {

    function __construct() {

        parent::__construct();

    }

    // Returns TRUE if a user with that ID exists.
    // Else returns FALSE.
    function does_exist( $id, $table ) {

        $query = $this->db->get_where( $table, array('id' => $id) );

        return $query->num_rows() > 0;

    }

    // Returns an array containing info about a specific user.
    function get( $id, $table ) {

        $query = $this->db->get_where( $table, array('id' => $id) );

        // Return the first in the array.
        return array_shift( $query->result() );

    }

    // Returns an array of arrays like the one that get() returns.
    function get_list( $criteria, $limit, $offset, $table ) {

        $query = $this->db->get_where( $table, $criteria, $limit, $offset );

        return $query->result();

    }

    // Adds a new user to the database.
    function insert( $data, $table ) {

        $this->db->insert( $table, $data );

    }

    // Updates an existing user.
    function update( $id, $data, $table ) {

        $this->db->where( 'id', $id );

        $this->db->update( $table, $data );

    }

    // Removes a user from the database.
    function delete( $id, $table ) {

        $this->db->delete( $table, array( 'id' => $id ) );

    }

}

/* End of file user_model.php */
/* Location: ./application/controllers/user_model.php */