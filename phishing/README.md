# Phishing Challange

## Description:

This challenge simulates an in-browser e-mail client. The player has to correctly identify all aspects of the phishing mails by selecting them with a special "marker" cursor.

This is a challenge for beginners with 2 difficulty settings. The only difference are the mails that are present. The phishing mails of the second difficulty setting are a lot more sophisticated.

## Setting up the challenge:

Build the docker image using the provided Dockerfile or use the image provided on DockerHub ([pkemkes/ctf-phishing](https://hub.docker.com/repository/docker/pkemkes/ctf-phishing/general)).

There are four important environment value that should be set when deploying the image on your challenge server:

| Name | Default | Description |
|--------|--------|---|
| DIFFICULTY | 0 | Determines the difficulty of the challenge. Possible values: 0, 1 |
| PHISHING_ELEMS | | Needs to be set with a comma separated list of HTML tags that **must** be marked in order to win the challenge. If these are not marked, the player won't receive the flag. Example: `m2-00,m2-02,m2-04,m4-07` |
| OPTIONAL_ELEMS | "" | Can be set with a comma separated list of HTML tags to allow optional elements. These are elements that are **not** indicators for a phishing mail, but won't count as "incorrectly marked" and therefore don't prevent the player in receiving the flag. Example: `m2-01,m3-04,m4-05,m6-07` |
| FLAG | flag{replace-me-with-your-flag} | The flag that is displayed when the challenge is won. Replace this with your flag that is registered in your CTF server. |

### Example docker-compose.yml:

```yaml
ctf-phishing-0:
    image: pkemkes/ctf-phishing
    container_name: ctf-phishing-0
    restart: always
    environment:
        - DIFFICULTY=0
        - FLAG=flag{th1s-1s-n0t-s3cur3}
        - PHISHING_ELEMS=m2-00,m2-02,m2-04,m4-07
        - OPTIONAL_ELEMS=m2-01,m3-04,m4-05,m6-07
    ports:
        - "8080:8080"

ctf-phishing-1:
    image: pkemkes/ctf-phishing
    container_name: ctf-phishing-1
    restart: always
    environment:
        - DIFFICULTY=1
        - FLAG=flag{th1s-1s-4150-n0t-s3cur3}
        - PHISHING_ELEMS=m2-00,m2-02,m2-04,m4-07
        - OPTIONAL_ELEMS=m2-01,m3-04,m4-05,m6-07
    ports:
        - "8081:8080"
```

## Screenshot:

<img src="./assets/screenshot.png" alt="screenshot.png" width="800"/>