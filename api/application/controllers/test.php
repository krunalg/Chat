<?php

class Test extends CI_Controller {

    function __construct() {

        parent::__construct();

    }

    function index() {

        $this->load->library('curl');

        $this->load->library('unit_test');

        $this->unit->set_test_items(array('test_name', 'result', 'notes'));

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

    }

    private function _userTest() {

        $controller = 'user';


        $test_name = "Add a new user to the database.";

        $path = $controller;

        $post_data = array('username' => 'Unlikelyname');

        $response = json_decode( $this->curl->simple_post( $path, $post_data ) );

        $result = $response->code;

        $expected_result = 201;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Fetch newly added user by name.";

        $path = $controller . '/?username=Unlikelyname';

        $response = json_decode( $this->curl->simple_get( $path ) );

        $result = count( $response->data );

        $expected_result = 1;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

        // Save user ID for next tests.
        $user_id = $response->data[0]->id;


        $test_name = "Fetch newly added user by obtained ID.";

        $path = $controller . '/' . $user_id;

        $response = json_decode( $this->curl->simple_get( $path ) );

        $result = $response->code;

        $expected_result = 200;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

/*
        $test_name = "Delete newly added user by his ID.";

        $path = $controller . '/' . $user_id;

        $expected_result = 200;

        $test = $this->User_model->delete_user( $user_id );

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try to find recently deleted user by name.";

        $path = $controller;

        $expected_result = 0;

        $criteria = array('username' => 'Unlikelyname');

        $test = $this->User_model->get_users( $criteria );

        $result = count( $test['data'] );

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try to find recently deleted user by ID.";

        $path = $controller . '/' . $user_id;

        $expected_result = 404;

        $test = $this->User_model->get_user( $user_id );

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with a too-short name.";

        $path = $controller;

        $expected_result = 400;

        $_POST = array('username' => 'J');

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

        unset($_POST);


        $test_name = "Try adding a new user with no name.";

        $path = $controller;

        $expected_result = 400;

        $_POST = array('zone' => 'hi', 'direction' => 'left' );

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

        unset($_POST);


        $test_name = "Try adding a new user with a too-long name.";

        $path = $controller;

        $expected_result = 400;

        $_POST = array('username' => 'Verylongnameismuchtoolong');

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

        unset($_POST);


        $test_name = "Try adding a new user with predefined ID.";

        $path = $controller;

        $expected_result = 400;

        $_POST = array('username' => 'Legitname', 'id' => 10 );

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

        unset($_POST);


        $test_name = "Try adding a new user when there is no POST data.";

        $path = $controller;

        $expected_result = 400;

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with a bad column name.";

        $path = $controller;

        $expected_result = 400;

        $_POST = array('username' => 'Legitname', 'fakecolumn' => 'value');

        $test = $this->User_model->add_user();

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

        unset($_POST);


        $test_name = "Try to delete a non-existent user.";

        // No user exists with ID 0.
        $path = $controller . '/0' ;

        $expected_result = 404;

        $test = $this->User_model->delete_user( -1 );

        $result = $test['code'];

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);
        //*/

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */