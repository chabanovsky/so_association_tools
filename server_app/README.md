## Specification

  1. Statically (array, dic, or any other) store associations and their authors. It will be updated manually by Stack Overflow employees.
  2. Return all associations and authors by an API call.
  3. Statically store a list of suggestions of questions to be associated. (As a metric "most viewed on SOen by a language users" may be used.) It will be updated manually be Stack Overflow employees.
  4. Serve a page with suggested for association questions. One question per page. Right after the question add a manual Google Search "\*.stackoverflow.com", the results should be right under the question.
  5. Serve a page with the list of associated questions ordered by time.

## How To Install

We started deeloping a samll server application (in code aappp, wich means "Association APPlication") based of the [Flask framework](http://flask.pocoo.org/). Although, most of the code is run on client side, we still need a server app: 1) to serve templates; 2) manage dynamic changes of the state of the association process.

1. Check out code from GitHub to any folder.
2. Create a symbolic link `ln -s /path/to/your/folder/server_app/ /home/aapp`. It means that we assume that the root directory of the project is "/home/aapp". If you want to user another directory, take a look at the *server_app/server.wsgi*, and *server_app/aapp.conf*.
3. [Install Flask](http://flask.pocoo.org/docs/0.12/installation/). (In my case it was `pip install Flask`.)
4. Install the Apache web server.
5. [Install mod_wsgi for the apache](http://flask.pocoo.org/docs/0.12/deploying/mod_wsgi/).
6. Use the aapp.conf to setup the Apache. Please, take a look at the beggining of the aapp.conf. `ServerName aapp.ru` says that we use *aapp.ru* as the host name. You can use any other. Do not forget to set up your */etc/hosts* to get it redirected to the localhost if you want to run it on your local machine.
