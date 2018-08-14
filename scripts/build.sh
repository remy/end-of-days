#!/bin/bash

# First set up the ENV variables needed before we can code sign.
# See: https://github.com/electron-userland/electron-builder/wiki/Code-Signing

# Check that the .p12 file is in the correct location.
CERT_PATH=~/certs/macos-end-of-days-cert.p12
if [ ! -f $CERT_PATH ]; then
  echo "Can't find the .p12 file at $CERT_PATH"
fi

# Check that the folder for the penguin project is still in the right place
PROJECT_PATH=~/Sites/endofdays
if [ ! -f $PROJECT_PATH/package.json ]; then
  echo "Can't find the penguin project! Quitting."; exit 1;
fi

# Get the user's password.
unset answer
prompt="Please enter the password to decrypt the .p12 file: "

while IFS= read -p "$prompt" -r -s -n 1 char
do
    if [[ $char == $'\0' ]]
    then
        break
    fi
    prompt='*'
    answer+="$char"
done

if [ -z "$answer" ]; then
  echo "No password, quitting abruptly. Lock up your stuff."; exit 1;
fi

# Export the environment variables
export CSC_LINK="file://$CERT_PATH"
export CSC_KEY_PASSWORD=$answer

echo "... Exported ENV variables."

# Now run the build process.
cd $PROJECT_PATH; npm run dist;
