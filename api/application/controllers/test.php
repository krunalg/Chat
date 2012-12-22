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

        $controller = 'use/';


        $test_name = "Add a new user to the database.";

        $path = $controller;

        $post_data = array('username' => 'Unlikelyname');

        $response = $this->curl->simple_post( 'user', $post_data );

        $expected_result = 201;

        $result = $this->curl->info['http_code'];

        echo $this->unit->run($result, $expected_result, $test_name);

    }

}

/* End of file test.php */
/* Location: ./application/controllers/test.php */