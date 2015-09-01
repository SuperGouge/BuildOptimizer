# BuildOptimizer

BuildOptimizer is a website that allows you to view recent matches informations of challenger players and export Item Sets based on their build for you to quickly try them out in-game!

[Go check it out!](http://buildoptimizer.azurewebsites.net/)

## Techs

### Back-end

* Node.js & ExpressJS 4.x
* Azure App Services
* Azure Redis Cache Preview

### Front-end

* AngularJS
* Bootstrap (with AngularUI Bootstrap)
* LESS

### Workflow

* Gulp
* Nodemon
* BrowserSync

## Details

The Express app exposes a set of Riot API endpoints via an interface API to be used client-side (AngularJS in our case).
The pattern used makes it fairly easy to implement new interface endpoints.

Every Riot API request is cached in Redis with a default but overridable TTL. This is the first step to improve responsivity and avoid rate limits. To avoid data duplication, the request URLs are also canonicalized.

Rate limiters can also be used with values depending on your API key type. Finally, the last safeguard to the rate limitting is simply to retry the request based on the ``Retry-After`` header.

Aggregated data can also be cached if needed (in our ``/api/pro/:championId`` endpoint for example) to further improve response times.

Batch requests (retrieve top players' match lists in our case) are made asyncronously, in parallel (thanks to the ``async`` node module) and periodically to ensure data is always available and up-to-date.

## Future Enhancements

This entire project was built with flexibility and evolutivity in mind. The RiotApi helper class and most of the code are easily reusable by anyone.
This also allows for a much better infrastructure onto which new features can easily be built.

To provide even better results, one of the main planned enhancements is to improve the match selection algorithm.
An Item Set editor would also help the user fine-tune the ones provided.

## Installation (for developers)

* [Install Node.js](https://docs.npmjs.com/getting-started/installing-node)
* Override the values in ``./config/config.js``, create a ``./config/secret.js``, and require the sensible authentication configurations from there
* Run ``npm install``
* ????
* PROFIT!!!

You should see gulp being run and the website should open in your default browser.