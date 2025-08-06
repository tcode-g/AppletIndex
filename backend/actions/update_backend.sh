cd /var/applet-index/backend
npm install
pm2 restart applet-index-backend || pm2 start server.js --name applet-index-backend