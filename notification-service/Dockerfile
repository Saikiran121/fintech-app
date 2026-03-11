FROM ruby:3.2-slim

WORKDIR /app

RUN apt-get update -qq && apt-get install -y build-essential

COPY Gemfile ./
RUN bundle install

COPY app.rb ./
COPY config.ru ./

EXPOSE 8084

CMD ["rackup", "--host", "0.0.0.0", "-p", "8084", "-E", "production"]
