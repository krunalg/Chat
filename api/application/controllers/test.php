<?php

class Test extends CI_Controller {

    function __construct() {

        parent::__construct();

    }

    function index() {

        $this->load->library('unit_test');

        $this->unit->use_strict(TRUE);

        echo "Test";

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */