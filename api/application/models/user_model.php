<?php

class User_model extends CI_Model {

    function __construct() {

        parent::__construct();

        // Name of table containing users.
        $this->tbl_user = 'user';

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

    /*
    // Returns an array of arrays like the one that get() returns.
    function get_list( $criteria, $limit, $offset, $table ) {

        $query = $this->db->get_where( $table, $criteria, $limit, $offset );

        return $query->result();

    }
    */

    /*
    // Adds a new user to the database.
    function insert( $data, $table ) {

        $this->db->insert( $table, $data );

    }
    */

    // Updates an existing user.
    function update( $id, $data, $table ) {

        $this->db->where( 'id', $id );

        $this->db->update( $table, $data );

    }

    // Removes a user from the database.
    function delete( $id, $table ) {

        $this->db->delete( $table, array( 'id' => $id ) );

    }

















    // Respond with a list of users.
    function get_users() {

        $limit = 10;

        $offset = 0;

        // returns all GET items with XSS filter.
        $criteria = $this->input->get(NULL, TRUE);

        if( isset( $criteria[ 'limit' ] ) ) {

            $limit = $criteria[ 'limit' ];

            unset( $criteria[ 'limit' ] );

        }

        if( isset( $criteria[ 'offset' ] ) ) {

            $offset = $criteria[ 'offset' ];

            unset( $criteria[ 'offset' ] );

        }

        // Make empty array if no values exist.
        if( !$criteria ) $criteria = array();

        $column_chk_result = $this->_columns_exist( $criteria, $this->tbl_user );

        if( $column_chk_result === TRUE ) {

            $query = $this->db->get_where( $this->tbl_user, $criteria, $limit, $offset );

            $data = $query->result();

            $user_count = count( $data );

            echo $this->_response( 200, "Showing $user_count users.", $data );

        } else {

            // A column was supplied that does not exist.
            echo $this->_response( 500, "Error: No such column $column_chk_result" );

        }

    }

    // Add a new user.
    function add_user() {

        $this->load->library('form_validation');

        // Does POST data pass validation?
        if( $this->form_validation->run('add_user') ) {

            // Returns all POST data with XSS filter.
            $data = $this->input->post(NULL, TRUE);

            $column_chk_result = $this->_columns_exist( $data, $this->tbl_user );

            if( $column_chk_result === TRUE ) {

                // Add user to database.
                $this->db->insert( $this->tbl_user, $data );

                $user_id = $this->db->insert_id();

                // Allows us to use base_url().
                $this->load->helper('url');

                $location = base_url() . $this->tbl_user . '/' . $user_id;

                echo $this->_response( 201, "Success: Added user.", NULL, $location );

            } else {

                // A column was supplied that does not exist.
                echo $this->_response( 500, "Error: No such column $column_chk_result" );

            }

        } else {

            // Form validation failed.
            echo $this->_response( 400, 'Error validating: ' . validation_errors() );

        }

    }











    // Returns TRUE if the array of values supplied
    // each correspond to a column in the database table.
    // Else returns the value of the bad column.
    private function _columns_exist( $columns, $table ) {

        foreach( $columns as $key => $value ) {

            if( !$this->db->field_exists( $key, $table ) ) {

                return $key;

            }

        }

        return TRUE;

    }

    // Sets HTTP headers and generates a JSON response
    // which can be used for output.
    private function _response( $code, $message, $data = NULL, $location = '' ) {

        if( $code == 201 ) {

            // Special case requires URL of newly created resource.

            $this->output->set_header("HTTP/1.1 201 Created");

            $this->output->set_header("Location: $location");

        } else {

            $this->output->set_status_header( $code );

        }

        // If no data is supplied, leave the field out.
        if( !isset( $data ) ) $response = array( 'code' => $code, 'message' => $message );

        // But if data is supplied, then add it.
        else $response = array( 'code' => $code, 'message' => $message, 'data' => $data );

        $this->output->set_content_type('application/json');

        $json = json_encode( $response );

        return $json;

    }



}

/* End of file user_model.php */
/* Location: ./application/controllers/user_model.php */