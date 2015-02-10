# Campfire
Cozy place to learn about Vala.

You can view the site [in action here](http://dev.tombeckmann.de/)

# How to contribute
If you want to contribute content: 
   - you can add/edit general purpose pages with [Jade](http://jade-lang.com/)  in `pages/`
   - you can add/edit tutorials with [Github flavored Markdown](https://help.github.com/articles/github-flavored-markdown/) in `tutorial/`

The folder `layout/` defines the site overall structure

# How to build
Make sure that you have [npm](https://www.npmjs.com/) installed. 
If you are using ubuntu, you might want to use [that tutorial](https://nodesource.com/blog/chris-lea-joins-forces-with-nodesource)

Then run 
```
    sudo npm install
	grunt
```  

The site files are generated in `build/`
The website can be viewed at http://0.0.0.0:8000/