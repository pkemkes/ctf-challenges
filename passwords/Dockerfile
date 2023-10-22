FROM python:3.11

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV FLASK_DEBUG=0

ENV DIFFICULTY=1
ENV FLAG="flag{replace-me-with-your-flag}"
ENV USERNAME="example@mail.net"
ENV PASSWORD="example"


WORKDIR /usr/bin/passwords/src
COPY ./src/requirements.txt ./

RUN pip install -r requirements.txt

COPY ./src ./

HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD [ "curl", "localhost:80" ]

CMD gunicorn --bind 0.0.0.0:80 run:app