FROM node
COPY server /server/
COPY client/build /client/build/

ENV PORT 8080
ENV couchdb.url http://couchdb:5984
ENV couchdb.bucket monitool
ENV couchdb.host couchdb
ENV couchdb.sessionBucket monitool-sessions
ENV oauth.resource https://graph.windows.net

ENTRYPOINT ["node", "/server/app.js"]

EXPOSE 8080

