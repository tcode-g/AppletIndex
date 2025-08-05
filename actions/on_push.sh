cd /var/applet-frontend
git pull origin main
npm install
npm run build
DIST_DIR=/var/applet-frontend/dist
if [[ -d $DIST_DIR ]]; then
  rm -r /var/www/html/*
  mv $DIST_DIR/* /var/www/html/
fi