import random 
import string
import os


def generate_filecode():
    # Generate 3 random letters
    letters = random.choices(string.ascii_uppercase, k=3)
    
    # Generate 3 random digits
    digits = random.choices(string.digits, k=3)
    
    # Combine them alternately
    result = ''.join(l + d for l, d in zip(letters, digits))
    
    return result


def find_my_file(directory, search_string):

    # Loop through the files in the directory
    for filename in os.listdir(directory):
        # Check if the search string is in the filename
        if search_string in filename:
            temp = filename.split("___"+search_string+"___")
            ofilename = "".join(temp)
            return directory + "/" + filename, ofilename
    
    return None, None
