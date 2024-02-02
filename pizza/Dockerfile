FROM python:3.11

RUN addgroup --gid 1001 ctf && \
    yes | adduser --disabled-password --uid 1001 --ingroup ctf ctf

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV FLASK_DEBUG=0

ENV FLAG="flag{replace-me-with-your-flag}"

WORKDIR /usr/bin/pizza/src
COPY ./src/requirements.txt ./

RUN pip install -r requirements.txt

USER ctf

COPY --chown=ctf ./src ./

HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD [ "curl", "localhost:8080" ]

CMD gunicorn --bind 0.0.0.0:8080 run:app