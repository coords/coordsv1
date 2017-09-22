# coords
Easily chat with people near you and maintain chat rooms with friends centred around a common location!

# Installation:

* Install Node.js / NPM as per instructions: https://nodejs.org/en/download/package-manager/
* Install MongoDB as per instructions: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/
* Install Certbot and use in standalone mode to generate a LetsEncrypt SSL certificate for the subdomain you're running on, e.g. v1.coords.uk: https://certbot.eff.org/#debianjessie-other
* Check out this repository in the location you wish to run from: `git clone <repo URL>`
* Install [PM2](http://pm2.keymetrics.io/) globally: `sudo npm install -g pm2`
* Start the application / Node.js server using PM2: `pm2 start bin/www`
* Monitor logs for access/errors: `pm2 logs`
* Access site at https://v1.coords.uk:12345
* You may then wish to set up a reverse proxy listening on port 443 elsewhere (e.g. coords.uk) with it's own SSL cert, forwarding to port 12345
