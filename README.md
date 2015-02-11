# Campfire
Cozy place to learn about Vala.

You can view the site [in action here](http://i-hate-farms.github.io/campfire).

# How to contribute
If you want to contribute content: 
   - you can add/edit general purpose pages with [Jade](http://jade-lang.com/)  in `pages/`
   - you can add/edit tutorials with [Github flavored Markdown](https://help.github.com/articles/github-flavored-markdown/) in `tutorial/`

The folder `layout/` defines the site overall structure.

# How to build
Make sure that you have [npm](https://www.npmjs.com/) installed. 
If you are using ubuntu, you might want to use [that tutorial](https://nodesource.com/blog/chris-lea-joins-forces-with-nodesource).

Then run 
```
    sudo npm install
	grunt
```  

`grunt` will server a site on your local machine with the generated pages at http://0.0.0.0:8000/.

The site resources (pages, css, etc.) are generated in `build/`.

> Note: when you get newer files with `git pull` you must update your local npm repository by running `sudo npm install` again.
