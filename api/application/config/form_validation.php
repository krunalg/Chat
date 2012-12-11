<?php

$config = array(

    'update_user' => array(

        array(

            'field' => 'user',

            'label' => "username",

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

        ),

        array(

            'field' => 'facing',

            'label' => 'direction faced',

            'rules' => 'is_direction'

        ),

        array(

            'field' => 'skin',

            'label' => 'skin',

            'rules' => 'alpha'

        ),

        array(

            'field' => 'state',

            'label' => 'movement state',

            'rules' => 'alpha'

        ),

        array(

            'field' => 'map',

            'label' => 'current zone',

            'rules' => 'alpha'

        )

    ),

    'add_user' => array(

        array(

            'field' => 'user',

            'label' => "username",

            'rules' => 'required|is_unique[users.user]|min_length[3]|max_length[12]'

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

        ),

        array(

            'field' => 'facing',

            'label' => 'direction faced',

            'rules' => 'is_direction'

        ),

        array(

            'field' => 'skin',

            'label' => 'skin',

            'rules' => 'alpha'

        ),

        array(

            'field' => 'state',

            'label' => 'movement state',

            'rules' => 'alpha'

        ),

        array(

            'field' => 'map',

            'label' => 'current zone',

            'rules' => 'alpha'

        )

    )

);

?>