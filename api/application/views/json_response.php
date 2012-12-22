<?php

$this->output->set_status_header( 200 );

/*
if( $code == 201 ) {

    // Special case requires URL of newly created resource.

    $this->output->set_header("HTTP/1.1 201 Created");

    $this->output->set_header("Location: $location");

} else {

    $this->output->set_status_header( $code );

}
*/

if( ! isset( $code ) || ! isset( $message ) ) {

	$response = array( 'code' => 500, 'message' => 'View did not receive its minimum requirement of a code/message pair.');

} else {

	$response = array( 'code' => $code, 'message' => $message );

	if( isset( $location ) ) $response['location'] = $location;

	if( isset( $next_page ) ) $response['next_page'] = $next_page;

	if( isset( $data ) ) $response['data'] = $data;

}

$this->output->set_content_type('application/json');

$json = json_encode( $response );

echo $json;

?>