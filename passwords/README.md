# Passwords Challange

## Description:

This challenge simulates the situation that the player is tasked to hack into a social media account. The goal is to demonstrate the importance of long and secure passwords.

For this, the player is given a cracking tool, where a brute force algorithm is already implemented. They need to find clues in the social media stream of the victim to find details about the password.

This is a challenge for beginners with 1 difficulty setting. It is currently in German but can easily be modified to support English players.

## Setting up the challenge:

Build the docker image using the provided Dockerfile or use the image provided on DockerHub ([pkemkes/ctf-passwords](https://hub.docker.com/repository/docker/pkemkes/ctf-passwords/general)).

There are three important environment value that should be set when deploying the image on your challenge server:

| Name | Default | Description |
|--------|--------|---|
| USERNAME | example@mail.net | The username that needs to be found in the social media stream. |
| PASSWORD | example | The passwords that needs to be cracked. |
| FLAG | flag{replace-me-with-your-flag} | The flag that is displayed when the challenge is won. Replace this with your flag that is registered in your CTF server. |

### Example docker-compose.yml:

```yaml
ctf-passwords-0:
    image: pkemkes/ctf-passwords
    container_name: ctf-passwords-0
    restart: always
    environment:
        - FLAG=flag{th1s-1s-n0t-s3cur3}
        - USERNAME=arnie@schwarzenegger.com
        - PASSWORD=arrrgghh
    ports:
        - "80:80"
```

## Screenshot:

<img src="./assets/screenshot.png" alt="screenshot.png" width="800"/>