<?php

if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MY_Form_validation extends CI_Form_validation {

    function __construct( $rules = array() ) {

        parent::__construct( $rules );

        // Do not encapsulate errors in HTML tags.
        $this->set_error_delimiters( '', '' );

        // Use this custom message for this custom rule.
        $this->set_message('is_direction', "The %s field must be one of the following: 'left', 'right', 'up', or 'down'." );

        $this->set_message('divides_by', "The %s field must be divisible by %s." );

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

    /**
     * Return TRUE if number divides evenly into N.
     * Else return FALSE.
     *
     * @access  public
     * @param   str   string
     * @param   n     integer
     * @return  bool
     */
    function divides_by($str, $n) {

        return intval($str) % $n === 0;

    }

}

/* End of file my_form_validation.php */
/* Location: ./application/controllers/my_form_validation.php */