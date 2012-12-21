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

        // Test User->Add/GetByName/GetById/Delete/GetByName
        {

            $test_name = "Add a user.";

            $expected_result = 201;

            $_POST = array('user' => 'Unlikelyname');

            $test = $this->User_model->add_user();

            $result = $test['code'];

            $this->unit->run($result, $expected_result, $test_name);

        }

        {

            $test_name = "Find a user by name.";

            $expected_result = 1;

            $criteria = array('user' => 'Unlikelyname');

            $test = $this->User_model->get_users( $criteria );

            $result = count( $test['data'] );

            $this->unit->run($result, $expected_result, $test_name);

            // Save user ID for next tests.
            $user_id = $test['data'][0]->id;

        }

        {

            $test_name = "Find a user by ID.";

            $expected_result = 200;

            $test = $this->User_model->get_user( $user_id );

            $result = $test['code'];

            $this->unit->run($result, $expected_result, $test_name);

        }

        {

            $test_name = "Delete a user by ID.";

            $expected_result = 200;

            $criteria = array('user' => 'Unlikelyname');

            $test = $this->User_model->delete_user( $user_id );

            $result = $test['code'];

            $this->unit->run($result, $expected_result, $test_name);

        }

        {

            $test_name = "Find a user that does not exist.";

            $expected_result = 0;

            $criteria = array('user' => 'Unlikelyname');

            $test = $this->User_model->get_users( $criteria );

            $result = count( $test['data'] );

            $this->unit->run($result, $expected_result, $test_name);

        }


        // Report test results.

        echo $this->unit->report();

        //print_r( $this->unit->result() );

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */