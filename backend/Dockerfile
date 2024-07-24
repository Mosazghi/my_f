# syntax=docker/dockerfile:1

ARG RUST_VERSION=1.79.0
ARG APP_NAME=backend

FROM rust:${RUST_VERSION}-alpine AS build
ARG APP_NAME
WORKDIR /app

# Install host build dependencies.
RUN apk add --no-cache clang lld musl-dev git openssl-dev build-base

# Copy source code and build the application.
COPY . .

# Leverage a cache mount to /app/target/
# for compiled dependencies which will speed up subsequent builds.
RUN --mount=type=cache,target=/app/target/ \
  --mount=type=cache,target=/usr/local/cargo/git/db \
  --mount=type=cache,target=/usr/local/cargo/registry/ \
  cargo build --locked --release && \
  cp ./target/release/$APP_NAME /bin/server

FROM alpine:3.18 AS final

ARG UID=10001
RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  --uid "${UID}" \
  appuser
USER appuser

COPY --from=build /bin/server /bin/
COPY --from=build /app/migrations /app/migrations

EXPOSE 3000

CMD ["/bin/server"]
