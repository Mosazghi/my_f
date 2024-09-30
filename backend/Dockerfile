FROM rust:1.79-buster AS builder

WORKDIR /app

COPY . . 

RUN cargo build --release 

FROM debian:buster-slim AS final

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install --yes \
  libcurl4 \
  && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /usr/local/bin

COPY --from=builder /app/target/release/backend .

EXPOSE 8080

CMD ["./backend"]
