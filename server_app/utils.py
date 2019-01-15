# encoding:utf-8
from __future__ import print_function

# Print iterations progress: http://stackoverflow.com/a/34325723/564240
def print_progress_bar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = u'█'):
    """
    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : positive number of decimals in percent complete (Int)
        length      - Optional  : character length of bar (Int)
        fill        - Optional  : bar fill character (Str)
    """
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print ('\r%s |%s| %s%% %s' % (prefix, bar, percent, suffix), end='\r')
    # Print New Line on Complete
    if iteration == total: 
        print ()

def print_association_setting(association_list):
    for item in association_list:
        s = str(item["soen"]) + "=" + str(item["soint"])
        print (s, end=',')
    
    print ()