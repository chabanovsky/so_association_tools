
## How To Install

We started developing a samll server application (in code aappp, wich means "Association APPlication") based of the [Flask framework](http://flask.pocoo.org/). Although, most of the code is run on client side, we still need a server app: 1) to serve templates; 2) manage dynamic changes of the state of the association process.

1. Check out code from GitHub to any folder.
2. Create a symbolic link `ln -s /path/to/your/folder/server_app/ /home/aapp`. It means that we assume that the root directory of the project is "/home/aapp". If you want to user another directory, take a look at the *server_app/server.wsgi*, and *server_app/aapp.conf*.
3. Set up apache according the app folder and the version of apache. You can find aapp.conf for `/home/aapp` and for apache 2.2.
4. You need apache web server, mod_wsgi, postgres 9+ installed.
5. Install Flask and Flask's modules

    pip install Flask
    pip install Flask-Babel
    pip install Flask-SQLAlchemy
    pip install Flask-OpenID

6. Login to postgres.

    psql -U postgres -h localhost -d template1

7. Create a user and a database.

    CREATE USER your user;
    CREATE DATABASE association_tools_ru;
    GRANT ALL PRIVILEGES ON DATABASE association_tools_ru TO your_user;

<sub>*</sub> If you cannot log in as a postgres [see this](http://stackoverflow.com/questions/15791406/).
<sub>**</sub> If there are issues with auth [see this](http://stackoverflow.com/a/30052923/564240).

8. Create a local_settings.py file in the server_app folder with following variables

    STACKEXCHANGE_CLIENT_SECRET = "secret"
    STACKEXCHANGE_CLIENT_KEY = "key"
    STACKEXCHANGE_CLIENT_ID = id

    FLASK_SECRET_KEY = 'key'
    PG_NAME_PASSWORD = "name:pass"

 
9. Execute `LOCALE_LANGUAGE_NAME=ru python server.py --init_db`.
10. Execute `LOCALE_LANGUAGE_NAME=ru python server.py --upload_csv`. For the first run you may want to add `CHECK_EXISTENCE=0`.
11. Ececute `LOCALE_LANGUAGE_NAME=ru python ./server.py --update_most_viewed`.
12. Ececute `LOCALE_LANGUAGE_NAME=ru  python ./server.py --update_associations=associations.csv`.


## Few Screenshots

When one logged in they see the list of most viewed questions on Stack Overflow in English by a language audience.

![](https://i.stack.imgur.com/Bibfl.png)

When one decides which question the want to associate they click on it and see the question page.

![](https://i.stack.imgur.com/6R6X6.png)

Under the questions's body there is a search box. One ueses that search box to write a query and find associations on a language Stack Overflow. Candidates for the association are listed under the search box.

![](https://i.stack.imgur.com/VKLCV.png)

When one thinks that a candidate might be associated they click on it and see two columns view with qeustions from both sites. The questions contain answers. If one thinks that these two questions are the same they click "Associate", which actually force the app add a comment on a language site that contains the following text "association: http://stackoverflow.com/questions/id/". There are no need for the user to do anything more than that for adding an association. If questions are about different issues one clicks "Back". 

![](https://i.stack.imgur.com/vhEja.png)
