
# How to install npm

## Ubuntu 
[Tutorial](https://nodesource.com/blog/chris-lea-joins-forces-with-nodesource).
If npm is complaining about root/Administrator error, [change the owner of .npm folders](http://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo) by running: 
```
sudo chown -R $(whoami) ~/.npm
sudo chown -R `whoami` /usr/lib/node_modules
sudo chown -R `whoami` /usr/local/lib/node_modules
```