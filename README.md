![Icon](https://github.com/Durss/enigmatester/blob/master/public/favicon.png)
# Enigma tester
Simple app to test a multi-user enigma idea for a physical secret box.
It's really unintuitive if i i'm not here to explain how it works but you can play it here anyways, you need to be 3 people :

http://enigma.durss.fr/

(it's only in french for now)

## Project setup
```
npm install
```

### Run server with live reload
```
npm run server/watch
```

### Run front with live reload
```
npm run front/watch
```

### Build project
```
npm run build
```

### Run as a service
Install PM2 globally, then :
```
pm2 start bootstrap-pm2.json
```
