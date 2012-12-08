<?php

class User extends CI_Controller {

	function index() {

		$method = $_SERVER['REQUEST_METHOD'];

		if( $method === 'GET' ) {

			echo 'GET';

		} else if( $method === 'PUT' ) {

			echo 'PUT';

		} else if( $method === 'POST' ) {

			echo 'POST';

		} else if( $method === 'DELETE' ) {

			echo 'DELETE';

		}

	}

	// respond with information about a user
	private function _get() {



	}

	// create a new user and respond with a status/errors
	private function _put() {



	}

	// update an existing user and respond with a status/errors
	private function _post() {



	}

	// delete a user and respond with a status/errors
	private function _delete() {



	}

	function add() {

		if( $_SERVER['REQUEST_METHOD'] === 'POST' ) {

			$this->load->model('User_model');

			$user = $this->User_model->insert();

		} else {

			echo "POST method required.";

		}

	}

	function byId( $id ) {

		$this->load->model('User_model');

		$user = $this->User_model->select( $id );

		print_r( $user );

	}

}

?>