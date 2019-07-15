---
layout: default
title: Documenting Guidelines
has_toc: false
parent: Library Maintenance
nav_order: 4  
---
{% include header.html %}

## Documenting Guidelines

All development documentation must be a part of the project source base,
so they are
- immediately accessible to developers cloning the repository
  (no need in external document hosting like Confluence)
- has a full history tracking
- documents still can be referred and linked from other web pages
  via TFS web interface

Documents preferrable format is Markdown:
- it is an enriched text format, so developers can easily see diffs in Git
- it remains readable in any text viewer, even lacking Markdown support.
- it integrates well with the TFS web interface. The `Readme.md` file is a
  default documentation enry point in TFS repositories and automaticaly
  shows up when open TFS web repos in a browser.

To learn more about the markdown syntax, refer to these links:

 - [Markdown Syntax Guide](http://daringfireball.net/projects/markdown/syntax)
 - [Markdown Basics](http://daringfireball.net/projects/markdown/basics)
 - [GitHub Flavored Markdown](http://github.github.com/github-flavored-markdown/) 
 - [markdown at wikipedia](https://secure.wikimedia.org/wikipedia/en/wiki/Markdown)
