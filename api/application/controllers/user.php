<?php

class User extends CI_Controller {

    function __construct() {

        parent::__construct();

        $this->load->model('User_model');

    }

    function index() {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) $this->_list_users();

        else if( $method === 'POST' ) $this->_add_user();

        //else if( $method === 'PUT' ) $this->_put();

        //else if( $method === 'DELETE' ) $this->_delete();

        else {

            header('HTTP/1.1 405 Method Not Allowed');

            echo $this->_response( 405, "The HTTP method you used is not allowed for this URL.");

            return;

        }

    }

    function user_by_id( $id ) {

        $user = $this->User_model->get_user( $id );

        $json = json_encode( $user );

        echo $json;

    }

    // respond with a list of users
    private function _list_users() {

        $limit = 10;

        $offset = 0;

        // returns all GET items with XSS filter.
        $GET = $this->input->get(NULL, TRUE);

        if( isset( $GET[ 'limit' ] ) ) {

            $limit = $GET[ 'limit' ];

            unset( $GET[ 'limit' ] );

        }

        if( isset( $GET[ 'offset' ] ) ) {

            $offset = $GET[ 'offset' ];

            unset( $GET[ 'offset' ] );

        }

        $users = $this->User_model->list_users( $GET, $limit, $offset );

        $json = json_encode( $users );

        echo $json;

    }

    // Add a new user.
    private function _add_user() {

        $this->load->library('form_validation');

        $this->form_validation->set_error_delimiters('', '');

        $this->form_validation->set_rules('user', 'Username', 'required|is_unique[users.user]|min_length[3]|max_length[12]');

        // Does POST data pass validation?
        if( $this->form_validation->run() ) {

            // Returns all POST items with XSS filter.
            $PUT = $this->input->post(NULL, TRUE);

            // Ensure each field corresponds to a column.
            foreach( $PUT as $key => $value ) {

                if( !$this->db->field_exists( $key, 'users' ) ) {

                    header('HTTP/1.1 500 Internal Server Error');

                    echo $this->_response( 500, "No such column exists in the database: $key" );

                    return;

                }

            }

            // Add user to database.
            $this->User_model->insert( $PUT );

            $user_id = $this->db->insert_id();

            // Allows us to use base_url().
            $this->load->helper('url');

            $location = base_url() . $user_id;

            header('HTTP/1.1 201 Created');

            header("Location: $location");

            echo $this->_response( 201, "Successfully added user." );

            return;

        } else {

            // Problem with submitted data.

            header('HTTP/1.1 500 Internal Server Error');

            echo $this->_response( 500, validation_errors() );

            return;

        }

    }

    private function _response( $code, $message ) {

        $response = array( 'code' => $code, 'message' => $message );

        $json = json_encode( $response );

        return $json;

    }

    /*
    // create a new user and respond with a status/errors
    private function _put() {

        $user = $this->User_model->insert();

    }

    // delete a user and respond with a status/errors
    private function _delete() {

        echo 'delete a user and respond with a status/errors';

    }
    */

}

?>