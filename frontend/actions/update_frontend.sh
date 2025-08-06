cd /var/applet-index/frontend
npm install
npm run build
DIST_DIR=dist
if [[ -d $DIST_DIR ]]; then
  rm -r /var/www/html/*
  mv $DIST_DIR/* /var/www/html/
fi