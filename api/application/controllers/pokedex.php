<?php

// This controller is a lot like experience.php
// and perhaps one controller could be made
// and then this one and the other could extend it.
// (And maybe the same for the models?)

class Pokedex extends CI_Controller {

    function __construct() {

        parent::__construct();

        $this->load->model('Pokedex_model');

    }

    function index() {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) {

            // Returns all GET data with XSS filter.
            $criteria = $this->input->get(NULL, TRUE);

            $response = $this->Pokedex_model->get_list( $criteria );

            $this->load->view( 'json_response', $response );

        } else {

            // Duplicate line.
            $data = array( "code" => 405, "message" => "That is an unsupported HTTP method." );

            $this->load->view( 'json_response', $data );

        }

    }

}

/* End of file pokedex.php */
/* Location: ./application/controllers/pokedex.php */