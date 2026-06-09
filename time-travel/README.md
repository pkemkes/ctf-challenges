# Time Travel

## Description:

A single, static HTML page that looks exactly like a published
[HedgeDoc](https://hedgedoc.org/) note. The note pretends to be the internal
planning document in which all of the other challenges are designed. Every real
flag in the document is redacted (`*zensiert*`).

The planning entry for the *Zeitreise* (time travel) challenge itself contains a
short comment thread: one author notices that the flag was forgotten and not
redacted, the other replies that they "removed" it.

## Setting up the challenge:

Build the docker image using the provided Dockerfile.

There is one important environment value that should be set when deploying the
image on your challenge server:

| Name | Default | Description |
|------|---------|---|
| FLAG | flag{replace-me-with-your-flag} | The flag hidden in the saved revision inside the page source. Replace this with the flag that is registered in your CTF server. |

The challenge listens on port `8080`.

### Example docker-compose.yml:

```yaml
services:
  ctf-time-travel:
    image: ctf-time-travel
    container_name: ctf-time-travel
    restart: always
    environment:
      - FLAG=flag{very-secret-flag}
    ports:
      - "8080:8080"
```
