<?php
class User extends CI_Controller {

	function index() {

		echo "Users";

		/*
		$data['todo_list'] = array('Clean House', 'Call Mom', 'Run Errands');

		$data['title'] = "My Real Title";
		$data['heading'] = "My Real Heading";

		$this->load->view('blogview', $data, true);
		*/

	}

	function byId( $id ) {

		$this->load->model('User_model');

		$user = $this->User_model->select( $id );

		print_r( $user );

	}
}
?>