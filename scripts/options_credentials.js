/////////////////////////
// Storage functions  //
///////////////////////
function setStorageDefaultCredentials() { // Useful for debugging
    storage.set({
        "credentials" : {
            "uptobox" : {
                "username": '',
                "password": ''
            }
        }
    });
}
function setStorageCredential(website, credentials) {
    storage.get("credentials", function(items) {
        items['credentials'][website] = credentials;
        storage.set({"credentials" : items['credentials']})
    });
}
function setStorageCredentials(credentials){
    storage.set({"credentials" : credentials});
}
function getStorageCredential(website, callback){
    storage.get("credentials", function(items) {
        callback(items['credentials'][website])
    });
}
function getStorageCredentials(callback){
    storage.get("credentials", function(items) {
        callback(items['credentials'])
    });
}
/////////////////////////
//   Popup functions  //
////////////////////////
function wantToReplaceCredentials(website) {
    return confirm("You already stored credentials for " + website + ". You're going to replace it.");
}
function wantToRemoveCredentials(website) {
    return confirm("Are you sure you want to remove your credentials for " + website + "?");
}
////////////////////////////
//   Document functions  //
//////////////////////////
function getCurrentCredentials() {
    let username = $('#text_username').val();
    let password = $('#text_pwd').val();
    return {
        "username": username,
        "password": password
    };
}
function displayCredentials() {
    getStorageCredential('uptobox', function (items) {
        let credentials = items;
        $('#text_username').val(credentials['username']);
        $('#text_pwd').val(credentials['password']);
    });
}
////////////////////////////
//     User functions    //
//////////////////////////
function editCredentials(){
    let credentials = getCurrentCredentials();
    if (wantToReplaceCredentials('uptobox')){
        setStorageCredential('uptobox', credentials);
    }
}
/////////////////////////////////
//  Initialization functions  //
///////////////////////////////
function initializeEventsCredentials() {
    $('#edit_credentials').on('click', editCredentials);
}
/////////////////////////
//  onLoad execution  //
///////////////////////
$(function () {
    initializeEventsCredentials();
    displayCredentials();
});