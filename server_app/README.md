## Things To Do

  1. Add a way to make it possible to add restrictions on what users can do (for example if a user adds random association we need to block them).
  2. Add a way for the associations to be approved/rejected for the community. It's better to add API to the server app and then, add a special review queue through the extension app.
  3. Add quering questions by tag.
  4. Add a logo or something like it in order to have a way to go back from the question page.
  5. Highlight the search box somehow. Currently it's hard to understand that it's a search box. 
  6. Add searching by Enter.
  7. Filter int'l SO questions in the Google's response by number of answers. If a resulting question does not have any answers it should not be represented among the suggestions.

## How To Install

We started developing a samll server application (in code aappp, wich means "Association APPlication") based of the [Flask framework](http://flask.pocoo.org/). Although, most of the code is run on client side, we still need a server app: 1) to serve templates; 2) manage dynamic changes of the state of the association process.

1. Check out code from GitHub to any folder.
2. Create a symbolic link `ln -s /path/to/your/folder/server_app/ /home/aapp`. It means that we assume that the root directory of the project is "/home/aapp". If you want to user another directory, take a look at the *server_app/server.wsgi*, and *server_app/aapp.conf*.
3. [Install Flask](http://flask.pocoo.org/docs/0.12/installation/). (In my case it was `pip install Flask`.)
4. Install the Apache web server.
5. [Install mod_wsgi for the apache](http://flask.pocoo.org/docs/0.12/deploying/mod_wsgi/).
6. Use the aapp.conf to setup the Apache. Please, take a look at the beggining of the aapp.conf. `ServerName aapp.ru` says that we use *aapp.ru* as the host name. You can use any other. Do not forget to set up your */etc/hosts* to get it redirected to the localhost if you want to run it on your local machine.

## What is next

In order to run the app you need:

1. Create a postgres database with the name `association_tools`.
2. Go to the server_app folder.
3. Create a file `local_settings.py` with variables

    STACKEXCHANGE_CLIENT_SECRET = "your secret"   
    STACKEXCHANGE_CLIENT_KEY = "your key"   
    STACKEXCHANGE_CLIENT_ID = app_id   
   
4. Execute `LOCALE_LANGUAGE_NAME=ru python server.py --init_db`.
5. Execute `LOCALE_LANGUAGE_NAME=ru python server.py --upload_csv`.

Then you will need to go to the site (aapp.ru in my case). By default the app requires you to be authorized with Stack Exchange OAuth. Because of this it will automatically redirect you to openid.stackexchange.com.
