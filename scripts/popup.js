document.addEventListener('DOMContentLoaded', function() {

  // listens to the click of the button into the popup content
  document.getElementById('episodeButton').addEventListener('click', function() {

    // sends a message throw the communication port
    var episodeText = document.getElementById('episodeText').value;
    document.getElementById('testy').innerText = episodeText;

    chrome.downloads.download({ url: episodeText});

  })
});