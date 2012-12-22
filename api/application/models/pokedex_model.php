<?php

class Pokedex_model extends CI_Model {

    function __construct() {

        parent::__construct();

        // Name of containing database table.
        $this->table = 'pokedex';

    }

    // Respond with a list of users.
    public function get_list( $criteria ) {

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

            $message = 'Showing ' . count( $data ) . ' results.';

            $next_page = "?offset=" . ( $offset + $limit ) . "&limit=$limit";

            return array( "code" => $code, "message" => $message, "next_page" => $next_page, "data" => $data );

        } else {

            $code = 400;

            // Duplicate message.
            $message = "Invalid column specified: $column_chk_result";

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

}

/* End of file pokedex_model.php */
/* Location: ./application/controllers/pokedex_model.php */