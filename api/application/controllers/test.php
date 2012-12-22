    <?php

    class Test extends CI_Controller {

        function __construct() {

            parent::__construct();

        }

        function index() {

            $this->load->library('curl');

            // Simple call to remote URL
            echo $this->curl->simple_get('http://google.com/');

        }

    }

    /* End of file test.php */
    /* Location: ./application/controllers/test.php */