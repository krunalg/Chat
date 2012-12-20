<?php

class User extends CI_Controller {

    function __construct() {

        parent::__construct();

        $this->load->model('User_model');

        // Name of table containing users.
        $this->tbl_user = 'user';

    }

    function index() {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) {

            // Returns all GET data with XSS filter.
            $criteria = $this->input->get(NULL, TRUE);

            $response = $this->User_model->get_users( $criteria );

            $this->load->view( 'json_response', $response );

        } else if( $method === 'POST' ) {

            // Returns all POST data with XSS filter.
            $post_data = $this->input->post(NULL, TRUE);

            $response = $this->User_model->add_user( $post_data );

            $this->load->view( 'json_response', $response );

        } else {

            $data = array( "code" => 405, "message" => "That is an unsupported HTTP method." );

            $this->load->view( 'json_response', $data );

        }

    }

    function index_with_id( $id ) {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) {

            $this->User_model->get_user( $id );

        } else if( $method === 'POST' ) {

            // Returns all POST data with XSS filter.
            $input = $this->input->post(NULL, TRUE);

            $data = $this->User_model->update_user( $id, $input );

            $this->load->view( 'json_response', $data );

        } else if( $method === 'DELETE' ) {

            $data = $this->User_model->delete_user( $id );

            $this->load->view( 'json_response', $data );

        } else {

            $data = array( "code" => 405, "message" => "That is an unsupported HTTP method." );

            $this->load->view( 'json_response', $data );

        }

    }

}

/* End of file user.php */
/* Location: ./application/controllers/user.php */