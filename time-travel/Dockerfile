FROM nginx:1.31.1-alpine

# The flag that gets injected into the page at container start.
# Replace this with the flag registered in your CTF server.
ENV FLAG="flag{replace-me-with-your-flag}"

# Dates shown in the planning document (all configurable).
ENV DATE_STONKS="09.05.2025"
ENV DATE_CALCULATOR="03.05.2025"
ENV DATE_CRYPTO="28.04.2025"
ENV DATE_GPTGOLF="06.05.2025"
ENV DATE_PASSWORDS="30.04.2025"
ENV DATE_PHISHING="02.05.2025"
ENV DATE_Y="07.05.2025"
ENV DATE_TIMETRAVEL="08.05.2025"
ENV DATE_COMMENT_PHILLIP="Mon, May 12, 2025 11:09"
ENV DATE_COMMENT_FLORIAN="Tue, May 13, 2025 07:32"
ENV DATE_LASTCHANGE="Tue, May 13, 2025 07:32"

# Serve on the same port the other challenges use.
COPY default.conf /etc/nginx/conf.d/default.conf

# The page is stored as a template; the FLAG env var is substituted at startup.
COPY index.html /usr/share/nginx/html/index.html.template

# nginx:alpine runs every script in /docker-entrypoint.d/ before launching nginx.
COPY docker-entrypoint-flag.sh /docker-entrypoint.d/40-flag.sh
RUN rm -f /usr/share/nginx/html/index.html && \
    chmod +x /docker-entrypoint.d/40-flag.sh

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD wget -q -O /dev/null http://localhost:8080 || exit 1
