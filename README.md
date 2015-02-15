# Campfire
Cozy place to learn about Vala.

You can view the site [in action here](http://i-hate-farms.github.io/campfire).

# How to build
Make sure that you have [npm](https://www.npmjs.com/) installed. 
If you are using ubuntu, you might want to use [that tutorial](https://nodesource.com/blog/chris-lea-joins-forces-with-nodesource).

Then run 
```
    npm install
	grunt
```  

`grunt` will server a site on your local machine with the generated pages at http://0.0.0.0:8000/.

The site resources (pages, css, etc.) are generated in `build/`.

# How to contribute

### Editing pages
If you want to contribute content: 
   - you can add/edit general purpose pages with [Jade](http://jade-lang.com/)  in  [`pages/`](pages)
   - you can add/edit tutorials with [Github flavored Markdown](https://help.github.com/articles/github-flavored-markdown/) in [`tutorial/`](tutorial)

The folder [`layout/`](layout) defines the site overall structure.

Running `grunt dev` will setup a local web server showing the content (and be updated each time you change a file).

### Managing dependencies
Adding a dependency: 
- a compile time [npm dependency]() run ``
- a runtime [npm dependency]() run ``
- a [bower dependency]() run ``

Refreshing npm dependencies: run `npm install`

# How to deploy to github.io

You need **commit rights** to the `gh-pages` branch.

Run: 
```
	./deploy-to-githubio
```


