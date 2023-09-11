# GPT Golf Challenge

## Description:

This challenge is inspired by this variant of GPT Trick Golf: https://ggpt.43z.one/

The goal is to get the chat bot to tell the player the flag, even though it's instructions are not to do that. There are 5 difficutly settings, all included in the same instance.

## Setting up the challenge:

Build the docker image using the provided Dockerfile or use the image provided on DockerHub ([pkemkes/ctf-gptgolf](https://hub.docker.com/repository/docker/pkemkes/ctf-gptgolf/general)).

There are four important environment value that should be set when deploying the image on your challenge server:

| Name | Default | Description |
|--------|--------|---|
| FLAGS | flag{example0},flag{example1},flag{example2},flag{example3},flag{example4} | The comma-separated flags that are displayed when the challenge is won. Replace this with your flags that are registered in your CTF server. |
| DATADIR | /var/www/data | This is the directory used to store the highscore data. You should create a volume for this path, if you want to persist the data between restarts. |
| RESET_PATH | /reset | The path in the web application that can be used to delete the highscore and all logfiles. You should change this in your deployment, if you do not want your players to find this. |
| APIKEY |  | Your API key for https://platform.openai.com. You can create a new account with them and get enough free credits to have this challenge running for a while. |

### Example docker-compose.yml:

```yaml
ctf-gptgolf:
    image: pkemkes/ctf-gptgolf
    container_name: ctf-gptgolf
    restart: always
    environment:
        - FLAGS=flag{f0},flag{f1},flag{f2},flag{f3},flag{f4}
        - APIKEY=${APIKEY}
        - RESET_PATH=/reset-rkKoGXtgPkDn362xSIxR
    ports:
        - "80:80"
    volumes:
        - ctf-gptgolf:/var/www/data

volumes:
    ctf-gptgolf:
        driver: local
```

### Place a `.env` file next to it:

```yaml
APIKEY=your-api-key
```

## Screenshot:

<img src="./assets/screenshot.png" alt="screenshot.png" width="800"/>