## Things To Do

  1. Add ORM and a basic user's data and users' activity history.
  2. Add authorisation in the tools only by [Stack Exchange OpneID](https://openid.stackexchange.com/).
  3. Add ability [to post a comment](https://api.stackexchange.com/docs/create-comment) from the tools site to the Stack Overflow in a language [through API](https://api.stackexchange.com/docs/write).
  4. Add a way to make it possible to add restrictions on what users can do (for example if a user adds random association we need to block them).
  5. Add a way to upload csv-data from logs that represents most viewed questions on SOen by Ru-users. Store the uploaded data in a database. If a question exists in the database already, update the counter.
  6. Add a way to mark a question as associated (if one is associated through the app). It should not appear as a question for association if it is marked as an associated one.
  7. Add a way for the associations to be approved/rejected for the community. It's better to add API to the server app and then, add a special review queue through the extension app.

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

1. Go to the server_app folder.
2. Execute `python server.py --init_db`
3. Execute `python server.py --upload_csv`

Then you will need to go to the site (aapp.ru in my case). By default the app requires you to be authorized with Stack Exchange Open Id. Because of this it will automatically redirect you to openid.stackexchange.com.
