// ** Use this code to read the _GET variables from the URL
// ** All to be done before impact starts up.
//
// Will create variable 'username' either with
// fetched name or generated one

         // Create a global array that will hold the value of each variable,
         // keyed by the name of the variable.
         var GETDATA = new Array();
         
         // Get the string that follows the "?" in the window's location.
         var sGet = window.location.search;
         if (sGet) // if has a value...
         {
             // Drop the leading "?"
             sGet = sGet.substr(1);
             
             // Generate a string array of the name value pairs.
             // Each array element will have the form "foo=bar"
             var sNVPairs = sGet.split("&");
             
             // Now, for each name-value pair, we need to extract
             // the name and value.
             for (var i = 0; i < sNVPairs.length; i++)
             {
                 // So, sNVPairs[i] contains the current element...
                 // Split it at the equals sign.
                 var sNV = sNVPairs[i].split("=");
                 
                 // Assign the pair to the GETDATA array.
                 var sName = sNV[0];
                 var sValue = sNV[1];
                 GETDATA[sName] = sValue;
             }
         }

         // username fetched from url
         var username = "";
         username += GETDATA.user;
         if(username=="undefined") username = 'player' + Math.floor(Math.random()*999);