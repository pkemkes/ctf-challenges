FROM python:3.11

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV FLASK_DEBUG=0

ENV FLAG1="flag{replace-me-with-your-first-flag}"
ENV FLAG2="flag{replace-me-with-your-second-flag}"
ENV DATADIR="/var/www/data"
ENV SOFT_RESET_PATH="/soft-reset"
ENV HARD_RESET_PATH="/hard-reset"

WORKDIR /usr/bin/y/src
COPY ./src/requirements.txt ./

RUN pip install -r requirements.txt

COPY ./src ./

HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD [ "curl", "localhost:80" ]

CMD gunicorn --bind 0.0.0.0:80 run:app