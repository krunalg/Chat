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

        foreach( $get as $key => $value ) {

            $where[ $key ] = $value;

        }

        $users = $this->User_model->read( $where, $limit, $offset );

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