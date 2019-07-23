---
layout: default
title: Documenting Guidelines
has_toc: false
nav_exclude: true
---
{% include header.html %}

# Documenting Guidelines

All development documentation must be a part of the project source base so that they:
- are immediately accessible to developers cloning the repository, i.e. not requiring external document hosting on platforms such as Confluence.
- have full history tracking.
- can easily be referred to and linked from other web pages via the TFS web interface.

The preferrable format for the documentation is Markdown.
- It is an enriched text format, so developers can easily see diffs in Git.
- It remains readable in any text viewer, even those lacking specific Markdown support.
- It integrates well with the TFS web interface. The `Readme.md` file is a default documentation enry point in TFS repositories and automatically displays when TFS repos are opened in a web browser.

To learn more about the Markdown syntax, refer to these links.

 - [Markdown Syntax Guide](http://daringfireball.net/projects/markdown/syntax)
 - [Markdown Basics](http://daringfireball.net/projects/markdown/basics)
 - [GitHub Flavored Markdown](http://github.github.com/github-flavored-markdown/) 
 - [markdown at wikipedia](https://secure.wikimedia.org/wikipedia/en/wiki/Markdown)
