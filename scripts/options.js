// $(function() {
//     $(".lined").linedtextarea({});
// });

let storage = chrome.storage.sync;

function isEmptyObject(obj) {
    return (Object.entries(obj).length === 0 && obj.constructor === Object);
}

function wantToReplace(name) {
    return confirm("You already stored a serie called " + name + ". You're going to replace it.");
}
function wantToRemove(name) {
    return confirm("Are you sure you want to remove " + name + "?");
}

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

function addSerie() {
    let name = getCurrentSerieName();
    // Test if it already exists
    storage.get(""+name, function(items) {
        if (isEmptyObject(items) || wantToReplace(name)) {
            storage.set({[name] : serie});
            displaySerie();
            $('#serie_modal').modal('hide');
        }
    });
}

function editSerie() {
    let name = getCurrentSerieName();
    let oldName = getCurrentSerieOldName();
    let serie = getCurrentSerie();
    // Test if it already exists
    if (name !== oldName) {
        storage.get(""+name, function(items) {
            if (isEmptyObject(items) || wantToReplace(name)) {
                storage.set({[name] : serie});
                storage.remove(oldName);
                displaySerie();
                $('#serie_modal').modal('hide');
            }
        });
    } else {
        addSerie();
    }
}

function removeSerie() {
    let name = getCurrentSerieOldName();
    if (wantToRemove(name)){
        storage.remove(name);
        $('#serie_modal').modal('hide');
        displaySerie();
    }
}

function displaySerie() {
    $('#serie_list_block').empty();
    storage.get(function (items) {
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
    let showLinesButton = document.getElementById("button_get_lines");
    showLinesButton.parentNode.removeChild(showLinesButton);
}

function resetModal() {
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

function initializeEvents() {
    // Buttons
    $('#add_serie').on('click', addSerie);
    $('#edit_serie').on('click', editSerie);
    $('#remove_serie').on('click', removeSerie);
    $('#button_get_lines').on('click', showLines);
    $('#button_modal_add_serie').on('click', resetModal);
}


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

$(function () {
    initializeEvents();
    displaySerie();
});

