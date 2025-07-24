FROM postgres:16

# Set the locale
RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8

# Create PostgreSQL config directory
RUN mkdir -p /etc/postgresql

# Add custom PostgreSQL configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Create initialization scripts directory
RUN mkdir -p /docker-entrypoint-initdb.d

# Copy initialization scripts
COPY ./init-scripts/ /docker-entrypoint-initdb.d/

# Set correct permissions for initialization scripts
RUN chmod +x /docker-entrypoint-initdb.d/*.sh

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=ctem_webapp_dev

# Expose the PostgreSQL port
EXPOSE 5432

# Set the default command
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"] 