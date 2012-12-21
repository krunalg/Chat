<?php

class Test extends CI_Controller {

    function __construct() {

        parent::__construct();

    }

    function index() {

        $this->unit->use_strict(TRUE);

        $this->load->library('unit_test');

        echo "Test";

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */