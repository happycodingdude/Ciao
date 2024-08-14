FROM mongo:latest

# RUN --mount=type=secret,id=MONGO_INITDB_ROOT_USERNAME \
#     --mount=type=secret,id=MONGO_INITDB_ROOT_PASSWORD \
#     /bin/sh -c echo "$(cat /run/secrets/MONGO_INITDB_ROOT_USERNAME) | $(cat /run/secrets/MONGO_INITDB_ROOT_USERNAME)" > /output.txt

RUN --mount=type=secret,id=MONGO_INITDB_ROOT_USERNAME \
    --mount=type=secret,id=MONGO_INITDB_ROOT_PASSWORD \
    /bin/sh -c 'echo "$(cat /run/secrets/MONGO_INITDB_ROOT_USERNAME) | $(cat /run/secrets/MONGO_INITDB_ROOT_PASSWORD)" > /output.txt'

# CMD ["sh", "-c", "cat /output.txt && tail -f /dev/null"]
CMD ["cat", "/output.txt"]
#ENTRYPOINT ["echo", "$(/run/secrets/MONGO_INITDB_ROOT_USERNAME)"]