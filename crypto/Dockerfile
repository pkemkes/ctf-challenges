FROM python:3.11

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV FLASK_DEBUG=0

ENV DIFFICULTY=0
ENV KEY="ZYXWVUTSRQPONMLKJIHGFEDCBA"
ENV TEXT_TO_DECRYPT="Your flag{replace-me-with-your-flag} has to go here as well as some funny text"

WORKDIR /usr/bin/crypto/src
COPY ./src/requirements.txt ./

RUN pip install -r requirements.txt

COPY ./src ./

HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD [ "curl", "localhost:80" ]

CMD gunicorn --bind 0.0.0.0:80 run:app