## Example use FP to handle MQTT request

An `processor` process the request using 

    const resolve = R.cond([
        [ CONDITION, EXECUTER ]
    ]);
    
The **CONDITION** should return `true` or `false` indicating if **EXECUTER** should be execute or not.

The **EXECUTER** should return a valid MQTT package to be publish or undefined/false if nothing to be do.

    const publishIfConditionalResolved = R.pipe(
      resolve,
      R.when(R.identity, publish),
    );
    
### CONDITION

To validate the request we recommend ...
 
     function CONDITION(pack) {
         return /^myReq$/.test(pack.topic)
     }
     
> Tip: use [JSON Schema][json-schema] to validate the payload

### EXECUTER

Should return a valid package..

    function EXECUTER(pack) {
        pack.payload = new Buffer.from(JSON.stringify({hello:'word'}))
        return pack 
    }

 
## Get Starter

 - `npm install`
 - `npm start`

[json-schema]: https://spacetelescope.github.io/understanding-json-schema/
    
