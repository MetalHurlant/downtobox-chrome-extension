let storage = chrome.storage.local;

/////////////////////////
// Storage functions  //
////////////////////////
function setStorageDefaultSeries() { // Useful for debugging
    storage.set({
        "series" : {
            "DragonBall" : {
                "image": 'http://www.asahicom.jp/ajw/articles/images/AS20180126004170_comm.jpg',
                "links": 'https://uptobox.com/mdjtrwppg9dz',
                "names": 'Le grand départ (Bulma et Son Gokû)'
            }
        }
    });
}
function printStorage(){ // Useful for debugging
    storage.get(function(items) {
        console.log(items);
    });
}
function setStorageSerie(name, serie) {
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
    return $('#series_modal_title').text();
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
    getStorageSerie(name, function(items) {
        if (items === undefined || wantToReplace(name)) {
            let serie = getCurrentSerie();
            setStorageSerie(name, serie);
            $('#series_modal').modal('hide');
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
        $('#series_modal').modal('hide');
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
function setModalSeriesForAdd() {
    $('#serie_form').get(0).reset();
    document.getElementById("series_modal_title").innerText = "Add Serie";
    document.getElementById("text_serie_links").innerText = '';
    document.getElementById("text_serie_titles").innerText = '';
    $("#add_serie").show();
    $("#remove_serie").hide();
    $("#edit_serie").hide();
}
function setModalSeriesForEditd(name, serie) {
    $('#serie_form').get(0).reset();
    document.getElementById("series_modal_title").innerText = name;
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
    blockDiv.setAttribute('data-toggle','modal');
    blockDiv.setAttribute('data-target', '#series_modal');
    blockDiv.onclick = function (){
        setModalSeriesForEditd(this.getAttribute('name'), serie);
    };
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
    let dl_botton = document.createElement('input');
    dl_botton.setAttribute('type', 'button');
    dl_botton.setAttribute('value', 'DOWNLOAD');
    dl_botton.setAttribute('class', 'btn btn-success dl_button');
    dl_botton.onclick = function(e){
        e.stopPropagation();
        downloadEpisodes(name);
    };
    blockDiv.appendChild(dl_botton);
    return blockDiv;
}
/////////////////////////////////
//  Initialization functions  //
///////////////////////////////
function initializeEventsSeries() {
    $('#add_serie').on('click', addSerie);
    $('#edit_serie').on('click', editSerie);
    $('#remove_serie').on('click', removeSerie);
    $('#button_get_lines').on('click', showLines);
    $('#button_modal_add_serie').on('click', setModalSeriesForAdd);
    chrome.storage.onChanged.addListener(displaySeries);
}
function initModalSeries(){
    showLines();
    $('#series_modal').hide();
}
/////////////////////////
//  onLoad execution  //
///////////////////////
$(function () {
    initializeEventsSeries();
    displaySeries();
    initModalSeries();
});

///////////////////////////////
//    Download functions    //
/////////////////////////////
function padToThree(number) {
    if (number<=999) { number = ("00"+number).slice(-3); }
    return number;
}

function downloadEpisode(serieName, episodeName, episodeLink, episodeNumber) {
    let request = new XMLHttpRequest();
    request.open('GET', episodeLink, false);
    request.send();
    let response = request.responseText;
    let link = response.split('" class=\'big-button-green-flat')[0].split('<a href="').slice(-1)[0];
    let fileExtension = link.split('.').slice(-1)[0];
    let fileName = serieName + '.' + padToThree(episodeNumber) + '.' + episodeName + '.' + fileExtension;
    chrome.downloads.search({query: [fileName], state: "complete"}, function (results) {
        if (results.length === 0) {
            chrome.downloads.download({ url: link, filename: serieName+ '/' +fileName});
        }
    });
}

function downloadEpisodes(serieName) {
    getStorageSerie(serieName, function(serie) {
        let links = serie['links'].split('\n');
        let names = serie['names'].split('\n');
        if (links.length !== names.length){
            alert("There is not the same number of links and names :\n"
                + links.length + " links for " + names.length + " names");
        }
        let downloader = new Downloader(serieName, links, names);
        downloader.startDownload();
        chrome.downloads.onChanged.addListener(function(downloadDelta){
            // 'NETWORK_FAILED'
            if(downloadDelta.error.current === 'NETWORK_FAILED'){
                chrome.downloads.search({id: downloadDelta.id}, function(result) {
                    downloadItem = result[0];

                });
            }
            downloader.startDownload();
        });
    });
}

class Downloader {
    constructor(serieName, links, names, nbEpisodes) {
        this.serieName = serieName;
        this.links = links;
        this.names = names;
        this.nbEpisodes = nbEpisodes;
        this.cpt = 0;
        this.maxDl = 1;
    }

    startDownload() {
        let self = this;
        chrome.downloads.search({state: "in_progress"}, function(results) {
            let isAvailableSlots = ((self.maxDl - results.length) >= 0);
            if (isAvailableSlots) {
                let serieName = self.serieName;
                let episodeName = self.names[self.cpt];
                let episodeLink = self.links[self.cpt];
                let episodeNumber = self.cpt + 1;
                downloadEpisode(serieName, episodeName, episodeLink, episodeNumber);
                self.cpt++;
            }
        });
        if(self.cpt !== self.nbEpisodes) {
            setTimeout(this.startDownload, 1000);
        }
    }
}