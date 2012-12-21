<?php

class Test extends CI_Controller {

    function __construct() {

        parent::__construct();

    }

    function index() {

        $this->load->library('unit_test');

        $this->unit->set_test_items(array('test_name', 'result'));

        $this->unit->use_strict(TRUE);

        // Test User_model

        $this->load->model('User_model');


        // Test

        $data = array();

        $data['sdfsdfsdfdf'] = "Bigred";

        $test = $this->User_model->add_user( $data );

        $result = $test['code'];

        $expected_result = 201;

        print_r($test);

        $test_name = "Add a user.";

        $this->unit->run($result, $expected_result, $test_name);



        // Report test results.

        echo $this->unit->report();

        //print_r( $this->unit->result() );

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */