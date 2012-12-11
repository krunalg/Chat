<?php

if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MY_Form_validation extends CI_Form_validation {

    function __construct( $rules = array() ) {

        parent::__construct( $rules );

        // Do not encapsulate errors in HTML tags.
        $this->set_error_delimiters( '', '' );

        // Use this custom message for this custom rule.
        $this->set_message('is_direction', "The %s you provided can only be 'left', 'right', 'up', or 'down'." );

    }

    /**
     * Return TRUE if string is a direction.
     * Else return FALSE.
     *
     * @access  public
     * @param   string
     * @param
     * @return  bool
     */
    function is_direction($str) {

        $directions = array( 'left', 'right', 'up', 'down' );

        if( in_array( $str, $directions ) ) return TRUE;

        else return FALSE;

    }

}

/* End of file my_form_validation.php */
/* Location: ./application/controllers/my_form_validation.php */