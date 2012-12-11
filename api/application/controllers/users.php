<?php

class Users extends CI_Controller {

    function __construct() {

        parent::__construct();

        $this->load->model('User_model');

    }

    function index() {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) $this->_list_users();

        else if( $method === 'POST' ) $this->_add_user();

        else echo $this->_response( 405, "Error: That HTTP method is not supported for this URL.");

    }

    function index_with_id( $id ) {

        $method = $_SERVER['REQUEST_METHOD'];

        if( $method === 'GET' ) $this->_get_user( $id );

        else if( $method === 'POST' ) $this->_update_user( $id );

        else if( $method === 'DELETE' ) $this->_delete_user( $id );

        else echo $this->_response( 405, "Error: That HTTP method is not supported for this URL.");

    }

    // Respond with a single user.
    private function _get_user( $id ) {

        if( $this->User_model->does_exist( $id ) ) {

            $data = $this->User_model->get( $id );

            echo $this->_response( 200, 'OK', $data );

        } else {

            echo $this->_response( 404, "Error: No such user exists." );

        }

    }

    // Respond with a list of users.
    private function _list_users() {

        $limit = 10;

        $offset = 0;

        // returns all GET items with XSS filter.
        $GET = $this->input->get(NULL, TRUE);

        if( isset( $GET[ 'limit' ] ) ) {

            $limit = $GET[ 'limit' ];

            unset( $GET[ 'limit' ] );

        }

        if( isset( $GET[ 'offset' ] ) ) {

            $offset = $GET[ 'offset' ];

            unset( $GET[ 'offset' ] );

        }

        // Make empty array if no values exist.
        if( !$GET ) $GET = array();

        $column_chk_result = $this->_columns_exist( $GET, 'users' );

        if( $column_chk_result === TRUE ) {

            $data = $this->User_model->get_list( $GET, $limit, $offset );

            echo $this->_response( 200, 'OK', $data );

        } else {

            // A column was supplied that does not exist.
            echo $this->_response( 500, "Error: No such column $column_chk_result" );

        }

    }

    // Update a user.
    private function _update_user( $id ) {

        // Check that user exists.
        if( $this->User_model->does_exist( $id ) ) {

            $this->load->library('form_validation');

            // Does POST data pass validation?
            if( $this->form_validation->run('update_user') ) {

                // Returns all POST items with XSS filter.
                $data = $this->input->post(NULL, TRUE);

                // Is an attempt being made to change the user ID?
                if( array_key_exists( 'id', $data ) ) {

                    echo $this->_response( 403, "Error: Changing a user's ID is forbidden." );

                } else  {

                    $column_chk_result = $this->_columns_exist( $data, 'users' );

                    // Do columns exist for all submitted values?
                    if( $column_chk_result === TRUE ) {

                       $this->User_model->update( $id, $data );

                       echo $this->_response( 200, "Success: User updated." );

                    } else {

                        // A column was supplied that does not exist.
                        echo $this->_response( 500, "Error: No such column $column_chk_result" );

                    }

                }

            }  else {

                // Form validation failed.
                echo $this->_response( 400, validation_errors() );

            }

        } else {

            echo $this->_response( 404, "Error: No such user exists." );

        }

    }

    // Delete a user.
    private function _delete_user( $id ) {

        // Check that user exists.
        if( $this->User_model->does_exist( $id ) ) {

            // Delete user.
            $this->User_model->delete( $id );

            echo $this->_response( 200, "Success: User was removed." );

        } else {

            echo $this->_response( 500, "Error: No such user exists." );

        }

    }

    // Add a new user.
    private function _add_user() {

        $this->load->library('form_validation');

        // Does POST data pass validation?
        if( $this->form_validation->run('add_user') ) {

            // Returns all POST items with XSS filter.
            $PUT = $this->input->post(NULL, TRUE);

            $column_chk_result = $this->_columns_exist( $PUT, 'users' );

            if( $column_chk_result === TRUE ) {

                // Add user to database.
                $this->User_model->insert( $PUT );

                $user_id = $this->db->insert_id();

                // Allows us to use base_url().
                $this->load->helper('url');

                $location = base_url() . 'users/' . $user_id;

                echo $this->_response( 201, "Success: Added user.", NULL, $location );

            } else {

                // A column was supplied that does not exist.
                echo $this->_response( 500, "Error: No such column $column_chk_result" );

            }

        } else {

            // Form validation failed.
            echo $this->_response( 400, validation_errors() );

        }

    }

    // Sets HTTP headers and generates a JSON response
    // which can be used for output.
    private function _response( $code, $message, $data = NULL, $location = '' ) {

        if( $code == 201 ) {

            // Special case requires URL of newly created resource.

            $this->output->set_header("HTTP/1.1 201 Created");

            $this->output->set_header("Location: $location");

        } else {

            $this->output->set_status_header( $code );

        }

        // If no data is supplied, leave the field out.
        if( !isset( $data ) ) $response = array( 'code' => $code, 'message' => $message );

        // But if data is supplied, then add it.
        else $response = array( 'code' => $code, 'message' => $message, 'data' => $data );

        $this->output->set_content_type('application/json');

        $json = json_encode( $response );

        return $json;

    }

    // Returns TRUE if the array of values supplied
    // each correspond to a column in the database table.
    // Else returns the value of the bad column.
    private function _columns_exist( $columns, $table ) {

        foreach( $columns as $key => $value ) {

            if( !$this->db->field_exists( $key, $table ) ) {

                return $key;

            }

        }

        return TRUE;

    }

}

/* End of file users.php */
/* Location: ./application/controllers/users.php */