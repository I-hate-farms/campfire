
# How to install npm

## Ubuntu 

This guide installs [node](http://nodejs.org/), [npm](https://www.npmjs.com/), [grunt](http://gruntjs.com/) and [bower](https://bower.io) while avoiding the common [npm requires sudo pitfall](http://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo) 

> **Note: ** this guide is a modified version of [this tutorial](https://nodesource.com/blog/chris-lea-joins-forces-with-nodesource).

Installing node: 
```
	curl -sL https://deb.nodesource.com/setup | sudo bash -
	sudo apt-get install nodejs
	mkdir ~/.cache/npm
	npm config set prefix ~/.cache/npm
	export PATH="$PATH:$HOME/npm/bin"
```

Installing grunt and bower command line tools **locally**
```
	npm install -g grunt-cli 
	sudo ln -s  ~/.cache/npm/bin/grunt /usr/bin/grunt
	npm install -g bower  
	sudo ln -s  ~/.cache/npm/bin/bower /usr/bin/bower
```

Now npm, grunt and bower are installed, the dependencies of `campfire` can be installed
```
	npm install 
```

## Uninstalling

```
	sudo apt-get purge nodejs
	sudo rm /usr/bin/grunt
	sudo rm /usr/bin/bower
	rm -rf ~/.cache/npm
```
