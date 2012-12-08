<?php

class User extends CI_Controller {

    function index() {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) $this->_get();

        else if( $method === 'POST' ) $this->_post();

        //else if( $method === 'PUT' ) $this->_put();

        //else if( $method === 'DELETE' ) $this->_delete();

    }

    // respond with information about a user
    private function _get() {

        $this->load->model('User_model');

        $users = $this->User_model->read();

        $json = json_encode( $users );

        echo $json;

    }

    // update an existing user and respond with a status/errors
    private function _post() {

        echo 'update an existing user and respond with a status/errors';

    }

    /*
    // create a new user and respond with a status/errors
    private function _put() {

        $this->load->model('User_model');

        $user = $this->User_model->insert();

    }

    // delete a user and respond with a status/errors
    private function _delete() {

        echo 'delete a user and respond with a status/errors';

    }
    */













    function add() {

        if( $_SERVER['REQUEST_METHOD'] === 'POST' ) {

            $this->load->model('User_model');

            $user = $this->User_model->insert();

        } else {

            echo "POST method required.";

        }

    }

    function byId( $id ) {

        $this->load->model('User_model');

        $user = $this->User_model->select( $id );

        $json = json_encode( $user );

        echo $json;

    }

}

?>