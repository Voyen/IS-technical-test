# TODO: Replace this with value from database
counter = 1000


def decrement_counter():
    global counter
    counter -= 1
    return counter


def get_current_count():
    global counter
    return counter


def reset_counter():
    global counter
    counter = 1000
    return counter
