<?php

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

echo $json;

?>