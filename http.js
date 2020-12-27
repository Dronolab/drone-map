/*
    Created by Emile Normand

    Note:
    Cookies are sent by the interop server with no SameSite values, which mean they default to 'lax' on most browser. This 
    means the cookie cannot be received by this website unless the default behavior of the browser is changed.
    
*/

var HttpClient = function() {

    this.login = function(credentials,aUrl,aCallback){
        var anHttpRequest = new XMLHttpRequest();
        var completeUrl = aUrl.concat('/api/login')
        anHttpRequest.withCredentials = true;
        
        anHttpRequest.onreadystatechange = function(oEvent) { 
            if (anHttpRequest.readyState === 4) {
                if (anHttpRequest.status === 200) {
                    console.log(anHttpRequest.responseText);
                    aCallback(anHttpRequest.responseText);
                } else {
                     console.log("Error", anHttpRequest.statusText);
                }
            }
        }
        
        anHttpRequest.open( "POST", completeUrl, true );
        anHttpRequest.send(JSON.stringify(credentials));
    }

    this.getTeams = function(aCallback){
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200){
                    aCallback(anHttpRequest.responseText);
            }
            else{
                aCallback(anHttpRequest.status);
            }
        }
        anHttpRequest.open( "GET", 'http://192.168.0.135:8000/api/teams', true );            
        anHttpRequest.send( null );
    }

    this.getMission = function(aUrl,aCallback){
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.withCredentials = true;
        var completeUrl = aUrl.concat('/api/missions/1')
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState === 4) {
                if (anHttpRequest.status === 200) {
                    console.log(anHttpRequest.responseText);
                    aCallback(anHttpRequest.responseText);
                } else {
                     console.log("Error", anHttpRequest.statusText);
                }
            }
        }
        anHttpRequest.open( "GET", completeUrl, true );            
        anHttpRequest.send( null );
    }
}

