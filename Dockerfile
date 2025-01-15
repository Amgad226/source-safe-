# ! Important
# Since we rely in our code to environment variables for e.g. db connection
# this can only be run successfully with docker-compose file

# Specify node version and choose image
# also name our image as development (can be anything)
FROM node:16-alpine AS development

# Specify our working directory, this is in our container/in our image
WORKDIR /usr/src/app

# Copy the package.jsons from host to container
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Here we install all the deps
RUN npm install

# Bundle app source / copy all other files
COPY . .

# Build the app to the /dist folder

# Generate Prisma client
RUN npx prisma generate
# Run Prisma migrations
# RUN npx prisma migrate 

RUN npm run build
################
## PRODUCTION ##
################
# Build another image named production
FROM node:16-alpine AS production

# Set node env to prod
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set Working Directory
WORKDIR /usr/src/app

# Copy all from development stage
# COPY --from=development /usr/src/app/ .

COPY --from=development /usr/src/app/dist/ dist
COPY --from=development /usr/src/app/prisma/ prisma
COPY --from=development /usr/src/app/upload/ upload
COPY --from=development /usr/src/app/public/ public
COPY --from=development /usr/src/app/node_modules/ node_modules
COPY --from=development /usr/src/app/package.json package.json

EXPOSE 8080

# Run app
CMD [ "node", "dist/main" ]

# Example Commands to build and run the dockerfile
# docker build -t usr-nest .
# docker run usr-nest