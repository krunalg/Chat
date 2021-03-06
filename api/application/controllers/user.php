<?php

class User extends CI_Controller {

    function __construct() {

        parent::__construct();

        $this->load->model('User_model');

    }

    function index() {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) {

            // Returns all GET data with XSS filter.
            $criteria = $this->input->get(NULL, TRUE);

            $response = $this->User_model->get_users( $criteria );

            $this->load->view( 'json_response', $response );

        } else if( $method === 'POST' ) {

            $response = $this->User_model->add_user();

            $this->load->view( 'json_response', $response );

        } else {

            // Duplicate line.
            $data = array( "code" => 405, "message" => "That is an unsupported HTTP method." );

            $this->load->view( 'json_response', $data );

        }

    }

    function index_with_id( $id ) {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) {

            $response = $this->User_model->get_user( $id );

            $this->load->view( 'json_response', $response );

        } else if( $method === 'POST' ) {

            $response = $this->User_model->update_user( $id );

            $this->load->view( 'json_response', $response );

        } else if( $method === 'DELETE' ) {

            $response = $this->User_model->delete_user( $id );

            $this->load->view( 'json_response', $response );

        } else {

            // Duplicate line.
            $data = array( "code" => 405, "message" => "That is an unsupported HTTP method." );

            $this->load->view( 'json_response', $data );

        }

    }

}

/* End of file user.php */
/* Location: ./application/controllers/user.php */