<?php

class User_model extends CI_Model {

    function __construct() {

        parent::__construct();

        // Name of table containing users.
        $this->table = 'user';

    }

    // Returns TRUE if a user with that ID exists.
    // Else returns FALSE.
    private function user_exists( $id, $table ) {

        $query = $this->db->get_where( $table, array('id' => $id) );

        return $query->num_rows() > 0;

    }

    // Respond with a single user.
    public function get_user( $id ) {

        if( $this->user_exists( $id, $this->table ) ) {

            $query = $this->db->get_where( $this->table, array('id' => $id) );

            // Take the first of the array.
            $data = array_shift( $query->result() );

            $code = 200;

            $message = 'Showing one user.';

            return array( "code" => $code, "message" => $message, "data" => $data );

        } else {

            $code = 404;

            $message = "No such user exists.";

        }

        return array( "code" => $code, "message" => $message );

    }

    // Respond with a list of users.
    public function get_users( $criteria ) {

        $limit = 10;

        $offset = 0;

        if( isset( $criteria[ 'limit' ] ) ) {

            $limit = $criteria[ 'limit' ];

            unset( $criteria[ 'limit' ] );

        }

        if( isset( $criteria[ 'offset' ] ) ) {

            $offset = $criteria[ 'offset' ];

            unset( $criteria[ 'offset' ] );

        }

        // Make empty array if no values exist.
        if( !$criteria ) $criteria = array();

        $column_chk_result = $this->_columns_exist( $criteria, $this->table );

        if( $column_chk_result === TRUE ) {

            $query = $this->db->get_where( $this->table, $criteria, $limit, $offset );

            $data = $query->result();

            $code = 200;

            $message = 'Showing ' . count( $data ) . ' users.';

            return array( "code" => $code, "message" => $message, "data" => $data );

        } else {

            $code = 500;

            // Duplicate message.
            $message = "Invalid column specified: $column_chk_result";

        }

        return array( "code" => $code, "message" => $message );

    }

    // Add a new user.
    public function add_user( $data ) {

        $this->load->library('form_validation');

        // Does POST data pass validation?
        if( $this->form_validation->run('add_user') ) {

            $column_chk_result = $this->_columns_exist( $data, $this->table );

            if( $column_chk_result === TRUE ) {

                // Add user to database.
                $this->db->insert( $this->table, $data );

                $user_id = $this->db->insert_id();

                // Allows us to use base_url().
                $this->load->helper('url');

                $location = base_url() . $this->table . '/' . $user_id;

                $code = 201;

                $message = "Successfully added user.";

                return array( "code" => $code, "message" => $message, "location" => $location );

            } else {

                $code = 500;

                // Duplicate message.
                $message = "Invalid column specified: $column_chk_result";

            }

        } else {

            $code = 400;

            // Duplicate message.
            $message = "Validation failure: " . validation_errors();

        }

        return array( "code" => $code, "message" => $message );

    }

    // Update a user.
    public function update_user( $id, $data ) {

        // Check that user exists.
        if( $this->user_exists( $id, $this->table ) ) {

            $this->load->library('form_validation');

            // Does POST data pass validation?
            if( $this->form_validation->run('update_user') ) {

                // Is an attempt being made to change the user ID?
                if( array_key_exists( 'id', $data ) ) {

                    $code = 403;

                    $message = "Changing a user's ID is forbidden.";

                } else  {

                    $column_chk_result = $this->_columns_exist( $data, $this->table );

                    // Do columns exist for all submitted values?
                    if( $column_chk_result === TRUE ) {

                        $this->db->where( 'id', $id );

                        $this->db->update( $this->table, $data );

                        $code = 200;

                        $message = "User data was updated successfully.";

                    } else {

                        $code = 500;

                        // Duplicate message.
                        $message = "Invalid column specified: $column_chk_result";

                    }

                }

            }  else {

                $code = 400;

                // Duplicate message.
                $message = "Validation failure: " . validation_errors();

            }

        } else {

            $code = 404;

            $message = "No such user exists.";

        }

        return array( "code" => $code, "message" => $message );

    }

    // Delete a user.
    public function delete_user( $id ) {

        // Check that user exists.
        if( $this->User_model->user_exists( $id, $this->table ) ) {

            $this->db->delete( $this->table, array( 'id' => $id ) );

            $code = 200;

            $message = "Success: User was removed.";

        } else {

            $code = 500;

            $message = "Error: No such user exists.";

        }

        return array( "code" => $code, "message" => $message );

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

}

/* End of file user_model.php */
/* Location: ./application/controllers/user_model.php */