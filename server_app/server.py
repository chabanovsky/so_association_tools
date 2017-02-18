import sys

from meta import *
from models import *
from auth import *
from views import *
from oauth import *
from filters import *

if __name__ == "__main__":
    if len(sys.argv) > 1:
        from database import init_db, upload_csv
        if str(sys.argv[1]) == "--init_db":
            init_db()
            quit()
        elif str(sys.argv[1]) == "--upload_csv":
            debug_print = str(sys.argv[2]) == "--debug" if len(sys.argv) > 2 else False
            upload_csv("./csv_data_" + LANGUAGE + "/", debug_print)
            quit()

    app.run()
