<?php

class Test extends CI_Controller {

    function __construct() {

        parent::__construct();

    }

    function index() {

        $this->load->library('unit_test');

        $this->unit->set_test_items(array('test_name', 'result'));

        $template = '
        <table style="width:100%; font-size:small; margin:10px 0; border-collapse:collapse; border:1px solid #CCC;">
            {rows}
                <tr>
                <th style="text-align: left; border-bottom:1px solid #CCC; width: 100px;">{item}</th>
                <td style="border-bottom:1px solid #CCC;">{result}</td>
                </tr>
            {/rows}
        </table>';

        $this->unit->set_template($template);

        $this->unit->use_strict(TRUE);

        // Test User_model
        $this->_userTest();


        // Report test results.
        //echo $this->unit->report();

        //print_r( $this->unit->result() );

    }

    private function _userTest() {

        $this->load->model('User_model');


        $test_name = "Add a new user to the database.";

        $expected_result = 201;

        $_POST = array('username' => 'Unlikelyname');

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);

        unset($_POST);


        $test_name = "Fetch newly added user by name.";

        $expected_result = 1;

        $criteria = array('username' => 'Unlikelyname');

        $test = $this->User_model->get_users( $criteria );

        $result = count( $test['data'] );

        echo $this->unit->run($result, $expected_result, $test_name);

        // Save user ID for next tests.
        $user_id = $test['data'][0]->id;


        $test_name = "Fetch newly added user by obtained ID.";

        $expected_result = 200;

        $test = $this->User_model->get_user( $user_id );

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);


        $test_name = "Delete newly added user by his ID.";

        $expected_result = 200;

        $test = $this->User_model->delete_user( $user_id );

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);


        $test_name = "Try to find recently deleted user by name.";

        $expected_result = 0;

        $criteria = array('username' => 'Unlikelyname');

        $test = $this->User_model->get_users( $criteria );

        $result = count( $test['data'] );

        echo $this->unit->run($result, $expected_result, $test_name);


        $test_name = "Try to find recently deleted user by ID.";

        $expected_result = 404;

        $test = $this->User_model->get_user( $user_id );

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);


        $test_name = "Try adding a new user with a too-short name.";

        $expected_result = 400;

        $_POST = array('username' => '');

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);

        unset($_POST);


        $test_name = "Try adding a new user with a too-long name.";

        $expected_result = 400;

        $_POST = array('username' => 'Verylongnameismuchtoolong');

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);

        unset($_POST);


        $test_name = "Try adding a new user with predefined ID.";

        $expected_result = 400;

        $_POST = array('username' => 'Legitname', 'id' => 10 );

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);

        unset($_POST);


        $test_name = "Try adding a new user when there is no POST data.";

        $expected_result = 400;

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);


        $test_name = "Try adding a new user with a bad column name.";

        $expected_result = 400;

        $_POST = array('username' => 'Legitname', 'fakecolumn' => 'value');

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);

        unset($_POST);


        $test_name = "Try to delete a non-existent user.";

        $expected_result = 404;

        $test = $this->User_model->delete_user( -1 );

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name);

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */