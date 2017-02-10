# Introduction

This is a basic plugin that changes the way how associations look like on international Stack Overflows.

There were some [discussions](http://meta.ru.stackoverflow.com/questions/4500/) on Meta Stack Overflow in Russian, that we have to find a better way of adding associations than through an answer on meta. [It was suggested](http://meta.ru.stackoverflow.com/a/4507/6) to add associations in a comment to a question on an international sites.

Original proposal: https://github.com/chabanovsky/so_question_association

# Specification 

<sup>\*Specification bellow is a result of discussions on Meta Stack Overflow in Russian and some my personal thoughts. If you think that something is wrong, [let me know](http://meta.ru.stackoverflow.com/questions/ask)!</sup>

The most general part is the extension. The server application would be implemented only in case of the interest from community. For the server we will use our external machine hosted by Hetzner (Ubuntu Server 12.04). We, okay, I decided to use Flask + Apache for the server app.

1. [Browser extension](/chabanovsky/so_association_tools/tree/master/extension)

2. [Server side application](/chabanovsky/so_association_tools/tree/master/server_app)


# Current Status
