#!/bin/sh
set -e

# Inject environment variables into the static page.
# Only the listed variables are substituted so that any other "$" in the HTML
# stays untouched.
envsubst '${FLAG} ${DATE_STONKS} ${DATE_CALCULATOR} ${DATE_CRYPTO} ${DATE_GPTGOLF} ${DATE_PASSWORDS} ${DATE_PHISHING} ${DATE_Y} ${DATE_TIMETRAVEL} ${DATE_COMMENT_PHILLIP} ${DATE_COMMENT_FLORIAN} ${DATE_LASTCHANGE}' \
    < /usr/share/nginx/html/index.html.template \
    > /usr/share/nginx/html/index.html
