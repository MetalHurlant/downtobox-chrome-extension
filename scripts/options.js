let storage = chrome.storage.sync;

/////////////////////////
// Storage functions  //
////////////////////////
function setStorageDefaultSeries() { // Useful for debugging
    storage.set({
        "series" : {
            "DragonBall" : {
                "image": 'image',
                "links": 'links',
                "names": 'names'
            }
        }
    });
}
function printStorage(){ // Useful for debugging
    storage.get(function(items) {
        console.log(items);
    });
}
function setStorageSerie(name, serie){
    storage.get("series", function(items) {
        items['series'][name] = serie;
        storage.set({"series" : items['series']})
    });
}
function setStorageSeries(series){
    storage.set({"series" : series});
}
function getStorageSerie(name, callback){
    storage.get("series", function(items) {
        callback(items['series'][name])
    });
}
function getStorageSeries(callback){
    storage.get("series", function(items) {
        callback(items['series'])
    });
}
/////////////////////////
//   Popup functions  //
////////////////////////
function wantToReplace(name) {
    return confirm("You already stored a serie called " + name + ". You're going to replace it.");
}
function wantToRemove(name) {
    return confirm("Are you sure you want to remove " + name + "?");
}
////////////////////////////
//   Document functions  //
//////////////////////////
function getCurrentSerieName() {
    return $('#text_serie_name').val();
}
function getCurrentSerieOldName() {
    return $('#serie_modal_title').text();
}
function getCurrentSerie() {
    let image = $('#text_serie_image_url').val();
    let links = $('#text_serie_links').val();
    let names = $('#text_serie_titles').val();
    return {
        "image": image,
        "links": links,
        "names": names
    };
}
////////////////////////////
//     User functions    //
//////////////////////////
function addSerie() {
    let name = getCurrentSerieName();
    // Test if it already exists
    getStorageSerie(name, function(items) {
        if (items === undefined || wantToReplace(name)) {
            let serie = getCurrentSerie();
            setStorageSerie(name, serie);
            $('#serie_modal').modal('hide');
        }
    });
}
function editSerie() {
    let name = getCurrentSerieName();
    let oldName = getCurrentSerieOldName();
    if (name !== oldName) {
        getStorageSerie(name, function(items) {
            if (items === undefined || wantToReplace(name)) {
                removeSerie(false);
                addSerie();
            }
        });
    } else {
        addSerie();
    }
}
function removeSerie(needConfirmation=true) {
    let name = getCurrentSerieOldName();
    if (!needConfirmation || wantToRemove(name)){
        getStorageSeries(function (items) {
            delete items[name];
            setStorageSeries(items);
        });
        $('#serie_modal').modal('hide');
    }
}
////////////////////////////
//     View functions    //
//////////////////////////
function displaySeries() {
    $('#serie_list_block').empty();
    getStorageSeries(function (items) {
        let keys = Object.keys(items);
        for (let i = 0; i < keys.length; i++) {
            let item = items[keys[i]];
            let block = serieBlock(keys[i], item);
            // Add it to the list:
            $('#serie_list_block').append(block);
        }
    });
}
function showLines() {
    $(".lined").linedtextarea({});
}
function setModalForAdd() {
    $('#serie_form').get(0).reset();
    document.getElementById("serie_modal_title").innerText = "Add Serie";
    document.getElementById("text_serie_links").innerText = '';
    document.getElementById("text_serie_titles").innerText = '';
    $("#add_serie").show();
    $("#remove_serie").hide();
    $("#edit_serie").hide();
}
function setModalForEdit(name, serie) {
    $('#serie_form').get(0).reset();
    document.getElementById("serie_modal_title").innerText = name;
    document.getElementById("text_serie_links").innerText = serie['links'];
    document.getElementById("text_serie_titles").innerText = serie['names'];
    $("#text_serie_name").val(name);
    $("#text_serie_image_url").val(serie['image']);
    $("#add_serie").hide();
    $("#remove_serie").show();
    $("#edit_serie").show();
}
////////////////////////////
//  Component functions  //
//////////////////////////
function serieBlock(name, serie) {
    let blockDiv = document.createElement('div');
    blockDiv.setAttribute('class', 'item');
    blockDiv.setAttribute('name', name);
    let blockImageContainer = document.createElement('div');
    blockImageContainer.setAttribute('class', 'block_image_container');
    blockDiv.appendChild(blockImageContainer);
    let blockImage = document.createElement('img');
    blockImage.setAttribute('src', serie['image']);
    blockImage.onerror = function () {
        this.src='/images/noimage.jpg';
    };
    blockImage.setAttribute('alt', 'jacket');
    blockImage.setAttribute('class', 'img_item');
    blockImageContainer.appendChild(blockImage);
    let infoDiv = document.createElement('div');
    infoDiv.setAttribute('class', 'info');
    blockDiv.appendChild(infoDiv);
    let blockTitle = document.createElement('h3');
    blockTitle.setAttribute('class', 'item_block_title');
    blockTitle.innerHTML = name;
    blockDiv.appendChild(blockTitle);
    blockDiv.setAttribute('data-toggle','modal');
    blockDiv.setAttribute('data-target', '#serie_modal');
    blockDiv.onclick = function (){
        setModalForEdit(this.getAttribute('name'), serie);
    };
    return blockDiv;
}
/////////////////////////////////
//  Initialization functions  //
///////////////////////////////
function initializeEvents() {
    // Buttons
    $('#add_serie').on('click', addSerie);
    $('#edit_serie').on('click', editSerie);
    $('#remove_serie').on('click', removeSerie);
    $('#button_get_lines').on('click', showLines);
    $('#button_modal_add_serie').on('click', setModalForAdd);
    chrome.storage.onChanged.addListener(displaySeries);
}
function initModal(){
    showLines();
    $('#serie_modal').hide();
}
/////////////////////////
//  onLoad execution  //
///////////////////////
$(function () {
    initializeEvents();
    displaySeries();
    initModal();
});

