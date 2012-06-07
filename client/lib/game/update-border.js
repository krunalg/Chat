ig.module('game.update-border').requires().defines(function() {
	updateBorder = function(player) {


		if (player.pos.x >= 960 && player.pos.x < 1280 && player.pos.y < 6080 && player.pos.y >= 5760) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1514;
			ig.game.backgroundMaps[0]['data'][0][1] = 1514;
			ig.game.backgroundMaps[0]['data'][1][0] = 1514;
			ig.game.backgroundMaps[0]['data'][1][1] = 1514;
		} else if (player.pos.x >= 12160 && player.pos.x < 12800 && player.pos.y < 4160 && player.pos.y >= 2880) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 1280 && player.pos.x < 1600 && player.pos.y < 320 && player.pos.y >= 0) {
			ig.game.backgroundMaps[0]['data'][0][0] = 338;
			ig.game.backgroundMaps[0]['data'][0][1] = 1770;
			ig.game.backgroundMaps[0]['data'][1][0] = 681;
			ig.game.backgroundMaps[0]['data'][1][1] = 138;
		} else if (player.pos.x >= 5120 && player.pos.x < 5760 && player.pos.y < 320 && player.pos.y >= 0) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1365;
			ig.game.backgroundMaps[0]['data'][0][1] = 1365;
			ig.game.backgroundMaps[0]['data'][1][0] = 1365;
			ig.game.backgroundMaps[0]['data'][1][1] = 1365;
		} else if (player.pos.x >= 2240 && player.pos.x < 2560 && player.pos.y < 1280 && player.pos.y >= 960) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1967;
			ig.game.backgroundMaps[0]['data'][0][1] = 1967;
			ig.game.backgroundMaps[0]['data'][1][0] = 1967;
			ig.game.backgroundMaps[0]['data'][1][1] = 1967;
		} else if (player.pos.x >= 7680 && player.pos.x < 8960 && player.pos.y < 1760 && player.pos.y >= 1120) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 1920 && player.pos.x < 2240 && player.pos.y < 4800 && player.pos.y >= 4480) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 3200 && player.pos.x < 3840 && player.pos.y < 2560 && player.pos.y >= 2240) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 10240 && player.pos.x < 11520 && player.pos.y < 2240 && player.pos.y >= 1600) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 1920 && player.pos.x < 2240 && player.pos.y < 4160 && player.pos.y >= 3840) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 7680 && player.pos.x < 8000 && player.pos.y < 4800 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 640 && player.pos.x < 1120 && player.pos.y < 4160 && player.pos.y >= 3680) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 1920 && player.pos.x < 2240 && player.pos.y < 4480 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 1120 && player.pos.x < 1920 && player.pos.y < 4160 && player.pos.y >= 3840) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 1920 && player.pos.x < 3200 && player.pos.y < 3840 && player.pos.y >= 3520) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 0 && player.pos.x < 640 && player.pos.y < 4160 && player.pos.y >= 2880) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 0 && player.pos.x < 640 && player.pos.y < 5440 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 0 && player.pos.x < 1280 && player.pos.y < 5760 && player.pos.y >= 5440) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1514;
			ig.game.backgroundMaps[0]['data'][0][1] = 1514;
			ig.game.backgroundMaps[0]['data'][1][0] = 1514;
			ig.game.backgroundMaps[0]['data'][1][1] = 1514;
		} else if (player.pos.x >= 1280 && player.pos.x < 2240 && player.pos.y < 6080 && player.pos.y >= 5760) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 2240 && player.pos.x < 3200 && player.pos.y < 6080 && player.pos.y >= 5760) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 3200 && player.pos.x < 3840 && player.pos.y < 6080 && player.pos.y >= 5120) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 3200 && player.pos.x < 3840 && player.pos.y < 4160 && player.pos.y >= 2560) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 3200 && player.pos.x < 3840 && player.pos.y < 2240 && player.pos.y >= 0) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1967;
			ig.game.backgroundMaps[0]['data'][0][1] = 1967;
			ig.game.backgroundMaps[0]['data'][1][0] = 1967;
			ig.game.backgroundMaps[0]['data'][1][1] = 1967;
		} else if (player.pos.x >= 2560 && player.pos.x < 3200 && player.pos.y < 1280 && player.pos.y >= 320) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1967;
			ig.game.backgroundMaps[0]['data'][0][1] = 1967;
			ig.game.backgroundMaps[0]['data'][1][0] = 1967;
			ig.game.backgroundMaps[0]['data'][1][1] = 1967;
		} else if (player.pos.x >= 1600 && player.pos.x < 3200 && player.pos.y < 320 && player.pos.y >= 0) {
			ig.game.backgroundMaps[0]['data'][0][0] = 338;
			ig.game.backgroundMaps[0]['data'][0][1] = 1770;
			ig.game.backgroundMaps[0]['data'][1][0] = 681;
			ig.game.backgroundMaps[0]['data'][1][1] = 138;
		} else if (player.pos.x >= 640 && player.pos.x < 1280 && player.pos.y < 1280 && player.pos.y >= 0) {
			ig.game.backgroundMaps[0]['data'][0][0] = 338;
			ig.game.backgroundMaps[0]['data'][0][1] = 1770;
			ig.game.backgroundMaps[0]['data'][1][0] = 681;
			ig.game.backgroundMaps[0]['data'][1][1] = 138;
		} else if (player.pos.x >= 0 && player.pos.x < 640 && player.pos.y < 1920 && player.pos.y >= 640) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 640 && player.pos.x < 2240 && player.pos.y < 2240 && player.pos.y >= 1920) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 2240 && player.pos.x < 3200 && player.pos.y < 2560 && player.pos.y >= 2240) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1365;
			ig.game.backgroundMaps[0]['data'][0][1] = 1365;
			ig.game.backgroundMaps[0]['data'][1][0] = 1365;
			ig.game.backgroundMaps[0]['data'][1][1] = 1365;
		} else if (player.pos.x >= 3840 && player.pos.x < 5120 && player.pos.y < 2560 && player.pos.y >= 2240) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 4480 && player.pos.x < 5120 && player.pos.y < 2240 && player.pos.y >= 0) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1365;
			ig.game.backgroundMaps[0]['data'][0][1] = 1365;
			ig.game.backgroundMaps[0]['data'][1][0] = 1365;
			ig.game.backgroundMaps[0]['data'][1][1] = 1365;
		} else if (player.pos.x >= 5760 && player.pos.x < 6400 && player.pos.y < 1600 && player.pos.y >= 0) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1365;
			ig.game.backgroundMaps[0]['data'][0][1] = 1365;
			ig.game.backgroundMaps[0]['data'][1][0] = 1365;
			ig.game.backgroundMaps[0]['data'][1][1] = 1365;
		} else if (player.pos.x >= 6400 && player.pos.x < 7680 && player.pos.y < 1600 && player.pos.y >= 1280) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 6720 && player.pos.x < 7360 && player.pos.y < 2240 && player.pos.y >= 1600) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 5120 && player.pos.x < 7360 && player.pos.y < 2560 && player.pos.y >= 2240) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1365;
			ig.game.backgroundMaps[0]['data'][0][1] = 1365;
			ig.game.backgroundMaps[0]['data'][1][0] = 1365;
			ig.game.backgroundMaps[0]['data'][1][1] = 1365;
		} else if (player.pos.x >= 8960 && player.pos.x < 10240 && player.pos.y < 2240 && player.pos.y >= 960) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 10240 && player.pos.x < 11520 && player.pos.y < 1600 && player.pos.y >= 960) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 8960 && player.pos.x < 10240 && player.pos.y < 3520 && player.pos.y >= 2240) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 10240 && player.pos.x < 11520 && player.pos.y < 3520 && player.pos.y >= 2240) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 10240 && player.pos.x < 12160 && player.pos.y < 4160 && player.pos.y >= 3520) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 10240 && player.pos.x < 11520 && player.pos.y < 4800 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 8960 && player.pos.x < 10240 && player.pos.y < 4800 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 8000 && player.pos.x < 8960 && player.pos.y < 4800 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 6400 && player.pos.x < 7680 && player.pos.y < 4800 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 5120 && player.pos.x < 6400 && player.pos.y < 4800 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 3840 && player.pos.x < 5120 && player.pos.y < 4800 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 0 && player.pos.x < 640 && player.pos.y < 2880 && player.pos.y >= 1920) {
			ig.game.backgroundMaps[0]['data'][0][0] = 2291;
			ig.game.backgroundMaps[0]['data'][0][1] = 2354;
			ig.game.backgroundMaps[0]['data'][1][0] = 1910;
			ig.game.backgroundMaps[0]['data'][1][1] = 1092;
		} else if (player.pos.x >= 3200 && player.pos.x < 3840 && player.pos.y < 5120 && player.pos.y >= 4160) {
			ig.game.backgroundMaps[0]['data'][0][0] = 910;
			ig.game.backgroundMaps[0]['data'][0][1] = 910;
			ig.game.backgroundMaps[0]['data'][1][0] = 910;
			ig.game.backgroundMaps[0]['data'][1][1] = 910;
		} else if (player.pos.x >= 1920 && player.pos.x < 2240 && player.pos.y < 2560 && player.pos.y >= 2240) {
			ig.game.backgroundMaps[0]['data'][0][0] = 1365;
			ig.game.backgroundMaps[0]['data'][0][1] = 1365;
			ig.game.backgroundMaps[0]['data'][1][0] = 1365;
			ig.game.backgroundMaps[0]['data'][1][1] = 1365;
		} else console.log("Not in any region.");



	}
})