
# HTMX

## get request 
this will get the version of bun on button click and place it in the div with id version
```html
<button hx-get="/version" hx-target="#version">
    get version
</button>
<div id="version"></div>
```