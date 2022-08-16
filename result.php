<?php

    echo ("<font size=6>Simulation Result : </font><br>");

?>
<head>
    <meta charset="UTF-8">
</head>

<div id="info" style="font-size:55px;"></div>
<div id="log"></div>
<script type="text/javascript" src="main.js"></script>

<script type="text/javascript">
    heroes = [new Hero(<? echo $_GET["player1"]?>, 0), new Hero(<? echo $_GET["player2"]?>, 1)];
    SIMULATING_NUMBER=<? echo $_GET["simulnum"]?>;
    if(SIMULATING_NUMBER==1){
        WRITELOG=true;
    }
    else{
        WRITELOG=false;
    }
    
    runSimulation();

</script>
