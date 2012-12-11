<?php

if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MY_Form_validation extends CI_Form_validation {

    /**
	 * Return TRUE if string is a direction.
	 * Else return FALSE.
	 *
	 * @access	public
	 * @param	string
	 * @param
	 * @return	bool
	 */
    function is_direction($str) {

        $directions = array( 'left', 'right', 'up', 'down' );

        if( in_array( $str, $directions ) ) return TRUE;

        else return FALSE;

    }

}

/* End of file my_form_validation.php */
/* Location: ./application/controllers/my_form_validation.php */