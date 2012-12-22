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

    /**
     * Sends an HTTP Request which expects a JSON response
     * and upon success decodes the JSON, returning it
     * as an object. Returns FALSE on failure.
     *
     * @access  private
     * @param   method       string
     * @param   path         string
     * @param   data         array
     * @return  object/bool
     */
    private function apiReponseObj( $method, $path, $data = NULL ) {

        if( strtoupper( $method ) === 'GET') {

            return json_decode( $this->curl->simple_get( $path ) );

        } else if( strtoupper( $method ) === 'POST' ) {

            return json_decode( $this->curl->simple_post( $path, $data ) );

        } else if(strtoupper( $method ) === 'DELETE' ) {

            $this->curl->create( $path );

            $this->curl->option(CURLOPT_POSTFIELDS, 'DELETE');

            $this->curl->option(CURLOPT_CUSTOMREQUEST, 'DELETE');

            return json_decode( $this->curl->execute() );

        }

        return FALSE;

    }

    private function _userTest() {

        $controller = 'user';


        $test_name = "Add a new user to the database.";

        $path = $controller;

        $post_data = array('username' => 'Unlikelyname');

        $response = $this->apiReponseObj('POST', $path, $post_data);

        $result = $response->code;

        $expected_result = 201;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Fetch newly added user by name.";

        $path = $controller . '/?username=Unlikelyname';

        $response = $this->apiReponseObj('GET', $path );

        $result = count( $response->data );

        $expected_result = 1;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

        // Save user ID for next tests.
        $user_id = $response->data[0]->id;


        $test_name = "Fetch newly added user by obtained ID.";

        $path = $controller . '/' . $user_id;

        $response = $this->apiReponseObj('GET', $path );

        $result = $response->code;

        $expected_result = 200;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Delete newly added user by his ID.";

        $path = $controller . '/' . $user_id;

        $response = $this->apiReponseObj('DELETE', $path );

        $result = $response->code;

        $expected_result = 200;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try to find recently deleted user by name.";

        $path = $controller . '/?username=Unlikelyname';

        $response = $this->apiReponseObj('GET', $path );

        $result = count( $response->data );

        $expected_result = 0;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try to find recently deleted user by ID.";

        $path = $controller . '/' . $user_id;

        $response = $this->apiReponseObj('GET', $path );

        $result = $response->code;

        $expected_result = 404;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with a too-short name.";

        $path = $controller;

        $post_data = array('username' => 'J');

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with no name.";

        $path = $controller;

        $post_data = array('zone' => 'hi', 'direction' => 'left' );

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with a too-long name.";

        $path = $controller;

        $post_data = array('username' => 'Verylongnameismuchtoolong');

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with predefined ID.";

        $path = $controller;

        $post_data = array('username' => 'Legitname', 'id' => 10 );

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user when there is no POST data.";

        $path = $controller;

        $post_data = array();

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with a bad column name.";

        $path = $controller;

        $post_data = array('username' => 'Legitname', 'fakecolumn' => 'value');

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with an invalid direction.";

        $path = $controller;

        $post_data = array('username' => 'Legitname', 'direction' => 'sideways');

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with an invalid x value.";

        $path = $controller;

        $post_data = array('username' => 'Legitname', 'x' => 'abc');

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with an invalid y value.";

        $path = $controller;

        $post_data = array('username' => 'Legitname', 'y' => 'abc');

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with an invalid zone name.";

        $path = $controller;

        $post_data = array('username' => 'Legitname', 'zone' => 'B@dZoneName');

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try adding a new user with an invalid skin name.";

        $path = $controller;

        $post_data = array('username' => 'Legitname', 'skin' => 'skin27');

        $response = $this->apiReponseObj('POST', $path, $post_data );

        $result = $response->code;

        $expected_result = 400;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);


        $test_name = "Try to delete a non-existent user.";

        // No user exists with ID 0.
        $path = $controller . '/0' ;

        $response = $this->apiReponseObj('DELETE', $path );

        $result = $response->code;

        $expected_result = 404;

        echo $this->unit->run($result, $expected_result, $test_name, $response->message);

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */