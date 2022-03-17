FROM node:14.17.4

# Install pm2 globally
RUN npm install pm2 -g

# Copy package.json into /app folder
COPY package.json /app/package.json

# Go to /app and install NPM packages
RUN cd /app && npm install

# Set working directory to lib folder
WORKDIR /app/lib

# Copy lib folder to /app folder
COPY lib /app/lib

EXPOSE 4000
CMD [ "pm2-runtime", "pm2.yaml" ]