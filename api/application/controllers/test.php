<?php

class Test extends CI_Controller {

    function __construct() {

        parent::__construct();

    }

    function index() {

        $this->load->library('unit_test');

        $this->unit->set_test_items(array('test_name', 'result'));

        $this->unit->use_strict(TRUE);



        $test = 1 + 1;

        $expected_result = 2;

        $test_name = 'Adds one plus one';

        echo $this->unit->run($test, $expected_result, $test_name);

        $test = 2 + 2;

        $expected_result = 4;

        $test_name = 'Adds two plus two';

        echo $this->unit->run($test, $expected_result, $test_name);




        echo $this->unit->report();

        //print_r( $this->unit->result() );

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */