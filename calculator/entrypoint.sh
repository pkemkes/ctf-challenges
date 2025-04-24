#!/bin/bash

echo "$FLAG" > flag.txt
chown ctf:ctf flag.txt
chmod 400 flag.txt

# Switch to the ctf user and execute the CMD
exec su -m ctf -c "exec $*"