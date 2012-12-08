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

        $user = $this->User_model->add_user();

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