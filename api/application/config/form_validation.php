<?php

$config = array(

    'update_user' => array(

        /*array(

            'field' => 'user',

            'label' => 'name of the user',

            'rules' => 'is_unique[users.user]|min_length[3]|max_length[12]'

        ),

        array(

            'field' => 'x',

            'label' => 'X coordinate',

            'rules' => 'integer'

        ),

        array(

            'field' => 'y',

            'label' => 'Y coordinate',

            'rules' => 'integer'

        ),*/

        array(

            'field' => 'facing',

            'label' => 'faced direction',

            'rules' => 'is_direction'

        )

    ),

    'example_form' => array(

        array(
        'field' => 'username',
        'label' => 'Username',
        'rules' => 'required'
        ),
        array(
        'field' => 'password',
        'label' => 'Password',
        'rules' => 'required'
        ),
        array(
        'field' => 'passconf',
        'label' => 'PasswordConfirmation',
        'rules' => 'required'
        ),
        array(
        'field' => 'email',
        'label' => 'Email',
        'rules' => 'required'
        )

    )

);

?>