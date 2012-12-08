<?php
class User extends CI_Controller {

	function index() {

		$this->load->model('User_model');

		$players = $this->User_model->read();

		print_r($players);
		/*
		$data['todo_list'] = array('Clean House', 'Call Mom', 'Run Errands');

		$data['title'] = "My Real Title";
		$data['heading'] = "My Real Heading";

		$this->load->view('blogview', $data, true);
		*/

	}

	function lookup() {

		$this->load->model('Player_model');

		$player = $this->Player_model->read();

		print_r( $player );

	}
}
?>