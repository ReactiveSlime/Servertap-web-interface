
## A website written in in JS that shows the info made available using the servertap.io plugin

To get started just fill out the .env file. The file is documented with what needs to be added
run `npm install` then `npm .`

When using this there are two pages made available by default.

1. index.html
	 - MOTD
	 - Weather
	 - TPS
	 - Uptime
	 - Memory Usage
		 - Players online
		 - Location
		 - Health
		 - Hunger
2. player.html
	 - Health
	 - Hunger
	 - Location

![](https://raw.githubusercontent.com/ReactiveSlime/Servertap-web-interface/main/screenshots/image.png)
![](https://raw.githubusercontent.com/ReactiveSlime/Servertap-web-interface/main/screenshots/image2.png)

## Known bugs
1: dynmap support is buggy but has 2 fixes depending on if you want to enable it or not

1.1: to enable this everything before "/?worldname=" needs to be hard coded on line 111 in Servertap-web-interface/public/assets/js
/player.js
. https://github.com/ReactiveSlime/Servertap-web-interface/blob/main/public/assets/js/player.js#L111C25-L111C70

 1.2: to disable just remove line 115 in Servertap-web-interface/public/assets/js
/player.js. https://github.com/ReactiveSlime/Servertap-web-interface/blob/main/public/assets/js/player.js#L115

2: if there are a few people on line the top and bottom of the page gets cut off

3: RAM bar calculations are wrong
