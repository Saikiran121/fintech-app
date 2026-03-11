FROM golang:1.21-alpine

WORKDIR /app

COPY go.mod ./
# Since there are no dependencies in go.sum, we don't copy it.
COPY *.go ./

RUN go build -o user-service .

EXPOSE 8081

CMD [ "./user-service" ]
