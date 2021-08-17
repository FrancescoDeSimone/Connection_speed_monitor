From node
WORKDIR /speed_monitor
COPY . .
RUN npm i 
EXPOSE 3000
CMD node index.js
