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
        $this->_userTest();


        // Report test results.

        echo $this->unit->report();

        //print_r( $this->unit->result() );

    }

    private function _userTest() {

        $this->load->model('User_model');


        $test_name = "Add a new user to the database.";

        $expected_result = 201;

        $_POST = array('user' => 'Unlikelyname');

        $test = $this->User_model->add_user();

        $result = $test['code'];

        $this->unit->run($result, $expected_result, $test_name);

        unset($_POST);


        $test_name = "Fetch newly added user by name.";

        $expected_result = 1;

        $criteria = array('user' => 'Unlikelyname');

        $test = $this->User_model->get_users( $criteria );

        $result = count( $test['data'] );

        $this->unit->run($result, $expected_result, $test_name);

        // Save user ID for next tests.
        $user_id = $test['data'][0]->id;


        $test_name = "Fetch newly added user by obtained ID.";

        $expected_result = 200;

        $test = $this->User_model->get_user( $user_id );

        $result = $test['code'];

        $this->unit->run($result, $expected_result, $test_name);


        $test_name = "Delete newly added user by his ID.";

        $expected_result = 200;

        $criteria = array('user' => 'Unlikelyname');

        $test = $this->User_model->delete_user( $user_id );

        $result = $test['code'];

        $this->unit->run($result, $expected_result, $test_name);


        $test_name = "Try to find recently deleted user in the database.";

        $expected_result = 0;

        $criteria = array('user' => 'Unlikelyname');

        $test = $this->User_model->get_users( $criteria );

        $result = count( $test['data'] );

        $this->unit->run($result, $expected_result, $test_name);

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */