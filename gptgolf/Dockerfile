FROM python:3.11

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV FLASK_DEBUG=0

ENV FLAGS="flag{PlPmcRT8},flag{mhXEY7Bi},flag{ipLYRIZ9},flag{sIccoukA},flag{kwwVxNUV}"
ENV DATADIR="/var/www/data"

WORKDIR /usr/bin/gptgolf/src
COPY ./src/requirements.txt ./

RUN pip install -r requirements.txt

COPY ./src ./

# HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD [ "curl", "localhost:80" ]

CMD gunicorn --bind 0.0.0.0:80 run:app