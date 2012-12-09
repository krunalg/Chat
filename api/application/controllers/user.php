<?php

class User extends CI_Controller {

    function __construct() {

        parent::__construct();

        $this->load->model('User_model');

    }

    function index() {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) $this->_get();

        else if( $method === 'POST' ) $this->_post();

        //else if( $method === 'PUT' ) $this->_put();

        //else if( $method === 'DELETE' ) $this->_delete();

        else {

            header('HTTP/1.1 405 Method Not Allowed');

        }

    }

    function user_by_id( $id ) {

        $user = $this->User_model->get_user( $id );

        $json = json_encode( $user );

        echo $json;

    }

    // respond with a list of users
    private function _get() {

        $users = $this->User_model->list_users();

        $json = json_encode( $users );

        echo $json;

    }

    // Add a new user.
    private function _post() {

        $this->load->library('form_validation');

        // Do not encapsulate error messages in HTML tags.
        $this->form_validation->set_error_delimiters('', '');

        $this->form_validation->set_rules('user', 'Username', 'required|is_unique[users.user]|min_length[3]|max_length[12]');

        $this->form_validation->set_rules('skin', 'Skin', 'required|alpha');

        if ($this->form_validation->run() == FALSE) {

            // Problem with submitted data.

            header('HTTP/1.1 500 Internal Server Error');

            echo validation_errors();

        } else {

            // No problem with submitted data.
            // Add user to database.

            $user = $this->User_model->add_user();

            if( $user ) {

                header('HTTP/1.1 201 Created');

                header("Location: $user");

            } else {

                header('HTTP/1.1 500 Internal Server Error');

            }

        }

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