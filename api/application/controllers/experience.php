<?php

// This controller is a lot like pokedex.php
// and perhaps one controller could be made
// and then this one and the other could extend it.
// (And maybe the same for the models?)

class Experience extends CI_Controller {

    function __construct() {

        parent::__construct();

        $this->load->model('Experience_model');

    }

    function index() {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) {

            // Returns all GET data with XSS filter.
            $criteria = $this->input->get(NULL, TRUE);

            $response = $this->Experience_model->get_list( $criteria );

            $this->load->view( 'json_response', $response );

        } else {

            // Duplicate line.
            $data = array( "code" => 405, "message" => "That is an unsupported HTTP method." );

            $this->load->view( 'json_response', $data );

        }

    }

}

/* End of file experience.php */
/* Location: ./application/controllers/experience.php */