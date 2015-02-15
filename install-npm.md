
# How to install npm

## Ubuntu 

This guide installs node, npm and bower while avoiding the common [npm requires sudo pitfall](http://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo) 

> **Note: ** this guide is a modified version of [this tutorial](https://nodesource.com/blog/chris-lea-joins-forces-with-nodesource).

Installing node: 
```
	curl -sL https://deb.nodesource.com/setup | sudo bash -
	apt-get install nodejs
	npm config set prefix ~/.cache/npm
	# TODO add export PATH="$PATH:$HOME/npm/bin"
```

Installing grunt and bower 
```
	npm install grunt-cli 
	npm install bower  
```

