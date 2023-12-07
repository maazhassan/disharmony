FROM node:lts-alpine
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 5173
RUN chown -R node /app
USER node
CMD ["npm", "start"]
