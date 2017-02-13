import sys

from meta import *
from models import *
from auth import *
from views import *

if __name__ == "__main__":
    if len(sys.argv) > 1 and str(sys.argv[1]) == "--init_db":
        from database import init_db
        init_db()
        quit()

    app.run()
